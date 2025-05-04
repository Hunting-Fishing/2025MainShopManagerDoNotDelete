
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationsTab } from "@/components/settings/IntegrationsTab";
import { useShopId } from "@/hooks/useShopId";
import { Container, Segment, Grid } from "semantic-ui-react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function IntegrationsPage() {
  const { shopId } = useShopId();
  
  return (
    <Container fluid className="px-4 py-8">
      <Segment raised className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-t-4 border-t-blue-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">Integrations Management</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              Connect and manage third-party service integrations
            </p>
          </div>
          <Button asChild variant="outline" className="self-start">
            <Link to="/developer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Developer Portal
            </Link>
          </Button>
        </div>
      </Segment>

      <Card className="bg-white shadow-md rounded-xl border border-gray-100">
        <CardHeader className="pb-2">
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>
            Configure connections to external services and APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationsTab shopId={shopId || undefined} />
        </CardContent>
      </Card>
    </Container>
  );
}
