export const APP_VERSION = 1;

export type BuiltInAffixType =
  | "critChance"
  | "mainStat"
  | "critDamageMultiplier"
  | "vulnerableDamageMultiplier"
  | "typeAllDamageMultiplier"
  | "additiveDamage"
  | "critDamageAdditive"
  | "vulnerableDamageAdditive"
  | "dotDamageAdditive"
  | "dotDamageMultiplier"
  | "skillRanks"
  | "weaponDamage";

export type AffixType = BuiltInAffixType | "customStat";
export type PrimaryDamageType = "direct" | "dot";
export type IndependentMultiplierTarget = "all" | "crit" | "vulnerable" | "dot";
export type AffixVisibilityMap = Record<string, boolean>;
export type AffixVisibilityPreset = "all" | "direct" | "dot";
export type AffixCategory =
  | "basic"
  | "direct"
  | "vulnerable"
  | "dot"
  | "general"
  | "custom";

export interface BaseInputs {
  primaryDamageType: PrimaryDamageType;
  baseCritChance: number;
  vulnerableUptime: number;
  baseMainStat: number;
  mainStatCoefficient: number;
  baseAdditivePool: number;
  baseCritDamageMultiplier: number;
  baseVulnerableDamageMultiplier: number;
  baseCritDamageAdditive: number;
  baseVulnerableDamageAdditive: number;
  baseDotMultiplier: number;
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
  customStatId?: string;
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
  target: IndependentMultiplierTarget;
}

export interface ItemIndependentMultiplier {
  id: string;
  enabled: boolean;
  name: string;
  valuePercent: number;
  target: IndependentMultiplierTarget;
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
  gearDotDamageAdditive: number;
  gearDotDamageMultiplier: number;
  gearSkillRanks: number;
  gearWeaponDamage: number;
}

export interface CustomPanelStat {
  id: string;
  enabled: boolean;
  name: string;
  affixLabel: string;
  baseValue: number;
  affixValueScale: number;
}

export type CustomDamageRuleOutput =
  | "genericAdditive"
  | "critDamageAdditive"
  | "vulnerableDamageAdditive"
  | "independentMultiplier";

export interface CustomDamageRule {
  id: string;
  enabled: boolean;
  name: string;
  sourceCustomStatId: string;
  percentPerPoint: number;
  output: CustomDamageRuleOutput;
  independentMultiplierTarget?: IndependentMultiplierTarget;
}

export interface CustomPanelStatBreakdown {
  id: string;
  enabled: boolean;
  name: string;
  affixLabel: string;
  baseValue: number;
  affixValueScale: number;
  effectiveAffixTotal: number;
  finalValue: number;
}

export interface CustomDamageRuleBreakdown {
  id: string;
  enabled: boolean;
  name: string;
  sourceCustomStatId: string;
  sourceValue: number;
  percentPerPoint: number;
  rulePercent: number;
  output: CustomDamageRuleOutput;
  effectFactor: number;
  independentMultiplierTarget?: IndependentMultiplierTarget;
}

export interface IndependentMultiplierFactors {
  all: number;
  crit: number;
  vulnerable: number;
  dot: number;
}

export interface CustomRuleOutputs {
  genericAdditive: number;
  critDamageAdditive: number;
  vulnerableDamageAdditive: number;
  independentMultiplierFactor: number;
  independentMultiplierFactors: IndependentMultiplierFactors;
  rules: CustomDamageRuleBreakdown[];
}

export interface CustomCalculationContext {
  customPanelStats?: CustomPanelStat[];
  customDamageRules?: CustomDamageRule[];
  customAffixTotals?: Record<string, number>;
  customStatReferenceValues?: Record<string, number>;
}

export interface StateBreakdown {
  mode?: PrimaryDamageType;
  crit: boolean;
  vulnerable: boolean;
  probability: number;
  additiveFactor: number;
  critMultiplier: number;
  vulnerableMultiplier: number;
  dotMultiplier?: number;
  independentMultiplier: number;
  contribution: number;
}

export interface DamageBreakdown {
  primaryDamageType: PrimaryDamageType;
  mainStatFactor: number;
  critFactor: number;
  vulnerableFactor: number;
  typeAllMultiplierFactor: number;
  additiveFactor: number;
  dotTypeFactor: number;
  weaponDamageFactor: number;
  skillDamageFactor: number;
  globalIndependentMultiplierFactor: number;
  equipmentIndependentMultiplierFactor: number;
  customIndependentMultiplierFactor: number;
  globalIndependentMultiplierFactors: IndependentMultiplierFactors;
  equipmentIndependentMultiplierFactors: IndependentMultiplierFactors;
  customIndependentMultiplierFactors: IndependentMultiplierFactors;
  combinedIndependentMultiplierFactors: IndependentMultiplierFactors;
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
  totalDotDamageAdditive: number;
  totalDotDamageMultiplier: number;
  totalGenericAdditive: number;
  customGenericAdditive: number;
  customCritDamageAdditive: number;
  customVulnerableDamageAdditive: number;
  customPanelStats: CustomPanelStatBreakdown[];
  customDamageRules: CustomDamageRuleBreakdown[];
  stateBreakdown: StateBreakdown[];
  gearTotals: GearTotals;
}

