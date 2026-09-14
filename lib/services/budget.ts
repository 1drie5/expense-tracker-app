import type { SupabaseClient } from "@supabase/supabase-js";

export type Budget = {
  id: string;
  user_id: string;
  amount: number;
  last_alert_sent: string | null;
  created_at: string;
  updated_at: string;
};

export async function getBudget(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Budget | null;
}

export async function upsertBudget(
  supabase: SupabaseClient,
  userId: string,
  amount: number
) {
  const { data, error } = await supabase
    .from("budgets")
    .upsert({ user_id: userId, amount }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return data as Budget;
}