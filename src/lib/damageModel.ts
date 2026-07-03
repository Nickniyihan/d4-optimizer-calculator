export const APP_VERSION = 1;

export type AffixType =
  | "critChance"
  | "mainStat"
  | "critDamageMultiplier"
  | "vulnerableDamageMultiplier"
  | "typeAllDamageMultiplier"
  | "additiveDamage"
  | "critDamageAdditive"
  | "vulnerableDamageAdditive"
  | "skillRanks"
  | "weaponDamage";

export interface BaseInputs {
  baseCritChance: number;
  vulnerableUptime: number;
  baseMainStat: number;
  mainStatCoefficient: number;
  baseAdditivePool: number;
  baseCritDamageMultiplier: number;
  baseVulnerableDamageMultiplier: number;
  baseCritDamageAdditive: number;
  baseVulnerableDamageAdditive: number;
  baseWeaponDamageMin: number;
  baseWeaponDamageMax: number;
  includeWeaponDamage: boolean;
  baseMainSkillRank: number;
  includeSkillRankDamage: boolean;
  mainSkillBaseMultiplier: number;
  includeSkillBaseMultiplier: boolean;
  baseCritMultiplier: number;
  baseVulnerableMultiplier: number;
  critChanceCap: number;
  defaultTargetQuality: number;
  capstoneBonus: number;
  greaterAffixBonus: number;
  treatTypeAllAsOneBucket: boolean;
}

export interface Affix {
  id: string;
  type: AffixType;
  value: number;
  isGreaterAffix?: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  enabled: boolean;
  inputQuality: number;
  targetQuality: number;
  inputCapstoneAffixId?: string | null;
  targetCapstoneAffixId?: string | null;
  affixes: Affix[];
  extraAffixes: Affix[];
  itemIndependentMultipliers: ItemIndependentMultiplier[];
}

export interface GlobalIndependentMultiplier {
  id: string;
  enabled: boolean;
  name: string;
  valuePercent: number;
}

export interface ItemIndependentMultiplier {
  id: string;
  enabled: boolean;
  name: string;
  valuePercent: number;
}

export interface GearTotals {
  gearCritChance: number;
  gearMainStat: number;
  gearCritDamageMultiplier: number;
  gearVulnerableDamageMultiplier: number;
  gearTypeAllDamageMultiplier: number;
  gearAdditiveDamage: number;
  gearCritDamageAdditive: number;
  gearVulnerableDamageAdditive: number;
  gearSkillRanks: number;
  gearWeaponDamage: number;
}

export interface StateBreakdown {
  crit: boolean;
  vulnerable: boolean;
  probability: number;
  additiveFactor: number;
  critMultiplier: number;
  vulnerableMultiplier: number;
  contribution: number;
}

export interface DamageBreakdown {
  mainStatFactor: number;
  critFactor: number;
  vulnerableFactor: number;
  typeAllMultiplierFactor: number;
  additiveFactor: number;
  weaponDamageFactor: number;
  skillDamageFactor: number;
  globalIndependentMultiplierFactor: number;
  equipmentIndependentMultiplierFactor: number;
  expectedCombatFactor: number;
  totalDamageFactor: number;
  damageBase: number;
  baseAverageWeaponDamage: number;
  effectiveWeaponDamage: number;
  baseMainSkillRank: number;
  totalMainSkillRank: number;
  baseSkillRankMultiplier: number;
  totalSkillRankMultiplier: number;
  skillBaseMultiplierFactor: number;
  totalCritChance: number;
  totalMainStat: number;
  totalAdditivePool: number;
  totalCritDamageMultiplier: number;
  totalVulnerableDamageMultiplier: number;
  totalCritDamageAdditive: number;
  totalVulnerableDamageAdditive: number;
  totalGenericAdditive: number;
  stateBreakdown: StateBreakdown[];
  gearTotals: GearTotals;
}

export interface DeltaRow {
  id: string;
  type: AffixType;
  value: number;
}

export interface TypicalRolls {
  critChance: number;
  mainStat: number;
  critDamageMultiplier: number;
  vulnerableDamageMultiplier: number;
  typeAllDamageMultiplier: number;
  additiveDamage: number;
  critDamageAdditive: number;
  vulnerableDamageAdditive: number;
  skillRanks: number;
  weaponDamage: number;
}

export interface AppState {
  version: 1;
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  quickDeltas: DeltaRow[];
  typicalRolls: TypicalRolls;
  includeGlobalIndependentMultipliers: boolean;
  globalIndependentMultipliers: GlobalIndependentMultiplier[];
}

export interface NormalizeAffixValueParams {
  inputValue: number;
  inputQuality: number;
  targetQuality: number;
  capstoneBonus: number;
  greaterAffixBonus?: number;
  isGreaterAffix?: boolean;
  inputHasCapstone: boolean;
  targetHasCapstone: boolean;
}

export interface FactorChange {
  before: number;
  after: number;
  relativeChange: number;
}

