import { css } from "lit";

export const cardStyles = css`
  ha-card {
    padding: 16px;
    overflow: hidden;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .header .title {
    font-size: 1.1em;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .header .zone {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .header .zone-name {
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }

  .device-link {
    color: var(--secondary-text-color);
    opacity: 0.6;
    cursor: pointer;
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .device-link:hover {
    opacity: 1;
  }

  .device-link ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Summary cards (compact view) */
  .compact {
    display: flex;
    gap: 10px;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .summary-card {
    flex: 1;
    text-align: center;
  }

  .summary-card-label {
    font-size: 0.85em;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .summary-card-badge {
    display: inline-block;
    font-size: 0.75em;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 12px;
    margin-top: 4px;
    white-space: nowrap;
  }

  .summary-card-forecast {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-top: 6px;
  }

  .summary-card-forecast-label {
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }

  .summary-card-forecast .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .summary-card-forecast-value {
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }

  /* Detail sections */

  .section {
    margin-top: 12px;
  }

  .section-title {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    margin-bottom: 8px;
    display: flex;
    gap: 8px;
    align-items: center;
    padding-left: 12px; /* align with sensor names: 4px color-bar + 8px gap */
  }

  .section-label {
    flex: 1;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-title .col-header {
    font-weight: 500;
    width: 80px;
    flex-shrink: 0;
  }

  /* Sensor rows */
  .sensor-row {
    display: flex;
    align-items: center;
    padding: 3px 0;
    gap: 8px;
  }

  .color-bar {
    width: 4px;
    height: 18px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .sensor-name {
    flex: 1;
    font-size: 0.85em;
    color: var(--primary-text-color);
  }

  .sensor-value {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 80px;
    flex-shrink: 0;
  }

  .sensor-value .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .sensor-value .text {
    font-size: 0.8em;
    color: var(--secondary-text-color);
  }

  .concentration {
    font-size: 0.7em;
    color: var(--secondary-text-color);
    opacity: 0.8;
    margin-left: 4px;
  }

  /* Unavailable state */
  .unavailable {
    opacity: 0.5;
    font-style: italic;
  }

  /* No data */
  .no-data {
    text-align: center;
    padding: 16px;
    color: var(--secondary-text-color);
    font-size: 0.9em;
  }
`;
