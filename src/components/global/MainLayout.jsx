// React套件
import { Outlet } from 'react-router-dom'

// MUI套件
import { styled } from '@mui/system'

// 自定義套件
import MainNavbar from './MainNavbar'

// 定義樣式
const MainLayoutRoot = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
}))

const MainLayoutWrapper = styled('div')({
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
    paddingTop: 64,
})

const MainLayoutContainer = styled('div')({
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
})

const MainLayoutContent = styled('div')({
    flex: '1 1 auto',
    height: '100%',
    overflow: 'auto',
})

// 主頁框
const MainLayout = () => (
    <MainLayoutRoot>
        <MainNavbar />
        <MainLayoutWrapper>
            <MainLayoutContainer>
                <MainLayoutContent>
                    <Outlet />
                </MainLayoutContent>
            </MainLayoutContainer>
        </MainLayoutWrapper>
    </MainLayoutRoot>
)

export default MainLayout
