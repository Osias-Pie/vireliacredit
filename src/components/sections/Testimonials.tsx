import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, UserRound } from "lucide-react";
import {
  LOAN_PROFILE_CARDS,
  type LoanProfileCard,
} from "@/lib/data/testimonial-profiles";
import { getProfileSectionCopy } from "@/lib/i18n/testimonial-profiles";
import { useI18n } from "@/lib/i18n/context";

function ProfilePortrait({
  profile,
  alt,
}: {
  profile: LoanProfileCard;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = profile.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 grid place-items-center overflow-hidden bg-[#102f63]"
      >
        <div aria-hidden className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-[#D4AF37]/12 blur-2xl" />
        <div aria-hidden className="absolute -bottom-20 -right-12 h-48 w-48 rounded-full bg-white/8 blur-3xl" />
        <div className="relative flex flex-col items-center gap-3 text-white/70">
          <span className="grid h-20 w-20 place-items-center rounded-full border border-[#D4AF37]/35 bg-[#071a38]/55">
            <UserRound className="h-9 w-9 text-[#D4AF37]/85" strokeWidth={1.5} />
          </span>
          <span className="text-sm font-semibold tracking-[0.22em] text-white/72">{initials}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={profile.image}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={640}
      height={800}
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
      style={{ objectPosition: profile.objectPosition ?? "center 30%" }}
    />
  );
}

/**
 * Premium profile/project grid.
 * Current entries are explicit development/demo profiles, not verified customer reviews.
 */
export function Testimonials() {
  const { activeLocale } = useI18n();
  const copy = getProfileSectionCopy(activeLocale);

  return (
    <section
      id="profiles-projects"
      className="border-y border-[#D4AF37]/20 bg-[#071a38] py-20 text-white sm:py-24 lg:py-28"
    >
      <div className="container-page">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
            {copy.subtitle}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 xl:gap-7">
          {LOAN_PROFILE_CARDS.map((profile, index) => {
            const alt = copy.imageAlt.replace("{name}", profile.name);
            return (
              <motion.article
                key={profile.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.42, delay: Math.min(index * 0.035, 0.2) }}
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-[#D4AF37]/24 bg-[#0B2A5B] shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/48"
              >
                <div className="relative aspect-[5/4] overflow-hidden border-b border-[#D4AF37]/18 bg-[#102f63]">
                  <ProfilePortrait profile={profile} alt={alt} />
                  <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#071a38]/72 to-transparent" />
                  <div
                    aria-hidden
                    className="absolute bottom-4 right-4 flex items-center gap-0.5 rounded-full border border-[#D4AF37]/32 bg-[#071a38]/88 px-3 py-2 backdrop-blur-sm"
                  >
                    {Array.from({ length: profile.rating }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]"
                        strokeWidth={1.6}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-white">{profile.name}</h3>
                    <p className="mt-1 text-sm font-medium text-[#D4AF37]">
                      {copy.roles[profile.roleKey]}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-white/55">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D4AF37]/80" aria-hidden />
                      <span>{profile.location}</span>
                    </p>
                  </div>

                  <p className="mt-4 flex-1 text-sm leading-6 text-white/78">
                    {copy.texts[profile.textKey]}
                  </p>

                  <div className="mt-5 border-t border-[#D4AF37]/18 pt-4">
                    <span className="inline-flex max-w-full rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold text-[#D4AF37]">
                      {copy.loanTypes[profile.loanType]}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
