import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "tr" | "en";
export type Localized = { tr: string; en: string };

const STORAGE_KEY = "antik-tr-lang";

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
  route_est_time: { tr: "Tahmini araç süresi", en: "Estimated driving time" },
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
} satisfies Record<string, Localized>;

export type TKey = keyof typeof dict;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  L: (value: Localized) => string;
};

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("tr");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "tr" || stored === "en") setLangState(stored);
    else if (navigator.language && !navigator.language.startsWith("tr")) setLangState("en");
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: TKey) => dict[key][lang], [lang]);
  const L = useCallback((value: Localized) => value[lang], [lang]);

  return <LangContext.Provider value={{ lang, setLang, t, L }}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}
