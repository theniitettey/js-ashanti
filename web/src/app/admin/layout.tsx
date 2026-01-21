import { Lato } from "next/font/google";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { headers } from "next/headers";
import { redirect } from "next/navigation";


const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

export default async function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {

  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";

  // Get session from backend
  const sessionRes = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
    headers: { cookie },
  });
  const session = await sessionRes.json();
  if (!session) return redirect("/login");

  // Check if user is admin
  if (session.user.role !== "admin") return redirect("/");

    return (
        <div className={`${lato.variable} antialiased`}>
          <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
          <SiteHeader />
          {children}
          </SidebarInset>
        </SidebarProvider>
      </div>
    );
}
  