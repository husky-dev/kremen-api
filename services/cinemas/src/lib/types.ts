export interface KremenCinema {
  id: string;
  title: string;
  logo?: string;
  address: string;
  website: string;
  location: KremenCinemaLocation;
  contacts: KremenCinemaContact[];
  movies: KremenCinemaMovie[];
}

export interface KremenCinemaLocation {
  lat: number;
  lng: number;
}

export interface KremenCinemaContact {
  type: 'phone' | 'fb' | 'instagram';
  value: string;
}

export interface KremenCinemaMovie {
  id: string;
  type: KremenCinemaMovieType;
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
  proposals: unknown[];
}

export type KremenCinemaMovieType = 'going' | 'coming';
