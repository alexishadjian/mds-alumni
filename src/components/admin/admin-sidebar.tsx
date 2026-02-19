'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { CalendarDays, Users, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { mydigitalschoollogo } from '@/public/assets';

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Membres', href: '/admin/members', icon: Users },
  { title: 'Promotions', href: '/admin/promotions', icon: CalendarDays },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r-0">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -top-16 -left-8 size-[260px] rounded-full bg-[#2CB8C5]/10 blur-[70px]" />
      <div className="pointer-events-none absolute bottom-16 -right-8 size-[220px] rounded-full bg-[#662483]/12 blur-[70px]" />

      {/* Dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <SidebarHeader className="relative z-10 border-b border-white/6 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/admin" className="flex items-center">
            <Image
              src={mydigitalschoollogo}
              alt="My Digital School"
              width={130}
              height={40}
              className="h-7 w-auto brightness-0 invert opacity-80"
            />
          </Link>
          <SidebarTrigger className="shrink-0 text-white/30 hover:bg-white/6 hover:text-white/70" />
        </div>
      </SidebarHeader>

      <SidebarContent className="relative z-10 px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.15em] text-white/22">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.href}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-[#2CB8C5]/14 text-[#2CB8C5]'
                            : 'text-white/45 hover:bg-white/5 hover:text-white/75'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#2CB8C5] shadow-[0_0_10px_#2CB8C5]" />
                        )}
                        <item.icon
                          className={`size-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                            isActive ? 'text-[#2CB8C5]' : ''
                          }`}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="relative z-10 border-t border-white/6 px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-[11px] font-medium text-white/28 transition-colors hover:text-[#2CB8C5]"
        >
          <ArrowLeft className="size-3.5" />
          Retour au site
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