export interface ComparisonBreakdown {
  before: DamageBreakdown;
  after: DamageBreakdown;
  totalRelativeChange: number;
  factorChanges: {
    mainStatFactor: FactorChange;
    critFactor: FactorChange;
    vulnerableFactor: FactorChange;
    typeAllMultiplierFactor: FactorChange;
    additiveFactor: FactorChange;
    weaponDamageFactor: FactorChange;
    skillDamageFactor: FactorChange;
    globalIndependentMultiplierFactor: FactorChange;
    equipmentIndependentMultiplierFactor: FactorChange;
    expectedCombatFactor: FactorChange;
    totalDamageFactor: FactorChange;
  };
}

export interface MarginalGain {
  type: AffixType;
  delta: number;
  relativeChange: number;
  currentBucketTotal: number;
  currentFactor: number;
}

export type AffixGroup = "item" | "extra";

export type CandidateContributionRowKind =
  | "itemAffix"
  | "extraAffix"
  | "itemIndependentMultiplier";

export interface CandidateContributionParams {
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  replacedItemId: string;
  candidate: EquipmentItem;
  rowId: string;
  rowKind: CandidateContributionRowKind;
  globalIndependentMultiplierFactor?: number;
  deltas?: DeltaRow[];
}

export interface CandidateCapstoneRecommendation {
  affix: Affix;
  value: number;
  gain: number;
  isCurrent: boolean;
}

export const AFFIX_TYPES: AffixType[] = [
  "critChance",
  "mainStat",
  "critDamageMultiplier",
  "vulnerableDamageMultiplier",
  "typeAllDamageMultiplier",
  "additiveDamage",
  "critDamageAdditive",
  "vulnerableDamageAdditive",
  "skillRanks",
  "weaponDamage",
];

export const PERCENT_AFFIX_TYPES: AffixType[] = [
  "critChance",
  "critDamageMultiplier",
  "vulnerableDamageMultiplier",
  "typeAllDamageMultiplier",
  "additiveDamage",
  "critDamageAdditive",
  "vulnerableDamageAdditive",
];

export const INTEGER_AFFIX_TYPES: AffixType[] = ["skillRanks"];

export const DEFAULT_BASE_INPUTS: BaseInputs = {
  baseCritChance: 0.7,
  vulnerableUptime: 0.6,
  baseMainStat: 2500,
  mainStatCoefficient: 0.001,
  baseAdditivePool: 10,
  baseCritDamageMultiplier: 0,
  baseVulnerableDamageMultiplier: 0,
  baseCritDamageAdditive: 0,
  baseVulnerableDamageAdditive: 0,
  baseWeaponDamageMin: 0,
  baseWeaponDamageMax: 0,
  includeWeaponDamage: true,
  baseMainSkillRank: 1,
  includeSkillRankDamage: true,
  mainSkillBaseMultiplier: 100,
  includeSkillBaseMultiplier: false,
  baseCritMultiplier: 1.5,
  baseVulnerableMultiplier: 1.2,
  critChanceCap: 1,
  defaultTargetQuality: 25,
  capstoneBonus: 0.5,
  greaterAffixBonus: 0.25,
  treatTypeAllAsOneBucket: true,
};

export const EMPTY_GEAR_TOTALS: GearTotals = {
  gearCritChance: 0,
  gearMainStat: 0,
  gearCritDamageMultiplier: 0,
  gearVulnerableDamageMultiplier: 0,
  gearTypeAllDamageMultiplier: 0,
  gearAdditiveDamage: 0,
  gearCritDamageAdditive: 0,
  gearVulnerableDamageAdditive: 0,
  gearSkillRanks: 0,
  gearWeaponDamage: 0,
};

export const DEFAULT_TYPICAL_ROLLS: TypicalRolls = {
  critChance: 0.075,
  critDamageMultiplier: 0.38,
  vulnerableDamageMultiplier: 0.21,
  typeAllDamageMultiplier: 0.15,
  mainStat: 182,
  additiveDamage: 0.75,
  critDamageAdditive: 0.75,
  vulnerableDamageAdditive: 0.6,
  skillRanks: 4,
  weaponDamage: 286,
};

export const DEFAULT_GLOBAL_INDEPENDENT_MULTIPLIERS: GlobalIndependentMultiplier[] =
  [];

export function isPercentAffix(type: AffixType): boolean {
  return PERCENT_AFFIX_TYPES.includes(type);
}

export function isIntegerAffix(type: AffixType): boolean {
  return INTEGER_AFFIX_TYPES.includes(type);
}

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createEmptyAffix(type: AffixType = "critChance"): Affix {
  return {
    id: createId("affix"),
    type,
    value: 0,
    isGreaterAffix: false,
  };
}

export function createGlobalIndependentMultiplier(): GlobalIndependentMultiplier {
  return {
    id: createId("global-multiplier"),
    enabled: true,
    name: "",
    valuePercent: 0,
  };
}

