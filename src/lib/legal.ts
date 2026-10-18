import type { Lang } from "@/lib/i18n";

/**
 * The privacy policy (/gizlilik) and the terms of use (/kosullar), in the
 * four languages of the app. Written to match what the code actually does —
 * if a feature starts sending something new anywhere, this has to change with
 * it, and so do the Data safety answers in docs/PLAY_STORE.md.
 */
export const OPERATOR = "Iova LTD";
export const CONTACT_EMAIL = "info@passrank.app";
export const LEGAL_UPDATED = "2026-10-18";

export type LegalSection = { h: string; p: string[] };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

const privacy: Record<Lang, LegalDoc> = {
  tr: {
    title: "Gizlilik politikası",
    intro: `Antik Türkiye uygulaması ve web sitesi ${OPERATOR} tarafından işletilir. Hesap yoktur; adınızı, e-postanızı ya da telefonunuzu istemeyiz. Bu sayfa hangi verinin nereye gittiğini anlatır.`,
    sections: [
      {
        h: "Cihazınızda kalanlar",
        p: [
          "Ziyaret ettiğiniz ve beğendiğiniz yerler, pasaport damgaları, ziyaret notları ve eklediğiniz fotoğraflar, dil ve tema tercihi, çevrimdışı kullanım için indirilen sayfalar ve sesler yalnızca cihazınızın tarayıcı depolamasında (localStorage, önbellek) tutulur. Bunları biz görmeyiz; tarayıcı verilerini silerek ya da uygulamayı kaldırarak silebilirsiniz.",
          'Konum ("yakınımdakiler", sesli rehberde varınca çalma) yalnızca siz izin verirseniz cihazda kullanılır; sunucumuza gönderilmez. Kamera yalnızca AR görünümünde, cihazın kendi AR görüntüleyicisinde kullanılır.',
        ],
      },
      {
        h: 'Yapay zekâ rehber ("Rehbere sor")',
        p: [
          "Sorduğunuz soru, bulunduğunuz yer sayfası, dil ve aynı oturumdaki son birkaç soru-cevap sunucumuz üzerinden Google LLC'nin Gemini API'sine gönderilir ve cevap oradan gelir. Cevap için Google Arama da kullanılabilir. Gemini API'nin ücretsiz katmanında Google, gönderilen içeriği ürünlerini geliştirmek için kullanabilir ve insanlar tarafından incelenebilir; bu yüzden sorularınıza kişisel bilgi yazmayın. Google'ın gizlilik politikası: https://policies.google.com/privacy",
          "Kötüye kullanımı önlemek için IP adresiniz en fazla 24 saat, yalnızca sunucu belleğinde istek sayacı olarak tutulur; kaydedilmez.",
          "Mikrofonla soru sorarsanız konuşma tanıma tarayıcınızın/işletim sisteminizin hizmetiyle yapılır ve o sağlayıcının kurallarına tabidir.",
        ],
      },
      {
        h: "Yapay zekâ cevabını bildirme",
        p: [
          'Bir cevabı "Bildir" ile işaretlerseniz seçtiğiniz neden, yazdığınız not, sorunun ve cevabın kısa birer alıntısı, yer ve dil sunucu günlüğümüze yazılır. IP adresi ya da kimlik bilgisi eklenmez. Bu kayıtlar yalnızca cevapları incelemek ve rehberi düzeltmek için kullanılır ve en fazla 12 ay saklanır.',
        ],
      },
      {
        h: "Üçüncü taraf hizmetler",
        p: [
          "Sayfalar açılırken cihazınız şu hizmetlerden doğrudan içerik indirir ve bu sırada IP adresiniz onlara görünür: Wikimedia Commons (fotoğraflar), OpenStreetMap (harita), Google Fonts (yazı tipleri), GitHub Pages (kayıtlı sesler). Rota planlarken seçtiğiniz yerlerin koordinatları sürüş mesafesi için OSRM hizmetine gönderilir. Haber bağlantıları Google Haberler'i ve Bakanlık sayfalarını tarayıcınızda açar.",
          'Kullanım istatistiği açıksa çerezsiz, kişisel veri içermeyen Plausible sayımı kullanılır (sayfa görüntüleme ve "rehber çalındı" gibi olaylar). Reklam yoktur; veriler satılmaz ya da paylaşılmaz.',
          "Sunucu, barındırma sağlayıcımızın standart erişim günlüklerini (IP, zaman, adres) kısa süre tutabilir.",
        ],
      },
      {
        h: "Çocuklar",
        p: [
          "Uygulama genel kitleye yöneliktir; çocuklardan bilerek kişisel veri toplamayız. Yapay zekâ rehberini kullanan öğrencilere kişisel bilgi yazmamaları söylenmelidir.",
        ],
      },
      {
        h: "Haklarınız ve iletişim",
        p: [
          `Sorularınız, silme ya da erişim talepleriniz için: ${CONTACT_EMAIL}. Hesap olmadığı için sizi tanımlayan bir kayıt tutmayız; bir bildirimin silinmesini isterseniz tarihini ve içeriğini yazmanız yeterli.`,
          `Bu politika değişirse bu sayfa güncellenir. Son güncelleme: ${LEGAL_UPDATED}.`,
        ],
      },
    ],
  },
  en: {
    title: "Privacy policy",
    intro: `The Antik Türkiye app and website are operated by ${OPERATOR}. There are no accounts; we never ask for your name, email or phone number. This page explains what data goes where.`,
    sections: [
      {
        h: "What stays on your device",
        p: [
          "Places you visited or saved, passport stamps, visit notes and photos you add, your language and theme, and pages and audio downloaded for offline use are kept only in your browser's storage on your device (localStorage, cache). We never see them; clearing site data or uninstalling the app deletes them.",
          'Location ("near me", playing the audio guide on arrival) is used on the device only, and only if you allow it; it is not sent to our server. The camera is used only by the AR view, in your device\'s own AR viewer.',
        ],
      },
      {
        h: 'The AI guide ("Ask the guide")',
        p: [
          "Your question, the place page you are on, the language and the last few questions and answers of the conversation are sent through our server to Google LLC's Gemini API, which writes the answer; Google Search may be used to ground it. On the Gemini API's free tier Google may use submitted content to improve its products and it may be read by human reviewers, so do not put personal information in your questions. Google's privacy policy: https://policies.google.com/privacy",
          "To prevent abuse your IP address is held for at most 24 hours in server memory as a request counter; it is not stored.",
          "If you ask by voice, speech recognition is done by your browser's or operating system's service and is subject to that provider's terms.",
        ],
      },
      {
        h: "Reporting an AI answer",
        p: [
          'If you flag an answer with "Report", the reason you chose, your note, short excerpts of the question and the answer, the place and the language are written to our server log. No IP address or identifier is added. These reports are used only to review answers and improve the guide, and are kept for at most 12 months.',
        ],
      },
      {
        h: "Third-party services",
        p: [
          "As pages load, your device fetches content directly from these services, which therefore see your IP address: Wikimedia Commons (photos), OpenStreetMap (map), Google Fonts (fonts), GitHub Pages (recorded audio). When you plan a route, the coordinates of the chosen places are sent to the OSRM routing service for driving distances. News links open Google News and the Ministry's pages in your browser.",
          'If usage statistics are enabled, we use cookieless Plausible counts that contain no personal data (page views and events such as "guide played"). There are no ads; data is not sold or shared.',
          "Our hosting provider may keep standard access logs (IP address, time, URL) for a short time.",
        ],
      },
      {
        h: "Children",
        p: [
          "The app is for a general audience and we do not knowingly collect personal data from children. Pupils using the AI guide should be told not to type personal information.",
        ],
      },
      {
        h: "Your rights and contact",
        p: [
          `For questions, access or deletion requests write to ${CONTACT_EMAIL}. As there are no accounts we hold no record that identifies you; to have a report deleted, tell us its date and content.`,
          `If this policy changes, this page is updated. Last updated: ${LEGAL_UPDATED}.`,
        ],
      },
    ],
  },
  de: {
    title: "Datenschutzerklärung",
    intro: `Die App und Website Antike Türkei werden von ${OPERATOR} betrieben. Es gibt keine Konten; wir fragen nie nach Name, E-Mail oder Telefonnummer. Hier steht, welche Daten wohin gehen.`,
    sections: [
      {
        h: "Was auf Ihrem Gerät bleibt",
        p: [
          "Besuchte und gemerkte Orte, Passstempel, Besuchsnotizen und hinzugefügte Fotos, Sprache und Design sowie für die Offline-Nutzung geladene Seiten und Audios werden nur im Browserspeicher Ihres Geräts gehalten (localStorage, Cache). Wir sehen sie nie; Löschen der Websitedaten oder Deinstallation entfernt sie.",
          "Der Standort („in meiner Nähe“, Abspielen des Audioguides bei Ankunft) wird nur auf dem Gerät und nur mit Ihrer Erlaubnis verwendet und nicht an unseren Server gesendet. Die Kamera nutzt nur die AR-Ansicht im AR-Viewer Ihres Geräts.",
        ],
      },
      {
        h: "Der KI-Guide („Frag den Guide“)",
        p: [
          "Ihre Frage, die geöffnete Ortsseite, die Sprache und die letzten Fragen und Antworten des Gesprächs werden über unseren Server an die Gemini API von Google LLC gesendet, die die Antwort erstellt; dabei kann die Google-Suche genutzt werden. In der kostenlosen Stufe der Gemini API darf Google übermittelte Inhalte zur Verbesserung seiner Produkte verwenden, und sie können von Menschen geprüft werden – geben Sie daher keine persönlichen Daten in Fragen ein. Datenschutz bei Google: https://policies.google.com/privacy",
          "Zum Schutz vor Missbrauch wird Ihre IP-Adresse höchstens 24 Stunden als Anfragezähler im Serverspeicher gehalten, nicht gespeichert.",
          "Bei Spracheingabe erfolgt die Spracherkennung durch den Dienst Ihres Browsers bzw. Betriebssystems nach dessen Bedingungen.",
        ],
      },
      {
        h: "KI-Antworten melden",
        p: [
          "Wenn Sie eine Antwort mit „Melden“ markieren, werden der gewählte Grund, Ihre Notiz, kurze Auszüge aus Frage und Antwort, Ort und Sprache in unser Serverprotokoll geschrieben. Es wird keine IP-Adresse oder Kennung hinzugefügt. Die Meldungen dienen nur der Prüfung der Antworten und werden höchstens 12 Monate aufbewahrt.",
        ],
      },
      {
        h: "Dienste Dritter",
        p: [
          "Beim Laden der Seiten ruft Ihr Gerät Inhalte direkt von diesen Diensten ab, die dabei Ihre IP-Adresse sehen: Wikimedia Commons (Fotos), OpenStreetMap (Karte), Google Fonts (Schriften), GitHub Pages (aufgenommene Audios). Bei der Routenplanung werden die Koordinaten der gewählten Orte für Fahrstrecken an den Routingdienst OSRM gesendet. Nachrichtenlinks öffnen Google News und die Seiten des Ministeriums in Ihrem Browser.",
          "Falls Nutzungsstatistiken aktiviert sind, verwenden wir cookielose Plausible-Zählungen ohne personenbezogene Daten. Es gibt keine Werbung; Daten werden weder verkauft noch weitergegeben.",
          "Unser Hosting-Anbieter kann übliche Zugriffsprotokolle (IP, Zeit, Adresse) kurzzeitig speichern.",
        ],
      },
      {
        h: "Kinder",
        p: [
          "Die App richtet sich an ein allgemeines Publikum; wir erheben wissentlich keine personenbezogenen Daten von Kindern.",
        ],
      },
      {
        h: "Ihre Rechte und Kontakt",
        p: [
          `Für Fragen, Auskunfts- oder Löschanfragen: ${CONTACT_EMAIL}. Da es keine Konten gibt, halten wir keine Daten, die Sie identifizieren; zum Löschen einer Meldung nennen Sie Datum und Inhalt.`,
          `Bei Änderungen wird diese Seite aktualisiert. Stand: ${LEGAL_UPDATED}.`,
        ],
      },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    intro: `Приложением и сайтом «Античная Турция» управляет ${OPERATOR}. Учётных записей нет; мы не запрашиваем имя, e-mail или телефон. Здесь описано, какие данные и куда передаются.`,
    sections: [
      {
        h: "Что остаётся на устройстве",
        p: [
          "Посещённые и избранные места, штампы паспорта, заметки и добавленные фото, язык и тема, а также страницы и аудио, загруженные для офлайн-режима, хранятся только в хранилище браузера на вашем устройстве (localStorage, кэш). Мы их не видим; очистка данных сайта или удаление приложения удаляет их.",
          "Геолокация («рядом со мной», запуск аудиогида по прибытии) используется только на устройстве и только с вашего разрешения; на наш сервер она не передаётся. Камера используется только в режиме AR, в собственном AR-просмотрщике устройства.",
        ],
      },
      {
        h: "ИИ-гид («Спросить гида»)",
        p: [
          "Ваш вопрос, открытая страница места, язык и последние вопросы и ответы беседы передаются через наш сервер в Gemini API компании Google LLC, который формирует ответ; при этом может использоваться Google Поиск. В бесплатном уровне Gemini API Google может использовать отправленные данные для улучшения своих продуктов, и их могут просматривать люди, поэтому не указывайте в вопросах личные данные. Политика Google: https://policies.google.com/privacy",
          "Для защиты от злоупотреблений ваш IP-адрес хранится не более 24 часов только в памяти сервера как счётчик запросов и не записывается.",
          "При голосовом вводе распознавание речи выполняет служба вашего браузера или ОС на её условиях.",
        ],
      },
      {
        h: "Жалоба на ответ ИИ",
        p: [
          "Если вы отметите ответ кнопкой «Пожаловаться», выбранная причина, ваш комментарий, короткие фрагменты вопроса и ответа, место и язык записываются в журнал сервера. IP-адрес и идентификаторы не добавляются. Жалобы используются только для проверки ответов и хранятся не более 12 месяцев.",
        ],
      },
      {
        h: "Сторонние сервисы",
        p: [
          "При загрузке страниц устройство напрямую получает содержимое с этих сервисов, которые видят ваш IP-адрес: Wikimedia Commons (фото), OpenStreetMap (карта), Google Fonts (шрифты), GitHub Pages (записанное аудио). При планировании маршрута координаты выбранных мест отправляются в сервис маршрутизации OSRM. Ссылки на новости открывают Google Новости и страницы министерства в браузере.",
          "Если статистика включена, используется подсчёт Plausible без cookie и без персональных данных. Рекламы нет; данные не продаются и не передаются.",
          "Хостинг-провайдер может недолго хранить стандартные журналы доступа (IP, время, адрес).",
        ],
      },
      {
        h: "Дети",
        p: [
          "Приложение предназначено для широкой аудитории; мы сознательно не собираем персональные данные детей.",
        ],
      },
      {
        h: "Ваши права и контакты",
        p: [
          `Вопросы, запросы на доступ или удаление: ${CONTACT_EMAIL}. Поскольку учётных записей нет, мы не храним данных, по которым можно вас опознать; чтобы удалить жалобу, укажите её дату и текст.`,
          `При изменениях эта страница обновляется. Последнее обновление: ${LEGAL_UPDATED}.`,
        ],
      },
    ],
  },
};

const terms: Record<Lang, LegalDoc> = {
  tr: {
    title: "Kullanım koşulları",
    intro: `Antik Türkiye'yi kullanarak bu koşulları kabul etmiş olursunuz. Uygulamayı ${OPERATOR} işletir; iletişim: ${CONTACT_EMAIL}.`,
    sections: [
      {
        h: "Bilgilerin doğruluğu",
        p: [
          "İçerik özenle hazırlanır ama hata içerebilir. Giriş ücretleri, açılış saatleri ve kapanışlar değişir; ziyaretten önce resmî kaynağa (muze.gov.tr) bakın. Rota ve mesafeler tahminidir.",
          "3D canlandırmalar bilimsel yayınlara dayanan yorumlardır; kesin değildir.",
        ],
      },
      {
        h: "Yapay zekâ rehber",
        p: [
          '"Rehbere sor" cevapları yapay zekâ (Google Gemini) tarafından üretilir; yanlış, eksik ya da uygunsuz olabilir. Önemli kararlar için doğrulayın. Uygunsuz ya da yanlış bir cevabı her cevabın yanındaki "Bildir" düğmesiyle bize bildirebilirsiniz; bildirimler incelenir.',
          "Rehberi yasa dışı, zararlı, taciz edici içerik üretmek ya da hizmeti aşırı yüklemek için kullanmayın; kötüye kullanım sınırlanabilir.",
        ],
      },
      {
        h: "Fotoğraflar, sesler ve 3D taramalar",
        p: [
          'Fotoğraflar Wikimedia Commons\'tan, sahiplerinin seçtiği özgür lisanslarla (CC BY, CC BY-SA, CC0 vb.) kullanılır; her birinin yazarı ve lisansı "Görsel künyeleri" sayfasında ve fotoğrafın bulunduğu sayfanın altında yazar. 3D taramalar, ortam sesleri ve kayıtlı anlatım sesleri de aynı sayfada künyeleriyle listelenir. Bu eserleri kendi lisanslarına göre yeniden kullanabilirsiniz.',
          `Uygulamanın kendi metinleri, tasarımı ve yazılımı ${OPERATOR} şirketine aittir.`,
        ],
      },
      {
        h: "Sorumluluk",
        p: [
          'Uygulama "olduğu gibi" sunulur. Ören yerlerinde güvenlik kurallarına ve görevlilerin talimatlarına uyun; uygulamaya bakarken çevrenize dikkat edin. Yasaların izin verdiği ölçüde, uygulamanın kullanımından doğan dolaylı zararlardan sorumlu değiliz.',
        ],
      },
      {
        h: "Değişiklikler",
        p: [
          `Bu koşullar güncellenebilir; güncel hâli bu sayfadadır. Son güncelleme: ${LEGAL_UPDATED}.`,
        ],
      },
    ],
  },
  en: {
    title: "Terms of use",
    intro: `By using Antik Türkiye you accept these terms. The app is operated by ${OPERATOR}; contact: ${CONTACT_EMAIL}.`,
    sections: [
      {
        h: "Accuracy",
        p: [
          "The content is prepared with care but may contain mistakes. Fees, opening hours and closures change; check the official source (muze.gov.tr) before you go. Routes and distances are estimates.",
          "The 3D reconstructions are interpretations based on scholarly publications, not certainties.",
        ],
      },
      {
        h: "The AI guide",
        p: [
          'Answers in "Ask the guide" are generated by AI (Google Gemini) and may be wrong, incomplete or inappropriate. Verify anything important. You can tell us about an offensive or wrong answer with the "Report" button next to every answer; reports are reviewed.',
          "Do not use the guide to produce unlawful, harmful or harassing content or to overload the service; abuse may be limited.",
        ],
      },
      {
        h: "Photos, sounds and 3D scans",
        p: [
          'Photos come from Wikimedia Commons under the free licences their authors chose (CC BY, CC BY-SA, CC0 and others); each one\'s author and licence are shown on the "Image credits" page and at the foot of the page where it appears. 3D scans, ambient sounds and recorded narration voices are credited on the same page. You may reuse these works under their own licences.',
          `The app's own texts, design and software belong to ${OPERATOR}.`,
        ],
      },
      {
        h: "Liability",
        p: [
          'The app is provided "as is". Follow the safety rules and staff instructions at the sites, and watch your surroundings while using the app. To the extent the law allows, we are not liable for indirect damages arising from its use.',
        ],
      },
      {
        h: "Changes",
        p: [
          `These terms may be updated; the current version is always on this page. Last updated: ${LEGAL_UPDATED}.`,
        ],
      },
    ],
  },
  de: {
    title: "Nutzungsbedingungen",
    intro: `Mit der Nutzung von Antike Türkei akzeptieren Sie diese Bedingungen. Betreiber ist ${OPERATOR}; Kontakt: ${CONTACT_EMAIL}.`,
    sections: [
      {
        h: "Richtigkeit",
        p: [
          "Die Inhalte werden sorgfältig erstellt, können aber Fehler enthalten. Eintrittspreise, Öffnungszeiten und Schließungen ändern sich; prüfen Sie vor dem Besuch die offizielle Quelle (muze.gov.tr). Routen und Entfernungen sind Schätzungen.",
          "Die 3D-Rekonstruktionen sind Deutungen auf Grundlage wissenschaftlicher Veröffentlichungen.",
        ],
      },
      {
        h: "Der KI-Guide",
        p: [
          "Antworten von „Frag den Guide“ werden von KI (Google Gemini) erzeugt und können falsch, unvollständig oder unangemessen sein. Prüfen Sie Wichtiges nach. Anstößige oder falsche Antworten können Sie über „Melden“ neben jeder Antwort melden; Meldungen werden geprüft.",
          "Nutzen Sie den Guide nicht für rechtswidrige, schädliche oder belästigende Inhalte oder zur Überlastung des Dienstes.",
        ],
      },
      {
        h: "Fotos, Klänge und 3D-Scans",
        p: [
          "Fotos stammen von Wikimedia Commons unter den freien Lizenzen ihrer Urheber (CC BY, CC BY-SA, CC0 u. a.); Urheber und Lizenz stehen auf der Seite „Bildnachweise“ und am Fuß der Seite, auf der das Foto erscheint. 3D-Scans, Umgebungsklänge und Sprachaufnahmen werden dort ebenfalls genannt.",
          `Eigene Texte, Gestaltung und Software der App gehören ${OPERATOR}.`,
        ],
      },
      {
        h: "Haftung",
        p: [
          "Die App wird „wie besehen“ bereitgestellt. Beachten Sie vor Ort die Sicherheitsregeln und Anweisungen des Personals. Soweit gesetzlich zulässig, haften wir nicht für mittelbare Schäden aus der Nutzung.",
        ],
      },
      {
        h: "Änderungen",
        p: [`Diese Bedingungen können aktualisiert werden. Stand: ${LEGAL_UPDATED}.`],
      },
    ],
  },
  ru: {
    title: "Условия использования",
    intro: `Используя «Античную Турцию», вы принимаете эти условия. Приложением управляет ${OPERATOR}; контакт: ${CONTACT_EMAIL}.`,
    sections: [
      {
        h: "Точность сведений",
        p: [
          "Материалы готовятся тщательно, но могут содержать ошибки. Цены, часы работы и закрытия меняются; перед поездкой проверьте официальный источник (muze.gov.tr). Маршруты и расстояния приблизительны.",
          "3D-реконструкции — интерпретации на основе научных публикаций.",
        ],
      },
      {
        h: "ИИ-гид",
        p: [
          "Ответы «Спросить гида» создаются ИИ (Google Gemini) и могут быть неверными, неполными или неуместными. Проверяйте важное. Об оскорбительном или ошибочном ответе можно сообщить кнопкой «Пожаловаться» рядом с каждым ответом; жалобы рассматриваются.",
          "Не используйте гида для создания незаконного, вредного или оскорбительного содержания и для перегрузки сервиса.",
        ],
      },
      {
        h: "Фото, звуки и 3D-сканы",
        p: [
          "Фотографии взяты с Wikimedia Commons по свободным лицензиям авторов (CC BY, CC BY-SA, CC0 и др.); автор и лицензия каждой указаны на странице «Источники изображений» и внизу страницы, где фото показано. Там же указаны 3D-сканы, звуки окружения и записанные голоса.",
          `Собственные тексты, дизайн и программное обеспечение приложения принадлежат ${OPERATOR}.`,
        ],
      },
      {
        h: "Ответственность",
        p: [
          "Приложение предоставляется «как есть». Соблюдайте правила безопасности и указания персонала на объектах. В пределах, допускаемых законом, мы не отвечаем за косвенный ущерб от использования.",
        ],
      },
      {
        h: "Изменения",
        p: [`Условия могут обновляться. Последнее обновление: ${LEGAL_UPDATED}.`],
      },
    ],
  },
};

export const privacyPolicy = privacy;
export const termsOfUse = terms;
