import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { 
  Program, 
  Volunteer, 
  ProgramParticipant, 
  VolunteerAssignment, 
  ImpactMeasurementData,
  CreateProgramData,
  CreateVolunteerData,
  CreateParticipantData,
  CreateVolunteerAssignmentData,
  CreateImpactMeasurementData
} from '@/types/nonprofit';

type DbProgram = Database['public']['Tables']['programs']['Row'];
type DbVolunteer = Database['public']['Tables']['volunteers']['Row'];
type DbProgramParticipant = Database['public']['Tables']['program_participants']['Row'];
type DbVolunteerAssignment = Database['public']['Tables']['volunteer_assignments']['Row'];
type DbImpactMeasurement = Database['public']['Tables']['impact_measurement_data']['Row'];

// Transform functions to handle type conversions
const transformProgram = (dbProgram: DbProgram): Program => ({
  ...dbProgram,
  program_type: dbProgram.program_type as Program['program_type'],
  status: dbProgram.status as Program['status'],
  funding_sources: dbProgram.funding_sources as string[],
  success_metrics: dbProgram.success_metrics as string[]
});

const transformVolunteer = (dbVolunteer: DbVolunteer): Volunteer => ({
  ...dbVolunteer,
  skills: dbVolunteer.skills as string[],
  availability: dbVolunteer.availability as Record<string, any>,
  background_check_status: dbVolunteer.background_check_status as Volunteer['background_check_status'],
  training_completed: dbVolunteer.training_completed as string[],
  status: dbVolunteer.status as Volunteer['status']
});

const transformParticipant = (dbParticipant: DbProgramParticipant): ProgramParticipant => ({
  ...dbParticipant,
  status: dbParticipant.status as ProgramParticipant['status'],
  outcome_data: dbParticipant.outcome_data as Record<string, any>,
  demographics: dbParticipant.demographics as Record<string, any>
});

const transformAssignment = (dbAssignment: DbVolunteerAssignment): VolunteerAssignment => ({
  ...dbAssignment,
  status: dbAssignment.status as VolunteerAssignment['status']
});

const transformImpactMeasurement = (dbMeasurement: DbImpactMeasurement): ImpactMeasurementData => ({
  ...dbMeasurement
});

// Program services
export const programService = {
  async getAll(): Promise<Program[]> {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(transformProgram);
  },

  async getById(id: string): Promise<Program | null> {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? transformProgram(data) : null;
  },

  async create(programData: CreateProgramData): Promise<Program> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.shop_id) throw new Error('Shop not found');

    const { data, error } = await supabase
      .from('programs')
      .insert({
        ...programData,
        shop_id: profile.shop_id,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformProgram(data);
  },

  async update(id: string, updates: Partial<CreateProgramData>): Promise<Program> {
    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformProgram(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getParticipants(programId: string): Promise<ProgramParticipant[]> {
    const { data, error } = await supabase
      .from('program_participants')
      .select('*')
      .eq('program_id', programId)
      .order('enrollment_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(transformParticipant);
  }
};

// Volunteer services
export const volunteerService = {
  async getAll(): Promise<Volunteer[]> {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(transformVolunteer);
  },

  async getById(id: string): Promise<Volunteer | null> {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? transformVolunteer(data) : null;
  },

  async create(volunteerData: CreateVolunteerData): Promise<Volunteer> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.shop_id) throw new Error('Shop not found');

    const { data, error } = await supabase
      .from('volunteers')
      .insert({
        ...volunteerData,
        shop_id: profile.shop_id,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformVolunteer(data);
  },

  async update(id: string, updates: Partial<CreateVolunteerData>): Promise<Volunteer> {
    const { data, error } = await supabase
      .from('volunteers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformVolunteer(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getAssignments(volunteerId: string): Promise<VolunteerAssignment[]> {
    const { data, error } = await supabase
      .from('volunteer_assignments')
      .select('*')
      .eq('volunteer_id', volunteerId)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(transformAssignment);
  }
};

// Program participant services
export const participantService = {
  async getAll(): Promise<ProgramParticipant[]> {
    const { data, error } = await supabase
      .from('program_participants')
      .select('*')
      .order('enrollment_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(transformParticipant);
  },

  async getById(id: string): Promise<ProgramParticipant | null> {
    const { data, error } = await supabase
      .from('program_participants')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? transformParticipant(data) : null;
  },

  async create(participantData: CreateParticipantData): Promise<ProgramParticipant> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.shop_id) throw new Error('Shop not found');

    const { data, error } = await supabase
      .from('program_participants')
      .insert({
        ...participantData,
        shop_id: profile.shop_id,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformParticipant(data);
  },

  async update(id: string, updates: Partial<CreateParticipantData>): Promise<ProgramParticipant> {
    const { data, error } = await supabase
      .from('program_participants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformParticipant(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('program_participants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Volunteer assignment services
export const assignmentService = {
  async getAll(): Promise<VolunteerAssignment[]> {
    const { data, error } = await supabase
      .from('volunteer_assignments')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(transformAssignment);
  },

  async create(assignmentData: CreateVolunteerAssignmentData): Promise<VolunteerAssignment> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.shop_id) throw new Error('Shop not found');

    const { data, error } = await supabase
      .from('volunteer_assignments')
      .insert({
        ...assignmentData,
        shop_id: profile.shop_id,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformAssignment(data);
  },

  async update(id: string, updates: Partial<CreateVolunteerAssignmentData>): Promise<VolunteerAssignment> {
    const { data, error } = await supabase
      .from('volunteer_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformAssignment(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('volunteer_assignments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Impact measurement services
export const impactMeasurementService = {
  async getAll(): Promise<ImpactMeasurementData[]> {
    const { data, error } = await supabase
      .from('impact_measurement_data')
      .select('*')
      .order('measurement_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(transformImpactMeasurement);
  },

  async create(measurementData: CreateImpactMeasurementData): Promise<ImpactMeasurementData> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.shop_id) throw new Error('Shop not found');

    const { data, error } = await supabase
      .from('impact_measurement_data')
      .insert({
        ...measurementData,
        shop_id: profile.shop_id,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformImpactMeasurement(data);
  },

  async getByMetric(metricId: string): Promise<ImpactMeasurementData[]> {
    const { data, error } = await supabase
      .from('impact_measurement_data')
      .select('*')
      .eq('metric_id', metricId)
      .order('measurement_date', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(transformImpactMeasurement);
  }
};