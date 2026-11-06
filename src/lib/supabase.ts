import { createClient } from '@supabase/supabase-js';

function getValidSupabaseUrl(url?: string): string {
  if (!url || typeof url !== 'string') return 'https://placeholder.supabase.co';
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch (err) {
    // URL inválida (ex: 'sua_url_aqui')
  }
  return 'https://placeholder.supabase.co';
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = getValidSupabaseUrl(rawUrl);
const supabaseAnonKey =
  rawKey && typeof rawKey === 'string' && rawKey.length > 10
    ? rawKey
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder';

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    typeof rawUrl === 'string' &&
    rawUrl.startsWith('http') &&
    !rawUrl.includes('sua_url_aqui') &&
    !rawUrl.includes('seu-projeto') &&
    !rawUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Haversine distance helper (km)
export function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
