# Fix4Ever Admin Dashboard

A comprehensive admin dashboard for managing users, approvals, regional operations, CRM tasks, and customer communications for the Fix4Ever platform.

## Features

### 1. **User Management** (Super Admin Only)

- Create admin users directly
- View all admin users with filtering
- Approve/reject admin user requests
- Manage permissions for Regional Managers and CRM Managers
- View admin statistics

### 2. **Regional Manager Dashboard**

- View regional performance metrics
- Monitor requests, chats, captains, and technicians in your region
- Reassign service requests to different technicians
- Track completion rates and weekly performance
- View and manage regional captains

### 3. **CRM Manager Dashboard**

- Approve/reject captain onboarding applications
- Approve/reject technician onboarding applications
- View detailed application information
- Request additional information from applicants
- Track CRM statistics and pending approvals

### 4. **Chat Center**

- View all customer and service provider chats
- Filter by status (active, closed, escalated) and priority
- Send messages to customers and service providers
- Escalate chats to higher authorities
- Search and manage communications

### 5. **Role-Based Access Control**

- **Super Admin**: Full system access, user management
- **Admin**: Most system features, limited user management
- **Regional Manager**: Regional data and request reassignment
- **CRM Manager**: Captain and technician approvals, chat management

## Technology Stack

### Frontend

- **React 19** with TypeScript
- **Vite** - Build tool
- **React Router DOM** - Routing
- **TanStack Query** - Data fetching and caching
- **Shadcn UI** - Component library
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend Integration

- RESTful API endpoints
- JWT-based authentication
- Role-based permission system
- Real-time updates support

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend API running on `http://localhost:8080`

### Installation

1. Install dependencies:

```bash
npm install
# or
bun install
```

2. Create a `.env` file:

```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

3. Start the development server:

```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
bun build
```

## Project Structure

```
admin_dashboard/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.tsx        # Main layout with auth check
│   │   │   ├── Header.tsx        # Top header with user info
│   │   │   └── Sidebar.tsx       # Navigation sidebar
│   │   └── ui/                   # Shadcn UI components
│   ├── pages/
│   │   ├── Auth/
│   │   │   └── Login.tsx         # Admin login page
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx     # Main dashboard
│   │   ├── UserManagement/
│   │   │   ├── UserManagement.tsx    # View all admin users
│   │   │   ├── UserApproval.tsx      # Approve admin requests
│   │   │   └── CreateUser.tsx        # Create new admin user
│   │   ├── Regional/
│   │   │   ├── RegionalDashboard.tsx     # Regional metrics
│   │   │   └── RequestReassignment.tsx   # Reassign requests
│   │   ├── CRM/
│   │   │   ├── CRMDashboard.tsx          # CRM overview
│   │   │   ├── CaptainApprovals.tsx      # Captain approvals
│   │   │   └── TechnicianApprovals.tsx   # Technician approvals
│   │   ├── Chat/
│   │   │   └── ChatCenter.tsx    # CRM chat center
│   │   ├── Vendors/
│   │   │   └── VendorManagement.tsx  # Vendor approvals
│   │   └── ServiceRequests/
│   │       └── ServiceRequests.tsx   # View all requests
│   ├── lib/
│   │   ├── api.ts            # API client and all endpoints
│   │   └── utils.ts          # Utility functions
│   ├── routes/
│   │   └── index.tsx         # Route configuration
│   ├── App.tsx               # Root component
│   └── main.tsx              # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## API Integration

### Authentication

All API calls are automatically authenticated using JWT tokens stored in localStorage:

```typescript
// Stored after successful login
localStorage.setItem('adminToken', token)
localStorage.setItem('adminUser', JSON.stringify(user))
```

### API Endpoints

#### Auth

- `POST /api/auth/login` - Login
- `GET /api/admin/verify` - Verify admin access

#### User Management (Super Admin)

- `POST /api/admin/user-management/users/create` - Create user
- `GET /api/admin/user-management/approvals/pending` - Get pending approvals
- `GET /api/admin/user-management/admins` - Get all admin users
- `POST /api/admin/user-management/admins/:id/review` - Approve/reject admin
- `PUT /api/admin/user-management/admins/:id/permissions` - Update permissions
- `GET /api/admin/user-management/statistics` - Get admin stats

#### Regional Manager

