import { describe, expect, it } from "vitest";
import {
  DEFAULT_BASE_INPUTS,
  EMPTY_GEAR_TOTALS,
  GearTotals,
  aggregateGear,
  applyDeltasToGearTotals,
  buildCandidateReplacementEquipment,
  calculateCandidateCapstoneRecommendations,
  calculateCandidateRowContribution,
  calculateEquipmentAffixContribution,
  calculateDamageBreakdown,
  calculateEquipmentBreakdown,
  calculateEquipmentIndependentMultiplierFactor,
  calculateGlobalIndependentMultiplierFactor,
  calculateItemIndependentMultiplierContribution,
  calculateItemIndependentMultiplierFactor,
  compareWithDeltas,
  compareWithReplacement,
  createEquipmentItem,
  getSkillRankMultiplier,
  normalizeAffixValueToTarget,
  replaceEquipmentItemWithCandidate,
} from "./damageModel";
import { parseImportedState } from "./storage";

const baseInputs = { ...DEFAULT_BASE_INPUTS };

const gloveExampleTotals: GearTotals = {
  ...EMPTY_GEAR_TOTALS,
  gearCritDamageMultiplier: 2.3,
  gearVulnerableDamageMultiplier: 0.8,
};

describe("normalizeAffixValueToTarget", () => {
  it("scales a percent affix from quality 0 to quality 25", () => {
    expect(
      normalizeAffixValueToTarget({
        inputValue: 0.25,
        inputQuality: 0,
        targetQuality: 25,
        capstoneBonus: 0.5,
        inputHasCapstone: false,
        targetHasCapstone: false,
      }),
    ).toBeCloseTo(0.3125);
  });

  it("scales a percent affix from quality 25 back to quality 0", () => {
    expect(
      normalizeAffixValueToTarget({
        inputValue: 0.3125,
        inputQuality: 25,
        targetQuality: 0,
        capstoneBonus: 0.5,
        inputHasCapstone: false,
        targetHasCapstone: false,
      }),
    ).toBeCloseTo(0.25);
  });

  it("applies target capstone after target quality", () => {
    expect(
      normalizeAffixValueToTarget({
        inputValue: 0.25,
        inputQuality: 0,
        targetQuality: 25,
        capstoneBonus: 0.5,
        inputHasCapstone: false,
        targetHasCapstone: true,
      }),
    ).toBeCloseTo(0.46875);
  });

  it("removes input capstone before applying target state", () => {
    expect(
      normalizeAffixValueToTarget({
        inputValue: 0.46875,
        inputQuality: 25,
        targetQuality: 0,
        capstoneBonus: 0.5,
        inputHasCapstone: true,
        targetHasCapstone: false,
      }),
    ).toBeCloseTo(0.25);
  });
});