export interface DeltaRow {
  id: string;
  type: AffixType;
  customStatId?: string;
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
  dotDamageAdditive: number;
  dotDamageMultiplier: number;
  skillRanks: number;
  weaponDamage: number;
}

export interface AppState {
  version: 1;
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  quickDeltas: DeltaRow[];
  typicalRolls: TypicalRolls;
  affixVisibility: AffixVisibilityMap;
  customStatReferenceValues: Record<string, number>;
  customPanelStats: CustomPanelStat[];
  customDamageRules: CustomDamageRule[];
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
    dotTypeFactor: FactorChange;
    weaponDamageFactor: FactorChange;
    skillDamageFactor: FactorChange;
    globalIndependentMultiplierFactor: FactorChange;
    equipmentIndependentMultiplierFactor: FactorChange;
    customIndependentMultiplierFactor: FactorChange;
    expectedCombatFactor: FactorChange;
    totalDamageFactor: FactorChange;
  };
}

export interface MarginalGain {
  type: AffixType;
  customStatId?: string;
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
  globalIndependentMultiplierFactor?: number | IndependentMultiplierFactors;
  deltas?: DeltaRow[];
  customContext?: CustomCalculationContext;
}

export interface CandidateCapstoneRecommendation {
  affix: Affix;
  value: number;
  gain: number;
  isCurrent: boolean;
}

export const AFFIX_TYPES: BuiltInAffixType[] = [
  "critChance",
  "mainStat",
  "critDamageMultiplier",
  "vulnerableDamageMultiplier",
  "typeAllDamageMultiplier",
  "additiveDamage",
  "critDamageAdditive",
  "vulnerableDamageAdditive",
  "dotDamageAdditive",
  "dotDamageMultiplier",
  "skillRanks",
  "weaponDamage",
];

export const PERCENT_AFFIX_TYPES: BuiltInAffixType[] = [
  "critChance",
  "critDamageMultiplier",
  "vulnerableDamageMultiplier",
  "typeAllDamageMultiplier",
  "additiveDamage",
  "critDamageAdditive",
  "vulnerableDamageAdditive",
  "dotDamageAdditive",
  "dotDamageMultiplier",
];

export const INTEGER_AFFIX_TYPES: BuiltInAffixType[] = ["skillRanks"];

export const DEFAULT_AFFIX_VISIBILITY: AffixVisibilityMap =
  Object.fromEntries(AFFIX_TYPES.map((type) => [type, true]));

export const AFFIX_CATEGORY_BY_TYPE: Record<BuiltInAffixType, AffixCategory> = {
  mainStat: "basic",
  weaponDamage: "basic",
  skillRanks: "basic",
  critChance: "direct",
  critDamageAdditive: "direct",
  critDamageMultiplier: "direct",
  vulnerableDamageAdditive: "vulnerable",
  vulnerableDamageMultiplier: "vulnerable",
  dotDamageAdditive: "dot",
  dotDamageMultiplier: "dot",
  additiveDamage: "general",
  typeAllDamageMultiplier: "general",
};

const DIRECT_COMMON_HIDDEN_AFFIXES = new Set<BuiltInAffixType>([
  "dotDamageAdditive",
  "dotDamageMultiplier",
]);

const DOT_COMMON_HIDDEN_AFFIXES = new Set<BuiltInAffixType>([
  "critChance",
  "critDamageAdditive",
  "critDamageMultiplier",
]);

export const DEFAULT_BASE_INPUTS: BaseInputs = {
  primaryDamageType: "direct",
  baseCritChance: 0.7,
  vulnerableUptime: 0.6,
  baseMainStat: 2500,
  mainStatCoefficient: 0.001,
  baseAdditivePool: 10,
  baseCritDamageMultiplier: 0,
  baseVulnerableDamageMultiplier: 0,
  baseCritDamageAdditive: 0,
  baseVulnerableDamageAdditive: 0,
  baseDotMultiplier: 1,
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
  gearDotDamageAdditive: 0,
  gearDotDamageMultiplier: 0,
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
  dotDamageAdditive: 0.75,
  dotDamageMultiplier: 0.25,
  skillRanks: 4,
  weaponDamage: 286,
};

export const DEFAULT_GLOBAL_INDEPENDENT_MULTIPLIERS: GlobalIndependentMultiplier[] =
  [];

export function isPercentAffix(type: AffixType): boolean {
  return type !== "customStat" && PERCENT_AFFIX_TYPES.includes(type);
}

