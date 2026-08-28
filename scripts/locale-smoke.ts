import assert from "node:assert/strict";
import {
  resolveInitialLocale,
  resolveLocalePriority,
} from "../src/lib/i18n/locale-core.ts";
import { CONTRACT_TRANSLATIONS } from "../src/lib/contracts/contract-translations.ts";

// Scenario A — Portugal initial visit.
assert.equal(resolveInitialLocale({ country: "PT", acceptLanguage: "en-US,en;q=0.9" }), "pt");

// Scenario B — Portugal detected, then manual English. Manual choice always wins.
assert.equal(resolveLocalePriority({ manual: "en", detected: "pt", country: "PT", acceptLanguage: "pt-PT" }), "en");

// Scenario C — France.
assert.equal(resolveInitialLocale({ country: "FR", acceptLanguage: "en-US" }), "fr");

// Scenario D — Germany.
assert.equal(resolveInitialLocale({ country: "DE", acceptLanguage: "fr-FR" }), "de");

// Scenario E — manual FR -> ES.
assert.equal(resolveLocalePriority({ manual: "es", detected: "fr", country: "FR" }), "es");

// Scenario F — reload after PT choice/detection remains PT.
assert.equal(resolveLocalePriority({ detected: "pt", country: "FR", acceptLanguage: "fr-FR" }), "pt");

// Unknown country: supported browser language first, otherwise English.
assert.equal(resolveInitialLocale({ country: "US", acceptLanguage: "de-DE,de;q=0.9" }), "de");
assert.equal(resolveInitialLocale({ country: "US", acceptLanguage: "nl-NL,nl;q=0.9" }), "en");

// Contract language smoke tests.
assert.equal(CONTRACT_TRANSLATIONS.en.title, "LOAN AGREEMENT PROJECT");
assert.equal(CONTRACT_TRANSLATIONS.en.subtitle, "Subject to application approval");
assert.equal(CONTRACT_TRANSLATIONS.pt.title, "PROJETO DE CONTRATO DE CRÉDITO");
assert.ok(!CONTRACT_TRANSLATIONS.en.title.includes("CONTRAT DE PRÊT"));
assert.ok(!CONTRACT_TRANSLATIONS.pt.title.includes("CONTRAT DE PRÊT"));
assert.deepEqual(Object.keys(CONTRACT_TRANSLATIONS).sort(), ["de", "en", "es", "fr", "hr", "it", "pt"]);

console.log("Locale smoke tests passed: PT, PT→EN, FR, DE, manual ES, refresh PT, EN/PT contracts.");
