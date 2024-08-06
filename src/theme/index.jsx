import { createTheme, colors } from '@mui/material'

const theme = createTheme({
    palette: {
        background: {
            default: '#ffffff',
            paper: colors.common.white,
        },
        primary: {
            contrastText: '#ffffff',
            main: '#257209',
        },
        text: {
            primary: '#172b4d',
            secondary: '#ffffff',
        },
    },
})

export default theme
