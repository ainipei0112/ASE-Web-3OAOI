// React套件
import { useCallback, useContext, useEffect, useMemo, useReducer } from 'react'

// MUI套件
import {
    Box,
    Card,
    Chip,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
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
import { calculateBdData, calculateMachineData, filterDataByDateRange, filterDataByWeekRange, filterDataByMonthRange } from '../../Function.jsx'
import Loader from '../global/Loader.jsx'
import useChartOptions from './useChartOptions.jsx'
import CardTitle from './CardTitle.jsx'

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
    overallDialogOpen: false,
    overallDetailData: null,
    bdDialogOpen: false,
    bdDetailData: null,
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
        case 'SET_OVERALL_DIALOG_OPEN':
            return { ...state, overallDialogOpen: action.payload }
        case 'SET_OVERALL_DETAIL_DATA':
            return { ...state, overallDetailData: action.payload }
        case 'SET_BD_DIALOG_OPEN':
            return { ...state, bdDialogOpen: action.payload }
        case 'SET_BD_DETAIL_DATA':
            return { ...state, bdDetailData: action.payload }
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
                                border: parseFloat(row.Overkill_Rate) > 5 ? '2px' : 'inherit',
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
const ChartComponent = ({ data, title, sx }) => {
    const { createBaseChartOptions } = useChartOptions()

    return (
        <ChartContainer container spacing={2} sx={sx}>
            <Grid item xs={12}>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={createBaseChartOptions(data.daily, 'Daily', title)}
                />
            </Grid>
        </ChartContainer>
    )
}

const DashboardContent = () => {
    const { aoiData, getBDDetailsByOverall, getDetailsByDate } = useContext(AppContext)
    const [state, dispatch] = useReducer(reducer, initialState)
    const {
        bdData,
        isLoading,
        chartsReady,
        showMonthly,
    } = state

    // Overall 柱狀圖點擊事件
    const handleOverallColumnClick = useCallback(async (date, period) => {
        try {
            const data = await getBDDetailsByOverall(date, period)
            dispatch({
                type: 'SET_OVERALL_DETAIL_DATA',
                payload: {
                    date,
                    period,
                    data
                }
            })
            dispatch({ type: 'SET_OVERALL_DIALOG_OPEN', payload: true })
        } catch (error) {
            console.error('Error fetching Overall details:', error)
        }
    }, [getBDDetailsByOverall])

    // B/D 柱狀圖點擊事件
    const handleBDColumnClick = useCallback(async (deviceId, date, period = 'daily') => {
        try {
            const data = await getDetailsByDate(deviceId, date, period)
            dispatch({ type: 'SET_BD_DETAIL_DATA', payload: { deviceId, date, period, data } })
            dispatch({ type: 'SET_BD_DIALOG_OPEN', payload: true })
        } catch (error) {
            console.error('Error fetching B/D details:', error)
        }
    }, [getDetailsByDate])

    // 控制月報表按鈕顯示
    const handleSwitchChange = useCallback((e) => {
        dispatch({
            type: 'SET_SHOW_MONTHLY',
            payload: e.target.checked
        })
    }, [])

    // 資料處理
    const overallData = useMemo(() => ({
        daily: calculateBdData(filterDataByDateRange(aoiData, 7), 'daily'),
        weekly: calculateBdData(filterDataByWeekRange(aoiData, 5), 'weekly'),
        monthly: calculateBdData(filterDataByMonthRange(aoiData, 3), 'monthly')
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
        <>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}
            >
                <Typography variant="h6">
                    是否需要派報
                </Typography>
                {bdList.some(bd => {
                    const bdDataSet = bdData[bd]?.daily || []
                    const lastDataPoint = bdDataSet[bdDataSet.length - 1]
                    return lastDataPoint?.averageOverkillRate > 5
                }) ? (
                    <Chip label="Y" color="error" />
                ) : (
                    <Chip label="N" color="success" />
                )}
            </Box>
            <Box
                sx={{
                    width: '1000px',
                }}
                id="mailcontent"
            >
                {/* Summary Card */}
                <StyledCard>
                    <CardTitle title="Summary" />
                    <SummaryTable data={aoiData} />
                </StyledCard>
                {/* Overall Card */}
                <StyledCard>
                    <CardTitle
                        title="Overall"
                        showSwitch={false}
                        switchChecked={showMonthly}
                        onSwitchChange={handleSwitchChange}
                    />
                    <ChartComponent
                        data={overallData}
                        title={'Overall'}
                        sx={{ padding: 2 }}
                        showMonthly={showMonthly}
                        onColumnClick={handleOverallColumnClick}
                    />
                </StyledCard>
            </Box>
            <Box
                sx={{
                    width: '1000px',
                }}
                id="mailcontent2"
            >
                {/* B/D Card */}
                <StyledCard>
                    <CardTitle title="By B/D" />
                    {bdList.map((bd) => {
                        const bdDataSet = bdData[bd]?.daily || []
                        const lastDataPoint = bdDataSet[bdDataSet.length - 1]
                        const isOverThreshold = lastDataPoint?.averageOverkillRate > 5
                        if (!isOverThreshold) return null
                        return (
                            <Box key={bd}>
                                <Typography variant="h6" sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                                    {bd}
                                </Typography>
                                <ChartComponent
                                    data={bdData[bd]}
                                    title={bd}
                                    sx={{ padding: 2 }}
                                    onColumnClick={handleBDColumnClick}
                                />
                            </Box>
                        )
                    })}
                </StyledCard>
            </Box>
        </>
    )
}

export default DashboardContent