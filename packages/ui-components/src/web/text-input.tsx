import { cx } from '^/common/css';
import { Merge } from '^/common/type';
import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { input } from './text-input.css';

type TextInputProps = {
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  value?: string;
  onChange?(value: string): void;
  size?: 'small' | 'medium' | 'large';
};

export function TextInput(props: Merge<InputHTMLAttributes<HTMLInputElement>, TextInputProps>) {
  const { className, disabled = false, readOnly = false, size = 'medium', value = '', onChange, ...restProps } = props;
  return (
    <input
      className={cx(input({ component: 'input', disabled, readOnly, size }), className)}
      disabled={disabled}
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      {...restProps}
    />
  );
}

type TextAreaProps = {
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  value?: string;
  onChange?(value: string): void;
  size?: 'small' | 'medium' | 'large';
};

export function TextArea(props: Merge<TextareaHTMLAttributes<HTMLTextAreaElement>, TextAreaProps>) {
  const { className, disabled = false, readOnly = false, size = 'medium', value = '', onChange, ...restProps } = props;
  return (
    <textarea
      className={cx(input({ component: 'textarea', disabled, readOnly, size }), className)}
      disabled={disabled}
      readOnly={readOnly}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      {...restProps}
    />
  );
}
