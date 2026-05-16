import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  MapPin,
  Headphones,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { userManagementAPI, crmManagerAPI } from '../../lib/api'
import toast from 'react-hot-toast'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div
            className={`flex items-center mt-2 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
          >
            <TrendingUp
              className={`h-3 w-3 mr-1 ${!trend.isPositive && 'rotate-180'}`}
            />
            <span>{trend.value}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [stats, setStats] = useState({
    adminStats: null as any,
    crmStats: null as any,
    regionalStats: null as any,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('adminUser')
    if (user) {
      setUserInfo(JSON.parse(user))
    }
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setIsLoading(true)
    try {
      const [adminStatsRes, crmStatsRes] = await Promise.allSettled([
        userManagementAPI.getStatistics(),
        crmManagerAPI.getStatistics(),
      ])

      setStats({
        adminStats:
          adminStatsRes.status === 'fulfilled'
            ? adminStatsRes.value.data.data
            : null,
        crmStats:
          crmStatsRes.status === 'fulfilled'
            ? crmStatsRes.value.data.data
            : null,
        regionalStats: null,
      })
    } catch (error: any) {
      console.error('Error fetching statistics:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  const role = userInfo?.role || 'admin'
  const isSuperAdmin = role === 'super_admin' || role === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {userInfo?.email?.split('@')[0] || 'Admin'}
        </p>
      </div>

      {/* Super Admin Stats */}
      {isSuperAdmin && stats.adminStats && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">User Management Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Admin Users"
              value={stats.adminStats.totalAdmins || 0}
              icon={<Users className="h-4 w-4" />}
              description="All admin accounts"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.adminStats.pendingApprovals || 0}
              icon={<Clock className="h-4 w-4" />}
              description="Awaiting review"
            />
            <StatCard
              title="Regional Managers"
              value={stats.adminStats.regionalManagers || 0}
              icon={<MapPin className="h-4 w-4" />}
              description="Active managers"
            />
            <StatCard
              title="CRM Managers"
              value={stats.adminStats.crmManagers || 0}
              icon={<Headphones className="h-4 w-4" />}
              description="Active managers"
            />
          </div>
        </div>
      )}

      {/* CRM Stats */}
      {(isSuperAdmin || role === 'crm_manager') && stats.crmStats && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">CRM Overview</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Captains"
              value={stats.crmStats.captains?.total || 0}
              icon={<Users className="h-4 w-4" />}
              description={`${stats.crmStats.captains?.approved || 0} approved`}
            />
            <StatCard
              title="Pending Captain Approvals"
              value={stats.crmStats.captains?.pending || 0}
              icon={<Clock className="h-4 w-4" />}
              description="Awaiting review"
            />
            <StatCard
              title="Total Technicians"
              value={stats.crmStats.technicians?.total || 0}
              icon={<UserCheck className="h-4 w-4" />}
              description={`${stats.crmStats.technicians?.approved || 0} approved`}
            />
            <StatCard
              title="Pending Technician Approvals"
              value={stats.crmStats.technicians?.pending || 0}
              icon={<Clock className="h-4 w-4" />}
              description="Awaiting review"
            />
            <StatCard
              title="Total Pending"
              value={stats.crmStats.totalPendingApprovals || 0}
              icon={<AlertCircle className="h-4 w-4" />}
              description="All pending approvals"
            />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isSuperAdmin && (
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  User Approvals
                </CardTitle>
                <CardDescription>
                  Review and approve admin user requests
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {(isSuperAdmin || role === 'crm_manager') && (
            <>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Captain Approvals
                  </CardTitle>
                  <CardDescription>
                    Review captain onboarding applications
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Technician Approvals
                  </CardTitle>
                  <CardDescription>
                    Review technician applications
                  </CardDescription>
                </CardHeader>
              </Card>
            </>
          )}

          {(isSuperAdmin || role === 'regional_manager') && (
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Regional Dashboard
                </CardTitle>
                <CardDescription>
                  View regional performance metrics
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
