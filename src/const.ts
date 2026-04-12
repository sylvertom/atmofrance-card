export const CARD_VERSION = "0.0.1";

export const POLLUTION_KEYS = [
  { key: "code_qual", id_pattern: "qualite_globale", excludePattern: "qualite_globale_pollen", isOverall: true },
  { key: "code_no2", id_pattern: "dioxyde_d_azote" },
  { key: "code_o3", id_pattern: "ozone" },
  { key: "code_pm10", id_pattern: "pm10" },
  { key: "code_pm25", id_pattern: "pm25" },
  { key: "code_so2", id_pattern: "dioxyde_de_soufre" },
] as const;

export const POLLEN_KEYS = [
  { key: "code_qual", id_pattern: "qualite_globale_pollen", isOverall: true },
  { key: "code_ambr", id_pattern: "niveau_ambroisie" },
  { key: "code_arm", id_pattern: "niveau_armoise" },
  { key: "code_aul", id_pattern: "niveau_aulne" },
  { key: "code_boul", id_pattern: "niveau_bouleau" },
  { key: "code_gram", id_pattern: "niveau_gramine" },
  { key: "code_oliv", id_pattern: "niveau_olivier" },
] as const;

export const POLLEN_CONC_KEYS = [
  { key: "conc_ambr", id_pattern: "concentration_ambroisie" },
  { key: "conc_arm", id_pattern: "concentration_armoise" },
  { key: "conc_aul", id_pattern: "concentration_aulne" },
  { key: "conc_boul", id_pattern: "concentration_bouleau" },
  { key: "conc_gram", id_pattern: "concentration_gramine" },
  { key: "conc_oliv", id_pattern: "concentration_olivier" },
] as const;

// Mapping from pollen level entity pattern to concentration entity pattern
export const POLLEN_TO_CONC_MAP: Record<string, string> = {
  niveau_ambroisie: "concentration_ambroisie",
  niveau_armoise: "concentration_armoise",
  niveau_aulne: "concentration_aulne",
  niveau_bouleau: "concentration_bouleau",
  niveau_gramine: "concentration_gramine",
  niveau_olivier: "concentration_olivier",
};

export const FALLBACK_COLOR = "#ddd";
