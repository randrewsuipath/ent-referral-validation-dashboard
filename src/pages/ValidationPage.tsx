import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tasks } from '@uipath/uipath-typescript/tasks';
import { TaskType } from '@uipath/uipath-typescript/tasks';
import type { TaskGetResponse } from '@uipath/uipath-typescript/tasks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, CheckCircle, XCircle, User, FileText, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/sonner';
interface ReferralDetails {
  patientName: string;
  patientDOB: string;
  patientMRN: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceStatus: string;
  referringPhysician: string;
  referringPhysicianNPI: string;
  diagnosisCodes: string[];
  clinicalNotes: string;
  medicalNecessity: string;
  referralFormUrl: string;
  submissionDate: string;
  priority: string;
}
export function ValidationPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { sdk, isAuthenticated } = useAuth();
  const tasks = useMemo(() => sdk ? new Tasks(sdk) : null, [sdk]);
  const [task, setTask] = useState<TaskGetResponse | null>(null);
  const [referralData, setReferralData] = useState<ReferralDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'deny'>('approve');
  const [comment, setComment] = useState('');
  useEffect(() => {
    if (!isAuthenticated || !tasks || !taskId) return;
    const loadTask = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const taskData = await tasks.getById(Number(taskId));
        setTask(taskData);
        if (typeof taskData.data === 'object' && taskData.data !== null) {
          setReferralData(taskData.data as ReferralDetails);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load referral';
        console.error('Error loading task:', err);
        setError(message);
        toast.error('Error', { description: message });
      } finally {
        setIsLoading(false);
      }
    };
    loadTask();
  }, [isAuthenticated, tasks, taskId]);
  const handleAction = (type: 'approve' | 'deny') => {
    setActionType(type);
    setShowActionDialog(true);
  };
  const submitAction = async () => {
    if (!task) return;
    try {
      setIsSubmitting(true);
      const action = actionType === 'approve' ? 'Approve' : 'Deny';
      if (task.type === TaskType.External) {
        await task.complete({
          type: TaskType.External,
          action,
        });
      } else {
        await task.complete({
          type: task.type as TaskType.Form | TaskType.App,
          action,
          data: { comment: comment.trim() || undefined },
        });
      }
      toast.success(`Referral ${action}d`, {
        description: `The referral has been ${action.toLowerCase()}d successfully.`,
      });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit decision';
      console.error('Error submitting action:', err);
      toast.error('Error', { description: message });
    } finally {
      setIsSubmitting(false);
      setShowActionDialog(false);
    }
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }
  if (error || !task || !referralData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="text-gray-700 font-medium">{error || 'Referral not found'}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Queue
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Referral #{task.id}</h1>
              <p className="text-sm text-gray-500">{referralData.patientName}</p>
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="space-y-4 overflow-y-auto">
              <Card className="p-4 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Patient Information</h2>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <dt className="text-xs text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900 font-medium">{referralData.patientName}</dd>
                  <dt className="text-xs text-gray-500">Date of Birth</dt>
                  <dd className="text-sm text-gray-700">{new Date(referralData.patientDOB).toLocaleDateString()}</dd>
                  <dt className="text-xs text-gray-500">MRN</dt>
                  <dd className="text-sm text-gray-700 font-mono">{referralData.patientMRN}</dd>
                </dl>
              </Card>
              <Card className="p-4 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Insurance Information</h2>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <dt className="text-xs text-gray-500">Provider</dt>
                  <dd className="text-sm text-gray-900 font-medium">{referralData.insuranceProvider}</dd>
                  <dt className="text-xs text-gray-500">Policy Number</dt>
                  <dd className="text-sm text-gray-700 font-mono">{referralData.insurancePolicyNumber}</dd>
                  <dt className="text-xs text-gray-500">Status</dt>
                  <dd className="text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      referralData.insuranceStatus === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {referralData.insuranceStatus}
                    </span>
                  </dd>
                </dl>
              </Card>
              <Card className="p-4 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Referring Physician</h2>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <dt className="text-xs text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900 font-medium">{referralData.referringPhysician}</dd>
                  <dt className="text-xs text-gray-500">NPI</dt>
                  <dd className="text-sm text-gray-700 font-mono">{referralData.referringPhysicianNPI}</dd>
                </dl>
              </Card>
              <Card className="p-4 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Clinical Information</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Diagnosis Codes</p>
                    <div className="flex flex-wrap gap-2">
                      {referralData.diagnosisCodes.map((code, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-mono">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Clinical Notes</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                      {referralData.clinicalNotes}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Medical Necessity</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                      {referralData.medicalNecessity}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Submission Details</h2>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <dt className="text-xs text-gray-500">Submitted</dt>
                  <dd className="text-sm text-gray-700">{new Date(referralData.submissionDate).toLocaleString()}</dd>
                  <dt className="text-xs text-gray-500">Priority</dt>
                  <dd className="text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      referralData.priority === 'High' ? 'bg-red-100 text-red-700' :
                      referralData.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {referralData.priority}
                    </span>
                  </dd>
                </dl>
              </Card>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <h2 className="text-base font-semibold text-gray-900">Referral Form</h2>
              </div>
              <div className="h-[calc(100%-3rem)]">
                {referralData.referralFormUrl ? (
                  <iframe
                    src={referralData.referralFormUrl}
                    className="w-full h-full border-0"
                    title="Referral Form"
                    sandbox="allow-same-origin allow-scripts"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No form document available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleAction('deny')}
            disabled={isSubmitting}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Deny Referral
          </Button>
          <Button
            size="lg"
            onClick={() => handleAction('approve')}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Referral
          </Button>
        </div>
      </div>
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Deny'} Referral
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to {actionType} this referral?
              {actionType === 'deny' && ' This action will reject the referral request.'}
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Comment (optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Add a comment about your ${actionType === 'approve' ? 'approval' : 'denial'}...`}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActionDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAction}
              disabled={isSubmitting}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Confirm ${actionType === 'approve' ? 'Approval' : 'Denial'}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster richColors closeButton />
    </div>
  );
}