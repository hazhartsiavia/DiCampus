import Link from "next/link";
import { DomainScroller } from "@/components/home";
import { Arrow } from "@/components/icons";
import { Reveal } from "@/components/motion";
import { CourseCard, ProgressBar, Thumb } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { catalogStats, listDomains, listEstablishments, listSpecializations, myCourses, popularCourses } from "@/lib/queries";

const AUDIENCES = [
  { title: "Étudiants", text: "Revoyez vos cours de licence et de master, entraînez-vous avec les quiz et validez chaque module.", href: "/explorer?niveau=Licence%201", cta: "Cours de licence" },
  { title: "Futurs bacheliers", text: "Préparez le bac et découvrez les méthodes de l'université avant même d'y entrer.", href: "/explorer?niveau=Pr%C3%A9pa%20bac", cta: "Préparer le bac" },
  { title: "Formation continue", text: "Professionnels et diplômés : des formations certifiantes en énergie, gestion ou langues.", href: "/explorer?niveau=Formation%20continue", cta: "Se former" },
  { title: "Enseignants", text: "Publiez vos cours, TP et examens surveillés, puis suivez la progression et les notes de vos étudiants.", href: "/enseignant", cta: "Espace enseignant" },
];

const FAQ = [
  { q: "Qu'est-ce que DiCampus ?", a: "DiegoCampus est la plateforme de cours et de formations en ligne du monde universitaire d'Antsiranana. Vous y suivez des cours en français, avec lectures, vidéos, activités, quiz, travaux pratiques et examens." },
  { q: "L'inscription est-elle gratuite ?", a: "Oui : créer un compte et s'inscrire aux cours publiés ne coûte rien." },
  { q: "Puis-je apprendre à mon rythme ?", a: "Oui. Votre progression est enregistrée élément par élément : vous reprenez exactement là où vous vous étiez arrêté, sur ordinateur comme sur téléphone." },
  { q: "Comment obtenir un certificat ?", a: "Terminez tous les éléments d'un cours (et son examen final s'il en a un) : un certificat vérifiable apparaît alors dans « Mes certificats »." },
  { q: "Je suis enseignant : comment publier un cours ?", a: "Ouvrez l'Espace enseignant et envoyez une demande d'accès. Une fois validée, vous créez vos cours, TP et examens, puis suivez les notes de vos étudiants." },
];

const HERO_SHAPES = [
  { icon: "∑", className: "left-[4%] top-6 size-16 rotate-[-10deg] rounded-2xl bg-brand text-white sm:size-20" },
  { icon: "Aa", className: "right-[5%] top-10 size-16 rounded-pill bg-salmon sm:size-20", clip: "polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%)" },
  { icon: "⚡", className: "bottom-6 left-[10%] size-20 bg-salmon sm:size-24", clip: "polygon(30% 0, 70% 0, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0 70%, 0 30%)" },
  { icon: "✦", className: "bottom-8 right-[11%] size-20 bg-mint sm:size-24", clip: "polygon(50% 0, 62% 22%, 86% 14%, 80% 38%, 100% 50%, 80% 62%, 86% 86%, 62% 78%, 50% 100%, 38% 78%, 14% 86%, 20% 62%, 0 50%, 20% 38%, 14% 14%, 38% 22%)" },
];

function Title({ before, accent, after, className = "" }: { before: string; accent: string; after?: string; className?: string }) {
  return (
    <h2 className={`text-4xl font-bold leading-[1.12] tracking-tight sm:text-[3.5rem] ${className}`}>
      {before} <span className="text-brand">{accent}</span>{after ? <> {after}</> : null}
    </h2>
  );
}

