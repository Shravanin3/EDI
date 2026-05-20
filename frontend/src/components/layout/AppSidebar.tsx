import {
  LayoutDashboard, AlertTriangle, ScanSearch, FolderTree, Code2, Network, FlaskConical,
  Clock, TrendingDown, GitPullRequest, PieChart, BookOpen, CalendarSearch, Search, User
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from '@/components/ui/sidebar';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { title: 'Security Posture', url: '/', icon: LayoutDashboard },
      { title: 'Recent Anomalies', url: '/anomalies', icon: AlertTriangle },
    ],
  },
  {
    label: 'Code Reconciliation',
    items: [
      { title: 'Repository Scanner', url: '/scanner', icon: ScanSearch },
      { title: 'Workspace Tree', url: '/workspace', icon: FolderTree },
      { title: 'Code Inspector', url: '/inspector', icon: Code2 },
    ],
  },
  {
    label: 'Blast Radius',
    items: [
      { title: 'Shadow Graph', url: '/graph', icon: Network },
      { title: 'Exposure Simulator', url: '/simulator', icon: FlaskConical },
    ],
  },
  {
    label: 'Temporal Risk',
    items: [
      { title: 'JIT Policies', url: '/policies', icon: Clock },
      { title: 'Scope Decay', url: '/decay', icon: TrendingDown },
    ],
  },
  {
    label: 'Remediation',
    items: [
      { title: 'Pull Requests', url: '/pull-requests', icon: GitPullRequest },
      { title: 'Friction Analytics', url: '/friction', icon: PieChart },
    ],
  },
  {
    label: 'Audit & Compliance',
    items: [
      { title: 'Scope Ledger', url: '/ledger', icon: BookOpen },
      { title: 'Time Forensics', url: '/forensics', icon: CalendarSearch },
    ],
  },
];

export default function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarContent>
        <div className="px-4 py-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">ZT</span>
              </div>
              <span className="text-sm font-semibold text-foreground">ZeroTrust Audit</span>
            </div>
          )}
          {collapsed && (
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center mx-auto">
              <span className="text-xs font-bold text-primary-foreground">ZT</span>
            </div>
          )}
        </div>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium px-4">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/'}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
