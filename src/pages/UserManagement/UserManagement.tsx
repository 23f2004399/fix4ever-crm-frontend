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
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Input } from '../../components/ui/input'
import { Plus, Search, Eye } from 'lucide-react'
import { userManagementAPI } from '../../lib/api'
import toast from 'react-hot-toast'

export default function UserManagement() {
  const navigate = useNavigate()
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  })

  useEffect(() => {
    fetchAdminUsers()
  }, [filterRole, pagination.currentPage])

  const fetchAdminUsers = async () => {
    setIsLoading(true)
    try {
      const response = await userManagementAPI.getAllAdminUsers({
        page: pagination.currentPage,
        limit: 20,
        role: filterRole,
      })

      if (response.data.success) {
        setAdminUsers(response.data.data)
        setPagination(response.data.pagination)
      }
    } catch (error: any) {
      console.error('Error fetching admin users:', error)
      toast.error('Failed to load admin users')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      draft: 'outline',
    }

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      super_admin:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      regional_manager:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      crm_manager:
        'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    }

    return (
      <Badge className={colors[role] || ''}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage admin users and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/user-management/approvals')}>
            <Eye className="mr-2 h-4 w-4" />
            Pending Approvals
          </Button>
          <Button onClick={() => navigate('/user-management/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>View and manage all admin users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="regional_manager">Regional Manager</option>
              <option value="crm_manager">CRM Manager</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Region/City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No admin users found
                    </TableCell>
                  </TableRow>
                ) : (
                  adminUsers.map(user => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.userId?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.userId?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.region && <p>{user.region}</p>}
                          {user.city && (
                            <p className="text-muted-foreground">{user.city}</p>
                          )}
                          {!user.region && !user.city && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.approvalStatus)}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/user-management/${user._id}`)
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * 20 + 1} to{' '}
                {Math.min(pagination.currentPage * 20, pagination.totalItems)}{' '}
                of {pagination.totalItems} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage - 1,
                    })
                  }
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage + 1,
                    })
                  }
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
