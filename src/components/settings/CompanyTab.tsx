
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Building, MapPin, Clock, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { useToast } from "@/hooks/use-toast";
import { TaxSettingsSection } from "./company/TaxSettingsSection";
import { TaxSystemStatusCard } from "@/components/tax/TaxSystemStatusCard";
import { supabase } from "@/integrations/supabase/client";

export function CompanyTab() {
  const { toast } = useToast();
  const [taxDataChanged, setTaxDataChanged] = useState(false);
  
  const {
    companyInfo,
    businessHours,
    loading,
    saving,
    uploadingLogo,
    businessTypes,
    businessIndustries,
    isLoadingConstants,
    initialized,
    saveComplete,
    dataChanged,
    handleInputChange,
    handleSelectChange,
    handleBusinessHoursChange,
    handleFileUpload,
    handleSave,
    loadCompanyInfo
  } = useCompanyInfo();

  // Get shopId from the company info hook
  const [shopId, setShopId] = useState<string>('');
  
  useEffect(() => {
    const getShopId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('shop_id')
            .eq('id', user.id)
            .single();
          if (profile?.shop_id) {
            setShopId(profile.shop_id);
          }
        }
      } catch (error) {
        console.error('Error getting shop ID:', error);
      }
    };
    getShopId();
  }, []);

  return (
    <div className="space-y-6">
      {/* Basic Company Information */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-3">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-primary" />
            <CardTitle>Company Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                name="name"
                value={companyInfo.name || ''}
                onChange={handleInputChange}
                placeholder="Enter company name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID / EIN</Label>
              <Input
                id="tax_id"
                name="tax_id"
                value={companyInfo.tax_id || ''}
                onChange={handleInputChange}
                placeholder="Enter tax ID or EIN"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select 
                value={companyInfo.business_type || ''} 
                onValueChange={(value) => handleSelectChange('business_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={companyInfo.industry || ''} 
                onValueChange={(value) => handleSelectChange('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {businessIndustries.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {companyInfo.industry === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="other_industry">Other Industry</Label>
              <Input
                id="other_industry"
                name="other_industry"
                value={companyInfo.other_industry || ''}
                onChange={handleInputChange}
                placeholder="Enter other industry"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Contact Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={companyInfo.phone || ''}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={companyInfo.email || ''}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
            
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={companyInfo.address || ''}
                onChange={handleInputChange}
                placeholder="Enter street address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={companyInfo.city || ''}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={companyInfo.state || ''}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  name="zip"
                  value={companyInfo.zip || ''}
                  onChange={handleInputChange}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Business Hours</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {businessHours.map((hours) => {
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const dayName = dayNames[hours.day_of_week];
              
              return (
                <div key={hours.day_of_week} className="flex items-center space-x-4">
                  <div className="w-24 font-medium">
                    {dayName}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={hours.open_time}
                      onChange={(e) => {
                        const updatedHours = businessHours.map(h => 
                          h.day_of_week === hours.day_of_week 
                            ? { ...h, open_time: e.target.value }
                            : h
                        );
                        handleBusinessHoursChange(updatedHours);
                      }}
                      className="w-32"
                      disabled={hours.is_closed}
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={hours.close_time}
                      onChange={(e) => {
                        const updatedHours = businessHours.map(h => 
                          h.day_of_week === hours.day_of_week 
                            ? { ...h, close_time: e.target.value }
                            : h
                        );
                        handleBusinessHoursChange(updatedHours);
                      }}
                      className="w-32"
                      disabled={hours.is_closed}
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={hours.is_closed}
                        onChange={(e) => {
                          const updatedHours = businessHours.map(h => 
                            h.day_of_week === hours.day_of_week 
                              ? { ...h, is_closed: e.target.checked }
                              : h
                          );
                          handleBusinessHoursChange(updatedHours);
                        }}
                        className="rounded"
                      />
                      <span>Closed</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings with System Status */}
      {shopId && (
        <div className="space-y-4">
          <TaxSystemStatusCard shopId={shopId} />
          <TaxSettingsSection 
            shopId={shopId} 
            onDataChange={setTaxDataChanged}
          />
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving || !dataChanged}
          className="min-w-32"
        >
          {saving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {dataChanged ? "Save Changes" : "No Changes"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
