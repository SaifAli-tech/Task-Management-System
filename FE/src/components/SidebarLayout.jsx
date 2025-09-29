"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Avatar,
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import apiClient from "@/components/ApiClient";
import { io } from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);

const SidebarLayout = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isLoggedIn = Boolean(session);
  const userDesignation = session?.user?.designation?.name;

  const fetchUnreadCount = async () => {
    try {
      const res = await apiClient.get(`/notifications/unread-count`);
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Error fetching unread count", err);
    }
  };

  useEffect(() => {
    if (userDesignation == "Member") fetchUnreadCount();
  }, [userDesignation]);

  useEffect(() => {
    socket.on("newNotification", (memberId) => {
      if (memberId == session?.user?._id) fetchUnreadCount();
    });

    return () => {
      socket.off("newNotification");
    };
  }, [session?.user?._id]);

  const handleLogout = () => {
    signOut({
      callbackUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/login`,
    });
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleInfoDialogOpen = () => {
    setInfoDialogOpen(true);
    handleMenuClose();
  };

  const handleInfoDialogClose = () => {
    setInfoDialogOpen(false);
  };

  const menuItems = [
    { text: "Home", href: "/", designations: ["Admin", "Manager", "Member"] },
    {
      text: "Dashboard",
      href: "/adminDashboard",
      designations: ["Admin"],
    },
    { text: "Users", href: "/users", designations: ["Admin"] },
    {
      text: "Designations",
      href: "/designations",
      designations: ["Admin"],
    },
    {
      text: "Departments",
      href: "/departments",
      designations: ["Admin"],
    },
    {
      text: "Dashboard",
      href: "/managerDashboard",
      designations: ["Manager"],
    },
    {
      text: "Dashboard",
      href: "/memberDashboard",
      designations: ["Member"],
    },
    {
      text: "Tasks",
      href: "/tasks",
      designations: ["Manager"],
    },
    {
      text: "Reports",
      href: "/reports",
      designations: ["Manager"],
    },
    {
      text: "Assigned Tasks",
      href: "/assignedTasks",
      designations: ["Member"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.designations?.includes(userDesignation)
  );

  const list = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box className="flex items-center justify-end bg-gradient-to-r from-violet-900 via-purple-800 to-rose-600 p-3 text-white">
        <Typography
          variant="body1"
          sx={{
            flexGrow: 1,
            paddingLeft: 0.6,
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          Menu
        </Typography>
        <IconButton onClick={toggleDrawer(false)} sx={{ color: "white" }}>
          <ChevronLeft />
        </IconButton>
      </Box>
      <List disablePadding>
        {filteredMenuItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton component="a" href={item.href}>
              <ListItemText className="!font-bold" primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <AppBar
        position="fixed"
        className="bg-gradient-to-r from-violet-900 via-purple-800 to-rose-600"
      >
        <Toolbar>
          {isLoggedIn && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Task Management System
          </Typography>
          {!isLoggedIn ? (
            <>
              <Button
                color="inherit"
                onClick={() => router.push("/auth/login")}
                className="text-lg font-bold normal-case mr-3"
              >
                Login
              </Button>
              <Button
                color="inherit"
                onClick={() => router.push("/auth/register")}
                className="text-lg font-bold normal-case"
              >
                Register
              </Button>
            </>
          ) : (
            <>
              {userDesignation == "Member" && (
                <IconButton
                  color="inherit"
                  onClick={() => router.push("/notifications")}
                  className="mr-2"
                >
                  <Badge badgeContent={unreadCount} color="warning">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              )}
              <IconButton color="inherit" onClick={handleMenuClick}>
                <Avatar
                  alt={session?.user?.userName}
                  src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${session?.user?.image}`}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleInfoDialogOpen}>
                  Personal Information
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push(`/profile/updateProfile/${session.user._id}`);
                    handleMenuClose();
                  }}
                >
                  Update Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push(`/profile/changePassword/${session.user._id}`);
                    handleMenuClose();
                  }}
                >
                  Change Password
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      {isLoggedIn && (
        <Drawer open={drawerOpen} onClose={toggleDrawer(false)}>
          {list()}
        </Drawer>
      )}

      <Dialog open={infoDialogOpen} onClose={handleInfoDialogClose}>
        <DialogTitle className="text-center bg-purple-800 text-white font-bold m-1 rounded-md py-3">
          Personal Information
        </DialogTitle>
        <DialogContent className="text-lg">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Name :</strong>
                </td>
                <td className="p-1">{`${session?.user?.firstName} ${session?.user?.lastName}`}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>User Name :</strong>
                </td>
                <td className="p-1">{session?.user?.userName}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Email :</strong>
                </td>
                <td className="p-1">{session?.user?.email}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Employee Number :</strong>
                </td>
                <td className="p-1">{session?.user?.employeeNumber}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Designation :</strong>
                </td>
                <td className="p-1">{userDesignation}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Department :</strong>
                </td>
                <td className="p-1">{session?.user?.department?.name}</td>
              </tr>
            </tbody>
          </table>
        </DialogContent>
        <DialogActions className="flex items-center justify-center mb-2">
          <Button
            className="bg-purple-800 hover:bg-purple-600 text-white font-bold py-2 px-9 rounded-full"
            onClick={handleInfoDialogClose}
            color="primary"
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          paddingTop: "64px", // This ensures content starts below the AppBar
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SidebarLayout;
