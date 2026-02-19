import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={
        {
          '--sidebar': '#0b0e1a',
          '--sidebar-foreground': 'rgba(255,255,255,0.85)',
          '--sidebar-border': 'rgba(255,255,255,0.06)',
          '--sidebar-accent': 'rgba(44,184,197,0.12)',
          '--sidebar-accent-foreground': '#2CB8C5',
          '--sidebar-primary': '#2CB8C5',
          '--sidebar-primary-foreground': 'rgba(255,255,255,0.9)',
          '--sidebar-ring': 'rgba(44,184,197,0.3)',
          '--sidebar-muted': 'rgba(255,255,255,0.04)',
          '--sidebar-muted-foreground': 'rgba(255,255,255,0.35)',
        } as React.CSSProperties
      }
    >
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <main className="min-h-svh bg-[#f8f9fc] p-6 md:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
