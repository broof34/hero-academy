import { it, expect } from "vitest";
import { freshState, hydrate, grantStars } from "../src/model";
import {
  parseWords,
  upsertList,
  activateList,
  archiveList,
  exportList,
  importList,
  beginPractice,
  submitTurn,
  weeklyData,
  wordProgress,
  isMastered,
  revisionQueue,
  missingLetters,
  normalizeWord,
} from "../src/spelling/engine";
const draft = {
  name: "Week 1",
  text: "Balloon, cat\nCAT\na\nco-operate\ncan’t\nnaïve",
  testDate: "2026-11-27",
};
function prepared() {
  return upsertList(grantStars(freshState(), 7), draft, 1000);
}
it("normalizes commas/newlines, Unicode punctuation and duplicates without losing repeated letters", () => {
  expect(parseWords(draft.text).map((w) => w.text)).toEqual([
    "Balloon",
    "cat",
    "a",
    "co-operate",
    "can't",
    "naïve",
  ]);
  expect(() => parseWords("cat, 123, dog")).toThrow();
  expect(normalizeWord("  CAN’T ")).toBe("can't");
  expect(missingLetters("a").answer).toBe("a");
  expect(missingLetters("balloon").answer.length).toBeGreaterThan(1);
});
it("manages active/archive/reuse and preserves word identity on edits", () => {
  let s = prepared();
  const list = weeklyData(s).lists[0],
    id = list.words[1].id;
  s = upsertList(s, { ...draft, id: list.id, text: "cat, dog" }, 2000);
  expect(weeklyData(s).lists[0].words[0].id).toBe(id);
  expect(s.stars).toBe(7);
  s = archiveList(s, list.id, true);
  expect(weeklyData(s).activeListId).toBeNull();
  s = activateList(s, list.id);
  expect(weeklyData(s).lists[0].archived).toBe(false);
});
it("transfers a list without importing rewards, progress or identities", () => {
  const s = prepared(),
    list = weeklyData(s).lists[0];
  const imported = importList(freshState(), exportList(list), 2000);
  expect(weeklyData(imported).lists[0].words.map((w) => w.text)).toEqual(
    list.words.map((w) => w.text),
  );
  expect(weeklyData(imported).lists[0].id).not.toBe(list.id);
  expect(imported.stars).toBe(0);
  expect(() => importList(s, '{"version":99,"words":["cat"]}', 2000)).toThrow();
  expect(() =>
    upsertList(s, { ...draft, testDate: "2026-02-31" }, 2000),
  ).toThrow();
});
it("rewards each committed turn once and saves a completed test including misses", () => {
  let s = upsertList(
    freshState(),
    { name: "Test", text: "cat,dog", testDate: "" },
    1000,
  );
  s = beginPractice(s, weeklyData(s).lists[0].id, "test", 2000);
  const session = weeklyData(s).current!;
  const first = session.items[0].word.text;
  s = submitTurn(s, session.id, 0, first, false, 3000);
  const stars = s.stars;
  s = submitTurn(s, session.id, 0, first, false, 3001);
  expect(s.stars).toBe(stars);
  s = submitTurn(s, session.id, 1, "wrong", false, 4000);
  expect(weeklyData(s).current).toBeNull();
  expect(
    weeklyData(s).results[0].results.filter((r) => r.correct),
  ).toHaveLength(1);
  expect(s.stars).toBe(3);
  expect(
    wordProgress(weeklyData(s), session.items[1].word.text).lastMissed,
  ).toBe(4000);
});
it("recognition and assisted spelling cannot create mastery; separate independent sessions can", () => {
  let s = upsertList(
      freshState(),
      { name: "One", text: "balloon", testDate: "" },
      1,
    );
  const id = weeklyData(s).lists[0].id;
  for (let n = 0; n < 4; n++) {
    s = beginPractice(s, id, "builder", 100 + n);
    const x = weeklyData(s).current!;
    s = submitTurn(s, x.id, 0, "balloon", false, 200 + n);
  }
  expect(isMastered(wordProgress(weeklyData(s), "balloon"))).toBe(false);
  for (let n = 0; n < 3; n++) {
    s = beginPractice(s, id, "listen", 1000 + n * 1000);
    const x = weeklyData(s).current!;
    s = submitTurn(s, x.id, 0, "balloon", false, 1100 + n * 1000);
  }
  expect(isMastered(wordProgress(weeklyData(s), "balloon"))).toBe(true);
  s = beginPractice(s, id, "test", 5000);
  const x = weeklyData(s).current!;
  s = submitTurn(s, x.id, 0, "baloon", false, 5100);
  expect(isMastered(wordProgress(weeklyData(s), "balloon"))).toBe(false);
});
it("adult reading help counts as assisted evidence even in a test", () => {
  let s = upsertList(
    freshState(),
    { name: "One", text: "cat", testDate: "" },
    1,
  );
  s = beginPractice(s, weeklyData(s).lists[0].id, "test", 2);
  const x = weeklyData(s).current!;
  s = submitTurn(s, x.id, 0, "cat", true, 3);
  const p = wordProgress(weeklyData(s), "cat");
  expect(p.assisted.correct).toBe(1);
  expect(p.test.attempts).toBe(0);
  expect(p.independentHistory).toEqual([]);
});
it("prioritizes recently missed words", () => {
  let s = upsertList(
      freshState(),
      { name: "Three", text: "cat,dog,fox", testDate: "" },
      1,
    );
  const id = weeklyData(s).lists[0].id;
  s = beginPractice(s, id, "test", 2);
  const session = weeklyData(s).current!;
  for (let i = 0; i < session.items.length; i++)
    s = submitTurn(
      s,
      session.id,
      i,
      session.items[i].word.text === "dog" ? "dig" : session.items[i].word.text,
      false,
      100 + i,
    );
  expect(revisionQueue(weeklyData(s), id, 200, 3)[0].word.text).toBe("dog");
});
it("hydrates V1/V2 saves unchanged and round-trips weekly sessions without replaying rewards", () => {
  const old = {
    ...freshState(),
    stars: 19,
    tickets: 2,
    session: { game: "racer" as const, endsAt: 90000 },
  };
  expect(hydrate(JSON.parse(JSON.stringify(old)))).toEqual(old);
  let s = prepared();
  s = beginPractice(s, weeklyData(s).lists[0].id, "listen", 2000);
  const session = weeklyData(s).current!;
  s = submitTurn(s, session.id, 0, session.items[0].word.text, false, 3000);
  const copy = hydrate(JSON.parse(JSON.stringify(s)));
  expect(copy).toEqual(s);
  expect(
    submitTurn(copy, session.id, 0, session.items[0].word.text, false, 4000)
      .stars,
  ).toBe(s.stars);
});
it("does not treat valid spelling words named constructor as object prototypes", () => {
  let s = upsertList(
    freshState(),
    { name: "Edge", text: "constructor", testDate: "" },
    1,
  );
  s = beginPractice(s, weeklyData(s).lists[0].id, "listen", 2);
  const x = weeklyData(s).current!;
  s = submitTurn(s, x.id, 0, "constructor", false, 3);
  expect(wordProgress(weeklyData(s), "constructor").independent.correct).toBe(
    1,
  );
  expect(hydrate(JSON.parse(JSON.stringify(s)))).toEqual(s);
});
it("keeps adult assistance attached to a turn after reloading", async () => {
  const { markAssisted } = await import("../src/spelling/engine");
  let s = upsertList(
    freshState(),
    { name: "One", text: "cat", testDate: "" },
    1,
  );
  s = beginPractice(s, weeklyData(s).lists[0].id, "test", 2);
  const x = weeklyData(s).current!;
  s = markAssisted(s, x.id, 0);
  s = hydrate(JSON.parse(JSON.stringify(s)));
  s = submitTurn(s, x.id, 0, "cat", false, 3);
  expect(wordProgress(weeklyData(s), "cat").assisted.correct).toBe(1);
  expect(wordProgress(weeklyData(s), "cat").independentHistory).toEqual([]);
});
it('periodically brings mastered words back without crowding out new words before they are due',()=>{
 const s=upsertList(freshState(),{name:'Due dates',text:'cat,dog',testDate:''},1),d=weeklyData(s),id=d.lists[0].id;
 const p=wordProgress(d,'cat');d.progress.cat={...p,lastSeen:10,nextReview:100,independentHistory:[{sessionId:'three',at:9,correct:true},{sessionId:'two',at:6,correct:true},{sessionId:'one',at:3,correct:true}]};
 expect(isMastered(d.progress.cat)).toBe(true);expect(revisionQueue(d,id,50,1)[0].word.text).toBe('dog');expect(revisionQueue(d,id,200,1)[0].word.text).toBe('cat');
});
it('defers all practice-test stars and word evidence until the final answer',()=>{
 let s=upsertList(grantStars(freshState(),5),{name:'Private test',text:'balloon,elephant',testDate:''},1);s=beginPractice(s,weeklyData(s).lists[0].id,'test',2);const x=weeklyData(s).current!;s=submitTurn(s,x.id,0,x.items[0].word.text,false,3);
 expect(s.stars).toBe(5);expect(s.stats.spelling.attempts).toBe(0);expect(weeklyData(s).progress).toEqual({});const restored=hydrate(JSON.parse(JSON.stringify(s)));s=submitTurn(restored,x.id,1,x.items[1].word.text,false,4);expect(s.stars).toBe(9);expect(s.stats.spelling.correct).toBe(2);expect(weeklyData(s).results[0].stars).toBe(4);
});
it('finds tricky words before capping the revision queue',()=>{
 const s=upsertList(freshState(),{name:'Tricky',text:'cat,dog,fox,hen,pig,cup,sun,hat,bat,balloon',testDate:''},1),d=weeklyData(s),p=wordProgress(d,'balloon');d.progress.balloon={...p,lastMissed:10,lastSeen:20,nextReview:100000,independent:{attempts:2,correct:1},independentHistory:[{sessionId:'two',at:20,correct:true},{sessionId:'one',at:10,correct:false}]};
 const next=beginPractice(s,d.lists[0].id,'tricky',50);expect(weeklyData(next).current?.items.map(i=>i.word.text)).toEqual(['balloon']);
});
