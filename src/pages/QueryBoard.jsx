import { Helmet } from 'react-helmet'
import { Box, Container } from '@mui/material'
import QueryboardContent from '../components/queryboard/QueryboardContent'

const QueryBoard = () => {
    return (
        <>
            <Helmet>
                <title>QueryBoard | 3/O AOI</title>
            </Helmet>
            <Box
                sx={{
                    minHeight: '100%',
                    py: 1,
                }}
            >
                <Container maxWidth={false}>
                    <Box sx={{ pt: 1 }}>
                        <QueryboardContent />
                    </Box>
                </Container>
            </Box>
        </>
    )
}

export default QueryBoard
