// 匯入 Navigate 函式庫，這是一個來導向不同頁面的函式庫。
import { Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout' // 整個頁框

// 導入頁面
import NotFound from './pages/NotFound'
import Chart from './pages/Chart'
import Dashboard from './pages/Dashboard'

// 儲存路由資訊
const Routes = [
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { path: 'Dashboard', element: <Dashboard /> },
            { path: 'Queryboard', element: <Chart /> },
            { path: '/', element: <Navigate to='/Dashboard' /> },
            { path: '404', element: <NotFound /> },
            { path: '*', element: <Navigate to='/404' /> },
        ],
    },
]

export default Routes
