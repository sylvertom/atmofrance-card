export interface AtmoFranceCardConfig {
  type: string;
  title?: string;
  zone_name?: string;
  show_pollution?: boolean;
  show_pollen?: boolean;
  show_forecast?: boolean;
  hide_when_good?: boolean;
  show_details?: boolean;
  show_concentration?: boolean;
}

export interface AtmoEntity {
  entity_id: string;
  state: string;
  color: string;
  label: string;
  zone_name: string;
  zone_type: string;
}

export interface SensorPair {
  today: AtmoEntity | null;
  forecast: AtmoEntity | null;
}

export interface AtmoEntityGroup {
  overall: SensorPair;
  sensors: SensorPair[];
}

export interface DiscoveredEntities {
  pollution: AtmoEntityGroup;
  pollen: AtmoEntityGroup;
  pollenConcentrations: Map<string, string>;
  zoneName: string;
}

export const DEFAULT_CONFIG: Partial<AtmoFranceCardConfig> = {
  show_pollution: true,
  show_pollen: true,
  show_forecast: true,
  hide_when_good: true,
  show_details: true,
  show_concentration: false,
};
