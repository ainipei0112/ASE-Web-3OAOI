// 匯入 Navigate 函式庫，這是一個來導向不同頁面的函式庫。
import { Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout"; // 有sidebar的頁面
import MainLayout from "./components/MainLayout"; // 整個頁框

// 導入頁面
// import Login from './pages/Login';
import NotFound from "./pages/NotFound";
import AIResultList from "./pages/AI_ResultList";

// 儲存路由資訊
const Routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // { path: 'login', element: <Login /> },
      // { path: '/', element: <Navigate to="/login" /> }, // 首頁
      { path: "/", element: <Navigate to="/app/airesults" /> },
      { path: "404", element: <NotFound /> },
      { path: "*", element: <Navigate to="/404" /> },
    ],
  },
  {
    path: "/app",
    element: <DashboardLayout />, // 設定要載入頁面內容的範圍為 DashboardLayout。
    children: [
      { path: "airesults", element: <AIResultList /> },
    ],
  },
];

export default Routes;
