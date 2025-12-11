"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavigationWrapper() {
  const pathname = usePathname();
  const hiddenPaths = ["/login", "/signup"];

  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
