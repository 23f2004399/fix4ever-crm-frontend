import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'

export default function VendorManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vendor Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vendor Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vendor management interface coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
