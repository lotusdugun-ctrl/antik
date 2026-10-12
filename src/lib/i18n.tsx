import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { de as deStrings } from "@/lib/locales/de";
import { ru as ruStrings } from "@/lib/locales/ru";

export type Lang = "tr" | "en" | "de" | "ru";
/**
 * Turkish and English are complete; German and Russian are filled in where
 * they have been translated and fall back to English everywhere else — a
 * German visitor reading an English paragraph is better served than one
 * reading nothing.
 */
export type Localized = { tr: string; en: string; de?: string; ru?: string };

export const LANGS: Lang[] = ["tr", "en", "de", "ru"];

/**
 * German and Russian for the content live in translation memories keyed by
 * the English text, registered by the module that owns the content (so the
 * site data's translations ship with the site data, not with every page).
 * Keying by English means a corrected English sentence quietly falls back
 * to English until it is translated again, rather than showing a translation
 * of what it used to say.
 */
type Memory = Record<string, [string, string]>;
const memories: Memory[] = [];
export function registerTranslations(memory: Memory) {
  if (!memories.includes(memory)) memories.push(memory);
}
function remembered(en: string, lang: "de" | "ru"): string | undefined {
  const slot = lang === "de" ? 0 : 1;
  for (const memory of memories) {
    const hit = memory[en];
    if (hit) return hit[slot];
  }
  return undefined;
}

/** Read one language out of a value, falling back to English. */
export function pick(value: Localized, lang: Lang): string {
  if (lang === "tr" || lang === "en") return value[lang];
  return value[lang] ?? remembered(value.en, lang) ?? value.en;
}

/** Whether a value is really written in a language, rather than falling back. */
export function hasLang(value: Localized, lang: Lang): boolean {
  if (lang === "tr" || lang === "en") return true;
  return Boolean(value[lang] ?? remembered(value.en, lang));
}

/**
 * Turkish is the default and carries no search param, so every Turkish URL
 * stays exactly what it was. English lives at `?lang=en` — a real, crawlable
 * address, which is the whole point: the language used to be a client-side
 * toggle, so the English half of the site was rendered only after hydration
 * and had no URL for a search engine or a shared link to point at.
 *
 * Typed as the literal rather than `Lang` so that `next === DEFAULT_LANG`
 * narrows the other branch to `"en"` — the search schema only ever holds that.
 */
export const DEFAULT_LANG = "tr" satisfies Lang;

export function parseLang(value: unknown): Lang {
  return value === "en" || value === "de" || value === "ru" ? value : "tr";
}

