"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Stage = "Draft" | "Refine" | "Ready" | "Retired";
type Area = "Engineering" | "Research" | "Writing";

type PromptRecipe = {
  id: string;
  title: string;
  area: Area;
  stage: Stage;
  purpose: string;
  content: string;
  updatedAt: number;
};

const STAGES: Stage[] = ["Draft", "Refine", "Ready", "Retired"];
const AREAS: Area[] = ["Engineering", "Research", "Writing"];

const SEED: PromptRecipe[] = [
  {
    id: "review-diff",
    title: "Review a diff for behavior, not just style",
    area: "Engineering",
    stage: "Ready",
    purpose: "A second pair of eyes for regressions and unclear assumptions.",
    content: "Review the following code change as a senior engineer. Identify behavior regressions, missing edge cases, unsafe assumptions, and tests that should be added. Prioritize findings by impact. If the change is sound, say what evidence supports that conclusion.\n\nDIFF:\n{{paste diff here}}",
    updatedAt: Date.parse("2026-08-20"),
  },
  {
    id: "research-brief",
    title: "Turn a question into a research brief",
    area: "Research",
    stage: "Refine",
    purpose: "Shape an open question before collecting sources or opinions.",
    content: "Help me turn this loose question into a research brief. State the decision it could inform, define what we know and do not know, list three falsifiable sub-questions, and propose evidence that would change the decision. Do not answer the question yet.\n\nQUESTION:\n{{question}}",
    updatedAt: Date.parse("2026-08-17"),
  },
  {
    id: "plain-language",
    title: "Rewrite a technical note for a human reader",
    area: "Writing",
    stage: "Ready",
    purpose: "Keep the technical truth while removing unnecessary ceremony.",
    content: "Rewrite the note below for a capable reader who does not share the author's context. Keep the claim, constraints, and uncertainty intact. Prefer concrete verbs, short paragraphs, and examples where they remove ambiguity. Return only the revised note, followed by a short list of meaningful changes.\n\nNOTE:\n{{paste note here}}",
    updatedAt: Date.parse("2026-08-12"),
  },
  {
    id: "decision-memo",
    title: "Expose the decision inside a messy memo",
    area: "Research",
    stage: "Draft",
    purpose: "Separate evidence, interpretation, and the next reversible move.",
    content: "Read the memo below and return four sections: decision being made, evidence directly observed, interpretation or assumption, and the smallest reversible next move. Flag any sentence that claims more certainty than the evidence allows.\n\nMEMO:\n{{paste memo here}}",
    updatedAt: Date.parse("2026-08-08"),
  },
];

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // Browser storage is external state; this read intentionally follows hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // Keep the sample recipes if storage is unavailable.
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (ready) localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);

  return [value, setValue] as const;
}

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `recipe-${Date.now()}`;
}