describe("damage formula", () => {
  it("matches the base glove example factors", () => {
    const breakdown = calculateDamageBreakdown(baseInputs, gloveExampleTotals);

    expect(breakdown.critFactor).toBeCloseTo(3.765);
    expect(breakdown.vulnerableFactor).toBeCloseTo(1.696);
  });

  it("matches the old formula when conditional additive damage is zero", () => {
    const breakdown = calculateDamageBreakdown(baseInputs, gloveExampleTotals);
    const expectedOldTotal = 3.5 * 3.765 * 1.696 * 11;

    expect(breakdown.additiveFactor).toBeCloseTo(11);
    expect(breakdown.expectedCombatFactor).toBeCloseTo(3.765 * 1.696 * 11);
    expect(breakdown.totalDamageFactor).toBeCloseTo(expectedOldTotal);
  });

  it("+Crit Damage only affects crit states", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseCritChance: 0.5,
        vulnerableUptime: 0,
        baseAdditivePool: 1,
        baseCritDamageAdditive: 1,
      },
      EMPTY_GEAR_TOTALS,
    );

    const nonCritState = breakdown.stateBreakdown.find(
      (state) => !state.crit && !state.vulnerable,
    );
    const critState = breakdown.stateBreakdown.find(
      (state) => state.crit && !state.vulnerable,
    );
    const vulnerableStates = breakdown.stateBreakdown.filter(
      (state) => state.vulnerable,
    );

    expect(nonCritState?.additiveFactor).toBeCloseTo(2);
    expect(critState?.additiveFactor).toBeCloseTo(3);
    vulnerableStates.forEach((state) => {
      expect(state.probability).toBeCloseTo(0);
    });
  });

  it("+Vulnerable Damage only affects vulnerable states", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseCritChance: 0,
        vulnerableUptime: 0.5,
        baseAdditivePool: 1,
        baseVulnerableDamageAdditive: 1,
      },
      EMPTY_GEAR_TOTALS,
    );

    const nonVulnerableState = breakdown.stateBreakdown.find(
      (state) => !state.crit && !state.vulnerable,
    );
    const vulnerableState = breakdown.stateBreakdown.find(
      (state) => !state.crit && state.vulnerable,
    );
    const critStates = breakdown.stateBreakdown.filter((state) => state.crit);

    expect(nonVulnerableState?.additiveFactor).toBeCloseTo(2);
    expect(vulnerableState?.additiveFactor).toBeCloseTo(3);
    critStates.forEach((state) => {
      expect(state.probability).toBeCloseTo(0);
    });
  });

  it("applies both conditional additive stats together", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseCritChance: 1,
        vulnerableUptime: 1,
        baseAdditivePool: 1,
        baseCritDamageAdditive: 1,
        baseVulnerableDamageAdditive: 1,
      },
      EMPTY_GEAR_TOTALS,
    );
    const critVulnerableState = breakdown.stateBreakdown.find(
      (state) => state.crit && state.vulnerable,
    );

    expect(critVulnerableState?.probability).toBeCloseTo(1);
    expect(critVulnerableState?.additiveFactor).toBeCloseTo(4);
  });

  it("aggregates new conditional additive affix types", () => {
    const item = createEquipmentItem("Test item", 0);
    item.affixes = [
      { id: "crit-add", type: "critDamageAdditive", value: 0.5 },
      { id: "vuln-add", type: "vulnerableDamageAdditive", value: 0.75 },
    ];
    const gearTotals = aggregateGear([item], DEFAULT_BASE_INPUTS);
    const before = calculateDamageBreakdown(DEFAULT_BASE_INPUTS, EMPTY_GEAR_TOTALS);
    const after = calculateDamageBreakdown(DEFAULT_BASE_INPUTS, gearTotals);

    expect(gearTotals.gearCritDamageAdditive).toBeCloseTo(0.5);
    expect(gearTotals.gearVulnerableDamageAdditive).toBeCloseTo(0.75);
    expect(after.totalDamageFactor).toBeGreaterThan(before.totalDamageFactor);
  });

  it("applies manual changes for conditional additive types", () => {
    const comparison = compareWithDeltas(DEFAULT_BASE_INPUTS, EMPTY_GEAR_TOTALS, [
      { id: "crit-add", type: "critDamageAdditive", value: 1 },
      { id: "vuln-add", type: "vulnerableDamageAdditive", value: 1 },
    ]);

    expect(comparison.after.totalCritDamageAdditive).toBeCloseTo(1);
    expect(comparison.after.totalVulnerableDamageAdditive).toBeCloseTo(1);
    expect(comparison.totalRelativeChange).toBeGreaterThan(0);
  });

  it("uses the effective capstone bonus default", () => {
    expect(DEFAULT_BASE_INPUTS.capstoneBonus).toBeCloseTo(0.333333, 5);
  });

  it("matches Glove A delta", () => {
    const comparison = compareWithDeltas(baseInputs, gloveExampleTotals, [
      { id: "a-crit", type: "critChance", value: 0.06 },
      { id: "a-vuln", type: "vulnerableDamageMultiplier", value: 0.25 },
    ]);

    expect(comparison.totalRelativeChange * 100).toBeCloseTo(17.58, 1);
  });

  it("matches Glove B delta", () => {
    const comparison = compareWithDeltas(baseInputs, gloveExampleTotals, [
      { id: "b-crit-damage", type: "critDamageMultiplier", value: 0.45 },
      { id: "b-vuln", type: "vulnerableDamageMultiplier", value: 0.2 },
    ]);

    expect(comparison.totalRelativeChange * 100).toBeCloseTo(22.11, 1);
  });

  it("matches boosted Glove A and Glove B deltas", () => {
    const boostedA = compareWithDeltas(baseInputs, gloveExampleTotals, [
      { id: "a-crit", type: "critChance", value: 0.06 },
      { id: "a-vuln-boosted", type: "vulnerableDamageMultiplier", value: 0.3 },
    ]);
    const boostedB = compareWithDeltas(baseInputs, gloveExampleTotals, [
      {
        id: "b-crit-damage-boosted",
        type: "critDamageMultiplier",
        value: 0.54,
      },
      { id: "b-vuln", type: "vulnerableDamageMultiplier", value: 0.2 },
    ]);

    expect(boostedA.totalRelativeChange * 100).toBeCloseTo(19.83, 1);
    expect(boostedB.totalRelativeChange * 100).toBeCloseTo(24.83, 1);
  });

  it("clamps crit chance to the configured cap", () => {
    const breakdown = calculateDamageBreakdown(baseInputs, {
      ...EMPTY_GEAR_TOTALS,
      gearCritChance: 0.5,
    });

    expect(breakdown.totalCritChance).toBe(1);
  });
});

