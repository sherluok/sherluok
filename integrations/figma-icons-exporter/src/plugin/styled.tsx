import { cx } from '^/base/css';
import { ButtonHTMLAttributes, Children, createElement, HTMLAttributes, InputHTMLAttributes, ReactElement, ReactNode, TextareaHTMLAttributes } from 'react';
import { button, checkbox, input, segmented, select } from './styled.css';

type Merge<A, B> = Omit<A, keyof B> & B;

type CheckboxProps = {
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  checked?: boolean;
  onChange?(checked: boolean): void;
};

export function Checkbox(props: CheckboxProps) {
  const { className, children, disabled = false, checked = false, onChange } = props;
  return (
    <div className={cx(checkbox.container, className)} onClick={() => onChange?.(!checked)}>
      <div className={checkbox.button({ component: 'checkbox', disabled, checked })} tabIndex={0}>
        <svg viewBox="0 0 512 512" width="1em" height="1em">
          <path fill="currentcolor" d="M173.9 439.4l-166.4-166.4c-10-10-10-26.2 0-36.2l36.2-36.2c10-10 26.2-10 36.2 0L192 312.7 432.1 72.6c10-10 26.2-10 36.2 0l36.2 36.2c10 10 10 26.2 0 36.2l-294.4 294.4c-10 10-26.2 10-36.2 0z" />
        </svg>
      </div>
      <div className={checkbox.label({ disabled })}>
        {children}
      </div>
    </div>
  );
}

type RadioProps = {
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  checked?: boolean;
  onChange?(checked: boolean): void;
};

export function Radio(props: RadioProps) {
  const { className, children, disabled = false, checked = false, onChange } = props;
  return (
    <div className={cx(checkbox.container, className)} onClick={() => onChange?.(!checked)}>
      <div className={checkbox.button({  component: 'radio',disabled, checked })} tabIndex={0}>
        <svg viewBox="0 0 512 512" width="1em" height="1em">
          <circle fill="currentcolor" cx="256" cy="256" r="200" />
        </svg>
      </div>
      <div className={checkbox.label({ disabled })}>
        {children}
      </div>
    </div>
  );
}

type ButtonProps = {
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
  pending?: boolean;
};

export function Button(props: Merge<ButtonHTMLAttributes<HTMLButtonElement>, ButtonProps>) {
  const { className, children, disabled = false, size = 'medium', color = 'secondary', pending = false, ...restProps } = props;
  return (
    <button
      className={cx(button({ disabled, color, size, pending }), className)}
      disabled={disabled}
      {...restProps}
    >{children}</button>
  );
}

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

type SelectProps<T, V> = {
  className?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  placeholder?: string;
  value?: V;
  onChange?(value: V): void;
  options: T[];
  // getKey(option: T): Key;
  getValue(option: T): V;
  children(option: T, value: V): ReactNode;
};

export function Select<T, V>(props: Merge<HTMLAttributes<HTMLElement>, SelectProps<T, V>>) {
  const { className, disabled = false, size = 'medium', placeholder, options, getValue, children, value, onChange, ...restProps } = props;
  const activeOption = typeof value !== 'undefined' ? options.find((it) => Object.is(getValue(it), value)) : undefined;

  return (
    <div
      className={cx(select.container({ disabled, size }), className)}
      tabIndex={0}
      {...restProps}
    >
      {typeof activeOption === 'undefined' ? (
        <div className={select.placeholder}>
          {placeholder}
        </div>
      ) : (
        <div className={select.body}>
          {children(activeOption, getValue(activeOption))}
        </div>
      )}
      <div className={select.indicator.container}>
        <svg className={select.indicator.svg} viewBox="0 0 320 512">
          <path fill="currentcolor" d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z" />
        </svg>
      </div>
    </div>
  );
}


type SegmentedControlProps<T> = {
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  value?: T;
  onChange?(value: T): void;
  size?: 'small' | 'medium' | 'large';
  children: ReactElement<SegmentedItemProps<T>>[];
};


export function SegmentedControl<T>(props: Merge<HTMLAttributes<HTMLElement>, SegmentedControlProps<T>>) {
  const { className, disabled = false, readOnly = false, tabIndex = 0, size = 'medium', value, onChange, children, ...restProps } = props;
  return (
    <div className={cx(segmented.control({ disabled, readOnly, size }), className)} tabIndex={tabIndex} {...restProps}>
      {Children.map(children, (node) => {
        const { className, value, ...restProps } = node.props;
        const active = props.value === node.props.value;
        return createElement('div', {
          ...restProps,
          className: cx(segmented.item({ active }), className),
          onClick: () => {
            onChange?.(value);
          },
        });
      })}
    </div>
  );
}

type SegmentedItemProps<T> = {
  className?: string;
  value: T;
};

export function SegmentedItem<T>(props: Merge<HTMLAttributes<HTMLElement>, SegmentedItemProps<T>>) {
  return <div style={{ color: 'red' }}>SHOULD ONLY BE USED AS CHILD OF <code>{"<SegmentedControl />"}</code></div>;
}
