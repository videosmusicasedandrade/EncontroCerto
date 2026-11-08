import { ESTADOS_BRASIL } from './estados';

export interface LocationDetectionResult {
  sigla: string;
  nome: string;
  cidade?: string;
  metodo: 'gps' | 'reverso' | 'cache' | 'padrao';
  latitude?: number;
  longitude?: number;
  precisao?: number;
  error?: string;
}

// Limites geográficos precisos (Bounding Boxes) dos principais estados do Brasil
export const ESTADOS_BOUNDING_BOXES: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number; capital: string; nome: string }> = {
  MG: { minLat: -22.92, maxLat: -14.23, minLng: -51.08, maxLng: -39.85, capital: 'Belo Horizonte', nome: 'Minas Gerais' },
  SP: { minLat: -25.35, maxLat: -19.78, minLng: -53.11, maxLng: -44.16, capital: 'São Paulo', nome: 'São Paulo' },
  RJ: { minLat: -23.37, maxLat: -20.76, minLng: -44.89, maxLng: -40.96, capital: 'Rio de Janeiro', nome: 'Rio de Janeiro' },
  ES: { minLat: -21.31, maxLat: -17.89, minLng: -41.88, maxLng: -39.67, capital: 'Vitória', nome: 'Espírito Santo' },
  BA: { minLat: -18.35, maxLat: -8.53, minLng: -46.62, maxLng: -37.34, capital: 'Salvador', nome: 'Bahia' },
  GO: { minLat: -19.50, maxLat: -12.39, minLng: -53.25, maxLng: -45.90, capital: 'Goiânia', nome: 'Goiás' },
  DF: { minLat: -16.05, maxLat: -15.50, minLng: -48.28, maxLng: -47.30, capital: 'Brasília', nome: 'Distrito Federal' },
  MT: { minLat: -18.04, maxLat: -7.34, minLng: -61.64, maxLng: -50.22, capital: 'Cuiabá', nome: 'Mato Grosso' },
  MS: { minLat: -24.06, maxLat: -17.16, minLng: -58.17, maxLng: -50.92, capital: 'Campo Grande', nome: 'Mato Grosso do Sul' },
  PR: { minLat: -26.72, maxLat: -22.51, minLng: -54.62, maxLng: -48.02, capital: 'Curitiba', nome: 'Paraná' },
  SC: { minLat: -29.35, maxLat: -25.96, minLng: -53.84, maxLng: -48.35, capital: 'Florianópolis', nome: 'Santa Catarina' },
  RS: { minLat: -33.75, maxLat: -27.08, minLng: -57.65, maxLng: -49.69, capital: 'Porto Alegre', nome: 'Rio Grande do Sul' },
};

// Coordenadas das capitais dos 26 estados + DF
export const ESTADOS_COORDENADAS: Record<string, { lat: number; lng: number; capital: string }> = {
  MG: { lat: -19.920, lng: -43.940, capital: 'Belo Horizonte' },
  SP: { lat: -23.550, lng: -46.633, capital: 'São Paulo' },
  RJ: { lat: -22.906, lng: -43.172, capital: 'Rio de Janeiro' },
  ES: { lat: -20.315, lng: -40.312, capital: 'Vitória' },
  BA: { lat: -12.971, lng: -38.510, capital: 'Salvador' },
  DF: { lat: -15.794, lng: -47.882, capital: 'Brasília' },
  GO: { lat: -16.686, lng: -49.264, capital: 'Goiânia' },
  MT: { lat: -15.601, lng: -56.097, capital: 'Cuiabá' },
  MS: { lat: -20.469, lng: -54.620, capital: 'Campo Grande' },
  PR: { lat: -25.428, lng: -49.273, capital: 'Curitiba' },
  SC: { lat: -27.595, lng: -48.548, capital: 'Florianópolis' },
  RS: { lat: -30.034, lng: -51.217, capital: 'Porto Alegre' },
  PE: { lat: -8.057, lng: -34.882, capital: 'Recife' },
  CE: { lat: -3.717, lng: -38.543, capital: 'Fortaleza' },
  MA: { lat: -2.530, lng: -44.306, capital: 'São Luís' },
  PB: { lat: -7.115, lng: -34.863, capital: 'João Pessoa' },
  RN: { lat: -5.794, lng: -35.211, capital: 'Natal' },
  AL: { lat: -9.665, lng: -35.735, capital: 'Maceió' },
  PI: { lat: -5.089, lng: -42.801, capital: 'Teresina' },
  SE: { lat: -10.947, lng: -37.073, capital: 'Aracaju' },
  PA: { lat: -1.455, lng: -48.502, capital: 'Belém' },
  AM: { lat: -3.119, lng: -60.021, capital: 'Manaus' },
  RO: { lat: -8.761, lng: -63.903, capital: 'Porto Velho' },
  TO: { lat: -10.184, lng: -48.333, capital: 'Palmas' },
  AC: { lat: -9.975, lng: -67.810, capital: 'Rio Branco' },
  AP: { lat: 0.035, lng: -51.070, capital: 'Macapá' },
  RR: { lat: 2.823, lng: -60.675, capital: 'Boa Vista' },
};

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

  if (upper.startsWith('BR-')) {
    const rawSigla = upper.replace('BR-', '');
    if (ESTADOS_COORDENADAS[rawSigla]) return rawSigla;
  }

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

export function isCoordinateInMinasGerais(lat: number, lng: number): boolean {
  const mg = ESTADOS_BOUNDING_BOXES.MG;
  return lat >= mg.minLat && lat <= mg.maxLat && lng >= mg.minLng && lng <= mg.maxLng;
}

