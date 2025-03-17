import { Merge } from '^/base/common/type';
import { cx } from '^/base/web/css';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { button } from './button.css';

type ButtonProps = {
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
};

export function Button(props: Merge<ButtonHTMLAttributes<HTMLButtonElement>, ButtonProps>) {
  const { className, children, disabled = false, size = 'medium', color = 'secondary', ...restProps } = props;
  return (
    <button
      className={cx(button({ disabled, color, size }), className)}
      disabled={disabled}
      {...restProps}
    >{children}</button>
  );
}