describe("global independent multiplier layer", () => {
  it("defaults to a neutral factor with no rows", () => {
    expect(calculateGlobalIndependentMultiplierFactor([], true)).toBe(1);
  });

  it("multiplies enabled rows as 1 + valuePercent / 100", () => {
    const factor = calculateGlobalIndependentMultiplierFactor(
      [
        { id: "paragon", enabled: true, name: "Paragon", valuePercent: 25 },
        { id: "buff", enabled: true, name: "Buff", valuePercent: 40 },
      ],
      true,
    );

    expect(factor).toBeCloseTo(1.75);
  });

  it("ignores disabled rows and preserves a neutral factor when toggled off", () => {
    const rows = [
      { id: "enabled", enabled: true, name: "Enabled", valuePercent: 25 },
      { id: "disabled", enabled: false, name: "Disabled", valuePercent: 40 },
    ];

    expect(calculateGlobalIndependentMultiplierFactor(rows, true)).toBeCloseTo(
      1.25,
    );
    expect(calculateGlobalIndependentMultiplierFactor(rows, false)).toBe(1);
  });

  it("scales the Damage Index without changing other factors", () => {
    const withoutGlobal = calculateDamageBreakdown(
      DEFAULT_BASE_INPUTS,
      EMPTY_GEAR_TOTALS,
    );
    const globalFactor = calculateGlobalIndependentMultiplierFactor(
      [{ id: "global", enabled: true, name: "Global", valuePercent: 25 }],
      true,
    );
    const withGlobal = calculateDamageBreakdown(
      DEFAULT_BASE_INPUTS,
      EMPTY_GEAR_TOTALS,
      globalFactor,
    );

    expect(withGlobal.globalIndependentMultiplierFactor).toBeCloseTo(1.25);
    expect(withGlobal.mainStatFactor).toBeCloseTo(withoutGlobal.mainStatFactor);
    expect(withGlobal.totalDamageFactor).toBeCloseTo(
      withoutGlobal.totalDamageFactor * 1.25,
    );
  });

  it("does not change percentage gain when applied equally before and after", () => {
    const deltas = [{ id: "main-stat", type: "mainStat" as const, value: 300 }];
    const withoutGlobal = compareWithDeltas(
      DEFAULT_BASE_INPUTS,
      EMPTY_GEAR_TOTALS,
      deltas,
    );
    const globalFactor = calculateGlobalIndependentMultiplierFactor(
      [
        { id: "paragon", enabled: true, name: "Paragon", valuePercent: 25 },
        { id: "buff", enabled: true, name: "Buff", valuePercent: 40 },
      ],
      true,
    );
    const withGlobal = compareWithDeltas(
      DEFAULT_BASE_INPUTS,
      EMPTY_GEAR_TOTALS,
      deltas,
      globalFactor,
    );

    expect(withGlobal.totalRelativeChange).toBeCloseTo(
      withoutGlobal.totalRelativeChange,
    );
  });
});

describe("equipment independent multiplier layer", () => {
  it("defaults to a neutral factor with no item rows", () => {
    const item = createEquipmentItem("No aspect item", 0);

    expect(calculateItemIndependentMultiplierFactor(item)).toBe(1);
    expect(calculateEquipmentIndependentMultiplierFactor([item])).toBe(1);
  });

  it("multiplies enabled item rows as 1 + valuePercent / 100", () => {
    const item = createEquipmentItem("Aspect item", 0);
    item.itemIndependentMultipliers = [
      { id: "aspect", enabled: true, name: "Aspect", valuePercent: 35 },
      { id: "unique", enabled: true, name: "Unique", valuePercent: 120 },
    ];

    expect(calculateItemIndependentMultiplierFactor(item)).toBeCloseTo(
      1.35 * 2.2,
    );
  });

  it("ignores disabled item rows", () => {
    const item = createEquipmentItem("Aspect item", 0);
    item.itemIndependentMultipliers = [
      { id: "enabled", enabled: true, name: "Enabled", valuePercent: 35 },
      { id: "disabled", enabled: false, name: "Disabled", valuePercent: 120 },
    ];

    expect(calculateItemIndependentMultiplierFactor(item)).toBeCloseTo(1.35);
  });

  it("multiplies item factors across enabled equipment", () => {
    const itemA = createEquipmentItem("Item A", 0);
    const itemB = createEquipmentItem("Item B", 0);
    itemA.itemIndependentMultipliers = [
      { id: "a", enabled: true, name: "A", valuePercent: 35 },
    ];
    itemB.itemIndependentMultipliers = [
      { id: "b", enabled: true, name: "B", valuePercent: 120 },
    ];

    expect(calculateEquipmentIndependentMultiplierFactor([itemA, itemB])).toBeCloseTo(
      1.35 * 2.2,
    );
  });

  it("scales the Damage Index through equipment breakdown", () => {
    const item = createEquipmentItem("Aspect item", 0);
    item.itemIndependentMultipliers = [
      { id: "aspect", enabled: true, name: "Aspect", valuePercent: 35 },
    ];
    const without = calculateEquipmentBreakdown(DEFAULT_BASE_INPUTS, []);
    const withItemMultiplier = calculateEquipmentBreakdown(DEFAULT_BASE_INPUTS, [
      item,
    ]);

    expect(withItemMultiplier.equipmentIndependentMultiplierFactor).toBeCloseTo(
      1.35,
    );
    expect(withItemMultiplier.totalDamageFactor).toBeCloseTo(
      without.totalDamageFactor * 1.35,
    );
  });

  it("candidate replacement changes the equipment independent factor", () => {
    const current = createEquipmentItem("Current", 0);
    const candidate = createEquipmentItem("Candidate", 0);
    current.itemIndependentMultipliers = [
      { id: "current-aspect", enabled: true, name: "Current", valuePercent: 35 },
    ];
    candidate.itemIndependentMultipliers = [
      { id: "candidate-unique", enabled: true, name: "Candidate", valuePercent: 120 },
    ];

    const comparison = compareWithReplacement(
      DEFAULT_BASE_INPUTS,
      [current],
      current.id,
      candidate,
    );

    expect(
      comparison.before.equipmentIndependentMultiplierFactor,
    ).toBeCloseTo(1.35);
    expect(comparison.after.equipmentIndependentMultiplierFactor).toBeCloseTo(2.2);
  });

  it("calculates row contribution by removing only that row", () => {
    const item = createEquipmentItem("Aspect item", 0);
    item.itemIndependentMultipliers = [
      { id: "aspect", enabled: true, name: "Aspect", valuePercent: 35 },
      { id: "unique", enabled: true, name: "Unique", valuePercent: 120 },
    ];

    const contribution = calculateItemIndependentMultiplierContribution({
      baseInputs: DEFAULT_BASE_INPUTS,
      equipment: [item],
      itemId: item.id,
      multiplierId: "aspect",
    });

    expect(contribution).toBeCloseTo(0.35);
  });
});

