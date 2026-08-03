import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./tokens.module.css";

export type DesignSystemProviderProps = HTMLAttributes<HTMLElement> & {
  as?: Extract<ElementType, "div" | "main" | "section" | "header" | "footer">;
  children: ReactNode;
};

export function DesignSystemProvider({
  as: Component = "div",
  className,
  children,
  ...props
}: DesignSystemProviderProps) {
  return (
    <Component className={cx(styles.root, className)} {...props}>
      {children}
    </Component>
  );
}
