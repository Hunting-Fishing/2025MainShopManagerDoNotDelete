
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bay } from "@/services/diybay/diybayService";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Columns, LayoutGrid, Maximize2, Printer, Rows, X } from "lucide-react";
import { printElement } from "@/utils/printUtils";
import { BayPrintPreview } from "./BayPrintPreview";

interface PrintPreviewDialogProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bays: Bay[];
}

export const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({
  isOpen,
  setIsOpen,
  bays,
}) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [layout, setLayout] = useState<"list" | "grid" | "table">("list");
  const [columns, setColumns] = useState(1);
  const [scale, setScale] = useState(100);
  const [showColors, setShowColors] = useState(true);
  const [colorScheme, setColorScheme] = useState("default");
  const [showDetails, setShowDetails] = useState(true);
  
  const handlePrint = () => {
    printElement("bay-print-content", "Available Bays");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle>Print Preview</DialogTitle>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsOpen(false)} 
              size="sm"
              variant="outline"
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button 
              onClick={handlePrint}
              variant="default"
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 w-64 mx-auto">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            <TabsContent value="preview" className="flex-1 overflow-auto mt-4 data-[state=active]:flex flex-col">
              <div id="bay-print-content" className="p-4 flex-1">
                <BayPrintPreview 
                  bays={bays} 
                  layout={layout}
                  columns={columns}
                  scale={scale}
                  showColors={showColors}
                  colorScheme={colorScheme}
                  showDetails={showDetails}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="customize" className="mt-4 data-[state=active]:flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Layout</h3>
                    <div className="flex gap-4">
                      <Button 
                        variant={layout === "list" ? "default" : "outline"} 
                        onClick={() => setLayout("list")}
                        className="flex-1"
                      >
                        <Rows className="h-4 w-4 mr-2" /> List
                      </Button>
                      <Button 
                        variant={layout === "grid" ? "default" : "outline"} 
                        onClick={() => setLayout("grid")}
                        className="flex-1"
                      >
                        <LayoutGrid className="h-4 w-4 mr-2" /> Grid
                      </Button>
                      <Button 
                        variant={layout === "table" ? "default" : "outline"} 
                        onClick={() => setLayout("table")}
                        className="flex-1"
                      >
                        <Columns className="h-4 w-4 mr-2" /> Table
                      </Button>
                    </div>
                  </div>
                  
                  {layout === "grid" && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Columns</Label>
                        <span className="text-sm text-gray-500">{columns}</span>
                      </div>
                      <Slider 
                        value={[columns]}
                        min={1}
                        max={3}
                        step={1}
                        onValueChange={(value) => setColumns(value[0])}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Scale</Label>
                      <span className="text-sm text-gray-500">{scale}%</span>
                    </div>
                    <Slider 
                      value={[scale]}
                      min={70}
                      max={130}
                      step={5}
                      onValueChange={(value) => setScale(value[0])}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-colors">Show Colors</Label>
                    <Switch 
                      id="show-colors" 
                      checked={showColors} 
                      onCheckedChange={setShowColors} 
                    />
                  </div>
                  
                  {showColors && (
                    <div className="space-y-2">
                      <Label htmlFor="color-scheme">Color Scheme</Label>
                      <Select value={colorScheme} onValueChange={setColorScheme}>
                        <SelectTrigger id="color-scheme">
                          <SelectValue placeholder="Select color scheme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="vibrant">Vibrant</SelectItem>
                          <SelectItem value="calm">Calm</SelectItem>
                          <SelectItem value="monochrome">Monochrome</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-details">Show Detailed Rates</Label>
                    <Switch 
                      id="show-details" 
                      checked={showDetails} 
                      onCheckedChange={setShowDetails} 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter className="flex justify-between mt-4">
          <div className="text-sm text-gray-500">
            Customize your print layout before printing
          </div>
          <Button 
            onClick={handlePrint}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Printer className="h-4 w-4 mr-1" /> Print Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
