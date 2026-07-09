import { UIEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  BaseInputs,
  AffixVisibilityMap,
  CustomCalculationContext,
  CustomPanelStat,
  EquipmentItem,
  calculateItemIndependentMultiplierFactor,
  createEquipmentItem,
  normalizeEquipmentAffix,
} from "../lib/damageModel";
import { Translation } from "../i18n";
import { reorderEquipmentItem } from "../lib/equipmentOrder";
import { duplicateEquipmentItem } from "../lib/presets";
import { EquipmentSimulationEditor } from "./EquipmentSimulationEditor";
import { getAffixDisplayLabel } from "./affixOptions";
import { formatBucketValue, formatNumber } from "./format";

interface EquipmentWorkspaceProps {
  t: Translation;
  equipment: EquipmentItem[];
  baseInputs: BaseInputs;
  capstoneBonus: number;
  defaultTargetQuality: number;
  customPanelStats: CustomPanelStat[];
  affixVisibility: AffixVisibilityMap;
  customContext: CustomCalculationContext;
  listScrollTop: number;
  onListScrollTopChange: (scrollTop: number) => void;
  onChange: (equipment: EquipmentItem[]) => void;
}

export function EquipmentWorkspace({
  t,
  equipment,
  baseInputs,
  capstoneBonus,
  defaultTargetQuality,
  customPanelStats,
  affixVisibility,
  customContext,
  listScrollTop,
  onListScrollTopChange,
  onChange,
}: EquipmentWorkspaceProps) {
  const [selectedItemId, setSelectedItemId] = useState(equipment[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!equipment.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(equipment[0]?.id ?? "");
    }
  }, [equipment, selectedItemId]);

  const selectedItem =
    equipment.find((item) => item.id === selectedItemId) ?? equipment[0];
  const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
    onListScrollTopChange(event.currentTarget.scrollTop);
  };

  useLayoutEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listScrollTop;
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [equipment.length]);

  return (
    <section className="equipmentWorkspace">
      <div className="equipmentListPane">
        <div className="paneHeader">
          <h2>{t.equipment.equipmentList}</h2>
          <button
            type="button"
            className="secondaryButton"
            onClick={() => {
              const item = createEquipmentItem(
                t.equipment.addItemName,
                defaultTargetQuality,
              );
              onChange([...equipment, item]);
              setSelectedItemId(item.id);
            }}
          >
            {t.actions.addItem}
          </button>
        </div>

        <div
          className="equipmentList"
          ref={listRef}
          onScroll={handleListScroll}
        >
          {equipment.map((item, index) => {
            const previewLines = summarizeAffixes(
              t,
              item,
              capstoneBonus,
              baseInputs.greaterAffixBonus,
              customPanelStats,
            );

            return (
              <div
                className={[
                  "equipmentListItem",
                  item.id === selectedItem?.id ? "selectedListItem" : "",
                  item.enabled ? "" : "mutedCard",
                ].join(" ")}
                key={item.id}
              >
                <div className="equipmentListTitleRow">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(event) =>
                      onChange(
                        equipment.map((current) =>
                          current.id === item.id
                            ? { ...current, enabled: event.target.checked }
                            : current,
                        ),
                      )
                    }
                    aria-label={
                      item.enabled ? t.status.enabled : t.status.disabled
                    }
                  />
                  <button
                    type="button"
                    className="equipmentListNameButton"
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <strong className="truncate" title={item.name}>
                      {item.name}
                    </strong>
                  </button>
                  <span className="equipmentListOrderControls">
                    <button
                      type="button"
                      className="iconButton"
                      title={t.equipment.moveEquipmentUp}
                      aria-label={t.equipment.moveEquipmentUp}
                      disabled={index === 0}
                      onClick={() =>
                        onChange(reorderEquipmentItem(equipment, item.id, "up"))
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="iconButton"
                      title={t.equipment.moveEquipmentDown}
                      aria-label={t.equipment.moveEquipmentDown}
                      disabled={index === equipment.length - 1}
                      onClick={() =>
                        onChange(reorderEquipmentItem(equipment, item.id, "down"))
                      }
                    >
                      ↓
                    </button>
                  </span>
                </div>
                {previewLines.map((line, index) => (
                  <button
                    type="button"
                    className="equipmentPreviewLine truncate"
                    title={line}
                    key={`${item.id}-preview-${index}`}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    {line}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="selectedEquipmentPane">
        {selectedItem && (
          <>
            <EquipmentSimulationEditor
              t={t}
              item={selectedItem}
              capstoneBonus={capstoneBonus}
              baseInputs={baseInputs}
              equipment={equipment}
              customPanelStats={customPanelStats}
              affixVisibility={affixVisibility}
              customContext={customContext}
              onChange={(nextItem) =>
                onChange(
                  equipment.map((item) =>
                    item.id === selectedItem.id ? nextItem : item,
                  ),
                )
              }
            />
            <div className="buttonRow">
              <button
                type="button"
                className="ghostButton"
                onClick={() => {
                  const copy = duplicateEquipmentItem(
                    selectedItem,
                    t.equipment.duplicateSuffix,
                  );
                  onChange([...equipment, copy]);
                  setSelectedItemId(copy.id);
                }}
              >
                {t.actions.duplicate}
              </button>
              <button
                type="button"
                className="dangerButton"
                onClick={() =>
                  onChange(equipment.filter((item) => item.id !== selectedItem.id))
                }
              >
                {t.actions.delete}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function summarizeAffixes(
  t: Translation,
  item: EquipmentItem,
  capstoneBonus: number,
  greaterAffixBonus: number,
  customPanelStats: CustomPanelStat[],
): string[] {
  const meaningfulAffixes = item.affixes.filter((affix) => affix.value !== 0);
  const meaningfulExtraAffixes = (item.extraAffixes ?? []).filter(
    (affix) => affix.value !== 0,
  );
  const hasItemIndependentMultipliers = (item.itemIndependentMultipliers ?? []).some(
    (row) => row.enabled && row.valuePercent !== 0,
  );

  if (
    meaningfulAffixes.length === 0 &&
    meaningfulExtraAffixes.length === 0 &&
    !hasItemIndependentMultipliers
  ) {
    return [t.equipment.noAffixes];
  }

  const previewAffixes = meaningfulAffixes.slice(0, 4).map((affix) =>
    `${getAffixDisplayLabel(t, affix, customPanelStats)} ${formatBucketValue(
      affix.type,
      normalizeEquipmentAffix(item, affix, capstoneBonus, greaterAffixBonus),
    )}`,
  );
  const remainingCount = meaningfulAffixes.length - previewAffixes.length;

  if (remainingCount > 0) {
    previewAffixes.push(
      t.equipment.moreAffixes.replace("{count}", String(remainingCount)),
    );
  }

  const previewLines = [
    previewAffixes.slice(0, 2).join(" · "),
    previewAffixes.slice(2).join(" · "),
  ].filter(Boolean);

  if (meaningfulExtraAffixes.length > 0) {
    const extraPreview = meaningfulExtraAffixes.slice(0, 2).map((affix) =>
      `${getAffixDisplayLabel(t, affix, customPanelStats)} ${formatBucketValue(
        affix.type,
        affix.value,
      )}`,
    );
    previewLines.push(`${t.equipment.extra}: ${extraPreview.join(" · ")}`);
  }

  if (hasItemIndependentMultipliers) {
    previewLines.push(
      `${t.equipment.aspectPreview} x${formatNumber(
        calculateItemIndependentMultiplierFactor(item),
        3,
      )}`,
    );
  }

  return previewLines;
}
