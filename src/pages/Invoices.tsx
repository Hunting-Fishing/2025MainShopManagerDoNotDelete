
import React, { useState, useEffect } from "react";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { Helmet } from "react-helmet-async";

export default function Invoices() {
  return (
    <>
      <Helmet>
        <title>Invoices | Auto Shop Management</title>
        <meta name="description" content="Manage and view all invoices" />
      </Helmet>
      <InvoiceList />
    </>
  );
}