export function createEquipmentItem(
  name: string,
  defaultTargetQuality = DEFAULT_BASE_INPUTS.defaultTargetQuality,
): EquipmentItem {
  return {
    id: createId("item"),
    name,
    enabled: true,
    inputQuality: 0,
    targetQuality: defaultTargetQuality,
    inputCapstoneAffixId: null,
    targetCapstoneAffixId: null,
    affixes: [
      createEmptyAffix(),
      createEmptyAffix(),
      createEmptyAffix(),
      createEmptyAffix(),
    ],
    extraAffixes: [],
    itemIndependentMultipliers: [],
  };
}

export function createItemIndependentMultiplier(): ItemIndependentMultiplier {
  return {
    id: createId("item-multiplier"),
    enabled: true,
    name: "",
    valuePercent: 0,
  };
}

export function normalizeAffixValueToTarget({
  inputValue,
  inputQuality,
  targetQuality,
  capstoneBonus,
  greaterAffixBonus = DEFAULT_BASE_INPUTS.greaterAffixBonus,
  isGreaterAffix = false,
  inputHasCapstone,
  targetHasCapstone,
}: NormalizeAffixValueParams): number {
  const greaterBonus = isGreaterAffix ? greaterAffixBonus : 0;
  const inputScale =
    1 + inputQuality / 100 + greaterBonus + (inputHasCapstone ? capstoneBonus : 0);
  const targetScale =
    1 +
    targetQuality / 100 +
    greaterBonus +
    (targetHasCapstone ? capstoneBonus : 0);

  if (inputScale === 0) {
    return 0;
  }

  return (inputValue / inputScale) * targetScale;
}

export function normalizeEquipmentAffix(
  item: EquipmentItem,
  affix: Affix,
  capstoneBonus: number,
  greaterAffixBonus = DEFAULT_BASE_INPUTS.greaterAffixBonus,
): number {
  const value = normalizeAffixValueToTarget({
    inputValue: affix.value,
    inputQuality: item.inputQuality,
    targetQuality: item.targetQuality,
    capstoneBonus,
    greaterAffixBonus,
    isGreaterAffix: affix.isGreaterAffix,
    inputHasCapstone: item.inputCapstoneAffixId === affix.id,
    targetHasCapstone: item.targetCapstoneAffixId === affix.id,
  });

  return affix.type === "skillRanks" ? coerceSkillRankAffixValue(value) : value;
}

export function aggregateGear(
  equipment: EquipmentItem[],
  baseInputs: BaseInputs,
): GearTotals {
  return equipment.reduce<GearTotals>((totals, item) => {
    if (!item.enabled) {
      return totals;
    }

    item.affixes.forEach((affix) => {
      const value = normalizeEquipmentAffix(
        item,
        affix,
        baseInputs.capstoneBonus,
        baseInputs.greaterAffixBonus,
      );
      addAffixToGearTotals(totals, affix.type, value);
    });

    (item.extraAffixes ?? []).forEach((affix) => {
      addAffixToGearTotals(
        totals,
        affix.type,
        affix.type === "skillRanks"
          ? coerceSkillRankAffixValue(affix.value)
          : affix.value,
      );
    });

    return totals;
  }, { ...EMPTY_GEAR_TOTALS });
}

export function getEffectiveAffixValue(
  item: EquipmentItem,
  affix: Affix,
  group: AffixGroup,
  capstoneBonus: number,
  greaterAffixBonus = DEFAULT_BASE_INPUTS.greaterAffixBonus,
): number {
  return group === "extra"
    ? affix.type === "skillRanks"
      ? coerceSkillRankAffixValue(affix.value)
      : affix.value
    : normalizeEquipmentAffix(item, affix, capstoneBonus, greaterAffixBonus);
}

export function calculateEquipmentAffixContribution({
  baseInputs,
  equipment,
  itemId,
  affixId,
  group,
}: {
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  itemId: string;
  affixId: string;
  group: AffixGroup;
}): number {
  const current = calculateEquipmentBreakdown(baseInputs, equipment).totalDamageFactor;
  const withoutAffix = equipment.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    if (group === "extra") {
      return {
        ...item,
        extraAffixes: (item.extraAffixes ?? []).filter(
          (affix) => affix.id !== affixId,
        ),
      };
    }

    return {
      ...item,
      inputCapstoneAffixId:
        item.inputCapstoneAffixId === affixId ? null : item.inputCapstoneAffixId,
      targetCapstoneAffixId:
        item.targetCapstoneAffixId === affixId ? null : item.targetCapstoneAffixId,
      affixes: item.affixes.filter((affix) => affix.id !== affixId),
    };
  });
  const without = calculateEquipmentBreakdown(
    baseInputs,
    withoutAffix,
  ).totalDamageFactor;

  return relativeChange(without, current);
}

