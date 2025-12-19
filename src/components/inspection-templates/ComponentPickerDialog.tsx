import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Gauge,
  Zap,
  Droplets,
  Fuel,
  Battery,
  ShieldCheck,
  Compass,
  Car,
  Search,
  Plus,
  Check,
  Clock,
} from 'lucide-react';
import { COMPONENT_CATALOG, type ComponentDefinition, type ComponentCategory } from '@/config/componentCatalog';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  Gauge,
  Zap,
  Droplets,
  Fuel,
  Battery,
  ShieldCheck,
  Compass,
  Car,
};

const TYPE_COLORS: Record<string, string> = {
  hour_meter: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  gyr_status: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  number: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  text: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  checkbox: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  fluid_level: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
};

const TYPE_LABELS: Record<string, string> = {
  hour_meter: 'Hour Meter',
  gyr_status: 'G/Y/R Status',
  number: 'Number',
  text: 'Text',
  checkbox: 'Checkbox',
  fluid_level: 'Fluid Level',
};

interface ComponentPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectComponents: (components: ComponentDefinition[]) => void;
  existingKeys?: string[];
}

export function ComponentPickerDialog({
  open,
  onOpenChange,
  onSelectComponents,
  existingKeys = [],
}: ComponentPickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());

  const filteredCategories = COMPONENT_CATALOG.map((category) => ({
    ...category,
    components: category.components.filter(
      (comp) =>
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.components.length > 0);

  const toggleComponent = (componentId: string) => {
    const newSelected = new Set(selectedComponents);
    if (newSelected.has(componentId)) {
      newSelected.delete(componentId);
    } else {
      newSelected.add(componentId);
    }
    setSelectedComponents(newSelected);
  };

  const handleAdd = () => {
    const components = COMPONENT_CATALOG.flatMap((cat) => cat.components).filter((comp) =>
      selectedComponents.has(comp.id)
    );
    onSelectComponents(components);
    setSelectedComponents(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedComponents(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  const isAlreadyAdded = (key: string) => existingKeys.includes(key);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Equipment Components
          </DialogTitle>
          <DialogDescription>
            Select predefined components to add to your inspection template. Components are grouped by category.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Component List */}
        <ScrollArea className="flex-1 min-h-0 max-h-[55vh]">
          <div className="pr-4">
            <Accordion type="multiple" defaultValue={COMPONENT_CATALOG.map((c) => c.id)} className="w-full">
              {filteredCategories.map((category) => (
                <CategoryAccordion
                  key={category.id}
                  category={category}
                  selectedComponents={selectedComponents}
                  existingKeys={existingKeys}
                  onToggle={toggleComponent}
                />
              ))}
            </Accordion>

            {filteredCategories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No components found matching "{searchQuery}"
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedComponents.size > 0 ? (
              <span className="font-medium text-foreground">
                {selectedComponents.size} component{selectedComponents.size !== 1 ? 's' : ''} selected
              </span>
            ) : (
              'Select components to add'
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={selectedComponents.size === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CategoryAccordionProps {
  category: ComponentCategory;
  selectedComponents: Set<string>;
  existingKeys: string[];
  onToggle: (id: string) => void;
}

function CategoryAccordion({
  category,
  selectedComponents,
  existingKeys,
  onToggle,
}: CategoryAccordionProps) {
  const IconComponent = ICON_MAP[category.icon] || Gauge;
  const selectedCount = category.components.filter((c) => selectedComponents.has(c.id)).length;

  return (
    <AccordionItem value={category.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <IconComponent className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-medium">{category.name}</div>
            <div className="text-xs text-muted-foreground">{category.description}</div>
          </div>
          {selectedCount > 0 && (
            <Badge variant="default" className="ml-2">
              {selectedCount}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-1 pl-11">
          {category.components.map((component) => {
            const isSelected = selectedComponents.has(component.id);
            const isExisting = existingKeys.includes(component.key);

            return (
              <button
                key={component.id}
                onClick={() => !isExisting && onToggle(component.id)}
                disabled={isExisting}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors',
                  isExisting
                    ? 'opacity-50 cursor-not-allowed bg-muted'
                    : isSelected
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'hover:bg-muted border-2 border-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{component.name}</div>
                    {component.description && (
                      <div className="text-xs text-muted-foreground">{component.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {component.type === 'hour_meter' && (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Badge variant="secondary" className={cn('text-xs', TYPE_COLORS[component.type])}>
                    {TYPE_LABELS[component.type]}
                  </Badge>
                  {isExisting && (
                    <Badge variant="outline" className="text-xs">
                      Already added
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
