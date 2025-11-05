import * as React from "react";
import { cn } from "../../lib/utils";
import { Label } from "../Label";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  description?: string;
}

export function FormField({
  className,
  label,
  error,
  required,
  description,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && <FormError>{error}</FormError>}
    </div>
  );
}

export interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function FormError({ className, children, ...props }: FormErrorProps) {
  if (!children) return null;
  
  return (
    <p
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export interface FormLabelProps
  extends React.ComponentPropsWithoutRef<typeof Label> {
  required?: boolean;
}

export function FormLabel({ children, required, ...props }: FormLabelProps) {
  return (
    <Label {...props}>
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
}
