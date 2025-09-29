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
  DialogContentText,
  FormControl,
  InputLabel,
  Avatar,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import { PulseLoader } from "react-spinners";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import apiClient from "@/components/ApiClient";
import withAuth from "@/components/withAuth";
import PaginationControls from "@/components/PaginationControls";

const UsersPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPage = searchParams.get("page");
  const urlRecords = searchParams.get("take");
  const urlOrder = searchParams.get("sort");
  const urlSearch = searchParams.get("search");
  const urlSearchBy = searchParams.get("searchBy");
  const urlDesignation = searchParams.get("designation");
  const urlDepartment = searchParams.get("department");
  const urlStatus = searchParams.get("status");
  const [users, setUsers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [status, setStatus] = useState(urlStatus || "");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(
    urlDesignation || ""
  );
  const [selectedDepartment, setSelectedDepartment] = useState(
    urlDepartment || ""
  );
  const [searchTerm, setSearchTerm] = useState(urlSearch || "");
  const [searchBy, setSearchBy] = useState(urlSearchBy || "userName");
  const [page, setPage] = useState(Number(urlPage) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(Number(urlRecords) || 10);
  const [sortDirection, setSortDirection] = useState(urlOrder || "ASC");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState(null);

  useEffect(() => {
    fetchData();
  }, [
    page,
    rowsPerPage,
    sortDirection,
    searchTerm,
    selectedDesignation,
    selectedDepartment,
    status,
  ]);

  useEffect(() => {
    router.replace(
      `/users?page=${page}&take=${rowsPerPage}&order=${sortDirection}&search=${searchTerm}&searchBy=${searchBy}&designation=${selectedDesignation}&department=${selectedDepartment}&status=${status}`
    );
  }, [
    page,
    rowsPerPage,
    sortDirection,
    searchTerm,
    searchBy,
    selectedDesignation,
    selectedDepartment,
    status,
  ]);

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/users/pagedata?page=${page}&take=${rowsPerPage}&order=${sortDirection}&search=${searchTerm}&searchBy=${searchBy}&designation=${selectedDesignation}&department=${selectedDepartment}&status=${status}`
      );
      setUsers(response.data.users);
      setCount(response.data.meta.pageCount);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await apiClient.get("/designations");
      setDesignations(response.data);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.get("/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
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

  const deleteUser = async () => {
    if (deleteId && deleteName) {
      try {
        await apiClient.delete(`/users/${deleteId}`);
        Swal.fire({
          icon: "success",
          color: "green",
          title: "Success",
          text: `User "${deleteName}" deleted successfully.`,
        });
        fetchData();
        closeConfirmDialog();
      } catch (error) {
        Swal.fire({
          icon: "error",
          color: "red",
          title: "Oops...",
          text: error.response?.data.message,
        });
        closeConfirmDialog();
      }
    }
  };

  const openConfirmDialog = (userId, userName) => {
    setDeleteId(userId);
    setDeleteName(userName);
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setDeleteId(null);
    setDeleteName(null);
    setConfirmDialogOpen(false);
  };

  const toggleSortDirection = () => {
    setSortDirection((prevDirection) =>
      prevDirection === "ASC" ? "DESC" : "ASC"
    );
  };

  const handleToggle = async (id, userName, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      await apiClient.put(`/users/approve/${id}`, { approved: newStatus });

      fetchData();

      Swal.fire({
        icon: "success",
        color: "green",
        title: "Success",
        text: `User "${userName}" account status updated successfully`,
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

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      <Typography
        variant="h4"
        align="center"
        className="mb-8 text-purple-800 font-bold"
      >
        Users
      </Typography>

      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)}>
        <DialogTitle className="text-center bg-purple-800 text-white font-bold rounded-md m-1">
          User Details
        </DialogTitle>
        <DialogContent className="text-lg">
          <table className="w-full">
            <tbody>
              <tr>
                <td colSpan={2}>
                  <Avatar
                    src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${selectedUser?.image}`}
                    className="w-[100px] h-[100px] mx-auto my-3"
                  />
                </td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Name :</strong>
                </td>
                <td className="p-1">
                  {`${selectedUser?.firstName} ${selectedUser?.lastName}`}
                </td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>User Name :</strong>
                </td>
                <td className="p-1">{selectedUser?.userName}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Email :</strong>
                </td>
                <td className="p-1">{selectedUser?.email}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Employee Number :</strong>
                </td>
                <td className="p-1">{selectedUser?.employeeNumber}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Designation :</strong>
                </td>
                <td className="p-1">{selectedUser?.designation.name}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Department :</strong>
                </td>
                <td className="p-1">{selectedUser?.department.name}</td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Status :</strong>
                </td>
                <td className="p-1">
                  {selectedUser?.approved ? "Approved" : "Not Approved"}
                </td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Created At :</strong>
                </td>
                <td className="p-1">
                  {selectedUser?.createdAt
                    ? format(
                        new Date(selectedUser?.createdAt),
                        "dd-MMMM-yyyy hh:mm:ss aaa"
                      )
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="font-bold pr-4">
                  <strong>Updated At :</strong>
                </td>
                <td className="p-1">
                  {selectedUser?.updatedAt
                    ? format(
                        new Date(selectedUser?.updatedAt),
                        "dd-MMMM-yyyy hh:mm:ss aaa"
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
            onClick={() => setSelectedUser(null)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={closeConfirmDialog}>
        <DialogTitle className="text-center bg-purple-800 text-white font-bold m-1 rounded-md">{`Delete User "${deleteName}"`}</DialogTitle>
        <DialogContent className="p-4">
          <DialogContentText className="font-bold mt-4 text-gray-700">
            Are you sure you want to permanently delete this user?
            <p className="text-red-500">
              <b>Note:</b> This action is irreversible.
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="flex items-center justify-center m-2 pb-4">
          <Button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-8 rounded-full"
            onClick={closeConfirmDialog}
          >
            Cancel
          </Button>
          <Button
            className="bg-purple-800 hover:bg-purple-600 text-white font-bold py-2 px-9 rounded-full"
            onClick={deleteUser}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <FormControl className="flex w-80">
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
              <MenuItem value="firstName">First Name</MenuItem>
              <MenuItem value="lastName">Last Name</MenuItem>
              <MenuItem value="userName">User Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="employeeNumber">Employee Number</MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            fullWidth
          />
        </div>
        <FormControl>
          <InputLabel id="designation-select-label">Designation</InputLabel>
          <Select
            labelId="designation-select-label"
            value={selectedDesignation}
            label="Designation"
            onChange={(e) => {
              setSelectedDesignation(e.target.value);
              setPage(1);
            }}
            className="flex w-40"
          >
            <MenuItem value="">
              <em>Select Designation</em>
            </MenuItem>
            {designations.map((designation) => (
              <MenuItem key={designation._id} value={designation._id}>
                {designation.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="department-select-label">Department</InputLabel>
          <Select
            labelId="department-select-label"
            value={selectedDepartment}
            label="Department"
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setPage(1);
            }}
            className="flex w-40"
          >
            <MenuItem value="">
              <em>Select Department</em>
            </MenuItem>
            {departments.map((department) => (
              <MenuItem key={department._id} value={department._id}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            label="Status"
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="flex w-40"
          >
            <MenuItem value="">
              <em>Select Status</em>
            </MenuItem>
            <MenuItem value="true">Approved</MenuItem>
            <MenuItem value="false">Not Approved</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          className="flex bg-purple-800 hover:bg-purple-600 normal-case px-3 py-2 text-[16px]"
          onClick={() => router.push("/auth/register")}
        >
          Add User
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center my-36">
          <PulseLoader color="#5B21B6" size="12px" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <Typography variant="h6" color="textSecondary">
            No user found
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
                  User Name{" "}
                  <IconButton onClick={toggleSortDirection}>
                    <SortByAlphaIcon />
                  </IconButton>
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Email
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Designation
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Department
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
              {users.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell className="font-bold text-base text-center">
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {user.userName}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {user.email}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {user.designation.name}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {user.department.name}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    <Switch
                      checked={user.approved}
                      onChange={() =>
                        handleToggle(user._id, user.userName, user.approved)
                      }
                    />
                    {user.approved ? "Approved" : "Not Approved"}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    <IconButton onClick={() => setSelectedUser(user)}>
                      <VisibilityIcon className="text-blue-500" />
                    </IconButton>
                    <IconButton
                      onClick={() => router.push(`/users/edit/${user._id}`)}
                    >
                      <EditIcon className="text-green-500" />
                    </IconButton>
                    <IconButton
                      onClick={() => openConfirmDialog(user._id, user.userName)}
                    >
                      <DeleteIcon className="text-red-500" />
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

export default withAuth(UsersPage, ["Admin"]);
