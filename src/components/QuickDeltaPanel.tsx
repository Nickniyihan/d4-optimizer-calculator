import {
  AFFIX_TYPES,
  AffixType,
  DeltaRow,
  GearTotals,
  BaseInputs,
  compareWithDeltas,
  createId,
} from "../lib/damageModel";
import { Translation } from "../i18n";
import {
  formatNumber,
  formatSignedPercent,
  inputValueForAffix,
  valueFromAffixInput,
} from "./format";
import { FormulaBreakdown } from "./FormulaBreakdown";

interface QuickDeltaPanelProps {
  t: Translation;
  baseInputs: BaseInputs;
  gearTotals: GearTotals;
  deltas: DeltaRow[];
  onChange: (deltas: DeltaRow[]) => void;
}

export function QuickDeltaPanel({
  t,
  baseInputs,
  gearTotals,
  deltas,
  onChange,
}: QuickDeltaPanelProps) {
  const comparison = compareWithDeltas(baseInputs, gearTotals, deltas);

  return (
    <section className="panel">
      <div className="panelHeader">
        <div>
          <h2>{t.panels.quickDelta}</h2>
          <p>{t.quickDelta.intro}</p>
        </div>
        <button
          type="button"
          className="secondaryButton"
          onClick={() =>
            onChange([
              ...deltas,
              { id: createId("delta"), type: "critChance", value: 0 },
            ])
          }
        >
          {t.actions.addDelta}
        </button>
      </div>

      <div className="deltaList">
        {deltas.map((delta) => (
          <div className="deltaRow" key={delta.id}>
            <select
              value={delta.type}
              onChange={(event) =>
                onChange(
                  deltas.map((current) =>
                    current.id === delta.id
                      ? { ...current, type: event.target.value as AffixType }
                      : current,
                  ),
                )
              }
            >
              {AFFIX_TYPES.map((type) => (
                <option value={type} key={type}>
                  {t.affix.types[type]}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={inputValueForAffix(delta.type, delta.value)}
              onChange={(event) =>
                onChange(
                  deltas.map((current) =>
                    current.id === delta.id
                      ? {
                          ...current,
                          value: valueFromAffixInput(
                            delta.type,
                            Number(event.target.value),
                          ),
                        }
                      : current,
                  ),
                )
              }
            />
            <button
              type="button"
              className="ghostButton"
              onClick={() =>
                onChange(deltas.filter((current) => current.id !== delta.id))
              }
            >
              {t.actions.remove}
            </button>
          </div>
        ))}
      </div>

      <div className="compareSummary">
        <span>
          {t.status.current}: {formatNumber(comparison.before.totalDamageFactor)}
        </span>
        <span>
          {t.status.after}: {formatNumber(comparison.after.totalDamageFactor)}
        </span>
        <strong className={comparison.totalRelativeChange >= 0 ? "positive" : "negative"}>
          {t.status.gain}: {formatSignedPercent(comparison.totalRelativeChange)}
        </strong>
      </div>
      <FormulaBreakdown t={t} comparison={comparison} />
    </section>
  );
}
