// MUI套件
import { Box, FormControlLabel, Switch, Typography } from '@mui/material'
import { styled } from '@mui/system'
import BarChartIcon from '@mui/icons-material/BarChart'

// 樣式定義
const CardHeader = styled(Box)({
    height: 45,
    backgroundColor: '#9AD09C',
    color: '#333',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    borderBottom: '1px solid #7ab17d',
    justifyContent: 'space-between'
})

const HeaderIcon = styled(BarChartIcon)({
    marginRight: 1,
    color: '#333'
})

const HeaderTitle = styled(Typography)({
    fontWeight: 'bold'
})

const HeaderTitleContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center'
})

const CardTitle = ({ title, showSwitch, onSwitchChange, switchChecked }) => {

    return (
        <CardHeader>
            <HeaderTitleContainer>
                <HeaderIcon />
                <HeaderTitle>{title}</HeaderTitle>
            </HeaderTitleContainer>
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
        </CardHeader>
    )
}

export default CardTitle