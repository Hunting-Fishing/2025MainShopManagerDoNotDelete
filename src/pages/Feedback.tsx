
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FeedbackFormsList } from '@/components/feedback/FeedbackFormsList';
import { FeedbackFormEditor } from '@/components/feedback/FeedbackFormEditor';
import { FeedbackAnalytics } from '@/components/feedback/FeedbackAnalytics';

export default function Feedback() {
  return (
    <div className="p-6">
      <Routes>
        <Route index element={<FeedbackFormsList />} />
        <Route path="forms" element={<FeedbackFormsList />} />
        <Route path="forms/new" element={<FeedbackFormEditor />} />
        <Route path="forms/:id/edit" element={<FeedbackFormEditor />} />
        <Route path="forms/:id/analytics" element={<FeedbackAnalytics />} />
        <Route path="*" element={<Navigate to="/feedback/forms" replace />} />
      </Routes>
    </div>
  );
}
