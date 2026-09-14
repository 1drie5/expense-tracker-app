import type { SupabaseClient } from "@supabase/supabase-js";

import type { CategoryKey } from "@/constants/categories";

export type TransactionType = "INCOME" | "EXPENSE";
export type InputMethod = "MANUAL" | "RECEIPT_SCAN" | "VOICE";

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  type: TransactionType;
  amount: number;
  category: CategoryKey;
  description: string | null;
  date: string;
  status: string;
  input_method: InputMethod;
  voice_transcript: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionFilters = {
  type?: TransactionType | null;
  accountId?: string | null;
};

export async function getTransactions(
  supabase: SupabaseClient,
  userId: string,
  filters: TransactionFilters = {}
) {
  let query = supabase.from("transactions").select("*").eq("user_id", userId);

  if (filters.type) query = query.eq("type", filters.type);
  if (filters.accountId) query = query.eq("account_id", filters.accountId);

  const { data, error } = await query.order("date", { ascending: false });

  if (error) throw error;
  return data as Transaction[];
}