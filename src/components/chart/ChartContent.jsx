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
import { useContext, useMemo, useReducer, Fragment } from 'react'
import { AppContext } from '/src/Context.jsx'
import { calculateTotals, calculateAverages, getWeekNumberForDate, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange } from '/src/Function'

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
    isExportEnabled: false,
    showChart: false,
    showTable: false,
    showStripChart: false,
    showStripTable: false,
    chartTitle: '',
    combinedData: [],
    expandedRows: {},
    selectedOperationType: '機台',
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
        case 'SET_EXPORT_ENABLED':
            return { ...state, isExportEnabled: action.payload }
        case 'TOGGLE_SHOW_CHART':
            return { ...state, showChart: action.payload }
        case 'TOGGLE_SHOW_TABLE':
            return { ...state, showTable: action.payload }
        case 'TOGGLE_SHOW_STRIP_CHART':
            return { ...state, showStripChart: action.payload }
        case 'TOGGLE_SHOW_STRIP_TABLE':
            return { ...state, showStripTable: action.payload }
        case 'SET_CHART_TITLE':
            return { ...state, chartTitle: action.payload }
        case 'SET_COMBINED_DATA':
            return { ...state, combinedData: action.payload }
        case 'TOGGLE_EXPANDED_ROW':
            return {
                ...state,
                expandedRows: {
                    ...state.expandedRows,
                    [action.payload]: !state.expandedRows[action.payload] // 切換行的展開狀態
                }
            }
        case 'SET_SELECTED_OPERATION_TYPE':
            return { ...state, selectedOperationType: action.payload }
        default:
            return state
    }
}

