"use client";

import * as React from "react";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { CiBrightnessUp , CiDark } from "react-icons/ci";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; 

  return theme === "light" ? (
    <div onClick={toggleTheme}>
      <CiBrightnessUp className="text-yellow-500 text-3xl" />
    </div>
  ) : (
    <div onClick={toggleTheme}>
      <CiDark className="text-white text-3xl" />
    </div>
  );
}
