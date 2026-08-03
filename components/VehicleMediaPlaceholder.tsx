import { ImageIcon } from "lucide-react";
import { cx } from "@/components/ui-v2/core/cx";
import styles from "./VehicleMediaPlaceholder.module.css";

type Props = {
  vehicleName: string;
  mode?: "fill" | "landscape";
  className?: string;
};

export function VehicleMediaPlaceholder({ vehicleName, mode = "fill", className }: Props) {
  return (
    <div className={cx(styles.placeholder, styles[mode], className)} role="img" aria-label={`AI-изображение ${vehicleName} готовится`}>
      <ImageIcon aria-hidden="true" />
      <span>AI-изображение готовится</span>
    </div>
  );
}
