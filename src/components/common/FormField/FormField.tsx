import { InputHTMLAttributes, forwardRef } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, ...props}, ref) => (
    <div>
      <label>{label}</label>
      <input 
      ref={ref}
      {...props} 
      />
      {error && <span>{error}</span>}
    </div>
  )
)

FormField.displayName = 'FormField'