export function calculateItemIndependentMultiplierContribution({
  baseInputs,
  equipment,
  itemId,
  multiplierId,
}: {
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  itemId: string;
  multiplierId: string;
}): number {
  const current = calculateEquipmentBreakdown(baseInputs, equipment).totalDamageFactor;
  const withoutMultiplier = equipment.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      itemIndependentMultipliers: (item.itemIndependentMultipliers ?? []).filter(
        (row) => row.id !== multiplierId,
      ),
    };
  });
  const without = calculateEquipmentBreakdown(
    baseInputs,
    withoutMultiplier,
  ).totalDamageFactor;

  return relativeChange(without, current);
}

export function buildCandidateReplacementEquipment(
  equipment: EquipmentItem[],
  replacedItemId: string,
  candidate: EquipmentItem,
): EquipmentItem[] {
  return equipment.map((item) =>
    item.id === replacedItemId ? { ...candidate, enabled: true } : item,
  );
}

export function calculateEquipmentSetupBreakdown({
  baseInputs,
  equipment,
  globalIndependentMultiplierFactor = 1,
  deltas = [],
}: {
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  globalIndependentMultiplierFactor?: number;
  deltas?: DeltaRow[];
}): DamageBreakdown {
  if (deltas.length === 0) {
    return calculateEquipmentBreakdown(
      baseInputs,
      equipment,
      globalIndependentMultiplierFactor,
    );
  }

  return calculateDamageBreakdown(
    baseInputs,
    applyDeltasToGearTotals(aggregateGear(equipment, baseInputs), deltas),
    globalIndependentMultiplierFactor,
    calculateEquipmentIndependentMultiplierFactor(equipment),
  );
}

export function calculateCandidateRowContribution({
  baseInputs,
  equipment,
  replacedItemId,
  candidate,
  rowId,
  rowKind,
  globalIndependentMultiplierFactor = 1,
  deltas = [],
}: CandidateContributionParams): number {
  const replacementEquipment = buildCandidateReplacementEquipment(
    equipment,
    replacedItemId,
    candidate,
  );
  const current = calculateEquipmentSetupBreakdown({
    baseInputs,
    equipment: replacementEquipment,
    globalIndependentMultiplierFactor,
    deltas,
  }).totalDamageFactor;
  const candidateWithoutRow = removeCandidateRow(candidate, rowId, rowKind);
  const withoutEquipment = buildCandidateReplacementEquipment(
    equipment,
    replacedItemId,
    candidateWithoutRow,
  );
  const without = calculateEquipmentSetupBreakdown({
    baseInputs,
    equipment: withoutEquipment,
    globalIndependentMultiplierFactor,
    deltas,
  }).totalDamageFactor;

  return relativeChange(without, current);
}

export function calculateCandidateCapstoneRecommendations({
  baseInputs,
  equipment,
  replacedItemId,
  candidate,
  globalIndependentMultiplierFactor = 1,
  deltas = [],
}: {
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  replacedItemId: string;
  candidate: EquipmentItem;
  globalIndependentMultiplierFactor?: number;
  deltas?: DeltaRow[];
}): CandidateCapstoneRecommendation[] {
  const candidateWithoutCapstone = { ...candidate, targetCapstoneAffixId: null };
  const baselineEquipment = buildCandidateReplacementEquipment(
    equipment,
    replacedItemId,
    candidateWithoutCapstone,
  );
  const baseline = calculateEquipmentSetupBreakdown({
    baseInputs,
    equipment: baselineEquipment,
    globalIndependentMultiplierFactor,
    deltas,
  }).totalDamageFactor;

  return candidate.affixes
    .map((affix, index) => {
      const simulatedCandidate = { ...candidate, targetCapstoneAffixId: affix.id };
      const simulatedEquipment = buildCandidateReplacementEquipment(
        equipment,
        replacedItemId,
        simulatedCandidate,
      );
      const after = calculateEquipmentSetupBreakdown({
        baseInputs,
        equipment: simulatedEquipment,
        globalIndependentMultiplierFactor,
        deltas,
      }).totalDamageFactor;

      return {
        affix,
        index,
        value: normalizeEquipmentAffix(
          simulatedCandidate,
          affix,
          baseInputs.capstoneBonus,
          baseInputs.greaterAffixBonus,
        ),
        gain: relativeChange(baseline, after),
        isCurrent: candidate.targetCapstoneAffixId === affix.id,
      };
    })
    .filter((row) => row.affix.value !== 0)
    .sort((a, b) => b.gain - a.gain || a.index - b.index)
    .map(({ index: _index, ...row }) => row);
}

export function replaceEquipmentItemWithCandidate(
  currentItem: EquipmentItem,
  candidate: EquipmentItem,
): EquipmentItem {
  return {
    ...candidate,
    id: currentItem.id,
    name: candidate.name.trim() ? candidate.name : currentItem.name,
    enabled: currentItem.enabled,
    affixes: candidate.affixes.map((affix) => ({ ...affix })),
    extraAffixes: (candidate.extraAffixes ?? []).map((affix) => ({ ...affix })),
    itemIndependentMultipliers: (candidate.itemIndependentMultipliers ?? []).map(
      (row) => ({ ...row }),
    ),
  };
}

