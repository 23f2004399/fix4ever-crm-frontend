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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { crmManagerAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import { CheckCircle2, XCircle, Eye } from 'lucide-react'

export default function CaptainApprovals() {
  const [captains, setCaptains] = useState<any[]>([])
  const [selectedCaptain, setSelectedCaptain] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | 'request_info'>(
    'approve'
  )
  const [comments, setComments] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  })

  useEffect(() => {
    fetchCaptains()
  }, [pagination.currentPage])

  const fetchCaptains = async () => {
    setIsLoading(true)
    try {
      const response = await crmManagerAPI.getPendingApprovals({
        type: 'captain',
        page: pagination.currentPage,
        limit: 20,
      })

      if (response.data.success) {
        setCaptains(response.data.data)
        setPagination(response.data.pagination)
      }
    } catch (error: any) {
      toast.error('Failed to load captain approvals')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedCaptain) return

    setIsLoading(true)
    try {
      await crmManagerAPI.reviewCaptain(selectedCaptain._id, {
        action,
        comments,
      })

      toast.success(
        `Captain ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'under review'}`
      )
      fetchCaptains()
      setIsDialogOpen(false)
      setComments('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process review')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      Approved: 'default',
      'Pending Approval': 'secondary',
      'In Review': 'outline',
      Rejected: 'destructive',
    }

    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Captain Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve captain applications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            {pagination.totalItems} captain(s) awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : captains.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No pending captain applications
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {captains.map(captain => (
                      <TableRow key={captain._id}>
                        <TableCell className="font-medium">
                          {captain.personalInfo?.fullName}
                        </TableCell>
                        <TableCell>{captain.personalInfo?.email}</TableCell>
                        <TableCell>
                          {captain.personalInfo?.residentialAddress || '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(captain.onboardingStatus)}
                        </TableCell>
                        <TableCell>
                          {captain.submittedAt
                            ? new Date(captain.submittedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCaptain(captain)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCaptain(captain)
                                setAction('reject')
                                setIsDialogOpen(true)
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedCaptain(captain)
                                setAction('approve')
                                setIsDialogOpen(true)
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.currentPage - 1) * 20 + 1} to{' '}
                    {Math.min(
                      pagination.currentPage * 20,
                      pagination.totalItems
                    )}{' '}
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve'
                ? 'Approve'
                : action === 'reject'
                  ? 'Reject'
                  : 'Request Info'}{' '}
              Captain
            </DialogTitle>
            <DialogDescription>
              {selectedCaptain?.personalInfo?.fullName} -{' '}
              {selectedCaptain?.personalInfo?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Comments</Label>
              <Textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder={
                  action === 'approve'
                    ? 'Optional approval comments...'
                    : 'Provide a reason for your decision...'
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={isLoading}>
              {isLoading
                ? 'Processing...'
                : action === 'approve'
                  ? 'Approve'
                  : action === 'reject'
                    ? 'Reject'
                    : 'Request Info'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Captain Details - Review Modal</DialogTitle>
          </DialogHeader>

          {selectedCaptain && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-sm">
                      {selectedCaptain.personalInfo?.fullName}
                    </p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm">
                      {selectedCaptain.personalInfo?.email}
                    </p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm">
                      {selectedCaptain.personalInfo?.phone || '-'}
                    </p>
                  </div>
                  <div>
                    <Label>City</Label>
                    <p className="text-sm">
                      {selectedCaptain.personalInfo?.residentialAddress || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div>
                <h3 className="font-semibold mb-3">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Vehicle Type</Label>
                    <p className="text-sm">
                      {selectedCaptain.vehicleDetails?.vehicleType || '-'}
                    </p>
                  </div>
                  <div>
                    <Label>Vehicle Number</Label>
                    <p className="text-sm">
                      {selectedCaptain.vehicleDetails?.vehicleNumber || '-'}
                    </p>
                  </div>
                  <div>
                    <Label>Average Rating</Label>
                    <p className="text-sm">
                      {selectedCaptain.averageRating?.toFixed(1) || 'N/A'} ⭐
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm">
                      {getStatusBadge(selectedCaptain.onboardingStatus)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Background Check */}
              <div>
                <h3 className="font-semibold mb-3">Background Check</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <Badge
                    variant={
                      selectedCaptain.backgroundCheck?.status === 'Passed'
                        ? 'default'
                        : selectedCaptain.backgroundCheck?.status === 'Failed'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {selectedCaptain.backgroundCheck?.status || 'Pending'}
                  </Badge>
                  {selectedCaptain.backgroundCheck?.verifiedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Verified on{' '}
                      {new Date(
                        selectedCaptain.backgroundCheck.verifiedAt
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Document Verification */}
              <div>
                <h3 className="font-semibold mb-3">Document Verification</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Driver's License</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCaptain.documents?.license?.number ||
                          'Not uploaded'}
                      </p>
                    </div>
                    {selectedCaptain.documents?.license?.url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            selectedCaptain.documents.license.url,
                            '_blank'
                          )
                        }
                      >
                        View License
                      </Button>
                    ) : (
                      <Badge variant="secondary">Not Available</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Vehicle Insurance</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedCaptain.documents?.insurance?.policyNumber ||
                          'Not uploaded'}
                      </p>
                    </div>
                    {selectedCaptain.documents?.insurance?.url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            selectedCaptain.documents.insurance.url,
                            '_blank'
                          )
                        }
                      >
                        View Insurance
                      </Button>
                    ) : (
                      <Badge variant="secondary">Not Available</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Reference Check */}
              <div>
                <h3 className="font-semibold mb-3">Reference Check</h3>
                <div className="bg-muted p-4 rounded-lg">
                  {selectedCaptain.references &&
                  selectedCaptain.references.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCaptain.references.map(
                        (ref: any, index: number) => (
                          <div
                            key={index}
                            className="border-b border-border pb-2 last:border-0"
                          >
                            <p className="text-sm font-medium">
                              {ref.name || 'Reference ' + (index + 1)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {ref.phone || ref.email || 'Contact not provided'}
                            </p>
                          </div>
                        )
                      )}
                      <Button size="sm" variant="outline" className="mt-2">
                        View References
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No references provided
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false)
                setSelectedCaptain(null)
                setAction('approve')
                setIsDialogOpen(true)
              }}
            >
              Proceed to Review
            </Button>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
