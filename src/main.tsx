import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getAppBase } from '@uipath/uipath-typescript'
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/hooks/useAuth';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { ValidationPage } from '@/pages/ValidationPage'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter basename={getAppBase()}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/validate/:taskId" element={<ValidationPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)