import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "process";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      accessToken: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session({ session, token, user }) {
      session = {
        ...session,
        user: {
          ...session.user,
          id: token.sub!,
          accessToken: token.accessToken as string,
        },
      };

      return session;
    },
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials, req) {
        const username = credentials?.username;
        const password = credentials?.password;

        // Make a call to the API here to validate the use and get an access token

        if (username !== "Bob") {
          return null;
        }

        return { id: "1234", name: username, accessToken: "banana" };
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
