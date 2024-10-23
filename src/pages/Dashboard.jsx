import { Helmet } from 'react-helmet'
import { Box, Container } from '@mui/material'
import DashboardContent from '../components/chart/DashboardContent'

const Dashboard = () => {
    return (
        <>
            <Helmet>
                <title>Dashboard | 3/O AOI</title>
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

export default Dashboard
