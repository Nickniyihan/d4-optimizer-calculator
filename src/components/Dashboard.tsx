import {
  BaseInputs,
  ComparisonBreakdown,
  CustomCalculationContext,
  CustomPanelStat,
  DamageBreakdown,
  FactorChange,
  GearTotals,
  MarginalGain,
  TypicalRolls,
  calculateMarginalGains,
  calculateUnitMarginalGains,
} from "../lib/damageModel";
import { Language, Translation } from "../i18n";
import {
  formatBucketValue,
  formatFactor,
  formatNumber,
  formatPercent,
  formatSignedPercent,
} from "./format";
import type { CompareSourceMode } from "./CompareWorkspace";
import { getAffixDisplayLabel } from "./affixOptions";

export type DashboardTab = "stats" | "marginal" | "breakdown";

interface DashboardProps {
  t: Translation;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  language: Language;
  baseInputs: BaseInputs;
  breakdown: DamageBreakdown;
  gearTotals: GearTotals;
  typicalRolls: TypicalRolls;
  globalIndependentMultiplierFactor: number;
  customPanelStats: CustomPanelStat[];
  customContext: CustomCalculationContext;
  comparison: ComparisonBreakdown | null;
  comparisonSource: CompareSourceMode;
}

const dashboardTabs: DashboardTab[] = ["stats", "marginal", "breakdown"];

