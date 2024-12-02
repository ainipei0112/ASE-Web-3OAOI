// React套件
import { useCallback, useContext, useEffect, useMemo, useReducer } from 'react'

// MUI套件
import {
    Box,
    Card,
    Dialog,
    DialogTitle,
    DialogContent,
    Grid,
    IconButton,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material'
import { styled } from '@mui/system'
import CloseIcon from '@mui/icons-material/Close'

// 外部套件
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'
import NoDataToDisplay from 'highcharts/modules/no-data-to-display'
HighchartsMore(Highcharts)
NoDataToDisplay(Highcharts)

// 自定義套件
import { AppContext } from '../../Context.jsx'
import { calculateMachineData, calculateAverages, calculateTotals, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange } from '../../Function.jsx'
import Loader from '../Loader.jsx'
import useChartOptions from '../chart/useChartOptions.jsx'
import CardTitle from '../chart/CardTitle.jsx'

// 樣式定義
const StyledCard = styled(Card)({
    border: '1px solid #9AD09C',
    minHeight: 200,
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: 3
})

const ChartContainer = styled(Grid)({
    padding: 2
})

const StyledTabs = styled(Tabs)({
    backgroundColor: '#e8f5e9',
    '& .MuiTab-root': {
        color: '#333',
        '&.Mui-selected': {
            color: '#2e7d32',
            fontWeight: 'bold'
        }
    }
})

const AlertTab = styled(({ isAlert, ...other }) => <Tab {...other} />)(({ isAlert }) => ({
    '&.MuiTab-root': {
        ...(isAlert && {
            backgroundColor: '#ffe6e6',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
                '0%': { backgroundColor: '#ffe6e6' },
                '50%': { backgroundColor: '#ffcccc' },
                '100%': { backgroundColor: '#ffe6e6' }
            }
        })
    }
}))

const StyledTableContainer = styled(TableContainer)({
    '& .MuiTableCell-root': {
        padding: '8px 16px',
    }
})

const TableHeaderRow = styled(TableRow)({
    backgroundColor: '#e8f5e9',
    '& .MuiTableCell-root': {
        fontWeight: 'bold',
        color: '#2e7d32',
    }
})

const initialState = {
    bdData: {},
    machineData: {},
    selectedBdTab: 0,
    selectedMachineTab: 0,
    isLoading: true,
    chartsReady: false,
    showMonthly: false,
    dialogOpen: false,
    detailData: null
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_BD_DATA':
            return { ...state, bdData: action.payload }
        case 'SET_MACHINE_DATA':
            return { ...state, machineData: action.payload }
        case 'SET_SELECTED_BD_TAB':
            return { ...state, selectedBdTab: action.payload }
        case 'SET_SELECTED_MACHINE_TAB':
            return { ...state, selectedMachineTab: action.payload }
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'SET_CHARTS_READY':
            return { ...state, chartsReady: action.payload }
        case 'SET_SHOW_MONTHLY':
            return { ...state, showMonthly: action.payload }
        case 'SET_DIALOG_OPEN':
            return { ...state, dialogOpen: action.payload }
        case 'SET_DETAIL_DATA':
            return { ...state, detailData: action.payload }
        default:
            return state
    }
}

