import { AFFIX_TYPES, TypicalRolls } from "../lib/damageModel";
import { Translation } from "../i18n";
import { inputValueForAffix, valueFromAffixInput } from "./format";

interface TypicalRollSettingsProps {
  t: Translation;
  typicalRolls: TypicalRolls;
  onChange: (typicalRolls: TypicalRolls) => void;
}

export function TypicalRollSettings({
  t,
  typicalRolls,
  onChange,
}: TypicalRollSettingsProps) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>{t.panels.perTypicalRoll}</h2>
      </div>
      <div className="typicalGrid">
        {AFFIX_TYPES.map((type) => (
          <label className="field" key={type}>
            <span className="truncate" title={t.affix.types[type]}>
              {t.affix.types[type]}
            </span>
            <input
              type="number"
              value={inputValueForAffix(type, typicalRolls[type])}
              onChange={(event) =>
                onChange({
                  ...typicalRolls,
                  [type]: valueFromAffixInput(type, Number(event.target.value)),
                })
              }
            />
          </label>
        ))}
      </div>
    </section>
  );
}
