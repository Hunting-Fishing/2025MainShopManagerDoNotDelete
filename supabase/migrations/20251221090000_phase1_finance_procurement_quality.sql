-- Phase 1: Finance core, procurement, and quality management

-- Accounts payable: vendor bills and payments
CREATE TABLE IF NOT EXISTS public.vendor_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  bill_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'approved', 'paid', 'overdue', 'void')),
  bill_date DATE NOT NULL,
  due_date DATE,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, bill_number)
);

CREATE TABLE IF NOT EXISTS public.vendor_bill_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES public.vendor_bills(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  account_id UUID REFERENCES public.chart_of_accounts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  bill_id UUID REFERENCES public.vendor_bills(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  reference TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Accounts receivable: customer invoices and payments
CREATE TABLE IF NOT EXISTS public.ar_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'overdue', 'void')),
  issue_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.ar_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.ar_invoices(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  reference TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Banking and reconciliation
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT,
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'credit_card', 'cash')),
  account_number_last4 TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  opening_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  direction TEXT NOT NULL CHECK (direction IN ('debit', 'credit')),
  category TEXT,
  matched_journal_entry_id UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bank_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  statement_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  reconciled_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('open', 'reconciled', 'closed')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Procurement: RFQs and receiving
CREATE TABLE IF NOT EXISTS public.rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'received', 'closed')),
  needed_by DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rfq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  uom TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.rfq_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('submitted', 'accepted', 'rejected')),
  response_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  receipt_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('received', 'partial', 'reconciled')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, receipt_number)
);

CREATE TABLE IF NOT EXISTS public.receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  purchase_order_item_id UUID REFERENCES public.purchase_order_items(id) ON DELETE SET NULL,
  quantity_received NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity_accepted NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity_rejected NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT
);

-- Quality: checklists, nonconformance, CAPA
CREATE TABLE IF NOT EXISTS public.quality_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  checklist_id UUID REFERENCES public.quality_checklists(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'passed', 'failed', 'needs_rework')),
  performed_by UUID REFERENCES public.profiles(id),
  performed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nonconformances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  related_work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES public.profiles(id),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.capa_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  nonconformance_id UUID REFERENCES public.nonconformances(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('corrective', 'preventive')),
  owner_id UUID REFERENCES public.profiles(id),
  due_date DATE,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.vendor_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_bill_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nonconformances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capa_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vendor bills in their shop"
  ON public.vendor_bills FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage vendor bills in their shop"
  ON public.vendor_bills FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view vendor bill lines"
  ON public.vendor_bill_lines FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.vendor_bills vb
      WHERE vb.id = vendor_bill_lines.bill_id
      AND vb.shop_id = public.get_current_user_shop_id()
    )
  );
CREATE POLICY "Users can manage vendor bill lines"
  ON public.vendor_bill_lines FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.vendor_bills vb
      WHERE vb.id = vendor_bill_lines.bill_id
      AND vb.shop_id = public.get_current_user_shop_id()
    )
  );

CREATE POLICY "Users can view vendor payments in their shop"
  ON public.vendor_payments FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage vendor payments in their shop"
  ON public.vendor_payments FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view AR invoices in their shop"
  ON public.ar_invoices FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage AR invoices in their shop"
  ON public.ar_invoices FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view AR payments in their shop"
  ON public.ar_payments FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage AR payments in their shop"
  ON public.ar_payments FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view bank accounts in their shop"
  ON public.bank_accounts FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage bank accounts in their shop"
  ON public.bank_accounts FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view bank transactions in their shop"
  ON public.bank_transactions FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage bank transactions in their shop"
  ON public.bank_transactions FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view bank reconciliations in their shop"
  ON public.bank_reconciliations FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage bank reconciliations in their shop"
  ON public.bank_reconciliations FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view rfqs in their shop"
  ON public.rfqs FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage rfqs in their shop"
  ON public.rfqs FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view rfq items"
  ON public.rfq_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rfqs r
      WHERE r.id = rfq_items.rfq_id
      AND r.shop_id = public.get_current_user_shop_id()
    )
  );