function removeCandidateRow(
  candidate: EquipmentItem,
  rowId: string,
  rowKind: CandidateContributionRowKind,
): EquipmentItem {
  if (rowKind === "extraAffix") {
    return {
      ...candidate,
      extraAffixes: (candidate.extraAffixes ?? []).filter(
        (affix) => affix.id !== rowId,
      ),
    };
  }

  if (rowKind === "itemIndependentMultiplier") {
    return {
      ...candidate,
      itemIndependentMultipliers: (
        candidate.itemIndependentMultipliers ?? []
      ).filter((row) => row.id !== rowId),
    };
  }

  return {
    ...candidate,
    inputCapstoneAffixId:
      candidate.inputCapstoneAffixId === rowId
        ? null
        : candidate.inputCapstoneAffixId,
    targetCapstoneAffixId:
      candidate.targetCapstoneAffixId === rowId
        ? null
        : candidate.targetCapstoneAffixId,
    affixes: candidate.affixes.filter((affix) => affix.id !== rowId),
  };
}

export function addAffixToGearTotals(
  totals: GearTotals,
  type: AffixType,
  value: number,
): GearTotals {
  switch (type) {
    case "critChance":
      totals.gearCritChance += value;
      break;
    case "mainStat":
      totals.gearMainStat += value;
      break;
    case "critDamageMultiplier":
      totals.gearCritDamageMultiplier += value;
      break;
    case "vulnerableDamageMultiplier":
      totals.gearVulnerableDamageMultiplier += value;
      break;
    case "typeAllDamageMultiplier":
      totals.gearTypeAllDamageMultiplier += value;
      break;
    case "additiveDamage":
      totals.gearAdditiveDamage += value;
      break;
    case "critDamageAdditive":
      totals.gearCritDamageAdditive += value;
      break;
    case "vulnerableDamageAdditive":
      totals.gearVulnerableDamageAdditive += value;
      break;
    case "skillRanks":
      totals.gearSkillRanks += coerceSkillRankDelta(value);
      break;
    case "weaponDamage":
      totals.gearWeaponDamage += value;
      break;
  }

  return totals;
}

export function calculateDamageBreakdown(
  baseInputs: BaseInputs,
  gearTotals: GearTotals,
  globalIndependentMultiplierFactor = 1,
  equipmentIndependentMultiplierFactor = 1,
): DamageBreakdown {
  const totalCritChance = clamp(
    baseInputs.baseCritChance + gearTotals.gearCritChance,
    0,
    baseInputs.critChanceCap,
  );
  const vulnerableUptime = clamp(baseInputs.vulnerableUptime, 0, 1);
  const totalMainStat = baseInputs.baseMainStat + gearTotals.gearMainStat;
  const totalGenericAdditive =
    baseInputs.baseAdditivePool + gearTotals.gearAdditiveDamage;
  const totalAdditivePool = totalGenericAdditive;
  const totalCritDamageMultiplier =
    baseInputs.baseCritDamageMultiplier + gearTotals.gearCritDamageMultiplier;
  const totalVulnerableDamageMultiplier =
    baseInputs.baseVulnerableDamageMultiplier +
    gearTotals.gearVulnerableDamageMultiplier;
  const totalCritDamageAdditive =
    baseInputs.baseCritDamageAdditive + gearTotals.gearCritDamageAdditive;
  const totalVulnerableDamageAdditive =
    baseInputs.baseVulnerableDamageAdditive +
    gearTotals.gearVulnerableDamageAdditive;
  const baseAverageWeaponDamage = getBaseAverageWeaponDamage(baseInputs);
  const effectiveWeaponDamage =
    baseAverageWeaponDamage + gearTotals.gearWeaponDamage;
  const hasWeaponDamageBase =
    baseInputs.includeWeaponDamage && baseAverageWeaponDamage > 0;
  const weaponDamageFactor = hasWeaponDamageBase
    ? effectiveWeaponDamage / baseAverageWeaponDamage
    : 1;
  const damageBase = hasWeaponDamageBase ? effectiveWeaponDamage : 1;
  const baseMainSkillRank = getValidSkillRank(baseInputs.baseMainSkillRank);
  const totalMainSkillRank = clamp(
    baseMainSkillRank + gearTotals.gearSkillRanks,
    1,
    50,
  );
  const baseSkillRankMultiplier = getSkillRankMultiplier(baseMainSkillRank);
  const totalSkillRankMultiplier = getSkillRankMultiplier(totalMainSkillRank);
  const skillRankDamageFactor = baseInputs.includeSkillRankDamage
    ? totalSkillRankMultiplier
    : 1;
  const skillBaseMultiplierFactor = baseInputs.includeSkillBaseMultiplier
    ? getMainSkillBaseMultiplierFactor(baseInputs.mainSkillBaseMultiplier)
    : 1;
  const skillDamageFactor = skillRankDamageFactor * skillBaseMultiplierFactor;

  const mainStatFactor = 1 + totalMainStat * baseInputs.mainStatCoefficient;
  const critFactor =
    1 -
    totalCritChance +
    totalCritChance *
      baseInputs.baseCritMultiplier *
      (1 + totalCritDamageMultiplier);
  const vulnerableFactor =
    1 -
    vulnerableUptime +
    vulnerableUptime *
      baseInputs.baseVulnerableMultiplier *
      (1 + totalVulnerableDamageMultiplier);
  const typeAllMultiplierFactor = 1 + gearTotals.gearTypeAllDamageMultiplier;
  const additiveFactor = 1 + totalGenericAdditive;
  const stateBreakdown = calculateStateBreakdown({
    critChance: totalCritChance,
    vulnerableUptime,
    totalGenericAdditive,
    totalCritDamageAdditive,
    totalVulnerableDamageAdditive,
    baseCritMultiplier: baseInputs.baseCritMultiplier,
    baseVulnerableMultiplier: baseInputs.baseVulnerableMultiplier,
    totalCritDamageMultiplier,
    totalVulnerableDamageMultiplier,
  });
  const expectedCombatFactor = stateBreakdown.reduce(
    (sum, state) => sum + state.contribution,
    0,
  );
  const safeGlobalIndependentMultiplierFactor =
    sanitizeMultiplierFactor(globalIndependentMultiplierFactor);
  const safeEquipmentIndependentMultiplierFactor =
    sanitizeMultiplierFactor(equipmentIndependentMultiplierFactor);
  const totalDamageFactor =
    damageBase *
    skillDamageFactor *
    mainStatFactor *
    typeAllMultiplierFactor *
    expectedCombatFactor *
    safeGlobalIndependentMultiplierFactor *
    safeEquipmentIndependentMultiplierFactor;

  return {
    mainStatFactor,
    critFactor,
    vulnerableFactor,
    typeAllMultiplierFactor,
    additiveFactor,
    weaponDamageFactor,
    skillDamageFactor,
    globalIndependentMultiplierFactor: safeGlobalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor: safeEquipmentIndependentMultiplierFactor,
    expectedCombatFactor,
    totalDamageFactor,
    damageBase,
    baseAverageWeaponDamage,
    effectiveWeaponDamage,
    baseMainSkillRank,
    totalMainSkillRank,
    baseSkillRankMultiplier,
    totalSkillRankMultiplier,
    skillBaseMultiplierFactor,
    totalCritChance,
    totalMainStat,
    totalAdditivePool,
    totalCritDamageMultiplier,
    totalVulnerableDamageMultiplier,
    totalCritDamageAdditive,
    totalVulnerableDamageAdditive,
    totalGenericAdditive,
    stateBreakdown,
    gearTotals: { ...gearTotals },
  };
}

