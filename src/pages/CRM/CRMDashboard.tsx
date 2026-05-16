import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { crmManagerAPI } from '../../lib/api'
import { Users, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CRMDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await crmManagerAPI.getStatistics()
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error: any) {
      toast.error('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage captains and technicians
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Captains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.captains?.total || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats?.captains?.approved || 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Pending Captain Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.captains?.pending || 0}
            </div>
            <Button
              className="mt-2"
              size="sm"
              variant="outline"
              onClick={() => navigate('/crm/captains')}
            >
              Review Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Technicians
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.technicians?.total || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats?.technicians?.approved || 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Pending Technician Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.technicians?.pending || 0}
            </div>
            <Button
              className="mt-2"
              size="sm"
              variant="outline"
              onClick={() => navigate('/crm/technicians')}
            >
              Review Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats?.totalPendingApprovals || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Captain Management
            </CardTitle>
            <CardDescription>
              Review and approve captain applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/crm/captains')}>
              View Captains
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Technician Management
            </CardTitle>
            <CardDescription>
              Review and approve technician applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/crm/technicians')}>
              View Technicians
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
