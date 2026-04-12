import { AtmoEntity, AtmoEntityGroup, DiscoveredEntities, SensorPair } from "./types";
import { POLLUTION_KEYS, POLLEN_KEYS, POLLEN_CONC_KEYS, POLLEN_TO_CONC_MAP, FALLBACK_COLOR } from "./const";

function isAtmoEntity(stateObj: any): boolean {
  const attrs = stateObj?.attributes;
  return attrs && "Couleur" in attrs && "Nom de la zone" in attrs;
}

function isForecast(entity_id: string, stateObj: any): boolean {
  return entity_id.includes("_j_1") ||
    (stateObj?.attributes?.friendly_name ?? "").includes("J+1");
}

function makeAtmoEntity(entity_id: string, stateObj: any): AtmoEntity {
  const attrs = stateObj.attributes;
  return {
    entity_id,
    state: stateObj.state,
    color: attrs["Couleur"] ?? FALLBACK_COLOR,
    label: attrs["Libellé"] ?? "",
    zone_name: attrs["Nom de la zone"] ?? "",
    zone_type: attrs["Type de zone"] ?? "",
  };
}

function matchEntityPattern(entity_id: string, pattern: string, excludePattern?: string): boolean {
  const id = entity_id.replace("sensor.", "");
  if (!id.includes(pattern)) return false;
  if (excludePattern && id.includes(excludePattern)) return false;
  return true;
}

function findEntity(
  states: Record<string, any>,
  pattern: string,
  forecast: boolean,
  excludePattern?: string,
  zoneName?: string
): AtmoEntity | null {
  for (const [eid, stateObj] of Object.entries(states)) {
    if (!eid.startsWith("sensor.")) continue;
    if (!isAtmoEntity(stateObj)) continue;
    if (zoneName && (stateObj.attributes["Nom de la zone"] ?? "") !== zoneName) continue;
    if (!matchEntityPattern(eid, pattern, excludePattern)) continue;
    if (isForecast(eid, stateObj) !== forecast) continue;
    return makeAtmoEntity(eid, stateObj);
  }
  return null;
}

function findConcentration(
  states: Record<string, any>,
  pattern: string,
  forecast: boolean,
  zoneName?: string
): string | null {
  for (const [eid, stateObj] of Object.entries(states)) {
    if (!eid.startsWith("sensor.")) continue;
    if (zoneName && (stateObj.attributes?.["Nom de la zone"] ?? "") !== zoneName) continue;
    if (!matchEntityPattern(eid, pattern)) continue;
    if (isForecast(eid, stateObj) !== forecast) continue;
    const unit = stateObj.attributes?.unit_of_measurement ??
      stateObj.attributes?.native_unit_of_measurement;
    if (unit === "µg/m³" || eid.includes("concentration_")) {
      const state = stateObj.state;
      if (state === "unavailable" || state === "unknown") return null;
      return `${state} ${unit ?? "µg/m³"}`;
    }
  }
  return null;
}

function buildGroup(
  states: Record<string, any>,
  keys: readonly { key: string; id_pattern: string; excludePattern?: string; isOverall?: boolean }[],
  zoneName?: string
): AtmoEntityGroup {
  const group: AtmoEntityGroup = {
    overall: { today: null, forecast: null },
    sensors: [],
  };

  for (const def of keys) {
    const today = findEntity(states, def.id_pattern, false, def.excludePattern, zoneName);
    const fc = findEntity(states, def.id_pattern, true, def.excludePattern, zoneName);

    if (def.isOverall) {
      group.overall = { today, forecast: fc };
    } else if (today || fc) {
      group.sensors.push({ today, forecast: fc });
    }
  }

  return group;
}

export function discoverEntities(states: Record<string, any>, filterZone?: string): DiscoveredEntities {
  const pollution = buildGroup(states, POLLUTION_KEYS, filterZone);
  const pollen = buildGroup(states, POLLEN_KEYS, filterZone);

  // Discover pollen concentrations (today only)
  const pollenConcentrations = new Map<string, string>();
  for (const def of POLLEN_CONC_KEYS) {
    const conc = findConcentration(states, def.id_pattern, false, filterZone);
    if (conc) {
      pollenConcentrations.set(def.id_pattern, conc);
    }
  }

  // Get zone name from first found entity
  const zoneName =
    pollution.overall.today?.zone_name ??
    pollen.overall.today?.zone_name ??
    pollution.sensors[0]?.today?.zone_name ??
    pollen.sensors[0]?.today?.zone_name ??
    "";

  return { pollution, pollen, pollenConcentrations, zoneName };
}

export function discoverZones(states: Record<string, any>): string[] {
  const zones = new Set<string>();
  for (const [eid, stateObj] of Object.entries(states)) {
    if (!eid.startsWith("sensor.")) continue;
    if (!isAtmoEntity(stateObj)) continue;
    const zone = stateObj.attributes["Nom de la zone"] ?? "";
    if (zone) zones.add(zone);
  }
  return [...zones].sort();
}

export function isAllGood(entities: DiscoveredEntities): boolean {
  const check = (e: AtmoEntity | null) => {
    if (!e) return true;
    if (e.state === "unavailable" || e.state === "unknown") return false;
    const val = Number(e.state);
    return !Number.isNaN(val) && val <= 2;
  };

  if (!check(entities.pollution.overall.today)) return false;
  if (!check(entities.pollution.overall.forecast)) return false;
  if (!check(entities.pollen.overall.today)) return false;
  if (!check(entities.pollen.overall.forecast)) return false;
  for (const p of entities.pollution.sensors) {
    if (!check(p.today) || !check(p.forecast)) return false;
  }
  for (const p of entities.pollen.sensors) {
    if (!check(p.today) || !check(p.forecast)) return false;
  }
  return true;
}

export function getPollenConcKey(entityId: string): string | null {
  for (const [levelPattern, concPattern] of Object.entries(POLLEN_TO_CONC_MAP)) {
    if (entityId.includes(levelPattern)) {
      return concPattern;
    }
  }
  return null;
}
