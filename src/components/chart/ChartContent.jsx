import {
    Autocomplete,
    Box,
    Button,
    Card,
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
} from '@mui/material'
import { grey } from '@mui/material/colors'
import BarChartIcon from '@mui/icons-material/BarChart'
import EditIcon from '@mui/icons-material/Edit'

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

const tableData = [
    { label: 'FAIL PPM', data: Array(15).fill(0) },
    { label: 'Overkill Rate', data: Array(15).fill(0) },
    { label: 'Pass Rate', data: Array(15).fill(0) }
]

const initialState = {
    updatedTableData: tableData
}

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_TABLE_DATA':
            return { ...state, updatedTableData: action.payload }
        default:
            return state
    }
}

const ChartContent = () => {
    const { airesults } = useContext(AppContext)
    const [state, dispatch] = useReducer(reducer, initialState)
    const { updatedTableData } = state
    const [chartType, setChartType] = useState('機台')
    const [showTable, setShowTable] = useState(false)
    const [combinedData, setCombinedData] = useState([])

    // 監控鍵盤按鍵
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchSubmit()
        }
    }

    // 提交查詢條件
    const searchSubmit = async () => {
        const threeMonthsData = filterDataByMonthRange(airesults, 3)
        const fiveWeeksData = filterDataByWeekRange(airesults, 2)
        const sevenDaysData = filterDataByDateRange(airesults, 7)

        const threeMonthsAverage = calculateAverages(threeMonthsData, 'monthly')
        const fiveWeeksAverage = calculateAverages(fiveWeeksData, 'weekly')
        const sevenDaysAverage = calculateAverages(sevenDaysData, 'daily')
        const combinedData = threeMonthsAverage.concat(fiveWeeksAverage, sevenDaysAverage);

        dispatch({ type: 'UPDATE_TABLE_DATA', payload: updateTableData(combinedData) })
        setShowTable(true)
        setCombinedData(combinedData)
    }

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

    // BD選單
    const bdOptions = useMemo(
        () =>
            [...new Set(airesults.map(({ Drawing_No }) => Drawing_No))]
                .sort()
                .map((Drawing_No) => ({ title: Drawing_No })),
        [airesults],
    )

    // 機台選單
    const machineOptions = useMemo(
        () =>
            [...new Set(airesults.map(({ Machine_Id }) => Machine_Id))]
                .sort()
                .map((Machine_Id) => ({ title: Machine_Id })),
        [airesults],
    )

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
                            defaultValue='機台'
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
