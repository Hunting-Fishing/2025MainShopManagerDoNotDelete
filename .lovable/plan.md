

# Enhance Septic Employee System: Full Profile + Accountability Tracking

## What We're Building

Expand the employee detail page and settings to provide complete employee management with accountability tracking — showing every service order, invoice, quote, and customer interaction tied to each employee.

## Current State

- Employee list exists with add dialog (name, phone, email, hire date, roles)
- Employee detail has 4 tabs: Info, Roles, Certifications, History (completions only)
- `septic_service_orders` has `assigned_driver_id` and `created_by` columns
- `septic_invoices` has `