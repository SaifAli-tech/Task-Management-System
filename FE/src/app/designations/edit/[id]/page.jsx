"use client";
import { useEffect } from "react";
import { Button, TextField, FormControl, Container } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useRouter, useParams } from "next/navigation";
import withAuth from "@/components/withAuth";
import apiClient from "@/components/ApiClient";

const EditDesignationPage = () => {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiClient.get(`/designations/${id}`);
      formik.setValues(response.data);
    } catch (error) {
      console.error("Error fetching designation data:", error);
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Designation name is required")
      .matches(
        /^[A-Za-z\s]*$/,
        "Designation name cannot contain any special characters or numbers"
      )
      .min(3, "Designation name must contain atleast 3 characters")
      .max(30, "Designation name must not be longer than 30 characters"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await apiClient.put(`/designations/${id}`, values);

        Swal.fire({
          icon: "success",
          color: "green",
          title: "Success",
          text: "Designation updated successfully!",
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
      maxWidth="xs"
      className="flex items-center justify-center h-full p-0 m-4"
    >
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white rounded-3xl border-8 border-purple-800 px-8 py-6 w-full"
      >
        <h2 className="text-center text-2xl font-bold mb-8 text-purple-800">
          Edit Designation
        </h2>
        <FormControl fullWidth>
          <TextField
            label="Designation Name"
            type="text"
            name="name"
            className="mb-6"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <div className="flex items-center justify-center">
            <Button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg normal-case font-bold py-2 px-4 rounded mr-5"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-800 hover:bg-purple-600 text-white text-lg font-bold normal-case py-2 px-4 rounded"
            >
              Submit
            </Button>
          </div>
        </FormControl>
      </form>
    </Container>
  );
};

export default withAuth(EditDesignationPage, ["Admin"]);
