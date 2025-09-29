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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha";
import { PulseLoader } from "react-spinners";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import apiClient from "@/components/ApiClient";
import withAuth from "@/components/withAuth";
import PaginationControls from "@/components/PaginationControls";

const DesignationsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPage = searchParams.get("page");
  const urlRecords = searchParams.get("take");
  const urlOrder = searchParams.get("sort");
  const urlSearch = searchParams.get("search");
  const [designations, setDesignations] = useState([]);
  const [searchTerm, setSearchTerm] = useState(urlSearch || "");
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
  }, [page, rowsPerPage, sortDirection, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/designations/pagedata?page=${page}&take=${rowsPerPage}&order=${sortDirection}&search=${searchTerm}`
      );
      setDesignations(response.data.designations);
      setCount(response.data.meta.pageCount);

      router.replace(
        `/designations?page=${page}&take=${rowsPerPage}&order=${sortDirection}&search=${searchTerm}`
      );
    } catch (error) {
      console.error("Error fetching designations:", error);
    } finally {
      setLoading(false);
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

  const deleteDesignation = async () => {
    if (deleteId && deleteName) {
      try {
        await apiClient.delete(`/designations/${deleteId}`);
        Swal.fire({
          icon: "success",
          color: "green",
          title: "Success",
          text: `Designation "${deleteName}" deleted successfully.`,
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

  const openConfirmDialog = (designationId, designationName) => {
    setDeleteId(designationId);
    setDeleteName(designationName);
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

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4">
      <Typography
        variant="h4"
        align="center"
        className="mb-8 text-purple-800 font-bold"
      >
        Designations
      </Typography>

      <Dialog open={confirmDialogOpen} onClose={closeConfirmDialog}>
        <DialogTitle className="text-center bg-purple-800 text-white font-bold m-1 rounded-md">{`Delete Designation "${deleteName}"`}</DialogTitle>
        <DialogContent className="p-4">
          <DialogContentText className="font-bold mt-4 text-gray-700">
            Are you sure you want to permanently delete this designation?
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
            onClick={deleteDesignation}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <TextField
          variant="outlined"
          placeholder="Search designations..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex w-1/4"
        />
        <Button
          variant="contained"
          className="flex bg-purple-800 hover:bg-purple-600 normal-case px-3 py-2 text-[16px]"
          onClick={() => router.push("/designations/add")}
        >
          Add Designation
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center my-36">
          <PulseLoader color="#5B21B6" size="12px" />
        </div>
      ) : designations.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <Typography variant="h6" color="textSecondary">
            No designation found
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
                  Name{" "}
                  <IconButton onClick={toggleSortDirection}>
                    <SortByAlphaIcon />
                  </IconButton>
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Created At
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Updated At
                </TableCell>
                <TableCell className="font-bold text-center text-white text-lg">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {designations.map((designation, index) => (
                <TableRow key={designation._id}>
                  <TableCell className="font-bold text-base text-center">
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {designation.name}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {format(
                      new Date(designation.createdAt),
                      "dd-MMMM-yyyy hh:mm:ss aaa"
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    {format(
                      new Date(designation.updatedAt),
                      "dd-MMMM-yyyy hh:mm:ss aaa"
                    )}
                  </TableCell>
                  <TableCell className="font-bold text-base text-center">
                    <IconButton
                      onClick={() =>
                        router.push(`/designations/edit/${designation._id}`)
                      }
                    >
                      <EditIcon className="text-green-500" />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        openConfirmDialog(designation._id, designation.name)
                      }
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

export default withAuth(DesignationsPage, ["Admin"]);
