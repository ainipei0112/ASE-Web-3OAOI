// React套件
import { useCallback, useContext, useEffect, useMemo, useReducer } from 'react'

// MUI套件
import {
    Box,
    Card,
    Grid,
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

// 外部套件
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'
import NoDataToDisplay from 'highcharts/modules/no-data-to-display'
HighchartsMore(Highcharts)
NoDataToDisplay(Highcharts)

// 自定義套件
import { AppContext } from '../../Context.jsx'
import { calculateOperationData, calculateBdData, calculateMachineData, filterDataByDateRange, filterDataByWeekRange, filterDataByMonthRange } from '../../Function.jsx'
import Loader from '../global/Loader.jsx'
import useChartOptions from './useChartOptions.jsx'
import CardTitle from './CardTitle.jsx'
import MachineStatusDialog from './MachineStatusDialog.jsx'
import BoxPlotDialog from './BoxPlotDialog'

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
    detailData: null,
    boxPlotDialogOpen: false,
    boxPlotDetailData: null
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
        case 'SET_BOXPLOT_DIALOG_OPEN':
            return { ...state, boxPlotDialogOpen: action.payload }
        case 'SET_BOXPLOT_DETAIL_DATA':
            return { ...state, boxPlotDetailData: action.payload }
        default:
            return state
    }
}

// Summary 表格渲染
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

// Overall & BD 圖表渲染
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

// 作業數量圖表渲染
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

