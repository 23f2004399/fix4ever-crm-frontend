import { useEffect, useState } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Checkbox } from '../../components/ui/checkbox'
import { userManagementAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'

export default function UserApproval() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject'>('approve')
  const [permissions, setPermissions] = useState<any>({})
  const [rejectionReason, setRejectionReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      const response = await userManagementAPI.getPendingApprovals()
      if (response.data.success) {
        setPendingUsers(response.data.data)
      }
    } catch (error) {
      toast.error('Failed to load pending approvals')
    }
  }

  const handleApprove = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      await userManagementAPI.reviewAdminUser(selectedUser._id, {
        action: 'approve',
        permissions,
        region: selectedUser.region,
        city: selectedUser.city,
      })

      toast.success('User approved successfully')
      fetchPendingUsers()
      setIsDialogOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      await userManagementAPI.reviewAdminUser(selectedUser._id, {
        action: 'reject',
        rejectionReason,
      })

      toast.success('User rejected')
      fetchPendingUsers()
      setIsDialogOpen(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject user')
    } finally {
      setIsLoading(false)
    }
  }

  const openApprovalDialog = (user: any) => {
    setSelectedUser(user)
    setAction('approve')
    setPermissions({
      viewCustomerChats: false,
      connectToCustomerChats: false,
      directConnectToCaptains: false,
      viewRegionalDashboard: user.role === 'regional_manager',
      reassignRequests: false,
      approveCaptains: false,
      approveOnboarding: user.role === 'crm_manager',
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve admin user requests
        </p>
      </div>

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No pending approvals</p>
            <p className="text-sm text-muted-foreground">
              All requests have been reviewed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map(user => (
            <Card key={user._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{user.userId?.username}</CardTitle>
                    <CardDescription>{user.userId?.email}</CardDescription>
                  </div>
                  <Badge>{user.role.replace('_', ' ')}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Applied: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    {user.region && (
                      <p className="text-sm">
                        Region: {user.region} {user.city && `- ${user.city}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user)
                        setAction('reject')
                        setIsDialogOpen(true)
                      }}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button onClick={() => openApprovalDialog(user)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Review & Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve User' : 'Reject User'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.userId?.email} -{' '}
              {selectedUser?.role.replace('_', ' ')}
            </DialogDescription>
          </DialogHeader>

          {action === 'approve' ? (
            <div className="space-y-4">
              <div>
                <Label>Grant Permissions</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="viewChats"
                      checked={permissions.viewCustomerChats}
                      onCheckedChange={checked =>
                        setPermissions({
                          ...permissions,
                          viewCustomerChats: checked,
                        })
                      }
                    />
                    <label htmlFor="viewChats" className="text-sm">
                      View Customer Chats
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="connectChats"
                      checked={permissions.connectToCustomerChats}
                      onCheckedChange={checked =>
                        setPermissions({
                          ...permissions,
                          connectToCustomerChats: checked,
                        })
                      }
                    />
                    <label htmlFor="connectChats" className="text-sm">
                      Connect to Customer Chats
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="directConnectCaptains"
                      checked={permissions.directConnectToCaptains}
                      onCheckedChange={checked =>
                        setPermissions({
                          ...permissions,
                          directConnectToCaptains: checked,
                        })
                      }
                    />
                    <label htmlFor="directConnectCaptains" className="text-sm">
                      Direct Connect to Captains
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="viewDashboard"
                      checked={permissions.viewRegionalDashboard}
                      onCheckedChange={checked =>
                        setPermissions({
                          ...permissions,
                          viewRegionalDashboard: checked,
                        })
                      }
                    />
                    <label htmlFor="viewDashboard" className="text-sm">
                      View Regional Dashboard
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reassign"
                      checked={permissions.reassignRequests}
                      onCheckedChange={checked =>
                        setPermissions({
                          ...permissions,
                          reassignRequests: checked,
                        })
                      }
                    />
                    <label htmlFor="reassign" className="text-sm">
                      Reassign Requests
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="approveCaptains"
                      checked={permissions.approveCaptains}
                      onCheckedChange={checked =>
                        setPermissions({
                          ...permissions,
                          approveCaptains: checked,
                        })
                      }
                    />
                    <label htmlFor="approveCaptains" className="text-sm">
                      Approve Captains
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Rejection Reason</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={action === 'approve' ? handleApprove : handleReject}
              disabled={isLoading}
            >
              {isLoading
                ? 'Processing...'
                : action === 'approve'
                  ? 'Approve'
                  : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
