
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompanyTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" defaultValue="Easy Shop Manager Inc." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <Input id="company-address" defaultValue="123 Business Ave, Suite 100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-city">City</Label>
              <Input id="company-city" defaultValue="Business City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-state">State</Label>
              <Input id="company-state" defaultValue="NY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-zip">Zip Code</Label>
              <Input id="company-zip" defaultValue="10001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Phone</Label>
              <Input id="company-phone" defaultValue="(555) 987-6543" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="bg-esm-blue-600 hover:bg-esm-blue-700">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
