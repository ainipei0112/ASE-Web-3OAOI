import { Autocomplete, Box, Card, Checkbox, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { styled } from "@mui/system";
import { useContext, useEffect, useReducer, useMemo, useState } from "react";
import { AppContext } from "/src/Context.jsx";

// 調整下拉選單和表格間距
const CardSpacing = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const initialState = {
  selectedDates: [],
  filteredProducts: [],
  groupedProducts: {},
  isLoading: false,
};

const reducer = (state, action, products) => {
  switch (action.type) {
    case "UPDATE_DATES":
      const sortedDates = action.payload.sort(
        (a, b) => new Date(a.title) - new Date(b.title)
      );
      const filteredProducts = products.filter(({ date1 }) =>
        sortedDates.some(({ title }) => title === date1)
      );
      return {
        ...state,
        selectedDates: sortedDates,
        filteredProducts,
        groupedProducts: calculateGroupedProducts(filteredProducts),
        isLoading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const calculateGroupedProducts = (filteredProducts) => {
  return filteredProducts.reduce((acc, product) => {
    const {
      date1,
      id,
      lot,
      aoi_yield,
      ai_yield,
      final_yield,
      Image_overkill,
      total_Images,
    } = product;
    const overKill = Number(((Image_overkill / total_Images) * 100).toFixed(2));
    const date = date1.substring(0, 10);
    acc[date] = acc[date] || [];
    acc[date].push({
      date,
      id,
      lot,
      aoi_yield: `${aoi_yield}%`,
      ai_yield: `${ai_yield}%`,
      final_yield: `${final_yield}%`,
      overKill: `${overKill}%`,
    });
    return acc;
  }, {});
};

const ProductListResults = () => {
  const { products } = useContext(AppContext);
  const [state, dispatch] = useReducer((state, action) => reducer(state, action, products), initialState);
  const { selectedDates, groupedProducts, isLoading } = state;

  // 照日期大小排列選單
  const dates = useMemo(
    () =>
      [
        ...new Set(products.map(({ date1 }) => date1)),
      ]
        .sort()
        .map((date1) => ({ title: date1 })),
    [products]
  );

  // 根據日期排序 groupedProducts 的資料
  const sortedGroupedProducts = useMemo(() => {
    return Object.entries(groupedProducts)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .reduce((acc, [date, products]) => {
        acc[date] = products;
        return acc;
      }, {});
  }, [groupedProducts]);

  const rows = useMemo(() => {
    return Object.entries(sortedGroupedProducts).flatMap(([, products]) => products);
  }, [sortedGroupedProducts]);

  const handleChange = (_, newDates) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "UPDATE_DATES", payload: newDates });
  };

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    if (dates.length > 0) {
      dispatch({ type: "UPDATE_DATES", payload: [dates[0]] });
    }
    dispatch({ type: "SET_LOADING", payload: false });
  }, [dates]);

  const columns = useMemo(() => [
    { field: "date", headerName: "Date", flex: 1, minWidth: 50, maxWidth: 150 },
    { field: "id", headerName: "ID", flex: 1, minWidth: 50, maxWidth: 100 },
    { field: "lot", headerName: "Lot", flex: 1 }, // 讓 'Lot' 欄位佔用剩餘空間
    {
      field: "aoi_yield",
      headerName: "AoiYield",
      flex: 1,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      field: "ai_yield",
      headerName: "AiYield",
      flex: 1,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      field: "final_yield",
      headerName: "FinalYield",
      flex: 1,
      minWidth: 50,
      maxWidth: 150,
    },
    {
      field: "overKill",
      headerName: "OverKill",
      flex: 1,
      minWidth: 50,
      maxWidth: 150,
    },
  ], []);

  // 使用 useState 儲存 DataGrid 高度
  const [gridHeight, setGridHeight] = useState(window.innerHeight - 350);

  // 監聽視窗大小改變
  useEffect(() => {
    const handleResize = () => {
      // 計算新的 DataGrid 高度，可以調整固定高度來微調
      setGridHeight(window.innerHeight - 350);
    };

    // 添加視窗大小改變的監聽事件
    window.addEventListener("resize", handleResize);

    // 清除監聽事件
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <CardSpacing>
        <Box>
          <Autocomplete
            multiple
            options={dates}
            disableCloseOnSelect
            onChange={handleChange}
            getOptionLabel={({ title }) => title}
            renderOption={(props, option, { selected }) => (
              <li {...props} key={option.title}>
                <Checkbox checked={selected} color="primary" />
                {option.title}
              </li>
            )}
            value={selectedDates}
            sx={{ width: "100%" }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={selectedDates.length === 0 ? "請選擇日期" : ""}
              />
            )}
          />
        </Box>
      </CardSpacing>
      <Card>
        <Box style={{ height: gridHeight }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableSelectionOnClick
            disableRowSelectionOnClick
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            slots={{
              noRowsOverlay: () => (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {isLoading ? "Loading..." : "No Rows"}
                  </Box>
                </>
              ),
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
              pagination: {
                showFirstButton: true,
                showLastButton: true,
              },
            }}
            sx={{
              "& .MuiDataGrid-columnHeaderTitle": {
                fontSize: "1.1rem",
                fontWeight: "bold",
              },
            }}
          />
        </Box>
      </Card>
    </>
  );
};

export default ProductListResults;