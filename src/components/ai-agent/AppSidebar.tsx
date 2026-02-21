import {
  LayoutDashboard, Bot, Users, CalendarDays, BarChart3, Settings, Phone, Building2, ChevronDown, LogOut,
} from "lucide-react";
import { NavLink } from "@/components/ai-agent/NavLink";
import { useAuth } from "@/hooks/useAuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarSeparator,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/ai-agent/dashboard", icon: LayoutDashboard },
  { title: "Agents", url: "/ai-agent/agents", icon: Bot },
  { title: "Leads", url: "/ai-agent/leads", icon: Users },
  { title: "Appointments", url: "/ai-agent/appointments", icon: CalendarDays },
  { title: "Analytics", url: "/ai-agent/analytics", icon: BarChart3 },
];

const secondaryNav = [
  { title: "Phone Numbers", url: "/ai-agent/phone-numbers", icon: Phone },
  { title: "Settings", url: "/ai-agent/settings", icon: Settings },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/ai-agent/auth");
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Phone className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold text-sidebar-accent-foreground">Ethona</span>
            <span className="text-xs text-sidebar-foreground">Voice Agent Cloud</span>
          </div>
        </div>

        <button className="mt-4 flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent px-3 py-2 text-sm text-sidebar-accent-foreground hover:bg-sidebar-border transition-colors">
          <Building2 className="h-4 w-4" />
          <span className="flex-1 text-left truncate">My Organization</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="flex items-center gap-2" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="flex items-center gap-2" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent p-3">
          <p className="text-xs font-medium text-sidebar-accent-foreground">Starter Plan</p>
          <p className="mt-1 text-xs text-sidebar-foreground">1 of 1 agent used</p>
          <button className="mt-2 w-full rounded-md bg-sidebar-primary px-3 py-1.5 text-xs font-medium text-sidebar-primary-foreground hover:opacity-90 transition-opacity">
            Upgrade Plan
          </button>
        </div>

        {user && (
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="truncate">{user.email}</span>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
