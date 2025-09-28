import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'commuter';
  avatar?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    if (!supabaseAdmin) {
      console.warn('Supabase not configured. Using demo users for authentication.');
      // Fallback to demo users when Supabase is not configured
      if (email === 'admin@demo.com' && password === 'demo') {
        return {
          success: true,
          user: {
            id: 'demo-admin',
            email: 'admin@demo.com',
            name: 'Demo Admin',
            role: 'admin'
          }
        };
      }
      if (email === 'user@demo.com' && password === 'demo') {
        return {
          success: true,
          user: {
            id: 'demo-user',
            email: 'user@demo.com',
            name: 'Demo User',
            role: 'commuter'
          }
        };
      }
      return {
        success: false,
        error: 'Database not configured. Please set up Supabase environment variables.'
      };
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, password_hash, role, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid credentials'
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Create a new user account
 */
export async function createUser(
  email: string, 
  password: string, 
  name: string, 
  role: 'admin' | 'commuter' = 'commuter'
): Promise<AuthResult> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase not configured. Please set up environment variables.');
      return {
        success: false,
        error: 'Database not configured. Please set up Supabase environment variables.'
      };
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists'
      };
    }

    // Check admin limit
    if (role === 'admin') {
      const { data: adminExists } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .single();

      if (adminExists) {
        return {
          success: false,
          error: 'Only one admin account is allowed'
        };
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name,
        password_hash: passwordHash,
        role,
        is_active: true
      })
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: 'Failed to create user account'
      };
    }

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    };
  } catch (error) {
    console.error('User creation error:', error);
    return {
      success: false,
      error: 'Failed to create user account'
    };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    if (!supabaseAdmin) {
      // Return demo users
      if (id === 'demo-admin') {
        return {
          id: 'demo-admin',
          email: 'admin@demo.com',
          name: 'Demo Admin',
          role: 'admin'
        };
      }
      if (id === 'demo-user') {
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
      .select('id, email, name, role, avatar')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      return false;
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const { error } = await supabaseAdmin
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);

    return !error;
  } catch (error) {
    console.error('Error updating password:', error);
    return false;
  }
}
