import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, FileText, Clock, MapPin, Video, Plus, Download } from 'lucide-react';

export const BoardMeetingTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Board Meetings</h2>
          <p className="text-muted-foreground">Manage board meetings, agendas, minutes, and compliance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Minutes
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Year</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold text-foreground">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Minutes</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-2xl font-bold text-foreground">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Meetings
          </CardTitle>
          <CardDescription>
            Scheduled board meetings and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Quarterly Board Meeting</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      May 15, 2024 • 6:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Main Conference Room
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Confirmed</Badge>
                <Button size="sm" variant="outline">
                  View Agenda
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Video className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Special Planning Session</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      May 22, 2024 • 7:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      Virtual Meeting
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Draft</Badge>
                <Button size="sm" variant="outline">
                  Send Invites
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Minutes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Meeting Minutes
          </CardTitle>
          <CardDescription>
            Minutes from recent board meetings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Q1 2024 Board Meeting</h4>
                <p className="text-sm text-muted-foreground">March 15, 2024 • 8 attendees • Quorum met</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">3 agenda items • 2 votes taken</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Approved</Badge>
                <Button size="sm" variant="outline">
                  View Minutes
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">February Planning Meeting</h4>
                <p className="text-sm text-muted-foreground">February 20, 2024 • 7 attendees • Quorum met</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">5 agenda items • 1 vote taken</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">Pending Approval</Badge>
                <Button size="sm" variant="outline">
                  Review Minutes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Board Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Board Members
          </CardTitle>
          <CardDescription>
            Current board composition and member information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">JD</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">John Doe</h4>
                  <p className="text-sm text-muted-foreground">Board Chair</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Term: 2022-2025</p>
                <p>Expertise: Financial Management</p>
                <p>Attendance: 95%</p>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium">SM</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Sarah Miller</h4>
                  <p className="text-sm text-muted-foreground">Vice Chair</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Term: 2023-2026</p>
                <p>Expertise: Legal Affairs</p>
                <p>Attendance: 89%</p>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-medium">RJ</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Robert Johnson</h4>
                  <p className="text-sm text-muted-foreground">Treasurer</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Term: 2021-2024</p>
                <p>Expertise: Accounting</p>
                <p>Attendance: 92%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};