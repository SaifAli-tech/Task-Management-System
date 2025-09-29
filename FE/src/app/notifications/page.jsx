"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/components/ApiClient";
import withAuth from "@/components/withAuth";
import { useSession } from "next-auth/react";
import { PulseLoader } from "react-spinners";
import PaginationControls from "@/components/PaginationControls";
import { io } from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);

const NotificationList = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session.user._id;
  const searchParams = useSearchParams();
  const urlPage = searchParams.get("page");
  const urlRecords = searchParams.get("take");
  const urlSearch = searchParams.get("search");
  const urlSearchBy = searchParams.get("searchBy");
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState(urlSearch || "");
  const [searchBy, setSearchBy] = useState(urlSearchBy || "title");
  const [page, setPage] = useState(Number(urlPage) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(Number(urlRecords) || 10);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    router.replace(
      `/notifications?page=${page}&take=${rowsPerPage}&search=${searchTerm}&searchBy=${searchBy}`
    );
  }, [page, rowsPerPage, searchTerm, searchBy]);

  useEffect(() => {
    socket.on("notification", (memberId) => {
      if (memberId === userId) {
        fetchData();
      }
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/notifications/pagedata?page=${page}&take=${rowsPerPage}&search=${searchTerm}&searchBy=${searchBy}`
      );
      setNotifications(response.data.notifications);
      setCount(response.data.meta.pageCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const setRead = async (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      await apiClient.put(`/notifications/read/${notification._id}`, {
        read: true,
      });
      fetchData();
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setPage(1);
  };

  const handleRecordsPerPageChange = (event) => {
    const newRecords = parseInt(event.target.value, 10);
    setRowsPerPage(newRecords);
    setPage(1);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      <Typography
        variant="h4"
        align="center"
        className="mb-8 text-purple-800 font-bold"
      >
        Notifications
      </Typography>

      <Dialog
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
      >
        <DialogTitle className="text-center bg-purple-800 text-white font-bold rounded-md m-1">
          {selectedNotification?.title}
        </DialogTitle>
        <DialogContent className="flex p-4 mt-4 justify-center">
          <DialogContentText className="text-lg">
            <div>{selectedNotification?.text}</div>
            <div className="text-center mt-4">
              {selectedNotification?.createdAt
                ? format(
                    new Date(selectedNotification?.createdAt),
                    "dd-MMMM-yyyy"
                  )
                : "-"}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="flex items-center justify-center mb-2">
          <Button
            className="bg-purple-800 hover:bg-purple-600 text-white font-bold py-2 px-9 rounded-full"
            onClick={() => setSelectedNotification(null)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 w-2/5">
          <FormControl className="flex w-32">
            <InputLabel id="searchBy-select-label">Search By</InputLabel>
            <Select
              labelId="searchBy-select-label"
              value={searchBy}
              label="Search By"
              onChange={(e) => {
                setSearchBy(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="text">Text</MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={handleSearch}
            fullWidth
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center my-36">
          <PulseLoader color="#5B21B6" size="12px" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <Typography variant="h6" color="textSecondary">
            No notifications found
          </Typography>
        </div>
      ) : (
        <TableContainer
          component={Paper}
          className="w-full overflow-x-auto rounded-3xl"
        >
          <Table className="min-w-full border border-gray-300">
            <TableHead className="bg-purple-800">
              <TableRow>
                <TableCell className="font-bold text-center text-white text-lg">
                  #
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Title
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Date
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.map((notification, index) => (
                <TableRow
                  key={notification._id}
                  className={!notification.read ? "bg-purple-200 italic" : ""}
                >
                  <TableCell className="font-bold text-base text-center">
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {notification.title} {!notification.read ? "*" : ""}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {format(
                      new Date(notification?.createdAt),
                      "dd-MMMM-yyyy hh:mm:ss aaa"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <IconButton onClick={() => setRead(notification)}>
                      <VisibilityIcon className="text-blue-500" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <PaginationControls
        page={page}
        count={count}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRecordsPerPageChange}
      />
    </div>
  );
};

export default withAuth(NotificationList, ["Member"]);
