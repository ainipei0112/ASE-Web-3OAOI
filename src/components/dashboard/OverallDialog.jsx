// React套件
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

const HighlightedTableRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: '#ffebee',
    '& .MuiTableCell-root': {
        color: theme.palette.error.main
    }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: theme.palette.grey[50],
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.grey[200]
    }
}))

const TableHeaderRow = styled(TableRow)({
    backgroundColor: '#e8f5e9', // 整體表頭背景色
})

const LightBlueTableCell = styled(StyledTableCell)({
    backgroundColor: '#e3f2fd', // 淺藍色
    fontWeight: 'bold',
    color: '#000000' // 字體顏色
})

const GreenTableCell = styled(StyledTableCell)({
    backgroundColor: '#c8e6c9', // 綠色
    fontWeight: 'bold',
    color: '#000000' // 字體顏色
})

const OverallDialog = ({ open, onClose, detailData }) => {
    // 按 Overkill_Rate 排序
    const sortedDetails = detailData?.data ? [...detailData.data].sort((a, b) => b.Overkill_Rate - a.Overkill_Rate) : []

    // 計算總計
    const totalFailCount = sortedDetails.reduce((sum, row) => sum + row.Fail_Count, 0)
    const totalAoiDefect = sortedDetails.reduce((sum, row) => sum + row.Aoi_Defect, 0)
    const totalPassCount = sortedDetails.reduce((sum, row) => sum + row.Pass_Count, 0)
    const averagePassRate = sortedDetails.length ?
        (sortedDetails.reduce((sum, row) => sum + row.Pass_Rate, 0) / sortedDetails.length).toFixed(1) : 0
    const averageOverkillRate = sortedDetails.length ?
        (sortedDetails.reduce((sum, row) => sum + row.Overkill_Rate, 0) / sortedDetails.length).toFixed(1) : 0

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                {`${detailData?.period} - ${detailData?.date} 詳細資訊`}
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
                                <LightBlueTableCell>圖號</LightBlueTableCell>
                                <LightBlueTableCell>加總 - 已扣量</LightBlueTableCell>
                                <LightBlueTableCell>加總 - AOI缺點</LightBlueTableCell>
                                <LightBlueTableCell>加總 - Pass</LightBlueTableCell>
                                <GreenTableCell>Pass Rate</GreenTableCell>
                                <GreenTableCell>Overkill(%)</GreenTableCell>
                            </TableHeaderRow>
                        </TableHead>
                        <TableBody>
                            {sortedDetails?.map((row, index) => (
                                row.Overkill_Rate > 5 ? (
                                    <HighlightedTableRow key={index}>
                                        <StyledTableCell>{row.Drawing_No}</StyledTableCell>
                                        <StyledTableCell>{row.Fail_Count}</StyledTableCell>
                                        <StyledTableCell>{row.Aoi_Defect}</StyledTableCell>
                                        <StyledTableCell>{row.Pass_Count}</StyledTableCell>
                                        <StyledTableCell>{row.Pass_Rate}%</StyledTableCell>
                                        <StyledTableCell>{row.Overkill_Rate}%</StyledTableCell>
                                    </HighlightedTableRow>
                                ) : (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell>{row.Drawing_No}</StyledTableCell>
                                        <StyledTableCell>{row.Fail_Count}</StyledTableCell>
                                        <StyledTableCell>{row.Aoi_Defect}</StyledTableCell>
                                        <StyledTableCell>{row.Pass_Count}</StyledTableCell>
                                        <StyledTableCell>{row.Pass_Rate}%</StyledTableCell>
                                        <StyledTableCell>{row.Overkill_Rate}%</StyledTableCell>
                                    </StyledTableRow>
                                )
                            ))}
                            {sortedDetails.length > 0 && (
                                <StyledTableRow>
                                    <LightBlueTableCell>總計</LightBlueTableCell>
                                    <LightBlueTableCell>{totalFailCount}</LightBlueTableCell>
                                    <LightBlueTableCell>{totalAoiDefect}</LightBlueTableCell>
                                    <LightBlueTableCell>{totalPassCount}</LightBlueTableCell>
                                    <StyledTableCell>{averagePassRate}%</StyledTableCell>
                                    <StyledTableCell>{averageOverkillRate}%</StyledTableCell>
                                </StyledTableRow>
                            )}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            </DialogContent>
        </Dialog>
    )
}

export default OverallDialog
