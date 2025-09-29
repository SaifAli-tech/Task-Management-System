import axios from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
});

apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.token) {
      config.headers.Authorization = `token: ${session?.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
