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
  nav_explore: { tr: "Tarihî Yerler", en: "Heritage Sites" },
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
  /**
   * The neutral word for a total. The list is no longer only ancient cities —
   * it holds museums, mosques, caves and Ottoman towns — so a count labelled
   * "antik kent" would now be a false claim about what is in it.
   */
  heritage_sites: { tr: "tarihî yer", en: "heritage sites" },
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
  nav_collections: { tr: "Koleksiyonlar", en: "Collections" },
  collections_title: { tr: "Koleksiyonlar", en: "Collections" },
  collections_sub: {
    tr: "Bir temayı takip eden derlemeler: bir hafta sonuna sığan rotalar, ücretsiz ören yerleri, kayıp harikalar.",
    en: "Curated sets that follow one theme: routes that fit a weekend, sites that cost nothing, lost wonders.",
  },
  collection_sites: { tr: "tarihî yer", en: "sites" },
  collection_visited: { tr: "gezildi", en: "visited" },
  collection_back: { tr: "Tüm koleksiyonlar", en: "All collections" },

  // ——— Daily challenge ———
  nav_daily: { tr: "Günlük", en: "Daily" },
  daily_title: { tr: "Günün Antik Kenti", en: "Ancient City of the Day" },
  daily_sub: {
    tr: "Herkese aynı beş soru, her gün yenisi. Sonucunu tek satırda paylaşabilirsin.",
    en: "The same five questions for everyone, new every day. Share your result in a single line.",
  },
  daily_done_today: {
    tr: "Bugünün sorularını çözdün. Yarın yenisi gelecek.",
    en: "You have finished today's questions. New ones arrive tomorrow.",
  },
  daily_share: { tr: "Sonucu kopyala", en: "Copy result" },
  daily_copied: { tr: "Panoya kopyalandı", en: "Copied to clipboard" },
  daily_streak: { tr: "günlük seri", en: "day streak" },
  daily_play: { tr: "Bugünü oyna", en: "Play today" },
  daily_question_of: { tr: "/ 5", en: "/ 5" },

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
    tr: "Tarihî Yerler — Antik Kentler, Anıtlar ve Müzeler | Antik Türkiye",
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
  seo_collections_title: {
    tr: "Koleksiyonlar — Temalı Antik Kent Derlemeleri | Antik Türkiye",
    en: "Collections — Themed Sets of Ancient Cities | Ancient Türkiye",
  },
  seo_collections_desc: {
    tr: "Bir hafta sonuna sığan Likya rotası, ücretsiz ören yerleri, UNESCO listesi ve daha fazlası: temaya göre derlenmiş antik kent listeleri.",
    en: "A Lycian route that fits a weekend, sites that cost nothing, the UNESCO list and more: ancient cities gathered by theme.",
  },
  seo_daily_title: {
    tr: "Günün Antik Kenti — Günlük Beş Soru | Antik Türkiye",
    en: "Ancient City of the Day — Five Questions Daily | Ancient Türkiye",
  },
  seo_daily_desc: {
    tr: "Her gün herkese aynı beş soru. Antik kentler hakkında bilgini sına, sonucunu paylaş, serini sürdür.",
    en: "The same five questions for everyone, every day. Test what you know about the ancient cities, share your result, keep your streak.",
  },
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
