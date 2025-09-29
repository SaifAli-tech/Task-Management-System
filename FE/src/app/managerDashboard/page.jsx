"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Typography,
  Card,
  CardContent,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Paper,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import apiClient from "@/components/ApiClient";
import withAuth from "@/components/withAuth";
import { useSession } from "next-auth/react";

const ManagerDashboardPage = () => {
  const { data: session } = useSession();
  const userId = session.user._id;
  const [taskSummary, setTaskSummary] = useState(null);
  const [taskProgress, setTaskProgress] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTaskSummary();
    fetchTaskProgress();
    fetchData();
  }, []);

  const fetchTaskSummary = async () => {
    try {
      const response = await apiClient.get(`/tasks/allTaskSummary/${userId}`);
      setTaskSummary(response.data);
    } catch (error) {
      console.error("Error fetching task summary:", error);
    }
  };

  const fetchTaskProgress = async () => {
    try {
      const response = await apiClient.get(`/tasks/allTaskProgress/${userId}`);
      setTaskProgress(response.data);
    } catch (error) {
      console.error("Error fetching task progress:", error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await apiClient.get(`/tasks/allOverdueTasks/${userId}`);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      <Typography
        variant="h4"
        align="center"
        className="mb-8 text-purple-800 font-bold"
      >
        Dashboard
      </Typography>

      <div className="grid grid-cols-2 gap-8 w-full px-4">
        <Card className="border-purple-800 border-8 rounded-3xl">
          <CardContent>
            <Typography variant="h6" className="text-center">
              Total Number of Tasks : {taskSummary?.total}
            </Typography>
            <BarChart
              xAxis={[{ id: "status", data: ["Tasks"] }]}
              series={[
                {
                  data: [taskSummary?.pending || 0],
                  label: "Pending",
                  color: "orange",
                },
                {
                  data: [taskSummary?.inProgress || 0],
                  label: "In Progress",
                  color: "blue",
                },
                {
                  data: [taskSummary?.completed || 0],
                  label: "Completed",
                  color: "green",
                },
                {
                  data: [taskSummary?.overdue || 0],
                  label: "Overdue",
                  color: "red",
                },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card className="border-purple-800 border-8 rounded-3xl">
          <CardContent>
            <Typography variant="h6" className="text-center">
              Task Summary in Percentage
            </Typography>
            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 0,
                      label: "Pending",
                      value: Number(
                        (
                          (taskSummary?.pending / taskSummary?.total) *
                          100
                        ).toFixed(1)
                      ),
                      color: "orange",
                    },
                    {
                      id: 1,
                      label: "In Progress",
                      value: Number(
                        (
                          (taskSummary?.inProgress / taskSummary?.total) *
                          100
                        ).toFixed(1)
                      ),
                      color: "blue",
                    },
                    {
                      id: 2,
                      label: "Completed",
                      value: Number(
                        (
                          (taskSummary?.completed / taskSummary?.total) *
                          100
                        ).toFixed(1)
                      ),
                      color: "green",
                    },
                    {
                      id: 3,
                      label: "Overdue",
                      value: Number(
                        (
                          (taskSummary?.overdue / taskSummary?.total) *
                          100
                        ).toFixed(1)
                      ),
                      color: "red",
                    },
                  ],
                },
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      <div className="px-4 py-8">
        <Card className="border-purple-800 border-8 rounded-3xl">
          <CardContent>
            <Typography variant="h6" className="text-center">
              Task Created vs Task Completed
            </Typography>
          </CardContent>
          {taskProgress && taskProgress.length > 0 ? (
            <LineChart
              dataset={taskProgress}
              xAxis={[{ dataKey: "date", scaleType: "band" }]}
              series={[
                { dataKey: "created", label: "Created", color: "orange" },
                { dataKey: "completed", label: "Completed", color: "green" },
              ]}
              height={400}
            />
          ) : (
            <p className="text-center">No data available</p>
          )}
        </Card>
      </div>

      <Typography
        variant="h4"
        align="center"
        className="mb-8 text-purple-800 font-bold"
      >
        Overdue Tasks
      </Typography>

      {tasks.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <Typography variant="h6" color="textSecondary">
            No overdue task found
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

export default withAuth(ManagerDashboardPage, ["Manager"]);
