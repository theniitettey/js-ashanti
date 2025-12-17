import { Lato } from "next/font/google";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
    title: "Admin Dashboard",
  };
  
export default async function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {

  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/login");

  const { success } = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: { Dashboard: ["create", "update", "delete"] },
    },
  });

  if (!success) redirect("/");

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
  