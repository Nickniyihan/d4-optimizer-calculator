import {
  AFFIX_TYPES,
  Affix,
  AffixType,
  CustomPanelStat,
  DeltaRow,
} from "../lib/damageModel";
import { Translation } from "../i18n";

export type AffixOption = {
  value: string;
  type: AffixType;
  customStatId?: string;
  label: string;
};

export function buildAffixOptions(
  t: Translation,
  customPanelStats: CustomPanelStat[] = [],
): AffixOption[] {
  return [
    ...AFFIX_TYPES.map((type) => ({
      value: type,
      type,
      label: t.affix.inputTypes[type],
    })),
    ...customPanelStats
      .filter((stat) => stat.enabled !== false)
      .map((stat) => {
        const label = getCustomAffixLabel(t, customPanelStats, stat.id);

        return {
          value: encodeAffixOption("customStat", stat.id),
          type: "customStat" as const,
          customStatId: stat.id,
          label,
        };
      }),
  ];
}

export function encodeAffixOption(type: AffixType, customStatId?: string): string {
  return type === "customStat" ? `customStat:${customStatId ?? ""}` : type;
}

export function parseAffixOption(value: string): {
  type: AffixType;
  customStatId?: string;
} {
  if (value.startsWith("customStat:")) {
    return {
      type: "customStat",
      customStatId: value.slice("customStat:".length) || undefined,
    };
  }

  return { type: value as AffixType, customStatId: undefined };
}

export function getAffixDisplayLabel(
  t: Translation,
  affix: Pick<Affix | DeltaRow, "type" | "customStatId">,
  customPanelStats: CustomPanelStat[] = [],
): string {
  if (affix.type === "customStat") {
    return getCustomAffixLabel(t, customPanelStats, affix.customStatId);
  }

  return t.affix.types[affix.type];
}

export function getCustomStatDisplayName(
  t: Translation,
  customPanelStats: CustomPanelStat[] = [],
  customStatId?: string,
): string {
  const stat = customPanelStats.find((current) => current.id === customStatId);
  const name = stat?.name.trim();

  if (name) {
    return name;
  }

  return customStatId ? t.settings.invalidCustomStat : t.settings.customPanelStat;
}

export function getCustomAffixLabel(
  t: Translation,
  customPanelStats: CustomPanelStat[] = [],
  customStatId?: string,
): string {
  const stat = customPanelStats.find((current) => current.id === customStatId);
  const label = stat?.affixLabel.trim() || stat?.name.trim();

  return `+${label || t.settings.customAffixFallback}`;
}
