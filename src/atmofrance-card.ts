import { LitElement, html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { AtmoFranceCardConfig, AtmoEntity, AtmoEntityGroup, SensorPair, DiscoveredEntities, DEFAULT_CONFIG } from "./types";
import { discoverEntities, discoverZones, isAllGood, getPollenConcKey } from "./utils";
import { localize } from "./localize";
import { cardStyles } from "./styles";
import { CARD_VERSION, POLLEN_KEYS, POLLUTION_KEYS } from "./const";
import "./editor";

console.info(`%c ATMOFRANCE-CARD %c v${CARD_VERSION} `, "background: #4a90d9; color: white; font-weight: bold;", "background: #ddd; color: #333;");

@customElement("atmofrance-card")
export class AtmoFranceCard extends LitElement {
  static styles = cardStyles;

  @property({ attribute: false }) public hass: any;
  @state() private _config!: AtmoFranceCardConfig;
  @state() private _entities: DiscoveredEntities | null = null;
  private _trackedEntityIds: string[] = [];

  static getConfigElement() {
    return document.createElement("atmofrance-card-editor");
  }

  static getStubConfig() {
    return {
      show_pollution: true,
      show_pollen: true,
      show_forecast: true,
      hide_when_good: true,
      show_details: true,
      show_concentration: false,
    };
  }

  setConfig(config: AtmoFranceCardConfig): void {
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  getCardSize(): number {
    return this._config?.show_details ? 6 : 2;
  }

  private get _lang(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }

  private _t(key: string): string {
    return localize(key, this._lang);
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("_config")) return true;
    if (changedProps.has("hass")) {
      const oldHass = changedProps.get("hass");
      // On first load or if no tracked entities yet, do full discovery
      if (!oldHass || this._trackedEntityIds.length === 0) {
        this._rediscover();
        return true;
      }
      // Only re-render if a tracked atmo entity actually changed
      for (const eid of this._trackedEntityIds) {
        if (oldHass.states[eid] !== this.hass.states[eid]) {
          this._rediscover();
          return true;
        }
      }
      return false;
    }
    return false;
  }

  private _rediscover(): void {
    this._entities = discoverEntities(this.hass.states, this._config?.zone_name);
    // Build list of entity IDs to track for future change detection
    const ids: string[] = [];
    const addPair = (p: SensorPair) => {
      if (p.today) ids.push(p.today.entity_id);
      if (p.forecast) ids.push(p.forecast.entity_id);
    };
    const addGroup = (g: AtmoEntityGroup) => {
      addPair(g.overall);
      g.sensors.forEach(addPair);
    };
    addGroup(this._entities.pollution);
    addGroup(this._entities.pollen);
    this._trackedEntityIds = ids;
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;

    if (!this._entities) {
      this._entities = discoverEntities(this.hass.states, this._config?.zone_name);
    }

    const entities = this._entities;
    const hasData = entities.pollution.overall.today || entities.pollution.sensors.length > 0 ||
      entities.pollen.overall.today || entities.pollen.sensors.length > 0;

    if (!hasData) {
      return html`
        <ha-card>
          <div class="no-data">${this._t("card.no_data")}</div>
        </ha-card>
      `;
    }

    const showPollution = this._config.show_pollution !== false;
    const showPollen = this._config.show_pollen !== false;
    const showForecast = this._config.show_forecast !== false;
    const hideDetails = this._config.hide_when_good && isAllGood(entities);
    const title = this._config.title ?? this._t("card.title");
    const zoneName = entities.zoneName;

    return html`
      <ha-card>
        <div class="header">
          <span class="title">${title}</span>
          ${zoneName ? html`
            <span class="zone">
              <span class="zone-name">${zoneName}</span>
              ${this._renderDeviceLink(entities)}
            </span>
          ` : nothing}
        </div>

        ${this._renderCompact(entities, showPollution, showPollen, showForecast)}

        ${this._config.show_details && !hideDetails ? html`
          <div class="details">
            ${showPollution ? this._renderSection(
              this._t("card.pollution"),
              entities.pollution,
              "pollutant",
              "pollution_level",
              showForecast,
              false,
              this._config.hide_when_good ?? false,
              true,
            ) : nothing}
            ${showPollen ? this._renderSection(
              this._t("card.pollen"),
              entities.pollen,
              "pollen_type",
              "pollen_level",
              showForecast,
              this._config.show_concentration ?? false,
              this._config.hide_when_good ?? false,
              !showPollution,
            ) : nothing}
          </div>
        ` : nothing}
      </ha-card>
    `;
  }

  private _renderCompact(
    entities: DiscoveredEntities,
    showPollution: boolean,
    showPollen: boolean,
    showForecast: boolean
  ) {
    return html`
      <div class="compact">
        ${showPollution && entities.pollution.overall.today
          ? this._renderSummaryCard(
              this._t("card.pollution"),
              entities.pollution.overall.today,
              showForecast ? entities.pollution.overall.forecast : null,
              "pollution_level"
            )
          : nothing}
        ${showPollen && entities.pollen.overall.today
          ? this._renderSummaryCard(
              this._t("card.pollen"),
              entities.pollen.overall.today,
              showForecast ? entities.pollen.overall.forecast : null,
              "pollen_level"
            )
          : nothing}
      </div>
    `;
  }

  private _renderSummaryCard(label: string, entity: AtmoEntity, forecast: AtmoEntity | null, levelKey: string) {
    const isUnavailable = entity.state === "unavailable" || entity.state === "unknown";
    const levelLabel = isUnavailable
      ? this._t("card.unavailable")
      : this._t(`${levelKey}.${entity.state}`);
    return html`
      <div class="summary-card ${isUnavailable ? "unavailable" : ""}">
        <div class="summary-card-label">${label}</div>
        <span class="summary-card-badge" style="background-color: ${entity.color}; color: ${this._badgeTextColor(entity.color)}">${levelLabel}</span>
        ${forecast ? html`
          <div class="summary-card-forecast">
            <span class="summary-card-forecast-label">${this._t("card.forecast")}:</span>
            <span class="dot" style="background-color: ${forecast.color}"></span>
            <span class="summary-card-forecast-value">${this._t(`${levelKey}.${forecast.state}`)}</span>
          </div>
        ` : nothing}
      </div>
    `;
  }

  private _renderSection(
    title: string,
    group: AtmoEntityGroup,
    nameKey: string,
    levelKey: string,
    showForecast: boolean,
    showConcentration: boolean,
    hideWhenGood: boolean,
    showColumnHeaders: boolean,
  ) {
    if (!group.overall.today && group.sensors.length === 0) return nothing;

    const sensors = hideWhenGood
      ? group.sensors.filter((pair) => {
          if (!pair.today) return false;
          const val = Number(pair.today.state);
          return Number.isNaN(val) || val > 2;
        })
      : group.sensors;

    if (sensors.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-title">
          <span class="section-label">${title}</span>
          ${showColumnHeaders ? html`
            <span class="col-header">${this._t("card.today")}</span>
            ${showForecast ? html`<span class="col-header">${this._t("card.forecast")}</span>` : nothing}
          ` : nothing}
        </div>
        ${sensors.map((pair) =>
          pair.today ? this._renderSensorRow(
            pair.today,
            showForecast ? pair.forecast : null,
            nameKey,
            levelKey,
            showForecast,
            showConcentration ? this._getConcentration(pair.today) : null,
          ) : nothing
        )}
      </div>
    `;
  }

  private _renderSensorRow(
    entity: AtmoEntity,
    forecast: AtmoEntity | null,
    nameKey: string,
    levelKey: string,
    showForecast: boolean,
    concentration: string | null
  ) {
    const sensorPattern = this._extractPattern(entity.entity_id);
    const name = this._t(`${nameKey}.${sensorPattern}`);
    const isUnavailable = entity.state === "unavailable" || entity.state === "unknown";
    const levelLabel = isUnavailable
      ? this._t("card.unavailable")
      : this._t(`${levelKey}.${entity.state}`);

    return html`
      <div class="sensor-row ${isUnavailable ? "unavailable" : ""}">
        <span class="color-bar" style="background-color: ${entity.color}"></span>
        <span class="sensor-name">
          ${name}
          ${concentration ? html`<span class="concentration">(${concentration})</span>` : nothing}
        </span>
        <span class="sensor-value">
          <span class="dot" style="background-color: ${entity.color}"></span>
          <span class="text">${levelLabel}</span>
        </span>
        ${showForecast ? html`
          <span class="sensor-value">
            ${forecast ? html`
              <span class="dot" style="background-color: ${forecast.color}"></span>
              <span class="text">${this._t(`${levelKey}.${forecast.state}`)}</span>
            ` : html`<span class="text">—</span>`}
          </span>
        ` : nothing}
      </div>
    `;
  }

  // Derived from constants once — pollen first so "qualite_globale_pollen" matches before "qualite_globale"
  private static _entityPatterns = [
    ...POLLEN_KEYS.map(k => k.id_pattern),
    ...POLLUTION_KEYS.map(k => k.id_pattern),
  ];

  private _extractPattern(entityId: string): string {
    const id = entityId.replace("sensor.", "");
    const base = id.replace(/_j_1.*$/, "").replace(/_j\+1.*$/, "");
    for (const p of AtmoFranceCard._entityPatterns) {
      if (base.includes(p)) return p;
    }
    return base;
  }

  private _getConcentration(entity: AtmoEntity): string | null {
    if (!this._entities) return null;
    const concKey = getPollenConcKey(entity.entity_id);
    if (!concKey) return null;
    return this._entities.pollenConcentrations.get(concKey) ?? null;
  }

  private _renderDeviceLink(entities: DiscoveredEntities) {
    // Find first available entity ID to look up its device
    const entityId =
      entities.pollution.overall.today?.entity_id ??
      entities.pollen.overall.today?.entity_id ??
      entities.pollution.sensors[0]?.today?.entity_id ??
      entities.pollen.sensors[0]?.today?.entity_id;
    if (!entityId) return nothing;

    const deviceId = this.hass?.entities?.[entityId]?.device_id;
    if (!deviceId) return nothing;

    return html`
      <a class="device-link" href="/config/devices/device/${deviceId}" @click=${this._handleDeviceClick}>
        <ha-icon icon="mdi:information-outline"></ha-icon>
      </a>
    `;
  }

  private _handleDeviceClick = (e: Event) => {
    e.preventDefault();
    const link = e.currentTarget as HTMLAnchorElement;
    const path = link.getAttribute("href");
    if (path) {
      history.pushState(null, "", path);
      window.dispatchEvent(new Event("location-changed"));
    }
  }

  private _badgeTextColor(bgColor: string): string {
    // Parse hex color and return white or dark text for contrast
    const hex = bgColor.replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "#fff";
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#333" : "#fff";
  }

}

// Register in the card picker
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "atmofrance-card",
  name: "Atmo France",
  description: "Air quality and pollen data from Atmo France",
  preview: true,
  documentationURL: "https://github.com/sylvertom/atmofrance-card",
});
