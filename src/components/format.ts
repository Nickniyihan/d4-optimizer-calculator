import { AffixType, isIntegerAffix, isPercentAffix } from "../lib/damageModel";
import type { Language } from "../i18n";

export function toPercentInput(value: number): number {
  return roundForInput(value * 100);
}

export function fromPercentInput(value: number): number {
  return value / 100;
}

export function formatPercent(value: number, digits = 2): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatPercent(value, digits)}`;
}

export function formatNumber(value: number, digits = 4): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function formatFactor(value: number, language: Language): string {
  const absValue = Math.abs(value);
  const locale = language === "zh" ? "zh-CN" : "en-US";

  if (!Number.isFinite(value)) {
    return String(value);
  }

  if (absValue < 100) {
    return trimLocalizedNumber(value, locale, 2);
  }

  if (absValue < 10_000) {
    return trimLocalizedNumber(value, locale, 1);
  }

  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumSignificantDigits: 4,
  }).format(value);
}

export function formatBucketValue(type: AffixType, value: number): string {
  return isPercentAffix(type) ? formatPercent(value) : formatNumber(value, 0);
}

export function inputValueForAffix(type: AffixType, value: number): number {
  if (isPercentAffix(type)) {
    return toPercentInput(value);
  }

  return isIntegerAffix(type) ? Math.round(value) : roundForInput(value);
}

export function valueFromAffixInput(type: AffixType, value: number): number {
  if (isPercentAffix(type)) {
    return fromPercentInput(value);
  }

  return isIntegerAffix(type) ? Math.round(value) : value;
}

function roundForInput(value: number): number {
  return Number(Number.isFinite(value) ? value.toFixed(4) : 0);
}

function trimLocalizedNumber(
  value: number,
  locale: string,
  maximumFractionDigits: number,
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(value);
}
