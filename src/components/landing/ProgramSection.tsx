import { useSeminarInfo, useFormationModules } from '@/hooks/useSeminarData';
import { BookOpen, CheckCircle, Target, Sparkles } from 'lucide-react';

// Contenu fixe de la formation en ligne — toujou vizib, pa depann de baz done
const FORMATION_MODULES = [
  {
    id: '1',
    emoji: '🟣',
    num: 1,
    title: 'Baz yo ak Zouti IA Gratis',
    subtitle: 'Fondman Entèlijans Atifisyèl pou Devlopman',
    points: [
      'Kisa IA jenèratif ye ?',
      'Kisa yon prompt ye ?',
      'Estrateji pou kreye bon prompt',
      '',
      'Dekouvèt Zouti IA Gratis: ChatGPT, Copilot, Google AI Studio',
      'Platfòm No-Code / Low-Code: Antigravity, Emergent.sh',
    ],
  },
  {
    id: '2',
    emoji: '🟣',
    num: 2,
    title: 'Prompt Engineering',
    subtitle: 'Teknik Avanse pou Kreye Prompt Efikas',
    points: [
      'Kijan pou jwenn pi bon rezilta ak IA',
      'Evite erè kouran nan prompt',
      'Pratik ak egzanp reyèl nan devlopman',
    ],
  },
  {
    id: '3',
    emoji: '🟣',
    num: 3,
    title: 'Konfigirasyon Platfòm yo (Kreye Kont ou)',
    subtitle: 'Ou ap aprann kijan pou kreye kont epi konfigire chak platfòm etap pa etap',
    points: [
      'Antigravity — Kreye kont + premye pwojè',
      'Emergent.sh — Kreye kont + eksplòrasyon',
      'Google AI Studio — Kreye kont + konfigirasyon',
      'GitHub — Kreye kont + premye repo',
      'Supabase — Kreye kont + baz done',
      'Cursor IDE — Enstale + konfigire',
      'Vercel — Kreye kont + deplwaman',
      'Porkbun — Kreye kont + non domèn',
      'Render — Kreye kont + sèvè',
    ],
  },
  {
    id: '4',
    emoji: '🟣',
    num: 4,
    title: 'GitHub Copilot ak Cursor IDE',
    subtitle: 'Maîtrise Zouti IA pou Edisyon Kòd',
    points: [
      'Travay ak Cursor IDE asiste pa IA',
      'Rezoud pwoblèm kòd nan tan reyèl',
    ],
  },
  {
    id: '5',
    emoji: '🟣',
    num: 5,
    title: 'Wòkflow Entegrasyon Konplè',
    subtitle: 'De Jenèrasyon rive Deplwaman',
    points: [
      'Supabase : baz done ak backend',
      'GitHub : jesyon vèsyon ak kolaborasyon',
      'Cursor IDE : edite ak amelyore kòd ou',
      'Eksporte pwojè depi Antigravity oswa Emergent.sh',
      'Transfere pwojè nan GitHub, enpòte nan Cursor IDE',
      'Bon pratik entegrasyon kontini (CI/CD)',
    ],
  },
  {
    id: '6',
    emoji: '🟣',
    num: 6,
    title: 'Deplwaman ak Otomatizasyon',
    subtitle: 'Pibliye Pwojè ou sou Entènèt',
    points: [
      'Deplwaman otomatik ak Vercel',
      'Jesyon sèvè ak Render',
      'Konfigirasyon non domèn ak Porkbun',
      'Optimizasyon final ak IA',
    ],
  },
  {
    id: 'p1',
    emoji: '🔵',
    num: 'P1',
    title: 'Pwojè Pratik 1 — App Web (Live)',
    subtitle: 'Devlopman konplè yon aplikasyon web reyèl — SaaS pou klinik dantè kote responsab ka kreye ajan AI pou resevwa apèl',
    points: [
      'Definisyon objèktif ak fonksyonalite',
      'Devlopman live ak asistans IA (Antigravity / Emergent.sh + Cursor IDE)',
      'Entegrasyon Supabase pou baz done',
      'Deplwaman sou Vercel, konfigirasyon domèn ak Porkbun',
      'Tès ak kòreksyon an tan reyèl',
    ],
  },
  {
    id: 'p2',
    emoji: '🔵',
    num: 'P2',
    title: 'Pwojè Pratik 2 — App Mobil (Live)',
    subtitle: 'Devlopman konplè yon aplikasyon mobil reyèl — Sistèm pou moun kòmande taxi an liy pou Ayiti',
    points: [
      'Konsepsyon entèfas mobil ak IA',
      'Jenèrasyon kòd ak Cursor IDE + Google AI Studio',
      'Tès sou aparèy reyèl',
      'Entegrasyon baz done Supabase',
      'Prepare app la pou piblikasyon',
    ],
  },
  {
    id: 'bonus',
    emoji: '🎁',
    num: 'Bonus',
    title: 'Pibliye App ou sou Play Store',
    subtitle: 'Kijan pou mete yon app sou Google Play Store',
    points: [
      'Kreye kont Google Play Console',
      'Prepare fichye APK / AAB',
      'Konfigirasyon paj app la (deskripsyon, logo, screenshot)',
      'Soumèt app la pou revizyon',
      'Swiv pwosesis apwobasyon an',
      '',
      'Gid pou konekte pwojè ou ak GitHub, Supabase elatriye.',
    ],
  },
];

