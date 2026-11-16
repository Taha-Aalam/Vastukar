// DDC-CWICR-OE: DataDrivenConstruction · OpenConstructionERP
// Copyright (c) 2026 Artem Boiko / DataDrivenConstruction
/**
 * Test-only aggregator. Re-exports every per-locale resource as a single
 * ``fallbackResources`` object so existing tests (notably
 * ``boqResourceTypes.test.ts``) can iterate the locales without duplicating
 * the imports.
 *
 * This file reads ``./locales/*``; it does not generate them. A locale added
 * under that directory has to be added here by hand or it is invisible to
 * every test that iterates this object, which is how Kyrgyz went unchecked.
 * Greek and Ukrainian went the same way: both were in ``SUPPORTED_LANGUAGES``
 * and shipping, and neither was listed here until this line was written.
 *
 * The list tracks the full locale files on disk — every ``<code>.ts`` under
 * ``./locales/`` except the ``en-GB`` and ``en-US`` overrides-only overlays,
 * which are left out because a deliberate 9 key and 1584 key file is not
 * comparable against a 35865 key one. The aggregator test
 * (``everyOfferedLanguageIsInTheFallbackAggregator.test.ts``) enforces exactly
 * that: it reads the directory and fails on any file this object misses, in
 * either direction.
 *
 * It does NOT track ``SUPPORTED_LANGUAGES`` any more. The India rollout made
 * the offered set a small allowlist (``ENABLED_LOCALES`` in ``./i18n.ts``)
 * while every file stays in the tree, and the ``mn`` precedent — aggregated
 * although it does not ship, so the Mongolian file keeps whatever test
 * coverage it has while it waits for a native-speaker pass — is now the rule
 * for all 39 hidden locales: a bundle nobody can select still syncs from
 * upstream and still gets the coverage of every test that iterates this
 * object, so it does not rot while it waits. Enabling one is a code in the
 * allowlist; this file never changes for it.
 *
 * IMPORTANT: this file is intentionally NOT imported from runtime code.
 * The application boots from ``./locales/en`` and lazy-loads other
 * locales on demand (see ``./i18n.ts``). Static imports here force the
 * test bundle to include every locale; tree-shaking removes the entire
 * file from the production bundle because nothing in the entrypoint
 * chain imports it.
 */
import en from './locales/en';
import de from './locales/de';
import fr from './locales/fr';
import es from './locales/es';
import esMX from './locales/es-MX';
import esCL from './locales/es-CL';
import esCO from './locales/es-CO';
import pt from './locales/pt';
import ptBR from './locales/pt-BR';
import ru from './locales/ru';
import zh from './locales/zh';
import ar from './locales/ar';
import hi from './locales/hi';
import tr from './locales/tr';
import it from './locales/it';
import nl from './locales/nl';
import pl from './locales/pl';
import cs from './locales/cs';
import ja from './locales/ja';
import ko from './locales/ko';
import sv from './locales/sv';
import no from './locales/no';
import da from './locales/da';
import fi from './locales/fi';
import bg from './locales/bg';
import hr from './locales/hr';
import hu from './locales/hu';
import id from './locales/id';
import ro from './locales/ro';
import th from './locales/th';
import vi from './locales/vi';
import mn from './locales/mn';
import ky from './locales/ky';
import et from './locales/et';
import bn from './locales/bn';
import kk from './locales/kk';
import fil from './locales/fil';
import ur from './locales/ur';
import fa from './locales/fa';
import he from './locales/he';
import el from './locales/el';
import uk from './locales/uk';
import uz from './locales/uz';
import ta from './locales/ta';
import te from './locales/te';
import mr from './locales/mr';
import gu from './locales/gu';
import kn from './locales/kn';
import ml from './locales/ml';
import pa from './locales/pa';

export const fallbackResources = {
  en,
  de,
  fr,
  es,
  'es-MX': esMX,
  'es-CL': esCL,
  'es-CO': esCO,
  pt,
  'pt-BR': ptBR,
  ru,
  zh,
  ar,
  hi,
  tr,
  it,
  nl,
  pl,
  cs,
  ja,
  ko,
  sv,
  no,
  da,
  fi,
  bg,
  hr,
  hu,
  id,
  ro,
  th,
  vi,
  mn,
  ky,
  et,
  bn,
  kk,
  fil,
  ur,
  fa,
  he,
  el,
  uk,
  uz,
  ta,
  te,
  mr,
  gu,
  kn,
  ml,
  pa,
};
