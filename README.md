# Fix4Ever Admin Dashboard

A comprehensive admin dashboard for managing the Fix4Ever platform with role-based access control, user management, CRM operations, and chat center.

## Features

### User Role System

- **Super Admin (Level 0)**: Full system access, user creation, and all permissions
- **Admin (Level 0)**: Manage all users and settings
- **Regional Manager (Level 1)**: Region/City scoped access with configurable permissions
- **CRM Manager (Level 1)**: System-wide CRM operations
- **Captain**: Auto-onboard, assigned request management
- **Technician**: Auto-onboard, service execution

### Key Functionalities

#### 1. User Management (Super Admin)

- Create users directly with any role
- Approve/reject Regional Manager and CRM Manager requests
- Configure permissions for each user
- Save approval drafts
- View all admin users with filtering

#### 2. Regional Manager Dashboard

- View regional performance metrics
- Track requests, active chats, captains online, and active technicians
- Reassign service requests
- Manage regional captains
- View regional dashboard with customer consent

#### 3. CRM Manager Dashboard

- Approve/reject captain onboarding applications
- Approve/reject technician applications
- View pending approvals (42+ in pipeline)
- Background check verification
- Document verification (license, insurance)
- Reference checks

#### 4. Chat Center

- View and manage customer chats
- Filter by captains and technicians
- Search by name, city, status, rating, and request count
- Connect directly to customer chats
- Escalate issues to admin
- Real-time messaging

## Tech Stack

### Frontend

- React 19 with TypeScript
- React Router DOM for routing
- TanStack Query for data fetching
- Axios for API calls
- Shadcn UI for components
- Tailwind CSS for styling
- React Hot Toast for notifications
- Lucide React for icons

### Backend

- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- Role-based access control
- Permission-based middleware

## Project Structure

```
admin_dashboard/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.tsx          # Main layout wrapper
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   └── Header.tsx          # Top header
│   │   └── ui/                      # Shadcn UI components
│   ├── pages/
│   │   ├── Auth/
│   │   │   └── Login.tsx            # Login page
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx        # Main dashboard
│   │   ├── UserManagement/
│   │   │   ├── UserManagement.tsx   # User list
│   │   │   ├── UserApproval.tsx     # Approve users
│   │   │   └── CreateUser.tsx       # Create new user
│   │   ├── Regional/
│   │   │   ├── RegionalDashboard.tsx
│   │   │   └── RequestReassignment.tsx
│   │   ├── CRM/
│   │   │   ├── CRMDashboard.tsx
│   │   │   ├── CaptainApprovals.tsx
│   │   │   └── TechnicianApprovals.tsx
│   │   ├── Chat/
│   │   │   └── ChatCenter.tsx
│   │   ├── Vendors/
│   │   │   └── VendorManagement.tsx
│   │   └── ServiceRequests/
│   │       └── ServiceRequests.tsx
│   ├── lib/
│   │   ├── api.ts                   # API functions
│   │   └── utils.ts                 # Utility functions
│   └── routes/
│       └── index.tsx                # Route configuration
└── backend/
    ├── src/
    │   ├── models/
    │   │   ├── user.model.ts
    │   │   ├── adminUser.model.ts
    │   │   ├── captain.model.ts
    │   │   ├── technician.model.ts
    │   │   └── chat.model.ts
    │   ├── controllers/
    │   │   ├── userManagement.controller.ts
    │   │   ├── regionalManager.controller.ts
    │   │   ├── crmManager.controller.ts
    │   │   └── chatCenter.controller.ts
    │   ├── middleware/
    │   │   └── admin-permission.middleware.ts
    │   └── routes/
    │       ├── userManagement.routes.ts
    │       ├── regionalManager.routes.ts
    │       ├── crmManager.routes.ts
    │       └── chatCenter.routes.ts
```

## Installation

### Prerequisites

- Node.js 18+ or Bun
- MongoDB running
- Backend API running on port 8080

### Frontend Setup

1. Install dependencies:

```bash
cd admin_dashboard
npm install
```

2. Create `.env` file:

```bash
VITE_API_URL=http://localhost:8080/api
```

3. Start development server:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Backend Setup

