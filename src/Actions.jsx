import { useReducer } from "react";

// API 用來從網址取得資料。
const fetchData = async (url, method, body) => {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) return data.products;
    throw new Error(data.msg);
  } catch (err) {
    throw new Error(`資料取得失敗：${err.message}`);
  }
};

const initialState = {
  airesults: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_AIRESULT":
      return { ...state, airesults: action.payload };
    default:
      return state;
  }
};

const Actions = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const searchAiresult = async () => {
    try {
      const data = await fetchData(
        "http://10.11.33.122:1234/3o-data.php",
        "POST",
        {
          action: "get3oaoidata",
        }
      );
      if (data.length > 0) {
        dispatch({ type: "SET_AIRESULT", payload: data });
        return data;
      } else if (data.length === 0) {
        dispatch({ type: "SET_AIRESULT", payload: data });
        return data;
      }
    } catch (err) {
      console.error(err.message);
      throw new Error("商品搜尋失敗");
    }
  };

  // 回傳所有API抓取到的資料
  return {
    airesults: state.airesults,
    searchAiresult,
  };
};

export default Actions;
