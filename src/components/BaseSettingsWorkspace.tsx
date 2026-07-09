import { useState } from "react";
import {
  AFFIX_TYPES,
  AFFIX_CATEGORY_BY_TYPE,
  AffixCategory,
  AffixVisibilityMap,
  BaseInputs,
  CustomDamageRule,
  CustomDamageRuleOutput,
  CustomPanelStat,
  GlobalIndependentMultiplier,
  IndependentMultiplierTarget,
  PrimaryDamageType,
  TypicalRolls,
  applyAffixVisibilityPreset,
  createCustomDamageRule,
  createCustomPanelStat,
  createGlobalIndependentMultiplier,
  getCustomStatVisibilityKey,
  globalIndependentMultiplierRowFactor,
  isAffixVisible,
  normalizeAffixVisibility,
  sanitizeGlobalIndependentMultiplierValue,
} from "../lib/damageModel";
import { Translation } from "../i18n";
import { getCustomStatDisplayName } from "./affixOptions";
import {
  fromPercentInput,
  formatNumber,
  inputValueForAffix,
  toPercentInput,
  valueFromAffixInput,
} from "./format";

export type ClassPreset =
  | "custom"
  | "barbarian"
  | "druid"
  | "necromancer"
  | "rogue"
  | "sorcerer"
  | "spiritborn"
  | "paladin"
  | "warlock";

interface BaseSettingsWorkspaceProps {
  t: Translation;
  baseInputs: BaseInputs;
  typicalRolls: TypicalRolls;
  affixVisibility: AffixVisibilityMap;
  customStatReferenceValues: Record<string, number>;
  customPanelStats: CustomPanelStat[];
  customDamageRules: CustomDamageRule[];
  customPanelStatFinalValues: Record<string, number>;
  customDamageRuleEffects: Record<string, { rulePercent: number; factor: number }>;
  customIndependentMultiplierFactor: number;
  includeGlobalIndependentMultipliers: boolean;
  globalIndependentMultipliers: GlobalIndependentMultiplier[];
  globalIndependentMultiplierFactor: number;
  autoSaveEnabled: boolean;
  classPreset: ClassPreset;
  onBaseInputsChange: (baseInputs: BaseInputs) => void;
  onTypicalRollsChange: (typicalRolls: TypicalRolls) => void;
  onAffixVisibilityChange: (affixVisibility: AffixVisibilityMap) => void;
  onCustomStatReferenceValuesChange: (values: Record<string, number>) => void;
  onCustomPanelStatsChange: (stats: CustomPanelStat[]) => void;
  onCustomDamageRulesChange: (rules: CustomDamageRule[]) => void;
  onIncludeGlobalIndependentMultipliersChange: (enabled: boolean) => void;
  onGlobalIndependentMultipliersChange: (
    rows: GlobalIndependentMultiplier[],
  ) => void;
  onAutoSaveEnabledChange: (enabled: boolean) => void;
  onClassPresetChange: (classPreset: ClassPreset) => void;
}

export const classPresets: { key: ClassPreset; coefficient: number | null }[] = [
  { key: "custom", coefficient: null },
  { key: "barbarian", coefficient: 0.001 },
  { key: "druid", coefficient: 0.00125 },
  { key: "necromancer", coefficient: 0.00125 },
  { key: "rogue", coefficient: 0.0011 },
  { key: "sorcerer", coefficient: 0.00125 },
  { key: "spiritborn", coefficient: 0.00125 },
  { key: "paladin", coefficient: null },
  { key: "warlock", coefficient: null },
];