export function findStateByCoordinates(lat: number, lng: number): { sigla: string; capital: string; nome: string } {
  if (isCoordinateInMinasGerais(lat, lng)) {
    return {
      sigla: 'MG',
      capital: 'Belo Horizonte',
      nome: 'Minas Gerais',
    };
  }

  for (const [sigla, box] of Object.entries(ESTADOS_BOUNDING_BOXES)) {
    if (lat >= box.minLat && lat <= box.maxLat && lng >= box.minLng && lng <= box.maxLng) {
      return {
        sigla,
        capital: box.capital,
        nome: box.nome,
      };
    }
  }

  return {
    sigla: 'MG',
    capital: 'Belo Horizonte',
    nome: 'Minas Gerais',
  };
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ sigla: string; nome: string; cidade?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const rawState = addr.state || addr['ISO3166-2-lvl4'] || '';
      const sigla = mapRegionNameToSigla(rawState) || (isCoordinateInMinasGerais(lat, lng) ? 'MG' : null);
      
      const cidade =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.village ||
        addr.county ||
        addr.suburb;

      if (sigla) {
        const est = ESTADOS_BRASIL.find((e) => e.sigla === sigla);
        return {
          sigla,
          nome: est?.nome || 'Minas Gerais',
          cidade: cidade || ESTADOS_COORDENADAS[sigla]?.capital || 'Belo Horizonte',
        };
      }
    }
  } catch (err) {
    // Ignora
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const rawState = data.principalSubdivisionCode || data.principalSubdivision;
      const sigla = mapRegionNameToSigla(rawState) || (isCoordinateInMinasGerais(lat, lng) ? 'MG' : null);
      const cidade = data.city || data.locality;

      if (sigla) {
        const est = ESTADOS_BRASIL.find((e) => e.sigla === sigla);
        return {
          sigla,
          nome: est?.nome || 'Minas Gerais',
          cidade: cidade || ESTADOS_COORDENADAS[sigla]?.capital,
        };
      }
    }
  } catch (err) {
    // Ignora
  }

  const geoResult = findStateByCoordinates(lat, lng);
  return {
    sigla: geoResult.sigla,
    nome: geoResult.nome,
    cidade: geoResult.capital,
  };
}

export function requestDeviceGPS(): Promise<LocationDetectionResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve({
        sigla: 'MG',
        nome: 'Minas Gerais',
        cidade: 'Belo Horizonte',
        metodo: 'padrao',
        error: 'Geolocalização não suportada pelo navegador.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const precisao = pos.coords.accuracy;

        const geoInfo = await reverseGeocodeCoordinates(lat, lng);

        const result: LocationDetectionResult = {
          sigla: geoInfo.sigla,
          nome: geoInfo.nome,
          cidade: geoInfo.cidade,
          metodo: 'gps',
          latitude: lat,
          longitude: lng,
          precisao,
        };

        saveLocationToStorage(result);
        localStorage.setItem('encontro_certo_gps_asked', 'true');
        resolve(result);
      },
      (err) => {
        let msg = 'Permissão de localização não concedida.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Permissão de localização foi recusada no navegador.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Tempo limite esgotado ao buscar GPS.';
        }

        const fallback: LocationDetectionResult = {
          sigla: 'MG',
          nome: 'Minas Gerais',
          cidade: 'Belo Horizonte',
          metodo: 'padrao',
          error: msg,
        };
        resolve(fallback);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

export async function detectUserLocation(
  onLocationFound?: (res: LocationDetectionResult) => void
): Promise<LocationDetectionResult> {
  const cachedSigla = localStorage.getItem('encontro_certo_detected_estado');
  const cachedNome = localStorage.getItem('encontro_certo_detected_nome');
  const cachedCidade = localStorage.getItem('encontro_certo_detected_cidade');
  const gpsAsked = localStorage.getItem('encontro_certo_gps_asked') === 'true';

  let bestResult: LocationDetectionResult = {
    sigla: cachedSigla || 'MG',
    nome: cachedNome || 'Minas Gerais',
    cidade: cachedCidade || 'Belo Horizonte',
    metodo: cachedSigla ? 'cache' : 'padrao',
  };

  if (cachedSigla && onLocationFound) {
    onLocationFound(bestResult);
  }

  // Se já pediu permissão antes ou se é primeira vez, solicita o GPS
  const gpsResult = await requestDeviceGPS();
  if (gpsResult.metodo === 'gps') {
    bestResult = gpsResult;
    saveLocationToStorage(gpsResult);
    if (onLocationFound) {
      onLocationFound(gpsResult);
    }
  }

  return bestResult;
}

export function saveLocationToStorage(loc: LocationDetectionResult) {
  try {
    localStorage.setItem('encontro_certo_estado', JSON.stringify(loc.sigla));
    localStorage.setItem('encontro_certo_detected_estado', loc.sigla);
    localStorage.setItem('encontro_certo_detected_nome', loc.nome);
    if (loc.cidade) {
      localStorage.setItem('encontro_certo_detected_cidade', loc.cidade);
    }
    localStorage.setItem('encontro_certo_detected_metodo', loc.metodo);
    if (loc.latitude && loc.longitude) {
      localStorage.setItem(
        'encontro_certo_detected_coords',
        JSON.stringify({ lat: loc.latitude, lng: loc.longitude })
      );
    }
  } catch (err) {
    // Ignora
  }
}
