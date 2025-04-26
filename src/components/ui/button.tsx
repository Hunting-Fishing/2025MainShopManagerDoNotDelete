
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Available button color variants:
 * - default: uses primary color
 * - esm: uses esm-blue for bold accent actions
 * - secondary: uses secondary/background roles
 * - destructive: uses red/destructive color
 * - outline: white background, colored border
 * - ghost: minimal, for subtle clickable regions
 * - link: text-like
 *
 * Default button shape is pill, shadowed.
 * Use .xs, .sm, .default, .lg, .icon for sizing.
 *
 * Avoid custom className for color—prefer a variant.
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium " +
    "ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        esm:
          "bg-esm-blue-600 text-white hover:bg-esm-blue-700 focus-visible:ring-esm-blue-700",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-white text-gray-800 hover:bg-esm-blue-50 hover:border-esm-blue-200 hover:text-esm-blue-700",
        ghost:
          "hover:bg-gray-100 text-gray-700",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto min-w-0 bg-transparent shadow-none",
        accent:
          "bg-vivid-purple text-white hover:bg-magenta-pink focus-visible:ring-vivid-purple",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10 p-0",
        xs: "h-6 px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Prefer passing a variant and size instead of className for color/shape.
 * If you need custom style, use className in addition.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

