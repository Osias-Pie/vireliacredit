import type { SupportedLocale } from "./locale-core";

const VALUES = {
  fr: {
    notProvided: "Non renseigné", notApplicable: "Non applicable", received: "Votre demande a bien été reçue. Notre équipe va l'examiner.",
    employment: { employee: "Salarié", self_employed: "Indépendant", business_owner: "Chef d’entreprise", retired: "Retraité", other: "Autre situation" },
    programs: { personal: "Prêt personnel", professional: "Prêt professionnel", business: "Prêt entreprise", housing: "Prêt travaux et habitat", studies: "Prêt études", project: "Prêt projet", retired: "Prêt retraité" },
    speeds: { urgent: "Urgent", "24h": "24 h", "48h": "48 h", "3_5_business_days": "3 à 5 jours ouvrés", within_one_week: "Sous une semaine" },
  },
  en: {
    notProvided: "Not provided", notApplicable: "Not applicable", received: "Your application has been received. Our team will review it.",
    employment: { employee: "Employee", self_employed: "Self-employed", business_owner: "Business owner", retired: "Retired", other: "Other situation" },
    programs: { personal: "Personal loan", professional: "Professional loan", business: "Business loan", housing: "Home improvement loan", studies: "Study loan", project: "Project loan", retired: "Retiree loan" },
    speeds: { urgent: "Urgent", "24h": "24 hours", "48h": "48 hours", "3_5_business_days": "3 to 5 business days", within_one_week: "Within one week" },
  },
  de: {
    notProvided: "Nicht angegeben", notApplicable: "Nicht anwendbar", received: "Ihr Antrag ist eingegangen. Unser Team wird ihn prüfen.",
    employment: { employee: "Angestellt", self_employed: "Selbstständig", business_owner: "Unternehmer", retired: "Im Ruhestand", other: "Andere Situation" },
    programs: { personal: "Privatdarlehen", professional: "Berufsdarlehen", business: "Unternehmensdarlehen", housing: "Wohn- und Renovierungsdarlehen", studies: "Studiendarlehen", project: "Projektdarlehen", retired: "Darlehen für Rentner" },
    speeds: { urgent: "Dringend", "24h": "24 Stunden", "48h": "48 Stunden", "3_5_business_days": "3 bis 5 Werktage", within_one_week: "Innerhalb einer Woche" },
  },
  es: {
    notProvided: "No indicado", notApplicable: "No aplicable", received: "Su solicitud ha sido recibida. Nuestro equipo la estudiará.",
    employment: { employee: "Asalariado", self_employed: "Autónomo", business_owner: "Empresario", retired: "Jubilado", other: "Otra situación" },
    programs: { personal: "Préstamo personal", professional: "Préstamo profesional", business: "Préstamo para empresa", housing: "Préstamo para vivienda y reformas", studies: "Préstamo para estudios", project: "Préstamo para proyecto", retired: "Préstamo para jubilados" },
    speeds: { urgent: "Urgente", "24h": "24 horas", "48h": "48 horas", "3_5_business_days": "3 a 5 días laborables", within_one_week: "En una semana" },
  },
  pt: {
    notProvided: "Não indicado", notApplicable: "Não aplicável", received: "O seu pedido foi recebido. A nossa equipa irá analisá-lo.",
    employment: { employee: "Assalariado", self_employed: "Trabalhador independente", business_owner: "Empresário", retired: "Reformado", other: "Outra situação" },
    programs: { personal: "Crédito pessoal", professional: "Crédito profissional", business: "Crédito empresarial", housing: "Crédito para habitação e obras", studies: "Crédito para estudos", project: "Crédito para projeto", retired: "Crédito para reformados" },
    speeds: { urgent: "Urgente", "24h": "24 horas", "48h": "48 horas", "3_5_business_days": "3 a 5 dias úteis", within_one_week: "No prazo de uma semana" },
  },
  it: {
    notProvided: "Non indicato", notApplicable: "Non applicabile", received: "La richiesta è stata ricevuta. Il nostro team la esaminerà.",
    employment: { employee: "Dipendente", self_employed: "Lavoratore autonomo", business_owner: "Imprenditore", retired: "Pensionato", other: "Altra situazione" },
    programs: { personal: "Prestito personale", professional: "Prestito professionale", business: "Prestito aziendale", housing: "Prestito per casa e lavori", studies: "Prestito per studi", project: "Prestito per progetto", retired: "Prestito per pensionati" },
    speeds: { urgent: "Urgente", "24h": "24 ore", "48h": "48 ore", "3_5_business_days": "3-5 giorni lavorativi", within_one_week: "Entro una settimana" },
  },
  hr: {
    notProvided: "Nije navedeno", notApplicable: "Nije primjenjivo", received: "Vaš je zahtjev zaprimljen. Naš tim će ga pregledati.",
    employment: { employee: "Zaposlenik", self_employed: "Samozaposlen", business_owner: "Vlasnik poduzeća", retired: "Umirovljenik", other: "Druga situacija" },
    programs: { personal: "Osobni kredit", professional: "Profesionalni kredit", business: "Poslovni kredit", housing: "Kredit za stanovanje i radove", studies: "Kredit za studij", project: "Projektni kredit", retired: "Kredit za umirovljenike" },
    speeds: { urgent: "Hitno", "24h": "24 sata", "48h": "48 sati", "3_5_business_days": "3 do 5 radnih dana", within_one_week: "U roku od tjedan dana" },
  },
} as const;

export function dossierValues(locale: SupportedLocale) {
  return VALUES[locale] ?? VALUES.fr;
}

export function localizeEmployment(value: string | null | undefined, locale: SupportedLocale) {
  return dossierValues(locale).employment[value as keyof typeof VALUES.fr.employment] ?? value ?? dossierValues(locale).notProvided;
}

export function localizeProgram(value: string | null | undefined, locale: SupportedLocale) {
  return dossierValues(locale).programs[value as keyof typeof VALUES.fr.programs] ?? value ?? dossierValues(locale).notProvided;
}

export function localizeSpeed(value: string | null | undefined, locale: SupportedLocale) {
  return dossierValues(locale).speeds[value as keyof typeof VALUES.fr.speeds] ?? value ?? dossierValues(locale).notProvided;
}
