import { useEffect, useContext } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { AppContext } from "../Context";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  Hidden,
  List,
  Typography,
} from "@mui/material";
import { Database as DatabaseIcon } from "react-feather";
import NavItem from "./NavItem";

const user = {
  // avatar: '/static/images/avatars/avatar_6.png',
  jobTitle: "Senior Developer",
  name: "Katarina Smith",
};

const items = [
  {
    href: "/app/airesults",
    icon: DatabaseIcon,
    title: "Chart",
  },
];

const DashboardSidebar = ({ onMobileClose = () => { }, openMobile = false }) => {
  const location = useLocation();
  const { users } = useContext(AppContext);
  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const content = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >
          <Avatar
            component={RouterLink}
            src={user.avatar}
            sx={{
              cursor: "pointer",
              width: 64,
              height: 64,
            }}
            to="/app/products"
          />
          {users.map(({ userid, userjobtitle, userdeptname, username }) => {
            return (
              <>
                <Typography color="textPrimary" variant="h5">
                  {userid}
                </Typography>
                <Typography color="textPrimary" variant="h5">
                  {username}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  {userdeptname}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  {userjobtitle}
                </Typography>
              </>
            );
          })}
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <List>
            {items.map((item) => (
              <NavItem
                href={item.href}
                key={item.title}
                title={item.title}
                icon={item.icon}
              />
            ))}
          </List>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
          PaperProps={{
            sx: {
              width: 256,
            },
          }}
        >
          {content()}
        </Drawer>
      </Hidden>
      <Hidden lgDown>
        <Drawer
          anchor="left"
          open
          variant="persistent"
          PaperProps={{
            sx: {
              width: 256,
              top: 64,
              height: "calc(100% - 64px)",
            },
          }}
        >
          {content()}
        </Drawer>
      </Hidden>
    </>
  );
};

export default DashboardSidebar;
