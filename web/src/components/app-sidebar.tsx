//@ts-nocheck
"use client"

import * as React from "react"
import { useEffect } from "react"
import {
  IconDashboard,
  IconListDetails,
  IconSettings,
  IconPlus
} from "@tabler/icons-react"
import { FaDollarSign } from "react-icons/fa6";

import { NavMain } from "@/components/nav-main"
import { NavDocuments } from "@/components/nav-documents"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TbUsers, TbUsersPlus, TbHome2 } from "react-icons/tb";
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const data = {
  navMain: [
    {
      title: "Home",
      url: "/admin",
      icon: TbHome2, 
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: IconListDetails,
    },
    {
      title: "Add Product",
      url: "/admin/products/addProducts",
      icon: IconPlus,
    },
    {
      title: "Discounts",
      url: "/admin/products/discounts",
      icon: FaDollarSign,
    },
 
  ],
  documents: [
    {
      title: "Users",
      url: "/admin/users/allUsers",
      icon: TbUsers,
    },
    {
      title: "Add Users",
      url: "/admin/users/newUsers",
      icon: TbUsersPlus,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { 
    data: session, 
    isPending,
    error, 
    refetch 
    } = authClient.useSession() 

  useEffect (() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
    
  }, [session, isPending, error, refetch, router]);

  const user = session?.user;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
              {/* Use a ternary operator to display logo or business name  */}
                <span className="text-base font-semibold logo">J'S Ashantis</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ 
          name: user?.name ?? "",
          email: user?.email ?? "",
          image: user?.image ?? "", // fallback to empty string if null/undefined
        }}/>
      </SidebarFooter>
    </Sidebar>
  )
}