describe("candidate item comparison helpers", () => {
  it("calculates candidate normal affix contribution in replacement context", () => {
    const current = createEquipmentItem("Current", 0);
    const candidate = createEquipmentItem("Candidate", 0);
    candidate.affixes = [
      { id: "candidate-main", type: "mainStat", value: 300 },
    ];

    const contribution = calculateCandidateRowContribution({
      baseInputs: DEFAULT_BASE_INPUTS,
      equipment: [current],
      replacedItemId: current.id,
      candidate,
      rowId: "candidate-main",
      rowKind: "itemAffix",
    });
    const replacementEquipment = buildCandidateReplacementEquipment(
      [current],
      current.id,
      candidate,
    );
    const withoutEquipment = buildCandidateReplacementEquipment(
      [current],
      current.id,
      { ...candidate, affixes: [] },
    );
    const currentDamage = calculateEquipmentBreakdown(
      DEFAULT_BASE_INPUTS,
      replacementEquipment,
    ).totalDamageFactor;
    const withoutDamage = calculateEquipmentBreakdown(
      DEFAULT_BASE_INPUTS,
      withoutEquipment,
    ).totalDamageFactor;

    expect(contribution).toBeCloseTo(currentDamage / withoutDamage - 1);
  });

  it("calculates candidate extra / gem contribution in replacement context", () => {
    const current = createEquipmentItem("Current", 0);
    const candidate = createEquipmentItem("Candidate", 0);
    candidate.affixes = [];
    candidate.extraAffixes = [
      { id: "candidate-extra", type: "typeAllDamageMultiplier", value: 0.2 },
    ];

    const contribution = calculateCandidateRowContribution({
      baseInputs: DEFAULT_BASE_INPUTS,
      equipment: [current],
      replacedItemId: current.id,
      candidate,
      rowId: "candidate-extra",
      rowKind: "extraAffix",
    });

    expect(contribution).toBeCloseTo(0.2);
  });

  it("calculates candidate independent / aspect multiplier contribution", () => {
    const current = createEquipmentItem("Current", 0);
    const candidate = createEquipmentItem("Candidate", 0);
    candidate.affixes = [];
    candidate.itemIndependentMultipliers = [
      { id: "candidate-aspect", enabled: true, name: "Aspect", valuePercent: 35 },
    ];

    const contribution = calculateCandidateRowContribution({
      baseInputs: DEFAULT_BASE_INPUTS,
      equipment: [current],
      replacedItemId: current.id,
      candidate,
      rowId: "candidate-aspect",
      rowKind: "itemIndependentMultiplier",
    });

    expect(contribution).toBeCloseTo(0.35);
  });

  it("calculates candidate capstone recommendations from normal affixes only", () => {
    const current = createEquipmentItem("Current", 0);
    const candidate = createEquipmentItem("Candidate", 25);
    candidate.affixes = [
      { id: "candidate-main", type: "mainStat", value: 300 },
      { id: "candidate-type", type: "typeAllDamageMultiplier", value: 0.1 },
    ];
    candidate.extraAffixes = [
      { id: "candidate-extra", type: "typeAllDamageMultiplier", value: 0.2 },
    ];
    candidate.itemIndependentMultipliers = [
      { id: "candidate-aspect", enabled: true, name: "Aspect", valuePercent: 35 },
    ];
    candidate.targetCapstoneAffixId = "candidate-type";

    const recommendations = calculateCandidateCapstoneRecommendations({
      baseInputs: DEFAULT_BASE_INPUTS,
      equipment: [current],
      replacedItemId: current.id,
      candidate,
    });

    expect(recommendations.map((row) => row.affix.id).sort()).toEqual([
      "candidate-main",
      "candidate-type",
    ]);
    expect(recommendations.some((row) => row.affix.id === "candidate-extra")).toBe(
      false,
    );
    expect(
      recommendations.some((row) => row.affix.id === "candidate-aspect"),
    ).toBe(false);
    expect(
      recommendations.find((row) => row.affix.id === "candidate-type")?.isCurrent,
    ).toBe(true);
  });

  it("includes manual deltas in candidate contribution when provided", () => {
    const current = createEquipmentItem("Current", 0);
    const candidate = createEquipmentItem("Candidate", 0);
    const deltas = [{ id: "manual-main", type: "mainStat" as const, value: 200 }];
    candidate.affixes = [
      { id: "candidate-main", type: "mainStat", value: 300 },
    ];

    const contribution = calculateCandidateRowContribution({
      baseInputs: DEFAULT_BASE_INPUTS,
      equipment: [current],
      replacedItemId: current.id,
      candidate,
      rowId: "candidate-main",
      rowKind: "itemAffix",
      deltas,
    });
    const replacementEquipment = buildCandidateReplacementEquipment(
      [current],
      current.id,
      candidate,
    );
    const withoutEquipment = buildCandidateReplacementEquipment(
      [current],
      current.id,
      { ...candidate, affixes: [] },
    );
    const currentTotals = applyDeltasToGearTotals(
      aggregateGear(replacementEquipment, DEFAULT_BASE_INPUTS),
      deltas,
    );
    const withoutTotals = applyDeltasToGearTotals(
      aggregateGear(withoutEquipment, DEFAULT_BASE_INPUTS),
      deltas,
    );
    const currentDamage = calculateDamageBreakdown(
      DEFAULT_BASE_INPUTS,
      currentTotals,
      1,
      calculateEquipmentIndependentMultiplierFactor(replacementEquipment),
    ).totalDamageFactor;
    const withoutDamage = calculateDamageBreakdown(
      DEFAULT_BASE_INPUTS,
      withoutTotals,
      1,
      calculateEquipmentIndependentMultiplierFactor(withoutEquipment),
    ).totalDamageFactor;

    expect(contribution).toBeCloseTo(currentDamage / withoutDamage - 1);
  });

  it("replaces current item data without baking in manual deltas", () => {
    const current = createEquipmentItem("Current", 0);
    const candidate = createEquipmentItem("Candidate", 25);
    current.id = "current-id";
    current.enabled = false;
    candidate.inputCapstoneAffixId = "candidate-main";
    candidate.targetCapstoneAffixId = "candidate-main";
    candidate.affixes = [
      { id: "candidate-main", type: "mainStat", value: 300 },
    ];
    candidate.extraAffixes = [
      { id: "candidate-extra", type: "typeAllDamageMultiplier", value: 0.2 },
    ];
    candidate.itemIndependentMultipliers = [
      { id: "candidate-aspect", enabled: true, name: "Aspect", valuePercent: 35 },
    ];

    const replacement = replaceEquipmentItemWithCandidate(current, candidate);

    expect(replacement.id).toBe("current-id");
    expect(replacement.enabled).toBe(false);
    expect(replacement.name).toBe("Candidate");
    expect(replacement.affixes).toEqual(candidate.affixes);
    expect(replacement.extraAffixes).toEqual(candidate.extraAffixes);
    expect(replacement.itemIndependentMultipliers).toEqual(
      candidate.itemIndependentMultipliers,
    );
    expect(replacement.inputCapstoneAffixId).toBe("candidate-main");
    expect(replacement.targetCapstoneAffixId).toBe("candidate-main");
  });
});