CREATE POLICY "Users can manage rfq items"
  ON public.rfq_items FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.rfqs r
      WHERE r.id = rfq_items.rfq_id
      AND r.shop_id = public.get_current_user_shop_id()
    )
  );

CREATE POLICY "Users can view rfq responses"
  ON public.rfq_responses FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rfqs r
      WHERE r.id = rfq_responses.rfq_id
      AND r.shop_id = public.get_current_user_shop_id()
    )
  );
CREATE POLICY "Users can manage rfq responses"
  ON public.rfq_responses FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.rfqs r
      WHERE r.id = rfq_responses.rfq_id
      AND r.shop_id = public.get_current_user_shop_id()
    )
  );

CREATE POLICY "Users can view receipts in their shop"
  ON public.receipts FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage receipts in their shop"
  ON public.receipts FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view receipt lines"
  ON public.receipt_lines FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id = receipt_lines.receipt_id
      AND r.shop_id = public.get_current_user_shop_id()
    )
  );
CREATE POLICY "Users can manage receipt lines"
  ON public.receipt_lines FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id = receipt_lines.receipt_id
      AND r.shop_id = public.get_current_user_shop_id()
    )
  );

CREATE POLICY "Users can view quality checklists in their shop"
  ON public.quality_checklists FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage quality checklists in their shop"
  ON public.quality_checklists FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view quality checks in their shop"
  ON public.quality_checks FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage quality checks in their shop"
  ON public.quality_checks FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view nonconformances in their shop"
  ON public.nonconformances FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage nonconformances in their shop"
  ON public.nonconformances FOR ALL USING (shop_id = public.get_current_user_shop_id());

CREATE POLICY "Users can view capa actions in their shop"
  ON public.capa_actions FOR SELECT USING (shop_id = public.get_current_user_shop_id());
CREATE POLICY "Users can manage capa actions in their shop"
  ON public.capa_actions FOR ALL USING (shop_id = public.get_current_user_shop_id());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_bills_shop ON public.vendor_bills(shop_id);
CREATE INDEX IF NOT EXISTS idx_vendor_bills_status ON public.vendor_bills(status);
CREATE INDEX IF NOT EXISTS idx_vendor_bills_due ON public.vendor_bills(due_date);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_shop ON public.vendor_payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_ar_invoices_shop ON public.ar_invoices(shop_id);
CREATE INDEX IF NOT EXISTS idx_ar_invoices_status ON public.ar_invoices(status);
CREATE INDEX IF NOT EXISTS idx_ar_payments_shop ON public.ar_payments(shop_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_shop ON public.bank_accounts(shop_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON public.bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_reconciliations_account ON public.bank_reconciliations(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_shop ON public.rfqs(shop_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_rfq ON public.rfq_responses(rfq_id);
CREATE INDEX IF NOT EXISTS idx_receipts_shop ON public.receipts(shop_id);
CREATE INDEX IF NOT EXISTS idx_quality_checklists_shop ON public.quality_checklists(shop_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_shop ON public.quality_checks(shop_id);
CREATE INDEX IF NOT EXISTS idx_nonconformances_shop ON public.nonconformances(shop_id);
CREATE INDEX IF NOT EXISTS idx_capa_actions_shop ON public.capa_actions(shop_id);

-- Updated_at triggers
CREATE TRIGGER update_vendor_bills_updated_at
  BEFORE UPDATE ON public.vendor_bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ar_invoices_updated_at
  BEFORE UPDATE ON public.ar_invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_reconciliations_updated_at
  BEFORE UPDATE ON public.bank_reconciliations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON public.rfqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quality_checklists_updated_at
  BEFORE UPDATE ON public.quality_checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nonconformances_updated_at
  BEFORE UPDATE ON public.nonconformances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capa_actions_updated_at
  BEFORE UPDATE ON public.capa_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
