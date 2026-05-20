import { useParams } from "react-router-dom";
import { CustomerProfileView } from "../components/CustomerProfileView";

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <CustomerProfileView
      customerId={id}
      role="crm"
      backTo="/crm/customers"
      backLabel="Back to Customers"
    />
  );
}
