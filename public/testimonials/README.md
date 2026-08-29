# Virelia illustrative portrait assets

This directory is reserved for the 12 photorealistic **illustrative profile portraits** used by the premium profile grid.

These files are intentionally not treated as verified customer testimonials. The corresponding data entries keep `isDemo: true` until real, consented customer material replaces them.

Expected files:

- `profile-01.webp`
- `profile-02.webp`
- `profile-03.webp`
- `profile-04.webp`
- `profile-05.webp`
- `profile-06.webp`
- `profile-07.webp`
- `profile-08.webp`
- `profile-09.webp`
- `profile-10.webp`
- `profile-11.webp`
- `profile-12.webp`

Asset requirements:

- WebP only for the final portraits;
- portrait-oriented source, ideally around 640×800 px;
- reasonable file weight (target under ~250 KB per portrait where quality allows);
- natural head-and-shoulders framing with enough margin for `object-fit: cover`;
- no celebrities, public figures, scraped photos or images implying a verified loan outcome;
- international mix matching the existing illustrative profiles.

The UI already references `/testimonials/profile-01.webp` through `/testimonials/profile-12.webp`, uses `loading="lazy"`, explicit dimensions and a clean initials fallback when an image is missing or fails to load.
