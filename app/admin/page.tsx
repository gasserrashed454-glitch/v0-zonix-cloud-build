import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, HardDrive, Ticket, Activity, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get stats
  const [
    { count: totalUsers },
    { count: totalFiles },
    { count: openTickets },
    { data: recentActivity },
    { data: storageStats },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('files').select('*', { count: 'exact', head: true }),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('storage_used'),
  ])

  const totalStorage = storageStats?.reduce((acc, p) => acc + (p.storage_used || 0), 0) || 0

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const stats = [
    { 
      title: 'Total Users', 
      value: totalUsers || 0, 
      icon: Users, 
      change: '+12%',
      color: 'text-blue-600'
    },
    { 
      title: 'Total Files', 
      value: totalFiles || 0, 
      icon: FileText, 
      change: '+8%',
      color: 'text-green-600'
    },
    { 
      title: 'Storage Used', 
      value: formatBytes(totalStorage), 
      icon: HardDrive, 
      change: '+15%',
      color: 'text-purple-600'
    },
    { 
      title: 'Open Tickets', 
      value: openTickets || 0, 
      icon: Ticket, 
      change: '-5%',
      color: 'text-orange-600'
    },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Zonix Cloud instance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.ip_address || 'Unknown IP'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(activity.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
