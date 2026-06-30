import {
  ComparisonBreakdown,
  DamageBreakdown,
  FactorChange,
} from "../lib/damageModel";
import { Translation } from "../i18n";
import { formatNumber, formatSignedPercent } from "./format";

interface FormulaBreakdownProps {
  t: Translation;
  breakdown?: DamageBreakdown;
  comparison?: ComparisonBreakdown;
}

const factorKeys = [
  "weaponDamageFactor",
  "skillDamageFactor",
  "globalIndependentMultiplierFactor",
  "equipmentIndependentMultiplierFactor",
  "mainStatFactor",
  "critFactor",
  "vulnerableFactor",
  "typeAllMultiplierFactor",
  "additiveFactor",
  "expectedCombatFactor",
  "totalDamageFactor",
] as const;

export function FormulaBreakdown({
  t,
  breakdown,
  comparison,
}: FormulaBreakdownProps) {
  if (comparison) {
    return (
      <div className="formulaList">
        {factorKeys.map((key) => (
          <ComparisonRow
            key={key}
            label={t.formula[key]}
            title={t.formula.tooltips[key]}
            change={comparison.factorChanges[key]}
          />
        ))}
      </div>
    );
  }

  if (!breakdown) {
    return null;
  }

  return (
    <div className="formulaList">
      {factorKeys.map((key) => (
        <div className="formulaRow" key={key} title={t.formula.tooltips[key]}>
          <span>{t.formula[key]}</span>
          <strong>{formatNumber(breakdown[key])}</strong>
        </div>
      ))}
    </div>
  );
}

function ComparisonRow({
  label,
  title,
  change,
}: {
  label: string;
  title: string;
  change: FactorChange;
}) {
  const className =
    change.relativeChange > 0
      ? "positive"
      : change.relativeChange < 0
        ? "negative"
        : "neutral";

  return (
    <div className="formulaRow" title={title}>
      <span>{label}</span>
      <strong>
        {formatNumber(change.before)} -&gt; {formatNumber(change.after)}
      </strong>
      <span className={className}>{formatSignedPercent(change.relativeChange)}</span>
    </div>
  );
}
