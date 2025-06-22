
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ServiceManagementPage } from './developer/ServiceManagementPage';

export default function DeveloperPortal() {
  return (
    <>
      <Helmet>
        <title>Developer Portal | AutoShop Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
          <p className="text-muted-foreground">
            Advanced tools and system management
          </p>
        </div>
        
        <Routes>
          <Route path="/" element={<Navigate to="service-management" replace />} />
          <Route path="/service-management/*" element={<ServiceManagementPage />} />
        </Routes>
      </div>
    </>
  );
}
