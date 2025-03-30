
import React, { useState, useEffect } from 'react';
import { FeedbackForm as FeedbackFormType, FeedbackQuestion, QuestionType } from '@/types/feedback';
import { getFeedbackFormWithQuestions, submitFeedbackResponse } from '@/services/feedbackService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackFormProps {
  formId: string;
  customerId: string;
  workOrderId?: string;
  onComplete?: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  formId,
  customerId,
  workOrderId,
  onComplete
}) => {
  const [form, setForm] = useState<FeedbackFormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [overallRating, setOverallRating] = useState<number | null>(null);
  const [npsScore, setNpsScore] = useState<number | null>(null);

  useEffect(() => {
    const loadForm = async () => {
      setLoading(true);
      const formData = await getFeedbackFormWithQuestions(formId);
      if (formData) {
        setForm(formData);
        
        // Initialize answers object with empty values for all questions
        const initialAnswers: Record<string, any> = {};
        formData.questions?.forEach(q => {
          if (q.question_type === 'multiple_choice') {
            initialAnswers[q.id] = null;
          } else if (q.question_type === 'yes_no') {
            initialAnswers[q.id] = null;
          } else if (q.question_type === 'rating') {
            initialAnswers[q.id] = null;
          } else if (q.question_type === 'nps') {
            initialAnswers[q.id] = null;
          } else {
            initialAnswers[q.id] = '';
          }
        });
        setAnswers(initialAnswers);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load the feedback form. Please try again.',
          variant: 'destructive',
        });
      }
      setLoading(false);
    };
    
    loadForm();
  }, [formId]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Detect if this is an NPS question and update the npsScore
    if (form?.questions) {
      const question = form.questions.find(q => q.id === questionId);
      if (question?.question_type === 'nps') {
        setNpsScore(value);
      }
      // If this is a rating question, use it for overall rating
      if (question?.question_type === 'rating') {
        setOverallRating(value);
      }
    }
  };

  const handleSubmit = async () => {
    // Validate required questions
    const requiredQuestions = form?.questions?.filter(q => q.is_required) || [];
    const unansweredQuestions = requiredQuestions.filter(q => {
      const answer = answers[q.id];
      return answer === null || answer === undefined || answer === '';
    });
    
    if (unansweredQuestions.length > 0) {
      toast({
        title: 'Please answer all required questions',
        description: 'Some required questions have not been answered',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await submitFeedbackResponse({
        form_id: formId,
        customer_id: customerId,
        work_order_id: workOrderId,
        overall_rating: overallRating,
        nps_score: npsScore,
        response_data: answers,
      });
      
      setSubmitted(true);
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been submitted successfully',
        variant: 'success',
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Loading feedback form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Form not found or unavailable</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6 flex flex-col items-center justify-center p-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-center">Thank You!</h2>
          <p className="text-center text-gray-600 mt-2">
            Your feedback has been submitted successfully. We appreciate your input.
          </p>
          
          {onComplete && (
            <Button 
              onClick={onComplete} 
              className="mt-6"
              variant="outline"
            >
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const renderQuestion = (question: FeedbackQuestion) => {
    switch (question.question_type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={question.id}>{question.question} {question.is_required && <span className="text-red-500">*</span>}</Label>
            <Textarea
              id={question.id}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Your answer"
              rows={3}
            />
          </div>
        );
        
      case 'rating':
        return (
          <div className="space-y-4">
            <Label>{question.question} {question.is_required && <span className="text-red-500">*</span>}</Label>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full max-w-xs">
                <span className="text-sm text-gray-500">Poor</span>
                <span className="text-sm text-gray-500">Excellent</span>
              </div>
              <div className="flex items-center justify-between w-full max-w-xs mb-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={answers[question.id] === value ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    onClick={() => handleAnswerChange(question.id, value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <div className="flex items-center space-x-1 text-yellow-400">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star
                    key={value}
                    className={`h-5 w-5 ${answers[question.id] >= value ? 'fill-current' : 'stroke-current fill-none'}`}
                    onClick={() => handleAnswerChange(question.id, value)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            <Label>{question.question} {question.is_required && <span className="text-red-500">*</span>}</Label>
            <RadioGroup
              value={answers[question.id] || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              className="space-y-1"
            >
              {question.options?.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-option-${i}`} />
                  <Label htmlFor={`${question.id}-option-${i}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
        
      case 'yes_no':
        return (
          <div className="space-y-2">
            <Label>{question.question} {question.is_required && <span className="text-red-500">*</span>}</Label>
            <div className="flex items-center space-x-4">
              <Button
                type="button"
                variant={answers[question.id] === true ? "default" : "outline"}
                size="sm"
                className={answers[question.id] === true ? "bg-green-500 hover:bg-green-600" : ""}
                onClick={() => handleAnswerChange(question.id, true)}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Yes
              </Button>
              <Button
                type="button"
                variant={answers[question.id] === false ? "default" : "outline"}
                size="sm"
                className={answers[question.id] === false ? "bg-red-500 hover:bg-red-600" : ""}
                onClick={() => handleAnswerChange(question.id, false)}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                No
              </Button>
            </div>
          </div>
        );
        
      case 'nps':
        return (
          <div className="space-y-4">
            <Label>{question.question} {question.is_required && <span className="text-red-500">*</span>}</Label>
            <div className="w-full px-2">
              <div className="flex justify-between mb-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={answers[question.id] === value ? "default" : "outline"}
                    size="sm"
                    className={`w-8 h-8 p-0 ${
                      answers[question.id] === value
                        ? value >= 9
                          ? "bg-green-500 hover:bg-green-600"
                          : value >= 7
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-red-500 hover:bg-red-600"
                        : ""
                    }`}
                    onClick={() => handleAnswerChange(question.id, value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>Not at all likely</span>
                <span>Extremely likely</span>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{form.title}</CardTitle>
        {form.description && (
          <CardDescription>{form.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {form.questions?.sort((a, b) => a.display_order - b.display_order).map(question => (
          <div key={question.id} className="py-2">
            {renderQuestion(question)}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardFooter>
    </Card>
  );
};
