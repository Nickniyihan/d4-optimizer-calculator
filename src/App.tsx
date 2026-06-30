import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Language,
  Translation,
  getInitialLanguage,
  saveLanguage,
  translations,
} from "./i18n";
import {
  AppState,
  aggregateGear,
  calculateDamageBreakdown,
  calculateEquipmentBreakdown,
  calculateEquipmentIndependentMultiplierFactor,
  calculateGlobalIndependentMultiplierFactor,
  applyDeltasToGearTotals,
  compareBreakdowns,
  compareWithDeltas,
  compareWithReplacement,
} from "./lib/damageModel";
import {
  DEFAULT_EQUIPMENT_KEYS,
  EquipmentNameMap,
  createDefaultState,
  createGlovesComparisonPreset,
} from "./lib/presets";
import {
  loadAutoSavePreference,
  loadState,
  parseImportedState,
  createExportFileName,
  saveAutoSavePreference,
  saveState,
  serializeStateForExport,
} from "./lib/storage";
import { BaseSettingsWorkspace } from "./components/BaseSettingsWorkspace";
import type { ClassPreset } from "./components/BaseSettingsWorkspace";
import {
  CompareEditorTab,
  CompareSourceMode,
  CompareWorkspace,
  cloneAsCandidate,
} from "./components/CompareWorkspace";
import { Dashboard, DashboardTab } from "./components/Dashboard";
import { EquipmentWorkspace } from "./components/EquipmentWorkspace";

type WorkTab = "baseAndSettings" | "equipment" | "compare";
type PresetKey = "empty" | "gloves";

const workTabs: WorkTab[] = ["baseAndSettings", "equipment", "compare"];
const CLASS_PRESET_STORAGE_KEY = "d4-calculator-class-preset";

