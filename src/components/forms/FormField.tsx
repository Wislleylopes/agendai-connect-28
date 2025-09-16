import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  formatter?: (value: string) => string;
  rows?: number;
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  ({ 
    label, 
    type = "text", 
    placeholder, 
    value, 
    onChange, 
    error, 
    required, 
    disabled,
    maxLength,
    className,
    formatter,
    rows,
    ...props 
  }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let newValue = e.target.value;
      
      if (formatter) {
        newValue = formatter(newValue);
      }
      
      if (maxLength && newValue.length > maxLength) {
        newValue = newValue.slice(0, maxLength);
      }
      
      onChange?.(newValue);
    };

    const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={fieldId} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {rows ? (
          <Textarea
            id={fieldId}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            maxLength={maxLength}
            rows={rows}
            className={cn(
              "w-full",
              error && "border-destructive focus:border-destructive"
            )}
            {...props}
          />
        ) : (
          <Input
            id={fieldId}
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            maxLength={maxLength}
            className={cn(
              "w-full",
              error && "border-destructive focus:border-destructive"
            )}
            {...props}
          />
        )}
        
        {maxLength && value && (
          <div className="text-xs text-muted-foreground text-right">
            {value.length}/{maxLength}
          </div>
        )}
        
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";