import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import Login from '../pages/Auth/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import UserManagement from '../pages/UserManagement/UserManagement'
import UserApproval from '../pages/UserManagement/UserApproval'
import CreateUser from '../pages/UserManagement/CreateUser'
import RegionalDashboard from '../pages/Regional/RegionalDashboard'
import RequestReassignment from '../pages/Regional/RequestReassignment'
import CRMDashboard from '../pages/CRM/CRMDashboard'
import CaptainApprovals from '../pages/CRM/CaptainApprovals'
import TechnicianApprovals from '../pages/CRM/TechnicianApprovals'
import ChatCenter from '../pages/Chat/ChatCenter'
import VendorManagement from '../pages/Vendors/VendorManagement'
import ServiceRequests from '../pages/ServiceRequests/ServiceRequests'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // User Management Routes (Super Admin)
      {
        path: 'user-management',
        children: [
          {
            index: true,
            element: <UserManagement />,
          },
          {
            path: 'approvals',
            element: <UserApproval />,
          },
          {
            path: 'create',
            element: <CreateUser />,
          },
        ],
      },
      // Regional Manager Routes
      {
        path: 'regional',
        children: [
          {
            index: true,
            element: <RegionalDashboard />,
          },
          {
            path: 'reassign/:requestId',
            element: <RequestReassignment />,
          },
        ],
      },
      // CRM Manager Routes
      {
        path: 'crm',
        children: [
          {
            index: true,
            element: <CRMDashboard />,
          },
          {
            path: 'captains',
            element: <CaptainApprovals />,
          },
          {
            path: 'technicians',
            element: <TechnicianApprovals />,
          },
        ],
      },
      // Chat Center
      {
        path: 'chat',
        element: <ChatCenter />,
      },
      // Vendor Management
      {
        path: 'vendors',
        element: <VendorManagement />,
      },
      // Service Requests
      {
        path: 'service-requests',
        element: <ServiceRequests />,
      },
    ],
  },
])

export default router