export function Dashboard({
  t,
  activeTab,
  onTabChange,
  language,
  baseInputs,
  breakdown,
  gearTotals,
  typicalRolls,
  globalIndependentMultiplierFactor,
  customPanelStats,
  customContext,
  comparison,
  comparisonSource,
}: DashboardProps) {
  return (
    <aside className="dashboard">
      <div className="dashboardHeader">
        <h2>{t.panels.dashboard}</h2>
        <div className="tabStrip compactTabs">
          {dashboardTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              title={getDashboardTabHelp(t, tab)}
              className={activeTab === tab ? "tabButton activeTab" : "tabButton"}
              onClick={() => onTabChange(tab)}
            >
              {t.panels[tab]}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboardBody">
        {activeTab === "stats" && (
          <StatsDashboard
            t={t}
            language={language}
            breakdown={breakdown}
            gearTotals={gearTotals}
            comparison={comparison}
            comparisonSource={comparisonSource}
            customPanelStats={customPanelStats}
          />
        )}
        {activeTab === "marginal" && (
          <MarginalDashboard
            t={t}
            language={language}
            baseInputs={baseInputs}
            gearTotals={gearTotals}
            typicalRolls={typicalRolls}
            globalIndependentMultiplierFactor={globalIndependentMultiplierFactor}
            equipmentIndependentMultiplierFactor={
              breakdown.equipmentIndependentMultiplierFactor
            }
            customPanelStats={customPanelStats}
            customContext={customContext}
          />
        )}
        {activeTab === "breakdown" && (
          <section className="dashboardSection">
            <h3>{t.dashboardLabels.bucketFactorBreakdown}</h3>
            <BucketBreakdownTable
              t={t}
              language={language}
              breakdown={breakdown}
              comparison={comparison}
            />
          </section>
        )}
      </div>
    </aside>
  );
}

function StatsDashboard({
  t,
  language,
  breakdown,
  gearTotals,
  comparison,
  comparisonSource,
  customPanelStats,
}: {
  t: Translation;
  language: Language;
  breakdown: DamageBreakdown;
  gearTotals: GearTotals;
  comparison: ComparisonBreakdown | null;
  comparisonSource: CompareSourceMode;
  customPanelStats: CustomPanelStat[];
}) {
  const customStatsSummary = breakdown.customPanelStats
    .filter((stat) => stat.enabled)
    .map(
      (stat) =>
        `${stat.name || stat.affixLabel || t.settings.customPanelStat} ${formatNumber(
          stat.finalValue,
          2,
        )}`,
    )
    .join(" · ");

  return (
    <div className="dashboardSection">
      <div className="statGrid">
        <DashboardMetric
          label={t.totals.totalDamageFactor}
          value={formatFactor(breakdown.totalDamageFactor, language)}
          highlight
        />
        <DashboardMetric
          label={t.totals.totalCritChance}
          value={formatPercent(breakdown.totalCritChance)}
        />
        <DashboardMetric
          label={t.totals.totalMainStat}
          value={formatNumber(breakdown.totalMainStat, 0)}
        />
        <DashboardMetric
          label={t.totals.totalMainSkillRank}
          value={formatNumber(breakdown.totalMainSkillRank, 0)}
        />
        <DashboardMetric
          label={t.formula.skillDamageFactor}
          title={t.formula.tooltips.skillDamageFactor}
          value={formatFactor(breakdown.skillDamageFactor, language)}
        />
        <DashboardMetric
          label={t.formula.globalIndependentMultiplierFactor}
          title={t.formula.tooltips.globalIndependentMultiplierFactor}
          value={formatFactor(
            breakdown.globalIndependentMultiplierFactor,
            language,
          )}
        />
        <DashboardMetric
          label={t.formula.equipmentIndependentMultiplierFactor}
          title={t.formula.tooltips.equipmentIndependentMultiplierFactor}
          value={formatFactor(
            breakdown.equipmentIndependentMultiplierFactor,
            language,
          )}
        />
        {(breakdown.customPanelStats.length > 0 || customPanelStats.length > 0) && (
          <DashboardMetric
            label={t.settings.customPanelStats}
            title={t.settings.customPanelStatHelpShort}
            value={customStatsSummary || "-"}
          />
        )}
        {breakdown.customIndependentMultiplierFactor !== 1 && (
          <DashboardMetric
            label={t.formula.customIndependentMultiplierFactor}
            title={t.formula.tooltips.customIndependentMultiplierFactor}
            value={formatFactor(
              breakdown.customIndependentMultiplierFactor,
              language,
            )}
          />
        )}
        <DashboardMetric
          label={t.totals.effectiveWeaponDamage}
          value={
            breakdown.baseAverageWeaponDamage > 0
              ? formatFactor(breakdown.effectiveWeaponDamage, language)
              : "-"
          }
        />
        <DashboardMetric
          label={t.totals.totalCritDamageMultiplier}
          value={formatPercent(breakdown.totalCritDamageMultiplier)}
        />
        <DashboardMetric
          label={t.totals.totalVulnerableDamageMultiplier}
          value={formatPercent(breakdown.totalVulnerableDamageMultiplier)}
        />
        <DashboardMetric
          label={t.totals.gearTypeAllDamageMultiplier}
          value={formatPercent(gearTotals.gearTypeAllDamageMultiplier)}
        />
        <DashboardMetric
          label={t.totals.totalCritDamageAdditive}
          value={formatPercent(breakdown.totalCritDamageAdditive)}
        />
        <DashboardMetric
          label={t.totals.totalVulnerableDamageAdditive}
          value={formatPercent(breakdown.totalVulnerableDamageAdditive)}
        />
        <DashboardMetric
          label={t.totals.totalGenericAdditive}
          value={formatPercent(breakdown.totalGenericAdditive)}
        />
      </div>

      {comparison && (
        <div className="comparisonCard">
          <h3>{t.dashboardLabels.changeResult}</h3>
          <p>
            {getComparisonSourceLabel(t, comparisonSource)}
          </p>
          <div className="comparisonStats">
            <span>{t.dashboardLabels.current}</span>
            <strong>{formatFactor(comparison.before.totalDamageFactor, language)}</strong>
            <span>{t.dashboardLabels.afterChange}</span>
            <strong>{formatFactor(comparison.after.totalDamageFactor, language)}</strong>
            <span>{t.dashboardLabels.gainLoss}</span>
            <strong
              className={
                comparison.totalRelativeChange > 0
                  ? "positive"
                  : comparison.totalRelativeChange < 0
                    ? "negative"
                    : "neutral"
              }
            >
              {formatSignedPercent(comparison.totalRelativeChange)}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}

function getComparisonSourceLabel(
  t: Translation,
  source: CompareSourceMode,
): string {
  if (source === "manualChangesOnly") {
    return t.dashboardLabels.sourceManualChanges;
  }

  if (source === "candidateItemOnly") {
    return t.dashboardLabels.sourceCandidateItem;
  }

  return t.dashboardLabels.sourceManualChangesCandidateItem;
}

function getDashboardTabHelp(t: Translation, tab: DashboardTab): string {
  if (tab === "stats") {
    return t.tabHelp.characterStats;
  }

  if (tab === "marginal") {
    return t.tabHelp.marginalGains;
  }

  return t.tabHelp.bucketBreakdown;
}

function MarginalDashboard({
  t,
  language,
  baseInputs,
  gearTotals,
  typicalRolls,
  globalIndependentMultiplierFactor,
  equipmentIndependentMultiplierFactor,
  customPanelStats,
  customContext,
}: {
  t: Translation;
  language: Language;
  baseInputs: BaseInputs;
  gearTotals: GearTotals;
  typicalRolls: TypicalRolls;
  globalIndependentMultiplierFactor: number;
  equipmentIndependentMultiplierFactor: number;
  customPanelStats: CustomPanelStat[];
  customContext: CustomCalculationContext;
}) {
  const unitGains = calculateUnitMarginalGains(
    baseInputs,
    gearTotals,
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
    customContext,
  );
  const typicalGains = calculateMarginalGains(
    baseInputs,
    gearTotals,
    typicalRolls,
    globalIndependentMultiplierFactor,
    equipmentIndependentMultiplierFactor,
    customContext,
  );

  return (
    <div className="dashboardSection">
      <h3>{t.dashboardLabels.referenceAffixGain}</h3>
      <p>{t.dashboardLabels.referenceAffixGainHelp}</p>
      <MarginalList
        t={t}
        language={language}
        gains={typicalGains}
        customPanelStats={customPanelStats}
      />
      <details className="secondaryMarginalDetails">
        <summary>{t.dashboardLabels.unitIncrementGain}</summary>
        <p>{t.dashboardLabels.unitIncrementGainHelp}</p>
        <MarginalList
          t={t}
          language={language}
          gains={unitGains}
          customPanelStats={customPanelStats}
        />
      </details>
    </div>
  );
}

function MarginalList({
  t,
  language,
  gains,
  customPanelStats,
}: {
  t: Translation;
  language: Language;
  gains: MarginalGain[];
  customPanelStats: CustomPanelStat[];
}) {
  return (
    <div className="marginalList">
      <div className="marginalHeader">
        <span>{t.affix.type}</span>
        <span>{t.dashboardLabels.gainLoss}</span>
      </div>
      {gains.map((gain, index) => (
        <div
          className="marginalRow"
          key={`${gain.type}-${gain.customStatId ?? ""}-${gain.delta}`}
          title={
            gain.type === "weaponDamage"
              ? t.formula.tooltips.weaponDamageInactive
              : gain.type === "skillRanks"
                ? t.formula.tooltips.skillRankInactive
              : undefined
          }
        >
          <div>
            <strong>
              {index + 1}.{" "}
              {getAffixDisplayLabel(t, gain, customPanelStats)}
            </strong>
            <span>
              {formatBucketValue(gain.type, gain.delta)} ·{" "}
              {t.formula.currentBucket}:{" "}
              {formatBucketValue(gain.type, gain.currentBucketTotal)} ·{" "}
              {t.formula.currentFactor}: {formatFactor(gain.currentFactor, language)}
            </span>
          </div>
          <em className={gain.relativeChange >= 0 ? "positive" : "negative"}>
            {formatSignedPercent(gain.relativeChange)}
          </em>
        </div>
      ))}
    </div>
  );
}

const factorKeys = [
  "weaponDamageFactor",
  "skillDamageFactor",
  "globalIndependentMultiplierFactor",
  "equipmentIndependentMultiplierFactor",
  "customIndependentMultiplierFactor",
  "mainStatFactor",
  "critFactor",
  "vulnerableFactor",
  "typeAllMultiplierFactor",
  "additiveFactor",
  "expectedCombatFactor",
  "totalDamageFactor",
] as const;

function BucketBreakdownTable({
  t,
  language,
  breakdown,
  comparison,
}: {
  t: Translation;
  language: Language;
  breakdown: DamageBreakdown;
  comparison: ComparisonBreakdown | null;
}) {
  return (
    <div className="bucketTable">
      <div
        className={
          comparison ? "bucketRow bucketHeader compareBucketRow" : "bucketRow bucketHeader"
        }
      >
        <span title={t.dashboardLabels.bucketColumnHelp}>
          {t.dashboardLabels.bucket}
        </span>
        <span title={t.dashboardLabels.currentFactorColumnHelp}>
          {t.dashboardLabels.currentFactor}
        </span>
        {comparison && (
          <>
            <span title={t.dashboardLabels.afterChangeColumnHelp}>
              {t.dashboardLabels.afterChangeFactor}
            </span>
            <span title={t.dashboardLabels.gainLossColumnHelp}>
              {t.dashboardLabels.gainLoss}
            </span>
          </>
        )}
      </div>

      {factorKeys.map((key) => {
        const change = comparison?.factorChanges[key] as FactorChange | undefined;
        const currentValue = comparison ? change?.before : breakdown[key];
        const afterValue = change?.after;
        const changeClass =
          change && change.relativeChange > 0
            ? "positive"
            : change && change.relativeChange < 0
              ? "negative"
              : "neutral";

        return (
          <div
            className={comparison ? "bucketRow compareBucketRow" : "bucketRow"}
            key={key}
            title={t.formula.tooltips[key]}
          >
            <span className="truncate" title={t.formula[key]}>
              {t.formula[key]}
            </span>
            <strong>{formatFactor(currentValue ?? 0, language)}</strong>
            {comparison && (
              <>
                <strong>{formatFactor(afterValue ?? 0, language)}</strong>
                <span className={changeClass}>
                  {formatSignedPercent(change?.relativeChange ?? 0)}
                </span>
              </>
            )}
          </div>
        );
      })}
      <StateContributionTable t={t} language={language} breakdown={breakdown} />
    </div>
  );
}

function StateContributionTable({
  t,
  language,
  breakdown,
}: {
  t: Translation;
  language: Language;
  breakdown: DamageBreakdown;
}) {
  return (
    <div className="stateContributionTable">
      <h3>{t.dashboardLabels.stateContributions}</h3>
      <p>{t.dashboardLabels.conditionalAdditiveNote}</p>
      <div className="stateContributionRow stateContributionHeader">
        <span title={t.dashboardLabels.stateColumnHelp}>
          {t.dashboardLabels.state}
        </span>
        <span title={t.dashboardLabels.probabilityColumnHelp}>
          {t.dashboardLabels.probability}
        </span>
        <span title={t.dashboardLabels.stateAdditiveColumnHelp}>
          {t.dashboardLabels.additiveFactor}
        </span>
        <span title={t.dashboardLabels.critMultiplierColumnHelp}>
          {t.dashboardLabels.critMultiplier}
        </span>
        <span title={t.dashboardLabels.vulnerableMultiplierColumnHelp}>
          {t.dashboardLabels.vulnerableMultiplier}
        </span>
        <span title={t.dashboardLabels.stateContributionColumnHelp}>
          {t.dashboardLabels.contribution}
        </span>
      </div>
      {breakdown.stateBreakdown.map((state) => (
        <div
          className="stateContributionRow"
          key={`${state.crit}-${state.vulnerable}`}
        >
          <span>{getStateLabel(t, state.crit, state.vulnerable)}</span>
          <strong>{formatPercent(state.probability)}</strong>
          <strong>{formatFactor(state.additiveFactor, language)}</strong>
          <strong>{formatFactor(state.critMultiplier, language)}</strong>
          <strong>{formatFactor(state.vulnerableMultiplier, language)}</strong>
          <strong>{formatFactor(state.contribution, language)}</strong>
        </div>
      ))}
    </div>
  );
}

function getStateLabel(
  t: Translation,
  crit: boolean,
  vulnerable: boolean,
): string {
  if (crit && vulnerable) {
    return t.dashboardLabels.critVulnerable;
  }

  if (crit) {
    return t.dashboardLabels.critNonVulnerable;
  }

  if (vulnerable) {
    return t.dashboardLabels.nonCritVulnerable;
  }

  return t.dashboardLabels.nonCritNonVulnerable;
}

function DashboardMetric({
  label,
  title,
  value,
  highlight = false,
}: {
  label: string;
  title?: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "dashboardMetric primaryMetric" : "dashboardMetric"}>
      <span className="truncate" title={title ?? label}>
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}
