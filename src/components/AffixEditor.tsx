import {
  AFFIX_TYPES,
  Affix,
  AffixType,
  isPercentAffix,
} from "../lib/damageModel";
import { Translation } from "../i18n";
import { inputValueForAffix, valueFromAffixInput } from "./format";

interface AffixEditorProps {
  t: Translation;
  affix: Affix;
  onChange: (affix: Affix) => void;
  onRemove: () => void;
}

export function AffixEditor({
  t,
  affix,
  onChange,
  onRemove,
}: AffixEditorProps) {
  return (
    <div className="affixRow">
      <label>
        <span>{t.affix.type}</span>
        <select
          value={affix.type}
          onChange={(event) => {
            const nextType = event.target.value as AffixType;
            onChange({ ...affix, type: nextType });
          }}
        >
          {AFFIX_TYPES.map((type) => (
            <option value={type} key={type}>
              {t.affix.inputTypes[type]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{t.affix.value}</span>
        <input
          type="number"
          title={isPercentAffix(affix.type) ? t.affix.valuePercentHint : undefined}
          value={inputValueForAffix(affix.type, affix.value)}
          onChange={(event) =>
            onChange({
              ...affix,
              value: valueFromAffixInput(affix.type, Number(event.target.value)),
            })
          }
        />
      </label>
      <button className="ghostButton" type="button" onClick={onRemove}>
        {t.actions.remove}
      </button>
    </div>
  );
}
