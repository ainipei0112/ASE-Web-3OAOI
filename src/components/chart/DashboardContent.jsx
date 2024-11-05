import { useState, useEffect, useMemo, useContext } from 'react'
import { AppContext } from '../../Context.jsx'
import { Box, Card, Tab, Tabs, Typography, Grid, FormControlLabel } from '@mui/material'
import Switch from '@mui/material/Switch'
import BarChartIcon from '@mui/icons-material/BarChart'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { calculateAverages, calculateTotals, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange } from '../../Function.jsx'
import Loader from '../Loader.jsx'

const ChartComponent = ({ data, title, sx, showMonthly = false }) => {
    const createOptions = (periodData, periodTitle) => ({
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
            },
            column: {
                dataLabels: {
                    y: 0,
                    format: '{y:.0f}'
                }
            },
            spline: {
                dataLabels: {
                    y: -10,
                    format: '{y:.1f}%'
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
                data: periodData.map(d => Math.max(0, Math.min(100, parseFloat(d.averageOverkillRate))))
            }
        ]
    })

    const periods = showMonthly ? ['Daily', 'Weekly', 'Monthly'] : ['Daily', 'Weekly']
    const gridSize = showMonthly ? 4 : 6

    return (
        <Grid container spacing={2} sx={sx}>
            {periods.map((period) => (
                <Grid item xs={12} md={gridSize} key={period}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={createOptions(data[period.toLowerCase()], period)}
                    />
                </Grid>
            ))}
        </Grid>
    )
}

