import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileSearch, Search, AlertTriangle, ExternalLink, Calendar, Car } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SAMPLE_TSBS = [
  {
    id: 'TSB-2024-001',
    title: 'Engine Stalling at Idle',
    affected: '2020-2022 Honda Accord 2.0T',
    date: '2024-01-15',
    severity: 'high',
  },
  {
    id: 'TSB-2024-002',
    title: 'Transmission Harsh Shifting',
    affected: '2019-2021 Ford F-150',
    date: '2024-01-10',
    severity: 'medium',
  },
  {
    id: 'TSB-2023-089',
    title: 'Infotainment System Freezing',
    affected: '2021-2023 Toyota Camry',
    date: '2023-12-20',
    severity: 'low',
  },
];

const SAMPLE_RECALLS = [
  {
    id: 'NHTSA-24V-001',
    title: 'Airbag Inflator Rupture',
    affected: '2018-2020 BMW 3-Series',
    date: '2024-01-05',
    remedy: 'Replace airbag inflator',
  },
  {
    id: 'NHTSA-23V-892',
    title: 'Fuel Pump Failure',
    affected: '2019-2021 Chevrolet Silverado',
    date: '2023-12-15',
    remedy: 'Replace fuel pump module',
  },
];

export default function AutomotiveRecalls() {
  const [vinSearch, setVinSearch] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTSBs = SAMPLE_TSBS.filter(tsb => 
    tsb.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tsb.affected.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tsb.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecalls = SAMPLE_RECALLS.filter(recall => 
    recall.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recall.affected.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recall.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileSearch className="h-8 w-8 text-primary" />
            TSB & Recalls
          </h1>
          <p className="text-muted-foreground mt-1">
            Technical Service Bulletins and Safety Recalls
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>VIN Lookup</CardTitle>
          <CardDescription>Check for recalls and TSBs by vehicle VIN</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            placeholder="Enter 17-character VIN..."
            value={vinSearch}
            onChange={(e) => setVinSearch(e.target.value.toUpperCase())}
            className="font-mono"
            maxLength={17}
          />
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Check VIN
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="recalls" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="recalls">Recalls</TabsTrigger>
            <TabsTrigger value="tsb">Technical Bulletins</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="recalls" className="space-y-4">
          {filteredRecalls.map((recall) => (
            <Card key={recall.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Safety Recall
                      </Badge>
                      <Badge variant="outline">{recall.id}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{recall.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        {recall.affected}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {recall.date}
                      </span>
                    </div>
                    <p className="text-sm">
                      <strong>Remedy:</strong> {recall.remedy}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      NHTSA Details
                    </Button>
                    <Button size="sm">Create Work Order</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="tsb" className="space-y-4">
          {filteredTSBs.map((tsb) => (
            <Card key={tsb.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(tsb.severity) as any}>
                        {tsb.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{tsb.id}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{tsb.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        {tsb.affected}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {tsb.date}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm">Create Work Order</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold">Data Source Information</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Recall data is sourced from NHTSA (National Highway Traffic Safety Administration). 
                TSB data is compiled from manufacturer sources. Always verify with official sources 
                before performing recall or TSB-related repairs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