export default function Home() {
  const [recipes, setRecipes] = useLocalStorage<PromptRecipe[]>("prompt-workbench-v2", SEED);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "All">("All");
  const [areaFilter, setAreaFilter] = useState<Area | "All">("All");
  const [selectedId, setSelectedId] = useState(SEED[0]?.id ?? "");
  const [editingText, setEditingText] = useState(SEED[0]?.content ?? "");
  const [notice, setNotice] = useState("");
  const [newRecipe, setNewRecipe] = useState({ title: "", purpose: "", content: "", area: "Engineering" as Area, stage: "Draft" as Stage });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesStage = stageFilter === "All" || recipe.stage === stageFilter;
      const matchesArea = areaFilter === "All" || recipe.area === areaFilter;
      const matchesQuery = !needle || `${recipe.title} ${recipe.purpose} ${recipe.content} ${recipe.area}`.toLowerCase().includes(needle);
      return matchesStage && matchesArea && matchesQuery;
    });
  }, [areaFilter, query, recipes, stageFilter]);

  const selected = recipes.find((recipe) => recipe.id === selectedId) ?? visible[0] ?? recipes[0];

  function selectRecipe(recipe: PromptRecipe) {
    setSelectedId(recipe.id);
    setEditingText(recipe.content);
    setNotice("");
  }

  function saveRevision() {
    if (!selected) return;
    setRecipes((current) => current.map((recipe) => recipe.id === selected.id ? { ...recipe, content: editingText, updatedAt: Date.now() } : recipe));
    setNotice("Revision saved in this browser.");
  }

  async function copyRecipe() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(editingText);
      setNotice("Prompt copied. The next handoff starts with this exact text.");
    } catch {
      setNotice("Copy was blocked by the browser. Select the text and copy it manually.");
    }
  }

  function removeRecipe() {
    if (!selected) return;
    setRecipes((current) => {
      const remaining = current.filter((recipe) => recipe.id !== selected.id);
      const next = remaining[0];
      if (next) {
        setSelectedId(next.id);
        setEditingText(next.content);
      } else {
        setSelectedId("");
        setEditingText("");
      }
      return remaining;
    });
    setNotice("Recipe removed from this browser.");
  }

  function addRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newRecipe.title.trim() || !newRecipe.content.trim()) return;
    const recipe: PromptRecipe = { id: createId(), title: newRecipe.title.trim(), purpose: newRecipe.purpose.trim() || "A local recipe waiting for a clearer purpose.", content: newRecipe.content.trim(), area: newRecipe.area, stage: newRecipe.stage, updatedAt: Date.now() };
    setRecipes((current) => [recipe, ...current]);
    setStageFilter("All");
    setAreaFilter("All");
    selectRecipe(recipe);
    setNewRecipe({ title: "", purpose: "", content: "", area: "Engineering", stage: "Draft" });
    setNotice("Recipe added to the workbench.");
  }

  return (
    <main className="prompt-workbench">
      <div className="workbench-frame">
        <header className="workbench-header">
          <div className="workbench-mark"><span className="mark-line" aria-hidden="true" />PROMPT / WORKBENCH</div>
          <p>LOCAL RECIPE SHELF · {recipes.length.toString().padStart(2, "0")} CUES</p>
        </header>

        <section className="workbench-hero" aria-labelledby="page-title">
          <div>
            <h1 id="page-title">Make the next prompt easier to trust.</h1>
            <p>Keep the instruction visible, tune it against real work, and hand it off only when its next use is clear.</p>
          </div>
          <div className="hero-readout"><strong>{visible.length.toString().padStart(2, "0")}</strong><span>RECIPES<br />IN CUT</span></div>
        </section>

        <nav className="cue-rail" aria-label="Prompt lifecycle filter">
          <button type="button" aria-pressed={stageFilter === "All"} onClick={() => setStageFilter("All")}><span>ALL CUES</span><small>{recipes.length}</small></button>
          {STAGES.map((stage) => <button key={stage} type="button" className={`stage-${stage.toLowerCase()}`} aria-pressed={stageFilter === stage} onClick={() => setStageFilter(stage)}><span>{stage.toUpperCase()}</span><small>{recipes.filter((recipe) => recipe.stage === stage).length}</small></button>)}
        </nav>

        <section className="workbench-body" aria-label="Prompt recipe workbench">
          <aside className="recipe-index">
            <div className="index-tools">
              <label className="search-line"><span>FIND A RECIPE</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, purpose, or text" /></label>
              <div className="area-filters" role="group" aria-label="Filter recipes by area">
                {(["All", ...AREAS] as const).map((area) => <button key={area} type="button" aria-pressed={areaFilter === area} onClick={() => setAreaFilter(area)}>{area}</button>)}
              </div>
            </div>
            <div className="index-heading"><p className="label">RECIPE INDEX</p><span>{visible.length} / {recipes.length}</span></div>
            {visible.length > 0 ? (
              <ul className="recipe-list">
                {visible.map((recipe) => <li key={recipe.id}><button type="button" className={`recipe-row${selected?.id === recipe.id ? " is-selected" : ""}`} onClick={() => selectRecipe(recipe)}><span className="recipe-stage">{recipe.stage}</span><strong>{recipe.title}</strong><span className="recipe-area">{recipe.area}</span></button></li>)}
              </ul>
            ) : <div className="empty-index"><strong>No recipe in this cut.</strong><span>Clear a filter or add a new cue.</span></div>}
            <details className="new-recipe">
              <summary>PLACE A NEW CUE</summary>
              <form onSubmit={addRecipe}>
                <label><span>Name</span><input value={newRecipe.title} onChange={(event) => setNewRecipe((current) => ({ ...current, title: event.target.value }))} placeholder="Recipe name" required /></label>
                <label><span>Purpose</span><input value={newRecipe.purpose} onChange={(event) => setNewRecipe((current) => ({ ...current, purpose: event.target.value }))} placeholder="What is it for?" /></label>
                <label><span>Instruction</span><textarea value={newRecipe.content} onChange={(event) => setNewRecipe((current) => ({ ...current, content: event.target.value }))} placeholder="Write the handoff" rows={5} required /></label>
                <div className="new-recipe-row"><label><span>Area</span><select value={newRecipe.area} onChange={(event) => setNewRecipe((current) => ({ ...current, area: event.target.value as Area }))}>{AREAS.map((area) => <option key={area}>{area}</option>)}</select></label><label><span>Stage</span><select value={newRecipe.stage} onChange={(event) => setNewRecipe((current) => ({ ...current, stage: event.target.value as Stage }))}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label></div>
                <button className="add-cue" type="submit">Add cue</button>
              </form>
            </details>
          </aside>

          <section className="prompt-bay" aria-label="Selected prompt recipe">
            {selected ? <>
              <div className="prompt-meta"><span>{selected.stage}</span><span>{selected.area}</span><span>EDITED {new Date(selected.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span></div>
              <h2>{selected.title}</h2>
              <p className="prompt-purpose">{selected.purpose}</p>
              <label className="instruction-label"><span>INSTRUCTION · EDITABLE</span><textarea value={editingText} onChange={(event) => setEditingText(event.target.value)} rows={13} /></label>
              <div className="prompt-actions"><button type="button" className="save-cue" onClick={saveRevision}>Save revision</button><button type="button" className="copy-cue" onClick={copyRecipe}>Copy exact text</button><button type="button" className="remove-cue" onClick={removeRecipe}>Remove</button></div>
              <p className="prompt-notice" role="status" aria-live="polite">{notice}</p>
              <div className="handoff-note"><span className="label">HANDOFF</span><p>This library stores the instruction only. Choose the model, context, and review standard in the tool where you run it.</p></div>
            </> : <div className="empty-bay"><strong>The workbench is clear.</strong><span>Place a cue on the left to start.</span></div>}
          </section>
        </section>

        <footer className="workbench-footer"><span>PROMPT / WORKBENCH · PRIVATE BY DEFAULT</span><span>No model connection. No output claims. Just reusable instruction.</span></footer>
      </div>
    </main>
  );
}
