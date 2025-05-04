
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, ExternalLink, CloudOff, Link as LinkIcon } from "lucide-react";
import { integrationService } from "@/services/settings/integrationService";
import { IntegrationSettings } from "@/types/settings";

interface IntegrationsTabProps {
  shopId?: string;
}

export function IntegrationsTab({ shopId }: IntegrationsTabProps) {
  const [activeTab, setActiveTab] = useState("payment");
  const [integrations, setIntegrations] = useState<IntegrationSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Integration types
  const integrationTypes = [
    { id: "payment", label: "Payment Gateways" },
    { id: "calendar", label: "Calendar Services" },
    { id: "sms", label: "SMS Providers" },
    { id: "analytics", label: "Analytics Tools" },
    { id: "crm", label: "CRM Systems" },
  ];

  useEffect(() => {
    async function loadIntegrations() {
      if (!shopId) return;
      
      try {
        setLoading(true);
        const data = await integrationService.getIntegrationSettings(shopId, activeTab);
        setIntegrations(data);
      } catch (error) {
        console.error("Failed to load integrations:", error);
        toast({
          title: "Error loading integrations",
          description: "Could not load integration settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadIntegrations();
  }, [shopId, activeTab, toast]);

  const handleToggleIntegration = async (id: string, isEnabled: boolean) => {
    if (!shopId) return;
    
    try {
      await integrationService.updateIntegrationSetting(id, { is_enabled: isEnabled });
      
      // Update local state
      setIntegrations(prevIntegrations => 
        prevIntegrations.map(integration => 
          integration.id === id 
            ? { ...integration, is_enabled: isEnabled } 
            : integration
        )
      );
      
      toast({
        title: isEnabled ? "Integration enabled" : "Integration disabled",
        description: `The integration has been ${isEnabled ? 'enabled' : 'disabled'} successfully.`,
      });
    } catch (error) {
      console.error("Failed to update integration:", error);
      toast({
        title: "Error updating integration",
        description: "Could not update integration status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            {integrationTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {integrationTypes.map((type) => (
            <TabsContent key={type.id} value={type.id} className="pt-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : integrations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 space-y-4">
                      <CloudOff className="mx-auto h-12 w-12 text-muted-foreground/60" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-medium">No Integrations Found</h3>
                        <p className="text-muted-foreground">
                          You haven't added any {type.label.toLowerCase()} integrations yet.
                        </p>
                      </div>
                      <Button className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Integration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {integrations.map((integration) => (
                    <Card key={integration.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle>{integration.config.name || "Unnamed Integration"}</CardTitle>
                          <Button 
                            variant={integration.is_enabled ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleIntegration(integration.id, !integration.is_enabled)}
                          >
                            {integration.is_enabled ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {integration.config.description || "No description provided"}
                          </p>
                          {integration.config.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={integration.config.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visit Provider
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="flex justify-end mt-4">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add New {type.label.slice(0, -1)}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