The backend is already configured in the `backend` directory. Make sure it's running:

```bash
cd backend
npm install
npm run dev
```

## API Endpoints

### User Management

- `POST /api/admin/user-management/users/create` - Create user directly
- `GET /api/admin/user-management/approvals/pending` - Get pending approvals
- `GET /api/admin/user-management/admins` - Get all admin users
- `POST /api/admin/user-management/admins/:id/review` - Approve/reject user
- `PUT /api/admin/user-management/admins/:id/permissions` - Update permissions

### Regional Manager

- `GET /api/admin/regional/dashboard` - Get regional dashboard data
- `GET /api/admin/regional/requests` - Get regional requests
- `POST /api/admin/regional/requests/:id/reassign` - Reassign request
- `GET /api/admin/regional/captains` - Get regional captains

### CRM Manager

- `GET /api/admin/crm/statistics` - Get CRM statistics
- `GET /api/admin/crm/approvals/pending` - Get pending approvals
- `GET /api/admin/crm/captains` - Get all captains
- `POST /api/admin/crm/captains/:id/review` - Review captain
- `GET /api/admin/crm/technicians` - Get all technicians
- `POST /api/admin/crm/technicians/:id/review` - Review technician

### Chat Center

- `GET /api/admin/chat-center/` - Get all chats
- `GET /api/admin/chat-center/:id` - Get chat details
- `POST /api/admin/chat-center/:id/message` - Send message
- `POST /api/admin/chat-center/:id/escalate` - Escalate chat
- `GET /api/admin/chat-center/contacts/list` - Get contacts

## Usage

### Login

1. Navigate to `/login`
2. Enter admin credentials
3. Only users with admin roles can access the dashboard

### User Management (Super Admin Only)

1. Go to User Management
2. View all admin users
3. Click "Pending Approvals" to review new requests
4. Configure permissions and approve/reject
5. Create new users directly with "Create User"

### Regional Manager

1. View dashboard with regional metrics
2. See requests today, active chats, captains online
3. Reassign requests with customer consent
4. Manage regional captains

### CRM Manager

1. View pending captain/technician approvals
2. Review applications with background checks
3. View documents (license, insurance)
4. Check references
5. Approve or reject with comments

### Chat Center

1. View all active chats
2. Filter by type (captain/technician)
3. Search by name, city, or status
4. Send messages directly
5. Escalate to admin if needed

## Permissions System

Permissions are configurable per user:

- `viewCustomerChats`: View customer chat conversations
- `connectToCustomerChats`: Send messages in chats
- `directConnectToCaptains`: Direct messaging to captains
- `viewRegionalDashboard`: Access regional dashboard
- `reassignRequests`: Reassign service requests
- `approveCaptains`: Approve captain applications
- `viewTechnicians`: View technician list
- `approveOnboarding`: Approve onboarding requests
- `manageUsers`: Manage user accounts (Super Admin)
- `manageSettings`: Manage system settings (Super Admin)

## Security

- JWT-based authentication
- Role-based access control
- Permission-based middleware
- Token stored in localStorage
- Auto-redirect on session expiry
- CORS protection
- API request validation

## Development

### Adding New Features

1. Create controller in `backend/src/controllers/`
2. Add routes in `backend/src/routes/`
3. Register routes in `backend/src/index.ts`
4. Add API functions in `frontend/src/lib/api.ts`
5. Create page component in `frontend/src/pages/`
6. Add route in `frontend/src/routes/index.tsx`

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Shadcn UI for consistent design
- Tailwind CSS for styling
- React Query for data fetching

## Deployment

### Frontend

```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend

```bash
npm run build
# Deploy to your Node.js hosting service
```

## Environment Variables

### Frontend (.env)

```
VITE_API_URL=http://localhost:8080/api
```

### Backend (.env)

```
PORT=8080
MONGO_URL=mongodb://localhost:27017/fix4ever
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

## Support

For issues or questions:

1. Check the API documentation
2. Review the backend logs
3. Check browser console for errors
4. Verify MongoDB connection
5. Ensure backend is running on port 8080

## License

Proprietary - Fix4Ever Platform

---

Built with ❤️ for Fix4Ever Admin Team
