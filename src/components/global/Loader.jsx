import { Box } from '@mui/material'

// 頁面載入動畫
const Loader = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f3f3f3'
            }}
        >
            <img src="src\picture\gogogo.gif" alt="Loading..." />
        </Box>
    )
}

export default Loader
