import { ESTADOS_BRASIL } from './estados';

export interface LocationDetectionResult {
  sigla: string;
  nome: string;
  cidade?: string;
  metodo: 'gps' | 'ip' | 'cache' | 'padrao';
  latitude?: number;
  longitude?: number;
}

// Coordenadas aproximadas das capitais/centros dos 26 estados + DF
export const ESTADOS_COORDENADAS: Record<string, { lat: number; lng: number; capital: string }> = {
  AC: { lat: -9.975, lng: -67.810, capital: 'Rio Branco' },
  AL: { lat: -9.665, lng: -35.735, capital: 'Maceió' },
  AP: { lat: 0.035, lng: -51.070, capital: 'Macapá' },
  AM: { lat: -3.119, lng: -60.021, capital: 'Manaus' },
  BA: { lat: -12.971, lng: -38.510, capital: 'Salvador' },
  CE: { lat: -3.717, lng: -38.543, capital: 'Fortaleza' },
  DF: { lat: -15.794, lng: -47.882, capital: 'Brasília' },
  ES: { lat: -20.315, lng: -40.312, capital: 'Vitória' },
  GO: { lat: -16.686, lng: -49.264, capital: 'Goiânia' },
  MA: { lat: -2.530, lng: -44.306, capital: 'São Luís' },
  MT: { lat: -15.601, lng: -56.097, capital: 'Cuiabá' },
  MS: { lat: -20.469, lng: -54.620, capital: 'Campo Grande' },
  MG: { lat: -19.920, lng: -43.940, capital: 'Belo Horizonte' },
  PA: { lat: -1.455, lng: -48.502, capital: 'Belém' },
  PB: { lat: -7.115, lng: -34.863, capital: 'João Pessoa' },
  PR: { lat: -25.428, lng: -49.273, capital: 'Curitiba' },
  PE: { lat: -8.057, lng: -34.882, capital: 'Recife' },
  PI: { lat: -5.089, lng: -42.801, capital: 'Teresina' },
  RJ: { lat: -22.906, lng: -43.172, capital: 'Rio de Janeiro' },
  RN: { lat: -5.794, lng: -35.211, capital: 'Natal' },
  RS: { lat: -30.034, lng: -51.217, capital: 'Porto Alegre' },
  RO: { lat: -8.761, lng: -63.903, capital: 'Porto Velho' },
  RR: { lat: 2.823, lng: -60.675, capital: 'Boa Vista' },
  SC: { lat: -27.595, lng: -48.548, capital: 'Florianópolis' },
  SP: { lat: -23.550, lng: -46.633, capital: 'São Paulo' },
  SE: { lat: -10.947, lng: -37.073, capital: 'Aracaju' },
  TO: { lat: -10.184, lng: -48.333, capital: 'Palmas' },
};

function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findClosestEstado(lat: number, lng: number): { sigla: string; capital: string } {
  let closestSigla = 'MG';
  let minDistance = Infinity;

  for (const [sigla, coords] of Object.entries(ESTADOS_COORDENADAS)) {
    const dist = calcularDistanciaKm(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestSigla = sigla;
    }
  }

  return {
    sigla: closestSigla,
    capital: ESTADOS_COORDENADAS[closestSigla]?.capital || 'Belo Horizonte',
  };
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function mapRegionNameToSigla(regionNameOrCode?: string): string | null {
  if (!regionNameOrCode) return null;
  const upper = regionNameOrCode.toUpperCase().trim();

  // Verifica se é sigla direta
  if (ESTADOS_COORDENADAS[upper]) {
    return upper;
  }

  const normalized = normalizeText(regionNameOrCode);

  for (const est of ESTADOS_BRASIL) {
    if (normalizeText(est.nome) === normalized) {
      return est.sigla;
    }
    if (normalizeText(est.sigla) === normalized) {
      return est.sigla;
    }
  }

  return null;
}

// 1. Detecção via IP Geolocation (rápido, sem pedir permissão invasiva)
async function detectViaIP(): Promise<LocationDetectionResult | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const sigla = mapRegionNameToSigla(data.region);
      if (sigla) {
        const est = ESTADOS_BRASIL.find((e) => e.sigla === sigla);
        return {
          sigla,
          nome: est?.nome || sigla,
          cidade: data.city || ESTADOS_COORDENADAS[sigla]?.capital,
          metodo: 'ip',
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        };
      } else if (data.latitude && data.longitude) {
        // Se vier coordenadas (mesmo sem sigla exata)
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        // Se estiver dentro da caixa geográfica do Brasil
        if (lat >= -34 && lat <= 6 && lng >= -74 && lng <= -34) {
          const closest = findClosestEstado(lat, lng);
          const est = ESTADOS_BRASIL.find((e) => e.sigla === closest.sigla);
          return {
            sigla: closest.sigla,
            nome: est?.nome || closest.sigla,
            cidade: data.city || closest.capital,
            metodo: 'ip',
            latitude: lat,
            longitude: lng,
          };
        }
      }
    }
  } catch (err) {
    // Falha silenciosa no primeiro serviço, tenta backup
  }

  // Backup via ipwho.is
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipwho.is/', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const sigla = mapRegionNameToSigla(data.region_code) || mapRegionNameToSigla(data.region);
        if (sigla) {
          const est = ESTADOS_BRASIL.find((e) => e.sigla === sigla);
          return {
            sigla,
            nome: est?.nome || sigla,
            cidade: data.city || ESTADOS_COORDENADAS[sigla]?.capital,
            metodo: 'ip',
            latitude: data.latitude,
            longitude: data.longitude,
          };
        }
      }
    }
  } catch (err) {
    // Ignora
  }

  return null;
}

