import { Helmet } from 'react-helmet'
import { Box, Container } from '@mui/material'
import ChartContent from '../components/chart/ChartContent'

const Chart = () => {
    return (
        <>
            <Helmet>
                <title>Chart | 3/O AOI</title>
            </Helmet>
            <Box
                sx={{
                    minHeight: '100%',
                    py: 1,
                }}
            >
                <Container maxWidth={false}>
                    <Box sx={{ pt: 1 }}>
                        <ChartContent />
                    </Box>
                </Container>
            </Box>
        </>
    )
}

export default Chart
