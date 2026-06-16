import assert from "node:assert/strict";
import test from "node:test";
import { recommendMethod } from "./catalog";

test("projet d'école en start académique: mandat en priorité", () => {
  const reco = recommendMethod("start", "Projet d'école en équipe", {
    ptype: "academique",
    genreId: "e_cadrage",
  });
  assert.equal(reco.main, "clarification-du-mandat");
  assert.notEqual(reco.main, "bmc");
});

test("kickoff/cadrage: séquence mandat puis raci", () => {
  const reco = recommendMethod("start", "Atelier de cadrage pour clarifier le lancement", {
    genreId: "e_kickoff",
  });
  assert.equal(reco.main, "clarification-du-mandat");
  assert.ok(reco.alts.includes("raci"));
});

test("business explicite: bmc prioritaire", () => {
  const reco = recommendMethod("start", "Définir le modèle économique d'une startup B2B", {
    ptype: "entrepreneurial",
  });
  assert.equal(reco.main, "bmc");
  assert.ok(reco.alts.includes("lean-canvas"));
});
