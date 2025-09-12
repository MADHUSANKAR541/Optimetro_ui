import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          if (!supabaseAdmin) {
            // Fallback to demo users when Supabase is not configured
            if (credentials.email === 'admin@demo.com' && credentials.password === 'demo') {
              return {
                id: 'demo-admin',
                email: 'admin@demo.com',
                name: 'Demo Admin',
                role: 'admin'
              };
            }
            if (credentials.email === 'user@demo.com' && credentials.password === 'demo') {
              return {
                id: 'demo-user',
                email: 'user@demo.com',
                name: 'Demo User',
                role: 'commuter'
              };
            }
            return null;
          }

          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('id, email, name, password_hash, role, is_active')
            .eq('email', credentials.email)
            .eq('is_active', true)
            .single();

          if (error || !user) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
          
          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as 'admin' | 'commuter';
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
};
