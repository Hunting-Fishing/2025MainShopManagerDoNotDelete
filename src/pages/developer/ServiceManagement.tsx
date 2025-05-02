
import React from 'react';
import { Container } from "semantic-ui-react";
import ServiceHierarchyManager from '@/components/developer/service-management/ServiceHierarchyManager';

export default function ServiceManagement() {
  return (
    <Container fluid>
      <ServiceHierarchyManager />
    </Container>
  );
}
