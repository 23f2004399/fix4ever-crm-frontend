import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'

export default function ServiceRequests() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Service Requests</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Service Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Service requests interface coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