export function calculateEquipmentBreakdown(
  baseInputs: BaseInputs,
  equipment: EquipmentItem[],
  globalIndependentMultiplierFactor = 1,
): DamageBreakdown {
  return calculateDamageBreakdown(
    baseInputs,
    aggregateGear(equipment, baseInputs),
    globalIndependentMultiplierFactor,
    calculateEquipmentIndependentMultiplierFactor(equipment),
  );
}

export function applyDeltasToGearTotals(
  gearTotals: GearTotals,
  deltas: DeltaRow[],
): GearTotals {
  const nextTotals = { ...gearTotals };
  deltas.forEach((delta) => {
    addAffixToGearTotals(nextTotals, delta.type, delta.value);
  });
  return nextTotals;
}

export function compareBreakdowns(
  before: DamageBreakdown,
  after: DamageBreakdown,
): ComparisonBreakdown {
  return {
    before,
    after,
    totalRelativeChange: relativeChange(before.totalDamageFactor, after.totalDamageFactor),
    factorChanges: {
      mainStatFactor: makeFactorChange(before.mainStatFactor, after.mainStatFactor),
      critFactor: makeFactorChange(before.critFactor, after.critFactor),
      vulnerableFactor: makeFactorChange(
        before.vulnerableFactor,
        after.vulnerableFactor,
      ),
      typeAllMultiplierFactor: makeFactorChange(
        before.typeAllMultiplierFactor,
        after.typeAllMultiplierFactor,
      ),
      additiveFactor: makeFactorChange(before.additiveFactor, after.additiveFactor),
      weaponDamageFactor: makeFactorChange(
        before.weaponDamageFactor,
        after.weaponDamageFactor,
      ),
      skillDamageFactor: makeFactorChange(
        before.skillDamageFactor,
        after.skillDamageFactor,
      ),
      globalIndependentMultiplierFactor: makeFactorChange(
        before.globalIndependentMultiplierFactor,
        after.globalIndependentMultiplierFactor,
      ),
      equipmentIndependentMultiplierFactor: makeFactorChange(
        before.equipmentIndependentMultiplierFactor,
        after.equipmentIndependentMultiplierFactor,
      ),
      expectedCombatFactor: makeFactorChange(
        before.expectedCombatFactor,
        after.expectedCombatFactor,
      ),
      totalDamageFactor: makeFactorChange(
        before.totalDamageFactor,
        after.totalDamageFactor,
      ),
    },
  };
}