export function BaseSettingsWorkspace({
  t,
  baseInputs,
  typicalRolls,
  affixVisibility,
  customStatReferenceValues,
  customPanelStats,
  customDamageRules,
  customPanelStatFinalValues,
  customDamageRuleEffects,
  customIndependentMultiplierFactor,
  includeGlobalIndependentMultipliers,
  globalIndependentMultipliers,
  globalIndependentMultiplierFactor,
  autoSaveEnabled,
  classPreset,
  onBaseInputsChange,
  onTypicalRollsChange,
  onAffixVisibilityChange,
  onCustomStatReferenceValuesChange,
  onCustomPanelStatsChange,
  onCustomDamageRulesChange,
  onIncludeGlobalIndependentMultipliersChange,
  onGlobalIndependentMultipliersChange,
  onAutoSaveEnabledChange,
  onClassPresetChange,
}: BaseSettingsWorkspaceProps) {
  const [globalMultipliersExpanded, setGlobalMultipliersExpanded] =
    useState(false);
  const [customPanelStatsExpanded, setCustomPanelStatsExpanded] =
    useState(false);
  const [customDamageRulesExpanded, setCustomDamageRulesExpanded] =
    useState(false);
  const [affixVisibilityExpanded, setAffixVisibilityExpanded] =
    useState(false);
  const updatePercentField = (
    field:
      | "baseCritChance"
      | "vulnerableUptime"
      | "baseAdditivePool"
      | "baseCritDamageMultiplier"
      | "baseVulnerableDamageMultiplier"
      | "baseCritDamageAdditive"
      | "baseVulnerableDamageAdditive"
      | "critChanceCap"
      | "capstoneBonus"
      | "greaterAffixBonus",
    value: number,
  ) => {
    onBaseInputsChange({ ...baseInputs, [field]: fromPercentInput(value) });
  };

  const updateNumberField = (
    field:
      | "baseMainStat"
      | "baseWeaponDamageMin"
      | "baseWeaponDamageMax"
      | "baseMainSkillRank"
      | "mainSkillBaseMultiplier"
      | "baseDotMultiplier"
      | "mainStatCoefficient"
      | "baseCritMultiplier"
      | "baseVulnerableMultiplier"
      | "defaultTargetQuality",
    value: number,
  ) => {
    onBaseInputsChange({ ...baseInputs, [field]: value });
  };

  return (
    <div className="baseSettingsWorkspace">
      <section className="panel">
        <div className="panelHeader">
          <h2>{t.settings.commonInputs}</h2>
        </div>
        <div className="inputGrid">
          <PercentField
            label={t.baseFields.baseCritChance}
            value={baseInputs.baseCritChance}
            onChange={(value) => updatePercentField("baseCritChance", value)}
          />
          <PercentField
            label={t.baseFields.vulnerableUptime}
            value={baseInputs.vulnerableUptime}
            onChange={(value) => updatePercentField("vulnerableUptime", value)}
          />
          <PercentField
            label={t.baseFields.baseAdditivePool}
            value={baseInputs.baseAdditivePool}
            onChange={(value) => updatePercentField("baseAdditivePool", value)}
          />
          <PercentField
            label={t.baseFields.baseCritDamageMultiplier}
            value={baseInputs.baseCritDamageMultiplier}
            onChange={(value) =>
              updatePercentField("baseCritDamageMultiplier", value)
            }
          />
          <PercentField
            label={t.baseFields.baseVulnerableDamageMultiplier}
            value={baseInputs.baseVulnerableDamageMultiplier}
            onChange={(value) =>
              updatePercentField("baseVulnerableDamageMultiplier", value)
            }
          />
          <PercentField
            label={t.baseFields.baseCritDamageAdditive}
            value={baseInputs.baseCritDamageAdditive}
            onChange={(value) =>
              updatePercentField("baseCritDamageAdditive", value)
            }
          />
          <PercentField
            label={t.baseFields.baseVulnerableDamageAdditive}
            value={baseInputs.baseVulnerableDamageAdditive}
            onChange={(value) =>
              updatePercentField("baseVulnerableDamageAdditive", value)
            }
          />
          <NumberField
            label={t.baseFields.baseMainStat}
            value={baseInputs.baseMainStat}
            onChange={(value) => updateNumberField("baseMainStat", value)}
          />
          <WeaponDamageRangeField
            label={t.baseFields.baseWeaponDamage}
            title={t.baseFields.baseWeaponDamageHelp}
            minValue={baseInputs.baseWeaponDamageMin}
            maxValue={baseInputs.baseWeaponDamageMax}
            onMinChange={(value) => updateNumberField("baseWeaponDamageMin", value)}
            onMaxChange={(value) => updateNumberField("baseWeaponDamageMax", value)}
          />
          <NumberField
            label={t.baseFields.baseMainSkillRank}
            title={t.baseFields.baseMainSkillRankHelp}
            value={baseInputs.baseMainSkillRank}
            onChange={(value) => updateNumberField("baseMainSkillRank", value)}
          />
          <NumberField
            label={t.baseFields.mainSkillBaseMultiplier}
            title={t.baseFields.mainSkillBaseMultiplierHelp}
            value={baseInputs.mainSkillBaseMultiplier}
            onChange={(value) =>
              updateNumberField("mainSkillBaseMultiplier", value)
            }
          />
          <label className="field" title={t.baseFields.primaryDamageTypeHelp}>
            <span>{t.baseFields.primaryDamageType}</span>
            <select
              value={baseInputs.primaryDamageType}
              onChange={(event) =>
                onBaseInputsChange({
                  ...baseInputs,
                  primaryDamageType: event.target.value as PrimaryDamageType,
                })
              }
            >
              <option value="direct">{t.baseFields.directDamage}</option>
              <option value="dot">{t.baseFields.damageOverTime}</option>
            </select>
          </label>
          <NumberField
            label={t.baseFields.baseDotMultiplier}
            title={t.baseFields.baseDotMultiplierHelp}
            value={baseInputs.baseDotMultiplier}
            onChange={(value) => updateNumberField("baseDotMultiplier", value)}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>{t.settings.classAndMainStat}</h2>
            <p>{t.settings.mainStatCoefficientHelp}</p>
          </div>
        </div>
        <div className="inputGrid">
          <label className="field">
            <span>{t.settings.classPreset}</span>
            <select
              value={classPreset}
              onChange={(event) => {
                const nextPreset = event.target.value as ClassPreset;
                const preset = classPresets.find(
                  (current) => current.key === nextPreset,
                );
                onClassPresetChange(nextPreset);
                if (preset?.coefficient !== null && preset?.coefficient !== undefined) {
                  updateNumberField("mainStatCoefficient", preset.coefficient);
                }
              }}
            >
              {classPresets.map((preset) => (
                <option value={preset.key} key={preset.key}>
                  {t.settings.classes[preset.key]}
                </option>
              ))}
            </select>
          </label>
          <label className="field" title={t.settings.mainStatCoefficientHelp}>
            <span>{t.baseFields.mainStatCoefficient}</span>
            <input
              type="number"
              step="0.00001"
              value={baseInputs.mainStatCoefficient}
              onChange={(event) => {
                onClassPresetChange("custom");
                updateNumberField(
                  "mainStatCoefficient",
                  Number(event.target.value),
                );
              }}
            />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <h2>{t.settings.referenceAffixValues}</h2>
            <p>{t.settings.referenceAffixHelp}</p>
          </div>
        </div>
        <div className="typicalGrid">
          {AFFIX_TYPES.map((type) => (
            <label className="field" key={type}>
              <span className="truncate" title={t.settings.referenceLabels[type]}>
                {t.settings.referenceLabels[type]}
              </span>
              <input
                type="number"
                value={inputValueForAffix(type, typicalRolls[type])}
                onChange={(event) =>
                  onTypicalRollsChange({
                    ...typicalRolls,
                    [type]: valueFromAffixInput(type, Number(event.target.value)),
                  })
                }
              />
            </label>
          ))}
          {customPanelStats
            .filter((stat) => stat.enabled !== false)
            .map((stat) => (
              <label className="field" key={stat.id}>
                <span className="truncate" title={formatCustomReferenceLabel(t, stat)}>
                  {formatCustomReferenceLabel(t, stat)}
                </span>
                <input
                  type="number"
                  value={customStatReferenceValues[stat.id] ?? 10}
                  onChange={(event) =>
                    onCustomStatReferenceValuesChange({
                      ...customStatReferenceValues,
                      [stat.id]: Number(event.target.value),
                    })
                  }
                />
              </label>
            ))}
        </div>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <h2>{t.settings.gameDefaultsAdvanced}</h2>
        </div>
        <div className="inputGrid">
          <PercentField
            label={t.baseFields.capstoneBonus}
            title={t.formula.tooltips.capstoneBonus}
            value={baseInputs.capstoneBonus}
            onChange={(value) => updatePercentField("capstoneBonus", value)}
          />
          <PercentField
            label={t.baseFields.greaterAffixBonus}
            title={t.baseFields.greaterAffixBonusHelp}
            value={baseInputs.greaterAffixBonus}
            onChange={(value) => updatePercentField("greaterAffixBonus", value)}
          />
          <PercentField
            label={t.baseFields.critChanceCap}
            value={baseInputs.critChanceCap}
            onChange={(value) => updatePercentField("critChanceCap", value)}
          />
          <NumberField
            label={t.baseFields.baseCritMultiplier}
            value={baseInputs.baseCritMultiplier}
            onChange={(value) => updateNumberField("baseCritMultiplier", value)}
          />
          <NumberField
            label={t.baseFields.baseVulnerableMultiplier}
            value={baseInputs.baseVulnerableMultiplier}
            onChange={(value) =>
              updateNumberField("baseVulnerableMultiplier", value)
            }
          />
          <NumberField
            label={t.baseFields.defaultTargetQuality}
            value={baseInputs.defaultTargetQuality}
            onChange={(value) => updateNumberField("defaultTargetQuality", value)}
          />
          <label className="checkField">
            <input
              type="checkbox"
              checked={baseInputs.includeWeaponDamage}
              onChange={(event) =>
                onBaseInputsChange({
                  ...baseInputs,
                  includeWeaponDamage: event.target.checked,
                })
              }
            />
            <span title={t.baseFields.includeWeaponDamageHelp}>
              {t.baseFields.includeWeaponDamage}
            </span>
          </label>
          <label className="checkField">
            <input
              type="checkbox"
              checked={baseInputs.includeSkillRankDamage}
              onChange={(event) =>
                onBaseInputsChange({
                  ...baseInputs,
                  includeSkillRankDamage: event.target.checked,
                })
              }
            />
            <span title={t.baseFields.includeSkillRankDamageHelp}>
              {t.baseFields.includeSkillRankDamage}
            </span>
          </label>
          <label className="checkField">
            <input
              type="checkbox"
              checked={baseInputs.includeSkillBaseMultiplier}
              onChange={(event) =>
                onBaseInputsChange({
                  ...baseInputs,
                  includeSkillBaseMultiplier: event.target.checked,
                })
              }
            />
            <span title={t.baseFields.includeSkillBaseMultiplierHelp}>
              {t.baseFields.includeSkillBaseMultiplier}
            </span>
          </label>
          <label className="checkField">
            <input
              type="checkbox"
              checked={includeGlobalIndependentMultipliers}
              onChange={(event) =>
                onIncludeGlobalIndependentMultipliersChange(event.target.checked)
              }
            />
            <span title={t.settings.includeGlobalIndependentMultipliersHelp}>
              {t.settings.includeGlobalIndependentMultipliers}
            </span>
          </label>
          <label className="checkField">
            <input
              type="checkbox"
              checked={baseInputs.treatTypeAllAsOneBucket}
              onChange={(event) =>
                onBaseInputsChange({
                  ...baseInputs,
                  treatTypeAllAsOneBucket: event.target.checked,
                })
              }
            />
            <span>{t.baseFields.treatTypeAllAsOneBucket}</span>
          </label>
          <label className="checkField">
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(event) => onAutoSaveEnabledChange(event.target.checked)}
            />
            <span>{t.settings.autoSaveCurrentBuild}</span>
          </label>
        </div>
      </section>

      <section className="panel globalMultiplierPanel">
        <button
          type="button"
          className="globalMultiplierSummary"
          onClick={() => setAffixVisibilityExpanded((expanded) => !expanded)}
          title={affixVisibilityExpanded ? t.settings.collapse : t.settings.expand}
        >
          <span>
            {formatAffixVisibilitySummary(
              t,
              affixVisibility,
              customPanelStats,
            )}
          </span>
          <strong>
            {affixVisibilityExpanded ? t.settings.collapse : t.settings.expand}
          </strong>
        </button>

        {affixVisibilityExpanded && (
          <div className="globalMultiplierContent">
            <p>{t.settings.affixVisibilityHelp}</p>
            <AffixVisibilityTable
              t={t}
              rowsVisibility={affixVisibility}
              customPanelStats={customPanelStats}
              onChange={onAffixVisibilityChange}
            />
          </div>
        )}
      </section>

      <section className="panel globalMultiplierPanel">
        <button
          type="button"
          className="globalMultiplierSummary"
          onClick={() => setGlobalMultipliersExpanded((expanded) => !expanded)}
          title={
            globalMultipliersExpanded
              ? t.settings.collapse
              : t.settings.expand
          }
        >
          <span>
            {formatGlobalMultiplierSummary(
              t,
              globalIndependentMultipliers.length,
              includeGlobalIndependentMultipliers
                ? globalIndependentMultiplierFactor
                : 1,
            )}
          </span>
          <strong>
            {globalMultipliersExpanded ? t.settings.collapse : t.settings.expand}
          </strong>
        </button>

        {globalMultipliersExpanded && (
          <div className="globalMultiplierContent">
            <p>{t.settings.globalIndependentMultipliersHelp}</p>
            <GlobalIndependentMultiplierTable
              t={t}
              rows={globalIndependentMultipliers}
              onChange={onGlobalIndependentMultipliersChange}
            />
          </div>
        )}
      </section>

      <section className="panel globalMultiplierPanel">
        <button
          type="button"
          className="globalMultiplierSummary"
          onClick={() => setCustomPanelStatsExpanded((expanded) => !expanded)}
          title={
            customPanelStatsExpanded ? t.settings.collapse : t.settings.expand
          }
        >
          <span>
            {t.settings.customPanelStats}: {customPanelStats.length}
          </span>
          <strong>
            {customPanelStatsExpanded ? t.settings.collapse : t.settings.expand}
          </strong>
        </button>

        {customPanelStatsExpanded && (
          <div className="globalMultiplierContent">
            <p>{t.settings.customPanelStatsHelp}</p>
            <CustomPanelStatsTable
              t={t}
              rows={customPanelStats}
              finalValues={customPanelStatFinalValues}
              onChange={onCustomPanelStatsChange}
            />
          </div>
        )}
      </section>

      <section className="panel globalMultiplierPanel">
        <button
          type="button"
          className="globalMultiplierSummary"
          onClick={() => setCustomDamageRulesExpanded((expanded) => !expanded)}
          title={
            customDamageRulesExpanded ? t.settings.collapse : t.settings.expand
          }
        >
          <span>
            {t.settings.customDamageRules}: {customDamageRules.length}, x
            {formatNumber(customIndependentMultiplierFactor, 3)}
          </span>
          <strong>
            {customDamageRulesExpanded ? t.settings.collapse : t.settings.expand}
          </strong>
        </button>

        {customDamageRulesExpanded && (
          <div className="globalMultiplierContent">
            <p>{t.settings.customDamageRulesHelp}</p>
            <CustomDamageRulesTable
              t={t}
              rows={customDamageRules}
              customPanelStats={customPanelStats}
              effects={customDamageRuleEffects}
              onChange={onCustomDamageRulesChange}
            />
          </div>
        )}
      </section>
    </div>
  );
}

