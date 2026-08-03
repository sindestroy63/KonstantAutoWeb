"use client";

import dynamic from "next/dynamic";
import type { DialogProps } from "./Dialog";

export const LazyDialog = dynamic<DialogProps>(
  () => import("./Dialog").then((module) => module.Dialog),
  { ssr: false },
);
