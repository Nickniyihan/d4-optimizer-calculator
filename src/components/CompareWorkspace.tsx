import { useEffect, useMemo, useState } from "react";
import {
  AFFIX_TYPES,
  Affix,
  AffixGroup,
  AffixType,
  BaseInputs,
  CandidateCapstoneRecommendation,
  ComparisonBreakdown,
  DeltaRow,
  EquipmentItem,
  GearTotals,
  ItemIndependentMultiplier,
  buildCandidateReplacementEquipment,
  calculateCandidateCapstoneRecommendations,
  calculateCandidateRowContribution,
  createEquipmentItem,
  createId,
  replaceEquipmentItemWithCandidate,
} from "../lib/damageModel";
import { Language, Translation } from "../i18n";
import {
  EquipmentSimulationEditor,
  NormalizedAffixValues,
} from "./EquipmentSimulationEditor";
import {
  formatFactor,
  formatBucketValue,
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
  onEquipmentChange: (equipment: EquipmentItem[]) => void;
  selectedItemId: string;
  onSelectedItemIdChange: (itemId: string) => void;
  candidate: EquipmentItem;
  onCandidateChange: (item: EquipmentItem) => void;
  globalIndependentMultiplierFactor: number;
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
  onEquipmentChange,
  selectedItemId,
  onSelectedItemIdChange,
  candidate,
  onCandidateChange,
  globalIndependentMultiplierFactor,
  comparison,
}: CompareWorkspaceProps) {
  const [replaceMessage, setReplaceMessage] = useState("");
  const selectedItem =
    equipment.find((item) => item.id === selectedItemId) ?? equipment[0];
  const candidateContextDeltas = sourceMode === "applyBoth" ? quickDeltas : [];
  const candidateReplacementEquipment = useMemo(
    () =>
      selectedItem
        ? buildCandidateReplacementEquipment(equipment, selectedItem.id, candidate)
        : equipment,
    [candidate, equipment, selectedItem],
  );
  const capstoneRecommendations = useMemo(
    () =>
      selectedItem
        ? calculateCandidateCapstoneRecommendations({
            baseInputs,
            equipment,
            replacedItemId: selectedItem.id,
            candidate,
            globalIndependentMultiplierFactor,
            deltas: candidateContextDeltas,
          })
        : [],
    [
      baseInputs,
      candidate,
      candidateContextDeltas,
      equipment,
      globalIndependentMultiplierFactor,
      selectedItem,
    ],
  );

  useEffect(() => {
    if (!selectedItem && equipment[0]) {
      onSelectedItemIdChange(equipment[0].id);
    }
  }, [equipment, onSelectedItemIdChange, selectedItem]);

  useEffect(() => {
    setReplaceMessage("");
  }, [candidate, selectedItem?.id]);

  const getCandidateAffixContribution = (affix: Affix, group: AffixGroup) => {
    if (!selectedItem) {
      return 0;
    }

    return calculateCandidateRowContribution({
      baseInputs,
      equipment,
      replacedItemId: selectedItem.id,
      candidate,
      rowId: affix.id,
      rowKind: group === "extra" ? "extraAffix" : "itemAffix",
      globalIndependentMultiplierFactor,
      deltas: candidateContextDeltas,
    });
  };
  const getCandidateItemMultiplierContribution = (
    multiplier: ItemIndependentMultiplier,
  ) => {
    if (!selectedItem) {
      return 0;
    }

    return calculateCandidateRowContribution({
      baseInputs,
      equipment,
      replacedItemId: selectedItem.id,
      candidate,
      rowId: multiplier.id,
      rowKind: "itemIndependentMultiplier",
      globalIndependentMultiplierFactor,
      deltas: candidateContextDeltas,
    });
  };
  const replaceCurrentItem = () => {
    if (!selectedItem || !window.confirm(t.candidate.confirmReplaceCurrentItem)) {
      return;
    }

    const replacement = replaceEquipmentItemWithCandidate(selectedItem, candidate);
    onEquipmentChange(
      equipment.map((item) => (item.id === selectedItem.id ? replacement : item)),
    );
    setReplaceMessage(t.candidate.replaceCurrentItemSuccess);
  };

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

          <div className="candidateEditorPane">
            <EquipmentSimulationEditor
              t={t}
              item={candidate}
              capstoneBonus={baseInputs.capstoneBonus}
              onChange={onCandidateChange}
              baseInputs={baseInputs}
              equipment={candidateReplacementEquipment}
              contributionHelp={t.candidate.candidateContributionHelp}
              getAffixContribution={getCandidateAffixContribution}
              getItemIndependentContribution={getCandidateItemMultiplierContribution}
            />
            <div className="buttonRow candidateActions">
              <button
                type="button"
                className="secondaryButton"
                onClick={replaceCurrentItem}
              >
                {t.candidate.replaceCurrentItem}
              </button>
              {replaceMessage && <span className="positive">{replaceMessage}</span>}
            </div>
            <CandidateCapstoneRecommendationTable
              t={t}
              recommendations={capstoneRecommendations}
            />
          </div>
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

function CandidateCapstoneRecommendationTable({
  t,
  recommendations,
}: {
  t: Translation;
  recommendations: CandidateCapstoneRecommendation[];
}) {
  return (
    <div className="miniPanel">
      <h3>{t.candidate.candidateCapstoneRecommendation}</h3>
      <p>{t.candidate.candidateCapstoneRecommendationHelp}</p>
      {recommendations.length === 0 ? (
        <p>{t.candidate.noCandidateCapstoneAffixes}</p>
      ) : (
        <div className="capstoneGainTable">
          <div className="capstoneGainRow capstoneGainHeader">
            <span>{t.equipment.capstoneAffix}</span>
            <span>{t.equipment.affixValue}</span>
            <span>{t.equipment.totalDamageGain}</span>
          </div>
          {recommendations.map((row) => (
            <div
              className={
                row.isCurrent
                  ? "capstoneGainRow currentCapstoneRow"
                  : "capstoneGainRow"
              }
              key={row.affix.id}
            >
              <span className="truncate" title={t.affix.types[row.affix.type]}>
                {t.affix.types[row.affix.type]}
              </span>
              <strong>{formatBucketValue(row.affix.type, row.value)}</strong>
              <strong
                className={
                  row.gain > 0 ? "positive" : row.gain < 0 ? "negative" : "neutral"
                }
              >
                {formatSignedPercent(row.gain)}
              </strong>
            </div>
          ))}
        </div>
      )}
    </div>
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
