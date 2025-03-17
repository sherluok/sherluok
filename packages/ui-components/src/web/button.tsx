import { cx } from '^/common/css';
import { Merge } from '^/common/type';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import './animation.css';
import { button } from './button.css';

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
