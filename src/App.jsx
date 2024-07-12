import { useRoutes } from "react-router-dom"; // 用{}只帶入需要用的模組 不全部載入
import { ThemeProvider } from "@mui/material";
import GlobalStyles from "./components/GlobalStyles";
import theme from "./theme";
import Routes from "./Routes";
import Actions from "./Actions";
import { Provider } from "./Context"; // 用Provider可以將數據資料在全域共享，不用一層一層傳參數

const App = () => {
  const data = Actions(); // 把Action裡API傳輸的資料作為參數傳到Provider
  const routing = useRoutes(Routes);

  return (
    // 回傳只能是一個元素 有多個元素的話就用一個父元素包起來 像Provider把裡面東西都包起來
    <Provider value={data}>
      {/* ReactJS用的語法叫JSX 要帶入JS的函式和變數需要用{}包起來 */}
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {routing}
      </ThemeProvider>
    </Provider>
  );
};

export default App; // 把輸出的東西包成一個物件讓別人存取，輸入檔就能不用{}去取單一的東西
