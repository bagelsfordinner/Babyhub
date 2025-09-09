import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import styles from './Input.module.css';

interface BaseInputProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export interface InputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {}

export interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  as: 'textarea';
}

type CombinedProps = InputProps | TextareaProps;

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, CombinedProps>(
  (
    {
      label,
      helperText,
      errorText,
      required = false,
      size = 'md',
      icon,
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = !!errorText;
    const isTextarea = 'as' in props && props.as === 'textarea';

    const inputClass = [
      styles.input,
      styles[size],
      hasError && styles.error,
      icon && styles.withIcon,
      isTextarea && styles.textarea,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputElement = isTextarea ? (
      <textarea
        ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
        className={inputClass}
        aria-invalid={hasError}
        aria-describedby={helperText || errorText ? `${props.id}-description` : undefined}
        {...(props as TextareaProps)}
      />
    ) : (
      <input
        ref={ref as React.ForwardedRef<HTMLInputElement>}
        className={inputClass}
        aria-invalid={hasError}
        aria-describedby={helperText || errorText ? `${props.id}-description` : undefined}
        {...(props as InputProps)}
      />
    );

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label
            htmlFor={props.id}
            className={`${styles.label} ${required ? styles.required : ''}`}
          >
            {label}
          </label>
        )}
        <div className={styles.inputContainer}>
          {icon && <div className={styles.icon}>{icon}</div>}
          {inputElement}
        </div>
        {(helperText || errorText) && (
          <div
            id={`${props.id}-description`}
            className={errorText ? styles.errorText : styles.helperText}
          >
            {errorText || helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';