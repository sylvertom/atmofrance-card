import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { AtmoFranceCardConfig, DEFAULT_CONFIG } from "./types";
import { localize } from "./localize";
import { discoverZones } from "./utils";

@customElement("atmofrance-card-editor")
export class AtmoFranceCardEditor extends LitElement {
  @property({ attribute: false }) public hass: any;
  @state() private _config!: AtmoFranceCardConfig;

  setConfig(config: AtmoFranceCardConfig): void {
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  private get _lang(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }

  private _zoneOptions() {
    if (!this.hass) return [];
    const zones = discoverZones(this.hass.states);
    return [
      { value: "", label: localize("editor.all_zones", this._lang) },
      ...zones.map((z) => ({ value: z, label: z })),
    ];
  }

  private _schema() {
    return [
      {
        name: "title",
        label: localize("editor.title", this._lang),
        selector: { text: {} },
      },
      {
        name: "zone_name",
        label: localize("editor.zone_name", this._lang),
        selector: { select: { options: this._zoneOptions(), mode: "dropdown" } },
      },
      {
        name: "show_pollution",
        label: localize("editor.show_pollution", this._lang),
        selector: { boolean: {} },
      },
      {
        name: "show_pollen",
        label: localize("editor.show_pollen", this._lang),
        selector: { boolean: {} },
      },
      {
        name: "show_forecast",
        label: localize("editor.show_forecast", this._lang),
        selector: { boolean: {} },
      },
      {
        name: "hide_when_good",
        label: localize("editor.hide_when_good", this._lang),
        selector: { boolean: {} },
      },
      {
        name: "show_details",
        label: localize("editor.show_details", this._lang),
        selector: { boolean: {} },
      },
      {
        name: "show_concentration",
        label: localize("editor.show_concentration", this._lang),
        selector: { boolean: {} },
      },
    ];
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema()}
        .computeLabel=${(s: any) => s.label ?? s.name}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    const config = ev.detail.value;
    const event = new CustomEvent("config-changed", {
      detail: { config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}
