"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
      ? `${basePath}/webmarker-dark.png`
      : `${basePath}/webmarker-light.png`;

  return (
    <img src={logoSrc} alt="WebMarker" width={500} height={192} />
  );
}
