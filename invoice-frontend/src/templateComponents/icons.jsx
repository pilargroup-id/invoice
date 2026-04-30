import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

function createIconComponent(IconComponent) {
  return function WrappedIcon({ size = 20, sx, ...props }) {
    return <IconComponent sx={{ fontSize: size, ...sx }} {...props} />
  }
}

export const BarChartSquare02 = createIconComponent(BarChartRoundedIcon)
export const Bell04 = createIconComponent(NotificationsNoneRoundedIcon)
export const ChevronDown = createIconComponent(KeyboardArrowDownRoundedIcon)
export const ChevronLeft = createIconComponent(ChevronLeftRoundedIcon)
export const ChevronRight = createIconComponent(ChevronRightRoundedIcon)
export const LogOut01 = createIconComponent(LogoutRoundedIcon)
export const Menu01 = createIconComponent(MenuRoundedIcon)
export const RefreshCw05 = createIconComponent(RefreshRoundedIcon)
export const SearchMd = createIconComponent(SearchRoundedIcon)
export const XClose = createIconComponent(CloseRoundedIcon)
