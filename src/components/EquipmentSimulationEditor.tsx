import { useState } from "react";
import {
  Affix,
  AFFIX_TYPES,
  AffixGroup,
  AffixType,
  BaseInputs,
  DeltaRow,
  EquipmentItem,
  ItemIndependentMultiplier,
  calculateEquipmentSetupBreakdown,
  calculateItemIndependentMultiplierContribution,
  createItemIndependentMultiplier,
  calculateEquipmentAffixContribution,
  createEmptyAffix,
  getEffectiveAffixValue,
  itemIndependentMultiplierRowFactor,
  isPercentAffix,
  normalizeEquipmentAffix,
  relativeChange,
  sanitizeItemIndependentMultiplierValue,
} from "../lib/damageModel";
import { Translation } from "../i18n";
import { reorderAffixInEquipmentItem } from "../lib/equipmentOrder";
import {
  formatBucketValue,
  formatNumber,
  formatSignedPercent,
  inputValueForAffix,
  valueFromAffixInput,
} from "./format";

interface EquipmentSimulationEditorProps {
  t: Translation;
  item: EquipmentItem;
  capstoneBonus: number;
  onChange: (item: EquipmentItem) => void;
  baseInputs?: BaseInputs;
  equipment?: EquipmentItem[];
  contributionHelp?: string;
  capstoneDeltas?: DeltaRow[];
  globalIndependentMultiplierFactor?: number;
  getAffixContribution?: (affix: Affix, group: AffixGroup) => number;
  getItemIndependentContribution?: (
    multiplier: ItemIndependentMultiplier,
  ) => number;
}

export function EquipmentSimulationEditor({
  t,
  item,
  capstoneBonus,
  onChange,
  baseInputs,
  equipment,
  contributionHelp,
  capstoneDeltas = [],
  globalIndependentMultiplierFactor = 1,
  getAffixContribution,
  getItemIndependentContribution,
}: EquipmentSimulationEditorProps) {
  const [isEditingRaw, setIsEditingRaw] = useState(false);

  return (
    <section className="selectedEditor">
      <div className="selectedEditorHeader">
        <div>
          <h2>{t.equipment.itemSimulation}</h2>
          <p>{t.equipment.targetValuePreview}</p>
        </div>
      </div>

      <div className="itemTopRow">
        <label className="field">
          <span>{t.equipment.name}</span>
          <input
            value={item.name}
            onChange={(event) => onChange({ ...item, name: event.target.value })}
          />
        </label>
        <button
          type="button"
          className="secondaryButton"
          onClick={() => setIsEditingRaw(true)}
        >
          {t.actions.editItem}
        </button>
      </div>

      <div className="simulationControls">
        <label className="field" title={t.equipment.qualityHelp}>
          <span>{t.equipment.quality}</span>
          <div className="rangeInputPair">
            <input
              type="range"
              min="0"
              max="25"
              value={Math.max(0, Math.min(25, item.targetQuality))}
              onChange={(event) =>
                onChange({ ...item, targetQuality: Number(event.target.value) })
              }
            />
            <input
              type="number"
              value={item.targetQuality}
              onChange={(event) =>
                onChange({ ...item, targetQuality: Number(event.target.value) })
              }
            />
          </div>
        </label>
      </div>

      <AffixSimulationTable
        t={t}
        item={item}
        capstoneBonus={capstoneBonus}
        baseInputs={baseInputs}
        equipment={equipment}
        contributionHelp={contributionHelp}
        getAffixContribution={getAffixContribution}
        getItemIndependentContribution={getItemIndependentContribution}
        onAffixGreaterChange={(affixId, isGreaterAffix) =>
          onChange({
            ...item,
            affixes: item.affixes.map((affix) =>
              affix.id === affixId ? { ...affix, isGreaterAffix } : affix,
            ),
          })
        }
        onTargetCapstoneChange={(targetCapstoneAffixId) =>
          onChange({ ...item, targetCapstoneAffixId })
        }
        onMoveAffix={(affixId, direction) =>
          onChange(reorderAffixInEquipmentItem(item, "item", affixId, direction))
        }
        onMoveExtraAffix={(affixId, direction) =>
          onChange(reorderAffixInEquipmentItem(item, "extra", affixId, direction))
        }
        onItemIndependentMultipliersChange={(itemIndependentMultipliers) =>
          onChange({ ...item, itemIndependentMultipliers })
        }
      />

      {baseInputs && equipment && (
        <CapstoneGainComparison
          t={t}
          item={item}
          equipment={equipment}
          baseInputs={baseInputs}
          capstoneBonus={capstoneBonus}
          deltas={capstoneDeltas}
          globalIndependentMultiplierFactor={globalIndependentMultiplierFactor}
        />
      )}

      {isEditingRaw && (
        <RawItemEditModal
          t={t}
          item={item}
          onCancel={() => setIsEditingRaw(false)}
          onSave={(nextItem) => {
            onChange(nextItem);
            setIsEditingRaw(false);
          }}
        />
      )}
    </section>
  );
}

