// 計算平均值的函數
function calculateAverages(products, period = "daily") {
  const map = {};
  const getKey = (date, isWeekly, isMonthly) => {
    if (isMonthly) return date.substring(0, 7); // 取得年月部分作為key
    if (isWeekly) return getWeekNumberForDate(date); // 取得週數作為key
    return date; // 使用日期作為key
  };

  // 根據key判別當前資料週期
  products.forEach(
    ({
      date1,
      aoi_yield,
      ai_yield,
      final_yield,
      Image_overkill,
      total_Images,
    }) => {
      const key = getKey(date1, period === "weekly", period === "monthly");
      if (!map[key]) {
        map[key] = {
          date: new Set(),
          aoi_yield: [],
          ai_yield: [],
          final_yield: [],
          overkill: [],
        };
      }
      const overKill = Image_overkill / total_Images;
      const dateToAdd =
        period === "monthly"
          ? date1.substring(0, 7)
          : period === "weekly"
            ? getWeekNumberForDate(date1)
            : date1;
      map[key].date.add(dateToAdd);
      map[key].aoi_yield.push(parseFloat(aoi_yield));
      map[key].ai_yield.push(parseFloat(ai_yield));
      map[key].final_yield.push(parseFloat(final_yield));
      map[key].overkill.push(overKill);
    }
  );

  // 計算每組資料平均值並輸出
  const calculatedAverages = Object.keys(map).map((key) => {
    const { date, aoi_yield, ai_yield, final_yield, overkill } = map[key];
    const getAverage = (arr) =>
      arr.reduce((sum, value) => sum + value, 0) / arr.length;
    return {
      key,
      date: Array.from(date),
      averageAoiYield: getAverage(aoi_yield).toFixed(2),
      averageAiYield: getAverage(ai_yield).toFixed(2),
      averageFinalYield: getAverage(final_yield).toFixed(2),
      averageOverKill: (getAverage(overkill) * 100).toFixed(2),
    };
  });

  // 排序計算結果
  calculatedAverages.sort((a, b) => new Date(a.date[0]) - new Date(b.date[0]));
  return calculatedAverages;
}

function calculateTotals(data) {
  const totals = {};

  data.forEach(item => {
    const date = item.Date_1;

    // 如果 totals 中已經存在該日期的資料，則不新增新的物件
    if (totals[date]) {
      totals[date].DataLen++;
      totals[date].AOI_Scan_Amount += parseInt(item.AOI_Scan_Amount);
      totals[date].AI_Fail_Total += parseInt(item.AI_Fail_Total);
      totals[date].True_Fail += parseInt(item.True_Fail);
      totals[date].Image_Overkill += parseInt(item.Image_Overkill);
      totals[date].Die_Overkill += parseInt(item.Die_Overkill);
      totals[date].OP_EA_Die_Corner += parseInt(item.OP_EA_Die_Corner);
      totals[date].OP_EA_Die_Surface += parseInt(item.OP_EA_Die_Surface);
      totals[date].OP_EA_Others += parseInt(item.OP_EA_Others);
    } else { // 否則，建立一個新的物件並初始化
      totals[date] = {
        Date: date,
        DataLen: 1,
        AOI_Scan_Amount: parseInt(item.AOI_Scan_Amount),
        AI_Fail_Total: parseInt(item.AI_Fail_Total),
        True_Fail: parseInt(item.True_Fail),
        Image_Overkill: parseInt(item.Image_Overkill),
        Die_Overkill: parseInt(item.Die_Overkill),
        OP_EA_Die_Corner: parseInt(item.OP_EA_Die_Corner),
        OP_EA_Die_Surface: parseInt(item.OP_EA_Die_Surface),
        OP_EA_Others: parseInt(item.OP_EA_Others),
      };
    }
  });

  // for (const date in totals) {
  //   console.log(`${date}`);
  //   console.log(`DataLen: ${totals[date].DataLen},`);
  //   console.log(`AOI_Scan_Amount: ${totals[date].AOI_Scan_Amount},`);
  //   console.log(`AI_Fail_Total: ${totals[date].AI_Fail_Total},`);
  //   console.log(`True_Fail: ${totals[date].True_Fail},`);
  //   console.log(`Image_Overkill: ${totals[date].Image_Overkill},`);
  //   console.log(`Die_Overkill: ${totals[date].Die_Overkill},`);
  //   console.log(`OP_EA_Die_Corner: ${totals[date].OP_EA_Die_Corner},`);
  //   console.log(`OP_EA_Die_Surface: ${totals[date].OP_EA_Die_Surface},`);
  //   console.log(`OP_EA_Others: ${totals[date].OP_EA_Others},`);
  //   console.log(''); // 在每個日期的資料後加一個空行
  // }

  return totals;
}

// --------------------------------------abandoned--------------------------------------
// 計算出日期所屬的週數
function getWeekNumberForDate(dateString) {
  const date = new Date(dateString);
  const yearStart = new Date(date.getFullYear(), 0, 0);
  const diff = date - yearStart;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.floor(diff / oneWeek) + 1;
  return "W" + weekNumber;
}

export {
  calculateAverages,
  calculateTotals
};
