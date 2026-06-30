import {
  AFFIX_TYPES,
  BaseInputs,
  GearTotals,
  TypicalRolls,
  calculateMarginalGains,
  calculateUnitMarginalGains,
} from "../lib/damageModel";
import { Translation } from "../i18n";
import {
  formatBucketValue,
  formatNumber,
  formatSignedPercent,
  inputValueForAffix,
  valueFromAffixInput,
} from "./format";

interface AnalysisPanelProps {
  t: Translation;
  baseInputs: BaseInputs;
  gearTotals: GearTotals;
  typicalRolls: TypicalRolls;
  onTypicalRollsChange: (typicalRolls: TypicalRolls) => void;
}

export function AnalysisPanel({
  t,
  baseInputs,
  gearTotals,
  typicalRolls,
  onTypicalRollsChange,
}: AnalysisPanelProps) {
  const unitGains = calculateUnitMarginalGains(baseInputs, gearTotals);
  const typicalGains = calculateMarginalGains(baseInputs, gearTotals, typicalRolls);

  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>{t.panels.analysis}</h2>
      </div>

      <h3>{t.panels.marginalUnit}</h3>
      <MarginalTable t={t} gains={unitGains} />

      <h3>{t.panels.marginalTypical}</h3>
      <div className="typicalGrid">
        {AFFIX_TYPES.map((type) => (
          <label className="field" key={type}>
            <span>{t.affix.types[type]}</span>
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
      <MarginalTable t={t} gains={typicalGains} />
    </section>
  );
}

function MarginalTable({
  t,
  gains,
}: {
  t: Translation;
  gains: ReturnType<typeof calculateMarginalGains>;
}) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>{t.formula.rank}</th>
            <th>{t.affix.type}</th>
            <th>{t.affix.value}</th>
            <th>{t.formula.change}</th>
            <th>{t.formula.currentBucket}</th>
            <th>{t.formula.currentFactor}</th>
          </tr>
        </thead>
        <tbody>
          {gains.map((gain, index) => (
            <tr key={`${gain.type}-${gain.delta}`}>
              <td>{index + 1}</td>
              <td>{t.affix.types[gain.type]}</td>
              <td>{formatBucketValue(gain.type, gain.delta)}</td>
              <td className={gain.relativeChange >= 0 ? "positive" : "negative"}>
                {formatSignedPercent(gain.relativeChange)}
              </td>
              <td>{formatBucketValue(gain.type, gain.currentBucketTotal)}</td>
              <td>{formatNumber(gain.currentFactor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
