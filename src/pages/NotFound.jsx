// React套件
import { Helmet } from 'react-helmet'

// MUI套件
import { Box, Container, Typography } from '@mui/material'

const NotFound = () => (
    <>
        <Helmet>
            <title>404 | 3/O AOI</title>
        </Helmet>
        <Box
            sx={{
                backgroundColor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center',
            }}
        >
            <Container>
                <Typography align='center' color='textPrimary' variant='h3'>
                    404：您要查找的頁面不存在
                </Typography>
                <Typography align='center' color='textPrimary' variant='subtitle1'>
                    您可能嘗試了不尋常的路徑，或誤打誤撞來到這裡。
                </Typography>
            </Container>
        </Box>
    </>
)

export default NotFound
