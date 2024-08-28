// 計算平均值的函數
function calculateAverages(datas, period = 'daily') {
    const map = {}
    const getKey = (date, isWeekly, isMonthly) => {
        if (isMonthly) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const monthIndex = parseInt(date.substring(5, 7)) - 1
            return monthNames[monthIndex]
        } // 轉換月份簡碼作為key：Aug
        if (isWeekly) return getWeekNumberForDate(date) // 取得週數作為key：W33
        return date.substring(0, 10) // 使用日期作為key：2024-08-16
    }

    // 根據key判別當前資料週期
    datas.forEach(({ Ao_Time_Start, Fail_Ppm, Overkill_Rate, Pass_Rate }) => {
        const key = getKey(Ao_Time_Start, period === 'weekly', period === 'monthly')
        if (!map[key]) {
            map[key] = {
                periodType: period,
                date: new Set(),
                Fail_Ppm: [],
                Overkill_Rate: [],
                Pass_Rate: [],
            }
        }
        const dateToAdd = Ao_Time_Start.substring(0, 10)
        map[key].date.add(dateToAdd)
        map[key].Fail_Ppm.push(parseFloat(Fail_Ppm))
        map[key].Overkill_Rate.push(parseFloat(Overkill_Rate))
        map[key].Pass_Rate.push(parseFloat(Pass_Rate))
    })

    // 計算每組資料平均值並輸出
    const calculatedAverages = Object.keys(map).map((key) => {
        const { date, Fail_Ppm, Overkill_Rate, Pass_Rate, periodType } = map[key]
        const getAverage = (arr) => arr.reduce((sum, value) => sum + value, 0) / arr.length
        return {
            key,
            periodType,
            date: Array.from(date),
            averageFailPpm: getAverage(Fail_Ppm).toFixed(0),
            averageOverkillRate: getAverage(Overkill_Rate).toFixed(1),
            averagePassRate: getAverage(Pass_Rate).toFixed(1),
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

// 計算總計值的函數
function calculateTotals(datas, period = 'daily') {
    const map = {}
    const getKey = (date, isWeekly, isMonthly) => {
        if (isMonthly) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const monthIndex = parseInt(date.substring(5, 7)) - 1
            return monthNames[monthIndex]
        } // 轉換月份簡碼作為key：Aug
        if (isWeekly) return getWeekNumberForDate(date) // 取得週數作為key：W33
        return date.substring(0, 10) // 使用日期作為key：2024-08-16
    }

    // 根據key判別當前資料週期
    datas.forEach(({ Ao_Time_Start, Aoi_Defect, Fail_Count, Pass_Count, Machine_Id }) => {
        const key = getKey(Ao_Time_Start, period === 'weekly', period === 'monthly')

        // 初始化map[key]
        if (!map[key]) {
            map[key] = {
                date: new Set(),
                periodType: period,
                machine: {}
            }
        }

        // 初始化map[key][Machine_Id]如果不存在
        if (!map[key].machine[Machine_Id]) {
            map[key].machine[Machine_Id] = {
                totalAoiDefect: 0,
                totalFailCount: 0,
                totalPassCount: 0,
            }
        }

        // 更新日期集合
        const dateToAdd = Ao_Time_Start.substring(0, 10)
        map[key].date.add(dateToAdd)

        // 累加各機台的指標
        map[key].machine[Machine_Id].totalAoiDefect += parseFloat(Aoi_Defect)
        map[key].machine[Machine_Id].totalFailCount += parseFloat(Fail_Count)
        map[key].machine[Machine_Id].totalPassCount += parseFloat(Pass_Count)
    })

    // 計算每組資料並輸出
    const calculatedSums = Object.keys(map).map((key) => {
        const { date, periodType, machine } = map[key]
        return { key, periodType, date: Array.from(date), machine }
    })

    // 排序計算結果
    calculatedSums.sort((a, b) => {
        if (period === 'weekly') {
            return a.key.localeCompare(b.key)
        } else {
            return new Date(a.date[0]) - new Date(b.date[0])
        }
    })

    return calculatedSums
}

// 濾出前幾月的資料
function filterDataByMonthRange(datas, months) {
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // 獲取當前月份 (1-12)
    const currentYear = now.getFullYear()

    return datas.filter(({ Ao_Time_Start }) => {
        const date = new Date(Ao_Time_Start)
        const month = date.getMonth() + 1
        const year = date.getFullYear()

        // 判斷是否在指定的月份範圍內
        if (year === currentYear && month >= currentMonth - months + 1 && month <= currentMonth) {
            return true
        } else if (year === currentYear - 1 && month >= 12 - (months - (currentMonth - 1))) {
            return true
        }
        return false
    })
}

// 濾出前幾週的資料
function filterDataByWeekRange(datas, weeks) {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // 將時間設置為當天開始
    const currentSunday = new Date(now)
    currentSunday.setDate(now.getDate() - now.getDay()) // 調整到當週的星期日

    const pastDate = new Date(currentSunday)
    pastDate.setDate(currentSunday.getDate() - (weeks - 1) * 7)

    const endDate = new Date(currentSunday)
    endDate.setDate(currentSunday.getDate() + 7)

    return datas.filter(({ Ao_Time_Start }) => {
        const date = new Date(Ao_Time_Start)
        return date >= pastDate && date < endDate
    }).map(data => ({
        ...data,
        weekNumber: getWeekNumberForDate(data.Ao_Time_Start)
    }))
}

// 濾出前幾日的資料
function filterDataByDateRange(datas, days) {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // 將時間設置為當天開始
    const pastDate = new Date(now)
    pastDate.setDate(now.getDate() - days - 1)

    return datas.filter(({ Ao_Time_Start }) => {
        const date = new Date(Ao_Time_Start)
        return date >= pastDate && date <= now
    })
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

export { calculateAverages, calculateTotals, getWeekNumberForDate, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange }
