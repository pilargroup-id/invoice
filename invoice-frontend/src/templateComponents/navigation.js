import { BarChartSquare02, LogOut01 } from './icons.jsx'

export const defaultNavigationPath = '/'
export const implementedNavigationPaths = ['/']

export const primaryNavigationItems = [
  {
    label: 'Invoice Generator',
    href: '/',
    icon: BarChartSquare02,
  },
]

export const secondaryNavigationItems = [
  {
    label: 'Logout',
    icon: LogOut01,
    action: 'logout',
    variant: 'danger',
  },
]
