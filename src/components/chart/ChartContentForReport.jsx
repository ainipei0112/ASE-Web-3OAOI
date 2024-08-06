import {
    Box,
    Button,
    Card,
    Checkbox,
    MenuItem,
    Radio,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Paper,
} from '@mui/material'
import BarChartIcon from '@mui/icons-material/BarChart'
import EditIcon from '@mui/icons-material/Edit'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { useMemo, useState } from 'react'

const ChartContentForReport = () => {
    const [selectedBD, setSelectedBD] = useState('A2766102') // 預設選擇的 BD 圖號
    const [selectedMachine, setSelectedMachine] = useState('203') // 預設選擇的 機台號

    const handleBDChange = (event) => {
        setSelectedBD(event.target.value)
    }

    const handleMachineChange = (event) => {
        setSelectedMachine(event.target.value)
    }

    const rows = [
        {
            name: 'TEST_LOT',
            May: 136323,
            Jun: 119331,
            Jul: 63678,
            W26: 29810,
            W27: 26949,
            W28: 25990,
            W29: 10739,
            '07/09': 3778,
            '07/10': 3623,
            '07/11': 3348,
            '07/12': 3514,
            '07/13': 3674,
            '07/14': 3551,
        },
        {
            name: 'FAIL_LOT',
            May: 3427,
            Jun: 2302,
            Jul: 1194,
            W26: 515,
            W27: 475,
            W28: 464,
            W29: 255,
            '07/09': 76,
            '07/10': 56,
            '07/11': 72,
            '07/12': 94,
            '07/13': 81,
            '07/14': 80,
        },
        {
            name: 'LRR',
            May: 2.51,
            Jun: 1.93,
            Jul: 1.88,
            W26: 1.73,
            W27: 1.76,
            W28: 1.79,
            W29: 2.37,
            '07/09': 2.01,
            '07/10': 1.55,
            '07/11': 2.15,
            '07/12': 2.68,
            '07/13': 2.2,
            '07/14': 2.25,
        },
        {
            name: 'TEST_QTY',
            May: 185673540,
            Jun: 156850224,
            Jul: 81880350,
            W26: 40682092,
            W27: 33970922,
            W28: 33409211,
            W29: 14500217,
            '07/09': 5124483,
            '07/10': 4999421,
            '07/11': 4510240,
            '07/12': 4824150,
            '07/13': 4923228,
            '07/14': 4752839,
        },
        {
            name: 'FAIL_QTY',
            May: 268277,
            Jun: 217532,
            Jul: 106679,
            W26: 56144,
            W27: 43769,
            W28: 41982,
            W29: 20928,
            '07/09': 6462,
            '07/10': 6077,
            '07/11': 6025,
            '07/12': 6995,
            '07/13': 7311,
            '07/14': 6622,
        },
        {
            name: 'FAIL_PPM',
            May: 1445,
            Jun: 1387,
            Jul: 1303,
            W26: 1380,
            W27: 1288,
            W28: 1257,
            W29: 1443,
            '07/09': 1261,
            '07/10': 1216,
            '07/11': 1336,
            '07/12': 1450,
            '07/13': 1485,
            '07/14': 1393,
        },
        {
            name: 'OPEN_PPM',
            May: 557,
            Jun: 518,
            Jul: 474,
            W26: 501,
            W27: 442,
            W28: 466,
            W29: 570,
            '07/09': 507,
            '07/10': 488,
            '07/11': 465,
            '07/12': 546,
            '07/13': 613,
            '07/14': 551,
        },
        {
            name: 'SHORT_PPM',
            May: 805,
            Jun: 749,
            Jul: 686,
            W26: 737,
            W27: 721,
            W28: 648,
            W29: 691,
            '07/09': 646,
            '07/10': 633,
            '07/11': 788,
            '07/12': 788,
            '07/13': 595,
            '07/14': 691,
        },
        {
            name: 'LEAKAGE_PPM',
            May: 83,
            Jun: 119,
            Jul: 143,
            W26: 142,
            W27: 126,
            W28: 143,
            W29: 182,
            '07/09': 108,
            '07/10': 94,
            '07/11': 83,
            '07/12': 116,
            '07/13': 277,
            '07/14': 151,
        },
        {
            name: 'FUNCTION_PPM',
            May: 4,
            Jun: 2,
            Jul: 2,
            W26: 1,
            W27: 3,
            W28: 1,
            W29: 0,
            '07/09': 1,
            '07/10': 1,
            '07/11': 1,
            '07/12': 1,
            '07/13': 0,
            '07/14': 0,
        },
        {
            name: 'OTHER_SCRAP_OPEN',
            May: 25995,
            Jun: 21164,
            Jul: 11422,
            W26: 5887,
            W27: 5498,
            W28: 5202,
            W29: 722,
            '07/09': 1072,
            '07/10': 930,
            '07/11': 576,
            '07/12': 458,
            '07/13': 264,
            '07/14': 0,
        },
        {
            name: 'OTHER_SCRAP_SHORT',
            May: 17243,
            Jun: 13349,
            Jul: 6190,
            W26: 3556,
            W27: 2773,
            W28: 2915,
            W29: 502,
            '07/09': 640,
            '07/10': 542,
            '07/11': 415,
            '07/12': 329,
            '07/13': 173,
            '07/14': 0,
        },
    ]

    const options = useMemo(() => {
        return {
            title: {
                text: `Pass & Overkill rate By Machine:${selectedMachine}/BD:AAH@${selectedBD}`,
            },
            credits: {
                enabled: false, // 去除 Highcharts.com 字樣
            },
            accessibility: {
                enabled: false, // 無障礙功能關閉
            },
            legend: {
                align: 'left',
                verticalAlign: 'top',
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || // theme
                    'rgba(255,255,255,0.25)',
            },
            xAxis: {
                categories: [
                    'May',
                    'Jun',
                    'Jul',
                    'W26',
                    'W27',
                    'W28',
                    'W29',
                    '07/09',
                    '07/10',
                    '07/11',
                    '07/12',
                    '07/13',
                    '07/14',
                ],
                crosshair: true,
            },
            yAxis: [
                {
                    title: {
                        text: 'LRR',
                        style: {
                            color: Highcharts.getOptions().colors[1],
                        },
                    },
                    labels: {
                        format: '{value}',
                        style: {
                            color: Highcharts.getOptions().colors[1],
                        },
                    },
                },
                {
                    title: {
                        text: 'PPM',
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
                    stackLabels: {
                        enabled: true,
                    },
                    opposite: true,
                },
            ],
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                    },
                },
            },
            series: [
                {
                    name: 'OPEN_PPM',
                    type: 'column',
                    yAxis: 1,
                    data: [
                        rows.find((row) => row.name === 'OPEN_PPM').May,
                        rows.find((row) => row.name === 'OPEN_PPM').Jun,
                        rows.find((row) => row.name === 'OPEN_PPM').Jul,
                        rows.find((row) => row.name === 'OPEN_PPM').W26,
                        rows.find((row) => row.name === 'OPEN_PPM')['W27'],
                        rows.find((row) => row.name === 'OPEN_PPM')['W28'],
                        rows.find((row) => row.name === 'OPEN_PPM')['W29'],
                        rows.find((row) => row.name === 'OPEN_PPM')['07/09'],
                        rows.find((row) => row.name === 'OPEN_PPM')['07/10'],
                        rows.find((row) => row.name === 'OPEN_PPM')['07/11'],
                        rows.find((row) => row.name === 'OPEN_PPM')['07/12'],
                        rows.find((row) => row.name === 'OPEN_PPM')['07/13'],
                        rows.find((row) => row.name === 'OPEN_PPM')['07/14'],
                    ],
                    tooltip: {
                        valueSuffix: '',
                    },
                },
                {
                    name: 'SHORT_PPM',
                    type: 'column',
                    yAxis: 1,
                    data: [
                        rows.find((row) => row.name === 'SHORT_PPM').May,
                        rows.find((row) => row.name === 'SHORT_PPM').Jun,
                        rows.find((row) => row.name === 'SHORT_PPM').Jul,
                        rows.find((row) => row.name === 'SHORT_PPM').W26,
                        rows.find((row) => row.name === 'SHORT_PPM')['W27'],
                        rows.find((row) => row.name === 'SHORT_PPM')['W28'],
                        rows.find((row) => row.name === 'SHORT_PPM')['W29'],
                        rows.find((row) => row.name === 'SHORT_PPM')['07/09'],
                        rows.find((row) => row.name === 'SHORT_PPM')['07/10'],
                        rows.find((row) => row.name === 'SHORT_PPM')['07/11'],
                        rows.find((row) => row.name === 'SHORT_PPM')['07/12'],
                        rows.find((row) => row.name === 'SHORT_PPM')['07/13'],
                        rows.find((row) => row.name === 'SHORT_PPM')['07/14'],
                    ],
                    tooltip: {
                        valueSuffix: '',
                    },
                },
                {
                    name: 'LEAKAGE_PPM',
                    type: 'column',
                    yAxis: 1,
                    data: [
                        rows.find((row) => row.name === 'LEAKAGE_PPM').May,
                        rows.find((row) => row.name === 'LEAKAGE_PPM').Jun,
                        rows.find((row) => row.name === 'LEAKAGE_PPM').Jul,
                        rows.find((row) => row.name === 'LEAKAGE_PPM').W26,
                        rows.find((row) => row.name === 'LEAKAGE_PPM')['W27'],
                        rows.find((row) => row.name === 'LEAKAGE_PPM')['W28'],
                        rows.find((row) => row.name === 'LEAKAGE_PPM')['W29'],
                        rows.find((row) => row.name === 'LEAKAGE_PPM')['07/09'],
                        rows.find((row) => row.name === 'LEAKAGE_PPM')['07/10'],
                        rows.find((row) => row.name === 'LEAKAGE_PPM')['07/11'],
                        rows.find((row) => row.name === 'LEAKAGE_PPM')['07/12'],
                        rows.find((row) => row.name === 'LEAKAGE_PPM')['07/13'],
                        rows.find((row) => row.name === 'LEAKAGE_PPM')['07/14'],
                    ],
                    tooltip: {
                        valueSuffix: '',
                    },
                },
                {
                    name: 'FUNCTION_PPM',
                    type: 'column',
                    yAxis: 1,
                    data: [
                        rows.find((row) => row.name === 'FUNCTION_PPM').May,
                        rows.find((row) => row.name === 'FUNCTION_PPM').Jun,
                        rows.find((row) => row.name === 'FUNCTION_PPM').Jul,
                        rows.find((row) => row.name === 'FUNCTION_PPM').W26,
                        rows.find((row) => row.name === 'FUNCTION_PPM')['W27'],
                        rows.find((row) => row.name === 'FUNCTION_PPM')['W28'],
                        rows.find((row) => row.name === 'FUNCTION_PPM')['W29'],
                        rows.find((row) => row.name === 'FUNCTION_PPM')['07/09'],
                        rows.find((row) => row.name === 'FUNCTION_PPM')['07/10'],
                        rows.find((row) => row.name === 'FUNCTION_PPM')['07/11'],
                        rows.find((row) => row.name === 'FUNCTION_PPM')['07/12'],
                        rows.find((row) => row.name === 'FUNCTION_PPM')['07/13'],
                        rows.find((row) => row.name === 'FUNCTION_PPM')['07/14'],
                    ],
                    tooltip: {
                        valueSuffix: '',
                    },
                },
                {
                    name: 'LRR',
                    type: 'spline',
                    yAxis: 0,
                    data: [2.51, 1.93, 1.88, 1.73, 1.76, 1.79, 2.37, 2.01, 1.55, 2.15, 2.68, 2.2, 2.25],
                    tooltip: {
                        valueSuffix: '',
                    },
                },
            ],
        }
    }, [rows])

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
                    <span style={{ marginLeft: 10 }}>Chart Report</span>
                </Box>
                <Box sx={{ padding: '10px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <EditIcon />
                        <span style={{ marginLeft: 10 }}>Period: </span>
                        <Checkbox defaultChecked sx={{ color: 'gray' }} /> Daily
                        <Checkbox sx={{ color: 'gray' }} /> Weekly
                        <Checkbox sx={{ color: 'gray' }} /> Monthly
                        <span style={{ marginLeft: 30 }}> </span>
                        <EditIcon />
                        <span style={{ marginLeft: 10 }}>圖表類型: </span>
                        <Radio defaultChecked sx={{ color: 'gray' }} /> 機台
                        <Radio sx={{ color: 'gray' }} /> BD圖
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <EditIcon />
                        <span style={{ marginLeft: 10, marginRight: '10px' }}>BD圖號: </span>
                        <Select value={'A2766102'} onChange={handleBDChange}>
                            <MenuItem value={'A2766102'}>AAH@A2766102</MenuItem>
                            <MenuItem value={'A29073A4'}>AAH@A29073A4</MenuItem>
                        </Select>
                        <EditIcon style={{ marginLeft: 100 }} />
                        <span style={{ marginLeft: 10, marginRight: '10px' }}>機台號: </span>
                        <Select value={'203'} onChange={handleMachineChange}>
                            <MenuItem value={'203'}>203</MenuItem>
                            <MenuItem value={'6I03'}>6I03</MenuItem>
                            <MenuItem value={'6I05'}>6I05</MenuItem>
                            <MenuItem value={'WBAOI'}>WBAOI</MenuItem>
                        </Select>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
                        <Button variant='contained' sx={{ marginRight: '10px' }}>
                            Query
                        </Button>
                        <Button variant='contained'>Export</Button>
                    </Box>
                </Box>
                {/* <HighchartsReact highcharts={Highcharts} options={options} />
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>DATE</TableCell>
                <TableCell>May</TableCell>
                <TableCell>Jun</TableCell>
                <TableCell>Jul</TableCell>
                <TableCell>W26</TableCell>
                <TableCell>W27</TableCell>
                <TableCell>W28</TableCell>
                <TableCell>W29</TableCell>
                <TableCell>07/09</TableCell>
                <TableCell>07/10</TableCell>
                <TableCell>07/11</TableCell>
                <TableCell>07/12</TableCell>
                <TableCell>07/13</TableCell>
                <TableCell>07/14</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.May}</TableCell>
                  <TableCell align="right">{row.Jun}</TableCell>
                  <TableCell align="right">{row.Jul}</TableCell>
                  <TableCell align="right">{row.W26}</TableCell>
                  <TableCell align="right">{row.W27}</TableCell>
                  <TableCell align="right">{row.W28}</TableCell>
                  <TableCell align="right">{row.W29}</TableCell>
                  <TableCell align="right">{row['07/09']}</TableCell>
                  <TableCell align="right">{row['07/10']}</TableCell>
                  <TableCell align="right">{row['07/11']}</TableCell>
                  <TableCell align="right">{row['07/12']}</TableCell>
                  <TableCell align="right">{row['07/13']}</TableCell>
                  <TableCell align="right">{row['07/14']}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer> */}
            </Card>
        </>
    )
}

export default ChartContentForReport
