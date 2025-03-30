
import { supabase } from "@/integrations/supabase/client";
import { FeedbackForm, FeedbackQuestion, FeedbackResponse, FeedbackAnalytics, QuestionType } from "@/types/feedback";
import { toast } from "@/hooks/use-toast";

// Fetch all feedback forms for a shop
export const getFeedbackForms = async (shopId: string): Promise<FeedbackForm[]> => {
  try {
    const { data, error } = await supabase
      .from('feedback_forms')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching feedback forms:', error);
    return [];
  }
};

// Fetch a specific feedback form with its questions
export const getFeedbackFormWithQuestions = async (formId: string): Promise<FeedbackForm | null> => {
  try {
    // Get the form
    const { data: formData, error: formError } = await supabase
      .from('feedback_forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (formError) throw formError;
    
    // Get the questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('feedback_questions')
      .select('*')
      .eq('form_id', formId)
      .order('display_order', { ascending: true });

    if (questionsError) throw questionsError;
    
    // Map questions to the correct type (casting question_type to QuestionType)
    const typedQuestions: FeedbackQuestion[] = questionsData?.map(q => ({
      ...q,
      question_type: q.question_type as QuestionType,
      options: q.options as string[] | null
    })) || [];
    
    return {
      ...formData,
      questions: typedQuestions
    };
  } catch (error) {
    console.error('Error fetching feedback form with questions:', error);
    return null;
  }
};

// Create a new feedback form
export const createFeedbackForm = async (form: Omit<FeedbackForm, 'id' | 'created_at' | 'updated_at'>): Promise<FeedbackForm | null> => {
  try {
    const { data, error } = await supabase
      .from('feedback_forms')
      .insert([form])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating feedback form:', error);
    toast({
      title: 'Error',
      description: 'Failed to create feedback form. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

// Update an existing feedback form
export const updateFeedbackForm = async (id: string, updates: Partial<FeedbackForm>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('feedback_forms')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating feedback form:', error);
    toast({
      title: 'Error',
      description: 'Failed to update feedback form. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Delete a feedback form
export const deleteFeedbackForm = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('feedback_forms')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting feedback form:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete feedback form. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Create feedback questions for a form
export const createFeedbackQuestions = async (questions: Omit<FeedbackQuestion, 'id' | 'created_at' | 'updated_at'>[]): Promise<FeedbackQuestion[] | null> => {
  try {
    const { data, error } = await supabase
      .from('feedback_questions')
      .insert(questions)
      .select();

    if (error) throw error;
    
    // Map questions to the correct type
    const typedQuestions: FeedbackQuestion[] = data?.map(q => ({
      ...q,
      question_type: q.question_type as QuestionType,
      options: q.options as string[] | null
    })) || [];
    
    return typedQuestions;
  } catch (error) {
    console.error('Error creating feedback questions:', error);
    toast({
      title: 'Error',
      description: 'Failed to create feedback questions. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

// Update feedback question
export const updateFeedbackQuestion = async (id: string, updates: Partial<FeedbackQuestion>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('feedback_questions')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating feedback question:', error);
    toast({
      title: 'Error',
      description: 'Failed to update feedback question. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Delete feedback question
export const deleteFeedbackQuestion = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('feedback_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting feedback question:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete feedback question. Please try again.',
      variant: 'destructive',
    });
    return false;
  }
};

// Submit feedback response
export const submitFeedbackResponse = async (response: Omit<FeedbackResponse, 'id' | 'submitted_at' | 'created_at'>): Promise<FeedbackResponse | null> => {
  try {
    const { data, error } = await supabase
      .from('feedback_responses')
      .insert([response])
      .select()
      .single();

    if (error) throw error;
    
    // Cast the response_data to Record<string, any>
    return {
      ...data,
      response_data: data.response_data as Record<string, any>
    };
  } catch (error) {
    console.error('Error submitting feedback response:', error);
    toast({
      title: 'Error',
      description: 'Failed to submit feedback. Please try again.',
      variant: 'destructive',
    });
    return null;
  }
};

// Get feedback responses for a specific form
export const getFeedbackResponses = async (formId: string): Promise<FeedbackResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    
    // Map the responses to cast response_data to Record<string, any>
    return (data || []).map(response => ({
      ...response,
      response_data: response.response_data as Record<string, any>
    }));
  } catch (error) {
    console.error('Error fetching feedback responses:', error);
    return [];
  }
};

// Get feedback responses for a specific customer
export const getCustomerFeedbackResponses = async (customerId: string): Promise<FeedbackResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('customer_id', customerId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    
    // Map the responses to cast response_data to Record<string, any>
    return (data || []).map(response => ({
      ...response,
      response_data: response.response_data as Record<string, any>
    }));
  } catch (error) {
    console.error('Error fetching customer feedback responses:', error);
    return [];
  }
};

// Get feedback responses for a specific work order
export const getWorkOrderFeedbackResponses = async (workOrderId: string): Promise<FeedbackResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    
    // Map the responses to cast response_data to Record<string, any>
    return (data || []).map(response => ({
      ...response,
      response_data: response.response_data as Record<string, any>
    }));
  } catch (error) {
    console.error('Error fetching work order feedback responses:', error);
    return [];
  }
};

// Calculate feedback analytics for a specific form
export const getFeedbackAnalytics = async (formId: string): Promise<FeedbackAnalytics | null> => {
  try {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .eq('form_id', formId);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        average_rating: 0,
        total_responses: 0,
        nps_score: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        response_rate: 0,
        feedback_by_category: {}
      };
    }

    // Calculate NPS scores
    let promoters = 0;
    let passives = 0;
    let detractors = 0;
    let totalRating = 0;
    let ratingCount = 0;

    data.forEach(response => {
      if (response.nps_score !== null && response.nps_score !== undefined) {
        if (response.nps_score >= 9) promoters++;
        else if (response.nps_score >= 7) passives++;
        else detractors++;
      }

      if (response.overall_rating !== null && response.overall_rating !== undefined) {
        totalRating += response.overall_rating;
        ratingCount++;
      }
    });

    // Calculate NPS score: (% Promoters - % Detractors) * 100
    const npsScore = data.length > 0 
      ? ((promoters / data.length) - (detractors / data.length)) * 100 
      : 0;

    // Calculate average rating
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    // Calculate feedback by category (you would need to define these categories based on your form structure)
    const feedbackByCategory: Record<string, number> = {};
    
    return {
      average_rating: averageRating,
      total_responses: data.length,
      nps_score: npsScore,
      promoters,
      passives,
      detractors,
      response_rate: 0, // This would require knowing how many people were asked for feedback
      feedback_by_category: feedbackByCategory
    };
  } catch (error) {
    console.error('Error calculating feedback analytics:', error);
    return null;
  }
};
