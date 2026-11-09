import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const configured = Boolean(url && anon);
export const supabase = createClient(url || 'http://localhost', anon || 'sem-chave');

// Lê uma tabela e se mantém atualizada ao vivo (Realtime)
export function useTable<T = any>(table: string, order = 'created_at', limit = 200) {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data, error } = await supabase.from(table).select('*').order(order, { ascending: false }).limit(limit);
      if (!alive) return;
      if (error) setError(error.message);
      else { setError(null); setRows((data ?? []) as T[]); }
    };
    load();
    const channel = supabase
      .channel(`live-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, load)
      .subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [table, order, limit]);

  return { rows, error };
}
