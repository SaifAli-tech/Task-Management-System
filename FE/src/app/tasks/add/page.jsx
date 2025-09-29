"use client";

import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  FormControl,
  Container,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  FormHelperText,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import apiClient from "@/components/ApiClient";
import withAuth from "@/components/withAuth";

const AddTaskPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get(`/users/designation/Member`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .required("Title is required")
      .min(3, "Title must contain atleast 3 characters")
      .max(100, "Title must not be longer than 100 characters"),
    description: Yup.string()
      .required("Description is required")
      .min(10, "Description must contain atleast 10 characters")
      .max(500, "Description must not be longer than 500 characters"),
    priority: Yup.string().required("Priority is required"),
    deadline: Yup.date()
      .required("Deadline is required")
      .min(
        new Date(new Date().setHours(0, 0, 0, 0)),
        "Deadline must be a future date"
      ),
    assignedTo: Yup.string().required("Assigned To is required"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      priority: "",
      assignedTo: "",
      deadline: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        values.createdBy = session.user._id;
        await apiClient.post(`/tasks`, values);
        Swal.fire({
          icon: "success",
          color: "green",
          title: "Success",
          text: `New task added successfully`,
        });
        formik.resetForm();
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
      maxWidth="sm"
      className="flex items-center justify-center h-full p-0 m-6"
    >
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white shadow-md rounded-3xl border-8 border-purple-800 px-8 py-4 w-full justify-center"
      >
        <h2 className="text-center text-2xl font-bold mb-6 text-purple-800">
          Add Task
        </h2>
        <FormControl className="grid grid-cols-2 gap-6">
          <TextField
            label="Title"
            type="text"
            name="title"
            className="col-span-2"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />
          <TextField
            label="Description"
            type="text"
            name="description"
            className="col-span-2"
            multiline
            rows={2}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={formik.touched.description && formik.errors.description}
          />
          <FormControl
            error={formik.touched.priority && Boolean(formik.errors.priority)}
          >
            <InputLabel id="priority-select-label">Priority</InputLabel>
            <Select
              labelId="priority-select-label"
              value={formik.values.priority}
              name="priority"
              label="priority"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
            <FormHelperText>
              {formik.touched.priority && formik.errors.priority}
            </FormHelperText>
          </FormControl>
          <TextField
            label="Deadline"
            type="date"
            name="deadline"
            InputLabelProps={{ shrink: true }}
            value={formik.values.deadline}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.deadline && Boolean(formik.errors.deadline)}
            helperText={formik.touched.deadline && formik.errors.deadline}
          />
          <FormControl
            className="col-span-2"
            error={
              formik.touched.assignedTo && Boolean(formik.errors.assignedTo)
            }
          >
            <InputLabel id="user-select-label">Assigned To</InputLabel>
            <Select
              labelId="user-select-label"
              name="assignedTo"
              label="Assigned To"
              fullWidth
              value={formik.values.assignedTo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              renderValue={(selected) => {
                const member = members.find((m) => m._id === selected);
                return (
                  <div className="flex items-center">
                    <Avatar
                      src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/${member.image}`}
                      className="mr-4"
                    />
                    <span>{member.userName}</span>
                  </div>
                );
              }}
            >
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
            <FormHelperText>
              {formik.touched.assignedTo && formik.errors.assignedTo}
            </FormHelperText>
          </FormControl>
          <div className="col-span-2 flex items-center justify-center">
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

export default withAuth(AddTaskPage, ["Manager"]);
