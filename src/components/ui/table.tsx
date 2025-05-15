
import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    colorRows?: boolean;
  }
>(({ className, colorRows = false, ...props }, ref) => {
  // Add an additional class for striped rows when colorRows is true
  const bodyClass = colorRows 
    ? "[&_tr:nth-of-type(even)]:bg-slate-50 [&_tr:nth-of-type(odd)]:bg-white [&_tr:last-child]:border-0"
    : "[&_tr:last-child]:border-0";
    
  return (
    <tbody
      ref={ref}
      className={cn(bodyClass, className)}
      {...props}
    />
  );
})
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    colorIndex?: number;
  }
>(({ className, colorIndex, ...props }, ref) => {
  // Define an array of background color classes
  const rowColors = [
    "hover:bg-blue-50/80 bg-blue-50/30",
    "hover:bg-green-50/80 bg-green-50/30",
    "hover:bg-purple-50/80 bg-purple-50/30",
    "hover:bg-amber-50/80 bg-amber-50/30",
    "hover:bg-pink-50/80 bg-pink-50/30",
    "hover:bg-indigo-50/80 bg-indigo-50/30",
    "hover:bg-sky-50/80 bg-sky-50/30",
    "hover:bg-emerald-50/80 bg-emerald-50/30",
  ];

  // If colorIndex is provided, use it to select a background color
  const colorClass = colorIndex !== undefined 
    ? rowColors[colorIndex % rowColors.length]
    : "hover:bg-muted/50";

  return (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors data-[state=selected]:bg-muted",
        colorClass,
        className
      )}
      {...props}
    />
  );
})
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
