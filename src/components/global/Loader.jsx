import { Box } from '@mui/material'
import { InfinitySpin } from 'react-loader-spinner'

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
            <InfinitySpin
                height="200"
                width="200"
                glassColor="#9AD09C"
                color="#257209"
            />
        </Box>
    )
}

export default Loader
