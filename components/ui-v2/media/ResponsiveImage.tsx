import Image, { type ImageProps } from "next/image";
import { cx } from "../core/cx";
import styles from "./ResponsiveImage.module.css";

export type ResponsiveImageProps = Omit<ImageProps, "fill"> & {
  ratio?: "landscape" | "editorial" | "square" | "none";
  fit?: "cover" | "contain";
  rounded?: boolean;
  frameClassName?: string;
};

export function ResponsiveImage({ ratio = "landscape", fit = "cover", rounded = false, frameClassName, className, sizes, alt, ...props }: ResponsiveImageProps) {
  return (
    <div className={cx(styles.frame, styles[ratio], rounded && styles.rounded, frameClassName)}>
      <Image fill sizes={sizes} alt={alt} className={cx(styles.image, styles[fit], className)} {...props} />
    </div>
  );
}
