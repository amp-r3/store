import { ForwardedRef, forwardRef, useEffect } from 'react';
import { useIMask } from 'react-imask';
import type { FactoryOpts } from 'imask';
import { FormField, FormFieldProps } from '../form-field/FormField';

interface MaskedFormFieldProps extends Omit<FormFieldProps, 'value' | 'defaultValue' | 'onChange'> {
  maskOptions: FactoryOpts;
  value: string;
  onAccept: (unmaskedValue: string) => void;
}

const setRef = <T,>(ref: ForwardedRef<T> | undefined, node: T | null) => {
  if (!ref) return;
  if (typeof ref === 'function') ref(node);
  else ref.current = node;
};

export const MaskedFormField = forwardRef<HTMLInputElement, MaskedFormFieldProps>(
  ({ maskOptions, value, onAccept, ...rest }, forwardedRef) => {
    const { ref, unmaskedValue, setUnmaskedValue } = useIMask<HTMLInputElement>(maskOptions, {
      onAccept: (_masked, mask) => onAccept(mask.unmaskedValue),
    });

    useEffect(() => {
      if (value !== unmaskedValue) setUnmaskedValue(value ?? '');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
      <FormField
        ref={(node: HTMLInputElement | null) => {
          ref.current = node;
          setRef(forwardedRef, node);
        }}
        {...rest}
      />
    );
  }
);

MaskedFormField.displayName = 'MaskedFormField';
