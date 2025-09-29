import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          return response.data;
        } catch (error) {
          console.error("Authorization error:", error.message);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.token;
        token.expiresAt = new Date(user.user.expires).getTime();
        token.user = user.user;
      }
      if (trigger === "update" && session) {
        token.user = session.data;
      }
      return token;
    },
    async session({ session, token }) {
      session.token = token.accessToken;
      session.expiresAt = token.expiresAt;
      session.user = token.user;
      return session;
    },
  },
};

const handler = (req, res) => {
  return NextAuth(req, res, authOptions);
};

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