describe("extra / gem affixes", () => {
  it("loads existing equipment without extraAffixes as an empty list", () => {
    const imported = parseImportedState(
      JSON.stringify({
        version: 1,
        baseInputs: DEFAULT_BASE_INPUTS,
        equipment: [
          {
            id: "old-item",
            name: "Old item",
            enabled: true,
            inputQuality: 0,
            targetQuality: 25,
            affixes: [{ id: "normal", type: "mainStat", value: 100 }],
          },
        ],
      }),
    );

    expect(imported.equipment[0].extraAffixes).toEqual([]);
  });

  it("aggregates extra / gem affixes directly into totals", () => {
    const item = createEquipmentItem("Gem item", 25);
    item.affixes = [];
    item.extraAffixes = [
      { id: "extra-type", type: "typeAllDamageMultiplier", value: 0.1 },
      { id: "extra-add", type: "additiveDamage", value: 1 },
    ];

    const totals = aggregateGear([item], DEFAULT_BASE_INPUTS);

    expect(totals.gearTypeAllDamageMultiplier).toBeCloseTo(0.1);
    expect(totals.gearAdditiveDamage).toBeCloseTo(1);
  });

  it("does not apply quality scaling to extra / gem affixes", () => {
    const itemAtZero = createEquipmentItem("Gem item", 0);
    itemAtZero.affixes = [];
    itemAtZero.extraAffixes = [
      { id: "extra-type", type: "typeAllDamageMultiplier", value: 0.1 },
    ];
    const itemAtTwentyFive = { ...itemAtZero, targetQuality: 25 };

    expect(
      aggregateGear([itemAtZero], DEFAULT_BASE_INPUTS)
        .gearTypeAllDamageMultiplier,
    ).toBeCloseTo(0.1);
    expect(
      aggregateGear([itemAtTwentyFive], DEFAULT_BASE_INPUTS)
        .gearTypeAllDamageMultiplier,
    ).toBeCloseTo(0.1);
  });

  it("does not apply capstone scaling to extra / gem affixes", () => {
    const item = createEquipmentItem("Gem item", 25);
    item.affixes = [{ id: "normal", type: "mainStat", value: 100 }];
    item.extraAffixes = [
      { id: "extra-type", type: "typeAllDamageMultiplier", value: 0.1 },
    ];
    const withoutCapstone = aggregateGear([item], DEFAULT_BASE_INPUTS);
    const withCapstone = aggregateGear(
      [{ ...item, targetCapstoneAffixId: "normal" }],
      DEFAULT_BASE_INPUTS,
    );

    expect(withoutCapstone.gearTypeAllDamageMultiplier).toBeCloseTo(0.1);
    expect(withCapstone.gearTypeAllDamageMultiplier).toBeCloseTo(0.1);
    expect(withCapstone.gearMainStat).toBeGreaterThan(withoutCapstone.gearMainStat);
  });

  it("keeps normal affix quality and capstone normalization", () => {
    const item = createEquipmentItem("Normal item", 25);
    item.affixes = [{ id: "normal", type: "typeAllDamageMultiplier", value: 0.1 }];
    item.extraAffixes = [];
    const totals = aggregateGear(
      [{ ...item, targetCapstoneAffixId: "normal" }],
      DEFAULT_BASE_INPUTS,
    );

    expect(totals.gearTypeAllDamageMultiplier).toBeCloseTo(
      0.1 * 1.25 * (1 + DEFAULT_BASE_INPUTS.capstoneBonus),
    );
  });

  it("calculates per-affix contribution against removing only that affix", () => {
    const item = createEquipmentItem("Contribution item", 0);
    item.affixes = [
      { id: "normal", type: "typeAllDamageMultiplier", value: 0.1 },
    ];
    item.extraAffixes = [
      { id: "extra", type: "additiveDamage", value: 1 },
    ];
    const equipment = [item];
    const current = calculateDamageBreakdown(
      DEFAULT_BASE_INPUTS,
      aggregateGear(equipment, DEFAULT_BASE_INPUTS),
    ).totalDamageFactor;
    const withoutNormal = calculateDamageBreakdown(
      DEFAULT_BASE_INPUTS,
      aggregateGear([{ ...item, affixes: [] }], DEFAULT_BASE_INPUTS),
    ).totalDamageFactor;

    const contribution = calculateEquipmentAffixContribution({
      baseInputs: DEFAULT_BASE_INPUTS,
      equipment,
      itemId: item.id,
      affixId: "normal",
      group: "item",
    });

    expect(contribution).toBeGreaterThan(0);
    expect(contribution).toBeCloseTo(current / withoutNormal - 1);
  });
});