export default function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const baseTranslation = translations[language];
  const [classPreset, setClassPreset] = useState<ClassPreset>(loadClassPreset);
  const t = useMemo(
    () => withMainStatLabel(baseTranslation, classPreset),
    [baseTranslation, classPreset],
  );
  const equipmentNames = t.equipment.defaultNames as EquipmentNameMap;
  const [state, setState] = useState<AppState>(() => {
    const initialLanguage = getInitialLanguage();
    const initialNames = translations[initialLanguage].equipment
      .defaultNames as EquipmentNameMap;

    try {
      return localizeDefaultEquipmentNames(
        loadState() ?? createDefaultState(initialNames),
        initialNames,
      );
    } catch {
      return createDefaultState(initialNames);
    }
  });
  const [activeWorkTab, setActiveWorkTab] = useState<WorkTab>("equipment");
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("stats");
  const [compareEditorTab, setCompareEditorTab] =
    useState<CompareEditorTab>("manualChanges");
  const [compareSourceMode, setCompareSourceMode] =
    useState<CompareSourceMode>("manualChangesOnly");
  const [candidateItemId, setCandidateItemId] = useState(
    state.equipment[0]?.id ?? "",
  );
  const [candidate, setCandidate] = useState(() =>
    cloneAsCandidate(state.equipment[0], t.equipment.candidateName),
  );
  const [presetKey, setPresetKey] = useState<PresetKey>("empty");
  const [jsonMessage, setJsonMessage] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(loadAutoSavePreference);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoSaveEnabled) {
      saveState(state);
    }
  }, [autoSaveEnabled, state]);

  useEffect(() => {
    localStorage.setItem(CLASS_PRESET_STORAGE_KEY, classPreset);
  }, [classPreset]);

  useEffect(() => {
    if (!state.equipment.some((item) => item.id === candidateItemId)) {
      const nextItem = state.equipment[0];
      setCandidateItemId(nextItem?.id ?? "");
      setCandidate(cloneAsCandidate(nextItem, t.equipment.candidateName));
    }
  }, [candidateItemId, state.equipment, t.equipment.candidateName]);

  const gearTotals = useMemo(
    () => aggregateGear(state.equipment, state.baseInputs),
    [state.baseInputs, state.equipment],
  );
  const globalIndependentMultiplierFactor = useMemo(
    () =>
      calculateGlobalIndependentMultiplierFactor(
        state.globalIndependentMultipliers,
        state.includeGlobalIndependentMultipliers,
      ),
    [
      state.globalIndependentMultipliers,
      state.includeGlobalIndependentMultipliers,
    ],
  );
  const equipmentIndependentMultiplierFactor = useMemo(
    () => calculateEquipmentIndependentMultiplierFactor(state.equipment),
    [state.equipment],
  );
  const breakdown = useMemo(
    () =>
      calculateEquipmentBreakdown(
        state.baseInputs,
        state.equipment,
        globalIndependentMultiplierFactor,
      ),
    [globalIndependentMultiplierFactor, state.baseInputs, state.equipment],
  );
  const activeComparison = useMemo(() => {
    if (compareSourceMode === "manualChangesOnly") {
      return compareWithDeltas(
        state.baseInputs,
        gearTotals,
        state.quickDeltas,
        globalIndependentMultiplierFactor,
        equipmentIndependentMultiplierFactor,
      );
    }

    const selectedItem = state.equipment.find((item) => item.id === candidateItemId);
    if (!selectedItem) {
      return null;
    }

    if (compareSourceMode === "candidateItemOnly") {
      return compareWithReplacement(
          state.baseInputs,
          state.equipment,
          selectedItem.id,
          candidate,
          globalIndependentMultiplierFactor,
      );
    }

    const before = calculateEquipmentBreakdown(
      state.baseInputs,
      state.equipment,
      globalIndependentMultiplierFactor,
    );
    const replacementEquipment = state.equipment.map((item) =>
      item.id === selectedItem.id ? { ...candidate, enabled: true } : item,
    );
    const afterGearTotals = applyDeltasToGearTotals(
      aggregateGear(replacementEquipment, state.baseInputs),
      state.quickDeltas,
    );
    const after = calculateDamageBreakdown(
      state.baseInputs,
      afterGearTotals,
      globalIndependentMultiplierFactor,
      calculateEquipmentIndependentMultiplierFactor(replacementEquipment),
    );

    return compareBreakdowns(before, after);
  }, [
    candidate,
    candidateItemId,
    compareSourceMode,
    gearTotals,
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
    state.baseInputs,
    state.equipment,
    state.quickDeltas,
  ]);

  const handleLanguageChange = (nextLanguage: Language) => {
    const nextNames = translations[nextLanguage].equipment
      .defaultNames as EquipmentNameMap;

    setLanguage(nextLanguage);
    saveLanguage(nextLanguage);
    setState((currentState) =>
      localizeDefaultEquipmentNames(currentState, nextNames),
    );
  };

  const loadPreset = () => {
    const nextState =
      presetKey === "gloves"
        ? createGlovesComparisonPreset(equipmentNames)
        : createDefaultState(equipmentNames);
    setState(nextState);
    saveState(nextState);
  };

  const openExport = () => {
    const blob = new Blob([serializeStateForExport(state)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = createExportFileName();
    anchor.click();
    URL.revokeObjectURL(url);
    setJsonMessage(t.importExport.exportJsonSuccess);
    setJsonError("");
  };

  const openImport = () => {
    setJsonMessage("");
    setJsonError("");
    fileInputRef.current?.click();
  };

  const importJsonFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!window.confirm(t.importExport.confirmImportJson)) {
      return;
    }

    try {
      const jsonText = await file.text();
      const nextState = localizeDefaultEquipmentNames(
        parseImportedState(jsonText),
        equipmentNames,
      );
      setState(nextState);
      saveState(nextState);
      setJsonMessage(t.importExport.importJsonSuccess);
      setJsonError("");
    } catch (error) {
      setJsonMessage("");
      setJsonError(
        error instanceof SyntaxError
          ? t.importExport.importJsonInvalidJson
          : t.importExport.importJsonInvalidState,
      );
    }
  };

  return (
    <main className="appShell">
      <header className="appHeader">
        <div className="titleBlock">
          <h1>{t.app.title}</h1>
          <p>{t.app.subtitle}</p>
        </div>

        <div className="headerControls">
          <LanguageSelector
            t={t}
            language={language}
            onChange={handleLanguageChange}
          />
          <label className="headerField">
            <span>{t.actions.loadPreset}</span>
            <select
              value={presetKey}
              onChange={(event) => setPresetKey(event.target.value as PresetKey)}
            >
              <option value="empty">{t.presets.empty}</option>
              <option value="gloves">{t.presets.gloves}</option>
            </select>
          </label>
          <button type="button" className="secondaryButton" onClick={loadPreset}>
            {t.actions.loadPreset}
          </button>
          <button type="button" className="ghostButton" onClick={openImport}>
            {t.actions.importJson}
          </button>
          <input
            ref={fileInputRef}
            className="srOnly"
            type="file"
            accept="application/json,.json"
            onChange={importJsonFile}
          />
          <button type="button" className="ghostButton" onClick={openExport}>
            {t.actions.exportJson}
          </button>
          <button
            type="button"
            className="dangerButton"
            onClick={() => {
              const nextState = createDefaultState(equipmentNames);
              setState(nextState);
              saveState(nextState);
            }}
          >
            {t.actions.reset}
          </button>
          {(jsonMessage || jsonError) && (
            <p className={jsonError ? "headerStatus errorText" : "headerStatus successText"}>
              {jsonError || jsonMessage}
            </p>
          )}
        </div>
      </header>

      <div className="mainLayout">
        <section className="workArea">
          <div className="tabStrip workTabs">
            {workTabs.map((tab) => (
              <button
                type="button"
                key={tab}
                title={getWorkTabHelp(t, tab)}
                className={activeWorkTab === tab ? "tabButton activeTab" : "tabButton"}
                onClick={() => setActiveWorkTab(tab)}
              >
                {t.panels[tab]}
              </button>
            ))}
          </div>

          <div className="tabContent">
            {activeWorkTab === "baseAndSettings" && (
              <div className="stackedPanels">
                <BaseSettingsWorkspace
                  t={t}
                  baseInputs={state.baseInputs}
                  typicalRolls={state.typicalRolls}
                  includeGlobalIndependentMultipliers={
                    state.includeGlobalIndependentMultipliers
                  }
                  globalIndependentMultipliers={
                    state.globalIndependentMultipliers
                  }
                  globalIndependentMultiplierFactor={
                    globalIndependentMultiplierFactor
                  }
                  autoSaveEnabled={autoSaveEnabled}
                  classPreset={classPreset}
                  onBaseInputsChange={(baseInputs) =>
                    setState({ ...state, baseInputs })
                  }
                  onTypicalRollsChange={(typicalRolls) =>
                    setState({ ...state, typicalRolls })
                  }
                  onIncludeGlobalIndependentMultipliersChange={(
                    includeGlobalIndependentMultipliers,
                  ) =>
                    setState({
                      ...state,
                      includeGlobalIndependentMultipliers,
                    })
                  }
                  onGlobalIndependentMultipliersChange={(
                    globalIndependentMultipliers,
                  ) =>
                    setState({
                      ...state,
                      globalIndependentMultipliers,
                    })
                  }
                  onAutoSaveEnabledChange={(enabled) => {
                    setAutoSaveEnabled(enabled);
                    saveAutoSavePreference(enabled);
                    if (enabled) {
                      saveState(state);
                    }
                  }}
                  onClassPresetChange={setClassPreset}
                />
              </div>
            )}

            {activeWorkTab === "equipment" && (
              <EquipmentWorkspace
                t={t}
                equipment={state.equipment}
                baseInputs={state.baseInputs}
                capstoneBonus={state.baseInputs.capstoneBonus}
                defaultTargetQuality={state.baseInputs.defaultTargetQuality}
                onChange={(equipment) => setState({ ...state, equipment })}
              />
            )}

            {activeWorkTab === "compare" && (
              <CompareWorkspace
                t={t}
                language={language}
                activeEditorTab={compareEditorTab}
                onEditorTabChange={setCompareEditorTab}
                sourceMode={compareSourceMode}
                onSourceModeChange={setCompareSourceMode}
                baseInputs={state.baseInputs}
                gearTotals={gearTotals}
                quickDeltas={state.quickDeltas}
                onQuickDeltasChange={(quickDeltas) =>
                  setState({ ...state, quickDeltas })
                }
                equipment={state.equipment}
                selectedItemId={candidateItemId}
                onSelectedItemIdChange={setCandidateItemId}
                candidate={candidate}
                onCandidateChange={setCandidate}
                comparison={activeComparison}
              />
            )}
          </div>
        </section>

        <Dashboard
          t={t}
          language={language}
          activeTab={dashboardTab}
          onTabChange={setDashboardTab}
          baseInputs={state.baseInputs}
          breakdown={breakdown}
          gearTotals={gearTotals}
          typicalRolls={state.typicalRolls}
          globalIndependentMultiplierFactor={globalIndependentMultiplierFactor}
          comparison={activeComparison}
          comparisonSource={compareSourceMode}
        />
      </div>
    </main>
  );
}

