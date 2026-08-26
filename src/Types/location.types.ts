/** Representa una ubicación geográfica seleccionada por el usuario */
export interface Location {
  name: string;
  lat: number;
  lon: number;
  /** País (código ISO), útil para desambiguar ciudades con el mismo nombre */
  country?: string;
}