import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSafetyDocuments } from '@/hooks/useSafetyDocuments';
import { SafetyDocumentUpload } from '@/components/safety/SafetyDocumentUpload';
import { FileText, Plus, Search, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SafetyDocuments() {
  const { loading, documents, searchSDS, getByType, getExpiringDocuments } = useSafetyDocuments();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sdsDocuments = getByType('sds');
  const policies = getByType('policy');
  const procedures = getByType('procedure');
  const expiringDocs = getExpiringDocuments(30);
  
  const filteredSDS = searchQuery ? searchSDS(searchQuery) : sdsDocuments;

  return (
    <>
      <Helmet>
        <title>Safety Documents | Safety</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Safety Document Library
            </h1>
            <p className="text-muted-foreground mt-1">SDS sheets, policies, procedures, and more</p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {expiringDocs.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                {expiringDocs.length} Documents Expiring Soon
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        <Tabs defaultValue="sds">
          <TabsList>
            <TabsTrigger value="sds">SDS Sheets ({sdsDocuments.length})</TabsTrigger>
            <TabsTrigger value="policies">Policies ({policies.length})</TabsTrigger>
            <TabsTrigger value="procedures">Procedures ({procedures.length})</TabsTrigger>
            <TabsTrigger value="all">All ({documents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="sds" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SDS by chemical name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : (
              <div className="grid gap-3">
                {filteredSDS.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.chemical_name} • {doc.manufacturer}
                        </p>
                        {doc.hazard_classification?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {doc.hazard_classification.map(h => (
                              <Badge key={h} variant="outline" className="text-xs">{h}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="policies">
            <div className="grid gap-3">
              {policies.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="procedures">
            <div className="grid gap-3">
              {procedures.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="grid gap-3">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SafetyDocumentUpload open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
