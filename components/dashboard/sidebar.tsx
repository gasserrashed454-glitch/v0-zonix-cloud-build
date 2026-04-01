'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { ZonixLogo } from '@/components/zonix-logo'
import { Progress } from '@/components/ui/progress'
import { formatBytes, type Profile } from '@/lib/types'
import {
  Home,
  Files,
  FolderOpen,
  Star,
  Share2,
  Trash2,
  Clock,
  HelpCircle,
  Settings,
  Sparkles,
  GraduationCap,
  Crown,
  Shield,
} from 'lucide-react'

interface DashboardSidebarProps {
  profile: Profile
}

const mainNav = [
  { title: 'Home', href: '/dashboard', icon: Home },
  { title: 'My Files', href: '/dashboard/files', icon: Files },
  { title: 'Recent', href: '/dashboard/recent', icon: Clock },
  { title: 'Favorites', href: '/dashboard/favorites', icon: Star },
  { title: 'Shared', href: '/dashboard/shared', icon: Share2 },
  { title: 'Trash', href: '/dashboard/trash', icon: Trash2 },
]

const aiNav = [
  { title: 'AI Assistant', href: '/dashboard/ai', icon: Sparkles },
]

const bottomNav = [
  { title: 'Support', href: '/support', icon: HelpCircle },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const tierIcons = {
  free: null,
  student: GraduationCap,
  premium: Crown,
  enterprise: Shield,
}

const tierColors = {
  free: 'text-muted-foreground',
  student: 'text-green-600',
  premium: 'text-amber-500',
  enterprise: 'text-primary',
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const storagePercent = (profile.storage_used / profile.storage_limit) * 100
  const TierIcon = tierIcons[profile.tier]

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <ZonixLogo size="md" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>AI Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin / Support links */}
        {(profile.role === 'admin' || profile.role === 'mod' || profile.role === 'support') && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {profile.role === 'admin' && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.startsWith('/admin')}>
                        <Link href="/admin">
                          <Shield className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {(profile.role === 'admin' || profile.role === 'mod' || profile.role === 'support') && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname.startsWith('/support-panel')}>
                        <Link href="/support-panel">
                          <HelpCircle className="h-4 w-4" />
                          <span>Support Panel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        {/* Storage indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Storage</span>
            <span className="font-medium">
              {formatBytes(profile.storage_used)} / {formatBytes(profile.storage_limit)}
            </span>
          </div>
          <Progress value={storagePercent} className="h-1.5" />
        </div>

        {/* Tier badge */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            {TierIcon && <TierIcon className={`h-4 w-4 ${tierColors[profile.tier]}`} />}
            <span className="text-sm font-medium capitalize">{profile.tier}</span>
          </div>
          {profile.tier === 'free' && (
            <Link href="/pricing" className="text-xs text-primary hover:underline">
              Upgrade
            </Link>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
