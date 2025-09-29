"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  Link,
  Button,
  TextField,
  FormControl,
  IconButton,
  InputAdornment,
  Avatar,
  Container,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .required("Email is required")
      .matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
          values
        );

        Swal.fire({
          icon: "success",
          color: "green",
          title: "Success",
          text: "Logged in successfully!",
        });
        await signIn("credentials", {
          redirect: false,
          email: values.email,
          password: values.password,
        });
        router.push("/");
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
        <div className="flex justify-center">
          <Avatar className="bg-purple-800 m-2">
            <LockOutlinedIcon className="text-white" />
          </Avatar>
        </div>
        <h2 className="text-center text-2xl font-bold mb-8 text-purple-800">
          Login
        </h2>
        <FormControl fullWidth>
          <TextField
            label="Email"
            type="text"
            name="email"
            className="mb-6"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            type={showPassword ? "text" : "password"}
            id="password"
            label="Password"
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
          <div className="flex items-center justify-center">
            <Button
              type="submit"
              className="bg-purple-800 hover:bg-purple-600 text-white text-lg font-bold normal-case py-2 px-4 rounded"
            >
              Sign In
            </Button>
          </div>
          <Link
            href="/auth/register"
            variant="body2"
            className="flex mt-4 justify-center text-purple-800"
          >
            Don't have an account? Register
          </Link>
        </FormControl>
      </form>
    </Container>
  );
};

export default LoginPage;
