// 載入ReactDOM渲染HTML<div id="root"></div>
import ReactDOM from 'react-dom/client' // 導入正確的模組

// BrowserRouter建立路由規則 控制切換頁面時的網址路徑
import { HashRouter as Router } from 'react-router-dom'
// import { BrowserRouter as Router } from "react-router-dom";

// 要載入的頁面
import App from './App'

// 要傳入React的DOM，必須import react-dom
const root = ReactDOM.createRoot(document.getElementById('root')) // 使用 createRoot
root.render(
    // ReactDOM.render((要渲染的ReactDOM), 被渲染的HTMLDOM);
    <Router>
        <App />
        {/* BrowserRouter讀取到App頁面裡import的routes頁面才知道怎麼切換頁面 */}
    </Router>,
) // 把DOM渲染到root div
