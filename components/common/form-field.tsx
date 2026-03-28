"use client";

import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type ControllerRenderProps,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  required?: boolean;
  className?: string;
  render: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode;
}

/** React Hook Form Controller + Label + 에러 메시지 통합 필드 */
export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  className,
  render,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-1.5", className)}>
          {label && (
            <Label htmlFor={String(name)}>
              {label}
              {required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
          )}
          {render(field)}
          {fieldState.error && (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
