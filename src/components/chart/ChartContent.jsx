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

import { useContext, useMemo, useReducer, useState } from 'react'
import { AppContext } from '/src/Context.jsx'
import { calculateAverages, filterDataByMonthRange, filterDataByWeekRange, filterDataByDateRange } from '/src/Function'

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
    updatedTableData: tableData
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_TABLE_DATA':
            return { ...state, updatedTableData: action.payload }
        case 'SET_PERIOD':
            return { ...state, period: action.payload }
        default:
            return state
    }
}

const ChartContent = () => {
    const { aoiData, searchAiresult } = useContext(AppContext)
    const [state, dispatch] = useReducer(reducer, initialState)
    const { updatedTableData, period } = state
    const [chartType, setChartType] = useState('BD圖')
    const [showTable, setShowTable] = useState(false)
    const [showChart, setShowChart] = useState(false); // 控制HighchartsReact元件的顯示狀態
    const [combinedData, setCombinedData] = useState([])

    // 監控鍵盤按鍵
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchSubmit()
        }
    }

    // 處理並整合各週期資料
    const processData = () => {
        const threeMonthsData = filterDataByMonthRange(aoiData, 3) //三月
        const fiveWeeksData = filterDataByWeekRange(aoiData, 5) //五週
        const sevenDaysData = filterDataByDateRange(aoiData, 7) //七日

        // 計算平均並合併資料
        const threeMonthsAverage = calculateAverages(threeMonthsData, 'monthly')
        const fiveWeeksAverage = calculateAverages(fiveWeeksData, 'weekly')
        const sevenDaysAverage = calculateAverages(sevenDaysData, 'daily')
        return threeMonthsAverage.concat(fiveWeeksAverage, sevenDaysAverage);
    }

    // 提交查詢條件
    const searchSubmit = async () => {
        const combinedData = processData();
        dispatch({ type: 'UPDATE_TABLE_DATA', payload: updateTableData(combinedData) })
        setShowChart(true)
        setShowTable(true)
        setCombinedData(combinedData)
        console.log('平均值合併:', combinedData);
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
                        <EditIcon />
                        <span style={{ padding: 10 }}>Period： </span>
                        <Checkbox defaultChecked sx={{ color: 'gray' }} /> Daily
                        <Checkbox sx={{ color: 'gray' }} /> Weekly
                        <Checkbox sx={{ color: 'gray' }} /> Monthly
                        <span style={{ padding: 30 }}> </span>
                        <EditIcon />
                        <span style={{ padding: 10 }}>圖表類型： </span>
                        <RadioGroup
                            row
                            defaultValue='BD圖'
                            onChange={(event) => {
                                setChartType(event.target.value)
                            }}
                        >
                            <FormControlLabel value='BD圖' control={<Radio sx={{ color: grey[600] }} />} label='BD圖' />
                            <FormControlLabel
                                defaultChecked
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
                                />
                            </>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
                        <Button
                            variant='contained'
                            sx={{ marginRight: '10px' }}
                            onClick={searchSubmit}
                            onKeyDown={handleKeyPress}
                        >
                            Query
                        </Button>
                        <Button variant='contained'>Export</Button>
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
                            title='Pass & Overkill rate By'
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
