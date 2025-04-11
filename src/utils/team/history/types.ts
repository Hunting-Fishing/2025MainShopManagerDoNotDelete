
/**
 * Team member history record type definition
 */
export interface TeamMemberHistoryRecord {
  id: string;
  profile_id: string;
  action_type: string;
  action_by: string;
  action_by_name?: string;
  timestamp: string;
  details: any;
}

/**
 * Data required to create a team member history record
 */
export interface RecordTeamMemberHistoryData {
  profile_id: string;
  action_type: string;
  action_by: string;
  action_by_name?: string;
  details: any;
}