export default async function Home() {
  const user = await getCurrentUser();
  const inProgress = user ? myCourses(user.id).filter((c) => !c.completed_at).slice(0, 3) : [];
  const domains = listDomains();
  const specs = listSpecializations();
  const stats = catalogStats();
  const popular = popularCourses(6);
  const establishments = listEstablishments();
  const spotlight = popular[0];

  return (
    <>
      {/* ---------- Héros ---------- */}
      <section className="container-page relative isolate pb-14 pt-16 text-center sm:pb-20 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block" aria-hidden>
          {HERO_SHAPES.map((s) => (
            <span key={s.icon} className={`absolute grid place-items-center text-2xl font-bold ${s.className}`} style={s.clip ? { clipPath: s.clip } : undefined}>
              {s.icon}
            </span>
          ))}
        </div>
        <Reveal from={{ opacity: 0, y: 24 }}>
          <h1 className="mx-auto max-w-5xl text-[2.75rem] font-bold leading-[1.12] tracking-tight sm:text-7xl lg:text-[5.5rem]">
            Apprenez et progressez avec le campus de <span className="text-brand">Diego</span>
          </h1>
        </Reveal>
        <Reveal from={{ opacity: 0, y: 20 }} delay={120}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed">
            Cours et formations du monde universitaire d&apos;Antsiranana, en ligne et en français. Apprenez à votre rythme, jusqu&apos;au certificat.
          </p>
        </Reveal>
        <Reveal from={{ opacity: 0, y: 20 }} delay={220} className="mt-9 flex flex-wrap justify-center gap-4">
          <Link href="/explorer" className="btn-primary px-7 py-4">Explorer les cours</Link>
          <Link href={user ? "/mon-apprentissage" : "/inscription"} className="btn-outline px-7 py-4">
            {user ? "Reprendre mes cours" : "Créer un compte"}
          </Link>
        </Reveal>
      </section>

      {/* ---------- Mosaïque ---------- */}
      <section className="container-page">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.5fr_0.5fr]">
          <Reveal from={{ opacity: 0, y: 30 }} className="min-h-[22rem]">
            {inProgress.length > 0 ? (
              <div className="flex h-full flex-col rounded-card-lg bg-surface p-6 sm:p-8">
                <p className="eyebrow self-start">Continuer à apprendre</p>
                <ul className="mt-6 space-y-3">
                  {inProgress.map((c) => (
                    <li key={c.id}>
                      <Link href={c.next_item_id ? `/cours/${c.slug}/apprendre/${c.next_item_id}` : `/cours/${c.slug}`} className="hover-lift flex items-center gap-4 rounded-card bg-white p-3">
                        <Thumb hue={c.hue} title={c.title} className="size-16 shrink-0 rounded-xl [&_span]:p-2 [&_span]:text-lg" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-lg font-bold">{c.title}</p>
                          <p className="mb-2 text-sm text-ink-soft">{c.done}/{c.total} éléments terminés</p>
                          <ProgressBar value={(c.done / c.total) * 100} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : spotlight ? (
              <Link href={`/cours/${spotlight.slug}`} className="hover-zoom relative block h-full min-h-[22rem] overflow-hidden rounded-card-lg">
                <Thumb hue={spotlight.hue} title={spotlight.title} className="zoom absolute inset-0 [&_span]:hidden" />
                <div className="absolute inset-x-5 bottom-5 rounded-card bg-white p-5 sm:right-auto sm:max-w-sm">
                  <p className="text-sm text-ink-soft">À la une · {spotlight.partner_name}</p>
                  <p className="mt-1 text-2xl font-bold leading-snug tracking-tight">{spotlight.title}</p>
                </div>
              </Link>
            ) : null}
          </Reveal>

          <div className="grid gap-6">
            <Reveal from={{ opacity: 0, y: 30 }} delay={100} className="flex flex-col justify-between gap-6 rounded-card-lg bg-salmon p-6">
              <div className="flex -space-x-2">
                {establishments.slice(0, 4).map((e) => (
                  <span key={e.slug} className="grid size-14 place-items-center rounded-pill border-[3px] border-salmon bg-white text-[0.65rem] font-bold">{e.short}</span>
                ))}
              </div>
              <p className="text-2xl font-bold leading-snug tracking-tight">{establishments.length} établissements et {stats.courses} cours en ligne</p>
            </Reveal>
            <Reveal from={{ opacity: 0, y: 30 }} delay={180} className="flex flex-col justify-between gap-6 rounded-card-lg bg-mint p-6">
              <p className="text-2xl font-bold leading-snug tracking-tight">« Apprendre à son rythme, depuis le campus, chez soi ou au travail. »</p>
              <p className="text-sm">La promesse DiCampus</p>
            </Reveal>
          </div>

          <Reveal from={{ opacity: 0, y: 30 }} delay={260} className="relative isolate flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-card-lg bg-brand p-6 text-white">
            <span className="absolute -right-10 -top-10 -z-10 size-48 rounded-pill bg-white/10" aria-hidden />
            <span className="absolute right-8 top-24 -z-10 size-20 rounded-pill bg-white/10" aria-hidden />
            <p className="text-6xl font-bold tracking-tight">{stats.hours} h</p>
            <p className="mt-2 text-lg">de contenu, du bac au master et en formation continue.</p>
          </Reveal>
        </div>
      </section>

      {/* ---------- Établissements ---------- */}
      <section className="container-page py-20 text-center">
        <p className="text-lg">Des cours proposés par les établissements universitaires d&apos;Antsiranana</p>
        <ul className="mx-auto mt-10 grid max-w-sm gap-4 sm:flex sm:max-w-none sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10 sm:gap-y-6">
          {establishments.map((e) => (
            <li key={e.slug} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-[0.65rem] font-bold text-white">{e.short}</span>
              <span className="text-left text-lg font-semibold leading-tight">{e.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Domaines ---------- */}
      <section id="domaines" className="container-page grid gap-10 pb-24 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <Reveal from={{ opacity: 0, y: 24 }}>
          <Title before="Explorez nos" accent="domaines" />
          <p className="mt-5 max-w-sm text-lg leading-relaxed">Des sciences aux lettres, de l&apos;ingénierie à la gestion : trouvez les cours de votre filière.</p>
          <Link href="/explorer" className="btn-primary mt-8">Tout le catalogue</Link>
        </Reveal>
        <DomainScroller domains={domains.map((d) => ({ slug: d.slug, name: d.name, icon: d.icon, count: d.course_count }))} />
      </section>

      {/* ---------- Cours populaires ---------- */}
      <section className="bg-surface py-24">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Title before="Les cours les plus" accent="suivis" />
            <Link href="/explorer" className="btn-primary">Voir tous les cours</Link>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((c, i) => (
              <Reveal as="li" key={c.id} from={{ opacity: 0, y: 30 }} delay={(i % 3) * 100}>
                <CourseCard course={c} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Parcours ---------- */}
      <section id="parcours" className="container-page grid scroll-mt-28 gap-12 py-24 lg:grid-cols-2 lg:items-center">
        <Reveal from={{ opacity: 0, y: 30 }} className="relative">
          <div className="grid grid-cols-3 gap-4">
            {specs.map((s, i) => (
              <Link key={s.slug} href={`/parcours/${s.slug}`} className={`hover-zoom relative block aspect-[3/4] overflow-hidden rounded-card-lg ${i === 1 ? "translate-y-8" : ""}`}>
                <Thumb hue={[260, 160, 20][i % 3]} title={s.title} className="zoom absolute inset-0 [&_span]:hidden" />
                <span className="absolute inset-x-3 bottom-3 rounded-xl bg-white px-3 py-2 text-sm font-bold leading-snug">{s.title}</span>
              </Link>
            ))}
          </div>
          <div className="absolute -top-8 right-2 rounded-card bg-white p-5 shadow-[0_1.5rem_3rem_-1.5rem_rgb(40_17_57_/_0.3)] sm:right-6">
            <p className="text-lg font-bold leading-snug">Parcours métier</p>
            <p className="mt-2 text-4xl font-bold text-brand">{stats.specializations}</p>
          </div>
        </Reveal>
        <Reveal from={{ opacity: 0, y: 30 }} delay={120}>
          <Title before="Des parcours pensés pour un" accent="métier" />
          <p className="mt-6 text-lg leading-relaxed">
            Enchaînez plusieurs cours dans le bon ordre : chaque étape s&apos;appuie sur la précédente, jusqu&apos;aux compétences d&apos;un vrai métier.
          </p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-4xl font-bold tracking-tight">{stats.courses}</dt>
              <dd className="mt-2 text-ink-soft">cours et formations, du bac au master et en formation continue.</dd>
            </div>
            <div>
              <dt className="text-4xl font-bold tracking-tight">{stats.modules}</dt>
              <dd className="mt-2 text-ink-soft">modules avec lectures, activités, quiz et travaux pratiques.</dd>
            </div>
          </dl>
          <ul className="mt-8 space-y-3">
            {specs.map((s) => (
              <li key={s.slug}>
                <Link href={`/parcours/${s.slug}`} className="hover-nudge flex items-center justify-between gap-4 rounded-card bg-surface px-5 py-4 transition-colors hover:bg-brand-50">
                  <span>
                    <span className="block font-bold">{s.title}</span>
                    <span className="text-sm text-ink-soft">{s.course_count} cours · {s.hours} h</span>
                  </span>
                  <Arrow className="nudge size-5 shrink-0 text-brand" />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---------- Pour qui ---------- */}
      <section className="container-page py-16">
        <Title before="Une plateforme pour toute la" accent="communauté universitaire" className="mx-auto max-w-4xl text-center" />
        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a, i) => (
            <Reveal as="li" key={a.title} from={{ opacity: 0, y: 30 }} delay={i * 90}>
              <Link href={a.href} className="hover-lift hover-nudge flex h-full flex-col rounded-card-lg bg-surface p-7">
                <span className="text-6xl font-bold leading-none text-brand-100">0{i + 1}</span>
                <p className="mt-6 text-2xl font-bold tracking-tight">{a.title}</p>
                <p className="mt-3 flex-1 text-lg leading-relaxed">{a.text}</p>
                <p className="mt-6 inline-flex items-center gap-2 font-bold text-brand">{a.cta} <Arrow className="nudge size-4" /></p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------- Questions fréquentes ---------- */}
      <section className="container-page grid gap-10 pt-16 lg:grid-cols-[0.9fr_1.1fr]">
        <h2 className="text-4xl font-bold leading-[1.12] tracking-tight sm:text-[3.5rem]">Questions fréquentes</h2>
        <div className="space-y-5">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-card-lg bg-surface px-7 py-6 open:bg-brand-50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-xl font-bold tracking-tight [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="relative size-5 shrink-0" aria-hidden>
                  <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-pill bg-ink" />
                  <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-pill bg-ink transition-transform group-open:rotate-90 group-open:opacity-0" />
                </span>
              </summary>
              <p className="mt-4 text-lg leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

