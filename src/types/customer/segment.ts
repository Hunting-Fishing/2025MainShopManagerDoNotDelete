
export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerSegmentRule {
  id: string;
  segment_id: string;
  rule_type: string;
  rule_operator: string;
  rule_value: string;
}
