import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/** Supabase client configured using public environment variables. */
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);
