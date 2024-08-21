import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardHeader,
    Checkbox,
    FormControlLabel,
    Radio,
    RadioGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material'
import { grey } from '@mui/material/colors'
import BarChartIcon from '@mui/icons-material/BarChart'
import EditIcon from '@mui/icons-material/Edit'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { styled } from '@mui/system'
import { useContext, useMemo, useReducer } from 'react'
import { AppContext } from '/src/Context.jsx'
import { calculateAverages, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange } from '/src/Function'

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

// 定義樣式
const TableHeaderCell = styled(TableCell)`
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    border: 1px solid;
    padding: 0px;
    width: auto;
`

const FirstColumnCell = styled(TableCell)`
    font-size: 10px;
    font-weight: bold;
    text-align: center;
    border: 1px solid;
    padding: 0px;
    width: auto;
`

const TableBodyCell = styled(TableCell)`
    font-size: 9px;
    text-align: center;
    border: 1px solid;
    padding: 4px;
    width: auto;
`

// 表格初始化
const tableData = [
    { label: 'Fail PPM', data: Array(15).fill(0) },
    { label: 'Overkill Rate', data: Array(15).fill(0) },
    { label: 'Pass Rate', data: Array(15).fill(0) }
]

const initialState = {
    period: ['monthly', 'weekly', 'daily'],
    updatedTableData: tableData,
    chartType: 'BD圖',
    selectedBD: null,
    selectedMachine: null,
    showTable: false,
    showChart: false,
    chartTitle: '',
    combinedData: []
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_TABLE_DATA':
            return { ...state, updatedTableData: action.payload }
        case 'SET_PERIOD':
            return { ...state, period: action.payload }
        case 'SET_CHART_TYPE':
            return { ...state, selectedBD: null, selectedMachine: null, chartType: action.payload }
        case 'SELECT_BD':
            return { ...state, selectedBD: action.payload }
        case 'SELECT_MACHINE':
            return { ...state, selectedMachine: action.payload }
        case 'TOGGLE_SHOW_TABLE':
            return { ...state, showTable: action.payload }
        case 'TOGGLE_SHOW_CHART':
            return { ...state, showChart: action.payload }
        case 'SET_CHART_TITLE':
            return { ...state, chartTitle: action.payload }
        case 'SET_COMBINED_DATA':
            return { ...state, combinedData: action.payload }
        default:
            return state
    }
}

