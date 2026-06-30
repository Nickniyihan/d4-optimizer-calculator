import { Affix, EquipmentItem, createEmptyAffix } from "../lib/damageModel";
import { Translation } from "../i18n";
import { AffixEditor } from "./AffixEditor";
import { formatBucketValue } from "./format";

interface EquipmentCardProps {
  t: Translation;
  item: EquipmentItem;
  onChange: (item: EquipmentItem) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  compact?: boolean;
}

export function EquipmentCard({
  t,
  item,
  onChange,
  onDelete,
  onDuplicate,
  compact = false,
}: EquipmentCardProps) {
  const updateAffix = (affix: Affix) => {
    onChange({
      ...item,
      affixes: item.affixes.map((current) =>
        current.id === affix.id ? affix : current,
      ),
    });
  };

  const removeAffix = (affixId: string) => {
    const nextAffixes = item.affixes.filter((affix) => affix.id !== affixId);
    onChange({
      ...item,
      inputCapstoneAffixId:
        item.inputCapstoneAffixId === affixId ? null : item.inputCapstoneAffixId,
      targetCapstoneAffixId:
        item.targetCapstoneAffixId === affixId ? null : item.targetCapstoneAffixId,
      affixes: nextAffixes,
    });
  };

  return (
    <article className={`equipmentCard${item.enabled ? "" : " mutedCard"}`}>
      <div className="equipmentHeader">
        <label className="toggleLabel">
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(event) => onChange({ ...item, enabled: event.target.checked })}
          />
          <span>{item.enabled ? t.status.enabled : t.status.disabled}</span>
        </label>
        <input
          className="itemNameInput"
          value={item.name}
          aria-label={t.equipment.name}
          onChange={(event) => onChange({ ...item, name: event.target.value })}
        />
      </div>

      <div className="qualityGrid" title={t.formula.tooltips.quality}>
        <label>
          <span>{t.equipment.inputQuality}</span>
          <input
            type="number"
            value={item.inputQuality}
            onChange={(event) =>
              onChange({ ...item, inputQuality: Number(event.target.value) })
            }
          />
        </label>
        <label>
          <span>{t.equipment.targetQuality}</span>
          <input
            type="number"
            value={item.targetQuality}
            onChange={(event) =>
              onChange({ ...item, targetQuality: Number(event.target.value) })
            }
          />
        </label>
      </div>

      <div className="qualityGrid">
        <label>
          <span>{t.equipment.inputCapstone}</span>
          <select
            value={item.inputCapstoneAffixId ?? ""}
            onChange={(event) =>
              onChange({
                ...item,
                inputCapstoneAffixId: event.target.value || null,
              })
            }
          >
            <option value="">{t.equipment.noCapstone}</option>
            {item.affixes.map((affix, index) => (
              <option value={affix.id} key={affix.id}>
                {index + 1}. {t.affix.types[affix.type]}{" "}
                {formatBucketValue(affix.type, affix.value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{t.equipment.targetCapstone}</span>
          <select
            value={item.targetCapstoneAffixId ?? ""}
            onChange={(event) =>
              onChange({
                ...item,
                targetCapstoneAffixId: event.target.value || null,
              })
            }
          >
            <option value="">{t.equipment.noCapstone}</option>
            {item.affixes.map((affix, index) => (
              <option value={affix.id} key={affix.id}>
                {index + 1}. {t.affix.types[affix.type]}{" "}
                {formatBucketValue(affix.type, affix.value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={compact ? "affixList compactAffixes" : "affixList"}>
        {item.affixes.map((affix) => (
          <AffixEditor
            t={t}
            key={affix.id}
            affix={affix}
            onChange={updateAffix}
            onRemove={() => removeAffix(affix.id)}
          />
        ))}
      </div>

      <div className="buttonRow">
        <button
          type="button"
          className="secondaryButton"
          onClick={() =>
            onChange({ ...item, affixes: [...item.affixes, createEmptyAffix()] })
          }
        >
          {t.actions.addAffix}
        </button>
        {onDuplicate && (
          <button type="button" className="ghostButton" onClick={onDuplicate}>
            {t.actions.duplicate}
          </button>
        )}
        {onDelete && (
          <button type="button" className="dangerButton" onClick={onDelete}>
            {t.actions.delete}
          </button>
        )}
      </div>
    </article>
  );
}
