
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clipboard, BarChart, Package, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  // In a real app, this would check authentication status
  useEffect(() => {
    // This is where you would check if user is authenticated
    // For now, we'll just allow manual navigation
    // navigate("/"); // Uncomment this once authentication is implemented
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-esm-blue-600 mb-4">Easy Shop Manager</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Complete work order management system for professional service businesses
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Quick access cards */}
          <Link to="/work-orders" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-slate-200 h-full">
              <div className="flex items-center mb-4">
                <Clipboard className="h-8 w-8 text-esm-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-slate-800">Work Orders</h2>
              </div>
              <p className="text-slate-600 mb-4">
                Create, manage and track work orders for customer service requests
              </p>
              <span className="text-esm-blue-600 group-hover:underline inline-flex items-center">
                Manage work orders
              </span>
            </div>
          </Link>

          <Link to="/reports" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-slate-200 h-full">
              <div className="flex items-center mb-4">
                <BarChart className="h-8 w-8 text-esm-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-slate-800">Reports</h2>
              </div>
              <p className="text-slate-600 mb-4">
                View business performance metrics and generate detailed reports
              </p>
              <span className="text-esm-blue-600 group-hover:underline inline-flex items-center">
                View reports
              </span>
            </div>
          </Link>

          <Link to="/inventory" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-slate-200 h-full">
              <div className="flex items-center mb-4">
                <Package className="h-8 w-8 text-esm-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-slate-800">Inventory</h2>
              </div>
              <p className="text-slate-600 mb-4">
                Manage parts, supplies and track inventory levels
              </p>
              <span className="text-esm-blue-600 group-hover:underline inline-flex items-center">
                Manage inventory
              </span>
            </div>
          </Link>

          <Link to="/team" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border border-slate-200 h-full">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-esm-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-slate-800">Team</h2>
              </div>
              <p className="text-slate-600 mb-4">
                Manage technicians, staff and role permissions
              </p>
              <span className="text-esm-blue-600 group-hover:underline inline-flex items-center">
                Manage team
              </span>
            </div>
          </Link>
        </div>

        <div className="text-center mb-12">
          <Link to="/">
            <Button className="bg-esm-blue-600 hover:bg-esm-blue-700 text-white px-8 py-3 text-lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200 mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <div className="rounded-full bg-esm-blue-100 text-esm-blue-600 w-8 h-8 flex items-center justify-center font-bold mb-3">1</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Create Work Orders</h3>
              <p className="text-slate-600">Start by creating work orders for your customers' service requests.</p>
            </div>
            
            <div className="flex flex-col">
              <div className="rounded-full bg-esm-blue-100 text-esm-blue-600 w-8 h-8 flex items-center justify-center font-bold mb-3">2</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Assign Technicians</h3>
              <p className="text-slate-600">Assign qualified technicians to handle the service requests.</p>
            </div>
            
            <div className="flex flex-col">
              <div className="rounded-full bg-esm-blue-100 text-esm-blue-600 w-8 h-8 flex items-center justify-center font-bold mb-3">3</div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Track Progress</h3>
              <p className="text-slate-600">Monitor work order progress and generate invoices upon completion.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
