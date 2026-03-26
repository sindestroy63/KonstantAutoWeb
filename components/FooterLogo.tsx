"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { BRAND } from "@/lib/constants";

export function FooterLogo() {
  const [showText, setShowText] = useState(false);
  const [src, setSrc] = useState<string>(BRAND.logoFooter);

  const onError = useCallback(() => {
    if (src === BRAND.logoFooter && BRAND.logoFooterAlt) {
      setSrc(BRAND.logoFooterAlt);
    } else {
      setShowText(true);
    }
  }, [src]);

  if (showText) {
    return (
      <Link href="/" className="inline-block focus:outline-none">
        <span className="text-xl font-bold tracking-wide text-white">
          KONSTANT<span className="text-[#c40000]">AUTO</span>
        </span>
      </Link>
    );
  }

  return (
    <Link href="/" className="inline-block focus:outline-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="KONSTANT AUTO"
        className="h-[26px] md:h-[30px] w-auto object-contain object-left"
        onError={onError}
      />
    </Link>
  );
}
