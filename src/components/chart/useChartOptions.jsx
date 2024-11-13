const useChartOptions = () => {
    // 建立基礎圖表設定
    const createBaseChartOptions = (periodData, periodTitle, title) => {
        // 檢查是否為daily圖表且最後一個Overkill Rate值超過1%
        const isDaily = periodTitle === 'Daily'
        const lastOverkillRate = periodData[periodData.length - 1]?.averageOverkillRate
        const isOverThreshold = lastOverkillRate > 1

        return {
            title: { text: `${periodTitle} Pass & Overkill rate By ${title}` },
            credits: { enabled: false },
            exporting: { enabled: false },
            accessibility: { enabled: false },
            tooltip: {
                shared: true,
                crosshairs: true,
                followPointer: true,
                headerFormat: '<span style="font-size: 12px">{point.key}</span><br/>',
                pointFormatter: function () {
                    if (this.series.name === 'Fail PPM') {
                        return `<span style="color:${this.series.color}">${this.series.name}</span>: <b>${Math.round(this.y)}</b><br/>`
                    }
                    const value = this.y.toFixed(2)
                    const formattedValue = value.endsWith('.00') ? value.slice(0, -3) :
                        value.endsWith('0') ? value.slice(0, -1) : value
                    return `<span style="color:${this.series.color}">${this.series.name}</span>: <b>${formattedValue}%</b><br/>`
                }
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
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
            ]
        }
    }

    // 建立作業數量圖表設定
    const createOperationChartOptions = (periodData, periodTitle, title) => ({
        title: { text: `${periodTitle} ${title}` },
        credits: { enabled: false },
        exporting: { enabled: false },
        accessibility: { enabled: false },
        tooltip: {
            shared: true,
            crosshairs: true
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    style: { fontSize: '10px' }
                }
            },
            spline: {
                dataLabels: {
                    enabled: true,
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
        ]
    })

    return {
        createBaseChartOptions,
        createOperationChartOptions
    }
}

export default useChartOptions