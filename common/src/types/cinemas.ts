export interface Cinema {
  id: string;
  title: string;
  logo?: string;
  address: string;
  website: string;
  location: CinemaLocation;
  contacts: CinemaContact[];
  movies: CinemaMovie[];
}

export interface CinemaLocation {
  lat: number;
  lng: number;
}

export interface CinemaContact {
  type: 'phone' | 'fb' | 'instagram';
  value: string;
}

export interface CinemaMovie {
  id: string;
  type: CinemaMovieType;
  title: string;
  url: string;
  description?: string;
  poster?: string;
  trailer?: string;
  format?: string;
  year?: number;
  language?: string;
  genre?: string[];
  actors?: string[];
  director?: string;
  distributor?: string;
  country?: string;
  duration?: string;
  restrictions?: string;
  start?: string;
  studio?: string;
  custom?: Record<string, string>;
  proposals: CinemaProposal[];
}

export type CinemaMovieType = 'going' | 'coming';

export interface CinemaProposal {
  id: string;
  hallId: number;
  hallScheme?: string;
  description?: string;
  sessions: CinemaSession[];
}

export interface CinemaSession {
  date: string;
  time: string;
  format: CinemaMovieFormat;
  prices: CinemaPrices;
  features?: string[];
}

export type CinemaMovieFormat = '2D' | '3D';

export interface CinemaPrices {
  usual?: number;
  vip?: number;
  stock?: number;
}
