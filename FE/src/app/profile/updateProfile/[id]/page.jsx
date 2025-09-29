"use client";

import { useEffect, useRef } from "react";
import { Person as PersonIcon } from "@mui/icons-material";
import {
  Button,
  TextField,
  FormControl,
  Avatar,
  Container,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import withAuth from "@/components/withAuth";
import apiClient from "@/components/ApiClient";
import { useSession } from "next-auth/react";

const UpdateProfilePage = () => {
  const router = useRouter();
  const { update } = useSession();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      formik.setValues(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const validationSchema = Yup.object().shape({
    image: Yup.mixed()
      .test(
        "fileType",
        "Only JPEG, JPG, PNG, GIF, WEBP, BMP, TIFF, SVG, and AVIF files are allowed",
        (value) => {
          if (!value || typeof value === "string") return true;
          return (
            value instanceof File &&
            [
              "image/jpeg",
              "image/jpg",
              "image/png",
              "image/gif",
              "image/webp",
              "image/bmp",
              "image/tiff",
              "image/svg+xml",
              "image/avif",
            ].includes(value.type)
          );
        }
      )
      .test("fileSize", "File size must be less than 2MB", (value) => {
        if (!value || typeof value === "string") return true;
        return value instanceof File && value.size <= 2 * 1024 * 1024;
      }),
    firstName: Yup.string()
      .required("First name is required")
      .matches(
        /^[A-Za-z\s]*$/,
        "First name cannot contain any special characters or numbers"
      )
      .min(3, "First name must contain atleast 3 characters")
      .max(30, "First name must not be longer than 30 characters"),
    lastName: Yup.string()
      .required("Last name is required")
      .matches(
        /^[A-Za-z\s]*$/,
        "Last name cannot contain any special characters or numbers"
      )
      .min(3, "Last name must contain atleast 3 characters")
      .max(30, "Last name must not be longer than 30 characters"),
    userName: Yup.string()
      .required("User name is required")
      .matches(
        /^[A-Za-z0-9\s]*$/,
        "User name cannot contain any special characters"
      )
      .min(6, "User name must contain atleast 6 characters")
      .max(30, "User name must not be longer than 30 characters"),
    email: Yup.string()
      .email("Invalid email")
      .required("Email is required")
      .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"),
    employeeNumber: Yup.string()
      .required("Employee number is required")
      .matches(
        /^EMP-\d{4}$/,
        "Invalid employee number format. Use format: EMP-1234"
      ),
  });

  const formik = useFormik({
    initialValues: {
      image: null,
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      employeeNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        const { designation, department, ...updatedValues } = values;

        Object.keys(updatedValues).forEach((key) => {
          formData.append(key, updatedValues[key]);
        });

        const user = await apiClient.put(`/users/${id}`, formData);
        Swal.fire({
          icon: "success",
          color: "green",
          title: "Success",
          text: `Profile updated successfully`,
        });
        router.back();
        await update(user);
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

  const handleFileChange = (e) => {
    formik.setFieldValue("image", e.target.files[0]);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

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
          Update Profile
        </h2>
        <FormControl className="grid grid-cols-2 gap-6">
          <div className="flex justify-center col-span-2">
            <div onClick={handleImageClick} className="relative cursor-pointer">
              {formik.values.image ? (
                <Avatar
                  src={
                    typeof formik.values.image === "string"
                      ? `${process.env.NEXT_PUBLIC_IMAGE_PATH}/${formik.values.image}`
                      : URL.createObjectURL(formik.values?.image)
                  }
                  className="w-[100px] sm:w-[140px] md:w-[200px] h-[100px] sm:h-[140px] md:h-[200px]"
                />
              ) : (
                <Avatar className="border-2 sm:border-4 md:border-[10px] w-[100px] sm:w-[140px] md:w-[200px] h-[100px] sm:h-[140px] md:h-[200px] border-dashed flex flex-col justify-start">
                  <PersonIcon className="mt-3 w-[50px] sm:w-[70px] md:w-[100px] h-[50px] sm:h-[70px] md:h-[100px]" />
                  <div className="text-[9px] sm:text-xs md:text-base">
                    Click to add image
                  </div>
                </Avatar>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {formik.touched.image && formik.errors.image && (
            <span className="text-red-500 text-sm col-span-2 text-center">
              {formik.errors.image}
            </span>
          )}
          <TextField
            label="First Name"
            type="text"
            name="firstName"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
          <TextField
            label="Last Name"
            type="text"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
          <TextField
            label="User Name"
            type="text"
            name="userName"
            value={formik.values.userName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.userName && Boolean(formik.errors.userName)}
            helperText={formik.touched.userName && formik.errors.userName}
          />
          <TextField
            label="Employee Number"
            type="text"
            name="employeeNumber"
            value={formik.values.employeeNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.employeeNumber &&
              Boolean(formik.errors.employeeNumber)
            }
            helperText={
              formik.touched.employeeNumber && formik.errors.employeeNumber
            }
          />
          <TextField
            label="Email"
            type="text"
            name="email"
            value={formik.values.email}
            className="col-span-2"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
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

export default withAuth(UpdateProfilePage, ["Admin", "Manager", "Member"]);
