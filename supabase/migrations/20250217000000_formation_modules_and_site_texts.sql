-- ============================================
-- Formation modules (contenu programme) + Site texts (formulaire / libellés)
-- ============================================

-- 1. Table formation_modules (modils fòmasyon anliy)
CREATE TABLE IF NOT EXISTS public.formation_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordre INTEGER NOT NULL DEFAULT 0,
  emoji TEXT NOT NULL DEFAULT '🟣',
  titre TEXT NOT NULL,
  subtitle TEXT,
  points JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.formation_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read formation modules" ON public.formation_modules;
CREATE POLICY "Public can read formation modules"
  ON public.formation_modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage formation modules" ON public.formation_modules;
CREATE POLICY "Admins can manage formation modules"
  ON public.formation_modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_formation_modules_ordre ON public.formation_modules(ordre);

-- 2. Table site_texts (tèks sit / fòmilè)
CREATE TABLE IF NOT EXISTS public.site_texts (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_texts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site texts" ON public.site_texts;
CREATE POLICY "Public can read site texts"
  ON public.site_texts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site texts" ON public.site_texts;
CREATE POLICY "Admins can manage site texts"
  ON public.site_texts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Valeurs par défaut pour site_texts (fòmilè enskripsyon)
INSERT INTO public.site_texts (key, value) VALUES
  ('form_modal_title', 'Rezève kote m'),
  ('form_label_name', 'Non konplè *'),
  ('form_placeholder_name', 'Egz: Jean Baptiste'),
  ('form_label_email', 'Imèl *'),
  ('form_placeholder_email', 'imelw@egzamp.com'),
  ('form_label_phone', 'Telefòn *'),
  ('form_placeholder_phone', '+509 3712 3456'),
  ('form_label_level', 'Nivo eksperyans *'),
  ('form_placeholder_level', 'Chwazi...'),
  ('form_option_beginner', 'Kòmanse (pa gen eksperyans)'),
  ('form_option_intermediate', 'Mwayen (kèk nosyon)'),
  ('form_option_advanced', 'Avanse (eksperyans serye)'),
  ('form_label_motivation', 'Motivasyon (opsyonèl)'),
  ('form_placeholder_motivation', 'Pale nou de objektif w...'),
  ('form_label_payment', 'Opsyon peman *'),
  ('form_label_promo', 'Kòd promosyon'),
  ('form_placeholder_promo', 'KONEKTE25'),
  ('form_btn_apply', 'Aplike'),
  ('form_label_amount', 'Montan'),
  ('form_label_discount', 'Rediksyon'),
  ('form_label_total', 'Total pou peye'),
  ('form_btn_submit', 'Kontinye pou peye'),
  ('form_btn_loading', 'Ap trete...')
ON CONFLICT (key) DO NOTHING;

-- 4. Insérer les modils fòmasyon par défaut (si vide)
INSERT INTO public.formation_modules (ordre, emoji, titre, subtitle, points)
SELECT v.ordre, v.emoji, v.titre, v.subtitle, (v.points)::jsonb FROM (VALUES
  (1, '🟣', 'Baz yo ak Zouti IA Gratis', 'Fondman Entèlijans Atifisyèl pou Devlopman', '["Kisa IA jenèratif ye ?","Kisa yon prompt ye ?","Estrateji pou kreye bon prompt","","Dekouvèt Zouti IA Gratis: ChatGPT, Copilot, Google AI Studio","Platfòm No-Code / Low-Code: Antigravity, Emergent.sh"]'),
  (2, '🟣', 'Prompt Engineering', 'Teknik Avanse pou Kreye Prompt Efikas', '["Kijan pou jwenn pi bon rezilta ak IA","Evite erè kouran nan prompt","Pratik ak egzanp reyèl nan devlopman"]'),
  (3, '🟣', 'Konfigirasyon Platfòm yo (Kreye Kont ou)', 'Ou ap aprann kijan pou kreye kont epi konfigire chak platfòm etap pa etap', '["Antigravity — Kreye kont + premye pwojè","Emergent.sh — Kreye kont + eksplòrasyon","Google AI Studio — Kreye kont + konfigirasyon","GitHub — Kreye kont + premye repo","Supabase — Kreye kont + baz done","Cursor IDE — Enstale + konfigire","Vercel — Kreye kont + deplwaman","Porkbun — Kreye kont + non domèn","Render — Kreye kont + sèvè"]'),
  (4, '🟣', 'GitHub Copilot ak Cursor IDE', 'Maîtrise Zouti IA pou Edisyon Kòd', '["Travay ak Cursor IDE asiste pa IA","Rezoud pwoblèm kòd nan tan reyèl"]'),
  (5, '🟣', 'Wòkflow Entegrasyon Konplè', 'De Jenèrasyon rive Deplwaman', '["Supabase : baz done ak backend","GitHub : jesyon vèsyon ak kolaborasyon","Cursor IDE : edite ak amelyore kòd ou","Eksporte pwojè depi Antigravity oswa Emergent.sh","Transfere pwojè nan GitHub, enpòte nan Cursor IDE","Bon pratik entegrasyon kontini (CI/CD)"]'),
  (6, '🟣', 'Deplwaman ak Otomatizasyon', 'Pibliye Pwojè ou sou Entènèt', '["Deplwaman otomatik ak Vercel","Jesyon sèvè ak Render","Konfigirasyon non domèn ak Porkbun","Optimizasyon final ak IA"]'),
  (7, '🔵', 'Pwojè Pratik 1 — App Web (Live)', 'Devlopman konplè yon aplikasyon web reyèl — SaaS pou klinik dantè kote responsab ka kreye ajan AI pou resevwa apèl', '["Definisyon objèktif ak fonksyonalite","Devlopman live ak asistans IA (Antigravity / Emergent.sh + Cursor IDE)","Entegrasyon Supabase pou baz done","Deplwaman sou Vercel, konfigirasyon domèn ak Porkbun","Tès ak kòreksyon an tan reyèl"]'),
  (8, '🔵', 'Pwojè Pratik 2 — App Mobil (Live)', 'Devlopman konplè yon aplikasyon mobil reyèl — Sistèm pou moun kòmande taxi an liy pou Ayiti', '["Konsepsyon entèfas mobil ak IA","Jenèrasyon kòd ak Cursor IDE + Google AI Studio","Tès sou aparèy reyèl","Entegrasyon baz done Supabase","Prepare app la pou piblikasyon"]'),
  (9, '🎁', 'Pibliye App ou sou Play Store', 'Kijan pou mete yon app sou Google Play Store', '["Kreye kont Google Play Console","Prepare fichye APK / AAB","Konfigirasyon paj app la (deskripsyon, logo, screenshot)","Soumèt app la pou revizyon","Swiv pwosesis apwobasyon an","","Gid pou konekte pwojè ou ak GitHub, Supabase elatriye."]')
) AS v(ordre, emoji, titre, subtitle, points)
WHERE NOT EXISTS (SELECT 1 FROM public.formation_modules LIMIT 1);
