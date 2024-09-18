import { useState } from 'react'
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
                    autoFocus
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

export default MailDialog