const ChartContent = () => {
    const { aoiData, searchByCondition, exportdataByCondition } = useContext(AppContext)
    const [state, dispatch] = useReducer(reducer, initialState)
    const {
        updatedTableData,
        period,
        chartType,
        selectedBD,
        selectedMachine,
        showTable,
        showChart,
        chartTitle,
        combinedData
    } = state

    // 監控鍵盤按鍵
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleQuery()
        }
    }

    // 提交查詢條件
    const handleQuery = async () => {
        const searchData = await searchByCondition(selectedBD, selectedMachine)
        const combinedData = processData(searchData)
        dispatch({ type: 'UPDATE_TABLE_DATA', payload: updateTableData(combinedData) })
        dispatch({ type: 'TOGGLE_SHOW_CHART', payload: true })
        dispatch({ type: 'TOGGLE_SHOW_TABLE', payload: true })

        let newTitle = 'Fail PPM & Pass & Overkill rate By '
        if (chartType === 'BD圖') {
            newTitle += selectedBD || 'ALL'
        } else if (chartType === '機台') {
            newTitle += selectedMachine || 'ALL'
        }

        dispatch({ type: 'SET_CHART_TITLE', payload: newTitle })
        dispatch({ type: 'SET_COMBINED_DATA', payload: combinedData })
    }

    // 匯出查詢資料
    const handleExport = async () => {
        const exportExcel = await exportdataByCondition(selectedBD, selectedMachine)
        exportToExcel(exportExcel, '3rdaoidata_(Security C)')
    }
    // 處理並整合各週期資料
    const processData = (searchData) => {
        const threeMonthsData = filterDataByMonthRange(searchData, 3) //三月
        const fiveWeeksData = filterDataByWeekRange(searchData, 5) //五週
        const sevenDaysData = filterDataByDateRange(searchData, 7) //七日

        // 計算平均並合併資料
        const threeMonthsAverage = calculateAverages(threeMonthsData, 'monthly')
        const fiveWeeksAverage = calculateAverages(fiveWeeksData, 'weekly')
        const sevenDaysAverage = calculateAverages(sevenDaysData, 'daily')
        return threeMonthsAverage.concat(fiveWeeksAverage, sevenDaysAverage)
    }

    // 匯出Excel
    const exportToExcel = (data, fileName) => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Sheet1')

        // 設置列標題
        worksheet.columns = [
            { header: '日期', key: 'Ao_Time_Start', width: 20 },
            { header: 'Schedule', key: 'Device_Id', width: 30 },
            { header: '條號', key: 'Strip_No', width: 10 },
            { header: 'Fail Ppm', key: 'Fail_Ppm', width: 10 },
            { header: 'Pass Rate(%)', key: 'Pass_Rate', width: 15 },
            { header: 'Overall Overkill率(%)', key: 'Overkill_Rate', width: 20 },
            { header: '機台 No.', key: 'Machine_Id', width: 10 },
            { header: '圖號', key: 'Drawing_No', width: 20 }
        ]

        // 添加數據
        data.forEach(item => {
            worksheet.addRow(item)
        })

        // 設置格式
        worksheet.getRow(1).font = { bold: true }
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
                if (rowNumber === 1) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF00' }
                    }
                }
            })
        })

        // 保存文件
        workbook.xlsx.writeBuffer().then(buffer => {
            saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${fileName}.xlsx`)
        })
    }

    // BD選單
    const bdOptions = useMemo(
        () =>
            [...new Set(aoiData.map(({ Drawing_No }) => Drawing_No))]
                .sort()
                .map((Drawing_No) => ({ title: Drawing_No })),
        [aoiData],
    )

    // 機台選單
    const machineOptions = useMemo(
        () =>
            [...new Set(aoiData.map(({ Machine_Id }) => Machine_Id))]
                .sort()
                .map((Machine_Id) => ({ title: Machine_Id })),
        [aoiData],
    )

    // 更新表格資料
    const updateTableData = (totals) => {
        const updatedData = [...tableData]
        const values = Object.values(totals)
        updatedData.forEach((row, index) => {
            row.data = values.map((item) => {
                switch (index) {
                    case 0:
                        return item.averageFailPpm
                    case 1:
                        return item.averageOverkillRate
                    case 2:
                        return item.averagePassRate
                    default:
                        return 0
                }
            })
        })
        return updatedData
    }

    // 更新圖表資料
    const filteredData = useMemo(() => {
        let data = []
        if (period.includes('monthly')) {
            data = data.concat(combinedData.filter(d => d.periodType === 'monthly'))
        }
        if (period.includes('weekly')) {
            data = data.concat(combinedData.filter(d => d.periodType === 'weekly'))
        }
        if (period.includes('daily')) {
            data = data.concat(combinedData.filter(d => d.periodType === 'daily'))
        }
        return data
    }, [period, combinedData])

    // 圖表參數
    const options = useMemo(() => {
        return {
            // 圖表標題
            title: null,
            // 去除 Highcharts.com 字樣
            credits: {
                enabled: false,
            },
            // 無障礙功能關閉
            accessibility: {
                enabled: false,
            },
            // 圖例
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || // theme
                    'rgba(255,255,255,0.25)',
            },
            // 橫座標軸
            xAxis: {
                categories: filteredData.map(data => data.key.includes('-') ? data.key.substring(5) : data.key),
                crosshair: true,
            },
            // 縱座標軸
            yAxis: [
                {
                    title: {
                        //座標軸文字
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[1],
                        },
                    },
                    labels: {
                        //座標軸數值
                        format: '{value}%',
                        style: {
                            color: Highcharts.getOptions().colors[1],
                        },
                    },
                    opposite: true,
                    min: 0,
                    max: 100,
                },
                {
                    title: {
                        text: '',
                        style: {
                            color: Highcharts.getOptions().colors[0],
                        },
                    },
                    labels: {
                        format: '{value} ',
                        style: {
                            color: Highcharts.getOptions().colors[0],
                        },
                    },
                },
            ],
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                    },
                },
                spline: {
                    dataLabels: {
                        enabled: true,
                    },
                },
            },
            series: [
                {
                    name: 'Fail PPM',
                    type: 'column',
                    yAxis: 1,
                    data: filteredData.map(data => parseFloat(data.averageFailPpm))
                },
                {
                    name: 'Pass Rate',
                    type: 'spline',
                    yAxis: 0,
                    tooltip: {
                        valueSuffix: '%',
                    },
                    data: filteredData.map(data => parseFloat(data.averagePassRate))
                },
                {
                    name: 'Overkill Rate',
                    type: 'spline',
                    yAxis: 0,
                    tooltip: {
                        valueSuffix: '%',
                    },
                    data: filteredData.map(data => parseFloat(data.averageOverkillRate))
                }
            ]
        }
    }, [filteredData])

    return (
        <>
            <Card sx={{ border: '1px solid lightgreen', minHeight: 800 }}>
                <Box
                    sx={{
                        height: 45,
                        backgroundColor: '#9AD09C',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'left',
                        padding: '0 10px',
                    }}
                >
                    <BarChartIcon />
                    <span style={{ padding: 10 }}>Chart Report</span>
                </Box>
                <Box sx={{ padding: '10px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        {/* <EditIcon />
                        <span style={{ padding: 10 }}>Period： </span>
                        <Checkbox defaultChecked sx={{ color: 'gray' }} /> Daily
                        <Checkbox sx={{ color: 'gray' }} /> Weekly
                        <Checkbox sx={{ color: 'gray' }} /> Monthly
                        <span style={{ padding: 30 }}> </span> */}
                        <EditIcon />
                        <span style={{ padding: 10 }}>圖表類型： </span>
                        <RadioGroup
                            row
                            value={chartType}
                            onChange={(event) => dispatch({ type: 'SET_CHART_TYPE', payload: event.target.value })}
                        >
                            <FormControlLabel
                                value='BD圖'
                                control={<Radio sx={{ color: grey[600] }} />}
                                label='BD圖'
                            />
                            <FormControlLabel
                                value='機台'
                                control={<Radio sx={{ color: grey[600] }} />}
                                label='機台'
                            />
                            <FormControlLabel
                                value='作業數量'
                                control={<Radio sx={{ color: grey[600] }} />}
                                label='作業數量'
                            />
                        </RadioGroup>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        {chartType !== '機台' && (
                            <>
                                <EditIcon />
                                <span style={{ padding: 10 }}>BD圖號： </span>
                                <Autocomplete
                                    size='small'
                                    sx={{ width: 230 }}
                                    options={bdOptions}
                                    getOptionLabel={(option) => option.title}
                                    isOptionEqualToValue={(option, value) => option.title === value.title}
                                    renderInput={(params) => <TextField {...params} placeholder={'BD圖號'} />}
                                    key={`bd-${chartType}`}
                                    value={selectedBD ? { title: selectedBD } : null}
                                    onChange={(event, newValue) => {
                                        if (newValue === null) {
                                            dispatch({ type: 'SELECT_BD', payload: null })
                                        } else {
                                            dispatch({ type: 'SELECT_BD', payload: newValue.title })
                                        }
                                    }}
                                />
                            </>
                        )}
                        {chartType !== 'BD圖' && (
                            <>
                                <EditIcon style={{ marginLeft: chartType !== '機台' ? 80 : 0 }} />
                                <span style={{ padding: 10 }}>機台號： </span>
                                <Autocomplete
                                    size='small'
                                    sx={{ width: 210 }}
                                    options={machineOptions}
                                    getOptionLabel={(option) => option.title}
                                    isOptionEqualToValue={(option, value) => option.title === value.title}
                                    renderInput={(params) => <TextField {...params} placeholder={'機台號'} />}
                                    key={`machine-${chartType}`}
                                    value={selectedMachine ? { title: selectedMachine } : null}
                                    onChange={(event, newValue) => {
                                        if (newValue === null) {
                                            dispatch({ type: 'SELECT_MACHINE', payload: null })
                                        } else {
                                            dispatch({ type: 'SELECT_MACHINE', payload: newValue.title })
                                        }
                                    }}
                                />
                            </>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
                        <Button
                            variant='contained'
                            sx={{ marginRight: '10px' }}
                            onClick={handleQuery}
                            onKeyDown={handleKeyPress}
                        >
                            Query
                        </Button>
                        <Button
                            variant='contained'
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                    </Box>
                </Box>
                {showChart && (
                    <>
                        <CardHeader
                            action={
                                <ToggleButtonGroup
                                    color='primary'
                                    value={period}
                                    exclusive={false}
                                    onChange={(event, newPeriod) => {
                                        dispatch({ type: 'SET_PERIOD', payload: newPeriod })
                                    }}
                                >
                                    <ToggleButton value='monthly'>月</ToggleButton>
                                    <ToggleButton value='weekly'>週</ToggleButton>
                                    <ToggleButton value='daily'>日</ToggleButton>
                                </ToggleButtonGroup>
                            }
                            title={state.chartTitle}
                            sx={{ textAlign: 'center', marginLeft: '100px' }}
                        />
                        <HighchartsReact highcharts={Highcharts} options={options} />
                    </>
                )}
                {showTable && (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>DATE</TableHeaderCell>
                                    {combinedData.map((data) => (
                                        <TableHeaderCell key={data.key}>
                                            {data.key.includes('-') ? data.key.substring(5) : data.key}
                                        </TableHeaderCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {updatedTableData.map((row, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                        <FirstColumnCell>
                                            {row.label}
                                        </FirstColumnCell>
                                        {row.data.map((value, colIndex) => (
                                            <TableBodyCell key={colIndex}>{value}</TableBodyCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Card>
        </>
    )
}

export default ChartContent