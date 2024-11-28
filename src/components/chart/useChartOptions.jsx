const useChartOptions = () => {

    // 將數字格式化為千分位
    const formatWithCommas = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    // 建立基礎的無資料配置
    const createNoDataConfig = (periodTitle, title) => ({
        title: { text: `${periodTitle} ${title}` },
        credits: { enabled: false },
        exporting: { enabled: false },
        accessibility: { enabled: false },
        series: [],
        lang: {
            noData: "無資料可供顯示"
        },
        noData: {
            style: {
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#666666'
            }
        }
    })

    // 建立基礎圖表設定
    const createBaseChartOptions = (periodData, periodTitle, title) => {
        // 檢查是否有資料
        if (!periodData || periodData.length === 0) {
            return createNoDataConfig(periodTitle, title)
        }

        // 檢查是否為 Daily 圖表且最後一個 Overkill Rate 超過 1%
        const isDaily = periodTitle === 'Daily'
        const lastOverkillRate = periodData[periodData.length - 1]?.averageOverkillRate
        const isOverThreshold = lastOverkillRate > 1

        return {
            title: { text: `${periodTitle} Pass & Overkill rate By ${title}` },
            credits: { enabled: false },
            exporting: { enabled: false },
            accessibility: { enabled: false },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return this.y.toLocaleString()
                        },
                        style: { fontSize: '10px' }
                    }
                }
            },
            xAxis: {
                categories: periodData.map(d => d.key),
                crosshair: true
            },
            yAxis: [
                {
                    title: { text: '' },
                    labels: { format: '{value}%' },
                    opposite: true,
                    min: 0,
                    max: 100
                },
                {
                    title: { text: '' },
                    labels: { format: '{value}' }
                }
            ],
            series: [
                {
                    name: 'Fail PPM',
                    type: 'column',
                    yAxis: 1,
                    data: periodData.map(d => parseFloat(d.averageFailPpm))
                },
                {
                    name: 'Pass Rate',
                    type: 'spline',
                    yAxis: 0,
                    data: periodData.map(d => Math.max(0, Math.min(100, parseFloat(d.averagePassRate))))
                },
                {
                    name: 'Overkill Rate',
                    type: 'spline',
                    yAxis: 0,
                    data: periodData.map((d, index) => ({
                        y: Math.max(0, Math.min(100, parseFloat(d.averageOverkillRate))),
                        dataLabels: {
                            enabled: true,
                            style: {
                                fontSize: isDaily && index === periodData.length - 1 && isOverThreshold ? '14px' : '10px',
                                fontWeight: isDaily && index === periodData.length - 1 && isOverThreshold ? 'bold' : 'normal',
                                color: isDaily && index === periodData.length - 1 && isOverThreshold ? '#F9F900' : '#FFFFFF'
                            },
                            backgroundColor: isDaily && index === periodData.length - 1 && isOverThreshold ? '#F9F999' : 'none',
                            borderColor: isDaily && index === periodData.length - 1 && isOverThreshold ? '#F9F900' : 'none',
                            borderRadius: 5,
                            borderWidth: 3
                        }
                    }))
                }
            ],
            tooltip: {
                shared: true,
                crosshairs: true,
                followPointer: true,
                headerFormat: '<span style="font-size: 12px">{point.key}</span><br/>',
                pointFormatter: function () {
                    if (this.series.name === 'Fail PPM') {
                        return `<span style="color:${this.series.color}">${this.series.name}</span>: <b>${formatWithCommas(Math.round(this.y))}</b><br/>`
                    }
                    const value = this.y.toFixed(2)
                    const formattedValue = value.endsWith('.00') ? value.slice(0, -3) :
                        value.endsWith('0') ? value.slice(0, -1) : value
                    return `<span style="color:${this.series.color}">${this.series.name}</span>: <b>${formatWithCommas(formattedValue)}%</b><br/>`
                }
            }
        }
    }

    // 建立機台圖表設定
    const createMachineChartOptions = (periodData, periodTitle, title) => {
        // 檢查是否有資料
        if (!periodData || periodData.length === 0) {
            return createNoDataConfig(periodTitle, title)
        }

        // 整理每個 drawingNo 的所有 overkillRate 數據
        const drawingData = periodData.reduce((acc, item) => {
            const drawingNo = item.drawingNo
            if (!acc[drawingNo]) {
                acc[drawingNo] = []
            }
            // 收集該 drawingNo 的所有 overkillRate
            item.results.forEach(result => {
                acc[drawingNo].push(result.overkillRate)
            })
            return acc
        }, {})

        // 如果處理後仍然沒有數據
        if (Object.keys(drawingData).length === 0) {
            return createNoDataConfig(periodTitle, title)
        }

        const colors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
            '#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']

        // 計算箱型圖數據
        const boxplotData = Object.entries(drawingData).map(([drawingNo, rates], index) => {
            const sortedRates = rates.sort((a, b) => a - b)
            const q1 = sortedRates[Math.floor(sortedRates.length * 0.25)]
            const median = sortedRates[Math.floor(sortedRates.length * 0.5)]
            const q3 = sortedRates[Math.floor(sortedRates.length * 0.75)]
            const min = sortedRates[0]
            const max = sortedRates[sortedRates.length - 1]

            return {
                name: drawingNo,
                data: [[min, q1, median, q3, max]],
                color: colors[index % colors.length]
            }
        })

        return {
            title: { text: `${periodTitle} ${title}` },
            credits: { enabled: false },
            exporting: { enabled: false },
            accessibility: { enabled: false },
            chart: { type: 'boxplot' },
            plotOptions: {
                boxplot: {
                    pointWidth: 20
                }
            },
            xAxis: {
                // 將categories設為空字串陣列
                categories: boxplotData.map(() => ''),
            },
            yAxis: {
                title: { text: 'Overkill Rate (%)' },
                min: 0
            },
            legend: {
                enabled: true
            },
            series: boxplotData,
            tooltip: {
                followPointer: true,
                useHTML: true,
                formatter: function () {
                    return `<em>Drawing No： ${this.point.series.name}</em><br/>
                            最大值: ${this.point.high.toFixed(2)}%<br/>
                            上四分位數: ${this.point.q3.toFixed(2)}%<br/>
                            中位數: ${this.point.median.toFixed(2)}%<br/>
                            下四分位數: ${this.point.q1.toFixed(2)}%<br/>
                            最小值: ${this.point.low.toFixed(2)}%<br/>`
                }
            }
        }
    }

    // 建立作業數量圖表設定
    const createOperationChartOptions = (periodData, periodTitle, title) => {
        // 檢查是否有資料
        if (!periodData || periodData.length === 0) {
            return createNoDataConfig(periodTitle, title)
        }

        return {
            title: { text: `${periodTitle} ${title}` },
            credits: { enabled: false },
            exporting: { enabled: false },
            accessibility: { enabled: false },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return this.y.toLocaleString()
                        },
                        style: { fontSize: '10px' }
                    }
                },
                spline: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return this.y.toLocaleString()
                        },
                        style: { fontSize: '10px' }
                    }
                }
            },
            xAxis: {
                categories: periodData.map(d => d.key),
                crosshair: true
            },
            yAxis: [
                {
                    title: { text: '' },
                    labels: { format: '{value}' }
                },
                {
                    title: { text: '' },
                    opposite: true,
                    labels: { format: '{value}' }
                }
            ],
            series: [
                {
                    name: 'Total Quantity(K)',
                    type: 'column',
                    data: periodData.map(d => {
                        const machines = d.machine || {}
                        return Object.values(machines).reduce((sum, machine) => {
                            return sum + (machine.totalAoiDefect || 0) +
                                (machine.totalFailCount || 0) +
                                (machine.totalPassCount || 0)
                        }, 0)
                    })
                },
                {
                    name: 'Strip',
                    type: 'spline',
                    yAxis: 1,
                    data: periodData.map(d => {
                        const machines = d.machine || {}
                        return Object.values(machines).reduce((sum, machine) => {
                            return sum + (machine.totalStrip || 0)
                        }, 0)
                    })
                }
            ],
            tooltip: {
                shared: true,
                crosshairs: true,
                formatter: function () {
                    let s = `<b>${this.x}</b>`
                    this.points.forEach(point => {
                        s += `<br/>${point.series.name}: ${point.y.toLocaleString()}` // 在這裡格式化為千分位
                    })
                    return s
                }
            }
        }
    }

    return {
        createBaseChartOptions,
        createMachineChartOptions,
        createOperationChartOptions
    }
}

export default useChartOptions