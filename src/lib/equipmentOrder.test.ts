import { describe, expect, it } from "vitest";
import { createEquipmentItem } from "./damageModel";
import { reorderAffixInEquipmentItem, reorderEquipmentItem } from "./equipmentOrder";

describe("equipment affix reordering", () => {
  it("reorders normal item affixes while keeping ids and values", () => {
    const item = createEquipmentItem("Order test", 0);
    item.affixes = [
      { id: "a", type: "mainStat", value: 100 },
      { id: "b", type: "critChance", value: 0.06 },
      { id: "c", type: "weaponDamage", value: 690 },
    ];

    const reordered = reorderAffixInEquipmentItem(item, "item", "b", "up");

    expect(reordered.affixes.map((affix) => affix.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(reordered.affixes.find((affix) => affix.id === "b")?.value).toBe(
      0.06,
    );
  });

  it("reorders extra / gem affixes while keeping ids and values", () => {
    const item = createEquipmentItem("Extra order test", 0);
    item.extraAffixes = [
      { id: "extra-a", type: "typeAllDamageMultiplier", value: 0.1 },
      { id: "extra-b", type: "weaponDamage", value: 690 },
    ];

    const reordered = reorderAffixInEquipmentItem(
      item,
      "extra",
      "extra-a",
      "down",
    );

    expect(reordered.extraAffixes.map((affix) => affix.id)).toEqual([
      "extra-b",
      "extra-a",
    ]);
    expect(
      reordered.extraAffixes.find((affix) => affix.id === "extra-a")?.value,
    ).toBe(0.1);
  });

  it("keeps capstone selections valid because ids are preserved", () => {
    const item = createEquipmentItem("Capstone order test", 0);
    item.affixes = [
      { id: "a", type: "mainStat", value: 100 },
      { id: "b", type: "critChance", value: 0.06 },
    ];
    item.inputCapstoneAffixId = "b";
    item.targetCapstoneAffixId = "b";

    const reordered = reorderAffixInEquipmentItem(item, "item", "b", "up");

    expect(reordered.affixes[0].id).toBe("b");
    expect(reordered.inputCapstoneAffixId).toBe("b");
    expect(reordered.targetCapstoneAffixId).toBe("b");
  });
});

describe("equipment list reordering", () => {
  it("reorders equipment while preserving ids", () => {
    const helm = createEquipmentItem("Helm", 0);
    const chest = createEquipmentItem("Chest", 0);
    const gloves = createEquipmentItem("Gloves", 0);
    helm.id = "helm";
    chest.id = "chest";
    gloves.id = "gloves";

    const reordered = reorderEquipmentItem([helm, chest, gloves], "chest", "up");

    expect(reordered.map((item) => item.id)).toEqual(["chest", "helm", "gloves"]);
    expect(reordered[0]).toBe(chest);
  });

  it("keeps the equipment list unchanged at boundaries", () => {
    const helm = createEquipmentItem("Helm", 0);
    const chest = createEquipmentItem("Chest", 0);
    helm.id = "helm";
    chest.id = "chest";
    const equipment = [helm, chest];

    expect(reorderEquipmentItem(equipment, "helm", "up")).toBe(equipment);
    expect(reorderEquipmentItem(equipment, "missing", "down")).toBe(equipment);
  });
});