describe("weapon damage layer", () => {
  it("falls back to relative index when base weapon damage is missing", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseWeaponDamageMin: 0,
        baseWeaponDamageMax: 0,
        includeWeaponDamage: true,
      },
      { ...EMPTY_GEAR_TOTALS, gearWeaponDamage: 690 },
    );

    expect(breakdown.weaponDamageFactor).toBe(1);
    expect(breakdown.damageBase).toBe(1);
    expect(breakdown.totalDamageFactor).not.toBe(0);
  });

  it("ignores weapon damage when disabled", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseWeaponDamageMin: 4000,
        baseWeaponDamageMax: 5000,
        includeWeaponDamage: false,
      },
      { ...EMPTY_GEAR_TOTALS, gearWeaponDamage: 690 },
    );

    expect(breakdown.weaponDamageFactor).toBe(1);
    expect(breakdown.damageBase).toBe(1);
  });

  it("uses effective weapon damage when enabled", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseWeaponDamageMin: 4000,
        baseWeaponDamageMax: 5000,
        includeWeaponDamage: true,
      },
      { ...EMPTY_GEAR_TOTALS, gearWeaponDamage: 690 },
    );

    expect(breakdown.baseAverageWeaponDamage).toBe(4500);
    expect(breakdown.effectiveWeaponDamage).toBe(5190);
    expect(breakdown.weaponDamageFactor).toBeCloseTo(5190 / 4500);
    expect(breakdown.damageBase).toBe(5190);
  });

  it("uses effective weapon damage directly in the Damage Index", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseCritChance: 0,
        vulnerableUptime: 0,
        baseMainStat: 1000,
        mainStatCoefficient: 0.001,
        baseAdditivePool: 3,
        baseWeaponDamageMin: 4000,
        baseWeaponDamageMax: 5000,
        includeWeaponDamage: true,
      },
      { ...EMPTY_GEAR_TOTALS, gearWeaponDamage: 690, gearTypeAllDamageMultiplier: 2 },
    );

    expect(breakdown.mainStatFactor).toBeCloseTo(2);
    expect(breakdown.typeAllMultiplierFactor).toBeCloseTo(3);
    expect(breakdown.expectedCombatFactor).toBeCloseTo(4);
    expect(breakdown.totalDamageFactor).toBeCloseTo(5190 * 2 * 3 * 4);
  });

  it("normal item +Weapon Damage respects quality", () => {
    const item = createEquipmentItem("Weapon item", 25);
    item.affixes = [{ id: "weapon", type: "weaponDamage", value: 100 }];
    item.extraAffixes = [];

    expect(aggregateGear([item], DEFAULT_BASE_INPUTS).gearWeaponDamage).toBeCloseTo(
      125,
    );
  });

  it("normal item +Weapon Damage respects capstone", () => {
    const item = createEquipmentItem("Weapon item", 25);
    item.affixes = [{ id: "weapon", type: "weaponDamage", value: 100 }];
    item.extraAffixes = [];
    item.targetCapstoneAffixId = "weapon";

    expect(aggregateGear([item], DEFAULT_BASE_INPUTS).gearWeaponDamage).toBeCloseTo(
      125 * (1 + DEFAULT_BASE_INPUTS.capstoneBonus),
    );
  });

  it("extra / gem +Weapon Damage ignores quality and capstone", () => {
    const item = createEquipmentItem("Weapon item", 25);
    item.affixes = [{ id: "normal", type: "mainStat", value: 100 }];
    item.extraAffixes = [{ id: "weapon", type: "weaponDamage", value: 100 }];
    item.targetCapstoneAffixId = "normal";

    expect(aggregateGear([item], DEFAULT_BASE_INPUTS).gearWeaponDamage).toBe(100);
  });

  it("manual +Weapon Damage affects after-change Damage Index when enabled", () => {
    const comparison = compareWithDeltas(
      {
        ...DEFAULT_BASE_INPUTS,
        baseWeaponDamageMin: 4000,
        baseWeaponDamageMax: 5000,
        includeWeaponDamage: true,
      },
      EMPTY_GEAR_TOTALS,
      [{ id: "weapon-delta", type: "weaponDamage", value: 690 }],
    );

    expect(comparison.after.effectiveWeaponDamage).toBe(5190);
    expect(comparison.totalRelativeChange).toBeGreaterThan(0);
  });

  it("imports old JSON with weapon damage defaults", () => {
    const imported = parseImportedState(
      JSON.stringify({
        version: 1,
        baseInputs: {
          ...DEFAULT_BASE_INPUTS,
          baseWeaponDamageMin: undefined,
          baseWeaponDamageMax: undefined,
          includeWeaponDamage: undefined,
        },
        equipment: [],
      }),
    );

    expect(imported.baseInputs.baseWeaponDamageMin).toBe(0);
    expect(imported.baseInputs.baseWeaponDamageMax).toBe(0);
    expect(imported.baseInputs.includeWeaponDamage).toBe(true);
    expect(imported.typicalRolls.weaponDamage).toBe(690);
  });
});