- `GET /api/admin/regional/dashboard` - Get dashboard metrics
- `GET /api/admin/regional/requests` - Get regional requests
- `POST /api/admin/regional/requests/:id/reassign` - Reassign request
- `GET /api/admin/regional/requests/:id/available-technicians` - Get available techs
- `GET /api/admin/regional/captains` - Get regional captains

#### CRM Manager

- `GET /api/admin/crm/statistics` - Get CRM stats
- `GET /api/admin/crm/approvals/pending` - Get pending approvals
- `GET /api/admin/crm/captains` - Get all captains
- `GET /api/admin/crm/captains/:id` - Get captain details
- `POST /api/admin/crm/captains/:id/review` - Review captain
- `GET /api/admin/crm/technicians` - Get all technicians
- `GET /api/admin/crm/technicians/:id` - Get technician details
- `POST /api/admin/crm/technicians/:id/review` - Review technician

#### Chat Center

- `GET /api/admin/chat-center/statistics` - Get chat stats
- `GET /api/admin/chat-center/` - Get all chats
- `GET /api/admin/chat-center/:id` - Get chat details
- `POST /api/admin/chat-center/:id/message` - Send message
- `POST /api/admin/chat-center/create` - Create chat
- `PUT /api/admin/chat-center/:id/status` - Update chat status
- `POST /api/admin/chat-center/:id/escalate` - Escalate chat
- `POST /api/admin/chat-center/:id/mark-read` - Mark as read
- `GET /api/admin/chat-center/contacts/list` - Get contacts

## User Roles and Permissions

### Super Admin (Level 0)

- Full system access
- Create and manage admin users
- Approve Regional Managers and CRM Managers
- Access all dashboards and features
- Manage system settings

### Admin (Level 0)

- Similar to Super Admin
- Cannot create Super Admins
- Limited user management

### Regional Manager (Level 1)

- View regional dashboard
- Access regional performance metrics
- Reassign service requests within region
- View regional captains and technicians
- Limited to specific region/city

### CRM Manager (Level 1)

- Approve captain onboarding
- Approve technician onboarding
- Access CRM chat center
- View and manage customer communications
- Direct connection to captains and technicians

## Features by Role

| Feature              | Super Admin | Admin | Regional Manager | CRM Manager |
| -------------------- | ----------- | ----- | ---------------- | ----------- |
| User Management      | ✅          | ✅    | ❌               | ❌          |
| Admin Approvals      | ✅          | ✅    | ❌               | ❌          |
| Regional Dashboard   | ✅          | ✅    | ✅               | ❌          |
| Request Reassignment | ✅          | ✅    | ✅               | ❌          |
| Captain Approvals    | ✅          | ✅    | ❌               | ✅          |
| Technician Approvals | ✅          | ✅    | ❌               | ✅          |
| Chat Center          | ✅          | ✅    | ✅               | ✅          |
| Vendor Management    | ✅          | ✅    | ❌               | ❌          |
| Service Requests     | ✅          | ✅    | ✅               | ❌          |

## Email Notifications

The system sends automated email notifications for:

- Admin approval/rejection
- Captain approval/rejection
- Technician approval/rejection
- Service request reassignment
- Chat escalation

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint configuration included
- Prettier for code formatting

### Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_ENV` - Environment (development/production)

### Running Lint

```bash
npm run lint
```

### Running Format

```bash
npm run format
```

## Deployment

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

The built files will be in the `dist/` directory.

### Environment Configuration

For production, update the `.env` file:

```env
VITE_API_URL=https://api.fix4ever.com/api
VITE_ENV=production
```

## Security Considerations

1. **Authentication**: All routes require valid JWT token
2. **Role-Based Access**: Backend validates user roles and permissions
3. **Input Validation**: All forms validate input before submission
4. **XSS Protection**: React's built-in XSS protection
5. **HTTPS**: Always use HTTPS in production
6. **Token Expiry**: Tokens expire and require re-authentication

## Troubleshooting

### Login Issues

- Ensure backend is running
- Check CORS configuration
- Verify admin role in database

### API Errors

- Check network tab in browser DevTools
- Verify token is present in localStorage
- Check backend logs

### Build Errors

- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all dependencies are installed

## Support

For issues or questions:

1. Check backend logs
2. Review browser console
3. Verify user permissions
4. Contact system administrator

## License

Proprietary - Fix4Ever Platform

---

**Built with ❤️ for Fix4Ever**
