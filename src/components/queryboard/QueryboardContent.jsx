// React套件
import { useContext, useMemo, useReducer, Fragment } from 'react'

// MUI套件
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardHeader,
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
import BarChartIcon from '@mui/icons-material/BarChart'
import EditIcon from '@mui/icons-material/Edit'
import { grey } from '@mui/material/colors'
import { styled } from '@mui/system'

// 外部套件
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
HighchartsExporting(Highcharts)
HighchartsExportData(Highcharts)
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
// import html2canvas from 'html2canvas'

// 自定義套件
import { AppContext } from '../../Context.jsx'
import { calculateOperationData, calculateBdData, getWeekNumberForDate, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange } from '../../Function.jsx'
// import MailDialog from './MailDialog'

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
    chartType: 'BD圖',
    selectedBD: null,
    selectedMachine: null,
    combinedData: [],
    updatedTableData: tableData,
    expandedRows: {},
    selectedOperationType: '機台',
    showChart: false,
    showTable: false,
    showOperationChart: false,
    showOperationTable: false,
    chartTitle: '',
    period: ['monthly', 'weekly', 'daily'],
    isExportEnabled: false,
    isMailDialogOpen: false,
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_CHART_TYPE':
            return { ...state, selectedBD: null, selectedMachine: null, chartType: action.payload }
        case 'SELECT_BD':
            return { ...state, selectedBD: action.payload }
        case 'SELECT_MACHINE':
            return { ...state, selectedMachine: action.payload }
        case 'SET_COMBINED_DATA':
            return { ...state, combinedData: action.payload }
        case 'UPDATE_TABLE_DATA':
            return { ...state, updatedTableData: action.payload }
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
        case 'SET_CURRENT_OPERATION_TYPE':
            return { ...state, currentOperationType: action.payload }
        case 'SET_QUERIED_BD':
            return { ...state, queriedBD: action.payload }
        case 'SET_QUERIED_MACHINE':
            return { ...state, queriedMachine: action.payload }
        case 'TOGGLE_SHOW_CHART':
            return { ...state, showChart: action.payload }
        case 'TOGGLE_SHOW_TABLE':
            return { ...state, showTable: action.payload }
        case 'TOGGLE_SHOW_OPERATION_CHART':
            return { ...state, showOperationChart: action.payload }
        case 'TOGGLE_SHOW_OPERATION_TABLE':
            return { ...state, showOperationTable: action.payload }
        case 'SET_CHART_TITLE':
            return { ...state, chartTitle: action.payload }
        case 'SET_PERIOD':
            return { ...state, period: action.payload }
        case 'SET_EXPORT_ENABLED':
            return { ...state, isExportEnabled: action.payload }
        case 'TOGGLE_MAIL_DIALOG':
            return { ...state, isMailDialogOpen: action.payload }
        default:
            return state
    }
}

