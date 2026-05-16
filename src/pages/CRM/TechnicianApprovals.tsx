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

export default function TechnicianApprovals() {
  const [technicians, setTechnicians] = useState<any[]>([])
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null)
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
    fetchTechnicians()
  }, [pagination.currentPage])

  const fetchTechnicians = async () => {
    setIsLoading(true)
    try {
      const response = await crmManagerAPI.getPendingApprovals({
        type: 'technician',
        page: pagination.currentPage,
        limit: 20,
      })

      if (response.data.success) {
        setTechnicians(response.data.data)
        setPagination(response.data.pagination)
      }
    } catch (error: any) {
      toast.error('Failed to load technician approvals')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedTechnician) return

    setIsLoading(true)
    try {
      await crmManagerAPI.reviewTechnician(selectedTechnician._id, {
        action,
        comments,
      })

      toast.success(
        `Technician ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'under review'}`
      )
      fetchTechnicians()
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
        <h1 className="text-3xl font-bold">Technician Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve technician applications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>
            {pagination.totalItems} technician(s) awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : technicians.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No pending technician applications
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
                      <TableHead>Specialization</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicians.map(tech => (
                      <TableRow key={tech._id}>
                        <TableCell className="font-medium">
                          {tech.personalInfo?.fullName}
                        </TableCell>
                        <TableCell>{tech.personalInfo?.email}</TableCell>
                        <TableCell>
                          {tech.professionalInfo?.specialization?.join(', ') ||
                            '-'}
                        </TableCell>
                        <TableCell>
                          {tech.professionalInfo?.yearsOfExperience || '-'}{' '}
                          years
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(tech.onboardingStatus)}
                        </TableCell>
                        <TableCell>
                          {tech.submittedAt
                            ? new Date(tech.submittedAt).toLocaleDateString()
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTechnician(tech)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTechnician(tech)
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
                                setSelectedTechnician(tech)
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
              Technician
            </DialogTitle>
            <DialogDescription>
              {selectedTechnician?.personalInfo?.fullName} -{' '}
              {selectedTechnician?.personalInfo?.email}
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
            <DialogTitle>Technician Details - Review Modal</DialogTitle>
          </DialogHeader>

          {selectedTechnician && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-sm">
                      {selectedTechnician.personalInfo?.fullName}
                    </p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm">
                      {selectedTechnician.personalInfo?.email}
                    </p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm">
                      {selectedTechnician.personalInfo?.phone || '-'}
                    </p>
                  </div>
                  <div>
                    <Label>City</Label>
                    <p className="text-sm">
                      {selectedTechnician.personalInfo?.city || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="font-semibold mb-3">Professional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Specialization</Label>
                    <p className="text-sm">
                      {selectedTechnician.professionalInfo?.specialization?.join(
                        ', '
                      ) || '-'}
                    </p>
                  </div>
                  <div>
                    <Label>Experience</Label>
                    <p className="text-sm">
                      {selectedTechnician.professionalInfo?.yearsOfExperience ||
                        '-'}{' '}
                      years
                    </p>
                  </div>
                  <div>
                    <Label>Average Rating</Label>
                    <p className="text-sm">
                      {selectedTechnician.averageRating?.toFixed(1) || 'N/A'} ⭐
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm">
                      {getStatusBadge(selectedTechnician.onboardingStatus)}
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
                      selectedTechnician.backgroundCheck?.status === 'Passed'
                        ? 'default'
                        : selectedTechnician.backgroundCheck?.status ===
                            'Failed'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {selectedTechnician.backgroundCheck?.status || 'Pending'}
                  </Badge>
                  {selectedTechnician.backgroundCheck?.verifiedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Verified on{' '}
                      {new Date(
                        selectedTechnician.backgroundCheck.verifiedAt
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
                      <p className="font-medium text-sm">
                        Professional License
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedTechnician.documents?.license?.number ||
                          'Not uploaded'}
                      </p>
                    </div>
                    {selectedTechnician.documents?.license?.url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            selectedTechnician.documents.license.url,
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
                      <p className="font-medium text-sm">Certifications</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedTechnician.professionalInfo?.certifications
                          ?.length > 0
                          ? selectedTechnician.professionalInfo.certifications.join(
                              ', '
                            )
                          : 'Not provided'}
                      </p>
                    </div>
                    {selectedTechnician.documents?.certifications?.url ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            selectedTechnician.documents.certifications.url,
                            '_blank'
                          )
                        }
                      >
                        View Certificates
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
                  {selectedTechnician.references &&
                  selectedTechnician.references.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTechnician.references.map(
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
                setSelectedTechnician(null)
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
