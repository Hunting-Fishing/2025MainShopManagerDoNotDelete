
import React, { useState, useEffect } from "react";
import { ProfileForm } from "./profile/ProfileForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Palette, Building } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { BrandingTab } from "./BrandingTab";
import { CompanyTab } from "./CompanyTab";

export function AccountTab() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  
  const {
    userProfile,
    loading,
    error,
    updateProfile,
    savingProfile
  } = useUserProfile();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: ""
  });

  // Handle profile data loading
  useEffect(() => {
    if (userProfile && !loading) {
      setFormData({
        firstName: userProfile.first_name || "",
        lastName: userProfile.last_name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        jobTitle: userProfile.job_title || ""
      });
      console.log("Form data updated from userProfile:", userProfile);
    }
  }, [userProfile]);

  // Check URL parameters for tab selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['profile', 'branding', 'company'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const isDarkModeEnabled = resolvedTheme === 'dark';

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        job_title: formData.jobTitle
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'company-firstName' ? 'firstName' : 
       id === 'company-lastName' ? 'lastName' : 
       id === 'company-email' ? 'email' : 
       id === 'company-phone' ? 'phone' : 
       id === 'company-jobTitle' ? 'jobTitle' : id]: value
    }));
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Branding</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ProfileForm 
              formData={formData} 
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              isSaving={savingProfile}
            />
          )}
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <BrandingTab />
        </TabsContent>

        <TabsContent value="company" className="mt-4">
          <CompanyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
