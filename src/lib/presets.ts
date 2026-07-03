import {
  AppState,
  DEFAULT_BASE_INPUTS,
  DEFAULT_TYPICAL_ROLLS,
  EquipmentItem,
  createEmptyAffix,
  createEquipmentItem,
} from "./damageModel";

export const DEFAULT_EQUIPMENT_KEYS = [
  "helm",
  "chest",
  "gloves",
  "pants",
  "boots",
  "amulet",
  "ring1",
  "ring2",
  "weapon1",
  "weapon2",
  "weapon3",
  "weapon4",
] as const;

export type DefaultEquipmentKey = (typeof DEFAULT_EQUIPMENT_KEYS)[number];

export type EquipmentNameMap = Record<DefaultEquipmentKey, string>;

export function createDefaultEquipment(names: EquipmentNameMap): EquipmentItem[] {
  return DEFAULT_EQUIPMENT_KEYS.map((key) =>
    createEquipmentItem(names[key], DEFAULT_BASE_INPUTS.defaultTargetQuality),
  );
}

export function createDefaultState(names: EquipmentNameMap): AppState {
  return {
    version: 1,
    baseInputs: { ...DEFAULT_BASE_INPUTS },
    equipment: createDefaultEquipment(names),
    quickDeltas: [
      { id: "delta-crit-chance", type: "critChance", value: 0.06 },
      {
        id: "delta-vulnerable",
        type: "vulnerableDamageMultiplier",
        value: 0.25,
      },
    ],
    typicalRolls: { ...DEFAULT_TYPICAL_ROLLS },
    includeGlobalIndependentMultipliers: false,
    globalIndependentMultipliers: [],
  };
}

export function createGlovesComparisonPreset(names: EquipmentNameMap): AppState {
  const equipment = createDefaultEquipment(names);
  const gloves = equipment.find((item) => item.name === names.gloves);

  if (gloves) {
    gloves.affixes = [
      {
        ...createEmptyAffix("critDamageMultiplier"),
        id: "preset-crit-damage",
        value: 2.3,
      },
      {
        ...createEmptyAffix("vulnerableDamageMultiplier"),
        id: "preset-vulnerable",
        value: 0.8,
      },
      createEmptyAffix(),
      createEmptyAffix(),
    ];
    gloves.inputQuality = 0;
    gloves.targetQuality = 0;
  }

  return {
    version: 1,
    baseInputs: { ...DEFAULT_BASE_INPUTS },
    equipment,
    quickDeltas: [
      { id: "preset-a-crit", type: "critChance", value: 0.06 },
      {
        id: "preset-a-vulnerable",
        type: "vulnerableDamageMultiplier",
        value: 0.25,
      },
    ],
    typicalRolls: { ...DEFAULT_TYPICAL_ROLLS },
    includeGlobalIndependentMultipliers: false,
    globalIndependentMultipliers: [],
  };
}

export function duplicateEquipmentItem(
  item: EquipmentItem,
  duplicateSuffix: string,
): EquipmentItem {
  return {
    ...item,
    id: crypto.randomUUID ? `item-${crypto.randomUUID()}` : `item-${Date.now()}`,
    name: `${item.name} ${duplicateSuffix}`,
    affixes: item.affixes.map((affix) => ({
      ...affix,
      id: crypto.randomUUID
        ? `affix-${crypto.randomUUID()}`
        : `affix-${Date.now()}-${Math.random()}`,
    })),
    extraAffixes: (item.extraAffixes ?? []).map((affix) => ({
      ...affix,
      id: crypto.randomUUID
        ? `affix-${crypto.randomUUID()}`
        : `affix-${Date.now()}-${Math.random()}`,
    })),
    itemIndependentMultipliers: (item.itemIndependentMultipliers ?? []).map(
      (row) => ({
        ...row,
        id: crypto.randomUUID
          ? `item-multiplier-${crypto.randomUUID()}`
          : `item-multiplier-${Date.now()}-${Math.random()}`,
      }),
    ),
  };
}
