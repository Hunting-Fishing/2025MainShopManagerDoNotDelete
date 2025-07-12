import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  FileText, 
  ExternalLink,
  Search,
  Video,
  Users
} from 'lucide-react';

const helpSections = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using ServicePro',
    icon: Book,
    items: [
      'Quick Start Guide',
      'Setting Up Your Shop',
      'Creating Your First Work Order',
      'Managing Customers'
    ]
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step video guides',
    icon: Video,
    items: [
      'Dashboard Overview',
      'Inventory Management',
      'Work Order Workflow',
      'Reports and Analytics'
    ]
  },
  {
    title: 'Documentation',
    description: 'Detailed feature documentation',
    icon: FileText,
    items: [
      'User Manual',
      'API Documentation',
      'Integration Guides',
      'Best Practices'
    ]
  },
  {
    title: 'Community',
    description: 'Connect with other users',
    icon: Users,
    items: [
      'User Forum',
      'Feature Requests',
      'Success Stories',
      'Community Guidelines'
    ]
  }
];

export default function Help() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers to your questions and learn how to get the most out of ServicePro
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Help Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {helpSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Get in touch with our support team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Submit Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}