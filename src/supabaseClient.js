import { createClient } from "@supabase/supabase-js";

// Paste your Supabase Project URL (base URL without /rest/v1/) and Public Key below:
const SUPABASE_URL = "https://prczcbuohgeusmckdhem.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_ExFWXf0wJIeyKFgwD2251g_1ggE52ul";

// Single shared Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
