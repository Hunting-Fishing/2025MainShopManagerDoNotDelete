
import { CustomerAccountCard } from "@/components/customer-portal/CustomerAccountCard";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react";

export default function Login() {
  return (
    <>
      <Helmet>
        <title>Login | Easy Shop Manager</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Side - Shop Info */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-8 md:w-1/2 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Welcome to Easy Shop Manager</h1>
            <p className="mb-6 text-blue-100">
              Your trusted automotive service shop management solution. 
              Create an account to access your vehicle service history, 
              schedule appointments, and more.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Secure Access</h3>
                  <p className="text-sm text-blue-100">Safely access your service records and information</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <path d="M9 9h6v6H9z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Convenient Scheduling</h3>
                  <p className="text-sm text-blue-100">Book appointments online at your convenience</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <path d="M14 2v6h6"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                    <path d="M10 9H8"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Digital Records</h3>
                  <p className="text-sm text-blue-100">Access and print your service history and invoices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Cards */}
        <div className="p-8 md:w-1/2 flex flex-col items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            {/* Staff Login Card - Now Primary/Larger */}
            <Card className="shadow-lg border-t-4 border-t-indigo-600">
              <CardHeader>
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <CardTitle className="text-center">Staff Login</CardTitle>
                <CardDescription className="text-center">
                  For shop employees and administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="default" className="w-full" size="lg">
                  <Link to="/staff-login" className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    Staff Login Portal
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Customer Login Card - Now Secondary/Smaller */}
            <Card className="shadow-lg border-t-4 border-t-blue-600">
              <CardHeader>
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-center">Customer Login</CardTitle>
                <CardDescription className="text-center">
                  Access your vehicle service history and appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <CustomerAccountCard />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