const ChartContent = () => {
    const { aoiData, searchByCondition, exportDataByCondition } = useContext(AppContext)
    const [state, dispatch] = useReducer(reducer, initialState)
    const {
        updatedTableData,
        period,
        chartType,
        selectedBD,
        selectedMachine,
        showChart,
        showTable,
        showStripChart,
        showStripTable,
        chartTitle,
        combinedData,
        expandedRows
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
        let combinedData

        // 根據圖表類型計算資料
        if (chartType === 'BD圖' || chartType === '機台') {
            combinedData = averageData(searchData)
            dispatch({ type: 'UPDATE_TABLE_DATA', payload: updateBdAndMachineTableData(combinedData) })
            dispatch({ type: 'TOGGLE_SHOW_CHART', payload: true })
            dispatch({ type: 'TOGGLE_SHOW_TABLE', payload: true })
            dispatch({ type: 'TOGGLE_SHOW_STRIP_CHART', payload: false })
            dispatch({ type: 'TOGGLE_SHOW_STRIP_TABLE', payload: false })
        } else {
            combinedData = sumData(searchData)
            dispatch({ type: 'UPDATE_TABLE_DATA', payload: updateStripTableData(combinedData) })
            dispatch({ type: 'TOGGLE_SHOW_STRIP_CHART', payload: true })
            dispatch({ type: 'TOGGLE_SHOW_STRIP_TABLE', payload: true })
            dispatch({ type: 'TOGGLE_SHOW_CHART', payload: false })
            dispatch({ type: 'TOGGLE_SHOW_TABLE', payload: false })
        }

        // 啟用匯出按鈕
        dispatch({ type: 'SET_EXPORT_ENABLED', payload: true })

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
        const exportExcel = await exportDataByCondition(selectedBD, selectedMachine)
        let fileName = '3rdAoiData_(Security C)' // 預設檔名
        if (selectedBD && selectedMachine) {
            fileName = `${selectedBD}_${selectedMachine}_${fileName}`
        } else if (selectedBD) {
            fileName = `${selectedBD}_${fileName}`
        } else if (selectedMachine) {
            fileName = `${selectedMachine}_${fileName}`
        }

        exportToExcel(exportExcel, fileName)
    }

    // 過濾資料
    const filterData = (searchData) => {
        const threeMonthsData = filterDataByMonthRange(searchData, 3) //三月
        const fiveWeeksData = filterDataByWeekRange(searchData, 5) //五週
        const sevenDaysData = filterDataByDateRange(searchData, 7) //七日
        return { threeMonthsData, fiveWeeksData, sevenDaysData }
    }

    // 計算平均並整合各週期資料
    const averageData = (searchData) => {
        const { threeMonthsData, fiveWeeksData, sevenDaysData } = filterData(searchData)

        const threeMonthsAverage = calculateAverages(threeMonthsData, 'monthly')
        const fiveWeeksAverage = calculateAverages(fiveWeeksData, 'weekly')
        const sevenDaysAverage = calculateAverages(sevenDaysData, 'daily')
        return threeMonthsAverage.concat(fiveWeeksAverage, sevenDaysAverage)
    }

    // 計算總值並整合各週期資料
    const sumData = (searchData) => {
        const { threeMonthsData, fiveWeeksData, sevenDaysData } = filterData(searchData)

        const threeMonthsAverage = calculateTotals(threeMonthsData, 'monthly')
        const fiveWeeksAverage = calculateTotals(fiveWeeksData, 'weekly')
        const sevenDaysAverage = calculateTotals(sevenDaysData, 'daily')
        return threeMonthsAverage.concat(fiveWeeksAverage, sevenDaysAverage)
    }

    // 匯出Excel
    const exportToExcel = (data, fileName) => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Sheet1')

        // 標題列
        worksheet.columns = [
            { header: '日期', key: 'Ao_Time_Start' },
            { header: 'Schedule', key: 'Lot_No' },
            { header: '條號', key: 'Strip_No', style: { numFmt: '0' } },
            { header: 'Fail Ppm', key: 'Fail_Ppm', style: { numFmt: '0' } },
            { header: 'Pass Rate(%)', key: 'Pass_Rate', style: { numFmt: '0.0%' } },
            { header: 'Overkill Rate(%)', key: 'Overkill_Rate', style: { numFmt: '0.0%' } },
            { header: '機台 No.', key: 'Machine_Id' },
            { header: 'Device Id', key: 'Device_Id' },
            { header: '圖號', key: 'Drawing_No' },
            { header: '週別', key: 'Week_Number' }
        ]

        // 根據時間排序資料
        data.sort((a, b) => new Date(a.Ao_Time_Start) - new Date(b.Ao_Time_Start))

        // 數據列
        data.forEach(item => {
            const weekNumber = getWeekNumberForDate(item.Ao_Time_Start)
            worksheet.addRow({
                ...item,
                Strip_No: parseInt(item.Strip_No),
                Pass_Rate: item.Pass_Rate ? item.Pass_Rate / 100 : 0,
                Overkill_Rate: item.Overkill_Rate ? item.Overkill_Rate / 100 : 0,
                Week_Number: weekNumber
            })
        })

        // 標題列格式設置
        worksheet.getRow(1).alignment = { horizontal: 'center' }
        worksheet.getRow(1).font = { bold: true }

        // 數據列格式設置
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

        // 自適應欄寬
        worksheet.columns.forEach(column => {
            let maxLength = 0
            column.eachCell({ includeEmpty: true }, cell => {
                const columnLength = cell.value ? cell.value.toString().length : 10
                if (columnLength > maxLength) {
                    maxLength = columnLength
                }
            })
            // 確保欄位寬度不會小於10，並添加一些緩衝空間
            column.width = Math.max(maxLength + 2, 10)
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

    // 更新BD&機台表格資料
    const updateBdAndMachineTableData = (totals) => {
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

    // 更新Strip表格資料
    const updateStripTableData = (totals) => {
        const indicators = [
            { key: 'totalStrip', label: '條數' },
            { key: 'totalAoiDefect', label: 'Aoi缺點' },
            { key: 'totalFailCount', label: '已扣量' },
            { key: 'totalPassCount', label: 'Pass' }
        ]

        const groupedData = {}
        const machines = [...new Set(totals.flatMap(period => Object.keys(period.machine)))].sort()

        machines.forEach(machineId => {
            // 各機台數據
            groupedData[machineId] = {
                total: { label: machineId, data: [] },
                details: []
            }

            indicators.forEach(({ key, label }) => {
                const row = { label: `${label}`, data: [] }
                totals.forEach(period => {
                    const machineData = period.machine[machineId] || {}
                    row.data.push(machineData[key] || 0)
                })
                groupedData[machineId].details.push(row)
            })

            totals.forEach(period => {
                const machineData = period.machine[machineId] || {}
                const total = indicators.slice(1).reduce((sum, { key }) => sum + (machineData[key] || 0), 0)
                groupedData[machineId].total.data.push(total)
            })
        })

        return groupedData
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

    // BD&機台圖表參數
    const bdAndMachineChartoptions = useMemo(() => {
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

    // Strip圖表參數
    const stripChartoptions = useMemo(() => {
        const machines = filteredData.length > 0
            ? [...new Set(filteredData.flatMap(data => Object.keys(data.machine || {})))]
            : []
        const columnSeries = machines.map(machine => ({
            name: machine,
            type: 'column',
            data: filteredData.map(data => {
                const machineData = data.machine[machine] || {}
                return (machineData.totalAoiDefect || 0) +
                    (machineData.totalFailCount || 0) +
                    (machineData.totalPassCount || 0)
            })
        }))

        const stripSeries = {
            name: 'strip',
            type: 'spline',
            yAxis: 1,
            data: filteredData.map(data => {
                return Object.values(data.machine).reduce((sum, machineData) => sum + (machineData.totalStrip || 0), 0)
            })
        }

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
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'rgba(255,255,255,0.25)',
            },
            // 橫座標軸
            xAxis: {
                categories: filteredData.map(data => data.key.includes('-') ? data.key.substring(5) : data.key),
                crosshair: true,
            },
            // 縱座標軸
            yAxis: [
                {
                    //座標軸文字
                    title: {
                        text: '',
                    },
                    style: {
                        color: Highcharts.getOptions().colors[1],
                    },
                    stackLabels: {
                        enabled: true
                    },
                },
                {
                    title: {
                        text: '',
                    },
                    opposite: true
                }
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
            series: [...columnSeries, stripSeries]
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
                        {chartType === '作業數量' && (
                            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                <span style={{ marginRight: 10 }}>By:</span>
                                <RadioGroup
                                    row
                                    value={state.selectedOperationType}
                                    onChange={(event) => dispatch({ type: 'SET_SELECTED_OPERATION_TYPE', payload: event.target.value })}
                                >
                                    <FormControlLabel
                                        value='機台'
                                        control={<Radio sx={{ color: grey[600] }} />}
                                        label='機台'
                                    />
                                    <FormControlLabel
                                        value='BD'
                                        control={<Radio sx={{ color: grey[600] }} />}
                                        label='BD'
                                    />
                                </RadioGroup>
                            </Box>
                        )}
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
                            disabled={!state.isExportEnabled}
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
                        <HighchartsReact highcharts={Highcharts} options={bdAndMachineChartoptions} />
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
                {/* {showStripChart && (
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
                        <HighchartsReact highcharts={Highcharts} options={stripChartoptions} />
                    </>
                )} */}
                {showStripTable && (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>{state.selectedOperationType === 'BD' ? 'Drawing No' : 'Machine ID'}</TableHeaderCell>
                                    {combinedData.map((data) => (
                                        <TableHeaderCell key={data.key}>
                                            {data.key.includes('-') ? data.key.substring(5) : data.key}
                                        </TableHeaderCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.entries(updatedTableData).map(([machineId, machineData]) => (
                                    <Fragment key={machineId}>
                                        <TableRow
                                            onClick={() => dispatch({ type: 'TOGGLE_EXPANDED_ROW', payload: machineId })} // 使用 dispatch 更新 expandedRows
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FirstColumnCell>{machineId}</FirstColumnCell>
                                            {machineData.total.data.map((value, index) => (
                                                <TableBodyCell key={index}>{value}</TableBodyCell>
                                            ))}
                                        </TableRow>
                                        {expandedRows[machineId] && machineData.details.map((row, rowIndex) => (
                                            <TableRow key={`${machineId}-${rowIndex}`}>
                                                <FirstColumnCell>{row.label}</FirstColumnCell>
                                                {row.data.map((value, colIndex) => (
                                                    <TableBodyCell key={colIndex}>{value}</TableBodyCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </Fragment>
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