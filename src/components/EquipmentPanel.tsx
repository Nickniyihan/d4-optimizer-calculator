import { EquipmentItem, createEquipmentItem } from "../lib/damageModel";
import { Translation } from "../i18n";
import { duplicateEquipmentItem } from "../lib/presets";
import { EquipmentCard } from "./EquipmentCard";

interface EquipmentPanelProps {
  t: Translation;
  equipment: EquipmentItem[];
  defaultTargetQuality: number;
  onChange: (equipment: EquipmentItem[]) => void;
}

export function EquipmentPanel({
  t,
  equipment,
  defaultTargetQuality,
  onChange,
}: EquipmentPanelProps) {
  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>{t.panels.equipment}</h2>
        <button
          type="button"
          className="secondaryButton"
          onClick={() =>
            onChange([
              ...equipment,
              createEquipmentItem(t.equipment.addItemName, defaultTargetQuality),
            ])
          }
        >
          {t.actions.addItem}
        </button>
      </div>
      <div className="equipmentGrid">
        {equipment.map((item) => (
          <EquipmentCard
            t={t}
            key={item.id}
            item={item}
            onChange={(nextItem) =>
              onChange(
                equipment.map((current) =>
                  current.id === item.id ? nextItem : current,
                ),
              )
            }
            onDelete={() =>
              onChange(equipment.filter((current) => current.id !== item.id))
            }
            onDuplicate={() =>
              onChange([
                ...equipment,
                duplicateEquipmentItem(item, t.equipment.duplicateSuffix),
              ])
            }
          />
        ))}
      </div>
    </section>
  );
}
