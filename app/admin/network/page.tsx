import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, MapPin, Smartphone, Clock } from 'lucide-react'

interface LoginLocation {
  ip: string
  location: string
  device: string
  lastLogin: string
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function NetworkMonitoringPage() {
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from('activity_logs')
    .select('*, profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Group activities by IP and user
  const networkMap = new Map<string, LoginLocation>()
  
  activities?.forEach((activity) => {
    if (activity.ip_address) {
      const profile = activity.profiles as { email: string; full_name: string | null } | null
      const key = `${activity.user_id}-${activity.ip_address}`
      
      networkMap.set(key, {
        ip: activity.ip_address,
        location: activity.location || 'Unknown',
        device: activity.user_agent?.split('(')[1]?.split(')')[0] || 'Unknown',
        lastLogin: formatDate(activity.created_at),
      })
    }
  })

  const uniqueIPs = new Set(activities?.map(a => a.ip_address).filter(Boolean))
  const recentLocations = Array.from(new Set(activities?.map(a => a.location).filter(Boolean)))

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Network Monitoring</h1>
        <p className="text-muted-foreground">Track user locations, IPs, and login patterns</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueIPs.size}</div>
            <p className="text-xs text-muted-foreground">Active in last 50 activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentLocations.length}</div>
            <p className="text-xs text-muted-foreground">Tracked regions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Last 50 records</p>
          </CardContent>
        </Card>
      </div>

      {/* Login Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Recent Login Locations
          </CardTitle>
          <CardDescription>Geographic login data from activity logs</CardDescription>
        </CardHeader>
        <CardContent>
          {activities && activities.length > 0 ? (
            <div className="space-y-3">
              {Array.from(networkMap.values()).slice(0, 20).map((location, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        {location.device}
                      </p>
                      <p className="text-sm text-muted-foreground">{location.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-muted-foreground">{location.ip}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                      <Clock className="h-3 w-3" />
                      {location.lastLogin}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No login locations tracked yet</p>
          )}
        </CardContent>
      </Card>

      {/* Unique IPs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Active IP Addresses
          </CardTitle>
          <CardDescription>IPs with recent user activity</CardDescription>
        </CardHeader>
        <CardContent>
          {uniqueIPs.size > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from(uniqueIPs).map((ip) => (
                <Badge key={ip} variant="outline" className="font-mono">
                  {ip}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No IP addresses tracked yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
