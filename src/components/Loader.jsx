import { Box } from '@mui/material'

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