export function compareWithDeltas(
  baseInputs: BaseInputs,
  gearTotals: GearTotals,
  deltas: DeltaRow[],
  globalIndependentMultiplierFactor = 1,
  equipmentIndependentMultiplierFactor = 1,
): ComparisonBreakdown {
  const before = calculateDamageBreakdown(
    baseInputs,
    gearTotals,
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
  );
  const after = calculateDamageBreakdown(
    baseInputs,
    applyDeltasToGearTotals(gearTotals, deltas),
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
  );

  return compareBreakdowns(before, after);
}

export function compareWithReplacement(
  baseInputs: BaseInputs,
  equipment: EquipmentItem[],
  replacedItemId: string,
  candidate: EquipmentItem,
  globalIndependentMultiplierFactor = 1,
): ComparisonBreakdown {
  const before = calculateEquipmentBreakdown(
    baseInputs,
    equipment,
    globalIndependentMultiplierFactor,
  );
  const nextEquipment = equipment.map((item) =>
    item.id === replacedItemId ? { ...candidate, enabled: true } : item,
  );
  const after = calculateEquipmentBreakdown(
    baseInputs,
    nextEquipment,
    globalIndependentMultiplierFactor,
  );

  return compareBreakdowns(before, after);
}

export function calculateMarginalGains(
  baseInputs: BaseInputs,
  gearTotals: GearTotals,
  deltasByType: TypicalRolls,
  globalIndependentMultiplierFactor = 1,
  equipmentIndependentMultiplierFactor = 1,
): MarginalGain[] {
  const before = calculateDamageBreakdown(
    baseInputs,
    gearTotals,
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
  );

  return AFFIX_TYPES.map((type) => {
    const delta = deltasByType[type];
    const afterTotals = addAffixToGearTotals({ ...gearTotals }, type, delta);
    const after = calculateDamageBreakdown(
      baseInputs,
      afterTotals,
      globalIndependentMultiplierFactor,
      equipmentIndependentMultiplierFactor,
    );

    return {
      type,
      delta,
      relativeChange: relativeChange(
        before.totalDamageFactor,
        after.totalDamageFactor,
      ),
      currentBucketTotal: getCurrentBucketTotal(before, type),
      currentFactor: getCurrentFactor(before, type),
    };
  }).sort((a, b) => b.relativeChange - a.relativeChange);
}

export function calculateUnitMarginalGains(
  baseInputs: BaseInputs,
  gearTotals: GearTotals,
  globalIndependentMultiplierFactor = 1,
  equipmentIndependentMultiplierFactor = 1,
): MarginalGain[] {
  return calculateMarginalGains(
    baseInputs,
    gearTotals,
    {
      critChance: 0.01,
      critDamageMultiplier: 0.01,
      vulnerableDamageMultiplier: 0.01,
      typeAllDamageMultiplier: 0.01,
      mainStat: 100,
      additiveDamage: 1,
      critDamageAdditive: 0.01,
      vulnerableDamageAdditive: 0.01,
      skillRanks: 1,
      weaponDamage: 100,
    },
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
  );
}

export function calculateGlobalIndependentMultiplierFactor(
  rows: GlobalIndependentMultiplier[],
  includeGlobalIndependentMultipliers: boolean,
): number {
  if (!includeGlobalIndependentMultipliers) {
    return 1;
  }

  return rows.reduce((product, row) => {
    if (!row.enabled) {
      return product;
    }

    return product * globalIndependentMultiplierRowFactor(row.valuePercent);
  }, 1);
}

export function globalIndependentMultiplierRowFactor(
  valuePercent: number,
): number {
  return 1 + sanitizeGlobalIndependentMultiplierValue(valuePercent) / 100;
}

export function sanitizeGlobalIndependentMultiplierValue(
  valuePercent: number,
): number {
  const value = Number(valuePercent);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(value, -99.99);
}

export function calculateEquipmentIndependentMultiplierFactor(
  equipment: EquipmentItem[],
): number {
  return equipment.reduce((product, item) => {
    if (!item.enabled) {
      return product;
    }

    return product * calculateItemIndependentMultiplierFactor(item);
  }, 1);
}

export function calculateItemIndependentMultiplierFactor(
  item: EquipmentItem,
): number {
  return (item.itemIndependentMultipliers ?? []).reduce((product, row) => {
    if (!row.enabled) {
      return product;
    }

    return product * itemIndependentMultiplierRowFactor(row.valuePercent);
  }, 1);
}

export function itemIndependentMultiplierRowFactor(
  valuePercent: number,
): number {
  return 1 + sanitizeItemIndependentMultiplierValue(valuePercent) / 100;
}

export function sanitizeItemIndependentMultiplierValue(
  valuePercent: number,
): number {
  const value = Number(valuePercent);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(value, -99.99);
}