function AffixSimulationTable({
  t,
  item,
  capstoneBonus,
  baseInputs,
  equipment,
  onTargetCapstoneChange,
  onMoveAffix,
  onMoveExtraAffix,
  onAffixGreaterChange,
  onItemIndependentMultipliersChange,
  contributionHelp,
  getAffixContribution,
  getItemIndependentContribution,
}: {
  t: Translation;
  item: EquipmentItem;
  capstoneBonus: number;
  baseInputs?: BaseInputs;
  equipment?: EquipmentItem[];
  contributionHelp?: string;
  getAffixContribution?: (affix: Affix, group: AffixGroup) => number;
  getItemIndependentContribution?: (
    multiplier: ItemIndependentMultiplier,
  ) => number;
  onTargetCapstoneChange: (affixId: string | null) => void;
  onMoveAffix: (affixId: string, direction: "up" | "down") => void;
  onMoveExtraAffix: (affixId: string, direction: "up" | "down") => void;
  onAffixGreaterChange: (affixId: string, isGreaterAffix: boolean) => void;
  onItemIndependentMultipliersChange: (
    rows: ItemIndependentMultiplier[],
  ) => void;
}) {
  const meaningfulAffixes = item.affixes.filter((affix) => affix.value !== 0);
  const meaningfulExtraAffixes = (item.extraAffixes ?? []).filter(
    (affix) => affix.value !== 0,
  );
  const itemIndependentMultipliers = item.itemIndependentMultipliers ?? [];
  const effectiveContributionHelp =
    contributionHelp ?? t.equipment.affixContributionHelp;

  return (
    <div className="miniPanel">
      <h3>{t.equipment.itemAffixes}</h3>

      {meaningfulAffixes.length === 0 ? (
        <p>{t.equipment.noActiveAffixes}</p>
      ) : (
        <div className="affixValueTable">
          <div className="affixValueRow affixValueHeader">
            <span>{t.equipment.capstone}</span>
            <span>{t.equipment.greaterAffixShort}</span>
            <span>{t.equipment.affixes}</span>
            <span>{t.equipment.value}</span>
            <span title={effectiveContributionHelp}>
              {t.equipment.contribution}
            </span>
            <span>{t.equipment.order}</span>
          </div>
          <div className="affixValueRow capstoneNoneRow">
            <label className="radioOption">
              <input
                type="radio"
                name={`target-capstone-${item.id}`}
                checked={!item.targetCapstoneAffixId}
                onChange={() => onTargetCapstoneChange(null)}
              />
              <span>{t.equipment.none}</span>
            </label>
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          {meaningfulAffixes.map((affix, index) => (
            <div className="affixValueRow" key={affix.id}>
              <label className="radioOnly">
                <input
                  type="radio"
                  name={`target-capstone-${item.id}`}
                  checked={item.targetCapstoneAffixId === affix.id}
                  onChange={() => onTargetCapstoneChange(affix.id)}
                />
                <span className="srOnly">{t.equipment.capstone}</span>
              </label>
              <GreaterAffixStar
                t={t}
                active={affix.isGreaterAffix === true}
                onToggle={() =>
                  onAffixGreaterChange(affix.id, affix.isGreaterAffix !== true)
                }
              />
              <span className="truncate" title={t.affix.types[affix.type]}>
                {t.affix.types[affix.type]}
              </span>
              <strong>
                {formatBucketValue(
                  affix.type,
                  getEffectiveAffixValue(
                    item,
                    affix,
                    "item",
                    capstoneBonus,
                    baseInputs?.greaterAffixBonus,
                  ),
                )}
              </strong>
              <AffixContribution
                baseInputs={baseInputs}
                equipment={equipment}
                item={item}
                affix={affix}
                group="item"
                getContribution={getAffixContribution}
              />
              <AffixOrderControls
                t={t}
                canMoveUp={index > 0}
                canMoveDown={index < meaningfulAffixes.length - 1}
                onMoveUp={() => onMoveAffix(affix.id, "up")}
                onMoveDown={() => onMoveAffix(affix.id, "down")}
              />
            </div>
          ))}
        </div>
      )}

      <div className="affixSectionDivider" />
      <h3>{t.equipment.extraGems}</h3>
      {meaningfulExtraAffixes.length === 0 ? (
        <p>{t.equipment.noExtraGemAffixes}</p>
      ) : (
        <div className="affixValueTable">
          <div className="affixValueRow extraAffixValueRow affixValueHeader">
            <span>{t.equipment.affixes}</span>
            <span>{t.equipment.value}</span>
            <span title={effectiveContributionHelp}>
              {t.equipment.contribution}
            </span>
            <span>{t.equipment.order}</span>
          </div>
          {meaningfulExtraAffixes.map((affix, index) => (
            <div className="affixValueRow extraAffixValueRow" key={affix.id}>
              <span className="truncate" title={t.affix.types[affix.type]}>
                {t.affix.types[affix.type]}
              </span>
              <strong>
                {formatBucketValue(
                  affix.type,
                  getEffectiveAffixValue(item, affix, "extra", capstoneBonus),
                )}
              </strong>
              <AffixContribution
                baseInputs={baseInputs}
                equipment={equipment}
                item={item}
                affix={affix}
                group="extra"
                getContribution={getAffixContribution}
              />
              <AffixOrderControls
                t={t}
                canMoveUp={index > 0}
                canMoveDown={index < meaningfulExtraAffixes.length - 1}
                onMoveUp={() => onMoveExtraAffix(affix.id, "up")}
                onMoveDown={() => onMoveExtraAffix(affix.id, "down")}
              />
            </div>
          ))}
        </div>
      )}

      <div className="affixSectionDivider" />
      <h3>{t.equipment.itemIndependentMultipliers}</h3>
      <p>{t.equipment.itemIndependentMultipliersHelp}</p>
      <ItemIndependentMultiplierTable
        t={t}
        item={item}
        rows={itemIndependentMultipliers}
        baseInputs={baseInputs}
        equipment={equipment}
        contributionHelp={effectiveContributionHelp}
        getContribution={getItemIndependentContribution}
        onChange={onItemIndependentMultipliersChange}
      />
    </div>
  );
}

