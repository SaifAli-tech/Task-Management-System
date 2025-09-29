"use client";

import { Typography, Button, Container, Box } from "@mui/material";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  return (
    <Box
      component="main"
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        justifyContent: "center",
      }}
    >
      <Container>
        <Typography
          variant="h2"
          className="bg-gradient-to-r from-violet-950 via-purple-800 to-pink-600 bg-clip-text text-transparent font-bold"
        >
          Welcome to Task Management System
        </Typography>
        <Typography variant="h5" color="textSecondary" className="mt-10">
          Streamline your workflow with our Task Management System. Create,
          assign and track tasks effortlessly while ensuring team collaboration
          and timely project delivery. Stay organized with role-based access,
          progress tracking and insightful reports to boost productivity.
        </Typography>
        <div className="flex items-center justify-center mt-10">
          <Button
            className="bg-purple-800 hover:bg-purple-600 text-white text-lg font-bold normal-case py-2 px-4 rounded mx-5"
            onClick={() => router.push("/auth/login")}
          >
            Login
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-500 text-white text-lg font-bold normal-case py-2 px-4 rounded mx-5"
            onClick={() => router.push("/auth/register")}
          >
            Register
          </Button>
        </div>
      </Container>
    </Box>
  );
};

export default HomePage;
