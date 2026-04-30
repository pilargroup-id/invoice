import { ArrowLeft, BarChartSquare02 } from './icons.jsx'

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
    label: 'Kembali Ke Pilar Group',
    href: 'https://pilargroup.id',
    icon: ArrowLeft,
    external: true,
  },
]
