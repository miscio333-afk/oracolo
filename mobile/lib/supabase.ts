import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { config, isSupabaseConfigured } from './config';

const nativeStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// SecureStore is native-only. Expo web uses localStorage for the browser
// preview; production iOS/Android sessions remain in Keychain/Keystore.
const webStorage = {
  getItem: async (key: string) => {
    if (typeof globalThis.localStorage === 'undefined') return null;
    return globalThis.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (typeof globalThis.localStorage !== 'undefined') globalThis.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (typeof globalThis.localStorage !== 'undefined') globalThis.localStorage.removeItem(key);
  },
};

const authStorage = Platform.OS === 'web' ? webStorage : nativeStorage;

export const supabase = isSupabaseConfigured
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