function CustomPanelStatsTable({
  t,
  rows,
  finalValues,
  onChange,
}: {
  t: Translation;
  rows: CustomPanelStat[];
  finalValues: Record<string, number>;
  onChange: (rows: CustomPanelStat[]) => void;
}) {
  const updateRow = (row: CustomPanelStat) => {
    onChange(rows.map((current) => (current.id === row.id ? row : current)));
  };
  const moveRow = (rowId: string, direction: "up" | "down") =>
    moveTableRow(rows, rowId, direction, onChange);

  return (
    <div className="globalMultiplierTable customConfigTable">
      <div className="globalMultiplierRow customPanelStatRow globalMultiplierHeader">
        <span>{t.settings.enabled}</span>
        <span>{t.settings.name}</span>
        <span>{t.settings.affixLabel}</span>
        <span>{t.settings.baseValue}</span>
        <span>{t.settings.affixValueScale}</span>
        <span>{t.settings.finalValue}</span>
        <span>{t.settings.actions}</span>
      </div>
      {rows.map((row, index) => (
        <div className="globalMultiplierRow customPanelStatRow" key={row.id}>
          <label className="compactCheck">
            <input
              type="checkbox"
              checked={row.enabled}
              onChange={(event) =>
                updateRow({ ...row, enabled: event.target.checked })
              }
            />
            <span className="srOnly">{t.settings.enabled}</span>
          </label>
          <input
            value={row.name}
            placeholder={t.settings.customPanelStat}
            onChange={(event) => updateRow({ ...row, name: event.target.value })}
          />
          <input
            value={row.affixLabel}
            placeholder={t.settings.affixLabel}
            onChange={(event) =>
              updateRow({ ...row, affixLabel: event.target.value })
            }
          />
          <input
            type="number"
            value={row.baseValue}
            onChange={(event) =>
              updateRow({ ...row, baseValue: Number(event.target.value) })
            }
          />
          <input
            type="number"
            value={row.affixValueScale}
            onChange={(event) =>
              updateRow({ ...row, affixValueScale: Number(event.target.value) })
            }
          />
          <strong>{formatNumber(finalValues[row.id] ?? row.baseValue, 2)}</strong>
          <RowActions
            t={t}
            index={index}
            rowCount={rows.length}
            onMoveUp={() => moveRow(row.id, "up")}
            onMoveDown={() => moveRow(row.id, "down")}
            onDelete={() => onChange(rows.filter((current) => current.id !== row.id))}
          />
        </div>
      ))}
      <button
        type="button"
        className="secondaryButton"
        onClick={() => onChange([...rows, createCustomPanelStat()])}
      >
        {t.settings.addCustomPanelStat}
      </button>
    </div>
  );
}

