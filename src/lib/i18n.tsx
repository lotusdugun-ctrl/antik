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
/**
 * The content translations are a few hundred kilobytes that a Turkish or
 * English reader never needs, so they are fetched only when German or
 * Russian is chosen — and awaited by the root route before it renders, on
 * the server and in the browser alike, so a German page is German in its
 * very first HTML.
 */
let contentTranslations: Promise<void> | null = null;
export function loadContentTranslations(): Promise<void> {
  contentTranslations ??= Promise.all([
    import("@/lib/locales/tm-sites"),
    import("@/lib/locales/tm-details"),
    import("@/lib/locales/tm-recon"),
    import("@/lib/locales/tm-stories"),
  ]).then((modules) => modules.forEach((module) => registerTranslations(module.tm)));
  return contentTranslations;
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
  reset_confirm_title: { tr: "Tüm ilerleme silinsin mi?", en: "Delete all progress?" },
  reset_confirm_body: {
    tr: "Ziyaretlerin, notların, fotoğrafların, damgaların ve XP'n bu cihazdan kalıcı olarak silinecek. Bu işlem geri alınamaz.",
    en: "Your visits, notes, photos, stamps and XP will be permanently deleted from this device. This cannot be undone.",
  },
  storage_full: {
    tr: "Cihazda yer kalmadı; son değişiklik kaydedilemedi. Bazı ziyaret fotoğraflarını silmeyi deneyin.",
    en: "This device is out of storage; your last change could not be saved. Try deleting some visit photos.",
  },
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

  // ——— History: civilizations, people, timeline ———
  nav_history: {
    tr: "Medeniyetler",
    en: "Civilizations",
    de: "Kulturen",
    ru: "Цивилизации",
  },
  nav_history_d: {
    tr: "Anadolu'nun halkları ve tarihi kişiler",
    en: "The peoples of Anatolia and its historical figures",
    de: "Die Völker Anatoliens und seine historischen Gestalten",
    ru: "Народы Анатолии и исторические личности",
  },
  nav_timeline: {
    tr: "Zaman Çizelgesi",
    en: "Timeline",
    de: "Zeitleiste",
    ru: "Хронология",
  },
  nav_timeline_d: {
    tr: "Bir yıl seç, o dönemin Anadolu'sunu gör",
    en: "Pick a year and see Anatolia at that time",
    de: "Wähle ein Jahr und sieh Anatolien zu jener Zeit",
    ru: "Выберите год и увидьте Анатолию того времени",
  },
  civs_sub: {
    tr: "On binlerce yıl boyunca Anadolu'da yaşamış halklar ve devletler, en eskiden en yeniye. Her birinin sayfasında o döneme ait yerleri ve kişileri bulabilirsin.",
    en: "The peoples and states of Anatolia over tens of thousands of years, oldest first. Each page gathers the places and people of that age.",
    de: "Die Völker und Staaten Anatoliens über Zehntausende von Jahren, die ältesten zuerst. Jede Seite versammelt die Orte und Menschen jener Zeit.",
    ru: "Народы и государства Анатолии за десятки тысяч лет, от древнейших к поздним. На каждой странице — места и люди той эпохи.",
  },
  civs_people: {
    tr: "Tarihi kişiler",
    en: "Historical figures",
    de: "Historische Persönlichkeiten",
    ru: "Исторические личности",
  },
  civs_places: { tr: "yer", en: "places", de: "Orte", ru: "мест" },
  civ_period: { tr: "Dönem", en: "Period", de: "Zeitraum", ru: "Период" },
  civ_capital: { tr: "Merkez", en: "Centre", de: "Zentrum", ru: "Центр" },
  civ_highlights: { tr: "Öne çıkanlar", en: "Highlights", de: "Wissenswertes", ru: "Главное" },
  civ_sites: {
    tr: "Bu döneme ait yerler",
    en: "Places from this age",
    de: "Orte aus dieser Zeit",
    ru: "Места этой эпохи",
  },
  civ_people: { tr: "İlgili kişiler", en: "People", de: "Personen", ru: "Личности" },
  civ_back: {
    tr: "Tüm medeniyetler",
    en: "All civilizations",
    de: "Alle Kulturen",
    ru: "Все цивилизации",
  },
  civ_prev: { tr: "Önceki", en: "Earlier", de: "Früher", ru: "Раньше" },
  civ_next: { tr: "Sonraki", en: "Later", de: "Später", ru: "Позже" },
  history_sources: { tr: "Kaynaklar", en: "Sources", de: "Quellen", ru: "Источники" },
  person_sites: {
    tr: "İlgili yerler",
    en: "Related places",
    de: "Zugehörige Orte",
    ru: "Связанные места",
  },
  person_civs: { tr: "Dönemi", en: "Era", de: "Epoche", ru: "Эпоха" },
  timeline_sub: {
    tr: "Kaydırıcıyı hareket ettir: seçtiğin yılda Anadolu'da hangi medeniyetler vardı ve bugün hangi yerlerini gezebilirsin?",
    en: "Move the slider: which civilizations were in Anatolia in the year you pick, and which of their places can you visit today?",
    de: "Bewege den Regler: Welche Kulturen gab es im gewählten Jahr in Anatolien, und welche ihrer Orte kannst du heute besuchen?",
    ru: "Двигайте ползунок: какие цивилизации были в Анатолии в выбранном году и какие их места можно посетить сегодня?",
  },
  timeline_year: { tr: "Yıl", en: "Year", de: "Jahr", ru: "Год" },
  timeline_active: {
    tr: "Bu yılda Anadolu'da",
    en: "In Anatolia this year",
    de: "In diesem Jahr in Anatolien",
    ru: "В Анатолии в этом году",
  },
  timeline_none: {
    tr: "Bu yıl için kayıtlı bir medeniyet yok.",
    en: "No civilization is recorded for this year.",
    de: "Für dieses Jahr ist keine Kultur verzeichnet.",
    ru: "Для этого года цивилизации не отмечены.",
  },
  timeline_sites: {
    tr: "Bu dönemden bugün gezilebilen yerler",
    en: "Places from this time you can visit today",
    de: "Orte aus dieser Zeit, die man heute besuchen kann",
    ru: "Места этого времени, которые можно посетить сегодня",
  },
  timeline_note: {
    tr: "Dönemler yaklaşıktır ve yerler, etiketlendikleri medeniyetin tüm süresi boyunca gösterilir; bir yerin o yıl gerçekten kullanımda olduğu anlamına gelmeyebilir.",
    en: "Periods are approximate, and a place is shown for the whole span of the civilizations it is tagged with; that does not always mean it was in use that very year.",
    de: "Die Zeiträume sind ungefähr, und ein Ort wird über die gesamte Dauer der ihm zugeordneten Kulturen gezeigt; das heißt nicht immer, dass er genau in diesem Jahr genutzt wurde.",
    ru: "Периоды приблизительны, а место показывается на всём отрезке связанных с ним цивилизаций; это не всегда значит, что оно использовалось именно в этом году.",
  },
  timeline_more: {
    tr: "Tümünü göster",
    en: "Show all",
    de: "Alle anzeigen",
    ru: "Показать все",
  },
  seo_history_title: {
    tr: "Anadolu Medeniyetleri ve Tarihi Kişiler | Antik Türkiye",
    en: "Civilizations of Anatolia and Historical Figures | Ancient Türkiye",
    de: "Kulturen Anatoliens und historische Persönlichkeiten | Antike Türkei",
    ru: "Цивилизации Анатолии и исторические личности | Древняя Турция",
  },
  seo_timeline_title: {
    tr: "Anadolu Tarihi Zaman Çizelgesi | Antik Türkiye",
    en: "Timeline of Anatolian History | Ancient Türkiye",
    de: "Zeitleiste der Geschichte Anatoliens | Antike Türkei",
    ru: "Хронология истории Анатолии | Древняя Турция",
  },

  info_as_of: {
    tr: "Bilgilerin tarihi:",
    en: "Information as of",
    de: "Stand der Angaben:",
    ru: "Данные на",
  },
  info_stale: {
    tr: "Bu bilgiler bir yıldan eski; saatler ve ücretler değişmiş olabilir.",
    en: "This information is over a year old; hours and fees may have changed.",
    de: "Diese Angaben sind über ein Jahr alt; Zeiten und Preise können sich geändert haben.",
    ru: "Этим данным больше года; часы работы и цены могли измениться.",
  },
  report_issue: {
    tr: "Hatalı bilgi bildir",
    en: "Report a mistake",
    de: "Fehler melden",
    ru: "Сообщить об ошибке",
  },
  report_title_prefix: {
    tr: "Bilgi düzeltme",
    en: "Correction",
    de: "Korrektur",
    ru: "Исправление",
  },
  report_body: {
    tr: "Hangi bilgi yanlış, doğrusu ne ve kaynağı nedir?",
    en: "What is wrong, what is correct, and what is the source?",
    de: "Was ist falsch, was ist richtig, und was ist die Quelle?",
    ru: "Что неверно, как правильно и каков источник?",
  },

  transfer_title: {
    tr: "Başka cihaza aktar",
    en: "Move to another device",
    de: "Auf ein anderes Gerät übertragen",
    ru: "Перенести на другое устройство",
  },
  transfer_sub: {
    tr: "Hesap gerekmez: ilerlemen, damgaların ve notların bir bağlantının içine sıkıştırılır. Bağlantıyı diğer cihazında aç ya da QR kodu okut. Veriler hiçbir sunucuya gönderilmez; ziyaret fotoğrafları bağlantıya sığmadığı için aktarılmaz (onlar için yedek dosyasını kullan).",
    en: "No account needed: your progress, stamps and notes are packed into a link. Open it on the other device or scan the QR code. Nothing is sent to any server; visit photos are too large for a link and stay behind (use the backup file for those).",
    de: "Kein Konto nötig: Fortschritt, Stempel und Notizen werden in einen Link gepackt. Öffne ihn auf dem anderen Gerät oder scanne den QR-Code. Nichts wird an einen Server gesendet; Besuchsfotos sind zu groß für einen Link und bleiben hier (dafür die Sicherungsdatei verwenden).",
    ru: "Без аккаунта: прогресс, штампы и заметки упаковываются в ссылку. Откройте её на другом устройстве или отсканируйте QR-код. Ничего не отправляется на сервер; фото визитов слишком велики для ссылки и не переносятся (для них используйте файл резервной копии).",
  },
  transfer_create: {
    tr: "Aktarma bağlantısı oluştur",
    en: "Create a transfer link",
    de: "Übertragungslink erstellen",
    ru: "Создать ссылку для переноса",
  },
  transfer_hint: {
    tr: "Diğer cihazın kamerasıyla QR kodu okut ya da bağlantıyı kendine gönder. Bağlantıyı başkalarıyla paylaşma: içinde ziyaret notların var.",
    en: "Scan the code with the other device's camera or send the link to yourself. Do not share it with others: it contains your visit notes.",
    de: "Scanne den Code mit der Kamera des anderen Geräts oder schick dir den Link selbst. Teile ihn nicht mit anderen: Er enthält deine Besuchsnotizen.",
    ru: "Отсканируйте код камерой другого устройства или отправьте ссылку себе. Не делитесь ею с другими: в ней ваши заметки.",
  },
  transfer_copy: {
    tr: "Bağlantıyı kopyala",
    en: "Copy link",
    de: "Link kopieren",
    ru: "Копировать ссылку",
  },
  transfer_share: {
    tr: "Kendine gönder",
    en: "Send to yourself",
    de: "An dich senden",
    ru: "Отправить себе",
  },
  transfer_qr_alt: {
    tr: "Aktarma bağlantısının QR kodu",
    en: "QR code of the transfer link",
    de: "QR-Code des Übertragungslinks",
    ru: "QR-код ссылки для переноса",
  },
  transfer_arrived: {
    tr: "Başka bir cihazdan ilerleme geldi. Bu cihazdakiyle birleştirilsin mi?",
    en: "Progress has arrived from another device. Merge it with this one?",
    de: "Fortschritt von einem anderen Gerät ist angekommen. Mit diesem zusammenführen?",
    ru: "Получен прогресс с другого устройства. Объединить с этим?",
  },
  transfer_merge: { tr: "Birleştir", en: "Merge", de: "Zusammenführen", ru: "Объединить" },
  transfer_merged: {
    tr: "İlerleme birleştirildi.",
    en: "Progress merged.",
    de: "Fortschritt zusammengeführt.",
    ru: "Прогресс объединён.",
  },
  transfer_invalid: {
    tr: "Bu aktarma bağlantısı okunamadı.",
    en: "This transfer link could not be read.",
    de: "Dieser Übertragungslink konnte nicht gelesen werden.",
    ru: "Не удалось прочитать ссылку для переноса.",
  },
  transfer_failed: {
    tr: "Bu tarayıcı aktarma bağlantısı oluşturamadı. Bunun yerine yedek dosyasını kullan.",
    en: "This browser could not create a transfer link. Use a backup file instead.",
    de: "Dieser Browser konnte keinen Übertragungslink erstellen. Nutze stattdessen eine Sicherungsdatei.",
    ru: "Этот браузер не смог создать ссылку для переноса. Используйте файл резервной копии.",
  },
  transfer_qr_failed: {
    tr: "Bağlantı QR kod için fazla uzun; kopyala ya da paylaş.",
    en: "The link is too long for a QR code; copy or share it instead.",
    de: "Der Link ist für einen QR-Code zu lang; kopiere oder teile ihn stattdessen.",
    ru: "Ссылка слишком длинная для QR-кода; скопируйте её или поделитесь ею.",
  },
  transfer_copy_failed: {
    tr: "Kopyalanamadı. Bağlantıyı seçip elle kopyala.",
    en: "Could not copy. Select the link and copy it by hand.",
    de: "Kopieren fehlgeschlagen. Markiere den Link und kopiere ihn von Hand.",
    ru: "Не удалось скопировать. Выделите ссылку и скопируйте её вручную.",
  },

  ask_title: { tr: "Rehbere sor", en: "Ask the guide", de: "Frag den Guide", ru: "Спросите гида" },
  ask_sub: {
    tr: "Yaz ya da söyle. Cevaplar yalnızca uygulamadaki bilgilerden gelir; bilmediğini söyler, uydurmaz.",
    en: "Type or say it. Answers come only from what the app holds; it says when it doesn't know rather than guessing.",
    de: "Schreib oder sprich. Antworten stammen nur aus den Daten der App; was sie nicht weiß, sagt sie, statt zu raten.",
    ru: "Напишите или скажите. Ответы берутся только из данных приложения: если ответа нет, гид так и скажет.",
  },
  ask_placeholder: {
    tr: "Ör. Tiyatro kaç kişilikti?",
    en: "e.g. How many people did the theatre hold?",
    de: "z. B. Wie viele Zuschauer fasste das Theater?",
    ru: "Напр.: сколько зрителей вмещал театр?",
  },
  ask_listen: {
    tr: "Sesle sor",
    en: "Ask by voice",
    de: "Per Stimme fragen",
    ru: "Спросить голосом",
  },
  ask_send: { tr: "Sor", en: "Ask", de: "Fragen", ru: "Спросить" },
  ask_speak: {
    tr: "Cevabı dinle",
    en: "Hear the answer",
    de: "Antwort anhören",
    ru: "Прослушать ответ",
  },
  /**
   * The box is now answered by a language model grounded in the app's data,
   * so the old promise ("only from what the app holds") would be untrue; the
   * offline note marks an answer that came from the local matcher instead.
   */
  ask_sub_ai: {
    tr: "Yaz ya da söyle. Yapay zekâ rehber, uygulamadaki bilgilere dayanarak cevaplar; önemli ayrıntıları resmî kaynaklardan doğrula.",
    en: "Type or say it. The AI guide answers from what the app holds; check important details with official sources.",
  },
  ask_thinking: { tr: "Rehber düşünüyor…", en: "The guide is thinking…" },
  ask_offline: { tr: "Çevrimdışı yanıt", en: "Offline answer" },
  ask_ai_source: { tr: "Yapay zekâ rehber", en: "AI guide" },
  /** The AI guide also searches the web now (Google Search grounding). */
  ask_sub_web: {
    tr: "Yaz ya da söyle. Yapay zekâ rehber uygulamadaki bilgileri ve Google aramasını kullanır; önemli ayrıntıları kaynaklarından doğrula.",
    en: "Type or say it. The AI guide uses what the app holds and Google Search; check important details with the sources.",
  },
  ask_sources: { tr: "Kaynaklar", en: "Sources" },
  ask_notice_limited: {
    tr: "Kısa sürede çok soru sordun; yapay zekâ rehber birkaç dakika sonra yine cevaplayacak. Şimdilik elimdeki bilgi:",
    en: "That was a lot of questions in a short time; the AI guide will answer again in a few minutes. For now, here is what the app holds:",
  },
  ask_notice_busy: {
    tr: "Yapay zekâ rehber şu an çok yoğun. Biraz sonra tekrar dene; şimdilik elimdeki bilgi:",
    en: "The AI guide is very busy right now. Try again shortly; for now, here is what the app holds:",
  },
  ask_retry: { tr: "Tekrar sor", en: "Ask again" },
  ask_search_suggestions: { tr: "Google arama önerileri", en: "Google Search suggestions" },

  report_open: {
    tr: "Bu cevabı bildir",
    en: "Report this answer",
    de: "Diese Antwort melden",
    ru: "Пожаловаться на ответ",
  },
  report_title: {
    tr: "Bu cevapta ne sorun var?",
    en: "What is wrong with this answer?",
    de: "Was stimmt mit dieser Antwort nicht?",
    ru: "Что не так с этим ответом?",
  },
  report_reason_offensive: {
    tr: "Rahatsız edici / uygunsuz",
    en: "Offensive or inappropriate",
    de: "Anstößig oder unangemessen",
    ru: "Оскорбительный или неуместный",
  },
  report_reason_wrong: {
    tr: "Yanlış bilgi",
    en: "Wrong information",
    de: "Falsche Information",
    ru: "Неверные сведения",
  },
  report_reason_other: {
    tr: "Başka bir sorun",
    en: "Something else",
    de: "Etwas anderes",
    ru: "Другое",
  },
  report_note: {
    tr: "İsteğe bağlı not (kişisel bilgi yazmayın)",
    en: "Optional note (no personal information, please)",
    de: "Optionale Notiz (bitte keine persönlichen Daten)",
    ru: "Комментарий по желанию (без личных данных)",
  },
  report_send: { tr: "Bildir", en: "Report", de: "Melden", ru: "Пожаловаться" },
  report_cancel: { tr: "Vazgeç", en: "Cancel", de: "Abbrechen", ru: "Отмена" },
  report_close: { tr: "Kapat", en: "Close", de: "Schließen", ru: "Закрыть" },
  report_thanks: {
    tr: "Teşekkürler, bildiriminiz alındı. Bu cevabı inceleyeceğiz.",
    en: "Thank you, your report was received. We will review this answer.",
    de: "Danke, Ihre Meldung ist eingegangen. Wir prüfen diese Antwort.",
    ru: "Спасибо, жалоба получена. Мы проверим этот ответ.",
  },
  report_error: {
    tr: "Bildirim gönderilemedi. Biraz sonra tekrar deneyin.",
    en: "The report could not be sent. Please try again shortly.",
    de: "Die Meldung konnte nicht gesendet werden. Bitte später erneut versuchen.",
    ru: "Не удалось отправить жалобу. Попробуйте чуть позже.",
  },
  report_privacy: {
    tr: "Neden, not ve soru-cevaptan kısa alıntılar incelenmek üzere kaydedilir; IP adresi kaydedilmez.",
    en: "The reason, your note and short excerpts of the question and answer are logged for review; no IP address is stored.",
    de: "Grund, Notiz und kurze Auszüge aus Frage und Antwort werden zur Prüfung protokolliert; keine IP-Adresse.",
    ru: "Причина, комментарий и короткие фрагменты вопроса и ответа сохраняются для проверки; IP-адрес не сохраняется.",
  },
  privacy_title: {
    tr: "Gizlilik politikası",
    en: "Privacy policy",
    de: "Datenschutz",
    ru: "Конфиденциальность",
  },
  terms_title: {
    tr: "Kullanım koşulları",
    en: "Terms of use",
    de: "Nutzungsbedingungen",
    ru: "Условия использования",
  },
  nav_legal: { tr: "Yasal", en: "Legal", de: "Rechtliches", ru: "Правовая информация" },
  credits_on_page: {
    tr: "Bu sayfadaki fotoğrafların künyeleri",
    en: "Credits for the photos on this page",
    de: "Nachweise der Fotos auf dieser Seite",
    ru: "Авторы фотографий на этой странице",
  },
  credits_textures: {
    tr: "3D modellerdeki kabartma ve mozaik fotoğrafları",
    en: "Photos used as reliefs and mosaics on the 3D models",
    de: "Fotos als Reliefs und Mosaiken auf den 3D-Modellen",
    ru: "Фото рельефов и мозаик на 3D-моделях",
  },
  credits_renders: {
    tr: "Uygulamanın kendi 3B görüntüleri",
    en: "The app's own 3D renders",
    de: "Eigene 3D-Renderings der App",
    ru: "Собственные 3D-изображения приложения",
  },
  credits_renders_sub: {
    tr: "Ana sayfa görseli, bölge görselleri ve fotoğrafı olmayan yerlerde gösterilen manzara fotoğraf değildir: Antik Türkiye'nin kendi 3B rekonstrüksiyonlarından alınmış görüntülerdir ve uygulamaya aittir. Heykellerin yüzleri aşağıda anılan baş taramasına dayanır.",
    en: "The home-page image, the region images and the landscape shown where a place has no photo are not photographs: they are renders of Antik Türkiye's own 3D reconstructions and belong to the app. The statues' faces build on the head scan credited below.",
    de: "Das Bild der Startseite, die Regionsbilder und die Landschaft für Orte ohne Foto sind keine Fotos, sondern Renderings der eigenen 3D-Rekonstruktionen von Antik Türkiye und gehören der App. Die Gesichter der Statuen beruhen auf dem unten genannten Kopfscan.",
    ru: "Изображение на главной странице, изображения регионов и пейзаж для мест без фото — не фотографии, а рендеры собственных 3D-реконструкций Antik Türkiye; они принадлежат приложению. Лица статуй основаны на скане головы, указанном ниже.",
  },
  credits_own_render: {
    tr: "Antik Türkiye 3D rekonstrüksiyonu",
    en: "Antik Türkiye 3D reconstruction",
    de: "Antik-Türkiye-3D-Rekonstruktion",
    ru: "3D-реконструкция Antik Türkiye",
  },
  credits_scans: { tr: "3D taramalar", en: "3D scans", de: "3D-Scans", ru: "3D-сканы" },
  credits_free_archive: {
    tr: "Ücretsiz arşiv (telif kısıtı yok)",
    en: "Free archive (no copyright restrictions)",
    de: "Freies Archiv (ohne Urheberrechtsbeschränkung)",
    ru: "Свободный архив (без ограничений)",
  },
  credits_sound: { tr: "Sesler", en: "Sound", de: "Klang", ru: "Звук" },
  credits_voices_device: {
    tr: "Sesli rehber şu an her dilde cihazınızın kendi sesiyle okunur.",
    en: "The audio guide is currently read in every language by your device's own voice.",
    de: "Der Audioguide wird derzeit in jeder Sprache von der Stimme Ihres Geräts gelesen.",
    ru: "Сейчас аудиогид на всех языках читается голосом вашего устройства.",
  },
  credits_voices_other: {
    tr: "Listede olmayan dillerde rehberi cihazınızın kendi sesi okur.",
    en: "In languages not listed, the guide is read by your device's own voice.",
    de: "In nicht aufgeführten Sprachen liest die Stimme Ihres Geräts.",
    ru: "На языках, которых нет в списке, гид читает голос устройства.",
  },
  credits_software: {
    tr: "Açık kaynak yazılım lisansları",
    en: "Open-source software licences",
    de: "Open-Source-Softwarelizenzen",
    ru: "Лицензии открытого ПО",
  },
  credits_model_card: {
    tr: "ses kartı",
    en: "model card",
    de: "Modellkarte",
    ru: "карточка модели",
  },
  credits_other: { tr: "Diğer", en: "Other", de: "Sonstiges", ru: "Прочее" },
  credits_map: {
    tr: "Harita verisi ve karoları:",
    en: "Map data and tiles:",
    de: "Kartendaten und Kacheln:",
    ru: "Картографические данные и тайлы:",
  },
  credits_fonts: {
    tr: "Yazı tipleri: Fraunces ve Manrope (Google Fonts, SIL Open Font License 1.1).",
    en: "Fonts: Fraunces and Manrope (Google Fonts, SIL Open Font License 1.1).",
    de: "Schriften: Fraunces und Manrope (Google Fonts, SIL Open Font License 1.1).",
    ru: "Шрифты: Fraunces и Manrope (Google Fonts, SIL Open Font License 1.1).",
  },
  news_title: {
    tr: "Kazı haberleri",
    en: "Excavation news",
    de: "Grabungsnachrichten",
    ru: "Новости раскопок",
  },
  news_sub: {
    tr: "Türkiye'deki kazılarla ilgili haberleri yayıncıların kendi sitelerinde okuyun: aşağıdaki bağlantılar haber aramasını ve Kültür ve Turizm Bakanlığı'nın resmî sayfalarını tarayıcınızda açar.",
    en: "Read about the excavations in Türkiye on the publishers' own sites: the links below open a news search and the Ministry of Culture and Tourism's official pages in your browser.",
    de: "Lesen Sie über die Ausgrabungen in der Türkei auf den Seiten der Verlage: Die Links öffnen eine Nachrichtensuche und die offiziellen Seiten des Ministeriums für Kultur und Tourismus im Browser.",
    ru: "Читайте о раскопках в Турции на сайтах самих изданий: ссылки ниже открывают поиск новостей и официальные страницы Министерства культуры и туризма в браузере.",
  },
  news_note: {
    tr: "Uygulama haber başlığı kopyalamaz ya da göstermez; bağlantılar dış sitelerde açılır ve içerikleri yayıncılarına aittir.",
    en: "The app does not copy or show any headlines; the links open on outside sites, and the stories belong to their publishers.",
    de: "Die App übernimmt und zeigt keine Schlagzeilen; die Links öffnen externe Seiten, die Artikel gehören ihren Verlagen.",
    ru: "Приложение не копирует и не показывает заголовки; ссылки открываются на внешних сайтах, статьи принадлежат издателям.",
  },
  news_links_sub: {
    tr: "Son kazı haberleri için haber aramasını ya da resmî sayfaları açın.",
    en: "Open a news search or the official pages for the latest from the digs.",
    de: "Öffnen Sie eine Nachrichtensuche oder die offiziellen Seiten für Neues von den Grabungen.",
    ru: "Откройте поиск новостей или официальные страницы, чтобы узнать новости раскопок.",
  },
  news_search: {
    tr: "Haberlerde ara",
    en: "Search the news",
    de: "In den Nachrichten suchen",
    ru: "Искать в новостях",
  },
  news_excavations: {
    tr: "Bakanlık: kazılar ve müzeler",
    en: "Ministry: excavations and museums",
    de: "Ministerium: Grabungen und Museen",
    ru: "Министерство: раскопки и музеи",
  },
  news_museums: {
    tr: "Müzeler ve ören yerleri (resmî)",
    en: "Museums and sites (official)",
    de: "Museen und Stätten (offiziell)",
    ru: "Музеи и памятники (официально)",
  },
  news_country: {
    tr: "Türkiye arkeoloji",
    en: "Turkey archaeology",
    de: "Türkei Archäologie",
    ru: "Турция археология",
  },
  news_by_site: {
    tr: "Bir yerle ilgili haberleri ara",
    en: "Search the news about a place",
    de: "Nachrichten zu einem Ort suchen",
    ru: "Новости о конкретном месте",
  },
  nav_news_d: {
    tr: "Kazı haberlerine bağlantılar",
    en: "Links to news from the digs",
    de: "Links zu Nachrichten von den Grabungen",
    ru: "Ссылки на новости раскопок",
  },

  teacher_title: {
    tr: "Öğretmen modu",
    en: "Teacher mode",
    de: "Lehrermodus",
    ru: "Режим учителя",
  },
  teacher_sub: {
    tr: "Seçtiğin yerler için yazdırılabilir bir çalışma kâğıdı hazırla: kısa okuma metinleri, gezi sırası, çoktan seçmeli sorular ve ayrı sayfada cevap anahtarı. Sorular yalnızca verideki kesin bilgilerden üretilir.",
    en: "Make a printable worksheet for the places you choose: short readings, a trip order, multiple-choice questions and an answer key on its own page. Questions are built only from facts the data states plainly.",
    de: "Erstelle ein druckbares Arbeitsblatt für die gewählten Orte: kurze Lesetexte, eine Reiseroute, Multiple-Choice-Fragen und ein Lösungsblatt auf eigener Seite. Die Fragen beruhen nur auf eindeutigen Angaben der Daten.",
    ru: "Создайте печатный рабочий лист для выбранных мест: короткие тексты для чтения, порядок поездки, тест с вариантами ответов и ключ на отдельной странице. Вопросы строятся только на однозначных данных.",
  },
  teacher_set: {
    tr: "Hazır set",
    en: "Ready-made set",
    de: "Fertige Auswahl",
    ru: "Готовый набор",
  },
  teacher_set_pick: {
    tr: "Bölge, koleksiyon ya da medeniyet seç…",
    en: "Pick a region, collection or civilization…",
    de: "Region, Sammlung oder Kultur wählen…",
    ru: "Выберите регион, подборку или цивилизацию…",
  },
  teacher_add: { tr: "Yer ekle", en: "Add a place", de: "Ort hinzufügen", ru: "Добавить место" },
  teacher_sheet_title: {
    tr: "Kâğıt başlığı",
    en: "Sheet title",
    de: "Titel des Blatts",
    ru: "Заголовок листа",
  },
  teacher_default_title: {
    tr: "Antik Anadolu Çalışma Kâğıdı",
    en: "Ancient Anatolia Worksheet",
    de: "Arbeitsblatt Antikes Anatolien",
    ru: "Рабочий лист: Древняя Анатолия",
  },
  teacher_per_site: {
    tr: "Yer başına soru",
    en: "Questions per place",
    de: "Fragen pro Ort",
    ru: "Вопросов на место",
  },
  teacher_reading: { tr: "Okuma metni", en: "Reading", de: "Lesetext", ru: "Текст для чтения" },
  teacher_trip: {
    tr: "Gezi sırası",
    en: "Trip order",
    de: "Reihenfolge der Reise",
    ru: "Порядок поездки",
  },
  teacher_key: { tr: "Cevap anahtarı", en: "Answer key", de: "Lösungen", ru: "Ключ ответов" },
  teacher_print: { tr: "Yazdır / PDF", en: "Print / PDF", de: "Drucken / PDF", ru: "Печать / PDF" },
  teacher_new_questions: {
    tr: "Soruları karıştır",
    en: "Shuffle questions",
    de: "Fragen mischen",
    ru: "Перемешать вопросы",
  },
  teacher_preview: { tr: "Önizleme", en: "Preview", de: "Vorschau", ru: "Предпросмотр" },
  teacher_name: { tr: "Ad Soyad", en: "Name", de: "Name", ru: "Имя" },
  teacher_class: { tr: "Sınıf", en: "Class", de: "Klasse", ru: "Класс" },
  teacher_date: { tr: "Tarih", en: "Date", de: "Datum", ru: "Дата" },
  teacher_questions: { tr: "Sorular", en: "Questions", de: "Fragen", ru: "Вопросы" },
  teacher_open: {
    tr: "Gezide en çok neyi merak ettin? Neden?",
    en: "What did you most want to know on the trip? Why?",
    de: "Was wolltest du auf der Reise am meisten wissen? Warum?",
    ru: "Что вам больше всего хотелось узнать в поездке? Почему?",
  },
  teacher_trip_total: { tr: "Toplam", en: "Total", de: "Gesamt", ru: "Всего" },
  teacher_trip_note: {
    tr: "kuş uçuşu mesafe; yol daha uzundur",
    en: "straight-line distance; the road is longer",
    de: "Luftlinie; die Straße ist länger",
    ru: "по прямой; по дороге дальше",
  },
  teacher_footer: {
    tr: "Bilgiler eğitim amaçlıdır; ziyaret saatleri ve ücretler için muze.gov.tr'ye bakın.",
    en: "For teaching use; check muze.gov.tr for opening hours and fees.",
    de: "Für den Unterricht; Öffnungszeiten und Preise auf muze.gov.tr.",
    ru: "Для учебных целей; часы работы и цены — на muze.gov.tr.",
  },
  nav_teacher_d: {
    tr: "Yazdırılabilir çalışma kâğıdı ve gezi planı",
    en: "Printable worksheet and trip plan",
    de: "Druckbares Arbeitsblatt und Reiseplan",
    ru: "Печатный лист и план поездки",
  },

  // ——— Menu groups ———
  nav_group_explore: { tr: "Keşfet", en: "Explore", de: "Entdecken", ru: "Обзор" },
  nav_group_learn: { tr: "Öğren", en: "Learn", de: "Lernen", ru: "Узнать" },
  nav_group_plan: { tr: "Planla", en: "Plan", de: "Planen", ru: "Планировать" },
  nav_group_more: { tr: "Daha fazla", en: "More", de: "Mehr", ru: "Ещё" },
  nav_menu: { tr: "Menü", en: "Menu", de: "Menü", ru: "Меню" },
  nav_home_d: {
    tr: "Öne çıkanlar ve yakınındakiler",
    en: "Highlights and places near you",
    de: "Highlights und Orte in deiner Nähe",
    ru: "Главное и места рядом",
  },
  nav_profile_d: {
    tr: "İlerleme, ziyaretler ve favoriler",
    en: "Progress, visits and favourites",
    de: "Fortschritt, Besuche und Favoriten",
    ru: "Прогресс, посещения и избранное",
  },
  nav_credits_d: {
    tr: "Fotoğrafların kaynakları ve lisansları",
    en: "Where the photographs come from, and their licences",
    de: "Herkunft und Lizenzen der Fotos",
    ru: "Источники и лицензии фотографий",
  },
  theme_system_short: { tr: "Sistem", en: "System", de: "System", ru: "Авто" },
  nav_all_places: {
    tr: "Tüm yerlerde ara",
    en: "Search all places",
    de: "Alle Orte durchsuchen",
    ru: "Поиск по всем местам",
  },
  nav_ancient_d: {
    tr: "Ören yerleri ve antik şehirler",
    en: "Ruins and ancient cities",
    de: "Ruinenstätten und antike Städte",
    ru: "Руины и античные города",
  },
  nav_places_d: {
    tr: "Camiler, kaleler, kiliseler, hanlar",
    en: "Mosques, castles, churches, caravanserais",
    de: "Moscheen, Burgen, Kirchen, Karawansereien",
    ru: "Мечети, крепости, церкви, караван-сараи",
  },
  nav_museums_d: {
    tr: "Buluntuların sergilendiği müzeler",
    en: "Where the finds are on show",
    de: "Wo die Funde ausgestellt sind",
    ru: "Где выставлены находки",
  },
  nav_all_places_d: {
    tr: "Ada, ile ya da döneme göre filtrele",
    en: "Filter by name, province or period",
    de: "Nach Name, Provinz oder Epoche filtern",
    ru: "Фильтр по названию, провинции или эпохе",
  },
  nav_regions_d: {
    tr: "Yedi coğrafi bölge",
    en: "The seven geographical regions",
    de: "Die sieben geografischen Regionen",
    ru: "Семь географических регионов",
  },
  nav_collections_d: {
    tr: "Temalı seçkiler",
    en: "Themed selections",
    de: "Thematische Auswahl",
    ru: "Тематические подборки",
  },
  nav_reconstructions_d: {
    tr: "Yapıların ilk hâli, 3D ve AR",
    en: "Buildings as they stood, in 3D and AR",
    de: "Bauten, wie sie einst standen, in 3D und AR",
    ru: "Здания такими, какими были, в 3D и AR",
  },
  nav_stories_d: {
    tr: "Antik çağda bir gün, seçimli hikâyeler",
    en: "A day in antiquity, choose your path",
    de: "Ein Tag in der Antike, mit Entscheidungen",
    ru: "Один день в древности, с выбором пути",
  },
  nav_games_d: {
    tr: "Bilgi yarışmaları ve XP",
    en: "Quizzes and XP",
    de: "Quiz und XP",
    ru: "Викторины и XP",
  },
  nav_route_d: {
    tr: "Gezi planı ve yol boyu rehber",
    en: "Trip plan and audio for the road",
    de: "Reiseplan und Audioguide für unterwegs",
    ru: "План поездки и аудиогид в дорогу",
  },
  nav_map_d: {
    tr: "Tüm yerler tek haritada",
    en: "Every place on one map",
    de: "Alle Orte auf einer Karte",
    ru: "Все места на одной карте",
  },
  nav_language: { tr: "Dil", en: "Language", de: "Sprache", ru: "Язык" },
  nav_close: { tr: "Kapat", en: "Close", de: "Schließen", ru: "Закрыть" },
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
    tr: "Bu görsel temsilidir — buranın fotoğrafı henüz yok; yerine uygulamanın 3B sahnelerinden genel bir manzara görüntüsü gösteriliyor.",
    en: "This image is a stand-in — there is no photograph of this place yet, so a generic landscape rendered from the app's 3D scenes is shown instead.",
  },
  photo_contribute: {
    tr: "Oradaysan Wikimedia Commons'a özgür lisanslı bir fotoğraf ekleyebilirsin.",
    en: "Been there? Add a freely licensed photo to Wikimedia Commons.",
    de: "Warst du dort? Lade ein frei lizenziertes Foto auf Wikimedia Commons hoch.",
    ru: "Были там? Добавьте фото со свободной лицензией на Викисклад.",
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
  offline_download_pack: {
    tr: "Bölge paketini indir",
    en: "Download the region pack",
    de: "Regionspaket herunterladen",
    ru: "Скачать пакет региона",
  },
  offline_download_route: {
    tr: "Rotayı indir",
    en: "Download the route",
    de: "Route herunterladen",
    ru: "Скачать маршрут",
  },
  offline_update: {
    tr: "Paketi güncelle",
    en: "Update the pack",
    de: "Paket aktualisieren",
    ru: "Обновить пакет",
  },
  offline_saved_on: {
    tr: "İndirildi:",
    en: "Downloaded:",
    de: "Heruntergeladen:",
    ru: "Скачано:",
  },
  offline_region_title: {
    tr: "Bölge paketi",
    en: "Region pack",
    de: "Regionspaket",
    ru: "Пакет региона",
  },
  offline_region_sub: {
    tr: "Bu bölgedeki {n} yerin sayfalarını, fotoğraflarını, kayıtlı sesli rehberini ve 3D taramalarını bir kerede indir; yolda şebeke olmasa da çalışır.",
    en: "Download the pages, photographs, recorded audio guide and 3D scans of the {n} places in this region in one go; they keep working with no signal on the road.",
    de: "Lade Seiten, Fotos, aufgenommenen Audioguide und 3D-Scans der {n} Orte dieser Region auf einmal herunter; unterwegs funktionieren sie auch ohne Netz.",
    ru: "Скачайте сразу страницы, фотографии, записанный аудиогид и 3D-сканы {n} мест этого региона — они будут работать в дороге и без связи.",
  },
  offline_route_sub: {
    tr: "Rotadaki kentleri sesli rehberleriyle birlikte indir; yolda şebeke olmasa da dinleyebilirsin.",
    en: "Download the cities on this route with their audio guides, so they play on the road with no signal.",
    de: "Lade die Städte dieser Route samt Audioguides herunter, damit sie unterwegs auch ohne Netz laufen.",
    ru: "Скачайте города маршрута вместе с аудиогидами, чтобы слушать их в дороге без связи.",
  },

  // ——— Passport ———
  passport_title: {
    tr: "Dijital pasaport",
    en: "Digital passport",
    de: "Digitaler Reisepass",
    ru: "Цифровой паспорт",
  },
  passport_sub: {
    tr: "Ören yerine gittiğinde konumunla damga al. Damgalar yalnızca bu cihazda saklanır.",
    en: "Collect a stamp with your location when you are at the site. Stamps are kept on this device only.",
    de: "Hol dir vor Ort mit deinem Standort einen Stempel. Stempel werden nur auf diesem Gerät gespeichert.",
    ru: "Получите штамп по геолокации, когда будете на месте. Штампы хранятся только на этом устройстве.",
  },
  passport_stamp: {
    tr: "Pasaport damgası al",
    en: "Get a passport stamp",
    de: "Passstempel holen",
    ru: "Получить штамп",
  },
  passport_checking: {
    tr: "Konum kontrol ediliyor…",
    en: "Checking your location…",
    de: "Standort wird geprüft…",
    ru: "Проверяем местоположение…",
  },
  passport_stamped: {
    tr: "Damgalandı",
    en: "Stamped",
    de: "Gestempelt",
    ru: "Штамп получен",
  },
  passport_stamp_ok: {
    tr: "Damga pasaportuna eklendi.",
    en: "Stamp added to your passport.",
    de: "Stempel in deinen Pass eingetragen.",
    ru: "Штамп добавлен в паспорт.",
  },
  passport_too_far: {
    tr: "Damga için ören yerinde olman gerekiyor. Şu an yaklaşık {km} km uzaktasın.",
    en: "You need to be at the site for a stamp. You are about {km} km away.",
    de: "Für einen Stempel musst du vor Ort sein. Du bist etwa {km} km entfernt.",
    ru: "Для штампа нужно быть на месте. Сейчас вы примерно в {km} км.",
  },
  passport_no_location: {
    tr: "Konum alınamadı. Konum iznini açıp tekrar dene.",
    en: "Could not get your location. Allow location access and try again.",
    de: "Standort nicht verfügbar. Erlaube den Standortzugriff und versuche es erneut.",
    ru: "Не удалось определить местоположение. Разрешите доступ и попробуйте снова.",
  },
  passport_empty: {
    tr: "Henüz damga yok. Bir ören yerine gittiğinde kent sayfasından damga al.",
    en: "No stamps yet. When you are at a site, collect one from its page.",
    de: "Noch keine Stempel. Hol dir vor Ort einen auf der Seite des Ortes.",
    ru: "Штампов пока нет. Получите штамп на странице места, когда будете там.",
  },
  passport_stamps: {
    tr: "damga",
    en: "stamps",
    de: "Stempel",
    ru: "штампов",
  },
  passport_share: {
    tr: "Kartımı paylaş",
    en: "Share my card",
    de: "Meine Karte teilen",
    ru: "Поделиться карточкой",
  },
  passport_card_visited: {
    tr: "ziyaret edilen yer",
    en: "places visited",
    de: "besuchte Orte",
    ru: "посещённых мест",
  },
  passport_card_badges: {
    tr: "rozet",
    en: "badges",
    de: "Abzeichen",
    ru: "значков",
  },

  // ——— Route audio ———
  route_audio_title: {
    tr: "Yol boyu sesli rehber",
    en: "Audio guide for the road",
    de: "Audioguide für unterwegs",
    ru: "Аудиогид в дорогу",
  },
  route_audio_sub: {
    tr: "Rotadaki her durağın rehberi sırayla çalar; duraklar arasında sıradaki yeri ve mesafeyi söyler.",
    en: "Each stop's guide plays in order, with the next place and the distance announced between stops.",
    de: "Die Führungen der Stationen laufen nacheinander; dazwischen werden der nächste Ort und die Entfernung angesagt.",
    ru: "Гиды всех остановок звучат по порядку, а между ними объявляются следующее место и расстояние.",
  },
  route_audio_short: {
    tr: "Öne çıkanlar",
    en: "Highlights",
    de: "Höhepunkte",
    ru: "Главное",
  },
  route_audio_full: {
    tr: "Tam rehber",
    en: "Full guide",
    de: "Vollständig",
    ru: "Полностью",
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
    tr: "Sürükleyerek döndür, tekerlekle istediğin noktaya yaklaş, sağ tık ya da iki parmakla kaydır. Çift tıkla tam ekran.",
    en: "Drag to orbit, scroll to zoom into any spot, right-drag or two fingers to pan. Double-click for full screen.",
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
  recon_fullscreen: { tr: "Tam ekran", en: "Full screen" },
  recon_fullscreen_exit: { tr: "Tam ekrandan çık", en: "Exit full screen" },
  recon_walk: { tr: "Gez", en: "Walk" },
  recon_walk_exit: { tr: "Gezmeyi bitir", en: "Stop walking" },
  recon_walk_hint_keys: {
    tr: "W A S D ya da oklarla yürü, sürükleyerek etrafa bak, tekerlekle ileri-geri git. E yüksel, Q alçal, Shift koş.",
    en: "Walk with W A S D or the arrow keys, drag to look around, scroll to step forward or back. E rises, Q sinks, Shift runs.",
  },
  recon_walk_hint_touch: {
    tr: "Soldaki kolla yürü, ekranı sürükleyerek etrafa bak.",
    en: "Walk with the stick, drag the screen to look around.",
  },
  recon_move_forward: { tr: "İleri", en: "Forward" },
  recon_move_back: { tr: "Geri", en: "Back" },
  recon_move_left: { tr: "Sola", en: "Left" },
  recon_move_right: { tr: "Sağa", en: "Right" },
  recon_loading: { tr: "Model hazırlanıyor…", en: "Building the model…" },
  recon_scale: {
    tr: "Sahnedeki insanlar ölçek verir: yapının gerçek boyutunu onlara bakarak okuyabilirsin.",
    en: "The people in the scene give the scale: read the building's real size against them.",
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
  guide_recorded: {
    tr: "Kayıtlı ses",
    en: "Recorded voice",
    de: "Aufgenommene Stimme",
    ru: "Записанный голос",
  },
  guide_voice_by: {
    tr: "Anlatım, açık kaynak Piper yapay sesiyle kaydedildi:",
    en: "Narration recorded with an open-source Piper synthetic voice:",
    de: "Erzählung mit einer quelloffenen synthetischen Piper-Stimme aufgenommen:",
    ru: "Озвучено синтезированным голосом Piper с открытым кодом:",
  },
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
  ambience_off: { tr: "Ortam sesini kapat", en: "Mute ambience" },
  ambience_hint: {
    tr: "Mekânın sesleri: tiyatroda seyirci, alkış ve sahneden müzik; hipodromda dörtnala atlar ve kalabalığın coşkusu; tapınakta aulos, davul ve kurbanlık hayvanlar; agorada pazar. Gerçek kayıtlar ve tarayıcıda üretilen sesler; anlatım başlayınca kısılır.",
    en: "The sounds of the place: the audience, applause and music from the stage in a theatre; galloping teams and a roaring crowd at the races; pipes, drum and the victims at a temple; the market in the agora. Real recordings and sound made in the browser; it dips when the narrator speaks.",
  },
  ambience_credit: {
    tr: "Ortam sesleri: freesound.org'dan kamu malı (CC0) kayıtlar (ESC-50, Sonic Pi, Minetest) ve bu uygulama için sentezlenmiş sesler ve müzik.",
    en: "Ambient sound: public-domain (CC0) recordings from freesound.org (ESC-50, Sonic Pi, Minetest) and sounds and music synthesised for this app.",
  },
  ambience_credit_all: { tr: "Tüm kaynaklar", en: "All sources" },

  // ————— Realism / AR / compare —————
  recon_life_show: { tr: "Yaşamı göster", en: "Show daily life" },
  recon_life_hide: { tr: "Yaşamı gizle", en: "Hide daily life" },
  recon_life_hint: {
    tr: "Dönemin kıyafetleriyle insanlar, meşaleler, sunak ateşleri ve eşyalar. Gece ışığında meşaleler yanar.",
    en: "People in period dress, torches, altar fires and furnishings. Switch to night to see the torches lit.",
  },
  recon_life_note: {
    tr: "İnsanlar, ateşler ve eşyalar dönemin giyim ve kullanımına göre canlandırılmış bir sahnedir; ölçülmüş yapının parçası değildir.",
    en: "The people, fires and furnishings are an illustration based on the dress and customs of the period, not part of the measured building.",
  },
  recon_detail_note: {
    tr: "Yazıtlar harf biçimli kesik dizileri olarak gösterilir; metinleri yeniden üretilmemiştir. Çatı kiremitleri, mermerdeki soluk boya izleri ve pazar tezgâhları da ölçü değil, dönemin yapı ve renk alışkanlıklarından çıkarılmış yorumdur.",
    en: "Inscriptions are shown as rows of letter-shaped cuts; their texts are not reproduced. The roof tiles, the faded traces of paint on the marble and the market stalls are likewise interpretation drawn from the building and painting habits of the period, not measurement.",
  },
  recon_face_credit: {
    tr: "Heykel yüzlerinin temeli gerçek bir insan başı taramasıdır: “Infinite, 3D Head Scan”, Lee Perry-Smith (ir-ltd.net), CC BY 3.0. Her heykel bu yüzü kendine göre yeniden biçimlendirir.",
    en: "The statues' faces are built on a real head scan: “Infinite, 3D Head Scan” by Lee Perry-Smith (ir-ltd.net), CC BY 3.0. Each statue reshapes it into its own face.",
  },
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
  /* The simplified header, its side menu, the home page's 3D shelf, the
     browse list's filter sheet and the 3D view's control bar. */
  nav_menu_open: { tr: "Menüyü aç", en: "Open menu", de: "Menü öffnen", ru: "Открыть меню" },
  nav_settings: { tr: "Ayarlar", en: "Settings", de: "Einstellungen", ru: "Настройки" },
  nav_theme: { tr: "Tema", en: "Theme", de: "Design", ru: "Тема" },
  theme_light_short: { tr: "Açık", en: "Light", de: "Hell", ru: "Светлая" },
  theme_dark_short: { tr: "Koyu", en: "Dark", de: "Dunkel", ru: "Тёмная" },
  home_3d_kicker: {
    tr: "3B'de keşfet",
    en: "Explore in 3D",
    de: "In 3D entdecken",
    ru: "Исследуйте в 3D",
  },
  home_3d_title: {
    tr: "Antik yapıların içinde dolaş",
    en: "Walk inside ancient buildings",
    de: "Durch antike Bauwerke gehen",
    ru: "Прогуляйтесь внутри античных зданий",
  },
  home_3d_walk: { tr: "İçinde gez", en: "Walk inside", de: "Begehen", ru: "Войти" },
  filter_button: { tr: "Filtrele", en: "Filter", de: "Filtern", ru: "Фильтры" },
  filter_show: {
    tr: "Sonuçları göster",
    en: "Show results",
    de: "Ergebnisse anzeigen",
    ru: "Показать результаты",
  },
  filter_reset: { tr: "Sıfırla", en: "Reset", de: "Zurücksetzen", ru: "Сбросить" },
  filter_remove: {
    tr: "Filtreyi kaldır",
    en: "Remove filter",
    de: "Filter entfernen",
    ru: "Убрать фильтр",
  },
  filter_other: { tr: "Diğer", en: "Other", de: "Weitere", ru: "Другое" },
  recon_more: { tr: "Diğer seçenekler", en: "More options", de: "Weitere Optionen", ru: "Ещё" },
  recon_ctl_labels: { tr: "Etiketler", en: "Labels", de: "Beschriftung", ru: "Подписи" },
  recon_ctl_people: { tr: "İnsanlar", en: "People", de: "Menschen", ru: "Люди" },
  recon_ctl_sound: { tr: "Ses", en: "Sound", de: "Ton", ru: "Звук" },
  recon_ctl_quality: { tr: "Kalite", en: "Quality", de: "Qualität", ru: "Качество" },
  recon_ctl_view: { tr: "Görünüm", en: "View", de: "Ansicht", ru: "Вид" },
  recon_light_sunset: { tr: "Gün batımı", en: "Sunset", de: "Abend", ru: "Закат" },
  recon_joystick: {
    tr: "Yürüme kolu: yürümek için kaydır",
    en: "Walking stick: slide to walk",
    de: "Steuerknüppel: zum Gehen schieben",
    ru: "Джойстик: сдвиньте, чтобы идти",
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
