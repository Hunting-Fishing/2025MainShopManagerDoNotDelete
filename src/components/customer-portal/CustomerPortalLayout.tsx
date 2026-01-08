import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, LogIn, UserPlus, Home } from 'lucide-react';

interface CustomerPortalLayoutProps {
  children: React.ReactNode;
  showBackToPortal?: boolean;
}

export function CustomerPortalHeader() {
  return (
    <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/customer-portal" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-foreground">Customer Portal</span>
          </Link>
          
          <nav className="flex items-center gap-2">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link 
              to="/customer-portal/login" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
            <Link 
              to="/customer-portal/register" 
              className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Register</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function CustomerPortalFooter() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-semibold">Customer Portal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Access your service history, book appointments, and manage your account with your service providers.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/customer-portal" className="hover:text-foreground transition-colors">
                  Find a Business
                </Link>
              </li>
              <li>
                <Link to="/customer-portal/login" className="hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/customer-portal/register" className="hover:text-foreground transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Back to Main Site
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-6 pt-6 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} All Business 365. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function CustomerPortalLayout({ children }: CustomerPortalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <CustomerPortalHeader />
      <main className="flex-1">
        {children}
      </main>
      <CustomerPortalFooter />
    </div>
  );
}
