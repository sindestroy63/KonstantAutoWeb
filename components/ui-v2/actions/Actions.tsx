import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../core/cx";
import styles from "./Actions.module.css";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "inverse" | "danger";
export type ButtonSize = "small" | "medium";

export type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export function buttonClassName({ variant = "primary", size = "medium", fullWidth = false, className }: ButtonStyleOptions = {}) {
  return cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions & { children: ReactNode };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, fullWidth, className, type = "button", children, ...props },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClassName({ variant, size, fullWidth, className })} {...props}>{children}</button>;
});

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonStyleOptions & { href: string; children: ReactNode };

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant, size, fullWidth, className, children, ...props },
  ref,
) {
  return <a ref={ref} className={buttonClassName({ variant, size, fullWidth, className })} {...props}>{children}</a>;
});

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  label: string;
  icon: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, icon, className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} aria-label={label} title={props.title ?? label} className={cx(styles.iconButton, className)} {...props}>{icon}</button>;
});
