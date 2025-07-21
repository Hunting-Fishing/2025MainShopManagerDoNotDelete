import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactSupportModal } from '@/components/help/ContactSupportModal';
import { ScheduleDemoModal } from '@/components/help/ScheduleDemoModal';
import { FeatureRequestModal } from '@/components/help/FeatureRequestModal';
import { 
  Search, 
  MessageCircle, 
  Calendar, 
  Users, 
  Lightbulb, 
  Book, 
  Video, 
  FileText, 
  ExternalLink,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);

  const quickActions = [
    {
      icon: MessageCircle,
      title: 'Contact Support',
      description: 'Get help from our support team',
      color: 'bg-blue-500',
      action: () => setContactModalOpen(true)
    },
    {
      icon: Calendar,
      title: 'Schedule Demo',
      description: 'Book a personalized demo',
      color: 'bg-green-500',
      action: () => setDemoModalOpen(true)
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Connect with other users',
      color: 'bg-purple-500',
      action: () => window.open('https://community.example.com', '_blank')
    },
    {
      icon: Lightbulb,
      title: 'Feature Request',
      description: 'Suggest new features',
      color: 'bg-orange-500',
      action: () => setFeatureModalOpen(true)
    }
  ];

  const faqData = [
    {
      question: "How do I get started?",
      answer: "Welcome! Start by setting up your profile and exploring our dashboard. Our quick start guide will walk you through the essentials."
    },
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your inbox."
    },
    {
      question: "Can I export my data?",
      answer: "Yes, you can export your data in various formats including CSV, PDF, and Excel from the Reports section."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team through the Contact Support button above, or email us at support@example.com."
    }
  ];

  const tutorials = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of our platform",
      duration: "5 min",
      difficulty: "Beginner",
      icon: Book
    },
    {
      title: "Advanced Features",
      description: "Master advanced functionality",
      duration: "15 min",
      difficulty: "Advanced",
      icon: Zap
    },
    {
      title: "Best Practices",
      description: "Tips for optimal usage",
      duration: "10 min",
      difficulty: "Intermediate",
      icon: Star
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      value: "support@example.com",
      description: "We typically respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Phone Support",
      value: "+1 (555) 123-4567",
      description: "Available Mon-Fri, 9AM-6PM EST"
    },
    {
      icon: Clock,
      title: "Live Chat",
      value: "Available 24/7",
      description: "Instant help when you need it"
    }
  ];

  const filteredFAQ = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to your questions, learn new features, and get the support you need
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
              onClick={action.action}
            >
              <CardContent className="p-6 text-center">
                <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
                <ArrowRight className="h-4 w-4 text-gray-400 mx-auto mt-2 group-hover:translate-x-1 transition-transform duration-200" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFAQ.map((faq, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                  {filteredFAQ.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No FAQ items found matching your search.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutorials.map((tutorial, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <tutorial.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <Badge variant="secondary">{tutorial.difficulty}</Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
                    <p className="text-gray-600 mb-4">{tutorial.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {tutorial.duration}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contactInfo.map((contact, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <contact.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{contact.title}</h3>
                    <p className="text-blue-600 font-medium mb-2">{contact.value}</p>
                    <p className="text-sm text-gray-600">{contact.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  System Status
                </CardTitle>
                <CardDescription>
                  All systems are operational
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>API Services</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Web Interface</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email Service</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ContactSupportModal 
        isOpen={contactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
      />
      <ScheduleDemoModal 
        isOpen={demoModalOpen} 
        onClose={() => setDemoModalOpen(false)} 
      />
      <FeatureRequestModal 
        isOpen={featureModalOpen} 
        onClose={() => setFeatureModalOpen(false)} 
      />
    </div>
  );
}
