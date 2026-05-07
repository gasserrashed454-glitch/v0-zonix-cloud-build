'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function SupportPanelPage() {
  const supabase = createClient()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [supportEmail, setSupportEmail] = useState('support@zonix.me')
  const [supportTickets, setSupportTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkUserRole()
    loadSupportTickets()
  }, [])

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    setUserRole(profile?.role)
  }

  const loadSupportTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setSupportTickets(data || [])
    } catch (error) {
      console.error('Error loading tickets:', error)
      toast.error('Failed to load support tickets')
    } finally {
      setIsLoading(false)
    }
  }

  if (userRole !== 'support' && userRole !== 'admin') {
    return (
      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access the Support Panel. Only support@zonix.me and admins can access this.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support Panel</h1>
        <p className="text-muted-foreground">Manage user support requests and issues</p>
      </div>

      {/* Support Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Support Account
          </CardTitle>
          <CardDescription>Official Zonix Cloud support contact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Support Email</p>
              <p className="text-lg font-semibold">{supportEmail}</p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is the official support email. Users should contact this email for support requests.
                Responses from this account represent official Zonix Cloud support.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({supportTickets.length})</CardTitle>
          <CardDescription>Recent support requests from users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading support tickets...
            </div>
          ) : supportTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No support tickets yet. Users will contact you when they need help.
            </div>
          ) : (
            <div className="space-y-4">
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground">{ticket.user_email}</p>
                    </div>
                    <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{ticket.message}</p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Privileges */}
      {userRole === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Privileges</CardTitle>
            <CardDescription>You have full system access</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                As admin (gasserrashed454@gmail.com), you have unrestricted access to all system features.
                You can manage users, view analytics, and access the complete admin panel.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
