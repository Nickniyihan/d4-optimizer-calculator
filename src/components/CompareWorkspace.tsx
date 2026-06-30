import { useEffect } from "react";
import {
  AFFIX_TYPES,
  AffixType,
  BaseInputs,
  ComparisonBreakdown,
  DeltaRow,
  EquipmentItem,
  GearTotals,
  createEquipmentItem,
  createId,
} from "../lib/damageModel";
import { Language, Translation } from "../i18n";
import {
  EquipmentSimulationEditor,
  NormalizedAffixValues,
} from "./EquipmentSimulationEditor";
import {
  formatFactor,
  formatSignedPercent,
  inputValueForAffix,
  valueFromAffixInput,
} from "./format";

export type CompareEditorTab = "manualChanges" | "candidateItem";
export type CompareSourceMode =
  | "manualChangesOnly"
  | "candidateItemOnly"
  | "applyBoth";

interface CompareWorkspaceProps {
  t: Translation;
  language: Language;
  activeEditorTab: CompareEditorTab;
  onEditorTabChange: (tab: CompareEditorTab) => void;
  sourceMode: CompareSourceMode;
  onSourceModeChange: (mode: CompareSourceMode) => void;
  baseInputs: BaseInputs;
  gearTotals: GearTotals;
  quickDeltas: DeltaRow[];
  onQuickDeltasChange: (deltas: DeltaRow[]) => void;
  equipment: EquipmentItem[];
  selectedItemId: string;
  onSelectedItemIdChange: (itemId: string) => void;
  candidate: EquipmentItem;
  onCandidateChange: (item: EquipmentItem) => void;
  comparison: ComparisonBreakdown | null;
}

const editorTabs: CompareEditorTab[] = ["manualChanges", "candidateItem"];
const sourceModes: CompareSourceMode[] = [
  "manualChangesOnly",
  "candidateItemOnly",
  "applyBoth",
];

export function CompareWorkspace({
  t,
  language,
  activeEditorTab,
  onEditorTabChange,
  sourceMode,
  onSourceModeChange,
  baseInputs,
  quickDeltas,
  onQuickDeltasChange,
  equipment,
  selectedItemId,
  onSelectedItemIdChange,
  candidate,
  onCandidateChange,
  comparison,
}: CompareWorkspaceProps) {
  const selectedItem =
    equipment.find((item) => item.id === selectedItemId) ?? equipment[0];

  useEffect(() => {
    if (!selectedItem && equipment[0]) {
      onSelectedItemIdChange(equipment[0].id);
    }
  }, [equipment, onSelectedItemIdChange, selectedItem]);

  return (
    <section className="compareWorkspace">
      <div className="compareControls">
        <label className="field slimField">
          <span>{t.compare.changeSource}</span>
          <select
            value={sourceMode}
            onChange={(event) =>
              onSourceModeChange(event.target.value as CompareSourceMode)
            }
          >
            {sourceModes.map((mode) => (
              <option value={mode} key={mode}>
                {t.compare[mode]}
              </option>
            ))}
          </select>
        </label>

        <div className="tabStrip segmentedTabs">
          {editorTabs.map((tab) => (
            <button
              type="button"
              key={tab}
              title={
                tab === "manualChanges"
                  ? t.tabHelp.manualChanges
                  : t.tabHelp.candidateItem
              }
              className={
                activeEditorTab === tab ? "tabButton activeTab" : "tabButton"
              }
              onClick={() => onEditorTabChange(tab)}
            >
              {tab === "manualChanges"
                ? t.compare.manualChanges
                : t.panels.candidateItem}
            </button>
          ))}
        </div>
      </div>

      {activeEditorTab === "manualChanges" && (
        <ManualChangesEditor
          t={t}
          deltas={quickDeltas}
          onChange={onQuickDeltasChange}
          comparison={comparison}
        />
      )}

      {activeEditorTab === "candidateItem" && selectedItem && (
        <div className="candidateWorkspace">
          <div className="candidateCurrent">
            <label className="field slimField">
              <span>{t.equipment.selectedSlot}</span>
              <select
                value={selectedItem.id}
                onChange={(event) => {
                  const nextItem = equipment.find(
                    (item) => item.id === event.target.value,
                  );
                  onSelectedItemIdChange(event.target.value);
                  if (nextItem) {
                    onCandidateChange(
                      cloneAsCandidate(nextItem, t.equipment.candidateName),
                    );
                  }
                }}
              >
                {equipment.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="miniPanel">
              <h3>{t.candidate.comparingAgainstCurrentItem}</h3>
              <strong>{selectedItem.name}</strong>
              <NormalizedAffixValues
                t={t}
                item={selectedItem}
                capstoneBonus={baseInputs.capstoneBonus}
                title={t.equipment.affixes}
              />
            </div>
          </div>

          <EquipmentSimulationEditor
            t={t}
            item={candidate}
            capstoneBonus={baseInputs.capstoneBonus}
            onChange={onCandidateChange}
          />
        </div>
      )}

      {comparison && (
        <div className="compareSummary compactCompareSummary">
          <span>
            {t.dashboardLabels.current}:{" "}
            {formatFactor(comparison.before.totalDamageFactor, language)}
          </span>
          <span>
            {t.dashboardLabels.afterChange}:{" "}
            {formatFactor(comparison.after.totalDamageFactor, language)}
          </span>
          <strong
            className={
              comparison.totalRelativeChange > 0
                ? "positive"
                : comparison.totalRelativeChange < 0
                  ? "negative"
                  : "neutral"
            }
          >
            {t.dashboardLabels.gainLoss}:{" "}
            {formatSignedPercent(comparison.totalRelativeChange)}
          </strong>
        </div>
      )}
    </section>
  );
}

export function cloneAsCandidate(
  item: EquipmentItem | undefined,
  candidateName: string,
): EquipmentItem {
  if (!item) {
    return createEquipmentItem(candidateName);
  }

  return {
    ...item,
    id: createId("candidate"),
    name: candidateName,
    enabled: true,
    affixes: item.affixes.map((affix) => ({
      ...affix,
      id: createId("candidate-affix"),
    })),
    extraAffixes: (item.extraAffixes ?? []).map((affix) => ({
      ...affix,
      id: createId("candidate-extra-affix"),
    })),
    itemIndependentMultipliers: (item.itemIndependentMultipliers ?? []).map(
      (row) => ({
        ...row,
        id: createId("candidate-item-multiplier"),
      }),
    ),
  };
}

function ManualChangesEditor({
  t,
  deltas,
  onChange,
  comparison,
}: {
  t: Translation;
  deltas: DeltaRow[];
  onChange: (deltas: DeltaRow[]) => void;
  comparison: ComparisonBreakdown | null;
}) {
  return (
    <section className="panel flatPanel">
      <div className="panelHeader">
        <div>
          <h2>{t.compare.manualChanges}</h2>
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
          {t.compare.addChange}
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
                  {t.affix.inputTypes[type]}
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

      {comparison && (
        <p className="inlineResult">
          {t.dashboardLabels.gainLoss}:{" "}
          {formatSignedPercent(comparison.totalRelativeChange)}
        </p>
      )}
    </section>
  );
}
