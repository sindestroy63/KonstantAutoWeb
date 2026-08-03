import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../core/cx";
import styles from "./Layout.module.css";

export type Space = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
type Align = "start" | "center" | "end";
type Justify = Align | "between";

const gapClasses: Record<Space, string> = {
  1: styles.gap1,
  2: styles.gap2,
  3: styles.gap3,
  4: styles.gap4,
  5: styles.gap5,
  6: styles.gap6,
  8: styles.gap8,
  10: styles.gap10,
  12: styles.gap12,
  16: styles.gap16,
};

const alignClasses: Record<Align, string> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
};

const justifyClasses: Record<Justify, string> = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
};

export function Container({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(styles.container, className)} {...props}>{children}</div>;
}

export function ReadingWidth({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(styles.reading, className)} {...props}>{children}</div>;
}

export type SectionProps = HTMLAttributes<HTMLElement> & {
  tone?: "canvas" | "surface" | "inverse" | "transparent";
  children: ReactNode;
};

export function Section({ tone = "transparent", className, children, ...props }: SectionProps) {
  return <section className={cx(styles.section, styles[tone], className)} {...props}>{children}</section>;
}

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  gap?: Space;
  align?: Align;
};

export function Stack({ gap = 4, align = "start", className, children, ...props }: StackProps) {
  return <div className={cx(styles.stack, gapClasses[gap], alignClasses[align], className)} {...props}>{children}</div>;
}

export type ClusterProps = HTMLAttributes<HTMLDivElement> & {
  gap?: Space;
  align?: Align;
  justify?: Justify;
};

export function Cluster({ gap = 3, align = "center", justify = "start", className, children, ...props }: ClusterProps) {
  return <div className={cx(styles.cluster, gapClasses[gap], alignClasses[align], justifyClasses[justify], className)} {...props}>{children}</div>;
}

export type ResponsiveGridProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "ul";
  gap?: Space;
  minItemWidth?: "compact" | "standard" | "wide";
};

const gridWidthClasses = {
  compact: styles.gridCompact,
  standard: styles.gridStandard,
  wide: styles.gridWide,
} as const;

export function ResponsiveGrid({ as: Component = "div", gap = 6, minItemWidth = "standard", className, children, ...props }: ResponsiveGridProps) {
  return <Component className={cx(styles.grid, gridWidthClasses[minItemWidth], gapClasses[gap], className)} {...props}>{children}</Component>;
}
