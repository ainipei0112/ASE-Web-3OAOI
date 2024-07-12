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
  users: [],
  products: [],
  cachedProducts: {},
  airesults: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USERS":
      return { ...state, users: action.payload };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload };
    case "SET_AIRESULT":
      return { ...state, airesults: action.payload };
    case "CACHE_PRODUCTS":
      return {
        ...state,
        cachedProducts: {
          ...state.cachedProducts,
          [action.payload.id]: action.payload.data,
        },
      };
    default:
      return state;
  }
};

const Actions = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const userLogin = async (userdata) => {
    try {
      const data = await fetchData(
        "http://localhost/php-react/login-user.php",
        "POST",
        userdata
      );
      if (data.length > 0) {
        dispatch({ type: "SET_USERS", payload: data });
      } else {
        throw new Error("沒有找到任何使用者資料");
      }
    } catch (err) {
      console.error(err.message);
      throw new Error("使用者登入失敗");
    }
  };

  const searchProduct = async (productId) => {
    const getCachedProducts = () => {
      if (state.cachedProducts[productId]) {
        return state.cachedProducts[productId];
      }

      const filteredProducts = Object.values(state.cachedProducts).flatMap(
        (products) =>
          products.filter((product) => {
            return (
              product.lot.includes(productId) &&
              productId.length === product.lot.length
            );
          })
      );

      return filteredProducts.length > 0 ? filteredProducts : null;
    };

    // 先檢查是否已經存在於cachedData中，如果存在，直接回傳暫存資料。
    const cachedData = getCachedProducts();
    if (cachedData) {
      dispatch({ type: "SET_PRODUCTS", payload: cachedData });
      return cachedData;
    }

    // 如果不存在，則從資料庫中取得資料
    try {
      const data = await fetchData(
        "http://10.11.33.122:1234/all-data.php",
        "POST",
        {
          action: "getProductById",
          productId,
        }
      );
      if (data.length > 0) {
        dispatch({ type: "CACHE_PRODUCTS", payload: { id: productId, data } });
        dispatch({ type: "SET_PRODUCTS", payload: data });
        return data;
      } else if (data.length === 0) {
        console.warn("沒有匹配的商品資料");
        dispatch({ type: "SET_PRODUCTS", payload: data });
        return data;
      }
    } catch (err) {
      console.error(err.message);
      throw new Error("商品搜尋失敗");
    }
  };

  const searchAiresult = async (selectedCustomer, selectedDateRange) => {
    try {
      const data = await fetchData(
        // "http://10.11.33.122:1234/all-data.php",
        "http://10.10.66.61:1234/all-data.php",
        "POST",
        {
          action: "getAIResults",
          selectedCustomer,
          selectedDateRange,
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
    users: state.users,
    products: state.products,
    airesults: state.airesults,
    userLogin,
    searchProduct,
    searchAiresult,
  };
};

export default Actions;
