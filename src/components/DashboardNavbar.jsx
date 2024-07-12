import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Fade,
  IconButton,
  Toolbar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Logo from "./Logo";
import { useRef } from "react";

const DashboardNavbar = ({ onMobileNavOpen }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
  const linkRef = useRef(null);

  return (
    <AppBar elevation={0} color="primary">
      <Toolbar>
        <Tooltip
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
          title="跳轉到首頁"
          arrow
        >
          <RouterLink ref={linkRef} to="/app/airesults">
            <Logo />
          </RouterLink>
        </Tooltip>
        <div style={{ flexGrow: 1 }} />
        {isSmallScreen && (
          <IconButton color="inherit" onClick={onMobileNavOpen}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default DashboardNavbar;