// 2. Detecção via GPS / Dispositivo (alta precisão)
function detectViaGPS(): Promise<LocationDetectionResult | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const closest = findClosestEstado(lat, lng);
        const est = ESTADOS_BRASIL.find((e) => e.sigla === closest.sigla);

        resolve({
          sigla: closest.sigla,
          nome: est?.nome || closest.sigla,
          cidade: closest.capital,
          metodo: 'gps',
          latitude: lat,
          longitude: lng,
        });
      },
      (err) => {
        // Usuário negou ou erro de timeout
        resolve(null);
      },
      {
        timeout: 6000,
        enableHighAccuracy: true,
        maximumAge: 60000,
      }
    );
  });
}

// 3. Orquestrador Principal de Detecção Automática
export async function detectUserLocation(
  onLocationFound?: (res: LocationDetectionResult) => void
): Promise<LocationDetectionResult> {
  // Se já temos em cache recente
  const cachedSigla = localStorage.getItem('encontro_certo_detected_estado');
  const cachedNome = localStorage.getItem('encontro_certo_detected_nome');
  const cachedCidade = localStorage.getItem('encontro_certo_detected_cidade');

  let bestResult: LocationDetectionResult = {
    sigla: cachedSigla || 'MG',
    nome: cachedNome || 'Minas Gerais',
    cidade: cachedCidade || 'Belo Horizonte',
    metodo: cachedSigla ? 'cache' : 'padrao',
  };

  // 1. Tenta IP Geolocation primeiro (instantâneo)
  const ipResult = await detectViaIP();
  if (ipResult) {
    bestResult = ipResult;
    saveLocationToStorage(ipResult);
    if (onLocationFound) onLocationFound(ipResult);
  }

  // 2. Tenta GPS em segundo plano para refinar se disponível
  detectViaGPS().then((gpsResult) => {
    if (gpsResult) {
      bestResult = gpsResult;
      saveLocationToStorage(gpsResult);
      if (onLocationFound) onLocationFound(gpsResult);
    }
  });

  return bestResult;
}

function saveLocationToStorage(loc: LocationDetectionResult) {
  try {
    localStorage.setItem('encontro_certo_estado', JSON.stringify(loc.sigla));
    localStorage.setItem('encontro_certo_detected_estado', loc.sigla);
    localStorage.setItem('encontro_certo_detected_nome', loc.nome);
    if (loc.cidade) {
      localStorage.setItem('encontro_certo_detected_cidade', loc.cidade);
    }
    localStorage.setItem('encontro_certo_detected_metodo', loc.metodo);
    if (loc.latitude && loc.longitude) {
      localStorage.setItem('encontro_certo_detected_coords', JSON.stringify({ lat: loc.latitude, lng: loc.longitude }));
    }
  } catch (err) {
    // LocalStorage quota ou indisponível
  }
}
