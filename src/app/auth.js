import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import connect from './utils/db';
import User from './models/User';

export const { auth, handlers } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,

  session: {
    strategy: 'jwt',
  },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connect();

        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        console.log('User found:', user);

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        // ✅ FIXED: Return ALL user properties including name
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name, // Make sure this is included
          status: user.status,
          membershipNumber: user.membershipNumber,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // ✅ Transfer all user properties to token
        token.role = user.role;
        token.name = user.name;
        token.id = user.id;
        token.email = user.email;
        token.status = user.status;
        token.membershipNumber = user.membershipNumber;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // ✅ Transfer all token properties to session
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.status = token.status;
        session.user.membershipNumber = token.membershipNumber;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },
});
