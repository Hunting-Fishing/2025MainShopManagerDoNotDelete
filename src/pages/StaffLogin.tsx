
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";

export default function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Attempt to sign in the staff member
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if the user is staff (has appropriate role)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('roles:role_id(name)')
        .eq('user_id', data.user.id);

      if (roleError) {
        throw roleError;
      }

      // Determine if user has staff role
      const hasStaffRole = roleData && roleData.length > 0;

      // If not staff, log them out and show error
      if (!hasStaffRole) {
        await supabase.auth.signOut();
        toast.error("Access denied. This portal is for staff members only.");
        setLoading(false);
        return;
      }

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Staff Login | Easy Shop Manager</title>
      </Helmet>

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Side - Shop Info */}
        <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-8 md:w-1/2 flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Staff Portal</h1>
            <p className="mb-6 text-blue-100">
              Welcome to the staff portal. Please login to access 
              the shop management system. This area is restricted to 
              authorized personnel only.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-600 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Staff Access</h3>
                  <p className="text-sm text-blue-100">Complete access to shop management features</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-600 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Secure Platform</h3>
                  <p className="text-sm text-blue-100">Enhanced security for staff operations</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-600 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <path d="M9 9h6v6H9z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Administration</h3>
                  <p className="text-sm text-blue-100">Manage shop operations and customer data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="p-8 md:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Staff Login</h2>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="staff@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      id="password"
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need customer access? <a href="/login" className="text-blue-600 hover:underline">Customer Login</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