function LanguageSelector({
  t,
  language,
  onChange,
}: {
  t: Translation;
  language: Language;
  onChange: (language: Language) => void;
}) {
  return (
    <label className="headerField">
      <span>{t.language.label}</span>
      <select
        value={language}
        onChange={(event) => onChange(event.target.value as Language)}
      >
        <option value="en">{t.language.english}</option>
        <option value="zh">{t.language.chineseSimplified}</option>
      </select>
    </label>
  );
}

function localizeDefaultEquipmentNames(
  state: AppState,
  nextNames: EquipmentNameMap,
): AppState {
  const defaultNameSets = [
    translations.en.equipment.defaultNames,
    translations.zh.equipment.defaultNames,
  ] as EquipmentNameMap[];

  return {
    ...state,
    equipment: state.equipment.map((item) => {
      const matchingKey = DEFAULT_EQUIPMENT_KEYS.find((key) =>
        defaultNameSets.some((names) => names[key] === item.name),
      );

      return matchingKey ? { ...item, name: nextNames[matchingKey] } : item;
    }),
  };
}

function getWorkTabHelp(t: Translation, tab: WorkTab): string {
  if (tab === "baseAndSettings") {
    return t.tabHelp.baseAndSettings;
  }

  if (tab === "equipment") {
    return t.tabHelp.equipment;
  }

  return t.tabHelp.changeCompare;
}

