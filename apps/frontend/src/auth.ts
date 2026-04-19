import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [],
  callbacks: {},
  session: {},
  pages: {},
  secret: process.env.NEXTAUTH_SECRET,
};