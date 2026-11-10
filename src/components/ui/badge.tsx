import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white hover:bg-slate-800",
        secondary:
          "bg-slate-100 text-slate-800 hover:bg-slate-200/80 border border-slate-200",
        destructive:
          "bg-rose-50 text-rose-700 border border-rose-200",
        outline:
          "border border-slate-200 text-slate-700 bg-white",
        success:
          "bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs",
        warning:
          "bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs",
        info:
          "bg-blue-50 text-blue-800 border border-blue-200/80 shadow-2xs",
        purple:
          "bg-purple-50 text-purple-800 border border-purple-200/80 shadow-2xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

