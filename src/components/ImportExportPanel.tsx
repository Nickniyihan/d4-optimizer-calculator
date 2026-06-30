import { useState } from "react";
import { AppState } from "../lib/damageModel";
import { parseImportedState } from "../lib/storage";
import { Translation } from "../i18n";

interface ImportExportPanelProps {
  t: Translation;
  state: AppState;
  onImport: (state: AppState) => void;
  onReset: () => void;
  onLoadExample: () => void;
}

export function ImportExportPanel({
  t,
  state,
  onImport,
  onReset,
  onLoadExample,
}: ImportExportPanelProps) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");

  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>{t.panels.importExport}</h2>
        <span className="saveStatus">{t.status.autosaved}</span>
      </div>

      <div className="buttonRow wrapButtons">
        <button
          type="button"
          className="secondaryButton"
          onClick={() => {
            setJsonText(JSON.stringify(state, null, 2));
            setError("");
          }}
        >
          {t.actions.exportJson}
        </button>
        <button
          type="button"
          className="secondaryButton"
          onClick={() => {
            try {
              onImport(parseImportedState(jsonText));
              setError("");
            } catch {
              setError(t.status.importError);
            }
          }}
        >
          {t.actions.importJson}
        </button>
        <button type="button" className="ghostButton" onClick={onLoadExample}>
          {t.actions.loadExample}
        </button>
        <button type="button" className="dangerButton" onClick={onReset}>
          {t.actions.reset}
        </button>
      </div>

      <label className="jsonField">
        <span>{t.importExport.textareaLabel}</span>
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
        />
      </label>
      {error && <p className="errorText">{error}</p>}
    </section>
  );
}
