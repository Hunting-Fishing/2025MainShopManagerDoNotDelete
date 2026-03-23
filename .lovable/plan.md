

# Professional Septic Customer Details Page

## Overview

Transform the basic customer details page into a comprehensive, multi-tab professional CRM view with inline editing, full service history, financial tracking, environmental monitoring, and cost-saving recommendations.

## Database Changes

### New Tables

**`septic_customer_notes`** — Internal notes, employee suggestions, and customer requests
- `id`, `customer_id` (FK septic_customers), `shop_id` (FK shops), `note_type` (general / customer_request / employee_suggestion / recommendation), `title`, `content`, `priority` (low/medium/high/urgent), `status` (open/in_progress/resolved/dismissed), `created_by` (FK profiles), `assigned_to` (FK profiles, nullable), `estimated_cost` (numeric, nullable), `resolved_at`, `created_at`, `updated_at`

**`septic_environmental_records`** — Environmental concerns and compliance tracking
- `id`, `customer_id` (FK septic_customers), `shop_id` (FK shops), `record_type` (concern / violation / compliance_check / remediation), `severity` (low/medium/high/critical), `title`, `description`, `regulatory_body`, `citation_number`, `date_identified`, `date_resolved`, `remediation_plan`, `remediation_cost`, `status` (open/monitoring/resolved/escalated), `photos` (text[]), `created_by` (FK profiles), `created_at`, `updated_at`

**`septic_cost_recommendations`** — Cost-saving and system upgrade recommendations
- `id`, `customer_id` (FK septic_customers), `shop_id` (FK shops), `recommendation_type` (cost_saving / upgrade / maintenance_plan / system_replacement / environmental), `title`, `description`, `current_annual_cost` (numeric), `projected_annual_cost` (numeric), `estimated_savings` (numeric), `implementation_cost` (numeric), `payback_period_months` (integer), `priority`, `status` (proposed/accepted/in_progress/completed/declined), `accepted_at`, `completed_at`, `created_by` (FK profiles), `created_at`, `updated_at`

All tables get RLS policies using `get_current_user_shop_id()`.

### Columns Added to `septic_customers`

- `customer_type TEXT DEFAULT 'residential'` — residential / commercial / municipal
- `business_name TEXT`
- `business_contact TEXT`
- `preferred_payment_method TEXT`
- `payment_terms TEXT`
- `tax_exempt BOOLEAN DEFAULT false`
- `emergency_contact_name TEXT`
- `emergency_contact_phone TEXT`
- `county TEXT`
- `parcel_number TEXT`
- `well_distance_ft INTEGER`
- `water_source TEXT`
- `occupants INTEGER`
- `year_built INTEGER`

## UI Architecture

### File: `src/pages/septic/SepticCustomerDetails.tsx` (rewrite)

Multi-tab layout with editable header card:

```text
[Back] [Customer Name ✏️] [Residential/Commercial badge] [Active badge] [Edit | New Order]

┌─────────────────────────────────────────────────────────────┐
│ Overview │ Systems │ Service History │ Financial │ Notes │ Environmental │ Recommendations │
└─────────────────────────────────────────────────────────────┘
```

### Tab 1 — Overview
- **Contact Card**: Editable inline fields (name, phone, email, address with map link)
- **Property Info**: Customer type (residential/commercial/municipal), business name (if commercial), bedrooms, property size, occupants, year built, parcel number
- **System Summary**: Count of tanks, system types, last service date, next scheduled service
- **Quick Stats**: Total spent lifetime, open orders count, days since last service, compliance status
- **Emergency Contact**: Name and phone

### Tab 2 — Systems & Tanks
- Existing tanks list (enhanced with condition indicators)
- System type, install date, capacity, last pump date
- Property system details (well distance, water source)
- Link to inspections per tank

### Tab 3 — Service History
- All `septic_service_orders` for this customer (maintenance, installs, repairs)
- Filterable by service_type and date range
- Status badges, cost, assigned driver/tech
- Clickable rows navigate to order details

### Tab 4 — Financial
- **Payment Summary**: Total invoiced, total paid, outstanding balance
- **Invoice Table**: From `septic_invoices` — invoice date, due date, paid date, amount, status, payment method
- **Payment History**: From `septic_payments` — date, amount, method, reference
- Payment terms and preferred method (editable)
- **Cost Breakdown**: Pie chart — maintenance vs repairs vs installs vs inspections

### Tab 5 — Notes & Requests
- Tabbed sub-view: All / Customer Requests / Employee Suggestions / Recommendations
- Add note dialog with type selector, priority, optional cost estimate
- Assign to employee, track status (open → in_progress → resolved)
- Timeline view showing all notes chronologically

### Tab 6 — Environmental
- Environmental concerns log with severity indicators
- Compliance check history
- Active violations with remediation tracking
- Groundwater contamination flags (from inspections)
- Surface ponding, odor history
- Remediation costs and timeline
- Add new concern/record dialog

### Tab 7 — Recommendations
- Cost-saving analysis cards showing current vs projected costs
- System upgrade recommendations with ROI calculations
- Maintenance plan suggestions (e.g., "pumping every 2 years vs 3 saves $X")
- Environmental improvement recommendations
- Status tracking: proposed → accepted → completed
- Total potential savings summary at top

## New Component Files

| File | Purpose |
|---|---|
| `src/components/septic/customer-details/CustomerOverviewTab.tsx` | Editable contact/property info with quick stats |
| `src/components/septic/customer-details/CustomerSystemsTab.tsx` | Tanks and system details |
| `src/components/septic/customer-details/CustomerServiceHistoryTab.tsx` | Filterable service order list |
| `src/components/septic/customer-details/CustomerFinancialTab.tsx` | Invoices, payments, cost breakdown |
| `src/components/septic/customer-details/CustomerNotesTab.tsx` | Notes, requests, suggestions with add/edit |
| `src/components/septic/customer-details/CustomerEnvironmentalTab.tsx` | Environmental tracking and compliance |
| `src/components/septic/customer-details/CustomerRecommendationsTab.tsx` | Cost-saving and upgrade recommendations |
| `src/components/septic/customer-details/EditCustomerDialog.tsx` | Full edit dialog for all customer fields |
| `src/components/septic/customer-details/AddNoteDialog.tsx` | Dialog for adding notes/requests/suggestions |
| `src/components/septic/customer-details/AddEnvironmentalRecordDialog.tsx` | Dialog for environmental concerns |
| `src/components/septic/customer-details/AddRecommendationDialog.tsx` | Dialog for cost-saving recommendations |

## Edited Files

| File | Change |
|---|---|
| `src/pages/septic/SepticCustomerDetails.tsx` | Complete rewrite with tabs layout and data queries |

## Key Design Decisions

- All new tables use `septic_` prefix for full module isolation
- Customer type field enables residential vs commercial workflows
- Environmental tracking leverages existing inspection data (groundwater_contamination, surface_ponding, odor_present) plus new dedicated records
- Cost recommendations include ROI math (payback period) to help sell upgrades to customers
- Notes system doubles as internal CRM — employee suggestions create institutional knowledge