// 機台圖表渲染
const MachineChartComponent = ({ data, title, sx, showMonthly = false, onColumnClick }) => {
    const { createMachineChartOptions } = useChartOptions()
    const periods = showMonthly ? ['Daily', 'Weekly', 'Monthly'] : ['Daily', 'Weekly']
    const gridSize = showMonthly ? 4 : 6

    return (
        <ChartContainer container spacing={2} sx={sx}>
            {periods.map((period) => {
                const options = createMachineChartOptions(data[period.toLowerCase()], period, title)
                // 添加盒鬚圖的點擊事件
                if (options.series?.[0]) {
                    options.plotOptions.series = {
                        ...options.plotOptions.series,
                        events: {
                            click: function (event) {
                                const drawingNo = event.point.series.name // 從 series.name 獲取 drawingNo
                                if (drawingNo) {
                                    // 傳遞機台 ID 和 drawingNo
                                    onColumnClick(
                                        drawingNo,
                                        title.split(' ')[1], // machineId
                                        period.toLowerCase()
                                    )
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

const DashboardContent = () => {
    const { aoiData, getDetailsByDate, getMachineDetailsByBD } = useContext(AppContext)
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

    // BD柱狀圖點擊事件
    const handleBDColumnClick = useCallback(async (deviceId, date, period = 'daily') => {
        try {
            const data = await getDetailsByDate(deviceId, date, period)
            dispatch({ type: 'SET_DETAIL_DATA', payload: { deviceId, date, period, data } })
            dispatch({ type: 'SET_DIALOG_OPEN', payload: true })
        } catch (error) {
            console.error('Error fetching details:', error)
        }
    }, [getDetailsByDate])

    // M/C盒鬚圖點擊事件
    const handleMachineColumnClick = useCallback(async (drawingNo, machineId, period) => {
        try {
            const data = await getMachineDetailsByBD(drawingNo, machineId, period)
            dispatch({
                type: 'SET_BOXPLOT_DETAIL_DATA',
                payload: {
                    deviceId: drawingNo,
                    machineId,
                    period,
                    data
                }
            })
            dispatch({ type: 'SET_BOXPLOT_DIALOG_OPEN', payload: true })
        } catch (error) {
            console.error('Error fetching machine details:', error)
        }
    }, [getMachineDetailsByBD])

    // 關閉彈窗
    const handleClose = useCallback(() => {
        dispatch({ type: 'SET_DIALOG_OPEN', payload: false })
    }, [])

    // 關閉盒鬚圖彈窗
    const handleBoxPlotClose = useCallback(() => {
        dispatch({ type: 'SET_BOXPLOT_DIALOG_OPEN', payload: false })
    }, [])

    // 控制月報表按鈕顯示
    const handleSwitchChange = useCallback((e) => {
        dispatch({
            type: 'SET_SHOW_MONTHLY',
            payload: e.target.checked
        })
    }, [])

    // 控制選擇的BD Tab
    const handleBdTabChange = useCallback((e, newValue) => {
        dispatch({
            type: 'SET_SELECTED_BD_TAB',
            payload: newValue
        })
    }, [])

    // 控制選擇的機台 Tab
    const handleMachineTabChange = useCallback((e, newValue) => {
        dispatch({
            type: 'SET_SELECTED_MACHINE_TAB',
            payload: newValue
        })
    }, [])

    // 資料處理
    const overallData = useMemo(() => ({
        daily: calculateBdData(filterDataByDateRange(aoiData, 7), 'daily'),
        weekly: calculateBdData(filterDataByWeekRange(aoiData, 5), 'weekly'),
        monthly: calculateBdData(filterDataByMonthRange(aoiData, 3), 'monthly')
    }), [aoiData])

    const operationData = useMemo(() => ({
        daily: calculateOperationData(filterDataByDateRange(aoiData, 7), 'daily'),
        weekly: calculateOperationData(filterDataByWeekRange(aoiData, 5), 'weekly'),
        monthly: calculateOperationData(filterDataByMonthRange(aoiData, 3), 'monthly')
    }), [aoiData])

    const GetUniqueSortedList = (key, data) => useMemo(() => [...new Set(data.map(item => item[key]))].sort(), [data, key])
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
                        daily: calculateBdData(filterDataByDateRange(data, 7), 'daily'),
                        weekly: calculateBdData(filterDataByWeekRange(data, 5), 'weekly'),
                        monthly: calculateBdData(filterDataByMonthRange(data, 3), 'monthly')
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

    // 載入動畫
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
                    onSwitchChange={handleSwitchChange}
                />
                <ChartComponent
                    data={overallData}
                    title={'Overall'}
                    sx={{ padding: 2 }}
                    showMonthly={showMonthly}
                    onColumnClick={null}
                />
            </StyledCard>

            {/* Operation Card */}
            <StyledCard>
                <CardTitle
                    title="作業數量"
                    showSwitch={true}
                    switchChecked={showMonthly}
                    onSwitchChange={handleSwitchChange}
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
                    onSwitchChange={handleSwitchChange}
                />
                <StyledTabs
                    scrollButtons="auto"
                    variant="scrollable"
                    value={selectedBdTab}
                    onChange={handleBdTabChange}
                >
                    {bdList.map((bd, index) => {
                        const bdDataSet = bdData[bd]?.daily || []
                        const lastDataPoint = bdDataSet[bdDataSet.length - 1]
                        const isOverThreshold = lastDataPoint?.averageOverkillRate > 5

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
                <ChartComponent
                    data={bdData[bdList[selectedBdTab]]}
                    title={`${bdList[selectedBdTab]}`}
                    sx={{ padding: 2 }}
                    showMonthly={showMonthly}
                    onColumnClick={handleBDColumnClick}
                />
            </StyledCard>

            {/* M/C Card */}
            <StyledCard>
                <CardTitle
                    title="By M/C"
                    showSwitch={true}
                    switchChecked={showMonthly}
                    onSwitchChange={handleSwitchChange}
                />
                <StyledTabs
                    scrollButtons="auto"
                    variant="scrollable"
                    value={selectedMachineTab}
                    onChange={handleMachineTabChange}
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
                    onColumnClick={handleMachineColumnClick}
                />
            </StyledCard>

            {/* By機台作業狀況彈窗 */}
            <MachineStatusDialog
                open={dialogOpen}
                onClose={handleClose}
                detailData={detailData}
            />

            {/* 盒鬚圖彈窗 */}
            <BoxPlotDialog
                open={state.boxPlotDialogOpen}
                onClose={handleBoxPlotClose}
                detailData={state.boxPlotDetailData}
            />
        </Box>
    )
}

export default DashboardContent