export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',
};

export const isSupabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);

export const isRevenueCatConfigured = Boolean(
  config.revenueCatIosKey || config.revenueCatAndroidKey,
);
