
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InvoiceTemplate } from "@/types/invoice";
import { PlusCircle } from "lucide-react";

interface InvoiceTemplateDialogProps {
  open?: boolean;
  onClose?: () => void;
  templates: InvoiceTemplate[];
  onSelectTemplate: (template: InvoiceTemplate) => void;
}

export function InvoiceTemplateDialog({
  open,
  onClose,
  templates,
  onSelectTemplate
}: InvoiceTemplateDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use provided open state if available, otherwise use internal state
  const isOpen = open !== undefined ? open : isDialogOpen;
  
  // Use provided onClose if available, otherwise use internal handler
  const handleClose = onClose || (() => setIsDialogOpen(false));
  
  const handleSelectTemplate = (template: InvoiceTemplate) => {
    onSelectTemplate(template);
    handleClose();
  };

  return (
    <>
      {/* Only show button if open is not provided (i.e., we're controlling the dialog ourselves) */}
      {open === undefined && (
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          variant="outline"
          size="sm"
          className="flex gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Apply Template
        </Button>
      )}
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Select Invoice Template</DialogTitle>
          </DialogHeader>

          {templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No templates found</p>
            </div>
          ) : (
            <ScrollArea className="h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.description || "—"}</TableCell>
                      <TableCell>{template.defaultItems?.length || 0} items</TableCell>
                      <TableCell>Used {template.usage_count || 0} times</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleSelectTemplate(template)}
                        >
                          Use
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