describe("skill rank damage layer", () => {
  it("uses the skill rank multiplier formula with rank clamping", () => {
    expect(getSkillRankMultiplier(1)).toBeCloseTo(1);
    expect(getSkillRankMultiplier(5)).toBeCloseTo(1.45);
    expect(getSkillRankMultiplier(10)).toBeCloseTo(2);
    expect(getSkillRankMultiplier(0)).toBeCloseTo(1);
    expect(getSkillRankMultiplier(100)).toBeCloseTo(
      1 + 49 * 0.1 + Math.floor(50 / 5) * 0.05,
    );
  });

  it("keeps the skill rank factor at 1 when disabled", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseMainSkillRank: 5,
        includeSkillRankDamage: false,
      },
      { ...EMPTY_GEAR_TOTALS, gearSkillRanks: 3 },
    );

    expect(breakdown.totalMainSkillRank).toBe(8);
    expect(breakdown.skillDamageFactor).toBe(1);
  });

  it("uses total skill rank as the skill damage factor", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseMainSkillRank: 5,
        includeSkillRankDamage: true,
      },
      { ...EMPTY_GEAR_TOTALS, gearSkillRanks: 3 },
    );

    expect(breakdown.totalMainSkillRank).toBe(8);
    expect(breakdown.skillDamageFactor).toBeCloseTo(getSkillRankMultiplier(8));
  });

  it("keeps default skill base multiplier behavior identical to rank-only behavior", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseMainSkillRank: 5,
        includeSkillRankDamage: true,
        includeSkillBaseMultiplier: true,
        mainSkillBaseMultiplier: 100,
      },
      { ...EMPTY_GEAR_TOTALS, gearSkillRanks: 3 },
    );

    expect(breakdown.skillDamageFactor).toBeCloseTo(getSkillRankMultiplier(8));
    expect(breakdown.skillBaseMultiplierFactor).toBe(1);
  });

  it("multiplies skill rank damage by the main skill base multiplier", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseMainSkillRank: 10,
        includeSkillRankDamage: true,
        includeSkillBaseMultiplier: true,
        mainSkillBaseMultiplier: 250,
      },
      EMPTY_GEAR_TOTALS,
    );

    expect(getSkillRankMultiplier(10)).toBeCloseTo(2);
    expect(breakdown.skillBaseMultiplierFactor).toBeCloseTo(2.5);
    expect(breakdown.skillDamageFactor).toBeCloseTo(5);
  });

  it("ignores the main skill base multiplier when its toggle is disabled", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseMainSkillRank: 10,
        includeSkillRankDamage: true,
        includeSkillBaseMultiplier: false,
        mainSkillBaseMultiplier: 250,
      },
      EMPTY_GEAR_TOTALS,
    );

    expect(breakdown.skillDamageFactor).toBeCloseTo(getSkillRankMultiplier(10));
    expect(breakdown.skillBaseMultiplierFactor).toBe(1);
  });

  it("falls back to 100% when the main skill base multiplier is invalid", () => {
    const breakdown = calculateDamageBreakdown(
      {
        ...DEFAULT_BASE_INPUTS,
        baseMainSkillRank: 10,
        includeSkillBaseMultiplier: true,
        mainSkillBaseMultiplier: 0,
      },
      EMPTY_GEAR_TOTALS,
    );

    expect(breakdown.skillBaseMultiplierFactor).toBe(1);
    expect(breakdown.skillDamageFactor).toBeCloseTo(getSkillRankMultiplier(10));
  });

  it("rounds normal item skill ranks after quality and capstone scaling", () => {
    const item = createEquipmentItem("Skill item", 25);
    item.affixes = [{ id: "skill", type: "skillRanks", value: 2 }];
    item.extraAffixes = [];
    item.targetCapstoneAffixId = "skill";

    expect(aggregateGear([item], DEFAULT_BASE_INPUTS).gearSkillRanks).toBe(3);
  });

  it("extra / gem skill ranks ignore quality and capstone but still round", () => {
    const item = createEquipmentItem("Skill item", 25);
    item.affixes = [{ id: "normal", type: "mainStat", value: 100 }];
    item.extraAffixes = [{ id: "skill", type: "skillRanks", value: 2.4 }];
    item.targetCapstoneAffixId = "normal";

    expect(aggregateGear([item], DEFAULT_BASE_INPUTS).gearSkillRanks).toBe(2);
  });

  it("manual skill rank changes are rounded and clamped through total rank", () => {
    const comparison = compareWithDeltas(
      {
        ...DEFAULT_BASE_INPUTS,
        baseMainSkillRank: 2,
        includeSkillRankDamage: true,
      },
      EMPTY_GEAR_TOTALS,
      [{ id: "skill-delta", type: "skillRanks", value: 2.6 }],
    );
    const reduced = compareWithDeltas(
      {
        ...DEFAULT_BASE_INPUTS,
        baseMainSkillRank: 2,
        includeSkillRankDamage: true,
      },
      EMPTY_GEAR_TOTALS,
      [{ id: "skill-delta-negative", type: "skillRanks", value: -10 }],
    );

    expect(comparison.after.totalMainSkillRank).toBe(5);
    expect(comparison.totalRelativeChange).toBeGreaterThan(0);
    expect(reduced.after.totalMainSkillRank).toBe(1);
  });

  it("imports old JSON with skill rank defaults", () => {
    const imported = parseImportedState(
      JSON.stringify({
        version: 1,
        baseInputs: {
          ...DEFAULT_BASE_INPUTS,
          baseMainSkillRank: undefined,
          includeSkillRankDamage: undefined,
          mainSkillBaseMultiplier: undefined,
          includeSkillBaseMultiplier: undefined,
        },
        equipment: [],
      }),
    );

    expect(imported.baseInputs.baseMainSkillRank).toBe(1);
    expect(imported.baseInputs.includeSkillRankDamage).toBe(true);
    expect(imported.baseInputs.mainSkillBaseMultiplier).toBe(100);
    expect(imported.baseInputs.includeSkillBaseMultiplier).toBe(true);
    expect(imported.typicalRolls.skillRanks).toBe(3);
  });
});
