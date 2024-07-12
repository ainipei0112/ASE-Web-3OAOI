import { Link as RouterLink } from "react-router-dom";
import { AppBar, Toolbar } from "@mui/material";
import CabinIcon from '@mui/icons-material/Cabin';

const MainNavbar = (props) => (
  <AppBar elevation={0} {...props}>
    <Toolbar sx={{ height: 64 }}>
      <RouterLink to="/">
        <CabinIcon />
      </RouterLink>
    </Toolbar>
  </AppBar>
);

export default MainNavbar;
