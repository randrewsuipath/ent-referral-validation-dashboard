import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tasks } from '@uipath/uipath-typescript/tasks';
import type { TaskGetResponse } from '@uipath/uipath-typescript/tasks';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/sonner';
interface ReferralData {
  patientName: string;
  referringPhysician: string;
  priority: 'High' | 'Medium' | 'Low';
  submissionDate: string;
}
export function HomePage() {
  const navigate = useNavigate();
  const { sdk, isAuthenticated, isInitializing } = useAuth();
  const tasks = useMemo(() => sdk ? new Tasks(sdk) : null, [sdk]);
  const [referrals, setReferrals] = useState<TaskGetResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    if (!isAuthenticated || !tasks) return;
    const loadReferrals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await tasks.getAll({
          filter: "Status ne 'Completed' and ExternalTag eq 'ent-referral'",
          pageSize: 50,
        });
        setReferrals(result.items);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load referrals';
        console.error('Error loading referrals:', err);
        setError(message);
        toast.error('Error', { description: message });
      } finally {
        setIsLoading(false);
      }
    };
    loadReferrals();
  }, [isAuthenticated, tasks]);
  const parseReferralData = (task: TaskGetResponse): ReferralData | null => {
    try {
      if (typeof task.data === 'object' && task.data !== null) {
        return task.data as ReferralData;
      }
      return null;
    } catch (err) {
      console.warn('Failed to parse referral data:', err);
      return null;
    }
  };
  const filteredReferrals = useMemo(() => {
    if (!searchTerm.trim()) return referrals;
    const term = searchTerm.toLowerCase();
    return referrals.filter(task => {
      const data = parseReferralData(task);
      return (
        task.title.toLowerCase().includes(term) ||
        data?.patientName?.toLowerCase().includes(term) ||
        data?.referringPhysician?.toLowerCase().includes(term)
      );
    });
  }, [referrals, searchTerm]);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  if (isInitializing) {
    return (
      <AppLayout container>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }
  if (!isAuthenticated) {
    return (
      <AppLayout container>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
          <p className="text-gray-600">Please log in to view referrals</p>
        </div>
      </AppLayout>
    );
  }
  return (
    <AppLayout container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">ENT Referral Validation</h1>
            <p className="text-sm text-gray-500 mt-1">Review and approve pending referrals</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{filteredReferrals.length}</span>
            <span>pending referrals</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by patient name or physician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-gray-300"
            />
          </div>
        </div>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error loading referrals</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No pending referrals</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try adjusting your search' : 'All referrals have been processed'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referral ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referring Physician
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReferrals.map((task) => {
                    const data = parseReferralData(task);
                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/validate/${task.id}`)}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                          #{task.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {data?.patientName || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {data?.referringPhysician || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {data?.submissionDate ? new Date(data.submissionDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(data?.priority || 'Low')}`}>
                            {data?.priority || 'Low'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/validate/${task.id}`);
                            }}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}