"use client";

import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  FormControl,
  Avatar,
  Container,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import withAuth from "@/components/withAuth";
import apiClient from "@/components/ApiClient";

const EditUserPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      formik.setValues(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
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

  const validationSchema = Yup.object().shape({
    designation: Yup.string().required("Designation is required"),
    department: Yup.string().required("Department is required"),
  });

  const formik = useFormik({
    initialValues: {
      image: null,
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      employeeNumber: "",
      designation: "",
      department: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await apiClient.put(`/users/${id}`, values);
        Swal.fire({
          icon: "success",
          color: "green",
          title: "Success",
          text: `User updated successfully`,
        });
        router.back();
      } catch (error) {
        Swal.fire({
          icon: "error",
          color: "red",
          title: "Oops...",
          text: error.response?.data.message,
        });
      }
    },
  });

  return (
    <Container
      maxWidth="md"
      className="flex items-center justify-center h-full p-0 m-6"
    >
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white shadow-md rounded-3xl border-8 border-purple-800 px-8 py-4 w-full justify-center"
      >
        <h2 className="text-center text-2xl font-bold mb-6 text-purple-800">
          Edit User
        </h2>
        <FormControl className="grid grid-cols-2 gap-6">
          <div className="flex justify-center col-span-2">
            <Avatar
              src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${formik.values.image}`}
              className="w-[100px] sm:w-[140px] md:w-[200px] h-[100px] sm:h-[140px] md:h-[200px]"
            />
          </div>
          <TextField
            disabled
            label="First Name"
            type="text"
            name="firstName"
            value={formik.values.firstName}
          />
          <TextField
            disabled
            label="Last Name"
            type="text"
            name="lastName"
            value={formik.values.lastName}
          />
          <TextField
            disabled
            label="User Name"
            type="text"
            name="userName"
            value={formik.values.userName}
          />
          <TextField
            disabled
            label="Employee Number"
            type="text"
            name="employeeNumber"
            value={formik.values.employeeNumber}
          />
          <TextField
            disabled
            label="Email"
            type="text"
            name="email"
            className="col-span-2"
            value={formik.values.email}
          />
          <FormControl
            error={
              formik.touched.designation && Boolean(formik.errors.designation)
            }
          >
            <InputLabel id="designation-select-label">Designation</InputLabel>
            <Select
              labelId="designation-select-label"
              name="designation"
              label="designation"
              value={formik.values.designation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {designations.map((designation) => (
                <MenuItem key={designation._id} value={designation._id}>
                  {designation.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.designation && formik.errors.designation}
            </FormHelperText>
          </FormControl>
          <FormControl
            error={
              formik.touched.department && Boolean(formik.errors.department)
            }
          >
            <InputLabel id="department-select-label">Department</InputLabel>
            <Select
              labelId="department-select-label"
              name="department"
              label="department"
              value={formik.values.department}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              {departments.map((department) => (
                <MenuItem key={department._id} value={department._id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.department && formik.errors.department}
            </FormHelperText>
          </FormControl>
          <div className="col-span-2 flex items-center justify-center mb-2">
            <Button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg normal-case font-bold py-2 px-4 rounded mr-5"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-800 hover:bg-purple-600 text-white text-lg normal-case font-bold py-2 px-4 rounded"
            >
              Submit
            </Button>
          </div>
        </FormControl>
      </form>
    </Container>
  );
};

export default withAuth(EditUserPage, ["Admin"]);
