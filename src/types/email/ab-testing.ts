
export interface EmailABTest {
  enabled: boolean;
  variants: EmailABTestVariant[];
  winnerCriteria: 'open_rate' | 'click_rate';
  winnerSelectionDate: string | null;
  winnerId: string | null;
}

export interface EmailABTestVariant {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipientPercentage: number;
  recipients: number;
  opened: number;
  clicked: number;
  improvement?: number;
  metrics?: {
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    conversionRate?: number;
  };
}

export interface EmailABTestResult {
  testId: string;
  campaignId: string;
  variants: EmailABTestVariant[];
  winner: EmailABTestVariant | null;
  winnerSelectedAt: string | null;
  winnerCriteria: 'open_rate' | 'click_rate';
  isComplete: boolean;
  winningVariantId?: string;
  confidenceLevel?: number;
}
