// React套件
import { Helmet } from 'react-helmet'

// MUI套件
import { Box, Container } from '@mui/material'

// 自定義套件
import MailBoardContent from '../components/dashboard/MailBoardContent'

const MailBoard = () => {
    return (
        <>
            <Helmet>
                <title>MailBoard | 3/O AOI</title>
            </Helmet>
            <Box
                sx={{
                    minHeight: '100%',
                    py: 1,
                }}
            >
                <Container maxWidth={false}>
                    <Box sx={{ pt: 1 }}>
                        <MailBoardContent />
                    </Box>
                </Container>
            </Box>
        </>
    )
}

export default MailBoard