const dict = {
  appName: { tr: "Antik Türkiye", en: "Ancient Türkiye" },
  tagline: {
    tr: "Türkiye'nin antik kentlerini keşfet, öğren, kaydet.",
    en: "Discover, learn and log the ancient cities of Türkiye.",
  },
  nav_home: { tr: "Ana Sayfa", en: "Home" },
  /**
   * The four browse tabs. `nav_explore` is the unscoped one and is deliberately
   * the vaguest word of the four: everything else on the bar names a kind of
   * place, so the tab that names none has to read as "no filter at all".
   */
  nav_explore: { tr: "Tümü", en: "All" },
  nav_ancient: { tr: "Antik Kentler", en: "Ancient Cities" },
  nav_map: { tr: "Harita", en: "Map" },
  nav_regions: { tr: "Bölgeler", en: "Regions" },
  nav_games: { tr: "Oyunlar", en: "Games" },
  nav_profile: { tr: "Profil", en: "Profile" },
  search_placeholder: {
    tr: "Antik kent, il veya tarihi kişi ara…",
    en: "Search a city, province or historical figure…",
  },
  /**
   * The home page's search button had been labelled with `nav_explore`, which
   * was fine while that key read "Heritage Sites" and absurd once it became
   * the name of the unscoped tab: the button said "All".
   */
  search_action: { tr: "Ara", en: "Search" },
  recent: { tr: "Son ziyaret edilenler", en: "Recently viewed" },
  nearby: { tr: "Yakındaki antik kentler", en: "Ancient cities near you" },
  nearby_hint: {
    tr: "Konumunu paylaş, sana en yakın kalıntıları sıralayalım.",
    en: "Share your location to see the closest ruins.",
  },
  nearby_enable: { tr: "Konumu kullan", en: "Use my location" },
  nearby_denied: {
    tr: "Konum alınamadı. Tarayıcı izinlerini kontrol et.",
    en: "Location unavailable. Check your browser permissions.",
  },
  popular: { tr: "Popüler antik kentler", en: "Popular ancient cities" },
  quick_regions: { tr: "Bölgelere hızlı erişim", en: "Jump to a region" },
  view_all: { tr: "Tümünü gör", en: "View all" },
  visited: { tr: "Ziyaret ettim", en: "Visited" },
  visited_done: { tr: "Ziyaret edildi", en: "Visited" },
  favorite: { tr: "Favorilere ekle", en: "Add to favorites" },
  favorited: { tr: "Favorilerde", en: "In favorites" },
  detail_page: { tr: "Detay sayfası", en: "Details" },
  directions: { tr: "Yol tarifi", en: "Directions" },
  unesco: { tr: "UNESCO", en: "UNESCO" },
  unesco_listed: { tr: "UNESCO Dünya Mirası", en: "UNESCO World Heritage" },
  unesco_tentative: { tr: "UNESCO Geçici Liste", en: "UNESCO Tentative List" },
  free: { tr: "Ücretsiz", en: "Free" },
  paid: { tr: "Ücretli", en: "Paid" },
  entry_fee: { tr: "Giriş ücreti", en: "Entry fee" },
  hours: { tr: "Ziyaret saatleri", en: "Opening hours" },
  location: { tr: "Konum", en: "Location" },
  history: { tr: "Tarihçe", en: "History" },
  era: { tr: "Kurulduğu dönem", en: "Founded" },
  civilizations: { tr: "Uygarlıklar", en: "Civilizations" },
  structures: { tr: "Önemli yapılar", en: "Key structures" },
  gallery: { tr: "Fotoğraf galerisi", en: "Gallery" },
  did_you_know: { tr: "Bunu biliyor muydunuz?", en: "Did you know?" },
  figures: { tr: "Tarihi kişiler", en: "Historical figures" },
  filters: { tr: "Filtreler", en: "Filters" },
  region: { tr: "Bölge", en: "Region" },
  province: { tr: "İl", en: "Province" },
  civilization: { tr: "Uygarlık", en: "Civilization" },
  all: { tr: "Tümü", en: "All" },
  clear_filters: { tr: "Filtreleri temizle", en: "Clear filters" },
  results: { tr: "sonuç", en: "results" },
  no_results: { tr: "Sonuç bulunamadı.", en: "No results found." },
  list_view: { tr: "Liste", en: "List" },
  map_view: { tr: "Harita", en: "Map" },
  progress: { tr: "İlerleme", en: "Progress" },
  completion: { tr: "tamamlandı", en: "complete" },
  /**
   * Both are counted against every site in the data, not against the ancient
   * cities alone, so labelling them "antik kent" was a false claim about what
   * the number meant — a visitor who had seen four museums read it as four
   * cities.
   */
  total_visited: { tr: "Gezilen yerler", en: "Places visited" },
  remaining: { tr: "Kalan yerler", en: "Places remaining" },
  stats: { tr: "İstatistikler", en: "Statistics" },
  badges: { tr: "Başarı rozetleri", en: "Achievement badges" },
  favorites: { tr: "Favoriler", en: "Favorites" },
  level: { tr: "Seviye", en: "Level" },
  xp: { tr: "XP", en: "XP" },
  xp_to_next: { tr: "sonraki seviyeye", en: "to next level" },
  games_title: { tr: "Mini oyunlar", en: "Mini games" },
  games_sub: {
    tr: "Oynayarak öğren, XP kazan, seviye atla.",
    en: "Learn by playing, earn XP, level up.",
  },
  play: { tr: "Oyna", en: "Play" },
  correct: { tr: "Doğru!", en: "Correct!" },
  wrong: { tr: "Yanlış", en: "Wrong" },
  next_question: { tr: "Sonraki soru", en: "Next question" },
  score: { tr: "Puan", en: "Score" },
  restart: { tr: "Yeniden başla", en: "Play again" },
  quests: { tr: "Günlük görevler", en: "Daily quests" },
  back: { tr: "Geri", en: "Back" },
  theme_light: { tr: "Açık tema", en: "Light theme" },
  theme_dark: { tr: "Koyu tema", en: "Dark theme" },
  regions_title: { tr: "Bölgeler", en: "Regions" },
  region_sub: {
    tr: "Türkiye'nin yedi bölgesindeki kalıntıları keşfet ve ilerlemeni izle.",
    en: "Explore ruins across Türkiye's seven regions and track your progress.",
  },
  cities: { tr: "antik kent", en: "ancient cities" },
  /**
   * The neutral word for a total. The list is no longer only ancient cities —
   * it holds museums, mosques, caves and Ottoman towns — so a count labelled
   * "antik kent" would now be a false claim about what is in it.
   */
  heritage_sites: { tr: "tarihi yer", en: "heritage sites" },
  type: { tr: "Tür", en: "Type" },
  regions: { tr: "bölge", en: "regions" },
  km_away: { tr: "km uzakta", en: "km away" },
  profile_sub: {
    tr: "İlerlemen bu cihazda saklanır.",
    en: "Your progress is stored on this device.",
  },
  reset_progress: { tr: "İlerlemeyi sıfırla", en: "Reset progress" },
  empty_visits: {
    tr: "Henüz ziyaret kaydın yok. Bir antik kent aç ve 'Ziyaret Ettim' de.",
    en: "No visits logged yet. Open a city and tap 'Visited'.",
  },
  empty_favorites: { tr: "Favori listen boş.", en: "Your favorites list is empty." },
  game_photo: { tr: "Fotoğrafı tahmin et", en: "Guess the photo" },
  game_photo_d: {
    tr: "Manzaraya bakarak antik kenti bul.",
    en: "Identify the ancient city from the scene.",
  },
  game_who: { tr: "Kim bu?", en: "Who is this?" },
  game_who_d: {
    tr: "Tarihi kişiyi doğru kente eşle.",
    en: "Match the historical figure to their city.",
  },
  game_tf: { tr: "Doğru / Yanlış", en: "True / False" },
  game_tf_d: { tr: "Bilgi kartlarını sına.", en: "Test the facts." },
  game_map: { tr: "Haritada bul", en: "Find it on the map" },
  game_map_d: { tr: "Hangi ilde olduğunu bil.", en: "Guess the province." },
  game_story: { tr: "Hikâyelerin tarihi", en: "History of the stories" },
  game_story_d: {
    tr: "Antik bir günde hikâyelerinin arkasındaki gerçek tarih üzerine sorular.",
    en: "Questions on the real history behind the A day in antiquity stories.",
  },
  game_structure: { tr: "Yapıyı tanı", en: "Name the structure" },
  game_structure_d: {
    tr: "Yapıyı hangi kentte olduğunu bul.",
    en: "Find which city the structure belongs to.",
  },
  question: { tr: "Soru", en: "Question" },
  finish: { tr: "Bitir", en: "Finish" },
  earned_xp: { tr: "XP kazandın", en: "XP earned" },
  notif_title: { tr: "Bildirimler", en: "Notifications" },
  notif_empty: { tr: "Yeni bildirim yok.", en: "No new notifications." },
  nav_route: { tr: "Rota", en: "Route" },
  route_title: { tr: "Rota Oluşturucu", en: "Route Builder" },
  route_sub: {
    tr: "Bir başlangıç kenti seç ve gün sayısını belirle; sana en yakın kentlerden akıllı bir güzergâh önerelim.",
    en: "Pick a starting city and a trip length; we'll suggest an itinerary of the nearest ancient sites.",
  },
  route_start: { tr: "Başlangıç kenti", en: "Starting city" },
  route_days: { tr: "Gezi süresi", en: "Trip length" },
  route_build: { tr: "Rotayı oluştur", en: "Build route" },
  route_day: { tr: "Gün", en: "Day" },
  route_total: { tr: "Toplam mesafe", en: "Total distance" },
  route_km: { tr: "km", en: "km" },
  route_to_next: { tr: "sonraki durağa", en: "to next stop" },
  route_from_start: { tr: "Başlangıç", en: "Start" },
  route_auto_note: {
    tr: "Rota, en yakın kent algoritmasıyla üretilir; mesafeler ve süreler gerçek araç rotasına göre hesaplanır.",
    en: "The route is auto-generated using a nearest-city algorithm; distances and times use real driving routes.",
  },
  route_crow_note: {
    tr: "Yol servisine ulaşılamadı: mesafeler kuş uçuşu, süreler 60 km/s üzerinden kaba tahmindir. Gerçek sürüş bundan uzun sürer.",
    en: "The routing service was unreachable: distances are straight-line and times a rough 60 km/h estimate. Real driving takes longer.",
  },
  route_est_time: { tr: "Tahmini araç süresi", en: "Estimated driving time" },
  route_rough_time: { tr: "Kaba süre tahmini", en: "Rough time estimate" },
  route_crow_distance: { tr: "Kuş uçuşu mesafe", en: "Straight-line distance" },
  route_min: { tr: "dk", en: "min" },
  route_driving: { tr: "Araç", en: "Driving" },
  route_loading: { tr: "En yakın kentler hesaplanıyor…", en: "Finding the nearest cities…" },
  route_reset: { tr: "Rota", en: "Route" },
  visit_date: { tr: "Ziyaret tarihi", en: "Visit date" },
  visit_note: { tr: "Not", en: "Note" },
  visit_note_placeholder: {
    tr: "Gezine not ekle…",
    en: "Add a note about your visit…",
  },
  visit_photo: { tr: "Fotoğraf ekle", en: "Add photo" },
  visit_photo_change: { tr: "Fotoğrafı değiştir", en: "Change photo" },
  visit_photo_remove: { tr: "Fotoğrafı kaldır", en: "Remove photo" },
  visit_log: { tr: "Ziyaret Günlüğüm", en: "My Visit Log" },
  visit_log_empty: {
    tr: "Ziyaret günlüğün henüz boş. Bir kenti ziyaret ettiğinde tarih ve not ekleyebilirsin.",
    en: "Your visit log is empty. Mark a city as visited and add a date and note.",
  },
  visit_saved: { tr: "Kaydedildi", en: "Saved" },
  visit_save: { tr: "Kaydet", en: "Save" },
  visit_delete: { tr: "Sil", en: "Delete" },
  visit_no_date: { tr: "Tarih yok", en: "No date" },
  structure_details: { tr: "Yapı hakkında", en: "About this structure" },
  structure_close: { tr: "Kapat", en: "Close" },
  structure_photo_of: { tr: "Fotoğraf", en: "Photo" },
  /**
   * The lightbox. Every photo on the page is cropped to fit its slot, so the
   * label on the affordance has to promise the part that is missing — the
   * frame, whole — rather than merely say "büyüt".
   */
  photo_expand: { tr: "Fotoğrafın tamamını gör", en: "View the whole photo" },
  photo_close: { tr: "Fotoğrafı kapat", en: "Close photo" },
  photo_prev: { tr: "Önceki fotoğraf", en: "Previous photo" },
  photo_next: { tr: "Sonraki fotoğraf", en: "Next photo" },
  /**
   * Shown when a place has no photograph of its own and the page is falling
   * back to the regional artwork. That stand-in is a real photograph of
   * somewhere else, so leaving it unlabelled reads as a picture of this place.
   */
  photo_placeholder: {
    tr: "Bu görsel temsilidir — buranın fotoğrafı henüz yok, bölgeyi anlatan bir manzara gösteriliyor.",
    en: "This image is a stand-in — there is no photograph of this place yet, so a view of the region is shown instead.",
  },
  structure_general_view: {
    tr: "Bu fotoğraf kentin genel görünümüdür; yapının kendisine ait bir görsel henüz yok.",
    en: "This is a general view of the city — there is no photograph of the structure itself yet.",
  },
  structure_generic: {
    tr: "{site} kentinin önemli yapılarından biri. Kentin tarihçesi ve diğer kalıntıları için ayrıntılar bölümünü inceleyin.",
    en: "One of the key structures of {site}. Explore the history section to learn more about the city.",
  },
  pwa_offline_ready: {
    tr: "Uygulama çevrimdışı kullanım için hazır. Ana ekranına ekleyebilirsin.",
    en: "The app is ready for offline use. You can add it to your home screen.",
  },

  // ——— Visitor information ———
  // Deliberately worded as a general rule rather than a fact about this site:
  // the app does not hold verified per-site opening times.
  visiting: { tr: "Ziyaret bilgileri", en: "Visitor information" },
  hours_rule: {
    tr: "Bakanlığın genel ören yeri saatleri",
    en: "The ministry's standard site hours",
  },
  hours_rule_note: {
    tr: "Bu bir genel kuraldır, bu ören yerine özel doğrulanmış saat değildir. Kazı, tören ve mevsim değişikliklerinde farklılık gösterebilir.",
    en: "This is the general rule, not a verified opening time for this particular site. Excavations, ceremonies and seasonal changes can all alter it.",
  },
  fee_indicative: {
    tr: "gösterge",
    en: "indicative",
  },
  fee_unknown: {
    tr: "Ücret bilgisi elimizde yok — resmî tarifeden kontrol edin.",
    en: "We do not have the fee for this site — check the official tariff.",
  },
  fee_indicative_note: {
    tr: "Ücretler her yıl güncellenir. Yola çıkmadan önce resmî tarifeden doğrulayın.",
    en: "Fees are revised annually. Check the official tariff before you set out.",
  },
  museum_card: {
    tr: "Müzekart, Bakanlığa bağlı ören yerlerinde geçerlidir.",
    en: "The Müzekart pass is valid at ministry-run sites.",
  },
  official_check: { tr: "Resmî bilgi: muze.gov.tr", en: "Official information: muze.gov.tr" },

  // ——— Facts and credits ———
  facts: { tr: "Çarpıcı bilgiler", en: "Striking facts" },
  credits: { tr: "Görsel künyeleri", en: "Image credits" },
  credits_sub: {
    tr: "Bu sayfadaki fotoğraflar Wikimedia Commons'tan, sahiplerinin belirlediği lisanslarla kullanılıyor.",
    en: "The photographs on this page come from Wikimedia Commons, used under the licences their authors chose.",
  },
  credits_page_sub: {
    tr: "Sitedeki bütün fotoğraflar Wikimedia Commons'tan alınmıştır. Her birinin fotoğrafçısı, lisansı ve kaynak sayfası aşağıdadır.",
    en: "Every photograph on this site comes from Wikimedia Commons. Each one's photographer, licence and source page is listed below.",
  },
  credits_source: { tr: "Kaynak", en: "Source" },
  credits_count: { tr: "fotoğraf", en: "photographs" },
  nav_credits: { tr: "Görsel künyeleri", en: "Image credits" },

  // ——— Collections ———
  nav_museums: { tr: "Müzeler", en: "Museums" },
  museums_sub: {
    tr: "Kazılardan çıkanların bugün durduğu yerler. Bir ören yerini gezdikten sonra sıra buraya gelir — çoğu zaman aradığın heykel ya da mozaik burada.",
    en: "Where what came out of the ground is kept today. The museum is the second half of a visit to a ruin: the statue or the mosaic you were looking for is usually here.",
  },
  nav_places: { tr: "Tarihi Yerler", en: "Historic Places" },
  places_sub: {
    tr: "Kazı alanı değil, hâlâ ayakta duran miras: camiler, kaleler, köprüler, kervansaraylar, kaya kiliseleri ve Osmanlı kent dokuları. İçine girilen, üzerinden geçilen, çoğu hâlâ kullanılan yerler.",
    en: "Not excavations but heritage still standing: mosques, castles, bridges, caravanserais, rock churches and Ottoman quarters — places you walk into, cross, or that are still in daily use.",
  },
  ancient_sub: {
    tr: "Toprağın altından çıkarılanlar: İyonya'nın mermer kentleri, Likya kaya mezarları, Hitit başkentleri ve Neolitik höyükler. Üzerinde yürüdüğün, içinde oturulmayan yerler.",
    en: "What was dug back out of the ground: the marble cities of Ionia, the rock tombs of Lycia, the Hittite capitals and the Neolithic mounds — places you walk over, not into.",
  },
  explore_sub: {
    tr: "Bütün miras tek listede. Bölge, il, uygarlık ve türe göre filtrele; listede ya da harita üzerinde gez.",
    en: "The whole of the heritage in one list. Filter by region, province, civilisation and type; browse it as a list or on the map.",
  },
  nav_collections: { tr: "Koleksiyonlar", en: "Collections" },
  collections_title: { tr: "Koleksiyonlar", en: "Collections" },
  collections_sub: {
    tr: "Bir temayı takip eden derlemeler: bir hafta sonuna sığan rotalar, ücretsiz ören yerleri, kayıp harikalar.",
    en: "Curated sets that follow one theme: routes that fit a weekend, sites that cost nothing, lost wonders.",
  },
  collection_sites: { tr: "tarihi yer", en: "sites" },
  collection_visited: { tr: "gezildi", en: "visited" },
  collection_back: { tr: "Tüm koleksiyonlar", en: "All collections" },

  // ——— Backup ———
  backup_title: { tr: "Yedekle ve taşı", en: "Back up and transfer" },
  backup_sub: {
    tr: "İlerlemen yalnızca bu tarayıcıda saklanıyor. Telefon değiştirmeden veya geçmişi temizlemeden önce yedek al.",
    en: "Your progress lives only in this browser. Take a backup before you change phones or clear your history.",
  },
  backup_export: { tr: "Yedek indir", en: "Download backup" },
  backup_import: { tr: "Yedekten yükle", en: "Restore backup" },
  backup_imported: { tr: "İlerleme geri yüklendi.", en: "Progress restored." },
  backup_invalid: {
    tr: "Bu dosya okunamadı. Buradan indirilmiş bir yedek dosyası seçtiğinden emin ol.",
    en: "That file could not be read. Make sure it is a backup downloaded from here.",
  },

  // ——— Offline ———
  offline_title: { tr: "Çevrimdışı kullanım", en: "Offline use" },
  offline_sub: {
    tr: "Ören yerlerinde çoğu zaman şebeke yoktur. Favorilerindeki kentleri fotoğraflarıyla birlikte önceden indir.",
    en: "There is usually no signal at a ruin. Download your favourite cities, photographs and all, before you go.",
  },
  offline_download: { tr: "Favorilerimi indir", en: "Download my favourites" },
  offline_working: { tr: "İndiriliyor…", en: "Downloading…" },
  offline_ready: { tr: "Çevrimdışı hazır", en: "Ready offline" },
  offline_failed: { tr: "İndirme tamamlanamadı.", en: "The download did not finish." },
  offline_needs_favorites: {
    tr: "Önce birkaç kenti favorilerine ekle.",
    en: "Add a few cities to your favourites first.",
  },

  // ——— Page titles and descriptions ———
  // These are read outside React, by each route's `head()`, so that the tab
  // title and the meta description match the language the page renders in.
  seo_home_title: {
    tr: "Antik Türkiye — Türkiye'nin Antik Kent Rehberi",
    en: "Ancient Türkiye — A Guide to the Ancient Cities of Türkiye",
  },
  seo_home_desc: {
    tr: "Türkiye'deki antik kentleri harita üzerinde keşfet, tarihçelerini oku, ziyaretlerini kaydet ve mini oyunlarla öğren.",
    en: "Explore the ancient cities of Türkiye on a map, read their histories, log your visits and learn through mini games.",
  },
  seo_explore_title: {
    tr: "Tarihi Yerler — Antik Kentler, Anıtlar ve Müzeler | Antik Türkiye",
    en: "Heritage Sites — Ancient Cities, Monuments and Museums | Ancient Türkiye",
  },
  seo_explore_desc: {
    tr: "Türkiye'deki antik kentleri, anıtları, kaya yerleşimlerini, camileri ve müzeleri bölge, il, uygarlık, tür ve UNESCO durumuna göre filtrele; liste veya harita görünümünde keşfet.",
    en: "Filter the ancient cities, monuments, rock settlements, mosques and museums of Türkiye by region, province, civilisation, type and UNESCO status; browse them as a list or on the map.",
  },
  seo_map_title: {
    tr: "Antik Kent Haritası — Türkiye | Antik Türkiye",
    en: "Map of Ancient Cities — Türkiye | Ancient Türkiye",
  },
  seo_map_desc: {
    tr: "Türkiye'deki tüm antik kentleri interaktif harita üzerinde gör; iğneye tıklayıp bilgi kartını aç ve ziyaretini kaydet.",
    en: "See every ancient city in Türkiye on an interactive map; open a pin for its card and log your visit.",
  },
  seo_regions_title: {
    tr: "Bölgeler — Türkiye Antik Kentleri | Antik Türkiye",
    en: "Regions — Ancient Cities of Türkiye | Ancient Türkiye",
  },
  seo_regions_desc: {
    tr: "Ege'den Doğu Anadolu'ya yedi bölgedeki antik kentleri keşfet, bölge bazlı ilerlemeni ve tamamlanma yüzdeni gör.",
    en: "Explore the ancient cities of all seven regions, from the Aegean to Eastern Anatolia, and track your progress in each.",
  },
  seo_route_title: {
    tr: "Rota Oluşturucu — Antik Kent Güzergâhı | Antik Türkiye",
    en: "Route Builder — Plan an Ancient City Trip | Ancient Türkiye",
  },
  seo_route_desc: {
    tr: "Başlangıç kentini seç, gezi süreni belirle; gerçek araç mesafeleriyle en yakın antik kentlerden güzergâhını oluştur.",
    en: "Pick a starting city and a trip length, and build an itinerary of the nearest ancient cities using real driving distances.",
  },
  seo_games_title: {
    tr: "Mini Oyunlar — Antik Kentleri Öğren | Antik Türkiye",
    en: "Mini Games — Learn the Ancient Cities | Ancient Türkiye",
  },
  seo_games_desc: {
    tr: "Fotoğrafı tahmin et, kim bu, doğru/yanlış, haritada bul ve yapıyı tanı oyunlarıyla antik kentleri öğren, XP kazan.",
    en: "Guess the photo, name the figure, true or false, find it on the map and name the structure — learn the ancient cities and earn XP.",
  },
  seo_profile_title: {
    tr: "Profilim — İlerleme, Rozetler ve Favoriler | Antik Türkiye",
    en: "My Profile — Progress, Badges and Favourites | Ancient Türkiye",
  },
  seo_profile_desc: {
    tr: "Gezdiğin antik kentler, favorilerin, bölge bazlı ilerlemen, XP seviyen ve kazandığın başarı rozetleri.",
    en: "The ancient cities you have visited, your favourites, regional progress, XP level and the badges you have earned.",
  },
  /**
   * Composed with the place's own type rather than hardcoding "Antik Kenti",
   * which titled the Titus Tunnel and the Mevlâna Museum as ancient cities.
   */
  seo_place_suffix: {
    tr: "Tarihçe ve ziyaret bilgileri",
    en: "History and visitor information",
  },
  seo_region_suffix: {
    tr: "Bölgesi Antik Kentleri",
    en: "Region — Ancient Cities",
  },
  seo_not_found: { tr: "Sayfa bulunamadı", en: "Page not found" },
  seo_credits_title: {
    tr: "Görsel Künyeleri — Fotoğraf ve Lisanslar | Antik Türkiye",
    en: "Image Credits — Photographs and Licences | Ancient Türkiye",
  },
  seo_credits_desc: {
    tr: "Sitede kullanılan bütün Wikimedia Commons fotoğraflarının fotoğrafçıları, lisansları ve kaynak sayfaları.",
    en: "Photographers, licences and source pages for every Wikimedia Commons photograph used on this site.",
  },
  seo_museums_title: {
    tr: "Müzeler — Türkiye'nin Arkeoloji ve Tarih Müzeleri | Antik Türkiye",
    en: "Museums — Archaeology and History Museums of Türkiye | Ancient Türkiye",
  },
  seo_museums_desc: {
    tr: "Anadolu Medeniyetleri, Zeugma Mozaik, İstanbul Arkeoloji ve daha fazlası: kazılardan çıkan eserlerin sergilendiği müzeleri harita üzerinde keşfet.",
    en: "Anatolian Civilizations, the Zeugma Mosaic Museum, Istanbul Archaeological and more: find the museums holding what the excavations produced, on a map.",
  },
  seo_ancient_title: {
    tr: "Antik Kentler — Türkiye'nin Ören Yerleri ve Höyükleri | Antik Türkiye",
    en: "Ancient Cities — Archaeological Sites and Mounds of Türkiye | Ancient Türkiye",
  },
  seo_ancient_desc: {
    tr: "Efes'ten Göbeklitepe'ye, Hattuşa'dan Aphrodisias'a: Türkiye'nin antik kentlerini, kutsal alanlarını ve höyüklerini bölge, uygarlık ve UNESCO durumuna göre filtrele.",
    en: "From Ephesus to Göbeklitepe, Hattusa to Aphrodisias: filter the ancient cities, sanctuaries and mounds of Türkiye by region, civilisation and UNESCO status.",
  },
  seo_places_title: {
    tr: "Tarihi Yerler — Camiler, Kaleler, Köprüler ve Hanlar | Antik Türkiye",
    en: "Historic Places — Mosques, Castles, Bridges and Caravanserais | Ancient Türkiye",
  },
  seo_places_desc: {
    tr: "Sultanahmet'ten Anıtkabir'e, Malabadi Köprüsü'nden Sultanhanı'na: Türkiye'nin hâlâ ayakta duran tarihi yapılarını harita üzerinde keşfet.",
    en: "From the Blue Mosque to Anıtkabir, the Malabadi Bridge to the Sultan Han: explore the historic buildings of Türkiye that are still standing, on a map.",
  },
  seo_collections_title: {
    tr: "Koleksiyonlar — Temalı Antik Kent Derlemeleri | Antik Türkiye",
    en: "Collections — Themed Sets of Ancient Cities | Ancient Türkiye",
  },
  seo_collections_desc: {
    tr: "Bir hafta sonuna sığan Likya rotası, ücretsiz ören yerleri, UNESCO listesi ve daha fazlası: temaya göre derlenmiş antik kent listeleri.",
    en: "A Lycian route that fits a weekend, sites that cost nothing, the UNESCO list and more: ancient cities gathered by theme.",
  },
  /**
   * The 3D reconstructions. The wording keeps insisting that a model is an
   * argument rather than a photograph, because on a screen it looks like one.
   */
  nav_reconstructions: { tr: "3B Modeller", en: "3D Models" },
  recon_title: { tr: "3B rekonstrüksiyonlar", en: "3D reconstructions" },
  recon_sub: {
    tr: "Bugün ayakta olmayan yapıları, yayımlanmış ölçülerden kurulmuş üç boyutlu modellerle gez. Her ölçünün kaynağı ve modelin nerede tahmin yürüttüğü yanında yazıyor.",
    en: "Walk around structures that no longer stand, modelled from published measurements. Every dimension names its source, and each model says where it is guessing.",
  },
  recon_badge: { tr: "3B", en: "3D" },
  recon_open: { tr: "3B modeli aç", en: "Open the 3D model" },
  recon_back: { tr: "Tüm 3B modeller", en: "All 3D models" },
  recon_measures: {
    tr: "Modelin kurulduğu ölçüler",
    en: "The measurements the model is built from",
  },
  recon_uncertainty: { tr: "Modelin tahmin ettiği yerler", en: "What the model infers" },
  recon_sources: { tr: "Ölçülerin kaynağı", en: "Where the measurements come from" },
  recon_hint: {
    tr: "Sürükleyerek döndür, tekerlekle yaklaş.",
    en: "Drag to orbit, scroll to zoom.",
  },
  recon_views: { tr: "Bakış", en: "Views" },
  recon_export: { tr: "3B dosyayı indir (.glb)", en: "Download the 3D file (.glb)" },
  recon_exporting: { tr: "Hazırlanıyor…", en: "Preparing…" },
  recon_view_front: { tr: "Önden", en: "Front" },
  recon_view_corner: { tr: "Köşeden", en: "Corner" },
  recon_view_above: { tr: "Üstten", en: "Above" },
  recon_light: { tr: "Işık", en: "Light" },
  recon_light_day: { tr: "Gündüz", en: "Day" },
  recon_light_golden: { tr: "Altın saat", en: "Golden hour" },
  recon_light_night: { tr: "Gece", en: "Night" },
  recon_light_hint: {
    tr: "Aynı model, farklı ışık altında.",
    en: "The same model, in a different light.",
  },
  recon_labels_show: { tr: "Etiketleri göster", en: "Show labels" },
  recon_labels_hide: { tr: "Etiketleri gizle", en: "Hide labels" },
  recon_spin: { tr: "Döndür", en: "Spin" },
  recon_spin_stop: { tr: "Durdur", en: "Stop" },
  recon_reset: { tr: "Görünümü sıfırla", en: "Reset the view" },
  recon_loading: { tr: "Model hazırlanıyor…", en: "Building the model…" },
  recon_scale: {
    tr: "Mavi figür 1,75 m boyunda bir insan — ölçek için orada.",
    en: "The blue figure is a person 1.75 m tall, standing there for scale.",
  },
  recon_unavailable: {
    tr: "Tarayıcın 3B görüntülemeyi (WebGL) desteklemiyor. Ölçüler ve kaynaklar aşağıda.",
    en: "This browser cannot display 3D (WebGL). The measurements and sources are below.",
  },
  recon_measure_count: { tr: "kaynaklı ölçü", en: "cited measurements" },
  seo_reconstructions_title: {
    tr: "3B Rekonstrüksiyonlar — Ölçüleri Kaynaklı Modeller | Antik Türkiye",
    en: "3D Reconstructions — Models with Cited Measurements | Ancient Türkiye",
  },
  seo_reconstructions_desc: {
    tr: "Celsus Kütüphanesi, Artemis Tapınağı, Aspendos ve Hierapolis tiyatroları, Didyma Apollon Tapınağı, Pergamon Zeus Sunağı, Aphrodisias Stadyumu ve Göbeklitepe D Yapısı: yayımlanmış ölçülerden kurulmuş, her rakamı kaynaklı üç boyutlu modeller.",
    en: "The Library of Celsus, the Temple of Artemis, the theatres at Aspendos and Hierapolis, the Temple of Apollo at Didyma, the Great Altar of Pergamon, the stadium at Aphrodisias and Enclosure D at Göbeklitepe, modelled from published measurements with every figure sourced.",
  },

  // ————— Audio guide —————
  guide_title: { tr: "Sesli rehber", en: "Audio guide" },
  guide_tour_title: { tr: "Anlatımlı tur", en: "Narrated tour" },
  guide_play: { tr: "Dinle", en: "Listen" },
  guide_resume: { tr: "Devam et", en: "Resume" },
  guide_pause: { tr: "Duraklat", en: "Pause" },
  guide_stop: { tr: "Bitir", en: "Stop" },
  guide_prev: { tr: "Önceki bölüm", en: "Previous chapter" },
  guide_next: { tr: "Sonraki bölüm", en: "Next chapter" },
  guide_replay: { tr: "Baştan dinle", en: "Play again" },
  guide_speed: { tr: "Hız", en: "Speed" },
  guide_chapter_count: { tr: "bölüm", en: "chapters" },
  guide_chapters: { tr: "Bölümler", en: "Chapters" },
  guide_minutes: { tr: "dk", en: "min" },
  guide_offline_ok: {
    tr: "Cihazınızın sesiyle okunuyor; internetsiz de çalışır.",
    en: "Read by your device's voice; it works without a signal.",
  },
  guide_online_voice: {
    tr: "Bu ses internet bağlantısı gerektirebilir. Çevrimdışı için cihaz ayarlarından bir ses paketi indirin.",
    en: "This voice may need a connection. Download a voice pack in your device settings to listen offline.",
  },
  guide_recorded: { tr: "Stüdyo kaydı", en: "Studio recording" },
  guide_no_voice: {
    tr: "Bu cihazda bu dil için ses bulunamadı. Metni aşağıda okuyabilirsiniz.",
    en: "No voice for this language on this device. The text is below to read.",
  },
  guide_unsupported: {
    tr: "Tarayıcınız sesli okumayı desteklemiyor.",
    en: "This browser cannot read aloud.",
  },
  guide_show_text: { tr: "Metni göster", en: "Show transcript" },
  guide_hide_text: { tr: "Metni gizle", en: "Hide transcript" },
  guide_geo: { tr: "Varınca başlat", en: "Start on arrival" },
  guide_geo_on: { tr: "Konum izleniyor", en: "Watching location" },
  guide_geo_hint: {
    tr: "Kalıntılara {km} km mesafedesiniz. 1 km yaklaşınca rehber kendiliğinden başlar.",
    en: "You are {km} km from the ruins. The guide starts by itself within 1 km.",
  },
  guide_geo_arrived: {
    tr: "Hoş geldiniz! Sesli rehber başlıyor.",
    en: "You've arrived! Starting the audio guide.",
  },
  guide_geo_denied: {
    tr: "Konum alınamadı. Tarayıcı izinlerini kontrol edin.",
    en: "Couldn't get your location. Check the browser permissions.",
  },

  // ————— Real scans —————
  scans_title: { tr: "Gerçek eserin 3B taraması", en: "3D scans of the real pieces" },
  scans_intro: {
    tr: "Modelde kullanılan heykel ve kabartmalar, gerçek eserlerin fotogrametri taramalarıdır. Burada her birini tek başına çevirip inceleyebilirsiniz.",
    en: "The sculpture set into the model comes from photogrammetry scans of the real pieces. Here each can be turned on its own.",
  },
  scans_by: { tr: "Tarama:", en: "Scan:" },
  scans_reduced: {
    tr: " · web için küçültüldü ve kırpıldı",
    en: " · reduced and cropped for the web",
  },

  // ————— Ambient sound —————
  ambience_on: { tr: "Ortam sesi", en: "Ambient sound" },
  ambience_off: { tr: "Sesi kapat", en: "Mute ambience" },
  ambience_hint: {
    tr: "Rüzgâr, ağustos böcekleri, gece cırcır böcekleri ve tiyatroda kalabalık — tarayıcıda üretilen sesler.",
    en: "Wind, cicadas, night crickets and a crowd in the theatres — synthesised in the browser.",
  },

  // ————— Realism / AR / compare —————
  recon_quality: { tr: "Yüksek kalite", en: "High quality" },
  recon_quality_hint: {
    tr: "Ortam gölgelemesi: taş derzlerinde, saçak altlarında ve oturma sıraları arasında gerçekçi temas gölgesi. Güçlü cihazlar için.",
    en: "Ambient occlusion: true contact shadow in stone joints, under cornices and between seat rows. For capable devices.",
  },
  recon_ar: { tr: "AR'da gör", en: "View in AR" },
  recon_ar_preparing: { tr: "AR hazırlanıyor…", en: "Preparing AR…" },
  recon_ar_start: { tr: "AR'ı başlat", en: "Start AR" },
  recon_ar_real: { tr: "Gerçek boyut", en: "Life size" },
  recon_ar_tabletop: { tr: "Masa boyu", en: "Tabletop" },
  recon_ar_exit: { tr: "Kapat", en: "Close" },
  recon_ar_place: {
    tr: "Telefonu yavaşça gezdirip zemini bulun, beyaz halka çıkınca dokunun.",
    en: "Move the phone slowly to find the floor; tap when the white ring appears.",
  },
  recon_landscape_note: {
    tr: "Çevredeki arazi ve ağaçlar temsilîdir; ölçülere dayanmaz.",
    en: "The surrounding land and trees are illustrative, not measured.",
  },
  recon_ar_unsupported: {
    tr: "Bu cihaz AR desteklemiyor; modeli burada çevirebilirsiniz.",
    en: "This device doesn't support AR; you can still turn the model here.",
  },
  recon_compare: { tr: "Bugün ve antik çağda", en: "Today and in antiquity" },
  photo_unavailable: {
    tr: "Bugünkü fotoğraf yüklenemedi (çevrimdışı olabilirsiniz).",
    en: "Today's photograph couldn't load (you may be offline).",
  },
  recon_compare_close: { tr: "Karşılaştırmayı kapat", en: "Close comparison" },
  recon_compare_today: { tr: "Bugün", en: "Today" },
  recon_compare_then: { tr: "Rekonstrüksiyon", en: "Reconstruction" },
  recon_compare_hint: {
    tr: "Çizgiyi kaydırarak bugünkü fotoğrafla modeli karşılaştırın. Açılar birebir örtüşmez.",
    en: "Drag the line to compare today's photograph with the model. The angles are not an exact match.",
  },

  // ————— Stories —————
  nav_stories: { tr: "Hikâyeler", en: "Stories" },
  stories_title: { tr: "Antik bir günde", en: "A day in antiquity" },
  stories_intro: {
    tr: "Bir kentin bir gününü, orada yaşamış biri gibi yaşayın. Kararlarınız hikâyeyi değiştirir. Karakterler kurgu, dünyaları kaynaklara dayalı.",
    en: "Live one day in an ancient city as someone who lived there. Your choices change the story. The characters are fiction; their world comes from the sources.",
  },
  stories_fiction: {
    tr: "Kurgu — tarihsel arka plan her sahnenin altında.",
    en: "Fiction — the historical background is under each scene.",
  },
  stories_history_note: { tr: "Tarihte", en: "In history" },
  stories_restart: { tr: "Baştan başla", en: "Start again" },
  stories_back: { tr: "Bir önceki sahne", en: "Previous scene" },
  stories_end: { tr: "Son", en: "The end" },
  stories_all: { tr: "Tüm hikâyeler", en: "All stories" },
  stories_read: { tr: "Hikâyeye başla", en: "Begin the story" },
  stories_listen: { tr: "Sahneyi dinle", en: "Listen to the scene" },
  stories_endings: { tr: "son", en: "endings" },
  stories_found: { tr: "Bulduğunuz sonlar", en: "Endings found" },
  seo_stories_title: {
    tr: "Antik Bir Günde — Etkileşimli Tarih Hikâyeleri | Antik Türkiye",
    en: "A Day in Antiquity — Interactive History Stories | Ancient Türkiye",
  },
  seo_stories_desc: {
    tr: "Efes, Aspendos, Göbeklitepe, Pergamon, Troya, Hattuşa, Aphrodisias ve Göreme'de geçen, seçimlerinizle ilerleyen ve her sahnesinin tarihsel arka planı verilen kısa hikâyeler.",
    en: "Short branching stories set in Ephesus, Aspendos, Göbeklitepe, Pergamon, Troy, Hattusa, Aphrodisias and Göreme, each scene with its historical background.",
  },
} satisfies Record<string, Localized>;

export type TKey = keyof typeof dict;

/**
 * The German and Russian interface. Kept out of `dict` so that adding a key
 * stays a two-language edit: a key missing here simply shows in English.
 */
const translations: Partial<Record<Lang, Partial<Record<TKey, string>>>> = {
  de: deStrings,
  ru: ruStrings,
};

/**
 * Translation outside React, for `head()` and anything else that runs before
 * (or without) a component tree.
 */
export function translate(key: TKey, lang: Lang): string {
  return translations[lang]?.[key] ?? pick(dict[key] as Localized, lang);
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  L: (value: Localized) => string;
};

const LangContext = createContext<Ctx | null>(null);

/**
 * The language comes from the URL, which is what lets the server render the
 * page in the right one. `setLang` is supplied by the root route and navigates
 * rather than mutating state, so switching language changes the address.
 */
export function LanguageProvider({
  lang,
  setLang,
  children,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  children: ReactNode;
}) {
  const t = useCallback((key: TKey) => translate(key, lang), [lang]);
  const L = useCallback((value: Localized) => pick(value, lang), [lang]);
  const value = useMemo(() => ({ lang, setLang, t, L }), [lang, setLang, t, L]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}