const QueryboardContent = () => {
    const { aoiData, searchByCondition, exportDataByCondition } = useContext(AppContext)
    const [state, dispatch] = useReducer(reducer, initialState)
    const {
        chartType,
        selectedBD,
        selectedMachine,
        combinedData,
        updatedTableData,
        expandedRows,
        selectedOperationType,
        currentOperationType,
        queriedBD,
        queriedMachine,
        showChart,
        showTable,
        showOperationChart,
        showOperationTable,
        chartTitle,
        period,
        isExportEnabled,
        // isMailDialogOpen
    } = state

    // 監控鍵盤按鍵
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleQuery()
        }
    }

    // // 禁用右鍵點擊
    // const handleContextMenu = (e) => {
    //     e.preventDefault()
    // }

    // // 禁止鍵盤開啟開發人員工具
    // const handleKeyDown = (e) => {
    //     if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
    //         e.preventDefault()
    //     }
    // }

    // // 添加事件監聽器
    // document.addEventListener('contextmenu', handleContextMenu)
    // document.addEventListener('keydown', handleKeyDown)

    // 提交查詢條件
    const handleQuery = async () => {
        const searchData = await searchByCondition(selectedBD, selectedMachine)
        const { threeMonthsData, fiveWeeksData, sevenDaysData } = filterData(searchData)
        let combinedData

        // 根據圖表類型計算資料
        if (chartType === 'BD圖' || chartType === '機台') {
            combinedData = averageData(threeMonthsData, fiveWeeksData, sevenDaysData)
            dispatch({ type: 'UPDATE_TABLE_DATA', payload: updateGeneralTableData(combinedData) })
            dispatch({ type: 'TOGGLE_SHOW_CHART', payload: true })
            dispatch({ type: 'TOGGLE_SHOW_TABLE', payload: true })
            dispatch({ type: 'TOGGLE_SHOW_OPERATION_CHART', payload: false })
            dispatch({ type: 'TOGGLE_SHOW_OPERATION_TABLE', payload: false })
        } else {
            combinedData = sumData(threeMonthsData, fiveWeeksData, sevenDaysData)
            dispatch({ type: 'UPDATE_TABLE_DATA', payload: updateOperationTableData(combinedData) })
            dispatch({ type: 'SET_CURRENT_OPERATION_TYPE', payload: selectedOperationType })
            dispatch({ type: 'SET_QUERIED_BD', payload: selectedBD })
            dispatch({ type: 'SET_QUERIED_MACHINE', payload: selectedMachine })
            dispatch({ type: 'TOGGLE_SHOW_OPERATION_CHART', payload: true })
            dispatch({ type: 'TOGGLE_SHOW_OPERATION_TABLE', payload: true })
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
        } else {
            newTitle = '作業數量 By '
            if (selectedOperationType === '機台') {
                newTitle += selectedMachine || '機台'
            } else {
                newTitle += selectedBD || 'BD'
            }
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
    const averageData = (threeMonthsData, fiveWeeksData, sevenDaysData) => {
        const threeMonthsAverage = calculateBdData(threeMonthsData, 'monthly')
        const fiveWeeksAverage = calculateBdData(fiveWeeksData, 'weekly')
        const sevenDaysAverage = calculateBdData(sevenDaysData, 'daily')
        return threeMonthsAverage.concat(fiveWeeksAverage, sevenDaysAverage)
    }

    // 計算總值並整合各週期資料
    const sumData = (threeMonthsData, fiveWeeksData, sevenDaysData) => {
        const threeMonthsTotal = calculateOperationData(threeMonthsData, 'monthly')
        const fiveWeeksTotal = calculateOperationData(fiveWeeksData, 'weekly')
        const sevenDaysTotal = calculateOperationData(sevenDaysData, 'daily')
        return threeMonthsTotal.concat(fiveWeeksTotal, sevenDaysTotal)
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
            row.eachCell((cell) => {
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

    // const handleMailClick = () => {
    //     dispatch({ type: 'TOGGLE_MAIL_DIALOG', payload: true })
    // }

    // const handleMailClose = () => {
    //     dispatch({ type: 'TOGGLE_MAIL_DIALOG', payload: false })
    // }

    // const handleMailSend = async ({ recipient, subject, content, includeChart, includeTable }) => {
    //     let chartImage = ''
    //     let tableImage = ''

    //     if (includeChart) {
    //         const chartElement = document.querySelector('.highcharts-container')
    //         if (chartElement) {
    //             const canvas = await html2canvas(chartElement)
    //             chartImage = canvas.toDataURL('image/jpeg', 0.9) // 使用JPEG格式，質量為0.9
    //         }
    //     }

    //     if (includeTable) {
    //         const tableElement = document.querySelector('table')
    //         if (tableElement) {
    //             const canvas = await html2canvas(tableElement)
    //             tableImage = canvas.toDataURL('image/jpeg', 0.9) // 使用JPEG格式，質量為0.9
    //         }
    //     }

    //     const emailContent = content
    //         .replace('$_chart', includeChart ? `<img src="${chartImage}" alt="Chart">` : '')
    //         .replace('$_table', includeTable ? `<img src="${tableImage}" alt="Table">` : '')

    //     const emailData = {
    //         action: 'mailAlert',
    //         subject,
    //         recipient,
    //         content: emailContent,
    //     }

    //     await sendEmail(emailData)
    //     dispatch({ type: 'TOGGLE_MAIL_DIALOG', payload: false })
    // }

    // BD選單
    const bdOptions = useMemo(() => {
        return [...new Set(aoiData.map(({ Drawing_No }) => Drawing_No))]
            .sort()
            .map((Drawing_No) => ({ title: Drawing_No }))
    }, [aoiData])

    // 機台選單
    const machineOptions = useMemo(() => {
        return [...new Set(aoiData.map(({ Machine_Id }) => Machine_Id))]
            .sort()
            .map((Machine_Id) => ({ title: Machine_Id }))
    }, [aoiData])

    // 更新 BD & 機台 表格資料
    const updateGeneralTableData = (totals) => {
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

    // 更新作業數量表格資料
    const updateOperationTableData = (totals) => {
        const indicators = [
            { key: 'totalStrip', label: '條數' },
            { key: 'totalAoiDefect', label: 'Aoi缺點' },
            { key: 'totalFailCount', label: '已扣量' },
            { key: 'totalPassCount', label: 'Pass' }
        ]

        const groupedData = {}
        const dataSource = selectedOperationType === '機台' ? 'machine' : 'bondingDrawing'
        const items = [...new Set(totals.flatMap(period => Object.keys(period[dataSource] || {})))].sort()

        items.forEach(itemId => {
            groupedData[itemId] = {
                total: { label: itemId, data: [] },
                details: []
            }

            indicators.forEach(({ key, label }) => {
                const row = { label: `${label}`, data: [] }
                totals.forEach(period => {
                    const itemData = period[dataSource][itemId] || {}
                    row.data.push(itemData[key] || 0)
                })
                groupedData[itemId].details.push(row)
            })

            totals.forEach(period => {
                const itemData = period[dataSource][itemId] || {}
                const total = indicators.slice(1).reduce((sum, { key }) => sum + (itemData[key] || 0), 0)
                groupedData[itemId].total.data.push(total)
            })
        })

        return groupedData
    }

    // 更新週期資料
    const periodData = useMemo(() => {
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

    // BD & 機台 圖表參數
    const generalChartoptions = useMemo(() => {
        return {
            // 圖表標題
            title: {
                text: null,
            },
            // 去除 Highcharts.com 字樣
            credits: {
                enabled: false,
            },
            // 無障礙功能關閉
            accessibility: {
                enabled: false,
            },
            // 圖表匯出功能
            exporting: {
                enabled: true,
                buttons: {
                    contextButton: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        menuItems: [
                            {
                                text: '匯出 PNG',
                                onclick: function () {
                                    this.setTitle({ text: chartTitle })
                                    this.exportChart({
                                        type: 'image/png',
                                        filename: chartTitle
                                    })
                                    this.setTitle({ text: null })
                                }
                            },
                            {
                                text: '匯出 JPG',
                                onclick: function () {
                                    this.setTitle({ text: chartTitle })
                                    this.exportChart({
                                        type: 'image/jpeg',
                                        filename: chartTitle
                                    })
                                    this.setTitle({ text: null })
                                }
                            },
                            {
                                text: '匯出 SVG',
                                onclick: function () {
                                    this.setTitle({ text: chartTitle })
                                    this.exportChart({
                                        type: 'image/svg+xml',
                                        filename: chartTitle
                                    })
                                    this.setTitle({ text: null })
                                }
                            },
                            {
                                text: '全螢幕顯示',
                                onclick: function () {
                                    this.fullscreen.toggle()
                                }
                            }
                        ]
                    }
                }
            },
            // 圖例
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || 'rgba(255,255,255,0.25)',
            },
            // 橫座標軸
            xAxis: {
                categories: periodData.map(data => data.key.includes('-') ? data.key.substring(5) : data.key),
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
                        verticalAlign: 'top', // 將數字顯示在柱子上方
                        y: -20, // 把數字的位置向上調整
                    },
                },
                spline: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return this.y + '%' // 在數字後加上%
                        },
                    },
                },
            },
            series: [
                {
                    name: 'Fail PPM',
                    type: 'column',
                    yAxis: 1,
                    data: periodData.map(data => parseFloat(data.averageFailPpm))
                },
                {
                    name: 'Pass Rate',
                    type: 'spline',
                    yAxis: 0,
                    tooltip: {
                        valueSuffix: '%',
                    },
                    data: periodData.map(data => parseFloat(data.averagePassRate))
                },
                {
                    name: 'Overkill Rate',
                    type: 'spline',
                    yAxis: 0,
                    tooltip: {
                        valueSuffix: '%',
                    },
                    data: periodData.map(data => parseFloat(data.averageOverkillRate))
                }
            ]
        }
    }, [periodData, chartTitle])

    // 作業數量圖表參數
    const operationChartoptions = useMemo(() => {
        const dataSource = currentOperationType === '機台' ? 'machine' : 'bondingDrawing'

        const items = periodData.length > 0
            ? [...new Set(periodData.flatMap(data => Object.keys(data[dataSource] || {})))]
            : []

        const columnSeries = items.map(item => ({
            name: item,
            type: 'column',
            data: periodData.map(data => {
                const itemData = data[dataSource][item] || {}
                return (itemData.totalAoiDefect || 0) +
                    (itemData.totalFailCount || 0) +
                    (itemData.totalPassCount || 0)
            })
        }))

        const stripSeries = {
            name: 'strip',
            type: 'spline',
            yAxis: 1,
            data: periodData.map(data => {
                if (data[dataSource]) {
                    return Object.values(data[dataSource]).reduce((sum, itemData) => sum + (itemData.totalStrip || 0), 0)
                }
                return 0
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
            // 圖表匯出功能
            exporting: {
                enabled: true,
                buttons: {
                    contextButton: {
                        align: 'right',
                        verticalAlign: 'bottom',
                        menuItems: [
                            {
                                text: '匯出 PNG',
                                onclick: function () {
                                    this.setTitle({ text: chartTitle })
                                    this.exportChart({
                                        type: 'image/png',
                                        filename: chartTitle
                                    })
                                    this.setTitle({ text: null })
                                }
                            },
                            {
                                text: '匯出 JPG',
                                onclick: function () {
                                    this.setTitle({ text: chartTitle })
                                    this.exportChart({
                                        type: 'image/jpeg',
                                        filename: chartTitle
                                    })
                                    this.setTitle({ text: null })
                                }
                            },
                            {
                                text: '匯出 SVG',
                                onclick: function () {
                                    this.setTitle({ text: chartTitle })
                                    this.exportChart({
                                        type: 'image/svg+xml',
                                        filename: chartTitle
                                    })
                                    this.setTitle({ text: null })
                                }
                            },
                            {
                                text: '全螢幕顯示',
                                onclick: function () {
                                    this.fullscreen.toggle()
                                }
                            }
                        ]
                    }
                }
            },
            // 圖例
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'rgba(255,255,255,0.25)',
            },
            // 橫座標軸
            xAxis: {
                categories: periodData.map(data => data.key.includes('-') ? data.key.substring(5) : data.key),
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
                        enabled: !((currentOperationType === '機台' && queriedMachine) || (currentOperationType === 'BD' && queriedBD)),
                        style: {
                            fontWeight: 'bold',
                            color: '#C55A11',
                            textOutline: 'none' // 去掉黑色邊框
                        },
                        backgroundColor: '#FFF2CC',
                        borderWidth: 0,
                        borderRadius: 5,
                        padding: 5
                    }
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
                series: {
                    stacking: 'normal'
                }
            },
            series: [...columnSeries, stripSeries]
        }
    }, [periodData, currentOperationType, queriedBD, queriedMachine, chartTitle])

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
                    <span style={{ padding: 10, fontWeight: 'bold', variant: "h6" }}>Chart Report</span>
                </Box>
                <Box sx={{ padding: '10px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
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
                                    value={selectedOperationType}
                                    onChange={(event) => dispatch({ type: 'SET_SELECTED_OPERATION_TYPE', payload: event.target.value })}
                                >
                                    <FormControlLabel
                                        value='BD'
                                        control={<Radio sx={{ color: grey[600] }} />}
                                        label='BD'
                                    />
                                    <FormControlLabel
                                        value='機台'
                                        control={<Radio sx={{ color: grey[600] }} />}
                                        label='機台'
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
                            sx={{ marginRight: '10px' }}
                            onClick={handleExport}
                            disabled={!isExportEnabled}
                        >
                            Export
                        </Button>
                        {/* <MailDialog
                            open={isMailDialogOpen}
                            onClose={handleMailClose}
                            onSend={handleMailSend}
                            chartTitle={chartTitle}
                        /> */}
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
                            title={chartTitle}
                            sx={{ textAlign: 'center', marginLeft: '100px' }}
                        />
                        <HighchartsReact highcharts={Highcharts} options={generalChartoptions} />
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
                {showOperationChart && (
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
                            title={chartTitle}
                            sx={{ textAlign: 'center', marginLeft: '100px' }}
                        />
                        <HighchartsReact highcharts={Highcharts} options={operationChartoptions} />
                    </>
                )}
                {showOperationTable && (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>項目</TableHeaderCell>
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

export default QueryboardContent