export function getCurrentBucketTotal(
  breakdown: DamageBreakdown,
  type: AffixType,
): number {
  switch (type) {
    case "critChance":
      return breakdown.totalCritChance;
    case "mainStat":
      return breakdown.totalMainStat;
    case "critDamageMultiplier":
      return breakdown.totalCritDamageMultiplier;
    case "vulnerableDamageMultiplier":
      return breakdown.totalVulnerableDamageMultiplier;
    case "typeAllDamageMultiplier":
      return breakdown.gearTotals.gearTypeAllDamageMultiplier;
    case "additiveDamage":
      return breakdown.totalGenericAdditive;
    case "critDamageAdditive":
      return breakdown.totalCritDamageAdditive;
    case "vulnerableDamageAdditive":
      return breakdown.totalVulnerableDamageAdditive;
    case "skillRanks":
      return breakdown.totalMainSkillRank;
    case "weaponDamage":
      return breakdown.gearTotals.gearWeaponDamage;
  }
}

export function getCurrentFactor(
  breakdown: DamageBreakdown,
  type: AffixType,
): number {
  switch (type) {
    case "critChance":
    case "critDamageMultiplier":
      return breakdown.critFactor;
    case "mainStat":
      return breakdown.mainStatFactor;
    case "vulnerableDamageMultiplier":
      return breakdown.vulnerableFactor;
    case "typeAllDamageMultiplier":
      return breakdown.typeAllMultiplierFactor;
    case "additiveDamage":
      return breakdown.additiveFactor;
    case "critDamageAdditive":
    case "vulnerableDamageAdditive":
      return breakdown.expectedCombatFactor;
    case "skillRanks":
      return breakdown.skillDamageFactor;
    case "weaponDamage":
      return breakdown.weaponDamageFactor;
  }
}

export function getSkillRankMultiplier(rank: number): number {
  const n = getValidSkillRank(rank);

  return 1 + (n - 1) * 0.1 + Math.floor(n / 5) * 0.05;
}

export function relativeChange(before: number, after: number): number {
  if (before === 0) {
    return after === 0 ? 0 : Number.POSITIVE_INFINITY;
  }

  return after / before - 1;
}

function makeFactorChange(before: number, after: number): FactorChange {
  return {
    before,
    after,
    relativeChange: relativeChange(before, after),
  };
}

function getBaseAverageWeaponDamage(baseInputs: BaseInputs): number {
  const min = Math.max(0, Number(baseInputs.baseWeaponDamageMin) || 0);
  const max = Math.max(0, Number(baseInputs.baseWeaponDamageMax) || 0);

  if (min <= 0 && max <= 0) {
    return 0;
  }

  return (min + max) / 2;
}

function getValidSkillRank(rank: number): number {
  return clamp(Math.round(Number(rank) || 1), 1, 50);
}

function getMainSkillBaseMultiplierFactor(multiplierPercent: number): number {
  const value = Number(multiplierPercent);

  return Number.isFinite(value) && value > 0 ? value / 100 : 1;
}

function sanitizeMultiplierFactor(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function coerceSkillRankAffixValue(value: number): number {
  return Math.max(0, coerceSkillRankDelta(value));
}

function coerceSkillRankDelta(value: number): number {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function calculateStateBreakdown({
  critChance,
  vulnerableUptime,
  totalGenericAdditive,
  totalCritDamageAdditive,
  totalVulnerableDamageAdditive,
  baseCritMultiplier,
  baseVulnerableMultiplier,
  totalCritDamageMultiplier,
  totalVulnerableDamageMultiplier,
}: {
  critChance: number;
  vulnerableUptime: number;
  totalGenericAdditive: number;
  totalCritDamageAdditive: number;
  totalVulnerableDamageAdditive: number;
  baseCritMultiplier: number;
  baseVulnerableMultiplier: number;
  totalCritDamageMultiplier: number;
  totalVulnerableDamageMultiplier: number;
}): StateBreakdown[] {
  return [
    { crit: false, vulnerable: false },
    { crit: true, vulnerable: false },
    { crit: false, vulnerable: true },
    { crit: true, vulnerable: true },
  ].map(({ crit, vulnerable }) => {
    const probability =
      (crit ? critChance : 1 - critChance) *
      (vulnerable ? vulnerableUptime : 1 - vulnerableUptime);
    const additiveFactor =
      1 +
      totalGenericAdditive +
      (crit ? totalCritDamageAdditive : 0) +
      (vulnerable ? totalVulnerableDamageAdditive : 0);
    const critMultiplier = crit
      ? baseCritMultiplier * (1 + totalCritDamageMultiplier)
      : 1;
    const vulnerableMultiplier = vulnerable
      ? baseVulnerableMultiplier * (1 + totalVulnerableDamageMultiplier)
      : 1;
    const contribution =
      probability * additiveFactor * critMultiplier * vulnerableMultiplier;

    return {
      crit,
      vulnerable,
      probability,
      additiveFactor,
      critMultiplier,
      vulnerableMultiplier,
      contribution,
    };
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
