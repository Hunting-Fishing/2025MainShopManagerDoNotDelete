
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Upload, PaintBucket } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ColorSelector } from "./ColorSelector";

// Default branding colors
const defaultColors = {
  primary: "#3a6dfc",
  secondary: "#1F45FC",
  accent: "#8eb9ff",
  text: "#141c59",
  background: "#ffffff"
};

export function BrandingTab() {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [colors, setColors] = useState(defaultColors);
  const [companyName, setCompanyName] = useState("Easy Shop Manager");
  const [theme, setTheme] = useState("light");

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (colorKey: keyof typeof colors, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const handleReset = () => {
    setColors(defaultColors);
    setLogoPreview(null);
    setLogoFile(null);
    setTheme("light");
    
    toast({
      title: "Branding reset",
      description: "All branding settings have been reset to default values"
    });
  };

  const handleSave = () => {
    // In a real app, this would save to local storage, a database, or generate CSS variables
    console.log("Saving branding settings:", {
      colors,
      logoFile,
      companyName,
      theme
    });
    
    // Apply colors to CSS variables (this is a simplified approach)
    document.documentElement.style.setProperty('--primary', colors.primary);
    document.documentElement.style.setProperty('--secondary', colors.secondary);
    document.documentElement.style.setProperty('--accent', colors.accent);
    
    toast({
      title: "Branding updated",
      description: "Your branding settings have been saved and applied"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Custom Branding</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleReset}>Reset to Default</Button>
          <Button className="bg-esm-blue-600 hover:bg-esm-blue-700" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Colors</span>
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Logo</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <PaintBucket className="h-4 w-4" />
            <span>Theme</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorSelector 
                  label="Primary Color" 
                  color={colors.primary} 
                  onChange={(value) => handleColorChange("primary", value)}
                />
                <ColorSelector 
                  label="Secondary Color" 
                  color={colors.secondary} 
                  onChange={(value) => handleColorChange("secondary", value)}
                />
                <ColorSelector 
                  label="Accent Color" 
                  color={colors.accent} 
                  onChange={(value) => handleColorChange("accent", value)}
                />
                <ColorSelector 
                  label="Text Color" 
                  color={colors.text} 
                  onChange={(value) => handleColorChange("text", value)}
                />
                <ColorSelector 
                  label="Background Color" 
                  color={colors.background} 
                  onChange={(value) => handleColorChange("background", value)}
                />
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Preview</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex space-x-2">
                    <div 
                      className="w-16 h-16 rounded-md border" 
                      style={{ backgroundColor: colors.primary }}
                    ></div>
                    <div 
                      className="w-16 h-16 rounded-md border" 
                      style={{ backgroundColor: colors.secondary }}
                    ></div>
                    <div 
                      className="w-16 h-16 rounded-md border" 
                      style={{ backgroundColor: colors.accent }}
                    ></div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="mb-2" style={{ color: colors.text }}>
                      Sample text in your selected text color
                    </div>
                    <Button 
                      className="mr-2" 
                      style={{ 
                        backgroundColor: colors.primary,
                        color: "#fff"
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button 
                      variant="outline"
                      style={{ 
                        borderColor: colors.secondary,
                        color: colors.secondary
                      }}
                    >
                      Secondary Button
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="logo-upload">Upload Logo</Label>
                  <Input 
                    id="logo-upload" 
                    type="file" 
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="mt-1" 
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommended: 200×60px, PNG or SVG
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <h3 className="font-medium mb-4">Logo Preview</h3>
                <div className="border rounded-md p-4 flex items-center justify-center bg-gray-50 min-h-32">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Uploaded logo" 
                      className="max-h-24 max-w-full object-contain" 
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p>No logo uploaded</p>
                      <p className="text-xs mt-1">Your company name will be displayed as text</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Choose Theme</Label>
                  <div className="flex flex-col space-y-2">
                    <div 
                      className={`border rounded-md p-4 hover:border-primary cursor-pointer ${
                        theme === 'light' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="font-medium">Light Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Clean and bright interface
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-md p-4 hover:border-primary cursor-pointer ${
                        theme === 'dark' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="font-medium">Dark Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Reduced eye strain in low-light environments
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-md p-4 hover:border-primary cursor-pointer ${
                        theme === 'auto' ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setTheme('auto')}
                    >
                      <div className="font-medium">Auto (System)</div>
                      <div className="text-sm text-muted-foreground">
                        Follows your system's theme setting
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className={`border rounded-md overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
                  }`}>
                    <div className={`p-3 ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      Header
                    </div>
                    <div className="p-4">
                      <div className="font-medium mb-2">Content Section</div>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        This is how your content will appear in the selected theme.
                      </p>
                      <div className="mt-3">
                        <Button size="sm" className={
                          theme === 'dark' ? 'bg-blue-600' : 'bg-esm-blue-600'
                        }>
                          Action Button
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
