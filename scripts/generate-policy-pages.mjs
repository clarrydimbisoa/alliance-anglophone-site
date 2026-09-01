import { writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;

const pages = {
  fr: {
    dir: "fr",
    privacyFile: "confidentialite.html",
    termsFile: "conditions.html",
    nav: [["index.html", "Accueil"], ["programmes.html", "Programmes"], ["tarifs.html", "Tarifs"], ["mission.html", "Mission"], ["impact.html", "Impact"], ["benevolat.html", "Bénévolat"], ["inscription.html", "Inscription"], ["contact.html", "Contact"]],
    privacy: {
      title: "Confidentialité | Alliance Anglophone",
      description: "Comment Alliance Anglophone traite les informations envoyées lors d’une demande d’inscription ou de contact.",
      heading: "Politique de confidentialité",
      intro: "Cette page explique clairement ce que le site traite, ce qui est envoyé à WhatsApp et comment demander l’accès, la correction ou la suppression de vos informations.",
      updated: "Dernière mise à jour : 21 juillet 2026",
      sections: [
        ["1. Fonctionnement du formulaire", `<p>Le formulaire d’inscription est traité dans votre navigateur. Le site ne l’enregistre pas dans une base de données. Lorsque vous validez le formulaire, un message est préparé et WhatsApp s’ouvre. Vos informations ne sont envoyées à Alliance Anglophone que si vous choisissez ensuite d’envoyer ce message.</p>`],
        ["2. Informations concernées", `<p>Selon ce que vous renseignez, le message peut contenir votre nom, âge, numéro WhatsApp, adresse email, ville, niveau d’anglais, programme, module, cohorte ou mois de début souhaité, durée, format, objectif et message complémentaire.</p>`],
        ["3. Finalités", `<p>Alliance Anglophone utilise ces informations uniquement pour répondre à votre demande, vous orienter, organiser votre inscription, vous communiquer les modalités du programme et assurer le suivi administratif utile.</p>`],
        ["4. Destinataires et services techniques", `<p>Le message est reçu par l’équipe autorisée d’Alliance Anglophone. L’envoi et la conservation dans l’application WhatsApp dépendent aussi des services et règles de confidentialité de WhatsApp/Meta. Le site utilise un hébergement web et Google Analytics, qui peuvent traiter des données techniques de navigation selon leurs propres règles.</p>`],
        ["5. Conservation", `<p>Le site ne conserve aucune copie du formulaire. Les conversations reçues par WhatsApp ou email sont gardées uniquement pendant le temps nécessaire au traitement de la demande, à l’inscription et aux obligations administratives applicables, puis supprimées lorsqu’elles ne sont plus nécessaires.</p>`],
        ["6. Vos choix et vos demandes", `<p>Vous pouvez demander l’accès, la correction ou la suppression des informations que vous avez envoyées. Contactez-nous à <a href="mailto:contact@allianceanglophone.mg">contact@allianceanglophone.mg</a> ou au <a href="https://wa.me/261349201200">+261 34 920 1200</a>.</p>`],
        ["7. Mineurs", `<p>Pour un apprenant mineur, le formulaire et les échanges d’inscription doivent être remplis ou supervisés par un parent ou représentant légal.</p>`],
        ["8. Mise à jour", `<p>Cette politique peut évoluer si les outils ou pratiques changent. La date affichée en haut indique la dernière mise à jour publiée.</p>`]
      ]
    },
    terms: {
      title: "Paiement et conditions | Alliance Anglophone",
      description: "Modalités d’inscription, de confirmation, de paiement, d’annulation et de participation aux programmes Alliance Anglophone.",
      heading: "Paiement et conditions d’inscription",
      intro: "Ces informations protègent l’apprenant en distinguant une demande d’information d’une inscription confirmée.",
      updated: "Dernière mise à jour : 1er septembre 2026",
      sections: [
        ["1. Demande et confirmation", `<p>L’envoi du formulaire constitue une demande d’information ou d’inscription. Une place n’est confirmée qu’après réponse écrite d’Alliance Anglophone précisant le programme, le groupe, les dates, le montant et les modalités applicables.</p>`],
        ["2. Calendrier et format", `<p>Les inscriptions payantes sont ouvertes dès maintenant pour une autre cohorte en septembre 2026, la cohorte de novembre 2026 ou les mois suivants. Les dates et horaires sont confirmés par écrit. Les inscriptions à la semaine d’essai sont closes depuis le 1er septembre. Pour les participants déjà confirmés, l’essai comprend des leçons et exercices sur WhatsApp du 7 au 11 septembre, puis un regroupement vidéo WhatsApp le samedi 12 septembre à 10 h. Aucun paiement n’est demandé pour l’essai. Les groupes ordinaires comptent de 6 à 15 participants.</p>`],
        ["3. Prix et paiement", `<p>L’anglais général individuel coûte 90 000 Ar par mois. L’anglais technique et/ou des affaires individuel coûte 125 000 Ar par mois. Les autres prix sont publiés sur la page <a href="tarifs.html">Tarifs</a>. Après confirmation écrite uniquement, les paiements officiels sont MVola au +261 34 920 1200 et Orange Money au +261 37 120 0712, tous deux enregistrés au nom de Ranoelison Dimbisoa Clarry.</p>`],
        ["4. Annulation, report et remboursement", `<p>Avant tout paiement, Alliance Anglophone communique par écrit les règles d’annulation, de report et de remboursement correspondant au programme choisi. Ne payez pas tant que ces conditions ne vous ont pas été communiquées et que vous ne les avez pas acceptées. En cas de doute, demandez une confirmation écrite.</p>`],
        ["5. Participation", `<p>Chaque participant doit respecter les autres apprenants, les horaires, les consignes pédagogiques et la confidentialité des échanges de groupe. Un comportement abusif, discriminatoire ou perturbateur peut entraîner une intervention de l’équipe après avertissement approprié.</p>`],
        ["6. Mineurs", `<p>L’inscription et le paiement pour un apprenant mineur doivent être confirmés par un parent ou représentant légal.</p>`],
        ["7. Contact", `<p>Pour toute confirmation, écrivez à <a href="mailto:contact@allianceanglophone.mg">contact@allianceanglophone.mg</a> ou au <a href="https://wa.me/261349201200">+261 34 920 1200</a>.</p>`]
      ]
    }
  },
  en: {
    dir: "en",
    privacyFile: "privacy.html",
    termsFile: "terms.html",
    nav: [["index.html", "Home"], ["programs.html", "Programs"], ["pricing.html", "Pricing"], ["mission.html", "Mission"], ["impact.html", "Impact"], ["volunteer.html", "Volunteer"], ["registration.html", "Registration"], ["contact.html", "Contact"]],
    privacy: {
      title: "Privacy | Alliance Anglophone", description: "How Alliance Anglophone handles information sent in registration and contact requests.", heading: "Privacy policy", intro: "This page explains what the website processes, what is passed to WhatsApp, and how you can request access, correction, or deletion.", updated: "Last updated: 21 July 2026",
      sections: [
        ["1. How the form works", `<p>The registration form is processed in your browser. The website does not save it in a database. When you submit it, WhatsApp opens with a prepared message. Your information reaches Alliance Anglophone only if you then choose to send that message.</p>`],
        ["2. Information involved", `<p>Depending on what you enter, the message may contain your name, age, WhatsApp number, email, city, English level, selected program, module, preferred cohort or starting month, duration, format, goal, and additional message.</p>`],
        ["3. Purposes", `<p>Alliance Anglophone uses this information only to answer your request, provide guidance, arrange registration, communicate program details, and complete necessary administrative follow-up.</p>`],
        ["4. Recipients and technical services", `<p>The message is received by authorised Alliance Anglophone team members. Sending and storage within WhatsApp also depend on WhatsApp/Meta services and privacy rules. The website uses web hosting and Google Analytics, which may process technical browsing data under their own rules.</p>`],
        ["5. Retention", `<p>The website keeps no copy of the form. WhatsApp or email conversations are kept only as long as needed to handle the request, registration, and applicable administrative obligations, then deleted when no longer necessary.</p>`],
        ["6. Your requests", `<p>You may request access, correction, or deletion of information you sent. Contact <a href="mailto:contact@allianceanglophone.mg">contact@allianceanglophone.mg</a> or <a href="https://wa.me/261349201200">+261 34 920 1200</a>.</p>`],
        ["7. Minors", `<p>For a learner under 18, a parent or legal guardian should complete or supervise the form and registration communications.</p>`],
        ["8. Updates", `<p>This policy may change if the tools or practices change. The date at the top shows the latest published update.</p>`]
      ]
    },
    terms: {
      title: "Payment and terms | Alliance Anglophone", description: "Registration, confirmation, payment, cancellation, and participation terms for Alliance Anglophone programs.", heading: "Payment and registration terms", intro: "This information protects learners by distinguishing an enquiry from a confirmed registration.", updated: "Last updated: 1 September 2026",
      sections: [
        ["1. Request and confirmation", `<p>Submitting the form is an enquiry or registration request. A place is confirmed only after Alliance Anglophone sends written confirmation of the program, group, dates, amount, and applicable terms.</p>`],
        ["2. Schedule and format", `<p>Paid registration is open now for another September 2026 cohort, the November 2026 cohort, or later months. Dates and timetables are confirmed in writing. Free-trial registration closed on 1 September. For participants already confirmed, the trial includes WhatsApp lessons and exercises from 7 to 11 September, followed by a WhatsApp group video session on Saturday, 12 September at 10:00. No payment is required for the trial. Standard groups have 6 to 15 participants.</p>`],
        ["3. Prices and payment", `<p>Individual General English costs 90,000 Ar per month. Individual Technical and/or Business English costs 125,000 Ar per month. Other prices appear on the <a href="pricing.html">Pricing</a> page. Only after written confirmation, the official payment channels are MVola at +261 34 920 1200 and Orange Money at +261 37 120 0712, both registered to Ranoelison Dimbisoa Clarry.</p>`],
        ["4. Cancellation, rescheduling, and refunds", `<p>Before any payment, Alliance Anglophone provides written cancellation, rescheduling, and refund terms for the selected program. Do not pay until those terms have been provided and you accept them. Ask for written confirmation if anything is unclear.</p>`],
        ["5. Participation", `<p>Participants must respect other learners, schedules, teaching instructions, and the confidentiality of group exchanges. Abusive, discriminatory, or disruptive conduct may lead to team intervention after an appropriate warning.</p>`],
        ["6. Minors", `<p>Registration and payment for a learner under 18 must be confirmed by a parent or legal guardian.</p>`],
        ["7. Contact", `<p>For confirmation, contact <a href="mailto:contact@allianceanglophone.mg">contact@allianceanglophone.mg</a> or <a href="https://wa.me/261349201200">+261 34 920 1200</a>.</p>`]
      ]
    }
  },
  mg: {
    dir: "mg",
    privacyFile: "tsiambaratelo.html",
    termsFile: "fepetra.html",
    nav: [["index.html", "Fandraisana"], ["programa.html", "Programa"], ["saram-piofanana.html", "Saram-piofanana"], ["iraka.html", "Iraka"], ["fiantraikany.html", "Fiantraikany"], ["asa-an-tsitrapo.html", "Asa an-tsitrapo"], ["fisoratana.html", "Fisoratana"], ["fifandraisana.html", "Fifandraisana"]],
    privacy: {
      title: "Tsiambaratelo | Alliance Anglophone", description: "Ny fomba itantanan’ny Alliance Anglophone ny mombamomba alefa amin’ny fangatahana fisoratana sy fifandraisana.", heading: "Politika momba ny tsiambaratelo", intro: "Ity pejy ity dia manazava izay karakarain’ny tranonkala, izay alefa amin’ny WhatsApp, ary ny fomba hangatahana fanitsiana na famafana.", updated: "Nohavaozina farany: 21 Jolay 2026",
      sections: [
        ["1. Fiasan’ny formulaire", `<p>Ao amin’ny navigateur-nao no ikarakarana ny formulaire fisoratana. Tsy tehirizin’ny tranonkala ao anaty tahiry izany. Rehefa alefanao izy dia misokatra ny WhatsApp miaraka amin’ny hafatra efa voaomana. Tonga amin’ny Alliance Anglophone ihany ny mombamomba anao rehefa misafidy handefa ilay hafatra ianao.</p>`],
        ["2. Mombamomba voakasika", `<p>Arakaraka izay soratanao, ny hafatra dia mety ahitana anarana, taona, laharana WhatsApp, email, tanàna, haavon’ny anglisy, programa, module, cohorte na volana hanombohana tiana, faharetana, format, tanjona ary hafatra fanampiny.</p>`],
        ["3. Antony ampiasana azy", `<p>Ampiasain’ny Alliance Anglophone ireo vaovao ireo mba hamaliana ny fangatahanao, hanoroana anao, handaminana ny fisoratana, hampitana ny antsipirihan’ny programa ary hanaovana ny fanaraha-maso ara-pitantanana ilaina.</p>`],
        ["4. Mpandray sy tolotra teknika", `<p>Ny ekipan’ny Alliance Anglophone nahazo alalana no mandray ny hafatra. Ny fandefasana sy fitahirizana ao amin’ny WhatsApp dia miankina koa amin’ny tolotra sy fitsipika momba ny tsiambaratelon’ny WhatsApp/Meta. Mampiasa web hosting sy Google Analytics ny tranonkala, izay mety hikarakara angona teknika momba ny fitetezana araka ny fitsipiny.</p>`],
        ["5. Fitahirizana", `<p>Tsy mitahiry kopian’ny formulaire ny tranonkala. Ny resaka voaray amin’ny WhatsApp na email dia tehirizina mandritra ny fotoana ilaina amin’ny fikarakarana ny fangatahana, fisoratana ary adidy ara-pitantanana, ary fafana rehefa tsy ilaina intsony.</p>`],
        ["6. Fangatahanao", `<p>Afaka mangataka hijery, hanitsy na hamafa ny vaovao nalefanao ianao. Mifandraisa amin’ny <a href="mailto:contact@allianceanglophone.mg">contact@allianceanglophone.mg</a> na <a href="https://wa.me/261349201200">+261 34 920 1200</a>.</p>`],
        ["7. Zaza tsy ampy taona", `<p>Raha latsaky ny 18 taona ny mpianatra dia ray aman-dreny na solontena ara-dalàna no tokony hameno na hanara-maso ny formulaire sy ny fifandraisana momba ny fisoratana.</p>`],
        ["8. Fanavaozana", `<p>Mety havaozina ity politika ity rehefa miova ny fitaovana na fomba fiasa. Ny daty etsy ambony no manondro ny fanavaozana farany navoaka.</p>`]
      ]
    },
    terms: {
      title: "Fandoavam-bola sy fepetra | Alliance Anglophone", description: "Fepetra momba ny fisoratana, fanamafisana, fandoavam-bola, fanafoanana ary fandraisana anjara amin’ny programa Alliance Anglophone.", heading: "Fandoavam-bola sy fepetra fisoratana", intro: "Ireo fanazavana ireo dia manavaka ny fangatahana vaovao sy ny fisoratana efa voamarina.", updated: "Nohavaozina farany: 1 Septambra 2026",
      sections: [
        ["1. Fangatahana sy fanamafisana", `<p>Ny fandefasana ny formulaire dia fangatahana vaovao na fisoratana. Voamarina ihany ny toerana rehefa mandefa fanamafisana an-tsoratra ny Alliance Anglophone momba ny programa, groupe, daty, vola ary fepetra ampiharina.</p>`],
        ["2. Daty sy format", `<p>Misokatra dieny izao ny fisoratana misy sarany amin’ny cohorte hafa amin’ny Septambra 2026, cohorte Novambra 2026, na volana manaraka. Hamafisina an-tsoratra ny daty sy ora. Nikatona ny 1 Septambra ny fisoratana amin’ny herinandro fitsapana. Ho an’ireo mpandray anjara efa voamarina, misy lesona sy fanazaran-tena WhatsApp ny 7–11 Septambra ary regroupement vidéo WhatsApp ny Asabotsy 12 Septambra amin’ny 10 ora. Tsy misy fandoavana amin’ny essai. Misy mpandray anjara 6 ka hatramin’ny 15 ny groupe mahazatra.</p>`],
        ["3. Saram-piofanana sy fandoavana", `<p>90 000 Ar isam-bolana ny Anglisy ankapobeny ho an’olon-tokana. 125 000 Ar isam-bolana ny Anglisy teknika sy/na Business English ho an’olon-tokana. Ao amin’ny pejy <a href="saram-piofanana.html">Saram-piofanana</a> ny vidiny hafa. Aorian’ny fanamafisana an-tsoratra ihany, ny fomba fandoavana ofisialy dia MVola +261 34 920 1200 sy Orange Money +261 37 120 0712, samy amin’ny anaran’i Ranoelison Dimbisoa Clarry.</p>`],
        ["4. Fanafoanana, fanemorana ary famerenam-bola", `<p>Alohan’ny fandoavana, ny Alliance Anglophone dia mampita an-tsoratra ny fepetra momba ny fanafoanana, fanemorana ary famerenam-bola mifanaraka amin’ilay programa. Aza mandoa raha tsy voaray sy nekenao ireo fepetra ireo. Mangataha fanamafisana an-tsoratra raha misy tsy mazava.</p>`],
        ["5. Fandraisana anjara", `<p>Ny mpandray anjara dia tokony hanaja ny hafa, ny ora, ny toromarika pedagogika ary ny tsiambaratelon’ny resaka ao amin’ny groupe. Ny fihetsika manaratsy, manavakavaka na manakorontana dia mety hiteraka fandraisan’andraikitry ny ekipa aorian’ny fampitandremana sahaza.</p>`],
        ["6. Zaza tsy ampy taona", `<p>Ny fisoratana sy fandoavam-bola ho an’ny mpianatra latsaky ny 18 taona dia tokony hohamafisin’ny ray aman-dreny na solontena ara-dalàna.</p>`],
        ["7. Fifandraisana", `<p>Raha mila fanamafisana dia manorata amin’ny <a href="mailto:contact@allianceanglophone.mg">contact@allianceanglophone.mg</a> na <a href="https://wa.me/261349201200">+261 34 920 1200</a>.</p>`]
      ]
    }
  }
};

const hreflang = {
  privacy: { fr: "confidentialite.html", en: "privacy.html", mg: "tsiambaratelo.html" },
  terms: { fr: "conditions.html", en: "terms.html", mg: "fepetra.html" }
};

function render(language, config, kind, filename) {
  const copy = config[kind];
  const nav = config.nav.map(([href, label]) => `<a href="${href}">${label}</a>`).join("\n      ");
  const alternates = Object.entries(hreflang[kind]).map(([lang, file]) => `<link rel="alternate" hreflang="${lang}" href="https://allianceanglophone.mg/${lang}/${file}">`).join("\n  ");
  const languageLinks = `<a href="../fr/${hreflang[kind].fr}"><img src="../assets/flag-fr-v2.svg" alt="Français" class="flag-icon"> FR</a>\n      <a href="../en/${hreflang[kind].en}"><img src="../assets/flag-us-v2.svg" alt="English" class="flag-icon"> EN</a>\n      <a href="../mg/${hreflang[kind].mg}"><img src="../assets/flag-mg-v2.svg" alt="Malagasy" class="flag-icon"> MG</a>`;
  const sections = copy.sections.map(([title, body]) => `<section><h2>${title}</h2>${body}</section>`).join("\n        ");
  const privacyLabel = { fr: "Confidentialité", en: "Privacy", mg: "Tsiambaratelo" }[language];
  const termsLabel = { fr: "Paiement et conditions", en: "Payment and terms", mg: "Fandoavam-bola sy fepetra" }[language];
  const contactLabel = { fr: "Contact", en: "Contact", mg: "Fifandraisana" }[language];
  const footer = { fr: "Inscriptions ouvertes pour les prochaines cohortes — inscriptions à l’essai closes.", en: "Upcoming-cohort registration is open — free-trial registration closed.", mg: "Misokatra ny fisoratana amin’ny cohorte manaraka — nikatona ny fisoratana amin’ny essai." }[language];
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${copy.title}</title>
  <meta name="description" content="${copy.description}">
  <link rel="canonical" href="https://allianceanglophone.mg/${language}/${filename}">
  ${alternates}
  <link rel="alternate" hreflang="x-default" href="https://allianceanglophone.mg/fr/${hreflang[kind].fr}">
  <link rel="stylesheet" href="../assets/style-v2.css">
</head>
<body class="policy-page">
  <header class="topbar">
    <a class="brand" href="index.html"><img src="../assets/logo-v2.webp" width="56" height="56" alt="Alliance Anglophone logo"><span>Alliance Anglophone</span></a>
    <nav>${nav}
      ${languageLinks}</nav>
  </header>
  <main>
    <header class="policy-hero"><h1>${copy.heading}</h1><p>${copy.intro}</p></header>
    <article class="policy-content"><p><strong>${copy.updated}</strong></p>${sections}</article>
  </main>
  <footer><p>© 2026 Alliance Anglophone. ${footer}</p><nav class="footer-links" aria-label="${contactLabel}"><a href="${config.privacyFile}">${privacyLabel}</a><a href="${config.termsFile}">${termsLabel}</a><a href="${config.nav.at(-1)[0]}">${contactLabel}</a><a href="https://www.facebook.com/AllianceAnglophoneMG" target="_blank" rel="noopener noreferrer">Facebook — Alliance Anglophone</a></nav></footer>
  <script src="../assets/site-v2.js"></script>
</body>
</html>\n`;
}

for (const [language, config] of Object.entries(pages)) {
  writeFileSync(join(root, config.dir, config.privacyFile), render(language, config, "privacy", config.privacyFile));
  writeFileSync(join(root, config.dir, config.termsFile), render(language, config, "terms", config.termsFile));
}

console.log("Generated privacy and payment/terms pages in three languages.");
