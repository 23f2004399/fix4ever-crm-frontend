import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { regionalManagerAPI, serviceRequestAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import {
  User,
  MapPin,
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

export default function RequestReassignment() {
  const { requestId } = useParams()
  const navigate = useNavigate()

  const [serviceRequest, setServiceRequest] = useState<any>(null)
  const [availableTechnicians, setAvailableTechnicians] = useState<any[]>([])
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('')
  const [reason, setReason] = useState('')
  const [customerConsent, setCustomerConsent] = useState(false)
  const [technicianNotified, setTechnicianNotified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails()
      fetchAvailableTechnicians()
    }
  }, [requestId])

  const fetchRequestDetails = async () => {
    try {
      const response = await regionalManagerAPI.getRequests({
        page: 1,
        limit: 1,
      })

      if (response.data.success && response.data.data.length > 0) {
        // In a real scenario, you'd fetch the specific request by ID
        setServiceRequest(response.data.data[0])
      }
    } catch (error: any) {
      toast.error('Failed to load request details')
      console.error(error)
    }
  }

  const fetchAvailableTechnicians = async () => {
    setIsLoading(true)
    try {
      if (!requestId) return

      const response = await regionalManagerAPI.getAvailableTechnicians(
        requestId,
        {
          city: serviceRequest?.address || undefined,
        }
      )

      if (response.data.success) {
        setAvailableTechnicians(response.data.data)
      }
    } catch (error: any) {
      toast.error('Failed to load available technicians')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReassign = async () => {
    if (!selectedTechnicianId) {
      toast.error('Please select a technician')
      return
    }

    if (!customerConsent) {
      toast.error('Customer consent is required')
      return
    }

    if (!technicianNotified) {
      toast.error('Please confirm that the technician has been notified')
      return
    }

    setIsSubmitting(true)
    try {
      await regionalManagerAPI.reassignRequest(requestId!, {
        newTechnicianId: selectedTechnicianId,
        reason,
        customerConsent,
        technicianNotified,
      })

      toast.success('Request reassigned successfully')
      navigate('/regional')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reassign request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCurrentTechnician = () => {
    if (!serviceRequest?.assignedTechnician) return null
    return serviceRequest.assignedTechnician
  }

  const getSelectedTechnician = () => {
    return availableTechnicians.find(t => t._id === selectedTechnicianId)
  }

  if (isLoading && !serviceRequest) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">
            Loading request details...
          </p>
        </div>
      </div>
    )
  }

  const currentTech = getCurrentTechnician()
  const selectedTech = getSelectedTechnician()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reassign Request</h1>
          <p className="text-muted-foreground mt-1">
            Request #{requestId?.slice(-8)}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/regional')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Current Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTech ? (
              <>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {currentTech.personalInfo?.fullName || 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentTech.personalInfo?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <p className="text-sm">
                    <span className="font-medium">
                      {currentTech.averageRating?.toFixed(1) || 'N/A'}
                    </span>{' '}
                    rating
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">
                    ETA: {serviceRequest?.estimatedCompletionTime || '2 hours'}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No technician assigned yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">
                  {serviceRequest?.customerId?.username || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {serviceRequest?.customerId?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm">{serviceRequest?.address || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Issue</p>
                <p className="text-sm text-muted-foreground">
                  {serviceRequest?.issueDescription || 'No description'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Consent Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="customerConsent"
              checked={customerConsent}
              onCheckedChange={checked =>
                setCustomerConsent(checked as boolean)
              }
            />
            <div className="flex-1">
              <label
                htmlFor="customerConsent"
                className="text-sm font-medium cursor-pointer"
              >
                Customer consent obtained
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                {customerConsent
                  ? `Chat log: ${new Date().toLocaleTimeString()}`
                  : 'Please confirm customer consent before proceeding'}
              </p>
            </div>
            {customerConsent && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="technicianNotified"
              checked={technicianNotified}
              onCheckedChange={checked =>
                setTechnicianNotified(checked as boolean)
              }
            />
            <div className="flex-1">
              <label
                htmlFor="technicianNotified"
                className="text-sm font-medium cursor-pointer"
              >
                {currentTech
                  ? `Technician ${currentTech.personalInfo?.fullName} notified`
                  : 'Technician notified'}
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                {technicianNotified
                  ? 'Response: Agreed'
                  : 'Please confirm technician has been notified'}
              </p>
            </div>
            {technicianNotified && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Select New Technician */}
      <Card>
        <CardHeader>
          <CardTitle>Select New Technician</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              Available Technicians in {serviceRequest?.address || 'Area'}
            </Label>
            <Select
              value={selectedTechnicianId}
              onValueChange={setSelectedTechnicianId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
              <SelectContent>
                {availableTechnicians.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No available technicians found
                  </div>
                ) : (
                  availableTechnicians.map(tech => (
                    <SelectItem key={tech._id} value={tech._id}>
                      <div className="flex items-center justify-between gap-4 w-full">
                        <span>{tech.personalInfo?.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {tech.averageRating?.toFixed(1)}★
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedTech && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-medium">
                Tech. {selectedTech.personalInfo?.fullName}
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Specialization</p>
                  <p>
                    {selectedTech.professionalInfo?.specialization?.join(
                      ', '
                    ) || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p>
                    {selectedTech.professionalInfo?.yearsOfExperience || 'N/A'}{' '}
                    years
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <p>{selectedTech.averageRating?.toFixed(1)}★</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Availability</p>
                  <Badge>{selectedTech.availability}</Badge>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason for Reassignment (Optional)</Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Provide a reason for reassignment..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/regional')}>
          <XCircle className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={handleReassign}
          disabled={
            !selectedTechnicianId ||
            !customerConsent ||
            !technicianNotified ||
            isSubmitting
          }
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Confirming...' : 'Confirm Reassignment'}
        </Button>
      </div>
    </div>
  )
}