const OperationChartComponent = ({ data, title, sx, showMonthly = false }) => {
    const createOptions = (periodData, periodTitle) => ({
        title: { text: `${periodTitle} BST 作業數量` },
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

    const periods = showMonthly ? ['Daily', 'Weekly', 'Monthly'] : ['Daily', 'Weekly']
    const gridSize = showMonthly ? 4 : 6

    return (
        <Grid container spacing={2} sx={sx}>
            {periods.map((period) => (
                <Grid item xs={12} md={gridSize} key={period}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={createOptions(data[period.toLowerCase()], period)}
                    />
                </Grid>
            ))}
        </Grid>
    )
}

const renderChart = (data, title, showMonthly) => data && (
    <ChartComponent data={data} title={title} sx={{ padding: 2 }} showMonthly={showMonthly} />
)

const Dashboard = () => {
    const { aoiData } = useContext(AppContext)
    const [bdData, setBdData] = useState({})
    const [machineData, setMachineData] = useState({})
    const [selectedBdTab, setSelectedBdTab] = useState(0)
    const [selectedMachineTab, setSelectedMachineTab] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [chartsReady, setChartsReady] = useState(false)
    const [showMonthly, setShowMonthly] = useState(false)

    const getUniqueSortedList = (key) => useMemo(() => [...new Set(aoiData.map(item => item[key]))].sort(), [aoiData])
    const bdList = getUniqueSortedList('Device_Id')
    const machineList = getUniqueSortedList('Machine_Id')

    useEffect(() => {
        let mounted = true
        const initializeData = async () => {
            try {
                if (!aoiData || aoiData.length === 0) return
                setIsLoading(true)
                const processData = (data, key) => ({
                    [key]: {
                        monthly: calculateAverages(filterDataByMonthRange(data, 3), 'monthly'),
                        weekly: calculateAverages(filterDataByWeekRange(data, 5), 'weekly'),
                        daily: calculateAverages(filterDataByDateRange(data, 7), 'daily')
                    }
                })

                const updateData = (list, filterKey) =>
                    list.reduce((acc, item) => ({
                        ...acc,
                        ...processData(aoiData.filter(data => data[filterKey] === item), item)
                    }), {})
                const bdResult = updateData(bdList, 'Device_Id')
                const machineResult = updateData(machineList, 'Machine_Id')
                if (mounted) {
                    setBdData(bdResult)
                    setMachineData(machineResult)
                    setChartsReady(true)
                    setIsLoading(false)
                }
            } catch (error) {
                console.error('Error loading chart data:', error)
                if (mounted) setIsLoading(false)
            }
        }
        initializeData()
        return () => { mounted = false }
    }, [aoiData, bdList, machineList])

    const overallData = useMemo(() => ({
        daily: calculateAverages(filterDataByDateRange(aoiData, 7), 'daily'),
        weekly: calculateAverages(filterDataByWeekRange(aoiData, 5), 'weekly'),
        monthly: calculateAverages(filterDataByMonthRange(aoiData, 3), 'monthly')
    }), [aoiData])

    const operationData = useMemo(() => ({
        daily: calculateTotals(filterDataByDateRange(aoiData, 7), 'daily'),
        weekly: calculateTotals(filterDataByWeekRange(aoiData, 5), 'weekly'),
        monthly: calculateTotals(filterDataByMonthRange(aoiData, 3), 'monthly')
    }), [aoiData])

    if (isLoading || !chartsReady) return <Loader />

    return (
        <Box>
            <Card sx={{ border: '1px solid #9AD09C', minHeight: 400, backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: 3 }}>
                <Box sx={{ height: 45, backgroundColor: '#9AD09C', color: '#333', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #7ab17d' }}>
                    <BarChartIcon sx={{ marginRight: 1, color: '#333' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Summary</Typography>
                </Box>
            </Card>
            <Card sx={{ border: '1px solid #9AD09C', minHeight: 400, backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: 3 }}>
                <Box sx={{ height: 45, backgroundColor: '#9AD09C', color: '#333', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #7ab17d', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BarChartIcon sx={{ marginRight: 1, color: '#333' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Overall</Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showMonthly}
                                onChange={(e) => setShowMonthly(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="顯示月報表"
                    />
                </Box>
                <Box>
                    {renderChart(overallData, 'Overall', showMonthly)}
                </Box>
            </Card>
            <Card sx={{ border: '1px solid #9AD09C', minHeight: 400, backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: 3 }}>
                <Box sx={{ height: 45, backgroundColor: '#9AD09C', color: '#333', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #7ab17d', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BarChartIcon sx={{ marginRight: 1, color: '#333' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>作業數量</Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showMonthly}
                                onChange={(e) => setShowMonthly(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="顯示月報表"
                    />
                </Box>
                <Box>
                    <OperationChartComponent data={operationData} title="Operation" sx={{ padding: 2 }} showMonthly={showMonthly} />
                </Box>
            </Card>
            <Card sx={{ border: '1px solid #9AD09C', minHeight: 400, backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: 3 }}>
                <Box sx={{ height: 45, backgroundColor: '#9AD09C', color: '#333', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #7ab17d', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BarChartIcon sx={{ marginRight: 1, color: '#333' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>By B/D</Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showMonthly}
                                onChange={(e) => setShowMonthly(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="顯示月報表"
                    />
                </Box>
                <Box>
                    <Tabs
                        value={selectedBdTab}
                        onChange={(e, newValue) => setSelectedBdTab(newValue)}
                        sx={{
                            backgroundColor: '#e8f5e9',
                            '& .MuiTab-root': {
                                color: '#333',
                                '&.Mui-selected': {
                                    color: '#2e7d32',
                                    fontWeight: 'bold'
                                }
                            }
                        }}
                    >
                        {bdList.map((bd, index) => (
                            <Tab key={bd} label={bd} value={index} />
                        ))}
                    </Tabs>
                    {renderChart(bdData[bdList[selectedBdTab]], `${bdList[selectedBdTab]}`, showMonthly)}
                </Box>
            </Card>
            <Card sx={{ border: '1px solid #9AD09C', minHeight: 400, backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <Box sx={{ height: 45, backgroundColor: '#9AD09C', color: '#333', display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #7ab17d', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BarChartIcon sx={{ marginRight: 1, color: '#333' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>By M/C</Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showMonthly}
                                onChange={(e) => setShowMonthly(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="顯示月報表"
                    />
                </Box>
                <Box>
                    <Tabs
                        value={selectedMachineTab}
                        onChange={(e, newValue) => setSelectedMachineTab(newValue)}
                        sx={{
                            backgroundColor: '#e8f5e9',
                            '& .MuiTab-root': {
                                color: '#333',
                                '&.Mui-selected': {
                                    color: '#2e7d32',
                                    fontWeight: 'bold'
                                }
                            }
                        }}
                    >
                        {machineList.map((machine, index) => (
                            <Tab key={machine} label={machine} value={index} />
                        ))}
                    </Tabs>
                    {renderChart(machineData[machineList[selectedMachineTab]], `機台 ${machineList[selectedMachineTab]}`, showMonthly)}
                </Box>
            </Card>
        </Box>
    )
}

export default Dashboard