import type { HTMLAttributes, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cx } from "../core/cx";
import styles from "./Feedback.module.css";

export type StatusTone = "neutral" | "accent" | "success" | "warning" | "danger";

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone;
  children: ReactNode;
};

export function StatusBadge({ tone = "neutral", className, children, ...props }: StatusBadgeProps) {
  return <span className={cx(styles.status, styles[tone], className)} {...props}>{children}</span>;
}

type AlertTone = "info" | "success" | "warning" | "danger";
const alertIcons = { info: Info, success: CheckCircle2, warning: TriangleAlert, danger: AlertCircle } as const;
const alertClasses = { info: styles.alertInfo, success: styles.alertSuccess, warning: styles.alertWarning, danger: styles.alertDanger } as const;

export type InlineAlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
};

export function InlineAlert({ tone = "info", title, className, children, ...props }: InlineAlertProps) {
  const Icon = alertIcons[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cx(styles.alert, alertClasses[tone], className)} {...props}>
      <Icon className={styles.alertIcon} aria-hidden="true" />
      <div><p className={styles.alertTitle}>{title}</p>{children ? <div className={styles.alertBody}>{children}</div> : null}</div>
    </div>
  );
}
