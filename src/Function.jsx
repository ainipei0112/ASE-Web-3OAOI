// BD指標平均值：Fail_Ppm、Overkill_Rate、Pass_Rate
function calculateBdData(datas, period = 'daily') {
    const map = {}
    const getKey = (date, isWeekly, isMonthly) => {
        // 轉換月份簡碼作為key：Aug
        if (isMonthly) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const monthIndex = parseInt(date.substring(5, 7)) - 1
            return monthNames[monthIndex]
        }

        // 取得週次作為key：W33
        if (isWeekly) return getWeekNumberForDate(date)

        // 取得日期前10碼作為key：2024-08-16
        return date.substring(0, 10)
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
            averageOverkillRate: (getAverage(Overkill_Rate) * 100).toFixed(1),
            averagePassRate: (getAverage(Pass_Rate) * 100).toFixed(1),
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

// 作業數量指標總計值：Aoi_Defect、Fail_Count、Pass_Count
function calculateOperationData(datas, period = 'daily') {
    const map = {}
    const getKey = (date, isWeekly, isMonthly) => {
        if (isMonthly) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const monthIndex = parseInt(date.substring(5, 7)) - 1
            return monthNames[monthIndex]
        }
        if (isWeekly) return getWeekNumberForDate(date)
        return date.substring(0, 10)
    }

    // 根據key判別當前資料週期
    datas.forEach(({ Ao_Time_Start, Aoi_Defect, Fail_Count, Pass_Count, Machine_Id, Drawing_No }) => {
        const key = getKey(Ao_Time_Start, period === 'weekly', period === 'monthly')
        const dateToAdd = Ao_Time_Start.substring(0, 10)

        // 初始化
        if (!map[key]) {
            map[key] = {
                date: new Set(),
                periodType: period,
                machine: {},
                bondingDrawing: {}
            }
        }

        // 初始化 map[key][Drawing_No] & map[key][Machine_Id]
        const initializeEntry = (entry, id) => {
            if (!entry[id]) {
                entry[id] = {
                    totalAoiDefect: 0,
                    totalFailCount: 0,
                    totalPassCount: 0,
                    totalStrip: 0,
                }
            }
        }

        // 累加各機台的指標
        const updateTotals = (entry, Aoi_Defect, Fail_Count, Pass_Count) => {
            entry.totalAoiDefect += parseFloat(Aoi_Defect)
            entry.totalFailCount += parseFloat(Fail_Count)
            entry.totalPassCount += parseFloat(Pass_Count)
            entry.totalStrip += 1
        }

        // 更新日期集合
        map[key].date.add(dateToAdd)
        initializeEntry(map[key].bondingDrawing, Drawing_No)
        initializeEntry(map[key].machine, Machine_Id)
        updateTotals(map[key].bondingDrawing[Drawing_No], Aoi_Defect, Fail_Count, Pass_Count)
        updateTotals(map[key].machine[Machine_Id], Aoi_Defect, Fail_Count, Pass_Count)
    })

    // 計算並排序每組資料
    const calculatedSums = Object.keys(map).map((key) => {
        const { date, periodType, machine, bondingDrawing } = map[key]
        return { key, periodType, date: Array.from(date), machine, bondingDrawing }
    }).sort((a, b) => {
        if (period === 'weekly') {
            return a.key.localeCompare(b.key)
        } else {
            return new Date(a.date[0]) - new Date(b.date[0])
        }
    })

    return calculatedSums
}

// 機台盒鬚圖資料
function calculateMachineData(datas, period = 'daily') {
    const map = {}
    const getKey = (date, isWeekly, isMonthly) => {
        if (isMonthly) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            const monthIndex = parseInt(date.substring(5, 7)) - 1
            return monthNames[monthIndex]
        }
        if (isWeekly) return getWeekNumberForDate(date)
        return date.substring(0, 10)
    }

    datas.forEach(({ Ao_Time_Start, Drawing_No, Strip_No, Overkill_Rate }) => {
        const key = getKey(Ao_Time_Start, period === 'weekly', period === 'monthly')

        // 初始化
        if (!map[Drawing_No]) {
            map[Drawing_No] = {
                drawingNo: Drawing_No,
                results: []
            }
        }

        // 更新資料集合
        map[Drawing_No].results.push({
            key: key,
            periodType: period,
            stripNo: Strip_No,
            overkillRate: parseFloat(Overkill_Rate)
        })
    })

    // 計算並排序每組資料
    const calculatedData = Object.entries(map).map(([drawingNo, data]) => {
        data.results.sort((a, b) => {
            if (period === 'weekly') {
                return a.key.localeCompare(b.key)
            } else {
                return a.key.localeCompare(b.key)
            }
        })

        return {
            drawingNo,
            results: data.results
        }
    })

    return calculatedData
}

// 篩選出指定月份範圍內的資料
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

// 篩選出指定週數範圍內的資料
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

// 篩選出指定日期範圍內的資料
function filterDataByDateRange(datas, days) {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // 將時間設置為當天開始
    const pastDate = new Date(now)
    pastDate.setDate(now.getDate() - days)

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

export { calculateBdData, calculateOperationData, calculateMachineData, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange, getWeekNumberForDate }
