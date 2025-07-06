import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid3X3, 
  Eye, 
  Camera, 
  Plus,
  Undo,
  Redo,
  Download,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import vehicleFrontView from '@/assets/vehicle-front-view.jpg';
import vehicleBackView from '@/assets/vehicle-back-view.jpg';
import vehicleTopView from '@/assets/vehicle-top-view.jpg';
import vehicleSideView from '@/assets/vehicle-side-view.jpg';
import { DamageTypeFloatingToolbar } from './DamageTypeSelector';
import { DamageContextMenu } from './DamageContextMenu';
import { DamageDetailsPanel } from './DamageDetailsPanel';

export interface DamageArea {
  id: string;
  x: number;
  y: number;
  type: 'dent' | 'scratch' | 'rust' | 'paint_damage' | 'collision' | 'wear' | 'other';
  severity: 'minor' | 'moderate' | 'severe';
  description: string;
  notes?: string;
  photos?: string[];
  estimatedCost?: number;
  createdAt: Date;
  updatedAt: Date;
  bodyPanel: string;
  view: 'front' | 'back' | 'top' | 'side';
}

interface HistoryAction {
  type: 'add' | 'update' | 'delete' | 'bulk_delete';
  damages: DamageArea[];
  previousDamages: DamageArea[];
  timestamp: Date;
}

const DAMAGE_TYPE_STYLES = {
  dent: { color: '#f59e0b', icon: '●', label: 'Dent' },
  scratch: { color: '#ef4444', icon: '╱', label: 'Scratch' },
  rust: { color: '#dc2626', icon: '◆', label: 'Rust' },
  paint_damage: { color: '#8b5cf6', icon: '◐', label: 'Paint' },
  collision: { color: '#dc2626', icon: '✶', label: 'Collision' },
  wear: { color: '#6b7280', icon: '○', label: 'Wear' },
  other: { color: '#64748b', icon: '?', label: 'Other' }
};

const SEVERITY_STYLES = {
  minor: { size: 8, ringWidth: 2, opacity: 0.8 },
  moderate: { size: 12, ringWidth: 3, opacity: 0.9 },
  severe: { size: 16, ringWidth: 4, opacity: 1 }
};

interface EnhancedVehicleDamageAssessmentProps {
  damages: DamageArea[];
  onDamagesChange: (damages: DamageArea[]) => void;
  bodyStyle?: string;
  readOnly?: boolean;
}

export const EnhancedVehicleDamageAssessment: React.FC<EnhancedVehicleDamageAssessmentProps> = ({
  damages,
  onDamagesChange,
  readOnly = false
}) => {
  const [activeView, setActiveView] = useState<'front' | 'back' | 'top' | 'side'>('front');
  const [selectedDamages, setSelectedDamages] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showPanelLabels, setShowPanelLabels] = useState(false);
  const [isAddingDamage, setIsAddingDamage] = useState(false);
  const [selectedDamageType, setSelectedDamageType] = useState<string>('dent');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('minor');
  const [isDragMode, setIsDragMode] = useState(false);
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  
  // Floating toolbar state
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [pendingDamagePosition, setPendingDamagePosition] = useState<{ x: number; y: number } | null>(null);
  
  // Context menu state
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuDamage, setContextMenuDamage] = useState<DamageArea | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<HistoryAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get the correct image based on active view
  const getVehicleImage = () => {
    switch (activeView) {
      case 'front': return vehicleFrontView;
      case 'back': return vehicleBackView;
      case 'top': return vehicleTopView;
      case 'side': return vehicleSideView;
      default: return vehicleFrontView;
    }
  };

  // Add damage to history
  const addToHistory = useCallback((action: Omit<HistoryAction, 'timestamp'>) => {
    const newAction: HistoryAction = { ...action, timestamp: new Date() };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newAction]);
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex >= 0) {
      const action = history[historyIndex];
      onDamagesChange(action.previousDamages);
      setHistoryIndex(prev => prev - 1);
      toast({ title: "Action undone", description: "Previous state restored" });
    }
  }, [history, historyIndex, onDamagesChange, toast]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const action = history[historyIndex + 1];
      onDamagesChange(action.damages);
      setHistoryIndex(prev => prev + 1);
      toast({ title: "Action redone", description: "Action restored" });
    }
  }, [history, historyIndex, onDamagesChange, toast]);

  // Handle image click for damage placement
  const handleImageClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !isAddingDamage) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    // Show floating toolbar for damage type selection
    setToolbarPosition({ 
      x: event.clientX, 
      y: event.clientY 
    });
    setPendingDamagePosition({ x, y });
    setToolbarVisible(true);
  }, [readOnly, isAddingDamage, zoom]);

  // Confirm damage placement
  const handleConfirmDamage = useCallback(() => {
    if (!pendingDamagePosition) return;

    const newDamage: DamageArea = {
      id: `damage-${Date.now()}-${Math.random()}`,
      x: pendingDamagePosition.x,
      y: pendingDamagePosition.y,
      type: selectedDamageType as DamageArea['type'],
      severity: selectedSeverity as DamageArea['severity'],
      description: `${DAMAGE_TYPE_STYLES[selectedDamageType as keyof typeof DAMAGE_TYPE_STYLES]?.label || 'Damage'} on vehicle`,
      bodyPanel: 'Unknown Panel',
      view: activeView,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addToHistory({
      type: 'add',
      damages: [...damages, newDamage],
      previousDamages: damages
    });

    onDamagesChange([...damages, newDamage]);
    setToolbarVisible(false);
    setPendingDamagePosition(null);
    setIsAddingDamage(false);
    
    toast({
      title: "Damage added",
      description: `${newDamage.description} marked successfully`
    });
  }, [pendingDamagePosition, selectedDamageType, selectedSeverity, activeView, damages, onDamagesChange, addToHistory, toast]);

  // Handle right-click on damage
  const handleDamageRightClick = useCallback((event: React.MouseEvent, damage: DamageArea) => {
    event.preventDefault();
    event.stopPropagation();
    
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuDamage(damage);
    setContextMenuVisible(true);
  }, []);

  // Handle damage selection
  const handleDamageClick = useCallback((damage: DamageArea, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (isBulkSelectMode) {
      setSelectedDamages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(damage.id)) {
          newSet.delete(damage.id);
        } else {
          newSet.add(damage.id);
        }
        return newSet;
      });
    } else {
      setSelectedDamages(new Set([damage.id]));
    }
  }, [isBulkSelectMode]);

  // Delete selected damages
  const handleDeleteSelected = useCallback(() => {
    if (selectedDamages.size === 0) return;

    const selectedDamagesList = Array.from(selectedDamages);
    const updatedDamages = damages.filter(d => !selectedDamages.has(d.id));
    
    addToHistory({
      type: 'bulk_delete',
      damages: updatedDamages,
      previousDamages: damages
    });

    onDamagesChange(updatedDamages);
    setSelectedDamages(new Set());
    
    toast({
      title: "Damages deleted",
      description: `${selectedDamagesList.length} damage area${selectedDamagesList.length > 1 ? 's' : ''} removed`
    });
  }, [selectedDamages, damages, onDamagesChange, addToHistory, toast]);

  // Context menu actions
  const contextMenuActions = {
    onEdit: () => {
      // Implementation for editing damage
      toast({ title: "Edit mode", description: "Opening damage editor..." });
    },
    onDelete: () => {
      if (!contextMenuDamage) return;
      
      const updatedDamages = damages.filter(d => d.id !== contextMenuDamage.id);
      
      addToHistory({
        type: 'delete',
        damages: updatedDamages,
        previousDamages: damages
      });

      onDamagesChange(updatedDamages);
      toast({ title: "Damage deleted", description: "Damage area removed" });
    },
    onDuplicate: () => {
      if (!contextMenuDamage) return;
      
      const duplicatedDamage: DamageArea = {
        ...contextMenuDamage,
        id: `damage-${Date.now()}-${Math.random()}`,
        x: contextMenuDamage.x + 20,
        y: contextMenuDamage.y + 20,
        description: `${contextMenuDamage.description} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addToHistory({
        type: 'add',
        damages: [...damages, duplicatedDamage],
        previousDamages: damages
      });

      onDamagesChange([...damages, duplicatedDamage]);
      toast({ title: "Damage duplicated", description: "Created a copy of the damage area" });
    },
    onMove: () => {
      setIsDragMode(true);
      toast({ title: "Move mode", description: "Click and drag to reposition damage" });
    },
    onAddPhoto: () => {
      toast({ title: "Photo upload", description: "Photo upload feature coming soon" });
    },
    onEstimateCost: () => {
      toast({ title: "Cost estimator", description: "Cost estimation feature coming soon" });
    },
    onViewDetails: () => {
      toast({ title: "Damage details", description: "Viewing detailed information" });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedDamages.size > 0) {
            event.preventDefault();
            handleDeleteSelected();
          }
          break;
        case 'Escape':
          setSelectedDamages(new Set());
          setToolbarVisible(false);
          setContextMenuVisible(false);
          setIsAddingDamage(false);
          break;
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            const currentViewDamages = damages.filter(d => d.view === activeView);
            setSelectedDamages(new Set(currentViewDamages.map(d => d.id)));
          }
          break;
        case 'z':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            if (event.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedDamages, handleDeleteSelected, handleUndo, handleRedo, damages, activeView]);

  const currentViewDamages = damages.filter(damage => damage.view === activeView);
  const selectedCount = selectedDamages.size;
  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  // Damage marker component
  const DamageMarker: React.FC<{ damage: DamageArea }> = ({ damage }) => {
    const typeStyle = DAMAGE_TYPE_STYLES[damage.type];
    const severityStyle = SEVERITY_STYLES[damage.severity];
    const isSelected = selectedDamages.has(damage.id);

    return (
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
        style={{ 
          left: damage.x * zoom, 
          top: damage.y * zoom,
          color: typeStyle.color 
        }}
        onClick={(e) => handleDamageClick(damage, e)}
        onContextMenu={(e) => handleDamageRightClick(e, damage)}
      >
        {/* Selection Ring */}
        {isSelected && (
          <div 
            className="absolute animate-pulse rounded-full border-2 border-primary bg-primary/10"
            style={{
              width: (severityStyle.size + 16) * zoom,
              height: (severityStyle.size + 16) * zoom,
              left: `calc(-${(severityStyle.size + 16) * zoom / 2}px)`,
              top: `calc(-${(severityStyle.size + 16) * zoom / 2}px)`
            }}
          />
        )}
        
        {/* Damage Marker */}
        <div 
          className="flex items-center justify-center text-white font-bold rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110"
          style={{
            width: severityStyle.size * zoom,
            height: severityStyle.size * zoom,
            backgroundColor: typeStyle.color,
            fontSize: (severityStyle.size - 4) * zoom
          }}
        >
          {typeStyle.icon}
        </div>
        
        {/* Hover Tooltip */}
        <div className="absolute left-full ml-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            {damage.description}
            <div className="text-xs opacity-75">
              {damage.type.replace('_', ' ')} • {damage.severity}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Enhanced Vehicle Damage Assessment
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                {currentViewDamages.length} damage{currentViewDamages.length !== 1 ? 's' : ''} • {activeView} view
              </Badge>
              {selectedCount > 0 && (
                <Badge variant="secondary">
                  {selectedCount} selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Control Bar */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            {/* View Tabs */}
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'front' | 'back' | 'top' | 'side')}>
              <TabsList>
                <TabsTrigger value="front">Front</TabsTrigger>
                <TabsTrigger value="back">Back</TabsTrigger>
                <TabsTrigger value="top">Top</TabsTrigger>
                <TabsTrigger value="side">Side</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Tools */}
            <div className="flex gap-2">
              {/* History Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="h-4 w-4" />
              </Button>
              
              {/* Selection Tools */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBulkSelectMode(!isBulkSelectMode)}
                className={isBulkSelectMode ? 'bg-primary/10' : ''}
                title="Bulk Select Mode"
              >
                {isBulkSelectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </Button>
              
              {selectedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-700"
                  title="Delete Selected (Del)"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              
              {/* View Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className={showGrid ? 'bg-primary/10' : ''}
                title="Toggle Grid"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPanelLabels(!showPanelLabels)}
                className={showPanelLabels ? 'bg-primary/10' : ''}
                title="Toggle Panel Labels"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              {/* Zoom Controls */}
              <Button variant="outline" size="sm" onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.5))} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoom(1)} title="Reset View">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoom(prev => Math.min(prev * 1.2, 3))} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              {/* Add Damage */}
              {!readOnly && (
                <Button
                  variant={isAddingDamage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsAddingDamage(!isAddingDamage)}
                  className={isAddingDamage ? "bg-primary text-primary-foreground" : ""}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Damage
                </Button>
              )}
            </div>
          </div>

          {/* Status Alerts */}
          {isAddingDamage && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Click anywhere on the vehicle diagram to mark damage areas. A type selector will appear to help you specify the damage details.
              </AlertDescription>
            </Alert>
          )}

          {selectedCount > 0 && (
            <Alert>
              <CheckSquare className="h-4 w-4" />
              <AlertDescription>
                {selectedCount} damage area{selectedCount > 1 ? 's' : ''} selected. Press Delete to remove, or use Ctrl+A to select all.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Diagram */}
          <div className="relative border rounded-lg overflow-hidden bg-white">
            <div 
              ref={containerRef}
              className={`relative ${isAddingDamage ? 'cursor-crosshair' : 'cursor-default'}`}
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: `${1200 / zoom}px`,
                height: `${800 / zoom}px`
              }}
              onClick={handleImageClick}
            >
              {/* Vehicle Diagram Background */}
              <img 
                src={getVehicleImage()}
                alt={`Vehicle ${activeView} View`}
                className="w-full h-full object-contain"
                draggable={false}
              />
              
              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full opacity-20">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}
              
              {/* Damage Markers */}
              {currentViewDamages.map(damage => (
                <DamageMarker key={damage.id} damage={damage} />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium">Legend:</div>
            {Object.entries(DAMAGE_TYPE_STYLES).map(([type, style]) => (
              <div key={type} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: style.color }}
                >
                  {style.icon}
                </div>
                <span className="text-sm">{style.label}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          {currentViewDamages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{currentViewDamages.length}</div>
                <div className="text-xs text-muted-foreground">Total Areas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {currentViewDamages.filter(d => d.severity === 'severe').length}
                </div>
                <div className="text-xs text-muted-foreground">Severe</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {currentViewDamages.filter(d => d.severity === 'moderate').length}
                </div>
                <div className="text-xs text-muted-foreground">Moderate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentViewDamages.filter(d => d.severity === 'minor').length}
                </div>
                <div className="text-xs text-muted-foreground">Minor</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Components */}
      <DamageTypeFloatingToolbar
        isVisible={toolbarVisible}
        position={toolbarPosition}
        selectedType={selectedDamageType}
        selectedSeverity={selectedSeverity}
        onTypeSelect={setSelectedDamageType}
        onSeveritySelect={setSelectedSeverity}
        onConfirm={handleConfirmDamage}
        onCancel={() => {
          setToolbarVisible(false);
          setPendingDamagePosition(null);
          setIsAddingDamage(false);
        }}
      />

      <DamageContextMenu
        isVisible={contextMenuVisible}
        position={contextMenuPosition}
        damage={contextMenuDamage}
        {...contextMenuActions}
        onClose={() => setContextMenuVisible(false)}
      />
    </div>
  );
};