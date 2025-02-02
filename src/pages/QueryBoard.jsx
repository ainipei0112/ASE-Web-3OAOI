// React套件
import { Helmet } from 'react-helmet'

// MUI套件
import { Box, Container } from '@mui/material'

// 自定義套件
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
