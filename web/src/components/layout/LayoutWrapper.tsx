"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const loginRoute =
    (pathname?.startsWith("/login") ?? false) ||
    (pathname?.startsWith("/sign-up") ?? false);

  return (
    <>
      {!isAdminRoute && !loginRoute && <Header />}
      <main>{children}</main>
      {!isAdminRoute && !loginRoute && <Footer />}
    </>
  );
}