function ItemIndependentMultiplierTable({
  t,
  item,
  rows,
  baseInputs,
  equipment,
  contributionHelp,
  getContribution,
  onChange,
}: {
  t: Translation;
  item: EquipmentItem;
  rows: ItemIndependentMultiplier[];
  baseInputs?: BaseInputs;
  equipment?: EquipmentItem[];
  contributionHelp: string;
  getContribution?: (multiplier: ItemIndependentMultiplier) => number;
  onChange: (rows: ItemIndependentMultiplier[]) => void;
}) {
  const updateRow = (row: ItemIndependentMultiplier) => {
    onChange(rows.map((current) => (current.id === row.id ? row : current)));
  };
  const moveRow = (rowId: string, direction: "up" | "down") => {
    const index = rows.findIndex((row) => row.id === rowId);
    const nextIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || nextIndex < 0 || nextIndex >= rows.length) {
      return;
    }

    const nextRows = [...rows];
    const row = nextRows[index];
    nextRows[index] = nextRows[nextIndex];
    nextRows[nextIndex] = row;
    onChange(nextRows);
  };

  return (
    <div className="itemMultiplierTable">
      <div className="itemMultiplierRow itemMultiplierHeader">
        <span>{t.equipment.enabled}</span>
        <span>{t.equipment.name}</span>
        <span>{t.equipment.increase}</span>
        <span>{t.equipment.multiplier}</span>
        <span title={contributionHelp}>
          {t.equipment.contribution}
        </span>
        <span>{t.equipment.actions}</span>
      </div>
      {rows.length === 0 ? (
        <p>{t.equipment.noItemIndependentMultipliers}</p>
      ) : (
        rows.map((row, index) => (
          <div className="itemMultiplierRow" key={row.id}>
            <label className="compactCheck">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(event) =>
                  updateRow({ ...row, enabled: event.target.checked })
                }
              />
              <span className="srOnly">{t.equipment.enabled}</span>
            </label>
            <input
              value={row.name}
              placeholder={t.equipment.itemIndependentMultipliers}
              onChange={(event) => updateRow({ ...row, name: event.target.value })}
            />
            <input
              type="number"
              value={row.valuePercent}
              onChange={(event) =>
                updateRow({
                  ...row,
                  valuePercent: sanitizeItemIndependentMultiplierValue(
                    Number(event.target.value),
                  ),
                })
              }
            />
            <strong>
              {formatNumber(itemIndependentMultiplierRowFactor(row.valuePercent), 3)}
            </strong>
            <ItemIndependentContribution
              baseInputs={baseInputs}
              equipment={equipment}
              item={item}
              multiplier={row}
              getContribution={getContribution}
            />
            <span className="globalMultiplierActions">
              <button
                type="button"
                className="iconButton"
                title={t.equipment.moveUp}
                aria-label={t.equipment.moveUp}
                disabled={index === 0}
                onClick={() => moveRow(row.id, "up")}
              >
                ↑
              </button>
              <button
                type="button"
                className="iconButton"
                title={t.equipment.moveDown}
                aria-label={t.equipment.moveDown}
                disabled={index === rows.length - 1}
                onClick={() => moveRow(row.id, "down")}
              >
                ↓
              </button>
              <button
                type="button"
                className="ghostButton"
                onClick={() => onChange(rows.filter((current) => current.id !== row.id))}
              >
                {t.equipment.delete}
              </button>
            </span>
          </div>
        ))
      )}
      <button
        type="button"
        className="secondaryButton"
        onClick={() => onChange([...rows, createItemIndependentMultiplier()])}
      >
        {t.equipment.addItemIndependentMultiplier}
      </button>
    </div>
  );
}

