// 載入ReactDOM渲染HTML<div id="root"></div>
import ReactDOM from 'react-dom/client' // 導入正確的模組

// Router建立路由規則 控制切換頁面時的網址路徑
import { HashRouter as Router } from 'react-router-dom'

// 要載入的頁面
import App from './App'

// ReactDOM.render((要渲染的ReactDOM), 被渲染的HTMLDOM)
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <Router>
        <App />
    </Router>,
)
