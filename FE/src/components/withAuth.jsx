import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

const withAuth = (Component, designations = []) => {
  return (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return; // Avoid redirect while session is loading
      if (
        !session ||
        (designations.length > 0 &&
          !designations.includes(session.user.designation.name))
      ) {
        Swal.fire({
          icon: "error",
          color: "red",
          title: "Unauthorized Access",
          text: "You are not allowed on this page",
          preConfirm: () => {
            router.back();
          },
        });
      }
    }, [session, status]);

    if (
      status === "loading" ||
      !session ||
      (designations.length > 0 &&
        !designations.includes(session.user.designation.name))
    ) {
      return <CircularProgress sx={{ color: "#5B21B6" }} />;
    }

    return <Component {...props} />;
  };
};

export default withAuth;
