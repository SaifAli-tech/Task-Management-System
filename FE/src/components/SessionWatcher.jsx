"use client";

import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Swal from "sweetalert2";

export default function SessionWatcher({ children }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session) {
      const isExpired = new Date(session.expiresAt) <= Date.now();
      if (isExpired) {
        Swal.fire({
          icon: "error",
          color: "red",
          title: "Session expired",
          text: "Your session has expired. Please login again.",
          preConfirm: () => {
            return signOut({
              callbackUrl: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/login`,
            });
          },
        });
      }
    }
  }, [session, status]);

  return children;
}
