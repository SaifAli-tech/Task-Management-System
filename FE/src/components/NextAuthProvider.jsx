"use client";

import { SessionProvider } from "next-auth/react";
import SessionWatcher from "./SessionWatcher";

export const NextAuthProvider = ({ children }) => {
  return (
    <SessionProvider>
      <SessionWatcher>{children}</SessionWatcher>
    </SessionProvider>
  );
};
