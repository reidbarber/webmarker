"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Logo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  let systemAndDark = false;
  if (theme === "system") {
    systemAndDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  const logoSrc =
    theme === "dark" || systemAndDark
      ? "/webmarker-dark.png"
      : "/webmarker-light.png";

  return (
    <Image priority src={logoSrc} alt="WebMarker" width={500} height={192} />
  );
}
