import { useState } from "react";
import {
  Plus,
  Download,
  Upload,
  Archive,
  Check,
  PenLine,
  Trash2,
  BookOpenCheck,
} from "lucide-react";
import type { State } from "../model";
import { exportFile, type Change } from "../Parent";
import type { WeeklyList } from "./types";
import {
  weeklyData,
  upsertList,
  activateList,
  archiveList,
  importList,
  exportList,
  wordProgress,
  isMastered,
  independentStreak,
  type ListDraft,
} from "./engine";
export function WeeklyManager({
  state,
  change,
}: {
  state: State;
  change: Change;
}) {
  const data = weeklyData(state);
  const [name, setName] = useState(""),
    [text, setText] = useState(""),
    [date, setDate] = useState(""),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [editing, setEditing] = useState<string | null>(null),
    [inspecting, setInspecting] = useState<string | null>(null);
  function act(action: (s: State) => State, message: string) {
    try {
      action(state);
      change(action);
      setNotice(message);
      setError("");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this list.");
      return false;
    }
  }
  async function upload(file: File | undefined) {
    if (!file) return;
    if (file.size > 200000) {
      setError("Choose a spelling-list file smaller than 200 KB.");
      return;
    }
    try {
      const json = await file.text();
      act(
        (s) => importList(s, json),
        "Spelling list imported and made active.",
      );
    } catch {
      setError("The list file could not be read.");
    }
  }
  return (
    <section className="panel custom-panel weekly-management">
      <div className="section-heading">
        <h2>
          <BookOpenCheck /> Weekly Spelling Lists
        </h2>
        <span>School words. Superhero practice.</span>
      </div>
      <p>
        Create a weekly list below. Words stay on this device; export a list to
        prepare or share it with another grown-up.
      </p>
      <form
        className="weekly-create"
        onSubmit={(e) => {
          e.preventDefault();
          if (
            act(
              (s) => upsertList(s, { name, text, testDate: date }),
              "Spelling list saved.",
            )
          ) {
            setName("");
            setText("");
            setDate("");
          }
        }}
      >
        <div className="form-grid">
          <label>
            Spelling list name
            <input
              value={name}
              maxLength={80}
              required
              onChange={(e) => setName(e.target.value)}
              placeholder="Week of November 23"
            />
          </label>
          <label>
            Spelling test date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <small>Optional</small>
          </label>
        </div>
        <label>
          Paste spelling words
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            placeholder={"balloon, little, school\nfriend\nplay"}
            maxLength={20000}
          />
        </label>
        <div className="button-row">
          <button
            className="primary"
            type="submit"
            disabled={data.lists.length >= 100}
          >
            <Plus size={18} /> Create spelling list
          </button>
          <label className="file-import">
            <Upload size={18} /> Import spelling list
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        <p className="fine-print">
          Separate words with commas or newlines. Duplicates are merged;
          hyphens, apostrophes, accents and repeated letters are supported. Up
          to 100 words per list.
        </p>
      </form>
      {error && (
        <p className="warning" role="alert">
          {error}
        </p>
      )}
      <p className="notice" role="status">
        {notice}
      </p>
      <div className="weekly-list-library">
        {data.lists.map((list) => (
          <article
            className={`weekly-list-record ${list.archived ? "archived" : ""}`}
            key={list.id}
          >
            <div className="section-heading">
              <div>
                <h3>{list.name}</h3>
                <small>
                  {list.words.length} words
                  {list.testDate ? ` · Test: ${list.testDate}` : ""}
                  {list.archived ? " · Archived" : ""}
                </small>
              </div>
              {data.activeListId === list.id && (
                <span className="active-list-badge">
                  <Check size={16} /> Active week
                </span>
              )}
            </div>
            <div className="button-row">
              {data.activeListId !== list.id && (
                <button
                  className="secondary"
                  onClick={() =>
                    act(
                      (s) => activateList(s, list.id),
                      list.archived
                        ? "List reused and made active."
                        : "Active spelling list updated.",
                    )
                  }
                >
                  {list.archived ? "Reuse list" : "Make active"}
                </button>
              )}
              <button
                className="text-button"
                onClick={() => setEditing(editing === list.id ? null : list.id)}
              >
                <PenLine size={16} /> Edit words & sentences
              </button>
              <button
                className="text-button"
                onClick={() =>
                  setInspecting(inspecting === list.id ? null : list.id)
                }
              >
                Word progress
              </button>
              <button
                className="text-button"
                onClick={() =>
                  exportFile(
                    exportList(list),
                    "hero-academy-spelling-list.json",
                  )
                }
              >
                <Download size={16} /> Export list
              </button>
              {!list.archived && (
                <button
                  className="text-button"
                  onClick={() =>
                    act(
                      (s) => archiveList(s, list.id, true),
                      "List archived. Use “Reuse list” to bring it back.",
                    )
                  }
                >
                  <Archive size={16} /> Archive list
                </button>
              )}
            </div>
            {editing === list.id && (
              <ListEditor
                key={list.id}
                list={list}
                onCancel={() => setEditing(null)}
                onSave={(draft) => {
                  if (act((s) => upsertList(s, draft), "Spelling list saved."))
                    setEditing(null);
                }}
              />
            )}
            {inspecting === list.id && (
              <div className="word-progress-scroll">
                <p>
                  <strong>Commonly missed: </strong>
                  {list.words
                    .filter((w) => wordProgress(data, w.text).lastMissed > 0)
                    .sort((a, b) => {
                      const misses = (text: string) => {
                        const p = wordProgress(data, text);
                        return (
                          p.assisted.attempts -
                          p.assisted.correct +
                          p.independent.attempts -
                          p.independent.correct +
                          p.test.attempts -
                          p.test.correct
                        );
                      };
                      return misses(b.text) - misses(a.text);
                    })
                    .map((w) => w.text)
                    .join(", ") || "No misses recorded yet."}
                </p>
                {data.results.filter((r) => r.listId === list.id).length >
                  0 && (
                  <details>
                    <summary>Recent practice results</summary>
                    <ul>
                      {data.results
                        .filter((r) => r.listId === list.id)
                        .slice(0, 10)
                        .map((r) => (
                          <li key={r.id}>
                            {new Date(r.finishedAt).toLocaleDateString()} ·{" "}
                            {r.mode} ·{" "}
                            {r.results.filter((w) => w.correct).length}/
                            {r.results.length} · {r.stars} stars
                          </li>
                        ))}
                    </ul>
                  </details>
                )}

                <table className="word-progress-table">
                  <thead>
                    <tr>
                      <th>Word</th>
                      <th>Study views</th>
                      <th>Assisted</th>
                      <th>Independent</th>
                      <th>Test</th>
                      <th>Mastery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.words.map((w) => {
                      const p = wordProgress(data, w.text);
                      return (
                        <tr key={w.id}>
                          <th>{w.text}</th>
                          <td>{p.recognition}</td>
                          <td>
                            {p.assisted.correct}/{p.assisted.attempts}
                          </td>
                          <td>
                            {p.independent.correct}/{p.independent.attempts}
                          </td>
                          <td>
                            {p.test.correct}/{p.test.attempts}
                          </td>
                          <td>
                            {isMastered(p)
                              ? "Mastered"
                              : `${Math.min(3, independentStreak(p.independentHistory))}/3 independent sessions`}
                            {p.lastMissed >= p.lastSeen && p.lastMissed > 0
                              ? " · Review next"
                              : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="fine-print">
                  Correct/attempts by practice type. Mastery needs three
                  consecutive independent successes in separate sessions. Study,
                  builder, missing-letter, look/cover and adult-assisted turns
                  do not establish mastery.
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
function ListEditor({
  list,
  onSave,
  onCancel,
}: {
  list: WeeklyList;
  onSave: (draft: ListDraft) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(list.name),
    [date, setDate] = useState(list.testDate),
    [words, setWords] = useState(list.words);
  return (
    <form
      className="word-editor"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: list.id, name, testDate: date, words });
      }}
    >
      <div className="form-grid">
        <label>
          Edit list name
          <input
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Edit test date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </div>
      {words.map((w, i) => (
        <div className="word-editor-row" key={w.id}>
          <label>
            Word {i + 1}
            <input
              required
              value={w.text}
              maxLength={200}
              onChange={(e) =>
                setWords(
                  words.map((x) =>
                    x.id === w.id ? { ...x, text: e.target.value } : x,
                  ),
                )
              }
            />
          </label>
          <label>
            Sentence for word {i + 1}
            <input
              value={w.sentence}
              maxLength={400}
              onChange={(e) =>
                setWords(
                  words.map((x) =>
                    x.id === w.id ? { ...x, sentence: e.target.value } : x,
                  ),
                )
              }
              placeholder="Optional example sentence"
            />
          </label>
          <button
            type="button"
            className="icon-button"
            aria-label={`Remove word ${i + 1}`}
            onClick={() => setWords(words.filter((x) => x.id !== w.id))}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <div className="button-row">
        <button
          type="button"
          className="secondary"
          disabled={words.length >= 100}
          onClick={() =>
            setWords([
              ...words,
              { id: crypto.randomUUID(), text: "", sentence: "" },
            ])
          }
        >
          <Plus size={17} /> Add word
        </button>
        <button className="primary" type="submit">
          Save list changes
        </button>
        <button type="button" className="text-button" onClick={onCancel}>
          Cancel editing
        </button>
      </div>
    </form>
  );
}