function loadClassPreset(): ClassPreset {
  const saved = localStorage.getItem(CLASS_PRESET_STORAGE_KEY);

  if (
    saved === "custom" ||
    saved === "barbarian" ||
    saved === "druid" ||
    saved === "necromancer" ||
    saved === "rogue" ||
    saved === "sorcerer" ||
    saved === "spiritborn" ||
    saved === "paladin" ||
    saved === "warlock"
  ) {
    return saved;
  }

  return "custom";
}

function withMainStatLabel(
  t: Translation,
  classPreset: ClassPreset,
): Translation {
  const genericMainStat = t.settings.mainStatNames.custom;
  const mainStatLabel = t.settings.mainStatNames[classPreset];

  if (mainStatLabel === genericMainStat) {
    return t;
  }

  const replaceMainStat = (label: string) =>
    label.replace(genericMainStat, mainStatLabel);

  return {
    ...t,
    baseFields: {
      ...t.baseFields,
      baseMainStat: replaceMainStat(t.baseFields.baseMainStat),
    },
    settings: {
      ...t.settings,
      referenceLabels: {
        ...t.settings.referenceLabels,
        mainStat: replaceMainStat(t.settings.referenceLabels.mainStat),
      },
    },
    affix: {
      ...t.affix,
      types: {
        ...t.affix.types,
        mainStat: mainStatLabel,
      },
      inputTypes: {
        ...t.affix.inputTypes,
        mainStat: mainStatLabel,
      },
    },
    totals: {
      ...t.totals,
      totalMainStat: replaceMainStat(t.totals.totalMainStat),
    },
    formula: {
      ...t.formula,
      mainStatFactor: replaceMainStat(t.formula.mainStatFactor),
      tooltips: {
        ...t.formula.tooltips,
        mainStatFactor: replaceMainStat(t.formula.tooltips.mainStatFactor),
      },
    },
  };
}