export function isIntegerAffix(type: AffixType): boolean {
  return type !== "customStat" && INTEGER_AFFIX_TYPES.includes(type);
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

export function createCustomPanelStat(): CustomPanelStat {
  return {
    id: createId("custom-stat"),
    enabled: true,
    name: "",
    affixLabel: "",
    baseValue: 0,
    affixValueScale: 1,
  };
}

export function createCustomDamageRule(
  sourceCustomStatId = "",
): CustomDamageRule {
  return {
    id: createId("custom-rule"),
    enabled: true,
    name: "",
    sourceCustomStatId,
    percentPerPoint: 0,
    output: "independentMultiplier",
    independentMultiplierTarget: "all",
  };
}

export function createGlobalIndependentMultiplier(): GlobalIndependentMultiplier {
  return {
    id: createId("global-multiplier"),
    enabled: true,
    name: "",
    valuePercent: 0,
    target: "all",
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
    target: "all",
  };
}

export function getCustomStatVisibilityKey(customStatId: string): string {
  return `customStat:${customStatId}`;
}

export function normalizeAffixVisibility(
  value: unknown,
  customPanelStats: CustomPanelStat[] = [],
): AffixVisibilityMap {
  const source = isPlainRecord(value) ? value : {};
  const normalized: AffixVisibilityMap = { ...DEFAULT_AFFIX_VISIBILITY };

  AFFIX_TYPES.forEach((type) => {
    normalized[type] = source[type] === false ? false : true;
  });

  customPanelStats.forEach((stat) => {
    const key = getCustomStatVisibilityKey(stat.id);
    normalized[key] = source[key] === false ? false : true;
  });

  return normalized;
}

export function isAffixVisible(
  affixVisibility: AffixVisibilityMap | undefined,
  type: AffixType,
  customStatId?: string,
): boolean {
  const key =
    type === "customStat" && customStatId
      ? getCustomStatVisibilityKey(customStatId)
      : type;

  return affixVisibility?.[key] !== false;
}

export function applyAffixVisibilityPreset(
  preset: AffixVisibilityPreset,
  customPanelStats: CustomPanelStat[] = [],
): AffixVisibilityMap {
  const next: AffixVisibilityMap = {};

  AFFIX_TYPES.forEach((type) => {
    if (preset === "all") {
      next[type] = true;
      return;
    }

    if (preset === "direct") {
      next[type] = !DIRECT_COMMON_HIDDEN_AFFIXES.has(type);
      return;
    }

    next[type] = !DOT_COMMON_HIDDEN_AFFIXES.has(type);
  });

  customPanelStats
    .filter((stat) => stat.enabled !== false)
    .forEach((stat) => {
      next[getCustomStatVisibilityKey(stat.id)] = true;
    });

  return next;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
      if (affix.type === "customStat") {
        return;
      }

      const value = normalizeEquipmentAffix(
        item,
        affix,
        baseInputs.capstoneBonus,
        baseInputs.greaterAffixBonus,
      );
      addAffixToGearTotals(totals, affix.type, value);
    });

    (item.extraAffixes ?? []).forEach((affix) => {
      if (affix.type === "customStat") {
        return;
      }

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

export function aggregateCustomAffixTotals(
  equipment: EquipmentItem[],
  baseInputs: BaseInputs,
  customPanelStats: CustomPanelStat[] = [],
): Record<string, number> {
  const enabledStatIds = getEnabledCustomStatIds(customPanelStats);
  const totals: Record<string, number> = {};

  equipment.forEach((item) => {
    if (!item.enabled) {
      return;
    }

    item.affixes.forEach((affix) => {
      if (affix.type !== "customStat" || !affix.customStatId) {
        return;
      }

      if (!enabledStatIds.has(affix.customStatId)) {
        return;
      }

      totals[affix.customStatId] =
        (totals[affix.customStatId] ?? 0) +
        normalizeEquipmentAffix(
          item,
          affix,
          baseInputs.capstoneBonus,
          baseInputs.greaterAffixBonus,
        );
    });

    (item.extraAffixes ?? []).forEach((affix) => {
      if (affix.type !== "customStat" || !affix.customStatId) {
        return;
      }

      if (!enabledStatIds.has(affix.customStatId)) {
        return;
      }

      totals[affix.customStatId] =
        (totals[affix.customStatId] ?? 0) + sanitizeNumber(affix.value, 0);
    });
  });

  return totals;
}

export function applyDeltasToCustomAffixTotals(
  customAffixTotals: Record<string, number>,
  deltas: DeltaRow[],
  customPanelStats: CustomPanelStat[] = [],
): Record<string, number> {
  const enabledStatIds = getEnabledCustomStatIds(customPanelStats);
  const nextTotals = { ...customAffixTotals };

  deltas.forEach((delta) => {
    if (delta.type !== "customStat" || !delta.customStatId) {
      return;
    }

    if (!enabledStatIds.has(delta.customStatId)) {
      return;
    }

    nextTotals[delta.customStatId] =
      (nextTotals[delta.customStatId] ?? 0) + sanitizeNumber(delta.value, 0);
  });

  return nextTotals;
}

export function calculateCustomPanelStatBreakdowns(
  customPanelStats: CustomPanelStat[] = [],
  customAffixTotals: Record<string, number> = {},
): CustomPanelStatBreakdown[] {
  return customPanelStats.map((stat) => {
    const baseValue = sanitizeNumber(stat.baseValue, 0);
    const affixValueScale = sanitizeFiniteOrDefault(stat.affixValueScale, 1);
    const effectiveAffixTotal = sanitizeNumber(customAffixTotals[stat.id], 0);

    return {
      id: stat.id,
      enabled: stat.enabled !== false,
      name: stat.name ?? "",
      affixLabel: stat.affixLabel ?? "",
      baseValue,
      affixValueScale,
      effectiveAffixTotal,
      finalValue:
        stat.enabled === false
          ? baseValue
          : baseValue + effectiveAffixTotal * affixValueScale,
    };
  });
}

export function calculateCustomRuleOutputs(
  customDamageRules: CustomDamageRule[] = [],
  customPanelStats: CustomPanelStatBreakdown[] = [],
): CustomRuleOutputs {
  const statById = new Map(
    customPanelStats
      .filter((stat) => stat.enabled)
      .map((stat) => [stat.id, stat] as const),
  );

  return customDamageRules.reduce<CustomRuleOutputs>(
    (outputs, rule) => {
      const sourceStat = statById.get(rule.sourceCustomStatId);

      if (rule.enabled === false || !sourceStat) {
        return outputs;
      }

      const percentPerPoint = sanitizeNumber(rule.percentPerPoint, 0);
      const sourceValue = sanitizeNumber(sourceStat.finalValue, 0);
      const rulePercent = sourceValue * percentPerPoint;
      const effectFactor = sanitizeMultiplierFactor(1 + rulePercent / 100);
      const independentMultiplierTarget = normalizeIndependentMultiplierTarget(
        rule.independentMultiplierTarget,
      );
      const breakdown: CustomDamageRuleBreakdown = {
        id: rule.id,
        enabled: true,
        name: rule.name ?? "",
        sourceCustomStatId: rule.sourceCustomStatId,
        sourceValue,
        percentPerPoint,
        rulePercent,
        output: rule.output,
        effectFactor,
        independentMultiplierTarget,
      };

      outputs.rules.push(breakdown);

      switch (rule.output) {
        case "genericAdditive":
          outputs.genericAdditive += rulePercent / 100;
          break;
        case "critDamageAdditive":
          outputs.critDamageAdditive += rulePercent / 100;
          break;
        case "vulnerableDamageAdditive":
          outputs.vulnerableDamageAdditive += rulePercent / 100;
          break;
        case "independentMultiplier":
          outputs.independentMultiplierFactor *= effectFactor;
          outputs.independentMultiplierFactors[independentMultiplierTarget] *=
            effectFactor;
          break;
      }

      return outputs;
    },
    createEmptyCustomRuleOutputs(),
  );
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
  customContext,
}: {
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  itemId: string;
  affixId: string;
  group: AffixGroup;
  customContext?: CustomCalculationContext;
}): number {
  const current = calculateEquipmentBreakdown(
    baseInputs,
    equipment,
    1,
    customContext,
  ).totalDamageFactor;
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
    1,
    customContext,
  ).totalDamageFactor;

  return relativeChange(without, current);
}

