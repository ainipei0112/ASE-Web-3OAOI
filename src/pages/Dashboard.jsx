import { Helmet } from 'react-helmet'
import { Box, Container } from '@mui/material'
import DashboardContent from '../components/dashboard/DashboardContent'

const DashBoard = () => {
    return (
        <>
            <Helmet>
                <title>DashBoard | 3/O AOI</title>
            </Helmet>
            <Box
                sx={{
                    minHeight: '100%',
                    py: 1,
                }}
            >
                <Container maxWidth={false}>
                    <Box sx={{ pt: 1 }}>
                        <DashboardContent />
                    </Box>
                </Container>
            </Box>
        </>
    )
}

export default DashBoard
