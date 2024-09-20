import { Link as RouterLink } from 'react-router-dom'
import { AppBar, Toolbar, Typography } from '@mui/material'
import CottageIcon from '@mui/icons-material/Cottage'

// 導覽列
const MainNavbar = (props) => (
    <AppBar elevation={0} {...props}>
        <Toolbar sx={{ height: 64 }}>
            <RouterLink
                to='/'
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <CottageIcon />
                    <Typography variant='h6' sx={{ marginLeft: 1 }}>
                        3/O AOI Web System
                    </Typography>
                </div>
            </RouterLink>
        </Toolbar>
    </AppBar>
)

export default MainNavbar
