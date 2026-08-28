import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LOAN_PROFILE_CARDS } from "../src/lib/data/testimonial-profiles.ts";
import { SUPPORTED_LOCALES } from "../src/lib/i18n/locale-core.ts";

assert.equal(LOAN_PROFILE_CARDS.length, 12, "The Homepage profile grid must contain exactly 12 cards");

assert.deepEqual(
  LOAN_PROFILE_CARDS.map((profile) => profile.loanType),
  [
    "personal",
    "personal",
    "professional",
    "professional",
    "business",
    "business",
    "housing",
    "housing",
    "studies",
    "project",
    "retired",
    "retired",
  ],
  "Loan badges must follow the requested 12-card distribution",
);

assert.equal(new Set(LOAN_PROFILE_CARDS.map((profile) => profile.image)).size, 12);
assert.ok(
  LOAN_PROFILE_CARDS.every((profile, index) =>
    profile.image === `/testimonials/profile-${String(index + 1).padStart(2, "0")}.webp`,
  ),
  "Portrait paths must be predictable and independently replaceable",
);
assert.ok(LOAN_PROFILE_CARDS.every((profile) => profile.rating === 5));
assert.ok(LOAN_PROFILE_CARDS.every((profile) => profile.isDemo === true));

const translationSource = readFileSync(
  new URL("../src/lib/i18n/testimonial-profiles.ts", import.meta.url),
  "utf8",
);
const occurrences = (needle: string) => translationSource.split(needle).length - 1;

for (const locale of SUPPORTED_LOCALES) {
  assert.match(
    translationSource,
    new RegExp(`\\n  ${locale}: \\{`),
    `Missing profile section locale: ${locale}`,
  );
}

assert.equal(occurrences("profile_12:"), SUPPORTED_LOCALES.length, "Every locale must contain all 12 profile texts");
assert.equal(occurrences("retired_man:"), SUPPORTED_LOCALES.length, "Every locale must contain all profile roles");
assert.ok(translationSource.includes('housing: "Prêt travaux"'));
assert.ok(translationSource.includes('retired: "Prêt retraité"'));

console.log("Profile grid smoke tests passed: 12 cards, badge distribution, demo flags, image paths and 7 locales.");
