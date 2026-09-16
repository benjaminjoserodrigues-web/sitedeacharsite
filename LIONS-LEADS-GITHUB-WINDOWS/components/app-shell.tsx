"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, Search, Settings, Users } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect } from "react";
import { getSettings } from "@/lib/storage";

const links = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/search", label: "Buscar empresas", icon: Search },
  { href: "/leads", label: "Meus leads", icon: Users },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => { document.documentElement.classList.toggle("dark", getSettings().theme === "dark"); }, []);
  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" className="border-r border-zinc-800">
        <SidebarHeader className="border-b border-zinc-800 p-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Lions Leads">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-400 text-zinc-950 shadow-[0_0_24px_rgba(251,191,36,.18)]"><Building2 className="size-5" /></span>
            <span><strong className="block text-[15px] tracking-tight text-white">Lions Leads</strong><small className="text-xs text-zinc-400">Lions Corporation</small></span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-3 pt-5">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {links.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild isActive={pathname === href} className="h-11 rounded-xl px-3 text-[15px] data-[active=true]:bg-amber-400 data-[active=true]:font-semibold data-[active=true]:text-zinc-950">
                      <Link href={href}><Icon className="size-[18px]" /><span>{label}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-zinc-800 p-5 text-xs leading-relaxed text-zinc-500">
          Dados abertos do OpenStreetMap.<br />Nenhuma mensagem é enviada automaticamente.
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/90 px-4 backdrop-blur md:hidden">
          <SidebarTrigger className="mr-3" /><strong className="text-sm">Lions Leads</strong>
        </header>
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

