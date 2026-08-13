import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

export type Lang = "tr" | "en";
export type Localized = { tr: string; en: string };

export const LANGS: Lang[] = ["tr", "en"];

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
  return value === "en" ? "en" : "tr";
}

const dict = {
  appName: { tr: "Antik Türkiye", en: "Ancient Türkiye" },
  tagline: {
    tr: "Türkiye'nin antik kentlerini keşfet, öğren, kaydet.",
    en: "Discover, learn and log the ancient cities of Türkiye.",
  },
  nav_home: { tr: "Ana Sayfa", en: "Home" },
  nav_explore: { tr: "Antik Kentler", en: "Ancient Cities" },
  nav_map: { tr: "Harita", en: "Map" },
  nav_regions: { tr: "Bölgeler", en: "Regions" },
  nav_games: { tr: "Oyunlar", en: "Games" },
  nav_profile: { tr: "Profil", en: "Profile" },
  search_placeholder: {
    tr: "Antik kent, il veya tarihî kişi ara…",
    en: "Search a city, province or historical figure…",
  },
  daily_pick: { tr: "Günün antik kenti", en: "Ancient city of the day" },
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
  figures: { tr: "Tarihî kişiler", en: "Historical figures" },
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
  total_visited: { tr: "Gezilen antik kent", en: "Cities visited" },
  remaining: { tr: "Kalan antik kent", en: "Cities remaining" },
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
    tr: "Tarihî kişiyi doğru kente eşle.",
    en: "Match the historical figure to their city.",
  },
  game_tf: { tr: "Doğru / Yanlış", en: "True / False" },
  game_tf_d: { tr: "Bilgi kartlarını sına.", en: "Test the facts." },
  game_map: { tr: "Haritada bul", en: "Find it on the map" },
  game_map_d: { tr: "Hangi ilde olduğunu bil.", en: "Guess the province." },
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
  structure_generic: {
    tr: "{site} kentinin önemli yapılarından biri. Kentin tarihçesi ve diğer kalıntıları için ayrıntılar bölümünü inceleyin.",
    en: "One of the key structures of {site}. Explore the history section to learn more about the city.",
  },
  pwa_offline_ready: {
    tr: "Uygulama çevrimdışı kullanım için hazır. Ana ekranına ekleyebilirsin.",
    en: "The app is ready for offline use. You can add it to your home screen.",
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
    tr: "Antik Kentler — Filtrele ve Keşfet | Antik Türkiye",
    en: "Ancient Cities — Filter and Explore | Ancient Türkiye",
  },
  seo_explore_desc: {
    tr: "Bölge, il, uygarlık ve UNESCO durumuna göre Türkiye'deki antik kentleri filtrele; liste veya harita görünümünde keşfet.",
    en: "Filter the ancient cities of Türkiye by region, province, civilisation and UNESCO status; browse them as a list or on the map.",
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
  seo_city_suffix: {
    tr: "Antik Kenti — Tarihçe, Ziyaret Bilgileri",
    en: "Ancient City — History and Visitor Information",
  },
  seo_region_suffix: {
    tr: "Bölgesi Antik Kentleri",
    en: "Region — Ancient Cities",
  },
  seo_not_found: { tr: "Sayfa bulunamadı", en: "Page not found" },
} satisfies Record<string, Localized>;

export type TKey = keyof typeof dict;

/**
 * Translation outside React, for `head()` and anything else that runs before
 * (or without) a component tree.
 */
export function translate(key: TKey, lang: Lang): string {
  return dict[key][lang];
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
  const t = useCallback((key: TKey) => dict[key][lang], [lang]);
  const L = useCallback((value: Localized) => value[lang], [lang]);
  const value = useMemo(() => ({ lang, setLang, t, L }), [lang, setLang, t, L]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}