function GreaterAffixStar({
  t,
  active,
  onToggle,
}: {
  t: Translation;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "greaterAffixStar active" : "greaterAffixStar"}
      title={t.equipment.greaterAffixStarHelp}
      aria-label={t.equipment.greaterAffix}
      aria-pressed={active}
      onClick={onToggle}
    >
      {active ? "★" : "☆"}
    </button>
  );
}

function AffixOrderControls({
  t,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  t: Translation;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <span className="affixOrderControls">
      <button
        type="button"
        className="iconButton"
        title={t.equipment.moveUp}
        aria-label={t.equipment.moveUp}
        disabled={!canMoveUp}
        onClick={onMoveUp}
      >
        ↑
      </button>
      <button
        type="button"
        className="iconButton"
        title={t.equipment.moveDown}
        aria-label={t.equipment.moveDown}
        disabled={!canMoveDown}
        onClick={onMoveDown}
      >
        ↓
      </button>
    </span>
  );
}

function AffixContribution({
  baseInputs,
  equipment,
  item,
  affix,
  group,
  getContribution,
}: {
  baseInputs?: BaseInputs;
  equipment?: EquipmentItem[];
  item: EquipmentItem;
  affix: Affix;
  group: AffixGroup;
  getContribution?: (affix: Affix, group: AffixGroup) => number;
}) {
  if (!getContribution && (!baseInputs || !equipment)) {
    return <span className="neutral">-</span>;
  }

  const contribution = getContribution
    ? getContribution(affix, group)
    : calculateEquipmentAffixContribution({
        baseInputs: baseInputs as BaseInputs,
        equipment: equipment as EquipmentItem[],
        itemId: item.id,
        affixId: affix.id,
        group,
      });
  const className =
    contribution > 0 ? "positive" : contribution < 0 ? "negative" : "neutral";

  return <strong className={className}>{formatSignedPercent(contribution)}</strong>;
}

