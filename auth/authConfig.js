import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import bcrypt from 'bcryptjs';
import connectDB from '../db/connection.js';
import User from '../db/User.js';

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'github') {
        try {
          await connectDB();
          
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            existingUser = await User.create({
              name: user.name || profile.name,
              email: user.email,
              provider: 'github',
              providerId: profile.id.toString(),
              image: user.image,
            });
          } else if (existingUser.provider !== 'github') {
            // Update existing user to link GitHub account
            existingUser.provider = 'github';
            existingUser.providerId = profile.id.toString();
            existingUser.image = user.image;
            await existingUser.save();
          }
          
          user.id = existingUser._id.toString();
          user.isAdmin = existingUser.isAdmin;
        } catch (error) {
          console.error('GitHub sign-in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
