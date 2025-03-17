import { Merge } from '^/base/common/type';
import { cx } from '^/base/web/css';
import { HTMLAttributes, ReactNode } from 'react';
import { select } from './select.css';

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

