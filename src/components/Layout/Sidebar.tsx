import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  MapPin,
  Headphones,
  MessageSquare,
  Wrench,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import { authAPI } from '../../lib/api'

interface SidebarProps {
  isOpen: boolean
  userInfo: any
  currentPath: string
}

export default function Sidebar({
  isOpen,
  userInfo,
  currentPath,
}: SidebarProps) {
  const userRole = userInfo?.role || 'admin'

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin', 'regional_manager', 'crm_manager'],
    },
    {
      name: 'User Management',
      href: '/user-management',
      icon: Users,
      roles: ['super_admin', 'admin'],
    },
    {
      name: 'Regional Manager',
      href: '/regional',
      icon: MapPin,
      roles: ['super_admin', 'admin', 'regional_manager'],
    },
    {
      name: 'CRM Manager',
      href: '/crm',
      icon: Headphones,
      roles: ['super_admin', 'admin', 'crm_manager'],
    },
    {
      name: 'Chat Center',
      href: '/chat',
      icon: MessageSquare,
      roles: ['super_admin', 'admin', 'crm_manager', 'regional_manager'],
    },
    {
      name: 'Vendors',
      href: '/vendors',
      icon: Wrench,
      roles: ['super_admin', 'admin'],
    },
    {
      name: 'Service Requests',
      href: '/service-requests',
      icon: FileText,
      roles: ['super_admin', 'admin', 'regional_manager'],
    },
  ]

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(userRole)
  )

  const handleLogout = () => {
    authAPI.logout()
  }

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300',
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <h1 className="text-xl font-bold text-foreground">Fix4Ever</h1>
        {isOpen && (
          <button className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {userInfo?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {userInfo?.email}
            </p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {userRole.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavigation.map(item => {
          const Icon = item.icon
          const isActive = currentPath.startsWith(item.href)

          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  !isActive && 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-4 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
