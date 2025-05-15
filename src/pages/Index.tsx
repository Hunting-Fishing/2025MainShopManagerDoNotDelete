
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerPortalLink } from "@/components/layout/CustomerPortalLink";

export default function Index() {
  return (
    <>
      <Helmet>
        <title>Welcome | Easy Shop Manager</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Welcome to Easy Shop Manager</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Portal Link */}
          <Card className="shadow-md border-blue-100">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center p-6">
                <h2 className="text-xl font-bold mb-2">Customer Portal</h2>
                <p className="mb-6 text-muted-foreground">
                  Allow your customers to book appointments, track work orders, and manage their vehicles.
                </p>
                <CustomerPortalLink />
              </div>
            </CardContent>
          </Card>
          
          {/* Admin Dashboard Link */}
          <Card className="shadow-md border-purple-100">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center p-6">
                <h2 className="text-xl font-bold mb-2">Admin Dashboard</h2>
                <p className="mb-6 text-muted-foreground">
                  Access your shop management tools, including calendar, work orders, and customer data.
                </p>
                <Link to="/dashboard" className="block w-full">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2 px-4 rounded text-center">
                    Go to Dashboard
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-muted-foreground text-sm mt-8">
          <p>Easy Shop Manager - Your complete auto shop management solution</p>
        </div>
      </div>
    </>
  );
}
