import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl text-sm font-medium md:transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-slate-900 hover:translate-y-[-1px] hover:opacity-90",
        secondary: "bg-card text-text-primary hover:bg-slate-800",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-slate-800/40",
        danger: "bg-rose-500 text-white hover:bg-rose-600",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
  }
);

Button.displayName = "Button";
