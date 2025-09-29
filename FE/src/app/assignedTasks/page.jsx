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
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Avatar,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PulseLoader } from "react-spinners";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import apiClient from "@/components/ApiClient";
import withAuth from "@/components/withAuth";
import { useSession } from "next-auth/react";
import PaginationControls from "@/components/PaginationControls";
import { io } from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);

const AssignedTasksPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session.user._id;
  const searchParams = useSearchParams();
  const urlPage = searchParams.get("page");
  const urlRecords = searchParams.get("take");
  const urlSearch = searchParams.get("search");
  const urlSearchBy = searchParams.get("searchBy");
  const urlStatus = searchParams.get("status");
  const urlPriority = searchParams.get("priority");
  const urlCreatedBy = searchParams.get("createdBy");
  const urlDeadline = searchParams.get("dealine");
  const [tasks, setTasks] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState(urlSearch || "");
  const [searchBy, setSearchBy] = useState(urlSearchBy || "title");
  const [status, setStatus] = useState(urlStatus || "");
  const [priority, setPriority] = useState(urlPriority || "");
  const [createdBy, setCreatedBy] = useState(urlCreatedBy || "");
  const [deadline, setDeadline] = useState(urlDeadline || "");
  const [page, setPage] = useState(Number(urlPage) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(Number(urlRecords) || 10);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchTerm, status, priority, createdBy, deadline]);

  useEffect(() => {
    router.replace(
      `/assignedTasks?page=${page}&take=${rowsPerPage}&search=${searchTerm}&searchBy=${searchBy}&status=${status}&priority=${priority}&createdBy=${createdBy}&deadline=${deadline}`
    );
  }, [
    page,
    rowsPerPage,
    searchTerm,
    searchBy,
    status,
    priority,
    createdBy,
    deadline,
  ]);

  useEffect(() => {
    fetchManagers();
  }, []);

  useEffect(() => {
    socket.on("taskUpdates", (memberId) => {
      if (memberId === userId) {
        fetchData();
      }
    });

    return () => {
      socket.off("taskUpdates");
    };
  }, [
    page,
    rowsPerPage,
    searchTerm,
    searchBy,
    status,
    priority,
    createdBy,
    deadline,
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/tasks/assignedTasks?page=${page}&take=${rowsPerPage}&search=${searchTerm}&searchBy=${searchBy}&status=${status}&priority=${priority}&createdBy=${createdBy}&deadline=${deadline}`
      );
      setTasks(response.data.tasks);
      setCount(response.data.meta.pageCount);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await apiClient.get(`/users/designation/Manager`);
      setManagers(response.data);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    let date = null;
    if (newStatus == "Completed") date = Date.now();
    try {
      await apiClient.put(`/tasks/updateStatus/${id}`, {
        status: newStatus,
        completedAt: date,
      });

      fetchData();

      Swal.fire({
        icon: "success",
        color: "green",
        title: "Success",
        text: `Task status updated successfully!`,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        color: "red",
        title: "Oops...",
        text: error.response?.data.message,
      });
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
        Assigned Tasks
      </Typography>

      <Dialog open={!!selectedTask} onClose={() => setSelectedTask(null)}>
        <DialogTitle className="text-center bg-purple-800 text-white font-bold rounded-md m-1">
          Task Details
        </DialogTitle>
        <DialogContent className="text-lg">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Title :</strong>
                </td>
                <td className="p-1">{selectedTask?.title}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4 align-top">
                  <strong>Description :</strong>
                </td>
                <td className="p-1">{selectedTask?.description}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Priority :</strong>
                </td>
                <td className="p-1">{selectedTask?.priority}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Status :</strong>
                </td>
                <td className="p-1">{selectedTask?.status}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Assigned To :</strong>
                </td>
                <td className="p-1">{selectedTask?.assignedTo.userName}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Created By :</strong>
                </td>
                <td className="p-1">{selectedTask?.createdBy.userName}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Deadline :</strong>
                </td>
                <td className="p-1">
                  {selectedTask?.deadline
                    ? format(new Date(selectedTask?.deadline), "dd-MMMM-yyyy")
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Completed At :</strong>
                </td>
                <td className="p-1">
                  {selectedTask?.completedAt
                    ? format(
                        new Date(selectedTask?.completedAt),
                        "dd-MMMM-yyyy"
                      )
                    : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </DialogContent>
        <DialogActions className="flex items-center justify-center mb-2">
          <Button
            className="bg-purple-800 hover:bg-purple-600 text-white font-bold py-2 px-9 rounded-full"
            onClick={() => setSelectedTask(null)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
      >
        <DialogTitle className="text-center bg-purple-800 text-white font-bold  m-1 rounded-md">
          Filters
        </DialogTitle>
        <DialogContent className="pb-0">
          <div className="flex flex-col gap-6 items-center p-4">
            <FormControl className="w-60">
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={status}
                label="Status"
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">
                  <em>Select Status</em>
                </MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="w-60">
              <InputLabel id="priority-select-label">Priority</InputLabel>
              <Select
                labelId="priority-select-label"
                value={priority}
                label="Priority"
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">
                  <em>Select Priority</em>
                </MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="user-select-label">Created By</InputLabel>
              <Select
                labelId="user-select-label"
                label="Created By"
                value={createdBy}
                className="w-60"
                onChange={(e) => {
                  setCreatedBy(e.target.value);
                  setPage(1);
                }}
                renderValue={(selected) => {
                  const manager = managers.find((m) => m._id === selected);
                  return (
                    <div className="flex items-center">
                      <Avatar
                        src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${manager?.image}`}
                        className="mr-4"
                      />
                      <span>{manager?.userName}</span>
                    </div>
                  );
                }}
              >
                <MenuItem value="">
                  <em>Select Manager</em>
                </MenuItem>
                {managers.map((manager) => (
                  <MenuItem key={manager._id} value={manager._id}>
                    <Avatar
                      src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${manager.image}`}
                      className="mr-4"
                    />
                    {manager.userName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Deadline"
              type="date"
              name="deadline"
              className="w-60"
              InputLabelProps={{ shrink: true }}
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </DialogContent>
        <DialogActions className="flex items-center justify-center m-2">
          <Button
            className="bg-purple-800 hover:bg-purple-600 text-white font-bold py-2 px-9 rounded-full"
            onClick={() => setFilterDialogOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <FormControl className="flex w-52">
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
              <MenuItem value="description">Description</MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={handleSearch}
            fullWidth
          />
        </div>

        <Button
          variant="contained"
          className="flex bg-purple-800 hover:bg-purple-600 normal-case px-3 py-2 text-[16px]"
          onClick={() => setFilterDialogOpen(true)}
        >
          Filters
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center my-36">
          <PulseLoader color="#5B21B6" size="12px" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <Typography variant="h6" color="textSecondary">
            No task found
          </Typography>
        </div>
      ) : (
        <TableContainer
          component={Paper}
          className="flex w-full overflow-x-auto rounded-3xl"
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
                  Priority
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Created By
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Deadline
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Status
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task, index) => (
                <TableRow
                  key={task._id}
                  className={
                    !task.completedAt &&
                    new Date(task.deadline).setHours(0, 0, 0, 0) <
                      new Date().setHours(0, 0, 0, 0)
                      ? "bg-red-200"
                      : ""
                  }
                >
                  <TableCell className="font-bold text-base text-center">
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {task.title}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {task.priority}
                  </TableCell>
                  <TableCell className="font-bold text-base">
                    <div className="flex items-center justify-center">
                      <Avatar
                        src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${task.createdBy.image}`}
                        className="mr-4"
                      />
                      {task.createdBy.userName}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {format(new Date(task.deadline), "dd-MMMM-yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <FormControl className="w-36">
                        <InputLabel id="status-select-label">Status</InputLabel>
                        <Select
                          disabled={task.status == "Completed" ? true : false}
                          labelId="status-select-label"
                          label="Status"
                          value={task.status}
                          onChange={(e) => {
                            updateStatus(task._id, e.target.value);
                          }}
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <IconButton onClick={() => setSelectedTask(task)}>
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

export default withAuth(AssignedTasksPage, ["Member"]);
