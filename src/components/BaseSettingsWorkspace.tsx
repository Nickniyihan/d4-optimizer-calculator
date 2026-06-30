import { useState } from "react";
import {
  AFFIX_TYPES,
  BaseInputs,
  GlobalIndependentMultiplier,
  TypicalRolls,
  createGlobalIndependentMultiplier,
  globalIndependentMultiplierRowFactor,
  sanitizeGlobalIndependentMultiplierValue,
} from "../lib/damageModel";
import { Translation } from "../i18n";
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
  includeGlobalIndependentMultipliers: boolean;
  globalIndependentMultipliers: GlobalIndependentMultiplier[];
  globalIndependentMultiplierFactor: number;
  autoSaveEnabled: boolean;
  classPreset: ClassPreset;
  onBaseInputsChange: (baseInputs: BaseInputs) => void;
  onTypicalRollsChange: (typicalRolls: TypicalRolls) => void;
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
  includeGlobalIndependentMultipliers,
  globalIndependentMultipliers,
  globalIndependentMultiplierFactor,
  autoSaveEnabled,
  classPreset,
  onBaseInputsChange,
  onTypicalRollsChange,
  onIncludeGlobalIndependentMultipliersChange,
  onGlobalIndependentMultipliersChange,
  onAutoSaveEnabledChange,
  onClassPresetChange,
}: BaseSettingsWorkspaceProps) {
  const [globalMultipliersExpanded, setGlobalMultipliersExpanded] =
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
      | "capstoneBonus",
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
    </div>
  );
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