// Overall Daily Summary
const SummaryTable = ({ data }) => {
    const yesterdayData = useMemo(() => {
        // 取得昨天的日期
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayString = yesterday.toISOString().split('T')[0]

        // 過濾出昨天的資料並分組計算
        const groupedData = data
            .filter(item => item.Ao_Time_Start.split(' ')[0] === yesterdayString)
            .reduce((acc, item) => {
                const key = `${item.Drawing_No}-${item.Device_Id}`
                if (!acc[key]) {
                    acc[key] = {
                        Drawing_No: item.Drawing_No,
                        Device_Id: item.Device_Id,
                        Pass_Rate: [],
                        Overkill_Rate: []
                    }
                }
                acc[key].Pass_Rate.push(parseFloat(item.Pass_Rate))
                acc[key].Overkill_Rate.push(parseFloat(item.Overkill_Rate))
                return acc
            }, {})

        // 計算每組的平均值
        return Object.values(groupedData).map(group => ({
            Drawing_No: group.Drawing_No,
            Device_Id: group.Device_Id,
            Pass_Rate: ((group.Pass_Rate.reduce((a, b) => a + b, 0) / group.Pass_Rate.length) * 100).toFixed(1),
            Overkill_Rate: ((group.Overkill_Rate.reduce((a, b) => a + b, 0) / group.Overkill_Rate.length) * 100).toFixed(1)
        })).sort((a, b) => b.Overkill_Rate - a.Overkill_Rate)
    }, [data])

    // 計算總平均值
    const averagePassRate = yesterdayData.length ?
        parseFloat((yesterdayData.reduce((sum, item) => sum + parseFloat(item.Pass_Rate), 0) / yesterdayData.length).toFixed(2)) : 0
    const averageOverkillRate = yesterdayData.length ?
        parseFloat((yesterdayData.reduce((sum, item) => sum + parseFloat(item.Overkill_Rate), 0) / yesterdayData.length).toFixed(2)) : 0

    return (
        <StyledTableContainer component={Paper}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableHeaderRow>
                        <TableCell>BD</TableCell>
                        <TableCell>Device</TableCell>
                        <TableCell align="right">Pass Rate (%)</TableCell>
                        <TableCell align="right">Overkill (%)</TableCell>
                    </TableHeaderRow>
                </TableHead>
                <TableBody>
                    {yesterdayData.map((row, index) => (
                        <TableRow
                            key={index}
                            style={{
                                border: parseFloat(row.Overkill_Rate) > 5 ? '2px solid red' : 'inherit',
                                backgroundColor: parseFloat(row.Overkill_Rate) > 5 ? '#ffe6e6' : 'inherit'
                            }}
                        >
                            <TableCell>{row.Drawing_No}</TableCell>
                            <TableCell>{row.Device_Id}</TableCell>
                            <TableCell align="right">{row.Pass_Rate}%</TableCell>
                            <TableCell align="right">{row.Overkill_Rate}%</TableCell>
                        </TableRow>
                    ))}
                    {yesterdayData.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No data available for today
                            </TableCell>
                        </TableRow>
                    )}
                    {yesterdayData.length > 1 && (
                        <TableRow>
                            <TableCell colSpan={2} align="right">總計</TableCell>
                            <TableCell align="right">{averagePassRate}%</TableCell>
                            <TableCell align="right">{averageOverkillRate}%</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </StyledTableContainer>
    )
}

// 控制 Overall & BD 圖表渲染
const ChartComponent = ({ data, title, sx, showMonthly = false, onColumnClick }) => {
    const { createBaseChartOptions } = useChartOptions()
    const periods = showMonthly ? ['Daily', 'Weekly', 'Monthly'] : ['Daily', 'Weekly']
    const gridSize = showMonthly ? 4 : 6

    return (
        <ChartContainer container spacing={2} sx={sx}>
            {periods.map((period) => {
                const options = createBaseChartOptions(data[period.toLowerCase()], period, title)

                // 彈窗點擊事件
                if (options.series?.[0]) {
                    options.plotOptions.series = {
                        ...options.plotOptions.series,
                        events: {
                            click: function (event) {
                                if (event.point && event.point.category) {
                                    onColumnClick(title, event.point.category, period.toLowerCase())
                                }
                            }
                        }
                    }
                }

                return (
                    <Grid item xs={12} md={gridSize} key={period}>
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={options}
                        />
                    </Grid>
                )
            })}
        </ChartContainer>
    )
}

// 控制作業數量圖表渲染
const OperationChartComponent = ({ data, title, sx, showMonthly = false }) => {
    const { createOperationChartOptions } = useChartOptions()
    const periods = showMonthly ? ['Daily', 'Weekly', 'Monthly'] : ['Daily', 'Weekly']
    const gridSize = showMonthly ? 4 : 6

    return (
        <ChartContainer container spacing={2} sx={sx}>
            {periods.map((period) => (
                <Grid item xs={12} md={gridSize} key={period}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={createOperationChartOptions(data[period.toLowerCase()], period, title)}
                    />
                </Grid>
            ))}
        </ChartContainer>
    )
}

// 控制機台圖表渲染
const MachineChartComponent = ({ data, title, sx, showMonthly = false }) => {
    const { createMachineChartOptions } = useChartOptions()
    const periods = showMonthly ? ['Daily', 'Weekly', 'Monthly'] : ['Daily', 'Weekly']
    const gridSize = showMonthly ? 4 : 6

    return (
        <ChartContainer container spacing={2} sx={sx}>
            {periods.map((period) => (
                <Grid item xs={12} md={gridSize} key={period}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={createMachineChartOptions(data[period.toLowerCase()], period, title)}
                    />
                </Grid>
            ))}
        </ChartContainer>
    )
}

const Dashboard = () => {
    const { aoiData } = useContext(AppContext)
    const [state, dispatch] = useReducer(reducer, initialState)
    const {
        bdData,
        machineData,
        selectedBdTab,
        selectedMachineTab,
        isLoading,
        chartsReady,
        showMonthly,
        dialogOpen,
        detailData
    } = state

    // 添加點擊事件處理函數
    const handleColumnClick = useCallback(async (deviceId, date, period = 'daily') => {
        try {
            const response = await fetch('http://10.11.33.122:1234/thirdAOI.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'getDetailsByDate',
                    deviceId,
                    date,
                    periodType: period
                })
            })
            const data = await response.json()
            if (data.success) {
                dispatch({ type: 'SET_DETAIL_DATA', payload: { deviceId, date, data: data.results } })
                dispatch({ type: 'SET_DIALOG_OPEN', payload: true })
            }
        } catch (error) {
            console.error('Error fetching details:', error)
        }
    }, [])

    // 關閉查詢對話框
    const handleClose = () => {
        dispatch({ type: 'SET_DIALOG_OPEN', payload: false })
    }

    const renderChart = (data, title, showMonthly) => data && (
        <ChartComponent
            data={data}
            title={title}
            sx={{ padding: 2 }}
            showMonthly={showMonthly}
            onColumnClick={handleColumnClick}
        />
    )

    const GetUniqueSortedList = (key, data) => useMemo(() =>
        [...new Set(data.map(item => item[key]))].sort(), [data, key])

    const bdList = GetUniqueSortedList('Device_Id', aoiData)
    const machineList = GetUniqueSortedList('Machine_Id', aoiData)

    useEffect(() => {
        let mounted = true
        const initializeData = async () => {
            try {
                if (!aoiData || aoiData.length === 0) return
                dispatch({ type: 'SET_LOADING', payload: true })

                const processData = (data, key, type) => ({
                    [key]: type === 'bd' ? {
                        daily: calculateAverages(filterDataByDateRange(data, 7), 'daily'),
                        weekly: calculateAverages(filterDataByWeekRange(data, 5), 'weekly'),
                        monthly: calculateAverages(filterDataByMonthRange(data, 3), 'monthly')
                    } : {
                        daily: calculateMachineData(filterDataByDateRange(data, 1)),
                        weekly: calculateMachineData(filterDataByWeekRange(data, 1)),
                        monthly: calculateMachineData(filterDataByMonthRange(data, 1))
                    }
                })

                const updateData = (list, filterKey, type) =>
                    list.reduce((acc, item) => ({
                        ...acc,
                        ...processData(aoiData.filter(data => data[filterKey] === item), item, type)
                    }), {})

                const bdResult = updateData(bdList, 'Device_Id', 'bd')
                const machineResult = updateData(machineList, 'Machine_Id', 'machine')

                if (mounted) {
                    dispatch({ type: 'SET_BD_DATA', payload: bdResult })
                    dispatch({ type: 'SET_MACHINE_DATA', payload: machineResult })
                    dispatch({ type: 'SET_CHARTS_READY', payload: true })
                    dispatch({ type: 'SET_LOADING', payload: false })
                }
            } catch (error) {
                console.error('Error loading chart data:', error)
                if (mounted) dispatch({ type: 'SET_LOADING', payload: false })
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
            {/* Summary Card */}
            <StyledCard>
                <CardTitle title="Summary" />
                <SummaryTable data={aoiData} />
            </StyledCard>

            {/* Overall Card */}
            <StyledCard>
                <CardTitle
                    title="Overall"
                    showSwitch={true}
                    switchChecked={showMonthly}
                    onSwitchChange={(e) => dispatch({
                        type: 'SET_SHOW_MONTHLY',
                        payload: e.target.checked
                    })}
                />
                {renderChart(overallData, 'Overall', showMonthly)}
            </StyledCard>

            {/* Operation Card */}
            <StyledCard>
                <CardTitle
                    title="作業數量"
                    showSwitch={true}
                    switchChecked={showMonthly}
                    onSwitchChange={(e) => dispatch({
                        type: 'SET_SHOW_MONTHLY',
                        payload: e.target.checked
                    })}
                />
                <OperationChartComponent
                    data={operationData}
                    title="BST 作業數量"
                    sx={{ padding: 2 }}
                    showMonthly={showMonthly}
                />
            </StyledCard>

            {/* B/D Card */}
            <StyledCard>
                <CardTitle
                    title="By B/D"
                    showSwitch={true}
                    switchChecked={showMonthly}
                    onSwitchChange={(e) => dispatch({
                        type: 'SET_SHOW_MONTHLY',
                        payload: e.target.checked
                    })}
                />
                <StyledTabs
                    scrollButtons="auto"
                    variant="scrollable"
                    value={selectedBdTab}
                    onChange={(e, newValue) => dispatch({
                        type: 'SET_SELECTED_BD_TAB',
                        payload: newValue
                    })}
                >
                    {bdList.map((bd, index) => {
                        const bdDataSet = bdData[bd]?.daily || []
                        const lastDataPoint = bdDataSet[bdDataSet.length - 1]
                        const isOverThreshold = lastDataPoint?.averageOverkillRate > 1

                        return (
                            <AlertTab
                                key={bd}
                                label={isOverThreshold ? `${bd} ⚠️` : bd}
                                value={index}
                                isAlert={isOverThreshold}
                            />
                        )
                    })}
                </StyledTabs>
                {renderChart(bdData[bdList[selectedBdTab]],
                    `${bdList[selectedBdTab]}`,
                    showMonthly)}
            </StyledCard>

            {/* M/C Card */}
            <StyledCard>
                <CardTitle
                    title="By M/C"
                    showSwitch={true}
                    switchChecked={showMonthly}
                    onSwitchChange={(e) => dispatch({
                        type: 'SET_SHOW_MONTHLY',
                        payload: e.target.checked
                    })}
                />
                <StyledTabs
                    scrollButtons="auto"
                    variant="scrollable"
                    value={selectedMachineTab}
                    onChange={(e, newValue) => dispatch({
                        type: 'SET_SELECTED_MACHINE_TAB',
                        payload: newValue
                    })}
                >
                    {machineList.map((machine, index) => (
                        <Tab key={machine} label={machine} value={index} />
                    ))}
                </StyledTabs>
                <MachineChartComponent
                    data={machineData[machineList[selectedMachineTab]]}
                    title={`機台 ${machineList[selectedMachineTab]}`}
                    sx={{ padding: 2 }}
                    showMonthly={showMonthly}
                />
            </StyledCard>

            {/* By機台作業狀況彈窗 */}
            <Dialog
                open={dialogOpen}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {`${detailData?.deviceId} - ${detailData?.date} 機台作業狀況`}
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'gray',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {detailData && (
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={{
                                title: { text: 'By 機台作業狀況' },
                                credits: { enabled: false },
                                exporting: { enabled: false },
                                accessibility: { enabled: false },
                                plotOptions: {
                                    series: {
                                        dataLabels: {
                                            enabled: true,
                                            formatter: function () {
                                                return this.series.name === 'Fail PPM'
                                                    ? this.y.toLocaleString()
                                                    : this.y.toLocaleString() + '%'
                                            },
                                            style: { fontSize: '10px' }
                                        }
                                    }
                                },
                                xAxis: {
                                    categories: [...new Set(detailData.data.map(d => d.Machine_Id))].sort()
                                },
                                yAxis: [{
                                    title: { text: 'Rate (%)' },
                                    min: 0,
                                    max: 100,
                                    labels: {
                                        format: '{value}%'
                                    }
                                }, {
                                    title: { text: 'PPM' },
                                    opposite: true
                                }],
                                series: [{
                                    name: 'Fail PPM',
                                    type: 'column',
                                    yAxis: 1,
                                    data: [...new Set(detailData.data.map(d => d.Machine_Id))]
                                        .sort()
                                        .map(machineId => {
                                            const machineData = detailData.data.filter(d => d.Machine_Id === machineId)
                                            const avgFailPpm = parseFloat((machineData.reduce((sum, d) =>
                                                sum + parseFloat(d.Fail_Ppm), 0) / machineData.length).toFixed(0))
                                            return avgFailPpm
                                        })
                                }, {
                                    name: 'Pass Rate',
                                    type: 'spline',
                                    data: [...new Set(detailData.data.map(d => d.Machine_Id))]
                                        .sort()
                                        .map(machineId => {
                                            const machineData = detailData.data.filter(d => d.Machine_Id === machineId)
                                            const avgPassRate = parseFloat((machineData.reduce((sum, d) =>
                                                sum + parseFloat(d.Pass_Rate), 0) / machineData.length * 100).toFixed(1))
                                            return avgPassRate
                                        })
                                }, {
                                    name: 'Overkill Rate',
                                    type: 'spline',
                                    data: [...new Set(detailData.data.map(d => d.Machine_Id))]
                                        .sort()
                                        .map(machineId => {
                                            const machineData = detailData.data.filter(d => d.Machine_Id === machineId)
                                            const avgOverkillRate = parseFloat((machineData.reduce((sum, d) =>
                                                sum + parseFloat(d.Overkill_Rate), 0) / machineData.length * 100).toFixed(1))
                                            return avgOverkillRate
                                        })
                                }],
                                tooltip: {
                                    shared: true,
                                    crosshairs: true,
                                    formatter: function () {
                                        let s = `<b>${this.x}</b>`
                                        this.points.forEach(point => {
                                            s += `<br/><span style="color:${point.series.color}">${point.series.name}</span>: <b>${point.series.name === 'Fail PPM' ? point.y : point.y + '%'}</b>`
                                        })
                                        return s
                                    }
                                },
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    )
}

export default Dashboard