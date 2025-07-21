
import React from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Book, MessageCircle, Phone } from 'lucide-react';

export default function Help() {
  usePageTitle('Help & Support');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help and find answers to your questions
          </p>
        </div>
        <Button>
          <MessageCircle className="mr-2 h-4 w-4" />
          Contact Support
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Browse our comprehensive documentation and user guides
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              FAQ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Find answers to frequently asked questions
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Get in touch with our support team for assistance
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Common Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Getting Started</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Setting up your account</li>
                <li>• Adding your first customer</li>
                <li>• Creating work orders</li>
                <li>• Managing inventory</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Advanced Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Custom reports</li>
                <li>• API integration</li>
                <li>• Team management</li>
                <li>• Payment processing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
