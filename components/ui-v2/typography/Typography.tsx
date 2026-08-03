import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../core/cx";
import styles from "./Typography.module.css";

type HeadingVariant = "display" | "h1" | "h2" | "h3" | "h4";
type HeadingElement = "h1" | "h2" | "h3" | "h4" | "p";

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingElement;
  variant?: HeadingVariant;
  children: ReactNode;
};

export function Heading({ as: Component = "h2", variant = "h2", className, children, ...props }: HeadingProps) {
  return <Component className={cx(styles.heading, styles[variant], className)} {...props}>{children}</Component>;
}

type TextSize = "large" | "body" | "small" | "label";
type TextTone = "default" | "muted" | "accent" | "inherit";
type TextWeight = "regular" | "medium" | "semibold";

export type TextProps = HTMLAttributes<HTMLElement> & {
  as?: "p" | "span" | "div";
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
  children: ReactNode;
};

export function Text({ as: Component = "p", size = "body", tone = "default", weight = "regular", className, children, ...props }: TextProps) {
  return <Component className={cx(styles.text, styles[size], tone !== "default" && styles[tone], weight !== "regular" && styles[weight], className)} {...props}>{children}</Component>;
}

export function Eyebrow({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx(styles.eyebrow, className)} {...props}>{children}</p>;
}
