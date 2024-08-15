// 計算平均值的函數
function calculateAverages(datas, period = 'daily') {
    const map = {}
    const getKey = (date, isWeekly, isMonthly) => {
        if (isMonthly) return date.substring(0, 7) // 取得年月部分作為key
        if (isWeekly) return getWeekNumberForDate(date) // 取得週數作為key
        return date.substring(0, 10) // 使用日期作為key
    }

    // 根據key判別當前資料週期
    datas.forEach(({ Ao_Time_Start, Fail_Ppm, Overkill_Rate, Pass_Rate }) => {
        const key = getKey(Ao_Time_Start, period === 'weekly', period === 'monthly')
        if (!map[key]) {
            map[key] = {
                date: new Set(),
                Fail_Ppm: [],
                Overkill_Rate: [],
                Pass_Rate: [],
            }
        }
        const dateToAdd = Ao_Time_Start.substring(0, 10)
        // const dateToAdd = period === 'monthly' ? Ao_Time_Start.substring(0, 7) : period === 'weekly' ? getWeekNumberForDate(Ao_Time_Start) : Ao_Time_Start.substring(0, 10)
        map[key].date.add(dateToAdd)
        map[key].Fail_Ppm.push(parseFloat(Fail_Ppm))
        map[key].Overkill_Rate.push(parseFloat(Overkill_Rate))
        map[key].Pass_Rate.push(parseFloat(Pass_Rate))
    })

    // 計算每組資料平均值並輸出
    const calculatedAverages = Object.keys(map).map((key) => {
        const { date, Fail_Ppm, Overkill_Rate, Pass_Rate } = map[key]
        const getAverage = (arr) => arr.reduce((sum, value) => sum + value, 0) / arr.length
        return {
            key,
            date: Array.from(date),
            averageFailPpm: getAverage(Fail_Ppm).toFixed(2),
            averageOverkillRate: getAverage(Overkill_Rate).toFixed(2),
            averagePassRate: getAverage(Pass_Rate).toFixed(2),
        }
    })

    // 排序計算結果
    calculatedAverages.sort((a, b) => {
        if (period === 'weekly') {
            return a.key.localeCompare(b.key)
        } else {
            return new Date(a.date[0]) - new Date(b.date[0])
        }
    })
    return calculatedAverages
}

function filterDataByMonthRange(datas, months) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 獲取當前月份 (1-12)
    const currentYear = now.getFullYear();

    return datas.filter(({ Ao_Time_Start }) => {
        const date = new Date(Ao_Time_Start);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        // 判斷是否在指定的月份範圍內
        if (year === currentYear && month >= currentMonth - months + 1 && month <= currentMonth) {
            return true;
        } else if (year === currentYear - 1 && month >= 12 - (months - (currentMonth - 1))) {
            return true;
        }
        return false;
    });
}

function filterDataByWeekRange(datas, weeks) {
    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - weeks * 7);

    return datas.filter(({ Ao_Time_Start }) => {
        const date = new Date(Ao_Time_Start);
        return date >= pastDate && date <= now;
    }).map(data => {
        data.weekNumber = getWeekNumberForDate(data.Ao_Time_Start);
        return data;
    });
}

function filterDataByDateRange(datas, days) {
    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - days - 1);

    return datas.filter(({ Ao_Time_Start }) => {
        const date = new Date(Ao_Time_Start);
        return date >= pastDate && date <= now;
    });
}

// 計算出日期所屬的週數
function getWeekNumberForDate(dateString) {
    const date = new Date(dateString)
    const yearStart = new Date(date.getFullYear(), 0, 0)
    const diff = date - yearStart
    const oneWeek = 1000 * 60 * 60 * 24 * 7
    const weekNumber = Math.floor(diff / oneWeek) + 1
    return 'W' + weekNumber
}

export { calculateAverages, getWeekNumberForDate, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange }
