import { BaseInputs } from "../lib/damageModel";
import { Translation } from "../i18n";
import { fromPercentInput, toPercentInput } from "./format";

interface BaseInputsPanelProps {
  t: Translation;
  baseInputs: BaseInputs;
  onChange: (baseInputs: BaseInputs) => void;
}

const percentFields = [
  "baseCritChance",
  "vulnerableUptime",
  "baseAdditivePool",
  "baseCritDamageMultiplier",
  "baseVulnerableDamageMultiplier",
  "baseCritDamageAdditive",
  "baseVulnerableDamageAdditive",
  "critChanceCap",
  "capstoneBonus",
] as const;

const numberFields = [
  "baseMainStat",
  "baseMainSkillRank",
  "mainSkillBaseMultiplier",
  "mainStatCoefficient",
  "baseCritMultiplier",
  "baseVulnerableMultiplier",
  "defaultTargetQuality",
] as const;

export function BaseInputsPanel({
  t,
  baseInputs,
  onChange,
}: BaseInputsPanelProps) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>{t.panels.baseInputs}</h2>
      </div>
      <div className="inputGrid">
        {percentFields.map((field) => (
          <label className="field" key={field}>
            <span>{t.baseFields[field]}</span>
            <input
              type="number"
              value={toPercentInput(baseInputs[field])}
              onChange={(event) =>
                onChange({
                  ...baseInputs,
                  [field]: fromPercentInput(Number(event.target.value)),
                })
              }
            />
          </label>
        ))}
        {numberFields.map((field) => (
          <label className="field" key={field}>
            <span>{t.baseFields[field]}</span>
            <input
              type="number"
              step={field === "mainStatCoefficient" ? "0.0001" : "1"}
              value={baseInputs[field]}
              onChange={(event) =>
                onChange({ ...baseInputs, [field]: Number(event.target.value) })
              }
            />
          </label>
        ))}
        <label className="checkField">
          <input
            type="checkbox"
            checked={baseInputs.includeWeaponDamage}
            onChange={(event) =>
              onChange({
                ...baseInputs,
                includeWeaponDamage: event.target.checked,
              })
            }
          />
          <span>{t.baseFields.includeWeaponDamage}</span>
        </label>
        <label className="checkField">
          <input
            type="checkbox"
            checked={baseInputs.includeSkillRankDamage}
            onChange={(event) =>
              onChange({
                ...baseInputs,
                includeSkillRankDamage: event.target.checked,
              })
            }
          />
          <span>{t.baseFields.includeSkillRankDamage}</span>
        </label>
        <label className="checkField">
          <input
            type="checkbox"
            checked={baseInputs.includeSkillBaseMultiplier}
            onChange={(event) =>
              onChange({
                ...baseInputs,
                includeSkillBaseMultiplier: event.target.checked,
              })
            }
          />
          <span>{t.baseFields.includeSkillBaseMultiplier}</span>
        </label>
        <label className="checkField">
          <input
            type="checkbox"
            checked={baseInputs.treatTypeAllAsOneBucket}
            onChange={(event) =>
              onChange({
                ...baseInputs,
                treatTypeAllAsOneBucket: event.target.checked,
              })
            }
          />
          <span>{t.baseFields.treatTypeAllAsOneBucket}</span>
        </label>
      </div>
    </section>
  );
}
