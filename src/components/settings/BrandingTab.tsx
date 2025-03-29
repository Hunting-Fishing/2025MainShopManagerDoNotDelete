
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Upload, PaintBucket } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { BrandingActions } from "./branding/BrandingActions";
import { ColorsTab } from "./branding/ColorsTab";
import { LogoTab } from "./branding/LogoTab";
import { ThemeTab } from "./branding/ThemeTab";

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

  const handleColorChange = (colorKey: string, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyName(e.target.value);
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
      <BrandingActions onReset={handleReset} onSave={handleSave} />

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
          <ColorsTab colors={colors} onColorChange={handleColorChange} />
        </TabsContent>

        <TabsContent value="logo" className="space-y-4">
          <LogoTab 
            logoPreview={logoPreview}
            companyName={companyName}
            onLogoChange={handleLogoChange}
            onCompanyNameChange={handleCompanyNameChange}
          />
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <ThemeTab theme={theme} setTheme={setTheme} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
