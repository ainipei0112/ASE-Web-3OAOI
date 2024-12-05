// React套件
import { Navigate } from 'react-router-dom' // 導向不同頁面的函式庫

// 自定義套件
import MainLayout from './components/global/MainLayout' // 整個頁框

// 導入頁面
import NotFound from './pages/NotFound'
import QueryBoard from './pages/QueryBoard'
import DashBoard from './pages/DashBoard'

// 儲存路由資訊
const Routes = [
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { path: 'DashBoard', element: <DashBoard /> },
            { path: 'QueryBoard', element: <QueryBoard /> },
            { path: '/', element: <Navigate to='/DashBoard' /> },
            { path: '404', element: <NotFound /> },
            { path: '*', element: <Navigate to='/404' /> },
        ],
    },
]

export default Routes