const customDamageRuleOutputs: CustomDamageRuleOutput[] = [
  "genericAdditive",
  "critDamageAdditive",
  "vulnerableDamageAdditive",
  "independentMultiplier",
];

function CustomDamageRulesTable({
  t,
  rows,
  customPanelStats,
  effects,
  onChange,
}: {
  t: Translation;
  rows: CustomDamageRule[];
  customPanelStats: CustomPanelStat[];
  effects: Record<string, { rulePercent: number; factor: number }>;
  onChange: (rows: CustomDamageRule[]) => void;
}) {
  const enabledStats = customPanelStats.filter((stat) => stat.enabled !== false);
  const firstEnabledStatId = enabledStats[0]?.id ?? "";
  const updateRow = (row: CustomDamageRule) => {
    onChange(rows.map((current) => (current.id === row.id ? row : current)));
  };
  const moveRow = (rowId: string, direction: "up" | "down") =>
    moveTableRow(rows, rowId, direction, onChange);

  return (
    <div className="globalMultiplierTable customConfigTable">
      <div className="globalMultiplierRow customDamageRuleRow globalMultiplierHeader">
        <span>{t.settings.enabled}</span>
        <span>{t.settings.name}</span>
        <span>{t.settings.sourceCustomStat}</span>
        <span>{t.settings.damagePerPoint}</span>
        <span>{t.settings.outputType}</span>
        <span>{t.settings.independentMultiplierTarget}</span>
        <span>{t.settings.currentEffect}</span>
        <span>{t.settings.actions}</span>
      </div>
      {rows.map((row, index) => (
        <div className="globalMultiplierRow customDamageRuleRow" key={row.id}>
          <label className="compactCheck">
            <input
              type="checkbox"
              checked={row.enabled}
              onChange={(event) =>
                updateRow({ ...row, enabled: event.target.checked })
              }
            />
            <span className="srOnly">{t.settings.enabled}</span>
          </label>
          <input
            value={row.name}
            placeholder={t.settings.customDamageRules}
            onChange={(event) => updateRow({ ...row, name: event.target.value })}
          />
          <select
            value={row.sourceCustomStatId}
            onChange={(event) =>
              updateRow({ ...row, sourceCustomStatId: event.target.value })
            }
          >
            {!enabledStats.some((stat) => stat.id === row.sourceCustomStatId) && (
              <option value={row.sourceCustomStatId}>
                {t.settings.invalidCustomStat}
              </option>
            )}
            {enabledStats.map((stat) => (
              <option value={stat.id} key={stat.id}>
                {getCustomStatDisplayName(t, customPanelStats, stat.id)}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={row.percentPerPoint}
            onChange={(event) =>
              updateRow({ ...row, percentPerPoint: Number(event.target.value) })
            }
          />
          <select
            value={row.output}
            onChange={(event) =>
              updateRow({
                ...row,
                output: event.target.value as CustomDamageRuleOutput,
              })
            }
          >
            {customDamageRuleOutputs.map((output) => (
              <option value={output} key={output}>
                {getOutputLabel(t, output)}
              </option>
            ))}
          </select>
          {row.output === "independentMultiplier" ? (
            <select
              value={row.independentMultiplierTarget ?? "all"}
              title={t.settings.independentMultiplierTarget}
              onChange={(event) =>
                updateRow({
                  ...row,
                  independentMultiplierTarget: event.target
                    .value as IndependentMultiplierTarget,
                })
              }
            >
              {independentMultiplierTargets.map((target) => (
                <option value={target} key={target}>
                  {getIndependentMultiplierTargetLabel(t, target)}
                </option>
              ))}
            </select>
          ) : (
            <span className="mutedText">-</span>
          )}
          <strong>{formatRuleEffect(t, row, effects[row.id])}</strong>
          <RowActions
            t={t}
            index={index}
            rowCount={rows.length}
            onMoveUp={() => moveRow(row.id, "up")}
            onMoveDown={() => moveRow(row.id, "down")}
            onDelete={() => onChange(rows.filter((current) => current.id !== row.id))}
          />
        </div>
      ))}
      <button
        type="button"
        className="secondaryButton"
        onClick={() =>
          onChange([...rows, createCustomDamageRule(firstEnabledStatId)])
        }
      >
        {t.settings.addCustomDamageRule}
      </button>
    </div>
  );
}

function AffixVisibilityTable({
  t,
  rowsVisibility,
  customPanelStats,
  onChange,
}: {
  t: Translation;
  rowsVisibility: AffixVisibilityMap;
  customPanelStats: CustomPanelStat[];
  onChange: (affixVisibility: AffixVisibilityMap) => void;
}) {
  const normalized = normalizeAffixVisibility(rowsVisibility, customPanelStats);
  const updateKey = (key: string, visible: boolean) => {
    onChange({ ...normalized, [key]: visible });
  };
  const enabledCustomStats = customPanelStats.filter(
    (stat) => stat.enabled !== false,
  );

  return (
    <div className="globalMultiplierTable affixVisibilityTable">
      <div className="buttonRow">
        <button
          type="button"
          className="secondaryButton"
          onClick={() =>
            onChange(applyAffixVisibilityPreset("all", enabledCustomStats))
          }
        >
          {t.settings.showAllAffixes}
        </button>
        <button
          type="button"
          className="secondaryButton"
          onClick={() =>
            onChange(applyAffixVisibilityPreset("direct", enabledCustomStats))
          }
        >
          {t.settings.directCommonAffixes}
        </button>
        <button
          type="button"
          className="secondaryButton"
          onClick={() =>
            onChange(applyAffixVisibilityPreset("dot", enabledCustomStats))
          }
        >
          {t.settings.dotCommonAffixes}
        </button>
      </div>
      <div className="affixVisibilityRow affixVisibilityHeader">
        <span>{t.settings.showAffix}</span>
        <span>{t.settings.affixName}</span>
        <span>{t.settings.affixCategory}</span>
      </div>
      {AFFIX_TYPES.map((type) => (
        <div className="affixVisibilityRow" key={type}>
          <label className="compactCheck">
            <input
              type="checkbox"
              checked={isAffixVisible(normalized, type)}
              onChange={(event) => updateKey(type, event.target.checked)}
            />
            <span className="srOnly">{t.settings.showAffix}</span>
          </label>
          <span>{t.affix.types[type]}</span>
          <span>{getAffixCategoryLabel(t, AFFIX_CATEGORY_BY_TYPE[type])}</span>
        </div>
      ))}
      {enabledCustomStats.map((stat) => {
        const key = getCustomStatVisibilityKey(stat.id);
        const label = stat.affixLabel.trim() || stat.name.trim() || t.settings.customAffixFallback;

        return (
          <div className="affixVisibilityRow" key={key}>
            <label className="compactCheck">
              <input
                type="checkbox"
                checked={normalized[key] !== false}
                onChange={(event) => updateKey(key, event.target.checked)}
              />
              <span className="srOnly">{t.settings.showAffix}</span>
            </label>
            <span>+{label}</span>
            <span>{getAffixCategoryLabel(t, "custom")}</span>
          </div>
        );
      })}
    </div>
  );
}

function getAffixCategoryLabel(
  t: Translation,
  category: AffixCategory,
): string {
  switch (category) {
    case "basic":
      return t.settings.affixCategoryBasic;
    case "direct":
      return t.settings.affixCategoryDirect;
    case "vulnerable":
      return t.settings.affixCategoryVulnerable;
    case "dot":
      return t.settings.affixCategoryDot;
    case "general":
      return t.settings.affixCategoryGeneral;
    case "custom":
      return t.settings.affixCategoryCustom;
  }
}

function formatAffixVisibilitySummary(
  t: Translation,
  affixVisibility: AffixVisibilityMap,
  customPanelStats: CustomPanelStat[],
): string {
  const normalized = normalizeAffixVisibility(affixVisibility, customPanelStats);
  const customKeys = customPanelStats
    .filter((stat) => stat.enabled !== false)
    .map((stat) => getCustomStatVisibilityKey(stat.id));
  const keys = [...AFFIX_TYPES, ...customKeys];
  const visible = keys.filter((key) => normalized[key] !== false).length;
  const summary = t.settings.affixVisibilitySummary
    .replace("{visible}", String(visible))
    .replace("{total}", String(keys.length));

  return `${t.settings.affixVisibility}: ${summary}`;
}

function RowActions({
  t,
  index,
  rowCount,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  t: Translation;
  index: number;
  rowCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  return (
    <span className="globalMultiplierActions">
      <button
        type="button"
        className="iconButton"
        title={t.settings.moveUp}
        aria-label={t.settings.moveUp}
        disabled={index === 0}
        onClick={onMoveUp}
      >
        ↑
      </button>
      <button
        type="button"
        className="iconButton"
        title={t.settings.moveDown}
        aria-label={t.settings.moveDown}
        disabled={index === rowCount - 1}
        onClick={onMoveDown}
      >
        ↓
      </button>
      <button type="button" className="ghostButton" onClick={onDelete}>
        {t.settings.delete}
      </button>
    </span>
  );
}

function moveTableRow<T extends { id: string }>(
  rows: T[],
  rowId: string,
  direction: "up" | "down",
  onChange: (rows: T[]) => void,
) {
  const index = rows.findIndex((row) => row.id === rowId);
  const nextIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) {
    return;
  }

  const nextRows = [...rows];
  const row = nextRows[index];
  nextRows[index] = nextRows[nextIndex];
  nextRows[nextIndex] = row;
  onChange(nextRows);
}

function getOutputLabel(
  t: Translation,
  output: CustomDamageRuleOutput,
): string {
  switch (output) {
    case "genericAdditive":
      return t.settings.outputGenericAdditive;
    case "critDamageAdditive":
      return t.settings.outputCritDamageAdditive;
    case "vulnerableDamageAdditive":
      return t.settings.outputVulnerableDamageAdditive;
    case "independentMultiplier":
      return t.settings.outputIndependentMultiplier;
  }
}

function formatRuleEffect(
  t: Translation,
  row: CustomDamageRule,
  effect?: { rulePercent: number; factor: number },
): string {
  const percent = effect?.rulePercent ?? 0;

  return row.output === "independentMultiplier"
    ? `${getIndependentMultiplierTargetShortLabel(
        t,
        row.independentMultiplierTarget ?? "all",
      )} x${formatNumber(effect?.factor ?? 1, 3)}`
    : `${formatNumber(percent, 2)}%`;
}

function getIndependentMultiplierTargetLabel(
  t: Translation,
  target: IndependentMultiplierTarget,
): string {
  switch (target) {
    case "crit":
      return t.settings.targetCritDamage;
    case "vulnerable":
      return t.settings.targetVulnerableDamage;
    case "dot":
      return t.settings.targetDotDamage;
    case "all":
      return t.settings.targetAllDamage;
  }
}

function getIndependentMultiplierTargetShortLabel(
  t: Translation,
  target: IndependentMultiplierTarget,
): string {
  switch (target) {
    case "crit":
      return t.settings.targetCritDamageShort;
    case "vulnerable":
      return t.settings.targetVulnerableDamageShort;
    case "dot":
      return t.settings.targetDotDamageShort;
    case "all":
      return t.settings.targetAllDamageShort;
  }
}

const independentMultiplierTargets: IndependentMultiplierTarget[] = [
  "all",
  "crit",
  "vulnerable",
  "dot",
];

function formatCustomReferenceLabel(
  t: Translation,
  stat: CustomPanelStat,
): string {
  const label = stat.affixLabel.trim() || stat.name.trim() || t.settings.customAffixFallback;

  return t.settings.customStatReferenceLabel.replace("{label}", label);
}

function GlobalIndependentMultiplierTable({
  t,
  rows,
  onChange,
}: {
  t: Translation;
  rows: GlobalIndependentMultiplier[];
  onChange: (rows: GlobalIndependentMultiplier[]) => void;
}) {
  const updateRow = (row: GlobalIndependentMultiplier) => {
    onChange(rows.map((current) => (current.id === row.id ? row : current)));
  };

  const moveRow = (rowId: string, direction: "up" | "down") => {
    const index = rows.findIndex((row) => row.id === rowId);
    const nextIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) {
      return;
    }

    const nextRows = [...rows];
    const row = nextRows[index];
    nextRows[index] = nextRows[nextIndex];
    nextRows[nextIndex] = row;
    onChange(nextRows);
  };

  return (
    <div className="globalMultiplierTable">
      <div className="globalMultiplierRow globalMultiplierHeader">
        <span>{t.settings.enabled}</span>
        <span>{t.settings.name}</span>
        <span>{t.settings.independentMultiplierTarget}</span>
        <span>{t.settings.increase}</span>
        <span>{t.settings.multiplier}</span>
        <span>{t.settings.actions}</span>
      </div>
      {rows.map((row, index) => (
        <div className="globalMultiplierRow" key={row.id}>
          <label className="compactCheck">
            <input
              type="checkbox"
              checked={row.enabled}
              onChange={(event) =>
                updateRow({ ...row, enabled: event.target.checked })
              }
            />
            <span className="srOnly">{t.settings.enabled}</span>
          </label>
          <input
            value={row.name}
            placeholder={t.settings.globalMultiplier}
            onChange={(event) => updateRow({ ...row, name: event.target.value })}
          />
          <select
            value={row.target ?? "all"}
            title={t.settings.independentMultiplierTarget}
            onChange={(event) =>
              updateRow({
                ...row,
                target: event.target.value as IndependentMultiplierTarget,
              })
            }
          >
            {independentMultiplierTargets.map((target) => (
              <option value={target} key={target}>
                {getIndependentMultiplierTargetLabel(t, target)}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={row.valuePercent}
            onChange={(event) =>
              updateRow({
                ...row,
                valuePercent: sanitizeGlobalIndependentMultiplierValue(
                  Number(event.target.value),
                ),
              })
            }
          />
          <strong>
            {formatNumber(globalIndependentMultiplierRowFactor(row.valuePercent), 3)}
          </strong>
          <span className="globalMultiplierActions">
            <button
              type="button"
              className="iconButton"
              title={t.settings.moveUp}
              aria-label={t.settings.moveUp}
              disabled={index === 0}
              onClick={() => moveRow(row.id, "up")}
            >
              ↑
            </button>
            <button
              type="button"
              className="iconButton"
              title={t.settings.moveDown}
              aria-label={t.settings.moveDown}
              disabled={index === rows.length - 1}
              onClick={() => moveRow(row.id, "down")}
            >
              ↓
            </button>
            <button
              type="button"
              className="ghostButton"
              onClick={() =>
                onChange(rows.filter((current) => current.id !== row.id))
              }
            >
              {t.settings.delete}
            </button>
          </span>
        </div>
      ))}
      <button
        type="button"
        className="secondaryButton"
        onClick={() => onChange([...rows, createGlobalIndependentMultiplier()])}
      >
        {t.settings.addGlobalMultiplier}
      </button>
    </div>
  );
}

function formatGlobalMultiplierSummary(
  t: Translation,
  count: number,
  factor: number,
): string {
  return t.settings.globalIndependentMultiplierSummary
    .replace("{count}", String(count))
    .replace("{factor}", formatNumber(factor, 3));
}

function PercentField({
  label,
  title,
  value,
  onChange,
}: {
  label: string;
  title?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field" title={title}>
      <span className="truncate" title={label}>
        {label}
      </span>
      <input
        type="number"
        value={toPercentInput(value)}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function NumberField({
  label,
  title,
  value,
  onChange,
}: {
  label: string;
  title?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field" title={title}>
      <span className="truncate" title={label}>
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function WeaponDamageRangeField({
  label,
  title,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  title: string;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  return (
    <label className="field" title={title}>
      <span className="truncate" title={label}>
        {label}
      </span>
      <div className="rangePairInputs">
        <input
          type="number"
          value={minValue}
          onChange={(event) => onMinChange(Number(event.target.value))}
        />
        <span>-</span>
        <input
          type="number"
          value={maxValue}
          onChange={(event) => onMaxChange(Number(event.target.value))}
        />
      </div>
    </label>
  );
}
