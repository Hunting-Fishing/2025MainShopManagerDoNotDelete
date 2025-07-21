
import React, { useState } from 'react';
import { Search, MessageSquare, Calendar, Bug, BookOpen, BarChart3, Settings, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactSupportModal } from '@/components/help/ContactSupportModal';
import { ScheduleDemoModal } from '@/components/help/ScheduleDemoModal';
import { FeatureRequestModal } from '@/components/help/FeatureRequestModal';
import { HelpSearchEngine } from '@/components/help/HelpSearchEngine';
import { HelpContentLibrary } from '@/components/help/HelpContentLibrary';
import { HelpAnalytics } from '@/components/help/HelpAnalytics';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant: 'default' | 'outline';
}

const Help: React.FC = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isFeatureRequestModalOpen, setIsFeatureRequestModalOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'contact',
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: <MessageSquare className="h-5 w-5" />,
      action: () => setIsContactModalOpen(true),
      variant: 'default'
    },
    {
      id: 'demo',
      title: 'Schedule Demo',
      description: 'Book a personalized walkthrough',
      icon: <Calendar className="h-5 w-5" />,
      action: () => setIsScheduleModalOpen(true),
      variant: 'outline'
    },
    {
      id: 'feature',
      title: 'Request Feature',
      description: 'Suggest new functionality',
      icon: <Bug className="h-5 w-5" />,
      action: () => setIsFeatureRequestModalOpen(true),
      variant: 'outline'
    }
  ];

  const systemStatus = {
    status: 'operational',
    uptime: '99.9%',
    responseTime: '120ms',
    lastUpdate: '2 minutes ago'
  };

  const handleSearchResult = (result: any) => {
    console.log('Selected help article:', result);
    // Handle navigation to specific help article
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Help Center</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers, tutorials, and get support for your business management needs
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {quickActions.map((action) => (
            <Card key={action.id} className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {action.icon}
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </div>
                  </div>
                  <Button variant={action.variant} onClick={action.action}>
                    Get Started
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* System Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded-full" />
                <span className="text-sm">All Systems Operational</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Uptime: </span>
                <span className="font-medium">{systemStatus.uptime}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Response Time: </span>
                <span className="font-medium">{systemStatus.responseTime}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Last Update: </span>
                <span className="font-medium">{systemStatus.lastUpdate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search Help Articles</CardTitle>
                <CardDescription>
                  Find tutorials, guides, and answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HelpSearchEngine onResultClick={handleSearchResult} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Help Content Library</CardTitle>
                <CardDescription>
                  Browse our comprehensive collection of tutorials, guides, and videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HelpContentLibrary />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Help Usage Analytics</CardTitle>
                <CardDescription>
                  Track help system usage and identify popular content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HelpAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Quick answers to the most common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      question: "How do I reset my password?",
                      answer: "You can reset your password by clicking the 'Forgot Password' link on the login page and following the instructions sent to your email.",
                      category: "Account"
                    },
                    {
                      question: "How do I create a new work order?",
                      answer: "Navigate to the Work Orders section and click 'New Work Order'. Fill in the required information and click 'Save'.",
                      category: "Work Orders"
                    },
                    {
                      question: "Can I customize the dashboard?",
                      answer: "Yes, you can customize your dashboard by clicking the settings icon and selecting which widgets to display.",
                      category: "Dashboard"
                    },
                    {
                      question: "How do I add team members?",
                      answer: "Go to Settings > Team Management and click 'Add Team Member'. Enter their details and assign appropriate roles.",
                      category: "Team Management"
                    },
                    {
                      question: "What payment methods do you accept?",
                      answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers.",
                      category: "Billing"
                    }
                  ].map((faq, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{faq.question}</CardTitle>
                          <Badge variant="outline">{faq.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ContactSupportModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
      <ScheduleDemoModal 
        isOpen={isScheduleModalOpen} 
        onClose={() => setIsScheduleModalOpen(false)} 
      />
      <FeatureRequestModal 
        isOpen={isFeatureRequestModalOpen} 
        onClose={() => setIsFeatureRequestModalOpen(false)} 
      />
    </div>
  );
};

export default Help;
