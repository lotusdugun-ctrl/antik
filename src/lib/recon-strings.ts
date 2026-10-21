import type { Localized } from "@/lib/i18n";

/**
 * The words of the 3D viewer's newer controls — the guided tour, the people
 * who talk, photo mode, the weather, quests, scale and the light setting —
 * kept beside the viewer rather than in the shared dictionary, in all four
 * languages, read with `L()`.
 */
const s = (tr: string, en: string, de: string, ru: string): Localized => ({ tr, en, de, ru });

export const RS = {
  tour: s("Rehberli tur", "Guided tour", "Geführte Tour", "Экскурсия"),
  tourHint: s(
    "Kamera parçadan parçaya uçar, sesli rehber her birini anlatır.",
    "The camera flies from part to part while the audio guide tells each one.",
    "Die Kamera fliegt von Teil zu Teil, während der Audioguide jedes erklärt.",
    "Камера облетает часть за частью, а аудиогид рассказывает о каждой.",
  ),
  tourPause: s("Duraklat", "Pause", "Pause", "Пауза"),
  tourResume: s("Devam et", "Resume", "Weiter", "Продолжить"),
  tourNext: s("Sonraki durak", "Next stop", "Nächster Halt", "Следующая остановка"),
  tourPrev: s("Önceki durak", "Previous stop", "Vorheriger Halt", "Предыдущая остановка"),
  tourExit: s("Turu bitir", "End tour", "Tour beenden", "Завершить экскурсию"),
  tourDone: s("Tur bitti.", "The tour is over.", "Die Tour ist zu Ende.", "Экскурсия окончена."),
  tourSilent: s(
    "Bu cihazda ses yok; tur yazıyla ilerliyor.",
    "No voice on this device; the tour goes on in text.",
    "Keine Stimme auf diesem Gerät; die Tour läuft als Text weiter.",
    "На этом устройстве нет голоса — экскурсия идёт текстом.",
  ),
  personListen: s("Sesli dinle", "Read aloud", "Vorlesen", "Озвучить"),
  personClose: s("Kapat", "Close", "Schließen", "Закрыть"),
  personNote: s(
    "Kurgusal bir ses; dönemin genel bilgisine dayanır.",
    "A fictional voice, drawn from what is generally known of the period.",
    "Eine erfundene Stimme, gestützt auf das, was über die Zeit allgemein bekannt ist.",
    "Вымышленный голос, основанный на общеизвестных сведениях об эпохе.",
  ),
  personHint: s(
    "Sahnedeki birine dokun: sana ne anlattığını gör.",
    "Tap someone in the scene to hear what they have to say.",
    "Tippe jemanden in der Szene an, um zu hören, was er erzählt.",
    "Коснитесь кого-нибудь в сцене, чтобы услышать его рассказ.",
  ),
  gyro: s("Telefonla bak", "Look with phone", "Mit dem Handy umsehen", "Обзор телефоном"),
  gyroRecentre: s("Ufku düzelt", "Level the view", "Blick ausrichten", "Выровнять вид"),
  gyroDenied: s(
    "Hareket sensörüne izin verilmedi.",
    "Motion sensor access was not allowed.",
    "Der Zugriff auf den Bewegungssensor wurde nicht erlaubt.",
    "Доступ к датчику движения не разрешён.",
  ),
  gyroUnavailable: s(
    "Bu cihazdan hareket sensörü okunamıyor.",
    "This device's motion sensor cannot be read.",
    "Der Bewegungssensor dieses Geräts lässt sich nicht lesen.",
    "Датчик движения этого устройства недоступен.",
  ),
  photo: s("Fotoğraf modu", "Photo mode", "Fotomodus", "Фоторежим"),
  photoTake: s("Fotoğraf çek", "Take photo", "Foto aufnehmen", "Сделать снимок"),
  photoExit: s(
    "Fotoğraf modundan çık",
    "Leave photo mode",
    "Fotomodus verlassen",
    "Выйти из фоторежима",
  ),
  photoVignette: s("Vinyet", "Vignette", "Vignette", "Виньетка"),
  photoDof: s("Alan derinliği", "Depth of field", "Schärfentiefe", "Глубина резкости"),
  photoLight: s("Işık", "Light", "Licht", "Свет"),
  photoSaved: s("Fotoğraf kaydedildi.", "Photo saved.", "Foto gespeichert.", "Снимок сохранён."),
  photoFailed: s(
    "Fotoğraf alınamadı.",
    "The photo could not be taken.",
    "Das Foto konnte nicht aufgenommen werden.",
    "Не удалось сделать снимок.",
  ),
  photoHint: s(
    "Görüntüyü çerçevele, sonra deklanşöre bas.",
    "Frame the view, then press the shutter.",
    "Wähle den Ausschnitt, dann drück den Auslöser.",
    "Выберите кадр и нажмите на затвор.",
  ),
  timeFlow: s("Zaman aksın", "Time passes", "Zeit vergeht", "Время идёт"),
  timeFlowHint: s(
    "Gündüz, gün batımı ve gece yavaşça birbirine geçer.",
    "Day, sunset and night slowly turn into one another.",
    "Tag, Abend und Nacht gehen langsam ineinander über.",
    "День, закат и ночь медленно сменяют друг друга.",
  ),
  weather: s("Hava", "Weather", "Wetter", "Погода"),
  weatherClouds: s("Bulutlu", "Drifting clouds", "Ziehende Wolken", "Облака"),
  weatherMist: s("Sabah sisi", "Morning mist", "Morgennebel", "Утренний туман"),
  weatherDust: s("Toz rüzgârı", "Dust gusts", "Staubböen", "Пыльный ветер"),
  scale: s("Ölçek karşılaştırması", "Scale comparison", "Größenvergleich", "Сравнение масштаба"),
  scaleHint: s(
    "Yapının yanına bugünden tanıdık şeyler koyar.",
    "Puts familiar modern things beside the building.",
    "Stellt vertraute Dinge von heute neben das Bauwerk.",
    "Ставит рядом со зданием знакомые современные объекты.",
  ),
  scalePerson: s("İnsan · 1,75 m", "Person · 1.75 m", "Mensch · 1,75 m", "Человек · 1,75 м"),
  scaleBus: s(
    "Şehir otobüsü · 12 m",
    "City bus · 12 m",
    "Stadtbus · 12 m",
    "Городской автобус · 12 м",
  ),
  scaleBlock: s(
    "10 katlı apartman · 30 m",
    "10-storey block · 30 m",
    "10-stöckiges Wohnhaus · 30 m",
    "10-этажный дом · 30 м",
  ),
  scalePitch: s(
    "Futbol sahası · 105 × 68 m",
    "Football pitch · 105 × 68 m",
    "Fußballfeld · 105 × 68 m",
    "Футбольное поле · 105 × 68 м",
  ),
  lite: s("Hafif mod", "Lite mode", "Sparmodus", "Облегчённый режим"),
  liteHint: s(
    "Daha az ayrıntı, daha akıcı hareket: zayıf telefonlar için.",
    "Less detail, smoother motion: for weaker phones.",
    "Weniger Details, flüssigere Bewegung: für schwächere Handys.",
    "Меньше деталей, плавнее движение — для слабых телефонов.",
  ),
  liteAuto: s(
    "Bu cihaz için hafif mod açıldı.",
    "Lite mode is on for this device.",
    "Für dieses Gerät ist der Sparmodus an.",
    "Для этого устройства включён облегчённый режим.",
  ),
  liteHigh: s("Yüksek kalite", "High quality", "Hohe Qualität", "Высокое качество"),
  quests: s("Görevler", "Quests", "Aufgaben", "Задания"),
  questsTitle: s(
    "Keşif görevleri",
    "Discovery quests",
    "Entdeckungsaufgaben",
    "Исследовательские задания",
  ),
  questsHint: s(
    "Gezerken yerleri bul; gittiğin ya da baktığın anda tamamlanır.",
    "Find the places as you walk; each is done the moment you reach or look at it.",
    "Finde die Orte beim Gehen; jede Aufgabe ist erledigt, sobald du dort bist oder hinsiehst.",
    "Находите места на прогулке: задание засчитывается, как только вы дойдёте или посмотрите.",
  ),
  questDone: s("Görev tamamlandı!", "Quest complete!", "Aufgabe erledigt!", "Задание выполнено!"),
  questsAll: s(
    "Hepsi tamam — rozet kazandın!",
    "All done — you earned a badge!",
    "Alles erledigt — du hast ein Abzeichen!",
    "Всё выполнено — вы получили значок!",
  ),
  questsWalk: s(
    "Görevler gezerken sayılır: Gez'e bas.",
    "Quests count while walking: press Walk.",
    "Aufgaben zählen beim Gehen: tippe auf Begehen.",
    "Задания засчитываются на прогулке: нажмите «Прогулка».",
  ),
  questsProfile: s(
    "Keşif görevleri",
    "Discovery quests",
    "Entdeckungsaufgaben",
    "Исследовательские задания",
  ),
  questsProfileLine: s(
    "{q} görev tamamlandı · {b} rozet",
    "Quests done: {q} · badges: {b}",
    "Erledigte Aufgaben: {q} · Abzeichen: {b}",
    "Выполнено заданий: {q} · значков: {b}",
  ),
  compareCredit: s("Bugünkü fotoğraf:", "Today's photo:", "Heutiges Foto:", "Современное фото:"),
  watermark: s("Antik Türkiye", "Antik Türkiye", "Antik Türkiye", "Antik Türkiye"),
};

/** Fills `{name}` slots in a translated string. */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (all, key: string) => (key in values ? String(values[key]) : all));
