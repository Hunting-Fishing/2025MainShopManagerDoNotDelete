import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Search, Lightbulb, Zap, TrendingUp } from 'lucide-react';

const AIHub = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI & Automation Hub</h1>
          <p className="text-muted-foreground">Intelligent tools to enhance your business operations</p>
        </div>
        <Badge variant="secondary" className="bg-gradient-primary text-white">
          <Brain className="w-4 h-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI Chat Assistant */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Smart Chat
            </CardTitle>
            <CardDescription>
              AI-powered customer support and assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Chat Session</Button>
          </CardContent>
        </Card>

        {/* Semantic Search */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              AI Search
            </CardTitle>
            <CardDescription>
              Natural language search across all your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Open Search</Button>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>
              AI-generated product and service suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Recommendations</Button>
          </CardContent>
        </Card>

        {/* Predictive Analytics */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Predictive Analytics
            </CardTitle>
            <CardDescription>
              Forecast demand, prices, and maintenance needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Analytics</Button>
          </CardContent>
        </Card>

        {/* Workflow Automation */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Automation
            </CardTitle>
            <CardDescription>
              Automate repetitive tasks and workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Manage Workflows</Button>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Business Insights
            </CardTitle>
            <CardDescription>
              AI-generated trends and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">View Insights</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent AI Activity</CardTitle>
          <CardDescription>Latest AI-powered actions and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">AI features are being configured. Please ensure OpenAI API key is set in project settings.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIHub;