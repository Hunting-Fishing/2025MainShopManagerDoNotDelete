
import { Settings, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryItemExtended, AutoReorderSettings } from "@/types/inventory";

interface AutoReorderStatusProps {
  items: InventoryItemExtended[];
  autoReorderSettings: Record<string, AutoReorderSettings>;
}

export function AutoReorderStatus({ items, autoReorderSettings }: AutoReorderStatusProps) {
  const enabledAutoReorderCount = Object.values(autoReorderSettings).filter(setting => setting.enabled).length;
  const itemsWithAutoReorder = items.filter(item => autoReorderSettings[item.id]?.enabled);
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="font-medium text-slate-900">Auto-Reorder Status</h3>
      </div>
      
      <div className="p-4">
        <div className="flex items-start">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">Auto-reorder enabled for {enabledAutoReorderCount} item(s)</h4>
            
            {enabledAutoReorderCount > 0 ? (
              <>
                <p className="text-sm text-slate-600 mb-3">
                  The following items will be automatically reordered when they reach their threshold
                </p>
                
                <div className="space-y-2 mb-4">
                  {itemsWithAutoReorder.slice(0, 2).map(item => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-200">
                      <div>
                        <span className="font-medium text-sm">{item.name}</span>
                        <div className="text-xs text-slate-500">
                          Threshold: {autoReorderSettings[item.id]?.threshold}, 
                          Qty to order: {autoReorderSettings[item.id]?.quantity}
                        </div>
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        <span className="text-xs">Enabled</span>
                      </div>
                    </div>
                  ))}
                  
                  {itemsWithAutoReorder.length > 2 && (
                    <p className="text-xs text-slate-500 text-center italic">
                      And {itemsWithAutoReorder.length - 2} more item(s)
                    </p>
                  )}
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  Manage Auto-Reorder Settings
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-3">
                  Enable auto-reorder to automatically purchase items when stock gets low
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Configure Auto-Reorder
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
