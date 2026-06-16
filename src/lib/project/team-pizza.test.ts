import assert from "node:assert/strict";
import test from "node:test";
import { pizzaPartsUsed, pizzaStatus } from "./pizza";
import { getTeamAdvice, shouldShowOverflowBanner } from "./team-advice";
import {
  allMembersAssigned,
  createInitialSubgroupDrafts,
  defaultLimitRemovalIds,
  distributeMemberIdsEvenly,
  subgroupDraftsToConfirmed,
} from "./subgroups";

test("pizzaStatus exposes advice button for edge cases", () => {
  assert.equal(pizzaStatus(2).showAdviceButton, true);
  assert.equal(pizzaStatus(5).showAdviceButton, false);
  assert.equal(pizzaStatus(10).showAdviceButton, true);
  assert.equal(pizzaStatus(11).showAdviceButton, true);
  assert.equal(pizzaStatus(11).tone, "danger");
});

test("pizzaPartsUsed caps at 10", () => {
  assert.equal(pizzaPartsUsed(7), 7);
  assert.equal(pizzaPartsUsed(12), 10);
});

test("getTeamAdvice returns overflow actions above 10", () => {
  const advice = getTeamAdvice(12);
  assert.equal(advice.title, "Nos conseils pour une équipe trop grande");
  assert.deepEqual(
    advice.actions.map((a) => a.act),
    ["subgroups", "atelier", "limit"],
  );
});

test("shouldShowOverflowBanner when count exceeds max", () => {
  assert.equal(shouldShowOverflowBanner(11, false), true);
  assert.equal(shouldShowOverflowBanner(11, true), false);
  assert.equal(shouldShowOverflowBanner(10, false), false);
});

test("distributeMemberIdsEvenly spreads members", () => {
  const buckets = distributeMemberIdsEvenly(["a", "b", "c", "d", "e"], 2);
  assert.deepEqual(buckets, [["a", "c", "e"], ["b", "d"]]);
});

test("subgroup drafts convert to confirmed groups", () => {
  const drafts = createInitialSubgroupDrafts(["m1", "m2", "m3"], 2);
  const confirmed = subgroupDraftsToConfirmed(drafts);
  assert.equal(confirmed.length, 2);
  assert.ok(confirmed.every((g) => g.memberIds.length > 0));
});

test("allMembersAssigned validates coverage", () => {
  const groups = [{ id: "g1", name: "A", memberIds: ["m1", "m2"] }];
  assert.equal(allMembersAssigned(["m1", "m2"], groups), true);
  assert.equal(allMembersAssigned(["m1", "m2", "m3"], groups), false);
  assert.equal(allMembersAssigned(["m1", "m2"], groups, ["m3"]), false);
});

test("defaultLimitRemovalIds keeps first 10", () => {
  const ids = Array.from({ length: 12 }, (_, i) => `m${i}`);
  assert.deepEqual(defaultLimitRemovalIds(ids), ["m10", "m11"]);
});
