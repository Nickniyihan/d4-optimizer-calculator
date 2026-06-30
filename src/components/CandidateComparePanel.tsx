import { useEffect, useMemo, useState } from "react";
import {
  BaseInputs,
  EquipmentItem,
  compareWithReplacement,
  createEquipmentItem,
  createId,
  itemIndependentMultiplierRowFactor,
  normalizeEquipmentAffix,
} from "../lib/damageModel";
import { Translation } from "../i18n";
import { EquipmentCard } from "./EquipmentCard";
import {
  formatBucketValue,
  formatNumber,
  formatSignedPercent,
} from "./format";
import { FormulaBreakdown } from "./FormulaBreakdown";

interface CandidateComparePanelProps {
  t: Translation;
  baseInputs: BaseInputs;
  equipment: EquipmentItem[];
}

export function CandidateComparePanel({
  t,
  baseInputs,
  equipment,
}: CandidateComparePanelProps) {
  const firstItemId = equipment[0]?.id ?? "";
  const [selectedItemId, setSelectedItemId] = useState(firstItemId);
  const selectedItem =
    equipment.find((item) => item.id === selectedItemId) ?? equipment[0];
  const [candidate, setCandidate] = useState<EquipmentItem>(() =>
    selectedItem
      ? cloneAsCandidate(selectedItem, t.equipment.candidateName)
      : createEquipmentItem(t.equipment.candidateName),
  );

  useEffect(() => {
    if (!equipment.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(equipment[0]?.id ?? "");
    }
  }, [equipment, selectedItemId]);

  const comparison = useMemo(() => {
    if (!selectedItem) {
      return null;
    }

    return compareWithReplacement(
      baseInputs,
      equipment,
      selectedItem.id,
      candidate,
    );
  }, [baseInputs, candidate, equipment, selectedItem]);

  if (!selectedItem || !comparison) {
    return null;
  }

  return (
    <section className="panel">
      <div className="panelHeader">
        <div>
          <h2>{t.panels.candidateCompare}</h2>
          <p>{t.candidate.intro}</p>
        </div>
        <button
          type="button"
          className="secondaryButton"
          onClick={() =>
            setCandidate(cloneAsCandidate(selectedItem, t.equipment.candidateName))
          }
        >
          {t.actions.useCurrent}
        </button>
      </div>

      <label className="field slimField">
        <span>{t.equipment.selectedSlot}</span>
        <select
          value={selectedItem.id}
          onChange={(event) => {
            const nextItem = equipment.find((item) => item.id === event.target.value);
            setSelectedItemId(event.target.value);
            if (nextItem) {
              setCandidate(cloneAsCandidate(nextItem, t.equipment.candidateName));
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

      <EquipmentCard t={t} item={candidate} onChange={setCandidate} compact />

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

      <div className="normalizedGrid">
        <NormalizedAffixes
          t={t}
          title={t.candidate.normalizedCurrent}
          item={selectedItem}
          capstoneBonus={baseInputs.capstoneBonus}
        />
        <NormalizedAffixes
          t={t}
          title={t.candidate.normalizedCandidate}
          item={candidate}
          capstoneBonus={baseInputs.capstoneBonus}
        />
      </div>
    </section>
  );
}

function NormalizedAffixes({
  t,
  title,
  item,
  capstoneBonus,
}: {
  t: Translation;
  title: string;
  item: EquipmentItem;
  capstoneBonus: number;
}) {
  return (
    <div className="miniPanel">
      <h3>{title}</h3>
      <ul className="normalizedList">
        {item.affixes.map((affix) => (
          <li key={affix.id}>
            <span>{t.affix.types[affix.type]}</span>
            <strong>
              {formatBucketValue(
                affix.type,
                normalizeEquipmentAffix(item, affix, capstoneBonus),
              )}
            </strong>
          </li>
        ))}
        {(item.extraAffixes ?? []).map((affix) => (
          <li key={affix.id}>
            <span>
              {t.equipment.extra}: {t.affix.types[affix.type]}
            </span>
            <strong>{formatBucketValue(affix.type, affix.value)}</strong>
          </li>
        ))}
        {(item.itemIndependentMultipliers ?? [])
          .filter((row) => row.enabled && row.valuePercent !== 0)
          .map((row) => (
            <li key={row.id}>
              <span>
                {t.equipment.aspectPreview}:{" "}
                {row.name || t.equipment.itemIndependentMultipliers}
              </span>
              <strong>
                {formatNumber(itemIndependentMultiplierRowFactor(row.valuePercent), 3)}
              </strong>
            </li>
          ))}
      </ul>
    </div>
  );
}

function cloneAsCandidate(
  item: EquipmentItem,
  candidateName: string,
): EquipmentItem {
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
