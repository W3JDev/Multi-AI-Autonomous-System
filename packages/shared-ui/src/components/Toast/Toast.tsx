import * as React from "react";
import { cn } from "../../lib/utils";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success";
}

export function Toast({ className, variant = "default", ...props }: ToastProps) {
  const variantStyles = {
    default: "bg-background text-foreground border",
    destructive: "bg-destructive text-destructive-foreground",
    success: "bg-green-600 text-white",
  };

  return (
    <div
      className={cn(
        "rounded-lg shadow-lg p-4 min-w-[300px]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <div
      className={cn("font-semibold text-sm", className)}
      {...props}
    />
  );
}

export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <div
      className={cn("text-sm opacity-90 mt-1", className)}
      {...props}
    />
  );
}
