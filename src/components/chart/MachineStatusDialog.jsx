// React套件
import { useState } from 'react'

// MUI套件
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

// 外部套件
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

// 自定義套件
import MachineDetailDialog from './MachineDetailDialog'

const MachineStatusDialog = ({ open, onClose, detailData }) => {
    const [subDialogOpen, setSubDialogOpen] = useState(false)
    const [machineDetails, setMachineDetails] = useState([])
    const [selectedMachine, setSelectedMachine] = useState(null)

    const handleMachineClick = async (event) => {
        if (event.point) {
            const machineId = event.point.category
            try {
                const response = await fetch('http://10.11.33.122:1234/thirdAOI.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'getBDDetailsByMachineStrip',
                        deviceId: detailData.deviceId,
                        machineId: machineId,
                        date: detailData.date,
                        periodType: detailData.period
                    })
                })
                const data = await response.json()
                if (data.success) {
                    setMachineDetails(data.results)
                    setSelectedMachine(machineId)
                    setSubDialogOpen(true)
                }
            } catch (error) {
                console.error('Error fetching machine details:', error)
            }
        }
    }

    const chartOptions = {
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
                },
                events: {
                    click: handleMachineClick
                }
            }
        },
        xAxis: {
            categories: detailData?.data ? [...new Set(detailData.data.map(d => d.Machine_Id))].sort() : []
        },
        yAxis: [{
            title: { text: 'Rate (%)' },
            min: 0,
            max: 100,
            labels: { format: '{value}%' }
        }, {
            title: { text: 'PPM' },
            opposite: true
        }],
        series: detailData?.data ? [
            {
                name: 'Fail PPM',
                type: 'column',
                yAxis: 1,
                data: [...new Set(detailData.data.map(d => d.Machine_Id))]
                    .sort()
                    .map(machineId => {
                        const machineData = detailData.data.filter(d => d.Machine_Id === machineId)
                        return parseFloat((machineData.reduce((sum, d) =>
                            sum + parseFloat(d.Fail_Ppm), 0) / machineData.length).toFixed(0))
                    })
            },
            {
                name: 'Pass Rate',
                type: 'spline',
                data: [...new Set(detailData.data.map(d => d.Machine_Id))]
                    .sort()
                    .map(machineId => {
                        const machineData = detailData.data.filter(d => d.Machine_Id === machineId)
                        return parseFloat((machineData.reduce((sum, d) =>
                            sum + parseFloat(d.Pass_Rate), 0) / machineData.length * 100).toFixed(1))
                    })
            },
            {
                name: 'Overkill Rate',
                type: 'spline',
                data: [...new Set(detailData.data.map(d => d.Machine_Id))]
                    .sort()
                    .map(machineId => {
                        const machineData = detailData.data.filter(d => d.Machine_Id === machineId)
                        return parseFloat((machineData.reduce((sum, d) =>
                            sum + parseFloat(d.Overkill_Rate), 0) / machineData.length * 100).toFixed(1))
                    })
            }
        ] : [],
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
        }
    }

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {`${detailData?.deviceId} - ${detailData?.date} 機台作業狀況`}
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'gray'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={chartOptions}
                    />
                </DialogContent>
            </Dialog>

            <MachineDetailDialog
                open={subDialogOpen}
                onClose={() => setSubDialogOpen(false)}
                machineDetails={machineDetails}
                deviceId={detailData?.deviceId}
                machineId={selectedMachine}
                date={detailData?.date}
            />
        </>
    )
}

export default MachineStatusDialog
