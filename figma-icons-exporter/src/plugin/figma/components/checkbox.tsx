import { cx } from '^/base/web/css';
import { ReactNode } from 'react';
import { checkbox } from './checkbox.css';

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
