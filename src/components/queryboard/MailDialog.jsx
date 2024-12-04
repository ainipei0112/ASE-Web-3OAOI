import { useState } from 'react'
import PropTypes from 'prop-types' // 引入 prop-types
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel } from '@mui/material'

const MailDialog = ({ open, onClose, onSend, chartTitle }) => {
    const [subject, setSubject] = useState(`3/O AOI DashBoard - ${chartTitle}`)
    const [recipient, setRecipient] = useState('')
    const [content, setContent] = useState('')
    const [includeChart, setIncludeChart] = useState(true)
    const [includeTable, setIncludeTable] = useState(true)

    const handleSend = () => {
        onSend({ recipient, subject, content, includeChart, includeTable })
        onClose()
    }

    const handleContentChange = (e) => {
        setContent(e.target.value.replace(/\n/g, '<br>'))
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>發送郵件</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="收件人"
                    InputLabelProps={{
                        style: { color: 'black' },
                    }}
                    fullWidth
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="主旨"
                    InputLabelProps={{
                        style: { color: 'black' },
                    }}
                    fullWidth
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="內容"
                    InputLabelProps={{ style: { color: 'black' }, }}
                    fullWidth
                    multiline
                    rows={4}
                    value={content.replace(/<br>/g, '\n')}
                    onChange={handleContentChange}
                    placeholder="在此輸入郵件內容。使用 $_chart 和 $_table 來插入圖表和表格。"
                />
                <span style={{ padding: 10 }}>附件： </span>
                <FormControlLabel
                    control={<Checkbox checked={includeChart} onChange={(e) => setIncludeChart(e.target.checked)} />}
                    label="圖表"
                />
                <FormControlLabel
                    control={<Checkbox checked={includeTable} onChange={(e) => setIncludeTable(e.target.checked)} />}
                    label="表格"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>取消</Button>
                <Button onClick={handleSend}>發送</Button>
            </DialogActions>
        </Dialog>
    )
}

// 添加 propTypes 驗證
MailDialog.propTypes = {
    open: PropTypes.bool.isRequired, // 是否開啟對話框
    onClose: PropTypes.func.isRequired, // 關閉對話框的函數
    onSend: PropTypes.func.isRequired, // 發送郵件的函數
    chartTitle: PropTypes.string.isRequired, // 圖表標題
}

export default MailDialog
