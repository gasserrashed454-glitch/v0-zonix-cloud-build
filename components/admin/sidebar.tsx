'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ZonixLogo } from '@/components/zonix-logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  HardDrive, 
  FileText, 
  Settings, 
  Shield,
  Ticket,
  ArrowLeft,
  Globe,
  Database
} from 'lucide-react'

interface AdminSidebarProps {
  userRole: string
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { 
      title: 'Dashboard', 
      href: '/admin', 
      icon: LayoutDashboard,
      roles: ['admin', 'mod', 'support']
    },
    { 
      title: 'Users', 
      href: '/admin/users', 
      icon: Users,
      roles: ['admin', 'mod']
    },
    { 
      title: 'Activity Logs', 
      href: '/admin/activity', 
      icon: Activity,
      roles: ['admin', 'mod']
    },
    { 
      title: 'Files', 
      href: '/admin/files', 
      icon: FileText,
      roles: ['admin']
    },
    { 
      title: 'Tickets', 
      href: '/admin/tickets', 
      icon: Ticket,
      roles: ['admin', 'mod', 'support']
    },
    { 
      title: 'Network', 
      href: '/admin/network', 
      icon: Globe,
      roles: ['admin']
    },
    { 
      title: 'Storage', 
      href: '/admin/storage', 
      icon: Database,
      roles: ['admin']
    },
    { 
      title: 'Settings', 
      href: '/admin/settings', 
      icon: Settings,
      roles: ['admin']
    },
  ]

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole))

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-4 py-3">
          <ZonixLogo className="h-8 w-8" />
          <div className="flex flex-col">
            <span className="font-semibold">Zonix Cloud</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin Panel
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