function ItemIndependentContribution({
  baseInputs,
  equipment,
  item,
  multiplier,
  getContribution,
}: {
  baseInputs?: BaseInputs;
  equipment?: EquipmentItem[];
  item: EquipmentItem;
  multiplier: ItemIndependentMultiplier;
  getContribution?: (multiplier: ItemIndependentMultiplier) => number;
}) {
  if (!getContribution && (!baseInputs || !equipment)) {
    return <span className="neutral">-</span>;
  }

  const contribution = getContribution
    ? getContribution(multiplier)
    : calculateItemIndependentMultiplierContribution({
        baseInputs: baseInputs as BaseInputs,
        equipment: equipment as EquipmentItem[],
        itemId: item.id,
        multiplierId: multiplier.id,
      });
  const className =
    contribution > 0 ? "positive" : contribution < 0 ? "negative" : "neutral";

  return <strong className={className}>{formatSignedPercent(contribution)}</strong>;
}

export function NormalizedAffixValues({
  t,
  item,
  capstoneBonus,
  greaterAffixBonus,
  title,
}: {
  t: Translation;
  item: EquipmentItem;
  capstoneBonus: number;
  greaterAffixBonus?: number;
  title: string;
}) {
  const meaningfulAffixes = item.affixes.filter((affix) => affix.value !== 0);
  const meaningfulExtraAffixes = (item.extraAffixes ?? []).filter(
    (affix) => affix.value !== 0,
  );
  const meaningfulItemMultipliers = (item.itemIndependentMultipliers ?? []).filter(
    (row) => row.enabled && row.valuePercent !== 0,
  );
  const hasAffixes =
    meaningfulAffixes.length > 0 ||
    meaningfulExtraAffixes.length > 0 ||
    meaningfulItemMultipliers.length > 0;

  return (
    <div className="miniPanel">
      <h3>{title}</h3>
      {!hasAffixes ? (
        <p>{t.equipment.noAffixes}</p>
      ) : (
        <ul className="normalizedList">
          {meaningfulAffixes.map((affix) => (
            <li key={affix.id}>
              <span className="truncate" title={t.affix.types[affix.type]}>
                {t.affix.types[affix.type]}
              </span>
              <strong>
                {formatBucketValue(
                  affix.type,
                  normalizeEquipmentAffix(
                    item,
                    affix,
                    capstoneBonus,
                    greaterAffixBonus,
                  ),
                )}
              </strong>
            </li>
          ))}
          {meaningfulExtraAffixes.map((affix) => (
            <li key={affix.id}>
              <span className="truncate" title={t.affix.types[affix.type]}>
                {t.equipment.extra}: {t.affix.types[affix.type]}
              </span>
              <strong>
                {formatBucketValue(
                  affix.type,
                  getEffectiveAffixValue(item, affix, "extra", capstoneBonus),
                )}
              </strong>
            </li>
          ))}
          {meaningfulItemMultipliers.map((row) => (
            <li key={row.id}>
              <span className="truncate" title={row.name}>
                {t.equipment.aspectPreview}:{" "}
                {row.name || t.equipment.itemIndependentMultipliers}
              </span>
              <strong>
                {formatNumber(itemIndependentMultiplierRowFactor(row.valuePercent), 3)}
              </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CapstoneGainComparison({
  t,
  item,
  equipment,
  baseInputs,
  capstoneBonus,
  deltas,
  globalIndependentMultiplierFactor,
}: {
  t: Translation;
  item: EquipmentItem;
  equipment: EquipmentItem[];
  baseInputs: BaseInputs;
  capstoneBonus: number;
  deltas: DeltaRow[];
  globalIndependentMultiplierFactor: number;
}) {
  const meaningfulAffixes = item.affixes.filter((affix) => affix.value !== 0);

  if (meaningfulAffixes.length === 0) {
    return (
      <div className="miniPanel">
        <h3>{t.equipment.capstoneGainComparison}</h3>
        <p>{t.equipment.noActiveAffixes}</p>
      </div>
    );
  }

  const baselineItem = { ...item, targetCapstoneAffixId: null };
  const baseline = calculateEquipmentSetupBreakdown({
    baseInputs,
    equipment: replaceEquipmentItem(equipment, item.id, baselineItem),
    globalIndependentMultiplierFactor,
    deltas,
  }).totalDamageFactor;
  const rows = meaningfulAffixes.map((affix, index) => {
    const simulatedItem = { ...item, targetCapstoneAffixId: affix.id };
    const after = calculateEquipmentSetupBreakdown({
      baseInputs,
      equipment: replaceEquipmentItem(equipment, item.id, simulatedItem),
      globalIndependentMultiplierFactor,
      deltas,
    }).totalDamageFactor;

    return {
      affix,
      index,
      value: normalizeEquipmentAffix(
        simulatedItem,
        affix,
        capstoneBonus,
        baseInputs.greaterAffixBonus,
      ),
      gain: relativeChange(baseline, after),
      isCurrent: item.targetCapstoneAffixId === affix.id,
    };
  }).sort((a, b) => b.gain - a.gain || a.index - b.index);

  return (
    <div className="miniPanel">
      <h3>{t.equipment.capstoneGainComparison}</h3>
      <p>{t.equipment.capstoneGainComparisonHelp}</p>
      <div className="capstoneGainTable">
        <div className="capstoneGainRow capstoneGainHeader">
          <span>{t.equipment.capstoneAffix}</span>
          <span>{t.equipment.affixValue}</span>
          <span>{t.equipment.totalDamageGain}</span>
        </div>
        {rows.map((row) => (
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
    </div>
  );
}

function RawItemEditModal({
  t,
  item,
  onCancel,
  onSave,
}: {
  t: Translation;
  item: EquipmentItem;
  onCancel: () => void;
  onSave: (item: EquipmentItem) => void;
}) {
  const [draft, setDraft] = useState<EquipmentItem>(item);

  const updateAffix = (affix: Affix) => {
    setDraft({
      ...draft,
      affixes: draft.affixes.map((current) =>
        current.id === affix.id ? affix : current,
      ),
    });
  };

  const updateExtraAffix = (affix: Affix) => {
    setDraft({
      ...draft,
      extraAffixes: (draft.extraAffixes ?? []).map((current) =>
        current.id === affix.id ? affix : current,
      ),
    });
  };

  const removeAffix = (affixId: string) => {
    setDraft({
      ...draft,
      inputCapstoneAffixId:
        draft.inputCapstoneAffixId === affixId ? null : draft.inputCapstoneAffixId,
      targetCapstoneAffixId:
        draft.targetCapstoneAffixId === affixId ? null : draft.targetCapstoneAffixId,
      affixes: draft.affixes.filter((affix) => affix.id !== affixId),
    });
  };

  const removeExtraAffix = (affixId: string) => {
    setDraft({
      ...draft,
      extraAffixes: (draft.extraAffixes ?? []).filter(
        (affix) => affix.id !== affixId,
      ),
    });
  };
  const updateItemIndependentMultiplier = (
    row: ItemIndependentMultiplier,
  ) => {
    setDraft({
      ...draft,
      itemIndependentMultipliers: (draft.itemIndependentMultipliers ?? []).map(
        (current) => (current.id === row.id ? row : current),
      ),
    });
  };
  const removeItemIndependentMultiplier = (rowId: string) => {
    setDraft({
      ...draft,
      itemIndependentMultipliers: (draft.itemIndependentMultipliers ?? []).filter(
        (row) => row.id !== rowId,
      ),
    });
  };

  return (
    <div className="modalBackdrop" role="presentation">
      <div className="modalPanel" role="dialog" aria-modal="true">
        <div className="panelHeader">
          <div>
            <h2>{t.equipment.itemStateWhenEntered}</h2>
            <p>{t.equipment.itemAffixExtraGemHelp}</p>
          </div>
        </div>

        <div className="inputGrid">
          <label className="field">
            <span>{t.equipment.inputQuality}</span>
            <input
              type="number"
              value={draft.inputQuality}
              onChange={(event) =>
                setDraft({ ...draft, inputQuality: Number(event.target.value) })
              }
            />
          </label>
        </div>

        <h3>{t.equipment.itemAffixes}</h3>
        <div className="rawAffixTable">
          <div className="rawAffixRow rawAffixHeader">
            <span>{t.equipment.inputCapstoneAffix}</span>
            <span>{t.equipment.greaterAffixShort}</span>
            <span>{t.affix.type}</span>
            <span>{t.affix.value}</span>
            <span />
          </div>
          <div className="rawAffixRow rawAffixNoneRow">
            <label className="radioOption">
              <input
                type="radio"
                name={`input-capstone-${draft.id}`}
                checked={!draft.inputCapstoneAffixId}
                onChange={() => setDraft({ ...draft, inputCapstoneAffixId: null })}
              />
              <span>{t.equipment.none}</span>
            </label>
            <span />
            <span />
            <span />
            <span />
          </div>
          {draft.affixes.map((affix) => (
            <div className="rawAffixRow" key={affix.id}>
              <label className="radioOnly">
                <input
                  type="radio"
                  name={`input-capstone-${draft.id}`}
                  checked={draft.inputCapstoneAffixId === affix.id}
                  onChange={() =>
                    setDraft({ ...draft, inputCapstoneAffixId: affix.id })
                  }
                />
                <span className="srOnly">{t.equipment.inputCapstoneAffix}</span>
              </label>
              <GreaterAffixStar
                t={t}
                active={affix.isGreaterAffix === true}
                onToggle={() =>
                  updateAffix({
                    ...affix,
                    isGreaterAffix: affix.isGreaterAffix !== true,
                  })
                }
              />
              <select
                value={affix.type}
                onChange={(event) =>
                  updateAffix({
                    ...affix,
                    type: event.target.value as AffixType,
                  })
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
                title={
                  isPercentAffix(affix.type)
                    ? t.affix.valuePercentHint
                    : undefined
                }
                value={inputValueForAffix(affix.type, affix.value)}
                onChange={(event) =>
                  updateAffix({
                    ...affix,
                    value: valueFromAffixInput(
                      affix.type,
                      Number(event.target.value),
                    ),
                  })
                }
              />
              <button
                className="ghostButton"
                type="button"
                onClick={() => removeAffix(affix.id)}
              >
                {t.actions.remove}
              </button>
            </div>
          ))}
        </div>

        <h3>{t.equipment.extraGems}</h3>
        <div className="rawAffixTable">
          <div className="rawAffixRow extraRawAffixRow rawAffixHeader">
            <span>{t.affix.type}</span>
            <span>{t.affix.value}</span>
            <span />
          </div>
          {(draft.extraAffixes ?? []).map((affix) => (
            <div className="rawAffixRow extraRawAffixRow" key={affix.id}>
              <select
                value={affix.type}
                onChange={(event) =>
                  updateExtraAffix({
                    ...affix,
                    type: event.target.value as AffixType,
                  })
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
                title={
                  isPercentAffix(affix.type)
                    ? t.affix.valuePercentHint
                    : undefined
                }
                value={inputValueForAffix(affix.type, affix.value)}
                onChange={(event) =>
                  updateExtraAffix({
                    ...affix,
                    value: valueFromAffixInput(
                      affix.type,
                      Number(event.target.value),
                    ),
                  })
                }
              />
              <button
                className="ghostButton"
                type="button"
                onClick={() => removeExtraAffix(affix.id)}
              >
                {t.actions.remove}
              </button>
            </div>
          ))}
        </div>

        <h3>{t.equipment.itemIndependentMultipliers}</h3>
        <div className="rawAffixTable">
          <div className="rawAffixRow itemMultiplierRawRow rawAffixHeader">
            <span>{t.equipment.enabled}</span>
            <span>{t.equipment.name}</span>
            <span>{t.equipment.increase}</span>
            <span />
          </div>
          {(draft.itemIndependentMultipliers ?? []).map((row) => (
            <div className="rawAffixRow itemMultiplierRawRow" key={row.id}>
              <label className="compactCheck">
                <input
                  type="checkbox"
                  checked={row.enabled}
                  onChange={(event) =>
                    updateItemIndependentMultiplier({
                      ...row,
                      enabled: event.target.checked,
                    })
                  }
                />
                <span className="srOnly">{t.equipment.enabled}</span>
              </label>
              <input
                value={row.name}
                placeholder={t.equipment.itemIndependentMultipliers}
                onChange={(event) =>
                  updateItemIndependentMultiplier({
                    ...row,
                    name: event.target.value,
                  })
                }
              />
              <input
                type="number"
                value={row.valuePercent}
                onChange={(event) =>
                  updateItemIndependentMultiplier({
                    ...row,
                    valuePercent: sanitizeItemIndependentMultiplierValue(
                      Number(event.target.value),
                    ),
                  })
                }
              />
              <button
                className="ghostButton"
                type="button"
                onClick={() => removeItemIndependentMultiplier(row.id)}
              >
                {t.actions.remove}
              </button>
            </div>
          ))}
        </div>

        <div className="buttonRow modalActions">
          <button
            type="button"
            className="secondaryButton"
            onClick={() =>
              setDraft({ ...draft, affixes: [...draft.affixes, createEmptyAffix()] })
            }
          >
            {t.equipment.addItemAffix}
          </button>
          <button
            type="button"
            className="secondaryButton"
            onClick={() =>
              setDraft({
                ...draft,
                extraAffixes: [
                  ...(draft.extraAffixes ?? []),
                  createEmptyAffix(),
                ],
              })
            }
          >
            {t.equipment.addExtraGem}
          </button>
          <button
            type="button"
            className="secondaryButton"
            onClick={() =>
              setDraft({
                ...draft,
                itemIndependentMultipliers: [
                  ...(draft.itemIndependentMultipliers ?? []),
                  createItemIndependentMultiplier(),
                ],
              })
            }
          >
            {t.equipment.addItemIndependentMultiplier}
          </button>
          <button type="button" className="ghostButton" onClick={onCancel}>
            {t.actions.cancel}
          </button>
          <button
            type="button"
            className="secondaryButton"
            onClick={() => onSave(resolveSavedItemCapstoneTarget(draft))}
          >
            {t.actions.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function resolveSavedItemCapstoneTarget(item: EquipmentItem): EquipmentItem {
  if (!item.inputCapstoneAffixId) {
    return item;
  }

  const inputCapstoneStillExists = item.affixes.some(
    (affix) => affix.id === item.inputCapstoneAffixId,
  );

  return inputCapstoneStillExists
    ? { ...item, targetCapstoneAffixId: item.inputCapstoneAffixId }
    : item;
}

function replaceEquipmentItem(
  equipment: EquipmentItem[],
  itemId: string,
  nextItem: EquipmentItem,
): EquipmentItem[] {
  return equipment.map((item) => (item.id === itemId ? nextItem : item));
}