export const ProgramSection = () => {
  const { data: seminarInfo } = useSeminarInfo();
  const { data: formationModules = [], isLoading: modulesLoading } = useFormationModules();

  const badgeText = seminarInfo?.program_badge_text || 'Pwogram konplè';
  const title = seminarInfo?.program_title || 'Fòmasyon Anliy Kontini — Aksè 24/7 ak Asistans Pèsonalize';
  const subtitle = seminarInfo?.program_subtitle || 'Aprann zouti IA ki ap transfòme devlopman web ak mobil modèn nan — nan pwòp rítm ou, nenpòt ki lè.';

  const modulesToShow = formationModules.length > 0
    ? formationModules.map((mod) => ({
        id: mod.id,
        emoji: mod.emoji || '🟣',
        num: mod.ordre,
        title: mod.titre,
        subtitle: mod.subtitle ?? '',
        points: mod.points || [],
      }))
    : FORMATION_MODULES;

  return (
    <section id="programme" className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* En-tête section */}
        <div className="text-center mb-14 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/10 rounded-full text-secondary text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
            {badgeText}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-2">
            {title.split(' ').map((word, i, arr) =>
              i === arr.length - 1 ? (
                <span key={i}><span className="text-gradient">{word}</span></span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
            {subtitle}
          </p>
        </div>

        {/* Grille des modules */}
        <div className="max-w-4xl mx-auto space-y-6">
          {modulesToShow.map((mod, index) => (
            <article
              key={mod.id}
              className="group relative bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Badge numéro + emoji */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl" aria-hidden>{mod.emoji}</span>
                <span className="inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl text-primary font-bold text-sm sm:text-base">
                  {mod.num}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent max-w-[80px]" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {mod.title}
              </h3>
              {mod.subtitle && String(mod.subtitle).trim() && (
                <p className="text-sm text-muted-foreground mb-4">
                  {mod.subtitle}
                </p>
              )}

              <ul className="space-y-2 mb-5">
                {mod.points.filter(Boolean).map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-muted-foreground">
                    <span className="text-primary mt-1.5 shrink-0">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4 pt-3 border-t border-border/50">
                <span className="inline-flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Egzèsis pratik enkli
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-secondary">
                  <Target className="w-4 h-4 shrink-0" />
                  Sipò pèsonalize
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* CTA discret en bas de section */}
        <div className="mt-14 text-center">
          <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Tout modil gen egzèsis pratik ak sipò pou ou pa janm bloke.
          </p>
        </div>
      </div>
    </section>
  );
};
