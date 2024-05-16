"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Logo() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const logoSrc =
    theme === "dark" ? "/webmarker-dark.png" : "/webmarker-light.png";

  return <Image src={logoSrc} alt="Logo" width={500} height={400} />;
}
