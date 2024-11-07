import { Box, FormControlLabel, Switch, Typography } from '@mui/material'
import BarChartIcon from '@mui/icons-material/BarChart'

const styles = {
    cardHeader: {
        height: 45,
        backgroundColor: '#9AD09C',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid #7ab17d',
        justifyContent: 'space-between'
    },
    headerIcon: {
        marginRight: 1,
        color: '#333'
    },
    headerTitle: {
        fontWeight: 'bold'
    },
    headerTitleContainer: {
        display: 'flex',
        alignItems: 'center'
    }
}

const CardTitle = ({ title, showSwitch, onSwitchChange, switchChecked }) => {

    return (
        <Box sx={styles.cardHeader}>
            <Box sx={styles.headerTitleContainer}>
                <BarChartIcon sx={styles.headerIcon} />
                <Typography variant="h6" sx={styles.headerTitle}>{title}</Typography>
            </Box>
            {showSwitch && (
                <FormControlLabel
                    control={
                        <Switch
                            checked={switchChecked}
                            onChange={onSwitchChange}
                            color="primary"
                        />
                    }
                    label="顯示月報表"
                />
            )}
        </Box>
    )
}

export default CardTitle