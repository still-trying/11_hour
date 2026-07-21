import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables - works in both Vite and Node contexts
const getEnvVar = (key: string): string => {
  // For Vite/Vite React apps (these are prefixed with VITE_)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    return import.meta.env[`VITE_${key}`] as string
  }
  
  // For Node.js environment (when running scripts directly)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string
  }
  
  // Fallback to direct keys (for cases where VITE_ prefix is not used)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string
  }
  
  return ''
}

const supabaseUrl = getEnvVar('SUPABASE_URL')
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY')

// Check if credentials are provided
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ [Supabase] Missing Supabase environment variables. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

// Create and export the Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null as unknown as SupabaseClient

// For backward compatibility with existing code that calls createClient()
export function createClient() {
  if (!supabase) {
    throw new Error(
      'Supabase client not initialized. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
    )
  }
  return supabase
}
