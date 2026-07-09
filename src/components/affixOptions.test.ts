import { describe, expect, it } from "vitest";
import { en } from "../i18n/en";
import { buildAffixOptions } from "./affixOptions";

describe("affix option visibility filtering", () => {
  const customStats = [
    {
      id: "fury",
      enabled: true,
      name: "Maximum Fury",
      affixLabel: "Maximum Fury",
      baseValue: 100,
      affixValueScale: 2,
    },
  ];

  it("hides built-in affixes from dropdown options", () => {
    const options = buildAffixOptions(en, customStats, {
      critChance: false,
    });

    expect(options.some((option) => option.value === "critChance")).toBe(false);
    expect(options.some((option) => option.value === "mainStat")).toBe(true);
  });

  it("hides custom stat affixes from dropdown options", () => {
    const options = buildAffixOptions(en, customStats, {
      "customStat:fury": false,
    });

    expect(options.some((option) => option.value === "customStat:fury")).toBe(
      false,
    );
  });

  it("keeps the currently selected hidden option visible for its row", () => {
    const options = buildAffixOptions(
      en,
      customStats,
      {
        critChance: false,
        "customStat:fury": false,
      },
      "customStat:fury",
    );

    expect(options.some((option) => option.value === "critChance")).toBe(false);
    expect(options.some((option) => option.value === "customStat:fury")).toBe(
      true,
    );
  });

  it("keeps a currently selected missing custom stat option visible", () => {
    const options = buildAffixOptions(
      en,
      [],
      {},
      "customStat:deleted-stat",
    );

    expect(options.some((option) => option.value === "customStat:deleted-stat")).toBe(
      true,
    );
  });
});
