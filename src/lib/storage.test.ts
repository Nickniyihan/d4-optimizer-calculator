import { describe, expect, it } from "vitest";
import { DEFAULT_BASE_INPUTS, DEFAULT_TYPICAL_ROLLS } from "./damageModel";
import {
  createExportFileName,
  parseImportedState,
  serializeStateForExport,
} from "./storage";

function createExportableState() {
  return {
    version: 1 as const,
    baseInputs: { ...DEFAULT_BASE_INPUTS },
    equipment: [
      {
        id: "item-1",
        name: "Test item",
        enabled: true,
        inputQuality: 0,
        targetQuality: 25,
        inputCapstoneAffixId: "affix-b",
        targetCapstoneAffixId: "affix-b",
        affixes: [
          { id: "affix-a", type: "mainStat" as const, value: 100 },
          { id: "affix-b", type: "critChance" as const, value: 0.06 },
        ],
        extraAffixes: [
          { id: "extra-a", type: "weaponDamage" as const, value: 690 },
          {
            id: "extra-b",
            type: "typeAllDamageMultiplier" as const,
            value: 0.1,
          },
        ],
        itemIndependentMultipliers: [
          {
            id: "item-multiplier-a",
            enabled: true,
            name: "Aspect",
            valuePercent: 35,
          },
          {
            id: "item-multiplier-b",
            enabled: false,
            name: "Unique",
            valuePercent: 120,
          },
        ],
      },
    ],
    quickDeltas: [{ id: "delta-a", type: "skillRanks" as const, value: 3 }],
    typicalRolls: { ...DEFAULT_TYPICAL_ROLLS },
    includeGlobalIndependentMultipliers: true,
    globalIndependentMultipliers: [
      {
        id: "global-a",
        enabled: true,
        name: "Paragon board",
        valuePercent: 25,
      },
      {
        id: "global-b",
        enabled: false,
        name: "Situational buff",
        valuePercent: 40,
      },
    ],
  };
}

describe("JSON import/export helpers", () => {
  it("serializes major app state sections for export", () => {
    const exported = serializeStateForExport(createExportableState());
    const parsed = JSON.parse(exported);

    expect(parsed.baseInputs).toBeDefined();
    expect(parsed.equipment[0].affixes).toHaveLength(2);
    expect(parsed.equipment[0].extraAffixes).toHaveLength(2);
    expect(parsed.equipment[0].itemIndependentMultipliers).toHaveLength(2);
    expect(parsed.quickDeltas).toHaveLength(1);
    expect(parsed.typicalRolls).toBeDefined();
    expect(parsed.includeGlobalIndependentMultipliers).toBe(true);
    expect(parsed.globalIndependentMultipliers).toHaveLength(2);
  });

  it("creates the requested export filename format", () => {
    expect(createExportFileName(new Date(2026, 5, 9, 7, 4))).toBe(
      "d4-damage-gain-calculator-20260609-0704.json",
    );
  });

  it("accepts a valid exported state", () => {
    const imported = parseImportedState(
      serializeStateForExport(createExportableState()),
    );

    expect(imported.equipment[0].name).toBe("Test item");
  });

  it("rejects invalid JSON", () => {
    expect(() => parseImportedState("{bad json")).toThrow(SyntaxError);
  });

  it("rejects unrelated JSON", () => {
    expect(() => parseImportedState(JSON.stringify({ hello: "world" }))).toThrow(
      /version/i,
    );
  });

  it("defaults missing optional extraAffixes to an empty array", () => {
    const state = createExportableState();
    const { extraAffixes: _extraAffixes, ...itemWithoutExtras } =
      state.equipment[0];
    const imported = parseImportedState(
      JSON.stringify({
        ...state,
        equipment: [itemWithoutExtras],
      }),
    );

    expect(imported.equipment[0].extraAffixes).toEqual([]);
  });

  it("defaults missing optional itemIndependentMultipliers to an empty array", () => {
    const state = createExportableState();
    const {
      itemIndependentMultipliers: _itemIndependentMultipliers,
      ...itemWithoutItemMultipliers
    } = state.equipment[0];
    const imported = parseImportedState(
      JSON.stringify({
        ...state,
        equipment: [itemWithoutItemMultipliers],
      }),
    );

    expect(imported.equipment[0].itemIndependentMultipliers).toEqual([]);
  });

  it("clears capstone ids that point to missing affixes", () => {
    const state = createExportableState();
    state.equipment[0].inputCapstoneAffixId = "missing";
    state.equipment[0].targetCapstoneAffixId = "missing";

    const imported = parseImportedState(JSON.stringify(state));

    expect(imported.equipment[0].inputCapstoneAffixId).toBeNull();
    expect(imported.equipment[0].targetCapstoneAffixId).toBeNull();
  });

  it("normalizes duplicate affix ids within the same item table", () => {
    const state = createExportableState();
    state.equipment[0].affixes[1].id = "affix-a";

    const imported = parseImportedState(JSON.stringify(state));

    expect(imported.equipment[0].affixes.map((affix) => affix.id)).toEqual([
      "affix-a",
      "affix-a-1",
    ]);
  });

  it("normalizes duplicate equipment item ids", () => {
    const state = createExportableState();
    state.equipment.push({
      ...state.equipment[0],
      name: "Duplicate id item",
    });

    const imported = parseImportedState(JSON.stringify(state));

    expect(imported.equipment.map((item) => item.id)).toEqual([
      "item-1",
      "item-1-1",
    ]);
  });

  it("preserves normal and extra affix row order", () => {
    const imported = parseImportedState(
      serializeStateForExport(createExportableState()),
    );

    expect(imported.equipment[0].affixes.map((affix) => affix.id)).toEqual([
      "affix-a",
      "affix-b",
    ]);
    expect(imported.equipment[0].extraAffixes.map((affix) => affix.id)).toEqual([
      "extra-a",
      "extra-b",
    ]);
    expect(
      imported.equipment[0].itemIndependentMultipliers.map((row) => row.id),
    ).toEqual(["item-multiplier-a", "item-multiplier-b"]);
  });

  it("normalizes duplicate item independent multiplier ids within one item", () => {
    const state = createExportableState();
    state.equipment[0].itemIndependentMultipliers[1].id = "item-multiplier-a";

    const imported = parseImportedState(JSON.stringify(state));

    expect(
      imported.equipment[0].itemIndependentMultipliers.map((row) => row.id),
    ).toEqual(["item-multiplier-a", "item-multiplier-a-1"]);
  });

  it("defaults missing global independent multiplier settings", () => {
    const state = createExportableState();
    const {
      includeGlobalIndependentMultipliers: _includeGlobalIndependentMultipliers,
      globalIndependentMultipliers: _globalIndependentMultipliers,
      ...oldState
    } = state;

    const imported = parseImportedState(JSON.stringify(oldState));

    expect(imported.includeGlobalIndependentMultipliers).toBe(true);
    expect(imported.globalIndependentMultipliers).toEqual([]);
  });

  it("preserves global independent multiplier row order", () => {
    const imported = parseImportedState(
      serializeStateForExport(createExportableState()),
    );

    expect(imported.globalIndependentMultipliers.map((row) => row.id)).toEqual([
      "global-a",
      "global-b",
    ]);
  });

  it("normalizes duplicate global independent multiplier ids", () => {
    const state = createExportableState();
    state.globalIndependentMultipliers[1].id = "global-a";

    const imported = parseImportedState(JSON.stringify(state));

    expect(imported.globalIndependentMultipliers.map((row) => row.id)).toEqual([
      "global-a",
      "global-a-1",
    ]);
  });
});
