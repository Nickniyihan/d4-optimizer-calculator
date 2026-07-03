import {
  AFFIX_TYPES,
  Affix,
  AppState,
  AffixType,
  DEFAULT_BASE_INPUTS,
  DEFAULT_GLOBAL_INDEPENDENT_MULTIPLIERS,
  DEFAULT_TYPICAL_ROLLS,
  EquipmentItem,
  GlobalIndependentMultiplier,
  ItemIndependentMultiplier,
  sanitizeGlobalIndependentMultiplierValue,
  sanitizeItemIndependentMultiplierValue,
} from "./damageModel";

export const STORAGE_KEY = "d4-multiplier-edge-calculator-state";
export const AUTO_SAVE_STORAGE_KEY = "d4-calculator-auto-save";

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState(): AppState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  return parseImportedState(raw);
}

export function serializeStateForExport(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function createExportFileName(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join("");

  return `d4-damage-gain-calculator-${stamp}.json`;
}

export function saveAutoSavePreference(enabled: boolean): void {
  localStorage.setItem(AUTO_SAVE_STORAGE_KEY, enabled ? "true" : "false");
}

export function loadAutoSavePreference(): boolean {
  const raw = localStorage.getItem(AUTO_SAVE_STORAGE_KEY);
  return raw === null ? true : raw === "true";
}

export function parseImportedState(raw: string): AppState {
  const parsed: unknown = JSON.parse(raw);

  return normalizeImportedState(parsed);
}

export function normalizeImportedState(parsed: unknown): AppState {
  if (!isRecord(parsed) || parsed.version !== 1) {
    throw new Error("Unsupported or missing version.");
  }

  if (!isRecord(parsed.baseInputs) || !Array.isArray(parsed.equipment)) {
    throw new Error("JSON is missing required app state fields.");
  }

  return {
    version: 1,
    baseInputs: {
      ...DEFAULT_BASE_INPUTS,
      ...parsed.baseInputs,
      treatTypeAllAsOneBucket: Boolean(
        parsed.baseInputs.treatTypeAllAsOneBucket,
      ),
    },
    equipment: normalizeEquipmentItemIds(parsed.equipment.map(readEquipmentItem)),
    quickDeltas: Array.isArray(parsed.quickDeltas)
      ? parsed.quickDeltas
          .filter(isRecord)
          .filter((delta) => isAffixType(delta.type))
          .map((delta, index) => ({
            id: String(delta.id ?? `imported-delta-${index}`),
            type: delta.type as AffixType,
            value: Number(delta.value) || 0,
          }))
      : [],
    typicalRolls: {
      ...DEFAULT_TYPICAL_ROLLS,
      ...(isRecord(parsed.typicalRolls) ? parsed.typicalRolls : {}),
    },
    includeGlobalIndependentMultipliers:
      typeof parsed.includeGlobalIndependentMultipliers === "boolean"
        ? parsed.includeGlobalIndependentMultipliers
        : false,
    globalIndependentMultipliers: Array.isArray(
      parsed.globalIndependentMultipliers,
    )
      ? normalizeGlobalIndependentMultiplierIds(
          parsed.globalIndependentMultipliers
            .filter(isRecord)
            .map(readGlobalIndependentMultiplier),
        )
      : [...DEFAULT_GLOBAL_INDEPENDENT_MULTIPLIERS],
  };
}

function readGlobalIndependentMultiplier(
  value: Record<string, unknown>,
  index: number,
): GlobalIndependentMultiplier {
  return {
    id: String(value.id ?? `imported-global-multiplier-${index}`),
    enabled: value.enabled !== false,
    name: String(value.name ?? ""),
    valuePercent: sanitizeGlobalIndependentMultiplierValue(
      Number(value.valuePercent) || 0,
    ),
  };
}

function normalizeGlobalIndependentMultiplierIds(
  rows: GlobalIndependentMultiplier[],
): GlobalIndependentMultiplier[] {
  const seen = new Set<string>();

  return rows.map((row, index) => {
    const fallbackId = `imported-global-multiplier-${index}`;
    const id = row.id.trim() || fallbackId;

    if (!seen.has(id)) {
      seen.add(id);
      return { ...row, id };
    }

    let nextId = `${id}-${index}`;
    let suffix = 1;
    while (seen.has(nextId)) {
      suffix += 1;
      nextId = `${id}-${index}-${suffix}`;
    }
    seen.add(nextId);

    return { ...row, id: nextId };
  });
}

function normalizeEquipmentItemIds(items: EquipmentItem[]): EquipmentItem[] {
  const seen = new Set<string>();

  return items.map((item, index) => {
    const fallbackId = `imported-item-${index}`;
    const id = item.id.trim() || fallbackId;

    if (!seen.has(id)) {
      seen.add(id);
      return { ...item, id };
    }

    let nextId = `${id}-${index}`;
    let suffix = 1;
    while (seen.has(nextId)) {
      suffix += 1;
      nextId = `${id}-${index}-${suffix}`;
    }
    seen.add(nextId);

    return { ...item, id: nextId };
  });
}

function readEquipmentItem(value: unknown, index: number): EquipmentItem {
  if (!isRecord(value)) {
    throw new Error(`Equipment item ${index + 1} is invalid.`);
  }

  const affixes = Array.isArray(value.affixes)
    ? value.affixes
        .filter(isRecord)
        .map((affix, affixIndex) =>
          readAffix(affix, `imported-affix-${index}-${affixIndex}`),
        )
    : [];
  const extraAffixes = Array.isArray(value.extraAffixes)
    ? value.extraAffixes
        .filter(isRecord)
        .map((affix, affixIndex) =>
          readAffix(affix, `imported-extra-affix-${index}-${affixIndex}`),
        )
    : [];
  const normalizedAffixes = normalizeAffixIds(affixes, `imported-affix-${index}`);
  const normalizedExtraAffixes = normalizeAffixIds(
    extraAffixes,
    `imported-extra-affix-${index}`,
  );
  const itemIndependentMultipliers = Array.isArray(
    value.itemIndependentMultipliers,
  )
    ? normalizeItemIndependentMultiplierIds(
        value.itemIndependentMultipliers
          .filter(isRecord)
          .map((row, rowIndex) =>
            readItemIndependentMultiplier(
              row,
              `imported-item-multiplier-${index}-${rowIndex}`,
            ),
          ),
      )
    : [];
  const inputCapstoneAffixId = normalizeCapstoneAffixId(
    value.inputCapstoneAffixId,
    normalizedAffixes,
  );
  const targetCapstoneAffixId = normalizeCapstoneAffixId(
    value.targetCapstoneAffixId,
    normalizedAffixes,
  );

  return {
    id: String(value.id ?? `imported-item-${index}`),
    name: String(value.name ?? `Item ${index + 1}`),
    enabled: value.enabled !== false,
    inputQuality: Number(value.inputQuality) || 0,
    targetQuality: Number(value.targetQuality) || 0,
    inputCapstoneAffixId,
    targetCapstoneAffixId,
    affixes: normalizedAffixes,
    extraAffixes: normalizedExtraAffixes,
    itemIndependentMultipliers,
  };
}

function readItemIndependentMultiplier(
  value: Record<string, unknown>,
  fallbackId: string,
): ItemIndependentMultiplier {
  return {
    id: String(value.id ?? fallbackId),
    enabled: value.enabled !== false,
    name: String(value.name ?? ""),
    valuePercent: sanitizeItemIndependentMultiplierValue(
      Number(value.valuePercent) || 0,
    ),
  };
}

function readAffix(value: Record<string, unknown>, fallbackId: string) {
  return {
    id: String(value.id ?? fallbackId),
    type: isAffixType(value.type) ? value.type : "critChance",
    value: Number(value.value) || 0,
    isGreaterAffix: value.isGreaterAffix === true,
  };
}

function normalizeAffixIds(affixes: Affix[], fallbackPrefix: string): Affix[] {
  const seen = new Set<string>();

  return affixes.map((affix, index) => {
    const fallbackId = `${fallbackPrefix}-${index}`;
    const id = affix.id.trim() || fallbackId;

    if (!seen.has(id)) {
      seen.add(id);
      return { ...affix, id };
    }

    let nextId = `${id}-${index}`;
    let suffix = 1;
    while (seen.has(nextId)) {
      suffix += 1;
      nextId = `${id}-${index}-${suffix}`;
    }
    seen.add(nextId);

    return { ...affix, id: nextId };
  });
}

function normalizeItemIndependentMultiplierIds(
  rows: ItemIndependentMultiplier[],
): ItemIndependentMultiplier[] {
  const seen = new Set<string>();

  return rows.map((row, index) => {
    const fallbackId = `imported-item-multiplier-${index}`;
    const id = row.id.trim() || fallbackId;

    if (!seen.has(id)) {
      seen.add(id);
      return { ...row, id };
    }

    let nextId = `${id}-${index}`;
    let suffix = 1;
    while (seen.has(nextId)) {
      suffix += 1;
      nextId = `${id}-${index}-${suffix}`;
    }
    seen.add(nextId);

    return { ...row, id: nextId };
  });
}

function normalizeCapstoneAffixId(
  value: unknown,
  affixes: Affix[],
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const id = String(value);
  return affixes.some((affix) => affix.id === id) ? id : null;
}

function isAffixType(value: unknown): value is AffixType {
  return typeof value === "string" && AFFIX_TYPES.includes(value as AffixType);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
