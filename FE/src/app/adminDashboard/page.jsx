"use client";

import { useState, useEffect } from "react";
import { Typography, Card, CardContent } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import apiClient from "@/components/ApiClient";
import withAuth from "@/components/withAuth";

const AdminDashboardPage = () => {
  const [userSummary, setUserSummary] = useState(null);
  const [designationSummary, setDesignationSummary] = useState(null);
  const [departmentSummary, setDepartmentSummary] = useState(null);
  const [usersOverTime, setUsersOverTime] = useState(null);

  useEffect(() => {
    fetchUsersSummary();
    fetchUsersOverTime();
  }, []);

  const fetchUsersSummary = async () => {
    try {
      const response = await apiClient.get(`/users/userSummary`);
      setUserSummary(response.data);
      setDesignationSummary(
        Object.entries(response.data.designationSummary).map(
          ([label, value]) => ({
            label,
            value,
          })
        )
      );
      setDepartmentSummary(
        Object.entries(response.data.departmentSummary).map(
          ([label, value]) => ({
            id: label,
            value,
            label,
          })
        )
      );
    } catch (error) {
      console.error("Error fetching user summary:", error);
    }
  };

  const fetchUsersOverTime = async () => {
    try {
      const response = await apiClient.get(`/users/usersOverTime`);
      setUsersOverTime(response.data);
    } catch (error) {
      console.error("Error fetching users over time:", error);
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
              Total Number of Users : {userSummary?.totalUsersCount}
            </Typography>
            {userSummary ? (
              <BarChart
                xAxis={[
                  {
                    data: ["Users By Status"],
                    scaleType: "band",
                  },
                ]}
                series={[
                  {
                    data: [userSummary?.approvedUsersCount || 0],
                    label: "Approved Users",
                    color: "green",
                  },
                  {
                    data: [userSummary?.notApprovedUsersCount || 0],
                    label: "Not Approved Users",
                    color: "red",
                  },
                ]}
                height={300}
              />
            ) : (
              <p className="text-center">No data available.</p>
            )}
            ;
          </CardContent>
        </Card>

        <Card className="border-purple-800 border-8 rounded-3xl">
          <CardContent>
            <Typography variant="h6" className="text-center">
              User Summary by Status in Percentage
            </Typography>
            {userSummary ? (
              <PieChart
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        label: "Approved Users",
                        value: Number(
                          (
                            (userSummary?.approvedUsersCount /
                              userSummary?.totalUsersCount) *
                            100
                          ).toFixed(1)
                        ),
                        color: "green",
                      },
                      {
                        id: 1,
                        label: "Not Approved Users",
                        value: Number(
                          (
                            (userSummary?.notApprovedUsersCount /
                              userSummary?.totalUsersCount) *
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
            ) : (
              <p className="text-center">No data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full px-4 pt-8">
        <Card className="border-purple-800 border-8 rounded-3xl">
          <CardContent>
            <Typography variant="h6" className="text-center">
              Total Number of Users : {userSummary?.totalUsersCount}
            </Typography>
            {designationSummary && designationSummary.length > 0 ? (
              <BarChart
                xAxis={[
                  {
                    data: ["Users By Designation"],
                    scaleType: "band",
                  },
                ]}
                series={designationSummary.map((d) => ({
                  label: d.label,
                  data: [d.value],
                }))}
                height={300}
              />
            ) : (
              <p className="text-center">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-800 border-8 rounded-3xl">
          <CardContent>
            <Typography variant="h6" className="text-center">
              User Summary by Designation in Percentage
            </Typography>
            {designationSummary && designationSummary.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: designationSummary.map((d) => ({
                      id: d.id,
                      label: d.label,
                      value: Number(
                        ((d.value / userSummary.totalUsersCount) * 100).toFixed(
                          1
                        )
                      ),
                    })),
                  },
                ]}
                height={300}
              />
            ) : (
              <p className="text-center">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full px-4 pt-8">
        <Card className="border-purple-800 border-8 rounded-3xl">
          <CardContent>
            <Typography variant="h6" className="text-center">
              Total Number of Users : {userSummary?.totalUsersCount}
            </Typography>
            {departmentSummary && departmentSummary.length > 0 ? (
              <BarChart
                xAxis={[
                  {
                    data: ["Users by Department"],
                    scaleType: "band",
                  },
                ]}
                series={departmentSummary.map((d) => ({
                  label: d.label,
                  data: [d.value],
                }))}
                height={300}
              />
            ) : (
              <p className="text-center">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-800 border-8 rounded-3xl">
          <CardContent>
            <Typography variant="h6" className="text-center">
              User Summary by Department in Percentage
            </Typography>
            {departmentSummary && departmentSummary.length > 0 ? (
              <PieChart
                series={[
                  {
                    data: departmentSummary.map((d) => ({
                      id: d.id,
                      label: d.label,
                      value: Number(
                        ((d.value / userSummary.totalUsersCount) * 100).toFixed(
                          1
                        )
                      ),
                    })),
                  },
                ]}
                height={300}
              />
            ) : (
              <p className="text-center">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-4 py-8">
        <Card className="border-purple-800 border-8 rounded-3xl">
          <CardContent>
            <Typography variant="h6" className="text-center">
              Users Over Time
            </Typography>
          </CardContent>
          {usersOverTime && usersOverTime.length > 0 ? (
            <LineChart
              dataset={usersOverTime}
              xAxis={[{ dataKey: "date", scaleType: "band" }]}
              series={[{ dataKey: "created", label: "Users", color: "green" }]}
              height={400}
            />
          ) : (
            <p className="text-center">No data available</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default withAuth(AdminDashboardPage, ["Admin"]);
