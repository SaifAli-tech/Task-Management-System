"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useParams } from "next/navigation";
import {
  Button,
  TextField,
  FormControl,
  IconButton,
  InputAdornment,
  Container,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import apiClient from "@/components/ApiClient";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/navigation";

const ChangePassword = () => {
  const { id } = useParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...updatedFields } = values;
        await apiClient.put(`/users/changePassword/${id}`, updatedFields);
        Swal.fire({
          icon: "success",
          color: "green",
          title: "Success",
          text: `Password updated successfully!`,
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
          Change Password
        </h2>
        <FormControl fullWidth>
          <TextField
            type={showPassword ? "text" : "password"}
            id="password"
            label="New Password"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            className="mb-6"
          />
          <TextField
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            label="Confirm Password"
            name="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.confirmPassword &&
              Boolean(formik.errors.confirmPassword)
            }
            helperText={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            className="mb-6"
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
              className="bg-purple-800 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </Button>
          </div>
        </FormControl>
      </form>
    </Container>
  );
};

export default withAuth(ChangePassword, ["Admin", "Manager", "Member"]);