export function calculateItemIndependentMultiplierContribution({
  baseInputs,
  equipment,
  itemId,
  multiplierId,
  customContext,
}: {
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  itemId: string;
  multiplierId: string;
  customContext?: CustomCalculationContext;
}): number {
  const current = calculateEquipmentBreakdown(
    baseInputs,
    equipment,
    1,
    customContext,
  ).totalDamageFactor;
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
    1,
    customContext,
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
  customContext,
}: {
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  globalIndependentMultiplierFactor?: number | IndependentMultiplierFactors;
  deltas?: DeltaRow[];
  customContext?: CustomCalculationContext;
}): DamageBreakdown {
  if (deltas.length === 0) {
    return calculateEquipmentBreakdown(
      baseInputs,
      equipment,
      globalIndependentMultiplierFactor,
      customContext,
    );
  }

  const customPanelStats = customContext?.customPanelStats ?? [];
  const customAffixTotals = applyDeltasToCustomAffixTotals(
    aggregateCustomAffixTotals(equipment, baseInputs, customPanelStats),
    deltas,
    customPanelStats,
  );

  return calculateDamageBreakdown(
    baseInputs,
    applyDeltasToGearTotals(aggregateGear(equipment, baseInputs), deltas),
    globalIndependentMultiplierFactor,
    calculateEquipmentIndependentMultiplierFactors(equipment),
    {
      ...customContext,
      customAffixTotals,
    },
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
  customContext,
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
    customContext,
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
    customContext,
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
  customContext,
}: {
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
  replacedItemId: string;
  candidate: EquipmentItem;
  globalIndependentMultiplierFactor?: number | IndependentMultiplierFactors;
  deltas?: DeltaRow[];
  customContext?: CustomCalculationContext;
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
    customContext,
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
        customContext,
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
    case "customStat":
      break;
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
    case "dotDamageAdditive":
      totals.gearDotDamageAdditive += value;
      break;
    case "dotDamageMultiplier":
      totals.gearDotDamageMultiplier += value;
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
  globalIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  equipmentIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  customContext: CustomCalculationContext = {},
): DamageBreakdown {
  const customPanelStats = calculateCustomPanelStatBreakdowns(
    customContext.customPanelStats,
    customContext.customAffixTotals,
  );
  const customRuleOutputs = calculateCustomRuleOutputs(
    customContext.customDamageRules,
    customPanelStats,
  );
  const primaryDamageType = normalizePrimaryDamageType(
    baseInputs.primaryDamageType,
  );
  const totalCritChance = clamp(
    baseInputs.baseCritChance + gearTotals.gearCritChance,
    0,
    baseInputs.critChanceCap,
  );
  const vulnerableUptime = clamp(baseInputs.vulnerableUptime, 0, 1);
  const totalMainStat = baseInputs.baseMainStat + gearTotals.gearMainStat;
  const totalGenericAdditive =
    baseInputs.baseAdditivePool +
    gearTotals.gearAdditiveDamage +
    customRuleOutputs.genericAdditive;
  const totalAdditivePool = totalGenericAdditive;
  const totalCritDamageMultiplier =
    baseInputs.baseCritDamageMultiplier + gearTotals.gearCritDamageMultiplier;
  const totalVulnerableDamageMultiplier =
    baseInputs.baseVulnerableDamageMultiplier +
    gearTotals.gearVulnerableDamageMultiplier;
  const totalCritDamageAdditive =
    baseInputs.baseCritDamageAdditive +
    gearTotals.gearCritDamageAdditive +
    customRuleOutputs.critDamageAdditive;
  const totalVulnerableDamageAdditive =
    baseInputs.baseVulnerableDamageAdditive +
    gearTotals.gearVulnerableDamageAdditive +
    customRuleOutputs.vulnerableDamageAdditive;
  const totalDotDamageAdditive = gearTotals.gearDotDamageAdditive;
  const totalDotDamageMultiplier = gearTotals.gearDotDamageMultiplier;
  const baseDotMultiplier = sanitizePositiveNumber(
    baseInputs.baseDotMultiplier,
    1,
  );
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
  const dotTypeFactor = baseDotMultiplier * (1 + totalDotDamageMultiplier);
  const safeGlobalIndependentMultiplierFactors =
    coerceIndependentMultiplierFactors(globalIndependentMultiplierFactor);
  const safeEquipmentIndependentMultiplierFactors =
    coerceIndependentMultiplierFactors(equipmentIndependentMultiplierFactor);
  const safeCustomIndependentMultiplierFactors =
    sanitizeIndependentMultiplierFactors(
      customRuleOutputs.independentMultiplierFactors,
    );
  const combinedIndependentMultiplierFactors =
    multiplyIndependentMultiplierFactors(
      safeGlobalIndependentMultiplierFactors,
      safeEquipmentIndependentMultiplierFactors,
      safeCustomIndependentMultiplierFactors,
    );
  const stateBreakdown =
    primaryDamageType === "dot"
      ? calculateDotStateBreakdown({
          vulnerableUptime,
          totalGenericAdditive,
          totalDotDamageAdditive,
          totalVulnerableDamageAdditive,
          baseVulnerableMultiplier: baseInputs.baseVulnerableMultiplier,
          totalVulnerableDamageMultiplier,
          dotTypeFactor,
          independentMultiplierFactors: combinedIndependentMultiplierFactors,
        })
      : calculateStateBreakdown({
          critChance: totalCritChance,
          vulnerableUptime,
          totalGenericAdditive,
          totalCritDamageAdditive,
          totalVulnerableDamageAdditive,
          baseCritMultiplier: baseInputs.baseCritMultiplier,
          baseVulnerableMultiplier: baseInputs.baseVulnerableMultiplier,
          totalCritDamageMultiplier,
          totalVulnerableDamageMultiplier,
          independentMultiplierFactors: combinedIndependentMultiplierFactors,
        });
  const expectedCombatFactor = stateBreakdown.reduce(
    (sum, state) => sum + state.contribution,
    0,
  );
  const totalDamageFactor =
    damageBase *
    skillDamageFactor *
    mainStatFactor *
    typeAllMultiplierFactor *
    expectedCombatFactor;

  return {
    primaryDamageType,
    mainStatFactor,
    critFactor,
    vulnerableFactor,
    typeAllMultiplierFactor,
    additiveFactor,
    dotTypeFactor,
    weaponDamageFactor,
    skillDamageFactor,
    globalIndependentMultiplierFactor: safeGlobalIndependentMultiplierFactors.all,
    equipmentIndependentMultiplierFactor:
      safeEquipmentIndependentMultiplierFactors.all,
    customIndependentMultiplierFactor: safeCustomIndependentMultiplierFactors.all,
    globalIndependentMultiplierFactors: safeGlobalIndependentMultiplierFactors,
    equipmentIndependentMultiplierFactors: safeEquipmentIndependentMultiplierFactors,
    customIndependentMultiplierFactors: safeCustomIndependentMultiplierFactors,
    combinedIndependentMultiplierFactors,
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
    totalDotDamageAdditive,
    totalDotDamageMultiplier,
    totalGenericAdditive,
    customGenericAdditive: customRuleOutputs.genericAdditive,
    customCritDamageAdditive: customRuleOutputs.critDamageAdditive,
    customVulnerableDamageAdditive: customRuleOutputs.vulnerableDamageAdditive,
    customPanelStats,
    customDamageRules: customRuleOutputs.rules,
    stateBreakdown,
    gearTotals: { ...gearTotals },
  };
}

export function calculateEquipmentBreakdown(
  baseInputs: BaseInputs,
  equipment: EquipmentItem[],
  globalIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  customContext: CustomCalculationContext = {},
): DamageBreakdown {
  const customPanelStats = customContext.customPanelStats ?? [];

  return calculateDamageBreakdown(
    baseInputs,
    aggregateGear(equipment, baseInputs),
    globalIndependentMultiplierFactor,
    calculateEquipmentIndependentMultiplierFactors(equipment),
    {
      ...customContext,
      customAffixTotals: aggregateCustomAffixTotals(
        equipment,
        baseInputs,
        customPanelStats,
      ),
    },
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
      dotTypeFactor: makeFactorChange(before.dotTypeFactor, after.dotTypeFactor),
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
      customIndependentMultiplierFactor: makeFactorChange(
        before.customIndependentMultiplierFactor,
        after.customIndependentMultiplierFactor,
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
  globalIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  equipmentIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  customContext: CustomCalculationContext = {},
): ComparisonBreakdown {
  const customPanelStats = customContext.customPanelStats ?? [];
  const beforeCustomAffixTotals = customContext.customAffixTotals ?? {};
  const afterCustomAffixTotals = applyDeltasToCustomAffixTotals(
    beforeCustomAffixTotals,
    deltas,
    customPanelStats,
  );
  const before = calculateDamageBreakdown(
    baseInputs,
    gearTotals,
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
    {
      ...customContext,
      customAffixTotals: beforeCustomAffixTotals,
    },
  );
  const after = calculateDamageBreakdown(
    baseInputs,
    applyDeltasToGearTotals(gearTotals, deltas),
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
    {
      ...customContext,
      customAffixTotals: afterCustomAffixTotals,
    },
  );

  return compareBreakdowns(before, after);
}

export function compareWithReplacement(
  baseInputs: BaseInputs,
  equipment: EquipmentItem[],
  replacedItemId: string,
  candidate: EquipmentItem,
  globalIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  customContext: CustomCalculationContext = {},
): ComparisonBreakdown {
  const before = calculateEquipmentBreakdown(
    baseInputs,
    equipment,
    globalIndependentMultiplierFactor,
    customContext,
  );
  const nextEquipment = equipment.map((item) =>
    item.id === replacedItemId ? { ...candidate, enabled: true } : item,
  );
  const after = calculateEquipmentBreakdown(
    baseInputs,
    nextEquipment,
    globalIndependentMultiplierFactor,
    customContext,
  );

  return compareBreakdowns(before, after);
}

export function calculateMarginalGains(
  baseInputs: BaseInputs,
  gearTotals: GearTotals,
  deltasByType: TypicalRolls,
  globalIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  equipmentIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  customContext: CustomCalculationContext = {},
): MarginalGain[] {
  const customPanelStats = customContext.customPanelStats ?? [];
  const beforeCustomAffixTotals = customContext.customAffixTotals ?? {};
  const before = calculateDamageBreakdown(
    baseInputs,
    gearTotals,
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
    {
      ...customContext,
      customAffixTotals: beforeCustomAffixTotals,
    },
  );

  const builtInGains = AFFIX_TYPES.map((type) => {
    const delta = deltasByType[type];
    const afterTotals = addAffixToGearTotals({ ...gearTotals }, type, delta);
    const after = calculateDamageBreakdown(
      baseInputs,
      afterTotals,
      globalIndependentMultiplierFactor,
      equipmentIndependentMultiplierFactor,
      {
        ...customContext,
        customAffixTotals: beforeCustomAffixTotals,
      },
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
  });

  const customGains = customPanelStats
    .filter((stat) => stat.enabled)
    .map((stat) => {
      const delta = customContext.customStatReferenceValues?.[stat.id] ?? 10;
      const afterCustomAffixTotals = {
        ...beforeCustomAffixTotals,
        [stat.id]: (beforeCustomAffixTotals[stat.id] ?? 0) + delta,
      };
      const after = calculateDamageBreakdown(
        baseInputs,
        gearTotals,
        globalIndependentMultiplierFactor,
        equipmentIndependentMultiplierFactor,
        {
          ...customContext,
          customAffixTotals: afterCustomAffixTotals,
        },
      );

      return {
        type: "customStat" as const,
        customStatId: stat.id,
        delta,
        relativeChange: relativeChange(
          before.totalDamageFactor,
          after.totalDamageFactor,
        ),
        currentBucketTotal: getCurrentBucketTotal(before, "customStat", stat.id),
        currentFactor: getCurrentFactor(before, "customStat"),
      };
    });

  return [...builtInGains, ...customGains].sort(
    (a, b) => b.relativeChange - a.relativeChange,
  );
}

export function calculateUnitMarginalGains(
  baseInputs: BaseInputs,
  gearTotals: GearTotals,
  globalIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  equipmentIndependentMultiplierFactor: number | IndependentMultiplierFactors = 1,
  customContext: CustomCalculationContext = {},
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
      dotDamageAdditive: 0.01,
      dotDamageMultiplier: 0.01,
      skillRanks: 1,
      weaponDamage: 100,
    },
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
    {
      ...customContext,
      customStatReferenceValues: Object.fromEntries(
        (customContext.customPanelStats ?? []).map((stat) => [stat.id, 1]),
      ),
    },
  );
}

export function calculateGlobalIndependentMultiplierFactor(
  rows: GlobalIndependentMultiplier[],
  includeGlobalIndependentMultipliers: boolean,
): number {
  return calculateGlobalIndependentMultiplierFactors(
    rows,
    includeGlobalIndependentMultipliers,
  ).all;
}

export function calculateGlobalIndependentMultiplierFactors(
  rows: GlobalIndependentMultiplier[],
  includeGlobalIndependentMultipliers: boolean,
): IndependentMultiplierFactors {
  if (!includeGlobalIndependentMultipliers) {
    return createNeutralIndependentMultiplierFactors();
  }

  return rows.reduce((factors, row) => {
    if (!row.enabled) {
      return factors;
    }

    const target = normalizeIndependentMultiplierTarget(row.target);
    factors[target] *= globalIndependentMultiplierRowFactor(row.valuePercent);
    return factors;
  }, createNeutralIndependentMultiplierFactors());
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
  return calculateEquipmentIndependentMultiplierFactors(equipment).all;
}

export function calculateEquipmentIndependentMultiplierFactors(
  equipment: EquipmentItem[],
): IndependentMultiplierFactors {
  return equipment.reduce((factors, item) => {
    if (!item.enabled) {
      return factors;
    }

    return multiplyIndependentMultiplierFactors(
      factors,
      calculateItemIndependentMultiplierFactors(item),
    );
  }, createNeutralIndependentMultiplierFactors());
}

export function calculateItemIndependentMultiplierFactor(
  item: EquipmentItem,
): number {
  return calculateItemIndependentMultiplierFactors(item).all;
}

export function calculateItemIndependentMultiplierFactors(
  item: EquipmentItem,
): IndependentMultiplierFactors {
  return (item.itemIndependentMultipliers ?? []).reduce((factors, row) => {
    if (!row.enabled) {
      return factors;
    }

    const target = normalizeIndependentMultiplierTarget(row.target);
    factors[target] *= itemIndependentMultiplierRowFactor(row.valuePercent);
    return factors;
  }, createNeutralIndependentMultiplierFactors());
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

export function normalizePrimaryDamageType(
  value: unknown,
): PrimaryDamageType {
  return value === "dot" ? "dot" : "direct";
}

export function normalizeIndependentMultiplierTarget(
  value: unknown,
): IndependentMultiplierTarget {
  return value === "crit" || value === "vulnerable" || value === "dot"
    ? value
    : "all";
}

export function getCurrentBucketTotal(
  breakdown: DamageBreakdown,
  type: AffixType,
  customStatId?: string,
): number {
  switch (type) {
    case "customStat":
      return (
        breakdown.customPanelStats.find((stat) => stat.id === customStatId)
          ?.finalValue ?? 0
      );
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
    case "dotDamageAdditive":
      return breakdown.totalDotDamageAdditive;
    case "dotDamageMultiplier":
      return breakdown.totalDotDamageMultiplier;
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
    case "customStat":
      return breakdown.customIndependentMultiplierFactor;
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
    case "dotDamageAdditive":
    case "dotDamageMultiplier":
      return breakdown.primaryDamageType === "dot"
        ? breakdown.expectedCombatFactor
        : breakdown.dotTypeFactor;
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

function sanitizeIndependentMultiplierFactors(
  factors: IndependentMultiplierFactors,
): IndependentMultiplierFactors {
  return {
    all: sanitizeMultiplierFactor(factors.all),
    crit: sanitizeMultiplierFactor(factors.crit),
    vulnerable: sanitizeMultiplierFactor(factors.vulnerable),
    dot: sanitizeMultiplierFactor(factors.dot),
  };
}

function createNeutralIndependentMultiplierFactors(): IndependentMultiplierFactors {
  return {
    all: 1,
    crit: 1,
    vulnerable: 1,
    dot: 1,
  };
}

function coerceIndependentMultiplierFactors(
  value: number | IndependentMultiplierFactors,
): IndependentMultiplierFactors {
  if (typeof value === "number") {
    return {
      ...createNeutralIndependentMultiplierFactors(),
      all: sanitizeMultiplierFactor(value),
    };
  }

  return sanitizeIndependentMultiplierFactors({
    ...createNeutralIndependentMultiplierFactors(),
    ...value,
  });
}

function multiplyIndependentMultiplierFactors(
  ...factorGroups: IndependentMultiplierFactors[]
): IndependentMultiplierFactors {
  return sanitizeIndependentMultiplierFactors(
    factorGroups.reduce(
      (product, factors) => ({
        all: product.all * factors.all,
        crit: product.crit * factors.crit,
        vulnerable: product.vulnerable * factors.vulnerable,
        dot: product.dot * factors.dot,
      }),
      createNeutralIndependentMultiplierFactors(),
    ),
  );
}

function sanitizePositiveNumber(value: number, fallback: number): number {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) && numberValue > 0
    ? numberValue
    : fallback;
}

function sanitizeNumber(value: number | undefined, fallback: number): number {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function sanitizeFiniteOrDefault(
  value: number | undefined,
  fallback: number,
): number {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function createEmptyCustomRuleOutputs(): CustomRuleOutputs {
  return {
    genericAdditive: 0,
    critDamageAdditive: 0,
    vulnerableDamageAdditive: 0,
    independentMultiplierFactor: 1,
    independentMultiplierFactors: createNeutralIndependentMultiplierFactors(),
    rules: [],
  };
}

function getEnabledCustomStatIds(
  customPanelStats: CustomPanelStat[] = [],
): Set<string> {
  return new Set(
    customPanelStats
      .filter((stat) => stat.enabled !== false)
      .map((stat) => stat.id),
  );
}

function coerceSkillRankAffixValue(value: number): number {
  return Math.max(0, coerceSkillRankDelta(value));
}

function coerceSkillRankDelta(value: number): number {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function calculateDotStateBreakdown({
  vulnerableUptime,
  totalGenericAdditive,
  totalDotDamageAdditive,
  totalVulnerableDamageAdditive,
  baseVulnerableMultiplier,
  totalVulnerableDamageMultiplier,
  dotTypeFactor,
  independentMultiplierFactors,
}: {
  vulnerableUptime: number;
  totalGenericAdditive: number;
  totalDotDamageAdditive: number;
  totalVulnerableDamageAdditive: number;
  baseVulnerableMultiplier: number;
  totalVulnerableDamageMultiplier: number;
  dotTypeFactor: number;
  independentMultiplierFactors: IndependentMultiplierFactors;
}): StateBreakdown[] {
  return [{ vulnerable: false }, { vulnerable: true }].map(({ vulnerable }) => {
    const probability = vulnerable ? vulnerableUptime : 1 - vulnerableUptime;
    const additiveFactor =
      1 +
      totalGenericAdditive +
      totalDotDamageAdditive +
      (vulnerable ? totalVulnerableDamageAdditive : 0);
    const vulnerableMultiplier = vulnerable
      ? baseVulnerableMultiplier * (1 + totalVulnerableDamageMultiplier)
      : 1;
    const independentMultiplier =
      independentMultiplierFactors.all *
      independentMultiplierFactors.dot *
      (vulnerable ? independentMultiplierFactors.vulnerable : 1);
    const contribution =
      probability *
      additiveFactor *
      vulnerableMultiplier *
      dotTypeFactor *
      independentMultiplier;

    return {
      mode: "dot",
      crit: false,
      vulnerable,
      probability,
      additiveFactor,
      critMultiplier: 1,
      vulnerableMultiplier,
      dotMultiplier: dotTypeFactor,
      independentMultiplier,
      contribution,
    };
  });
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
  independentMultiplierFactors,
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
  independentMultiplierFactors: IndependentMultiplierFactors;
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
    const independentMultiplier =
      independentMultiplierFactors.all *
      (crit ? independentMultiplierFactors.crit : 1) *
      (vulnerable ? independentMultiplierFactors.vulnerable : 1);
    const contribution =
      probability *
      additiveFactor *
      critMultiplier *
      vulnerableMultiplier *
      independentMultiplier;

    return {
      mode: "direct",
      crit,
      vulnerable,
      probability,
      additiveFactor,
      critMultiplier,
      vulnerableMultiplier,
      independentMultiplier,
      contribution,
    };
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
