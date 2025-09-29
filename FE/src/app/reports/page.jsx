"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
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
  FormControl,
  InputLabel,
  Avatar,
  Chip,
} from "@mui/material";
import { PulseLoader } from "react-spinners";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/components/ApiClient";
import withAuth from "@/components/withAuth";

const ReportsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status");
  const urlAssignedTo = searchParams.get("assignedTo");
  const urlFirstDate = searchParams.get("firstDate");
  const urlLastDate = searchParams.get("lastDate");
  const [tasks, setTasks] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState(urlStatus || "");
  const [assignedTo, setAssignedTo] = useState(urlAssignedTo || "");
  const [firstDate, setFirstDate] = useState(urlFirstDate || "");
  const [lastDate, setLastDate] = useState(urlLastDate || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [status, assignedTo, firstDate, lastDate]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/tasks/report?status=${status}&assignedTo=${assignedTo}&firstDate=${firstDate}&lastDate=${lastDate}`
      );
      setTasks(response.data.tasks);
      setReportData(response.data.report);
      router.replace(
        `/reports?status=${status}&assignedTo=${assignedTo}&firstDate=${firstDate}&lastDate=${lastDate}`
      );
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await apiClient.get(
        `/tasks/export?status=${status}&assignedTo=${assignedTo}&firstDate=${firstDate}&lastDate=${lastDate}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "task-report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting CSV", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get(`/users/designation/Member`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      <Typography
        variant="h4"
        align="center"
        className="mb-8 text-purple-800 font-bold"
      >
        Reports
      </Typography>

      <div className="flex justify-between items-center mb-6">
        <FormControl className="w-52">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="">
              <em>Select Status</em>
            </MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="user-select-label">Assigned To</InputLabel>
          <Select
            labelId="user-select-label"
            name="assignedTo"
            label="Assigned To"
            value={assignedTo}
            className="w-52"
            onChange={(e) => setAssignedTo(e.target.value)}
            renderValue={(selected) => {
              const member = members.find((m) => m._id === selected);
              return (
                <div className="flex items-center">
                  <Avatar
                    src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${member?.image}`}
                    className="mr-4"
                  />
                  <span>{member?.userName}</span>
                </div>
              );
            }}
          >
            <MenuItem value="">
              <em>Select Member</em>
            </MenuItem>
            {members.map((member) => (
              <MenuItem key={member._id} value={member._id}>
                <Avatar
                  src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${member.image}`}
                  className="mr-4"
                />
                {member.userName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="First Date"
          type="date"
          name="firstDate"
          className="w-52"
          InputLabelProps={{ shrink: true }}
          value={firstDate}
          onChange={(e) => setFirstDate(e.target.value)}
        />
        <TextField
          label="Last Date"
          type="date"
          name="lastDate"
          className="w-52"
          InputLabelProps={{ shrink: true }}
          value={lastDate}
          onChange={(e) => setLastDate(e.target.value)}
        />
        <Button
          variant="contained"
          className="flex bg-purple-800 hover:bg-purple-600 normal-case px-3 py-2 text-[16px]"
          onClick={() => handleExportCSV()}
        >
          Export CSV
        </Button>
      </div>

      <div className="mb-6 p-2 border-purple-800 border-4 rounded-3xl">
        <Typography variant="h6" align="center" className="text-black">
          Total Number of Tasks : {reportData?.total}
        </Typography>
        <Typography variant="h6" align="center" className="text-black">
          Number of Pending Tasks : {reportData?.pending}
        </Typography>
        <Typography variant="h6" align="center" className="text-black">
          Number of In Progress Tasks : {reportData?.inProgress}
        </Typography>
        <Typography variant="h6" align="center" className="text-black">
          Number of Completed Tasks : {reportData?.completed}
        </Typography>
        <Typography variant="h6" align="center" className="text-black">
          Number of Overdue Tasks : {reportData?.overdue}
        </Typography>
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
                  Assigned To
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Created At
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Deadline
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Completed At
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Status
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
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {task.title}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {task.priority}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    <div className="flex items-center justify-center">
                      <Avatar
                        src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${task.assignedTo.image}`}
                        className="mr-4"
                      />
                      {task.assignedTo.userName}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {format(new Date(task?.createdAt), "dd-MMMM-yyyy")}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {format(new Date(task?.deadline), "dd-MMMM-yyyy")}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {task.completedAt
                      ? format(new Date(task?.completedAt), "dd-MMMM-yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Chip
                      label={task.status}
                      className="font-bold text-base"
                      color={
                        task.status === "Pending"
                          ? "warning"
                          : task.status === "In Progress"
                          ? "info"
                          : task.status === "Completed"
                          ? "success"
                          : "default"
                      }
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default withAuth(ReportsPage, ["Manager"]);
