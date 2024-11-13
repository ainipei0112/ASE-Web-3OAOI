// React套件
import { useContext, useEffect, useMemo, useReducer } from 'react'

// MUI套件
import {
    Box,
    Card,
    FormControlLabel,
    Grid,
    Switch,
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

// 自定義套件
import { AppContext } from '../../Context.jsx'
import { calculateAverages, calculateTotals, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange } from '../../Function.jsx'
import Loader from '../Loader.jsx'
import useChartOptions from '../chart/useChartOptions.jsx'
import CardTitle from '../chart/CardTitle.jsx'

// 樣式定義
const StyledCard = styled(Card)({
    border: '1px solid #9AD09C',
    minHeight: 400,
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
    showMonthly: false
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
        default:
            return state
    }
}

const ChartComponent = ({ data, title, sx, showMonthly = false }) => {
    const { createBaseChartOptions } = useChartOptions()
    const periods = showMonthly ? ['Daily', 'Weekly', 'Monthly'] : ['Daily', 'Weekly']
    const gridSize = showMonthly ? 4 : 6

    return (
        <ChartContainer container spacing={2} sx={sx}>
            {periods.map((period) => (
                <Grid item xs={12} md={gridSize} key={period}>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={createBaseChartOptions(data[period.toLowerCase()], period, title)}
                    />
                </Grid>
            ))}
        </ChartContainer>
    )
}

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

const renderChart = (data, title, showMonthly) => data && (
    <ChartComponent data={data} title={title} sx={{ padding: 2 }} showMonthly={showMonthly} />
)

const SummaryTable = ({ data }) => {
    const todayData = useMemo(() => {
        // 取得昨天的日期
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayString = yesterday.toISOString().split('T')[0]

        // 過濾出昨天的資料
        return data
            .filter(item => item.Ao_Time_Start.split(' ')[0] === yesterdayString)
            .map(item => ({
                Device_Id: item.Device_Id,
                Drawing_No: item.Drawing_No,
                Pass_Rate: item.Pass_Rate,
                Overkill_Rate: item.Overkill_Rate
            }))
            .sort((a, b) => b.Overkill_Rate - a.Overkill_Rate)
    }, [data])

    // 計算平均值
    const averagePassRate = todayData.reduce((sum, item) => sum + parseFloat(item.Pass_Rate), 0) / todayData.length
    const averageOverkillRate = todayData.reduce((sum, item) => sum + parseFloat(item.Overkill_Rate), 0) / todayData.length

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
                    {Object.values(todayData).map((row, index) => (
                        <TableRow key={index} style={{ border: parseFloat(row.Overkill_Rate) > 1 ? '2px solid red' : 'inherit', backgroundColor: parseFloat(row.Overkill_Rate) > 1 ? '#ffe6e6' : 'inherit' }}>
                            <TableCell>{row.Drawing_No}</TableCell>
                            <TableCell>{row.Device_Id}</TableCell>
                            <TableCell align="right">{row.Pass_Rate}</TableCell>
                            <TableCell align="right">{row.Overkill_Rate}</TableCell>
                        </TableRow>
                    ))}
                    {Object.values(todayData).length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No data available for today
                            </TableCell>
                        </TableRow>
                    )}
                    {/* 加入平均值顯示 */}
                    {todayData.length > 1 && (
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
        showMonthly
    } = state

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
                <CardTitle title="Summary ( 5%太高沒資料 暫時卡1% )" />
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
                    // scrollButtons="auto"
                    // variant="scrollable"
                    value={selectedBdTab}
                    onChange={(e, newValue) => dispatch({
                        type: 'SET_SELECTED_BD_TAB',
                        payload: newValue
                    })}
                >
                    {bdList.map((bd, index) => (
                        <Tab key={bd} label={bd} value={index} />
                    ))}
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
                    // scrollButtons="auto"
                    // variant="scrollable"
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
                {renderChart(machineData[machineList[selectedMachineTab]],
                    `機台 ${machineList[selectedMachineTab]}`,
                    showMonthly)}
            </StyledCard>
        </Box>
    )
}

export default Dashboard