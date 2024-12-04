import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material'
import { styled } from '@mui/system'
import CloseIcon from '@mui/icons-material/Close'

// 樣式定義
const StyledTableContainer = styled(TableContainer)({
    '& .MuiTableCell-root': {
        padding: '8px 16px',
        whiteSpace: 'normal',
        wordBreak: 'break-word'
    }
})

const StyledTableCell = styled(TableCell)({
    padding: '8px 16px',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
})

const HighlightedTableCell = styled(StyledTableCell)(({ theme }) => ({
    padding: '8px 16px',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    color: theme.palette.error.main
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.grey[50],
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.grey[200]
    }
}))

const TableHeaderRow = styled(TableRow)({
    backgroundColor: '#e8f5e9',
    '& .MuiTableCell-root': {
        fontWeight: 'bold',
        color: '#2e7d32'
    }
})

const MachineDetailDialog = ({ open, onClose, machineDetails, deviceId, machineId, date }) => {

    // 按 Overkill_Rate 排序
    const sortedDetails = [...machineDetails].sort((a, b) => b.Overkill_Rate - a.Overkill_Rate)

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                {`${deviceId} - ${machineId} - ${date} 詳細資訊`}
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
                <StyledTableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableHeaderRow>
                                <StyledTableCell>日期</StyledTableCell>
                                <StyledTableCell>Schedule</StyledTableCell>
                                <StyledTableCell>條號</StyledTableCell>
                                <StyledTableCell>AOI缺點</StyledTableCell>
                                <StyledTableCell>Pass</StyledTableCell>
                                <StyledTableCell>已扣量</StyledTableCell>
                                <StyledTableCell>Pass Rate</StyledTableCell>
                                <StyledTableCell>Overkill</StyledTableCell>
                                <StyledTableCell>機台 No</StyledTableCell>
                                <StyledTableCell>圖號</StyledTableCell>
                            </TableHeaderRow>
                        </TableHead>
                        <TableBody>
                            {sortedDetails?.map((row, index) => (
                                <StyledTableRow key={index}>
                                    <StyledTableCell>{row.Ao_Time_Start}</StyledTableCell>
                                    <StyledTableCell>{row.Lot_No}</StyledTableCell>
                                    <StyledTableCell>{row.Strip_No}</StyledTableCell>
                                    <StyledTableCell>{row.Aoi_Defect}</StyledTableCell>
                                    <StyledTableCell>{row.Pass_Count}</StyledTableCell>
                                    <StyledTableCell>{row.Fail_Count}</StyledTableCell>
                                    <StyledTableCell>{(row.Pass_Rate * 100).toFixed(1)}%</StyledTableCell>
                                    {row.Overkill_Rate > 0.05 ? (
                                        <HighlightedTableCell>{(row.Overkill_Rate * 100).toFixed(1)}%</HighlightedTableCell>
                                    ) : (
                                        <StyledTableCell>{(row.Overkill_Rate * 100).toFixed(1)}%</StyledTableCell>
                                    )}
                                    <StyledTableCell>{row.Machine_Id}</StyledTableCell>
                                    <StyledTableCell>{row.Drawing_No}</StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            </DialogContent>
        </Dialog>
    )
}

export default MachineDetailDialog
