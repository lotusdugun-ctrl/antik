import type { Localized } from "@/lib/i18n";

/**
 * The striking facts — the line a visitor repeats to whoever they came with.
 *
 * Separate from `site-details.ts` for the same reason that file is separate
 * from `sites.ts`: this is read by the city page and the quiz, and nothing
 * else, so it has no business in the bundle that renders a list of cards.
 *
 * Each site's single `funFact` stays where it is and leads the section; these
 * are the ones after it, written not to repeat it.
 */
const f = (tr: string, en: string): Localized => ({ tr, en });

export const siteFacts: Record<string, Localized[]> = {
  // ————— Ege —————
  efes: [
    f(
      "Büyük Tiyatro 24.000 kişilikti. Elçilerin İşleri'ne göre Aziz Pavlus'a karşı iki saat süren 'Efeslilerin Artemis'i uludur!' gösterisi burada yapıldı.",
      "The Great Theatre seated 24,000. According to Acts, the two-hour chant of 'Great is Artemis of the Ephesians!' against Saint Paul filled this bowl.",
    ),
    f(
      "Yamaç Evler'de tabandan ve duvardan ısıtma, kapalı kanalizasyon ve cam pencereler vardı — MS 1. yüzyılda.",
      "The Terrace Houses had underfloor and wall heating, enclosed drains and glazed windows — in the first century AD.",
    ),
    f(
      "Efes bir liman kentiydi. Küçük Menderes'in alüvyonu limanı doldurdu ve bugün deniz kalıntılardan 5 km uzakta.",
      "Ephesus was a port. Silt from the Küçük Menderes filled the harbour, and the sea now lies 5 km from the ruins.",
    ),
  ],
  pergamon: [
    f(
      "Akropoldeki tiyatro antik dünyanın en dik tiyatrosudur: 80 sıra, neredeyse uçurum eğiminde, 10.000 kişilik.",
      "The acropolis theatre is the steepest of the ancient world: 80 rows pitched almost like a cliff, seating 10,000.",
    ),
    f(
      "Asklepion'da tedavi rüya yorumu, su kürleri ve tiyatroyla yapılırdı. Tıbbın Galenos'u burada yetişti.",
      "At the Asklepion, treatment meant dream interpretation, water cures and theatre. Galen, the physician, trained here.",
    ),
    f(
      "Zeus Sunağı 1878-1886 kazılarında sökülüp Berlin'e taşındı; bugün Bergama Müzesi'nin adını taşıdığı yapı odur.",
      "The Great Altar was dismantled and shipped to Berlin between 1878 and 1886; it is the building the Pergamon Museum is named after.",
    ),
  ],
  aphrodisias: [
    f(
      "Stadyum 30.000 kişilikti ve antik dünyanın en iyi korunmuş stadyumudur — iki ucu da ayakta.",
      "The stadium seated 30,000 and is the best-preserved in the ancient world, with both ends still standing.",
    ),
    f(
      "Sebasteion'un kabartmaları Roma imparatorlarını tanrılarla yan yana gösterir; imparatorluk propagandasının taşa işlenmiş en kapsamlı örneğidir.",
      "The Sebasteion reliefs show Roman emperors beside gods — the fullest surviving programme of imperial propaganda carved in stone.",
    ),
    f(
      "Kentin mermer ocağı iki kilometre uzaktaydı. Aphrodisiaslı heykeltıraşların imzaları Roma'dan Kuzey Afrika'ya kadar bulundu.",
      "The marble quarry was two kilometres away. Signatures of Aphrodisian sculptors turn up from Rome to North Africa.",
    ),
  ],
  hierapolis: [
    f(
      "Plutonion'dan — 'Cehennem Kapısı' — yerin altından karbondioksit sızar. Kurban hayvanları ölürken rahiplerin sağ kalması mucize sayılırdı; gaz yerde birikir, ayakta duran insanın başı bulutun üstünde kalır.",
      "The Plutonion, the 'Gate to Hell', leaks carbon dioxide from below. Sacrificial animals died while the priests survived: the gas pools at ground level, leaving a standing man's head above the cloud.",
    ),
    f(
      "Nekropolü 1200'den fazla mezarıyla Anadolu'nun en büyüğüdür. Kaplıcalara şifa için gelen hastaların çoğu geri dönemedi.",
      "Its necropolis, with more than 1,200 tombs, is the largest in Anatolia. Many who came to the hot springs for a cure never left.",
    ),
    f(
      "Bugün turistlerin girdiği 'Kleopatra Havuzu'nun içindeki sütunlar, MS 7. yüzyıldaki bir depremde tapınağın havuza devrilmesiyle oraya düştü.",
      "The columns lying in today's 'Cleopatra's Pool' fell there when an earthquake in the seventh century AD toppled the temple into the water.",
    ),
  ],
  milet: [
    f(
      "Tiyatrosu 15.000 kişilikti ve Ege'nin en büyüklerindendir; ön sırada imparator locasının sütun yuvaları hâlâ görülür.",
      "The theatre held 15,000 and is among the largest in the Aegean; the sockets for the emperor's box are still visible in the front row.",
    ),
    f(
      "Thales, Anaksimandros ve Anaksimenes bu kentten çıktı. Batı felsefesinin ilk üç adı aynı limanın insanıdır.",
      "Thales, Anaximander and Anaximenes all came from here. The first three names in Western philosophy shared one harbour.",
    ),
    f(
      "Kentin anıtsal Pazar Kapısı 1907-08'de parça parça Berlin'e taşındı ve orada yeniden dikildi.",
      "The monumental Market Gate was shipped piece by piece to Berlin in 1907-08 and re-erected there.",
    ),
  ],
  didyma: [
    f(
      "Apollon Tapınağı 122 sütunlu tasarlandı, yaklaşık 500 yıl inşa edildi ve hiçbir zaman tamamlanamadı.",
      "The Temple of Apollo was designed with 122 columns, built over some 500 years, and never finished.",
    ),
    f(
      "Sütunları 19,7 metre yüksekliğindedir — Yunan dünyasının en büyük tapınaklarından biri.",
      "Its columns stand 19.7 metres tall, making it one of the largest temples in the Greek world.",
    ),
    f(
      "Kehanet merkeziydi ve Milet'e 17 kilometrelik bir Kutsal Yol'la bağlıydı; hacılar bu yolu yürüyerek gelirdi.",
      "It was an oracle, linked to Miletus by a 17-kilometre Sacred Way that pilgrims walked.",
    ),
  ],
  priene: [
    f(
      "Izgara planın en iyi korunduğu antik kenttir: dik bir yamaca, sanki düz araziymiş gibi kareler halinde kuruldu.",
      "It is the best-preserved grid-plan city of antiquity, laid out in squares on a steep slope as if the ground were flat.",
    ),
    f(
      "Athena Tapınağı'nı Halikarnas Mozolesi'nin mimarı Pytheos yaptı. Masrafı Büyük İskender üstlendi ve adanma yazıtı bugün British Museum'da.",
      "Pytheos, architect of the Mausoleum at Halicarnassus, built the Temple of Athena. Alexander the Great paid for it; the dedication inscription is now in the British Museum.",
    ),
    f(
      "640 kişilik meclis binası, kentin yetişkin erkek nüfusunun neredeyse tamamını aynı anda alabiliyordu.",
      "The council house seated 640 — very nearly the city's entire adult male citizenry at once.",
    ),
  ],
  sardes: [
    f(
      "Dünyanın ilk sikkeleri burada basıldı: MÖ 7. yüzyılda elektrondan. 'Karun kadar zengin' deyimi Lidya Kralı Kroisos'tan gelir.",
      "The world's first coins were struck here, from electrum, in the seventh century BC. The phrase 'rich as Croesus' comes from the Lydian king.",
    ),
    f(
      "Sardes Sinagogu antik dünyanın bilinen en büyük sinagogudur ve bir spor kompleksinin içindedir.",
      "The Sardis synagogue is the largest known from the ancient world — and it sits inside a sports complex.",
    ),
    f(
      "Altın, Paktolos Çayı'ndan geliyordu. Kral Midas'ın altın dokunuşundan bu derede arındığı anlatılır.",
      "The gold came from the Pactolus stream, in which King Midas was said to have washed away his golden touch.",
    ),
  ],
  laodikeia: [
    f(
      "Vahiy Kitabı'ndaki yedi kiliseden biridir. 'Ne soğuksun ne sıcak' azarının, kente kilometrelerce uzaktan ılık gelen su kemerlerine gönderme olduğu düşünülür.",
      "One of the seven churches of Revelation. Its rebuke — 'neither cold nor hot' — is thought to play on the water that arrived lukewarm through kilometres of aqueduct.",
    ),
    f(
      "MS 60'taki depremden sonra kent Roma'nın yardımını reddetti ve kendi parasıyla yeniden kuruldu; Tacitus bunu özellikle kaydeder.",
      "After the earthquake of AD 60 the city refused imperial aid and rebuilt at its own expense — a detail Tacitus thought worth recording.",
    ),
    f(
      "İki tiyatrosu, bir stadyumu ve Anadolu'nun en büyük antik su dağıtım terminallerinden biri vardı.",
      "It had two theatres, a stadium, and one of the largest ancient water-distribution terminals in Anatolia.",
    ),
  ],
  halikarnassos: [
    f(
      "'Mozole' kelimesi buradaki Kral Mausolos'un mezarından gelir; dünyadaki bütün anıt mezarlar adını bir Karya satrabından alır.",
      "The word 'mausoleum' comes from the tomb of King Mausolus here: every monumental tomb in the world is named after a Carian satrap.",
    ),
    f(
      "Mozole'nin taşları 15. yüzyılda Haçlı şövalyeleri tarafından sökülüp Bodrum Kalesi'nin duvarlarına örüldü.",
      "In the fifteenth century the Knights Hospitaller quarried the Mausoleum and built its stone into Bodrum Castle.",
    ),
    f(
      "Tarihin babası sayılan Herodotos bu kentte doğdu.",
      "Herodotus, the father of history, was born in this city.",
    ),
  ],
  knidos: [
    f(
      "Praksiteles'in Knidos Aphroditi, Yunan sanatının ilk büyük çıplak kadın heykeliydi. Sırf onu görmek için kente gelenler oldu.",
      "Praxiteles' Aphrodite of Knidos was the first monumental female nude in Greek art. People sailed here simply to see it.",
    ),
    f(
      "Kentin iki limanı vardı, biri askerî. İki denizin buluştuğu burunda kurulduğu için gemiler rüzgârı beklemek üzere buraya sığınırdı.",
      "The city had two harbours, one naval. Built on the cape where two seas meet, it was where ships waited out the wind.",
    ),
    f(
      "Astronom Eudoksos buralıydı; kentteki rasathane olduğu düşünülen yapı onun adıyla anılır.",
      "The astronomer Eudoxus came from Knidos; the structure thought to be its observatory carries his name.",
    ),
  ],
  smyrna: [
    f(
      "Homeros'un doğduğunu iddia eden yedi kentten biridir — ve iddiası en güçlü olanıdır.",
      "One of seven cities claiming Homer's birth — and the one with the strongest claim.",
    ),
    f(
      "Agora'nın üç katlı bazilikası, MS 178 depreminden sonra İmparatoriçe Faustina'nın bağışıyla yeniden yapıldı.",
      "The agora's three-storey basilica was rebuilt after the earthquake of AD 178 with a donation from the empress Faustina.",
    ),
    f(
      "Kent MÖ 4. yüzyılda Büyük İskender'in emriyle bugünkü Kadifekale'nin eteklerine taşındı; İzmir hâlâ o planın üzerinde.",
      "In the fourth century BC the city moved, on Alexander's orders, to the slopes of today's Kadifekale — and İzmir still sits on that plan.",
    ),
  ],
  euromos: [
    f(
      "Zeus Lepsinos Tapınağı, 16 sütunu ayakta kalmış haliyle Anadolu'nun en iyi korunmuş tapınaklarındandır.",
      "With sixteen columns still standing, the Temple of Zeus Lepsinos is among the best-preserved temples in Anatolia.",
    ),
    f(
      "Sütunların bir kısmı hiç yontulmadan bırakılmış: tapınak tamamlanamadı ve yarım kalışı taşın üzerinde okunuyor.",
      "Some columns were never fluted: the temple was left unfinished, and the fact is legible in the stone.",
    ),
    f(
      "Sütunların üzerindeki yazıtlar, her sütunu hangi yurttaşın bağışladığını isim isim kaydeder.",
      "Inscriptions on the columns record, by name, which citizen paid for each one.",
    ),
  ],
  nysa: [
    f(
      "Kenti ikiye bölen derenin üzerindeki tonozlu tünel yaklaşık 100 metre uzunluğundadır — antik dünyanın en uzun köprü tonozlarından biri.",
      "The vaulted tunnel carrying the city over its ravine runs about 100 metres — among the longest bridge vaults of antiquity.",
    ),
    f(
      "Coğrafyacı Strabon gençliğinde burada okudu ve kenti kendi gözlemleriyle anlattı.",
      "The geographer Strabo studied here as a young man and described the city from first-hand observation.",
    ),
    f(
      "Meclis binası (bouleuterion) mermer oturma sıralarıyla neredeyse eksiksiz ayaktadır.",
      "The council house survives almost intact, marble seating and all.",
    ),
  ],
  thyatira: [
    f("Vahiy Kitabı'ndaki yedi kiliseden biridir.", "One of the seven churches of Revelation."),
    f(
      "Kent boyacılıkla ünlüydü. Elçilerin İşleri'nde Pavlus'un Filipi'de karşılaştığı 'erguvan satıcısı Lidya' bu kentliydi.",
      "The city was famous for dyeing. Lydia, the 'seller of purple' Paul met at Philippi in Acts, came from here.",
    ),
    f(
      "Kalıntılar bugün Akhisar'ın tam ortasında, apartmanlarla çevrili bir ada içinde duruyor.",
      "The ruins now sit on an island of ground in the middle of modern Akhisar, ringed by apartment blocks.",
    ),
  ],

  // ————— Akdeniz —————
  patara: [
    f(
      "Likya Birliği'nin meclis binası buradadır. Temsilcilerin kentlerinin büyüklüğüne göre oy kullandığı bu sistem, Montesquieu üzerinden ABD anayasa tartışmalarında federalizm örneği olarak anıldı.",
      "The Lycian League met in the council house here. Its system — delegates voting in proportion to their city's size — reached the American constitutional debates as a model of federalism, by way of Montesquieu.",
    ),
    f(
      "Aziz Nikolaos, yani Noel Baba, MS 3. yüzyılda bu kentte doğdu.",
      "Saint Nicholas — Father Christmas — was born in this city in the third century AD.",
    ),
    f(
      "Neron döneminde dikilen deniz feneri, dünyanın ayakta kalabilmiş en eski fenerlerinden biridir; parçaları bulunup yeniden birleştirildi.",
      "Its lighthouse, raised under Nero, is among the oldest surviving anywhere; its blocks were found and reassembled.",
    ),
  ],
  xanthos: [
    f(
      "Kent tarihinde iki kez, düşmana teslim olmaktansa kendini yaktı: önce Perslere, sonra Roma iç savaşında Brutus'a karşı. Herodotos ve Appianos ikisini de anlatır.",
      "Twice in its history the city burned itself rather than surrender — first to the Persians, then to Brutus in Rome's civil war. Herodotus and Appian each record one.",
    ),
    f(
      "Nereidler Anıtı ve Harpy Anıtı'nın kabartmaları 1842'de sökülüp British Museum'a götürüldü; bugün müzedeki kopyalarıyla yerinde duruyor.",
      "The Nereid and Harpy Monument reliefs were removed to the British Museum in 1842; casts stand in their place.",
    ),
    f(
      "Likçe yazılı dikilitaş, bilinen en uzun Likçe metindir ve dilin çözülmesindeki anahtar belgelerdendir.",
      "The inscribed pillar here carries the longest known text in Lycian, a key document in deciphering the language.",
    ),
  ],
  myra: [
    f(
      "Kaya mezarları ahşap Likya evlerinin cephesi biçiminde oyulmuştur: kayadan, kaybolmuş bir mimarinin fotoğrafı.",
      "The rock tombs are carved as the façades of wooden Lycian houses — a photograph, in stone, of an architecture that has otherwise vanished.",
    ),
    f(
      "Aziz Nikolaos burada piskoposluk yaptı; kilisesi bugünkü Demre'nin içindedir ve mezarı oradaydı.",
      "Saint Nicholas served as bishop here; his church stands in modern Demre, and his tomb was in it.",
    ),
    f(
      "Tiyatro bir depremde yıkıldıktan sonra yeniden inşa edildi; devrilmiş sahne binası blokları hâlâ yerde duruyor.",
      "The theatre was rebuilt after an earthquake; blocks from the toppled stage building still lie where they fell.",
    ),
  ],
  olympos: [
    f(
      "Kentin üzerindeki Yanartaş'ta doğal metan alevleri en az 2500 yıldır sönmeden yanıyor. Antik çağda ateş püsküren Khimaira'nın buradan geldiğine inanılırdı.",
      "On the slope above, the natural methane flames of Yanartaş have burned without going out for at least 2,500 years. Antiquity took them for the fire-breathing Chimaera.",
    ),
    f(
      "MÖ 1. yüzyılda korsan reisi Zeniketes kenti üs olarak kullandı; Roma donanması onu temizlemek zorunda kaldı.",
      "In the first century BC the pirate chief Zeniketes made the city his base, and Rome had to clear him out.",
    ),
    f(
      "Kalıntılar defne ve zakkum ormanının içine gömülüdür; kentin ortasından denize bir dere akar.",
      "The ruins are swallowed by laurel and oleander, with a stream running through the middle of the city to the sea.",
    ),
  ],
  phaselis: [
    f(
      "Birbirine yürüme mesafesinde üç limanı vardı; rüzgâr hangi yönden eserse esin, biri mutlaka korunaklıydı.",
      "It had three harbours within walking distance of each other, so that whichever way the wind blew, one was sheltered.",
    ),
    f(
      "Büyük İskender MÖ 333'te kışı burada geçirdi ve kent onu altın çelenkle karşıladı.",
      "Alexander the Great wintered here in 333 BC, and the city greeted him with a golden crown.",
    ),
    f(
      "Kent gül yağı ve kerestesiyle zenginleşti; limanlar arasındaki sütunlu cadde bugün de yürünebiliyor.",
      "It grew rich on rose oil and timber; the colonnaded street between its harbours can still be walked.",
    ),
  ],
  perge: [
    f(
      "250 metrelik sütunlu caddenin tam ortasından bir su kanalı akıyordu — yazın kenti serinleten antik bir klima.",
      "A water channel ran down the centre of the 250-metre colonnaded street: ancient air-conditioning for the summer.",
    ),
    f(
      "Konik kesitleri tanımlayan matematikçi Pergeli Apollonios buradandır; elips, parabol ve hiperbol adlarını ona borçluyuz.",
      "Apollonius of Perga, who defined the conic sections, came from here: we owe him the words ellipse, parabola and hyperbola.",
    ),
    f(
      "Kentin en büyük hamisi Plancia Magna adlı bir kadındı; kent kapısını o yeniledi ve heykelleriyle yazıtları bulundu.",
      "The city's greatest benefactor was a woman, Plancia Magna, who rebuilt its gate; her statues and inscriptions were found there.",
    ),
  ],
  aspendos: [
    f(
      "Tiyatrosu Roma dünyasının en iyi korunmuş tiyatrosudur: sahne binası tam yüksekliğiyle ayakta ve bugün hâlâ konser veriliyor.",
      "Its theatre is the best-preserved in the Roman world — the stage building stands to full height, and concerts are still held in it.",
    ),
    f(
      "Mimarı Zenon'un adı yazıtta geçer. Efsaneye göre kral kızını tiyatroyu yapana vaat etmiş, iki mimar arasında kalınca tiyatro kazanmıştır.",
      "The architect Zeno is named in an inscription. Legend has the king promising his daughter to whoever built best — and the theatre winning.",
    ),
    f(
      "Su kemerleri, ters sifon ilkesiyle çalışan basınçlı su sisteminin antik dünyadaki ender örneklerindendir.",
      "Its aqueduct is one of antiquity's rare pressurised systems, working on the inverted-siphon principle.",
    ),
  ],
  side: [
    f(
      "Kentin adı, yerli Anadolu dilinde 'nar' anlamına gelir.",
      "The city's name means 'pomegranate' in the local Anatolian language.",
    ),
    f(
      "Roma döneminde Akdeniz'in en büyük köle pazarlarından biri buradaydı; korsanlar yağmalarını burada satardı.",
      "In Roman times it held one of the Mediterranean's largest slave markets, where pirates sold what they took.",
    ),
    f(
      "Apollon Tapınağı'nın denize bakan sütunları, gün batımında kentin simgesi haline geldi.",
      "The seaward columns of the Temple of Apollo have become the city's emblem at sunset.",
    ),
  ],
  termessos: [
    f(
      "Büyük İskender kenti kuşattı ama alamadan çekildi — Anadolu'da onu geri çeviren ender yerlerden biri.",
      "Alexander the Great besieged it and withdrew without taking it: one of the few places in Anatolia to turn him back.",
    ),
    f(
      "1000 metrenin üzerinde, kartal yuvası gibi bir yamaçtadır; tiyatronun sahnesinin arkası doğrudan uçuruma ve Güllük Dağı'na bakar.",
      "It sits above 1,000 metres like an eagle's nest; behind the theatre stage there is nothing but the drop and Mount Güllük.",
    ),
    f(
      "Kent hiç sistemli kazılmadı. Devasa lahitler, kaya mezarları ve sarnıçlar ormanın içinde devrildikleri yerde duruyor.",
      "The city has never been systematically excavated. Giant sarcophagi, rock tombs and cisterns lie in the forest where they fell.",
    ),
  ],
  sagalassos: [
    f(
      "1500 metre yükseklikteki Antoninler Çeşmesi restore edildi ve 1700 yıl sonra yeniden su akıtmaya başladı.",
      "The Antonine fountain, at 1,500 metres, was restored — and after 1,700 years it runs with water again.",
    ),
    f(
      "Hadrianus'un dev heykelinin parçaları bulundu: tek başına bir buçuk metreyi aşan bir ayak ve bir baş.",
      "Fragments of a colossal Hadrian were found here, including a foot and a head each over a metre and a half.",
    ),
    f(
      "Kent depremler ve vebadan sonra terk edildi ve üzerine hiç yeni yerleşim kurulmadı; bu yüzden planı bozulmadan kaldı.",
      "Abandoned after earthquakes and plague, it was never built over — which is why its plan survives undisturbed.",
    ),
  ],
  pinara: [
    f(
      "Kentin arkasındaki dik kaya duvarı, yüzlerce oyuk mezarla arı peteğine benzer; bu mezarlara nasıl çıkıldığı hâlâ tartışılır.",
      "The sheer rock face behind the city is honeycombed with hundreds of tombs, and how anyone reached them is still argued over.",
    ),
    f(
      "'Kral Mezarı'nın kabartmalarında surlarla çevrili dört Likya kenti tasvir edilir — Likya kentlerinin kendi çizimi.",
      "The reliefs of the 'Royal Tomb' depict four walled Lycian cities: Lycians drawing their own towns.",
    ),
    f(
      "Tiyatrosu, seyirci sıralarına hiç dokunulmamış haliyle ormanın içinde durur.",
      "Its theatre stands in the forest with its seating entirely untouched.",
    ),
  ],
  oenoanda: [
    f(
      "Epikurosçu Diogenes, felsefesini kentin çarşısındaki bir duvara kazıttı: yaklaşık 80 metre uzunluğunda, antik dünyanın bilinen en uzun yazıtı.",
      "The Epicurean Diogenes had his philosophy carved onto a wall in the city's market: some 80 metres long, the longest known inscription of antiquity.",
    ),
    f(
      "1400 metre yükseklikte, ormanlık bir dağ sırtındadır; yazıtın blokları hâlâ kalıntılar arasında toplanıyor.",
      "It lies at 1,400 metres on a wooded ridge, and blocks of that inscription are still being gathered among the ruins.",
    ),
  ],
  "elaiussa-sebaste": [
    f(
      "Kent bir adacığın üzerine kuruldu; aradaki kanal zamanla dolunca ada karaya bağlandı ve kent kıyıya yayıldı.",
      "The city began on an islet; when the channel silted up the island joined the shore and the city spread onto it.",
    ),
    f(
      "Kappadokia Kralı Arkhelaos burayı ikinci başkenti yaptı ve Augustus onuruna Sebaste adını verdi.",
      "King Archelaus of Cappadocia made it his second capital and renamed it Sebaste in honour of Augustus.",
    ),
    f(
      "Tiyatro, hamam ve bazilika sahil şeridinde yan yana dizilidir; yol kalıntıların tam ortasından geçer.",
      "Theatre, baths and basilica line up along the shore, with the modern road running straight through them.",
    ),
  ],
  "seleucia-calycadnum": [
    f(
      "Kenti Büyük İskender'in generali I. Seleukos Nikator kurdu; adını taşıyan onlarca Seleukeia'dan biridir.",
      "Founded by Seleucus I Nicator, Alexander's general — one of the many cities he named after himself.",
    ),
    f(
      "Alman İmparatoru Kızıl Sakal Friedrich, Üçüncü Haçlı Seferi'ne giderken 1190'da buradaki Göksu (Kalykadnos) nehrinde boğuldu ve sefer dağıldı.",
      "Frederick Barbarossa drowned in the Göksu — the ancient Calycadnus — here in 1190 on the Third Crusade, and the crusade fell apart.",
    ),
    f(
      "Jüpiter Tapınağı'nın sütunu ve Roma köprüsü bugünkü Silifke'nin trafiği arasında ayakta duruyor.",
      "A column of the Temple of Jupiter and the Roman bridge still stand amid the traffic of modern Silifke.",
    ),
  ],

  // ————— Marmara —————
  troya: [
    f(
      "Höyükte dokuz kent üst üste durur. Schliemann 1871'de kazarken Homeros'un Troya'sını aradı, hızla derine inip aradığı katı geçti ve 'Priamos'un Hazinesi'ni bin yıl daha eski bir katta buldu.",
      "Nine cities stand stacked in the mound. Digging in 1871, Schliemann drove straight past the layer he was looking for and found his 'Treasure of Priam' in one a thousand years too old.",
    ),
    f(
      "Truva Atı'ndan hiçbir iz bulunmadı. Buna karşılık Hitit tabletlerinde, Troya'nın yeriyle uyuşan 'Wilusa' adlı bir kentle yapılan antlaşmalar geçer.",
      "No trace of the wooden horse has been found. Hittite tablets, however, record treaties with a city called Wilusa, in the right place to be Troy.",
    ),
    f(
      "Kentin surlarındaki eğimli taş duvar, İlyada'da Patroklos'un üç kez tırmanıp üç kez geri atıldığı duvar sanılır.",
      "The battered stone wall of the citadel is taken for the one Patroclus climbs three times, and is thrown back from three times, in the Iliad.",
    ),
  ],
  assos: [
    f(
      "Aristoteles burada üç yıl kaldı, bir felsefe okulu kurdu ve kentin yöneticisinin yeğeniyle evlendi. Biyoloji çalışmalarına buradaki körfezde başladı.",
      "Aristotle spent three years here, founded a school, and married the ruler's niece. He began his biological work in the gulf below.",
    ),
    f(
      "Athena Tapınağı, Anadolu'daki tek arkaik Dor düzeni tapınağıdır.",
      "The Temple of Athena is the only archaic Doric temple in Anatolia.",
    ),
    f(
      "Aziz Pavlus üçüncü yolculuğunda Troas'tan buraya yürüdü ve buradan gemiye bindi; Elçilerin İşleri bunu adıyla kaydeder.",
      "Saint Paul walked here from Troas on his third journey and took ship from this harbour; Acts records it by name.",
    ),
  ],
  kyzikos: [
    f(
      "Hadrianus Tapınağı antik çağda 'dünyanın sekizinci harikası' sayıldı; 15. yüzyılda gezginler hâlâ ayakta duran otuz sütun saymıştı.",
      "The Temple of Hadrian was called the eighth wonder of the world; travellers in the fifteenth century still counted thirty columns standing.",
    ),
    f(
      "Kent bir adaydı. Zamanla oluşan kum seti onu anakaraya bağladı ve bugün Kapıdağ Yarımadası'nın boynundadır.",
      "The city was an island. A sandbar tied it to the mainland, and it now sits on the neck of the Kapıdağ peninsula.",
    ),
    f(
      "Kyzikos elektron staterleri yüzyıllarca Ege ve Karadeniz ticaretinin ortak parası gibi kullanıldı.",
      "Cyzicene electrum staters served for centuries as a common currency across Aegean and Black Sea trade.",
    ),
  ],
  nikaia: [
    f(
      "325'te İznik Konsili burada toplandı ve bugün hâlâ okunan İznik İnancı burada yazıldı.",
      "The Council of Nicaea met here in 325 and wrote the creed still recited today.",
    ),
    f(
      "787'de ikinci kez konsile ev sahipliği yaptı; ikon kırıcılığı burada sona erdirildi.",
      "It hosted a second council in 787, which brought iconoclasm to an end.",
    ),
    f(
      "1204'te Haçlılar İstanbul'u alınca Bizans'ın sürgündeki başkenti İznik oldu ve imparatorluk buradan geri kazanıldı.",
      "When the crusaders took Constantinople in 1204, Nicaea became the Byzantine capital in exile — and the empire was won back from here.",
    ),
  ],
  "alexandria-troas": [
    f(
      "Roma döneminde Anadolu'nun en büyük limanlarından biriydi ve antik kaynaklara göre Konstantin başkentini buraya kurmayı ciddi ciddi düşündü.",
      "One of Anatolia's largest ports under Rome — and by ancient report, Constantine seriously considered founding his capital here.",
    ),
    f(
      "Aziz Pavlus 'Makedonya'ya geç ve bize yardım et' rüyasını burada gördü; Hıristiyanlığın Avrupa'ya geçişi bu limandan başladı.",
      "It was here that Saint Paul dreamed of the man calling 'Come over to Macedonia' — Christianity's crossing into Europe began at this harbour.",
    ),
    f(
      "Kalıntılar bugün meşe ormanının içine dağılmıştır; hamam yapısı halk arasında 'Bal Saray' diye anılır.",
      "The ruins are scattered through oak woodland; locals call the bath building the 'Honey Palace'.",
    ),
  ],
  parion: [
    f(
      "Nekropolünde binlerce mezar kazıldı; Roma dönemi ölü gömme geleneklerinin Anadolu'daki en zengin örneklerinden biri.",
      "Thousands of graves have been excavated in its necropolis, making it one of Anatolia's richest records of Roman burial custom.",
    ),
    f(
      "Roma kolonisi statüsü kazandı ve kendi sikkesini bastı; sikkelerinde kentin simgesi Gorgon başıdır.",
      "It won the status of a Roman colony and struck its own coins, marked with a Gorgon's head.",
    ),
  ],
  daskyleion: [
    f(
      "Pers İmparatorluğu'nun Batı Anadolu satraplığının merkeziydi; Pers yönetiminin Anadolu'daki en iyi belgelenmiş yeridir.",
      "It was the seat of the Persian satrapy of western Anatolia — the best-documented site of Persian rule in the region.",
    ),
    f(
      "Yüzlerce mühür baskısı (bulla) bulundu: yakılmış bir arşivin geriye kalan tek parçası, kilin pişmiş hali.",
      "Hundreds of clay sealings survive: all that is left of a burned archive, preserved because the fire baked them.",
    ),
    f(
      "Höyük, Manyas Kuş Cenneti'ne bakar; satrap sarayının bahçesi antik kaynaklarda av parkı olarak anılır.",
      "The mound overlooks Lake Manyas; ancient sources describe the satrap's garden here as a hunting park.",
    ),
  ],
  lampsacus: [
    f(
      "Pers Kralı Artakserkses, Atinalı komutan Themistokles'e sürgününde bu kenti 'şarap parası' olarak bağışladı.",
      "The Persian king Artaxerxes granted this city to the exiled Athenian Themistocles to cover his wine.",
    ),
    f(
      "Filozof Anaksagoras burada öldü; kent onun anısına her yıl çocuklara okulun tatil olduğu bir gün ilan etti.",
      "The philosopher Anaxagoras died here, and the city marked his memory with an annual holiday from school for its children.",
    ),
    f(
      "Bereket tanrısı Priapos'un kültünün merkeziydi ve adı bu yüzden antik edebiyatta sık geçer.",
      "It was the centre of the cult of Priapus, which is why its name recurs so often in ancient literature.",
    ),
  ],
  antandros: [
    f(
      "Vergilius'un Aeneis'ine göre Aeneas, Troya'dan kaçarken gemilerini burada, İda Dağı'nın kerestesiyle yaptı.",
      "In Virgil's Aeneid, Aeneas built the ships he fled Troy in right here, from the timber of Mount Ida.",
    ),
    f(
      "Kazılarda ortaya çıkan Roma villasının mozaikleri ve duvar resimleri, Kaz Dağları'nın eteğinde bir kıyı lüksünü belgeliyor.",
      "The mosaics and wall paintings of an excavated Roman villa record a coastal luxury at the foot of the Kaz mountains.",
    ),
  ],

  // ————— İç Anadolu —————
  gordion: [
    f(
      "Büyük İskender'in kılıcıyla kestiği Gordion Düğümü buradaydı; 'düğümü çözen Asya'nın hâkimi olacak' kehaneti kentin tapınağına aitti.",
      "The Gordian Knot that Alexander cut with his sword was here, in the city's temple, with its prophecy that whoever untied it would rule Asia.",
    ),
    f(
      "MÖ 8. yüzyıla tarihlenen kral tümülüsünün içindeki ahşap oda, dünyanın ayakta duran en eski ahşap yapısıdır.",
      "The wooden chamber inside its royal tumulus, from the eighth century BC, is the oldest standing wooden structure in the world.",
    ),
    f(
      "Mezar odasında bulunan kazanlardaki kalıntılar çözümlendi: cenaze ziyafetinde bal, üzüm ve arpadan yapılmış bir içki içilmişti.",
      "Residues in the cauldrons of the burial chamber were analysed: the funeral feast was washed down with a drink of honey, grape and barley.",
    ),
  ],
  catalhoyuk: [
    f(
      "9000 yıllık bu yerleşmenin sokağı yoktur. Evler bitişik yapılmıştı ve içeri çatıdaki delikten merdivenle inilirdi; kentin caddesi damların üstüydü.",
      "This 9,000-year-old settlement has no streets. Houses were built wall to wall and entered by ladder through the roof: the rooftops were the street.",
    ),
    f(
      "Ölüler evin tabanının altına, ailenin uyuduğu platformların altına gömülürdü.",
      "The dead were buried beneath the floors of the houses, under the platforms where the family slept.",
    ),
    f(
      "Duvar resimlerinden biri, arkasında patlayan bir volkanla birlikte kuşbakışı bir yerleşim planı gösterir; dünyanın en eski haritası olabileceği öne sürülür.",
      "One wall painting shows a settlement plan from above with an erupting volcano behind it — argued by some to be the oldest map in the world.",
    ),
  ],
  kultepe: [
    f(
      "Anadolu yazıyla burada tanıştı. Asurlu tüccarların bıraktığı 23.000'den fazla çivi yazılı tablet, Anadolu'nun ilk yazılı belgeleridir.",
      "Anatolia met writing here. The 23,000-plus cuneiform tablets left by Assyrian merchants are the earliest written documents from Anatolia.",
    ),
    f(
      "Tabletler destan değil muhasebe: borç senetleri, ortaklık sözleşmeleri, mahkeme kayıtları, eve mektuplar. Bir tüccarın karısı, ona daha iyi kumaş göndermesini yazar.",
      "The tablets are not epic but bookkeeping: promissory notes, partnership contracts, court records, letters home. One merchant's wife writes telling him to send better cloth.",
    ),
    f(
      "Höyüğün eteğindeki karum, tüccarların yaşadığı ayrı bir mahalleydi — bilinen en eski uluslararası ticaret kolonilerinden.",
      "The karum at the foot of the mound was a separate merchants' quarter: one of the earliest known international trading colonies.",
    ),
  ],
  tyana: [
    f(
      "Filozof Tyanalı Apollonios buradandır; çağdaşları ona mucizeler atfetti ve Roma'da uzun süre İsa'ya rakip bir figür olarak anıldı.",
      "The philosopher Apollonius of Tyana came from here; his contemporaries credited him with miracles, and Rome long set him up as a rival figure to Christ.",
    ),
    f(
      "Roma su kemeri ve havuzu ayakta; kemerin taşıdığı su bugün de aynı kaynaktan geliyor.",
      "The Roman aqueduct and pool survive, and the spring that fed them still runs.",
    ),
    f(
      "Hitit döneminde adı Tuwanuwa'ydı; yakındaki İvriz kabartması bölgenin Geç Hitit dönemini belgeler.",
      "In the Hittite period it was Tuwanuwa; the nearby İvriz relief records the region's Neo-Hittite phase.",
    ),
  ],
  pessinus: [
    f(
      "Ana Tanrıça Kibele'nin kutsal merkeziydi. MÖ 204'te Roma, Hannibal'i yenmek için bir kehanete uyarak tanrıçanın kutsal siyah taşını buradan alıp Roma'ya taşıdı.",
      "It was the sanctuary of Cybele. In 204 BC, following a prophecy meant to defeat Hannibal, Rome took the goddess's sacred black stone from here to the capital.",
    ),
    f(
      "Tapınak alanının önündeki mermer basamaklar hem tören merdiveni hem tiyatro oturağı olarak kullanıldı.",
      "The marble steps before the sanctuary served both as a ceremonial stair and as theatre seating.",
    ),
    f(
      "Kenti ikiye bölen dere, antik çağda mermerle kaplanmış bir kanala alınmıştı.",
      "The stream dividing the city was channelled in antiquity between marble-faced banks.",
    ),
  ],
  amorium: [
    f(
      "Bizans'ın Anadolu'daki en büyük askerî üslerindendi ve imparator hanedanının memleketiydi.",
      "One of Byzantium's largest military bases in Anatolia, and the home town of a ruling dynasty.",
    ),
    f(
      "838'de Halife Mutasım kenti kuşatıp yıktı. Teslim olmayı reddeden komutanların idamı, 'Amorium'un 42 Şehidi' olarak Bizans azizler takvimine girdi.",
      "In 838 the caliph al-Mu'tasim besieged and destroyed it. The execution of the officers who refused to convert entered the Byzantine calendar as the Forty-Two Martyrs of Amorium.",
    ),
  ],
  "alisar-hoyuk": [
    f(
      "1927-32'de kazılan bu höyük, Anadolu arkeolojisinin dönem sıralamasının kurulduğu yerdir; başka kazılar tarihlerini uzun süre buraya göre verdi.",
      "Excavated between 1927 and 1932, this mound is where the chronology of Anatolian archaeology was first built; other digs long dated themselves against it.",
    ),
    f(
      "Hatti, Asur ticaret kolonisi ve Hitit katmanları üst üste durur: tek bir tepede üç ayrı dünya.",
      "Hattian, Assyrian trading-colony and Hittite layers sit one atop another: three worlds in a single hill.",
    ),
  ],
  "comana-cappadociae": [
    f(
      "Bir tapınak kentiydi: yönetici tanrıça Ma'nın başrahibiydi ve protokolde kraldan sonra gelirdi.",
      "It was a temple state: its ruler was the high priest of the goddess Ma, and ranked second only to the king.",
    ),
    f(
      "Strabon, tapınağa bağlı kutsal hizmetlilerin sayısını altı binin üzerinde verir.",
      "Strabo puts the number of sacred servants attached to the temple at over six thousand.",
    ),
  ],

  // ————— Karadeniz —————
  hattusa: [
    f(
      "Hitit İmparatorluğu'nun başkentiydi ve 6 kilometrelik surla çevriliydi; Yerkapı'nın altındaki 70 metrelik taş tünel bugün de yürünebiliyor.",
      "Capital of the Hittite Empire, ringed by six kilometres of wall; the 70-metre stone tunnel under Yerkapı can still be walked through.",
    ),
    f(
      "Kadeş Antlaşması'nın Hititçe kopyası burada bulundu. Bilinen en eski yazılı barış antlaşmasıdır ve bir kopyası New York'taki BM binasında sergilenir.",
      "The Hittite copy of the Treaty of Kadesh was found here — the oldest known written peace treaty, with a replica on display at the UN in New York.",
    ),
    f(
      "Yazılıkaya açık hava tapınağının kaya duvarlarında altmıştan fazla tanrı, geçit töreni halinde yürür.",
      "On the rock walls of the Yazılıkaya open-air sanctuary, more than sixty gods walk in procession.",
    ),
  ],
  alacahoyuk: [
    f(
      "Kral mezarlarından çıkan bronz 'güneş kursları', Türkiye'de modern dönemin en çok kopyalanan arkeolojik simgesi oldu.",
      "The bronze 'sun discs' from its royal tombs became the most reproduced archaeological emblem in modern Türkiye.",
    ),
    f(
      "Sfenksli Kapı'nın iki yanındaki kabartmalar, Hitit dinî törenlerini adım adım gösterir.",
      "The reliefs flanking the Sphinx Gate show a Hittite religious ceremony step by step.",
    ),
    f(
      "Kazı 1935'te Atatürk'ün talimatıyla başladı ve Cumhuriyet'in kendi olanaklarıyla yürüttüğü ilk büyük kazılardan biri oldu.",
      "Excavation began in 1935 on Atatürk's instruction, among the first major digs the young Republic ran with its own resources.",
    ),
  ],
  pompeiopolis: [
    f(
      "Kenti, Karadeniz'i korsanlardan temizleyen Pompeius kurdu ve Paflagonya'nın başkenti oldu.",
      "Founded by Pompey after he cleared the Black Sea of pirates, it became the capital of Paphlagonia.",
    ),
    f(
      "Sütunlu caddesi ve villalarının mozaikli tabanları, taşra kentlerinde bile Roma lüksünün ne kadar ileri gittiğini gösteriyor.",
      "Its colonnaded street and mosaic villa floors show how far Roman luxury reached even into provincial towns.",
    ),
  ],
  amastris: [
    f(
      "Kenti Kraliçe Amastris kurdu ve kendi adını verdi — antik dünyada bir kadının adını taşıyan ender kentlerden biridir.",
      "Queen Amastris founded the city and gave it her own name: one of the few ancient cities named for a woman.",
    ),
    f(
      "Plinius, Trajan'a yazdığı mektupta kentin ortasından geçen açık lağımı kapatma iznini ister; imparatorun cevabı da elimizde.",
      "Pliny wrote to Trajan asking leave to cover the open sewer running through the city — and the emperor's reply survives too.",
    ),
    f(
      "Roma dönemi 'Kuş Kapısı' bugünkü Amasra'nın sokak dokusunun içinde ayakta duruyor.",
      "The Roman 'Bird Gate' still stands within the street fabric of modern Amasra.",
    ),
  ],
  amaseia: [
    f(
      "Coğrafyacı Strabon burada doğdu. Bilinen dünyanın ilk kapsamlı coğrafyasını yazan adam, kendi kentini de anlatır.",
      "The geographer Strabo was born here. The man who wrote the first comprehensive geography of the known world also described his own town.",
    ),
    f(
      "Pontus krallarının kaya mezarları, kentin üzerindeki dik kayalığa oyulmuştur ve geceleri aydınlatılır.",
      "The rock tombs of the Pontic kings are cut into the cliff above the town, and are lit at night.",
    ),
    f(
      "Osmanlı döneminde şehzadeler burada valilik yaparak yönetim öğrendi; kent bu yüzden 'şehzadeler şehri' diye anılır.",
      "Under the Ottomans, princes learned to govern here as provincial governors — hence the town's name, 'city of princes'.",
    ),
  ],
  sinope: [
    f(
      "Kinik filozof Sinoplu Diogenes buradandır: bir küpün içinde yaşayan, Büyük İskender ona ne dilediğini sorduğunda 'gölge etme' diyen adam.",
      "Diogenes the Cynic came from here — the man who lived in a jar and, asked by Alexander what he wanted, said 'stand out of my light'.",
    ),
    f(
      "Karadeniz'in tek doğal korunaklı limanıdır; kent bu yüzden hem Miletos kolonisi hem Pontus donanmasının üssü oldu.",
      "It has the only naturally sheltered harbour on the Black Sea, which made it both a Milesian colony and the Pontic naval base.",
    ),
    f(
      "Roma'ya karşı en uzun direnen kral VI. Mithridates burada doğdu.",
      "Mithridates VI, the king who held out longest against Rome, was born here.",
    ),
  ],
  "heraclia-pontica": [
    f(
      "Antik çağda Herakles'in Kerberos'u yeraltından çıkardığı yerin buradaki Cehennemağzı Mağaraları olduğuna inanılırdı.",
      "Antiquity held that the caves here — Cehennemağzı, the Mouth of Hell — were where Heracles dragged Cerberus up from the underworld.",
    ),
    f(
      "Megara kolonisi olan kent, yerli Mariandyn halkını toprağa bağlı hale getirmesiyle antik kaynaklarda özellikle anılır.",
      "A Megarian colony, it is singled out in ancient sources for reducing the native Mariandynians to serfdom.",
    ),
  ],
  amisos: [
    f(
      "Tümülüslerden çıkan Helenistik altın takılar, Karadeniz kıyısındaki zenginliğin en çarpıcı kanıtıdır; bugün Samsun Müzesi'ndeler.",
      "The Hellenistic gold jewellery from its tumuli is the most striking evidence of wealth on this coast; it is now in the Samsun museum.",
    ),
    f(
      "Mithridates'in en önemli limanlarındandı ve Roma'ya karşı direniş sırasında yakıldı.",
      "One of Mithridates' principal ports, it was burned during the resistance to Rome.",
    ),
  ],
  tieion: [
    f(
      "Filyos'taki bu kent, Karadeniz kıyısının en az kazılmış antik kentlerinden biridir; tiyatrosu daha yeni ortaya çıkarıldı.",
      "This city at Filyos is among the least excavated on the Black Sea coast; its theatre has only recently been uncovered.",
    ),
    f(
      "Antik kaynaklara göre kent, adını bir rahip olan Tios'tan alır ve bölgedeki en küçük bağımsız kentti.",
      "Ancient sources say it took its name from a priest, Tios, and that it was the smallest independent city in the region.",
    ),
  ],

  // ————— Güneydoğu Anadolu —————
  gobeklitepe: [
    f(
      "11.500 yıllıktır: Stonehenge'den yaklaşık altı bin, Giza piramitlerinden yaklaşık yedi bin yıl eskidir. Yapıldığında henüz çanak çömlek, tekerlek ve yazı yoktu.",
      "It is 11,500 years old: roughly six thousand years older than Stonehenge and seven thousand older than the pyramids at Giza. When it was built there was no pottery, no wheel and no writing.",
    ),
    f(
      "Yapanlar çiftçi değil avcı-toplayıcıydı. Bu, 'önce yerleşik hayat kurulur sonra tapınak yapılır' varsayımını tersine çevirdi.",
      "Its builders were hunter-gatherers, not farmers — which reversed the assumption that people settle down first and build temples afterwards.",
    ),
    f(
      "T biçimli dikilitaşların üzerinde tilki, yılan, akrep ve turna kabartmaları var; en ağır sütun yaklaşık on altı ton.",
      "The T-shaped pillars carry carved foxes, snakes, scorpions and cranes; the heaviest weighs about sixteen tonnes.",
    ),
  ],
  zeugma: [
    f(
      "Adı Yunanca 'geçit, köprü' demektir: Fırat'ın en kolay geçildiği noktaydı ve doğu ticaretinin kilidiydi.",
      "Its name is Greek for 'crossing': this was the easiest ford on the Euphrates, and the lock on the eastern trade.",
    ),
    f(
      "Birecik Barajı'nın suları yükselmeden önce yürütülen kurtarma kazısında çıkarılan mozaikler arasındaki 'Çingene Kızı', Türkiye'nin en tanınan antik görüntülerinden biri oldu.",
      "The mosaics saved in the rescue dig before the Birecik dam flooded the site include the 'Gypsy Girl', now among the best-known ancient images in Türkiye.",
    ),
    f(
      "Roma'nın IV. Scythica lejyonu burada konuşlandı; kentin zenginliği doğrudan sınır garnizonundan geliyordu.",
      "Rome's Legio IV Scythica was stationed here, and the city's wealth came directly from the frontier garrison.",
    ),
  ],
  nemrut: [
    f(
      "Kommagene Kralı I. Antiokhos, 2150 metre yükseklikte kendine bir mezar tümülüsü yaptırdı ve etrafına dev tanrı heykelleri dizdirdi. Depremler bütün başları yere indirdi; heykeller gövdesiz başlarıyla oturuyor.",
      "King Antiochus I of Commagene raised a burial mound for himself at 2,150 metres and ringed it with colossal gods. Earthquakes brought every head to the ground, and they now sit apart from their bodies.",
    ),
    f(
      "Panteon kasten melezdir: Zeus-Oromasdes, Apollon-Mithras. Kral, Yunan ve Pers tanrılarını tek bir hanedan dininde birleştirdi.",
      "The pantheon is deliberately hybrid — Zeus-Oromasdes, Apollo-Mithras. The king fused Greek and Persian gods into a single dynastic religion.",
    ),
    f(
      "Aslan kabartması üzerindeki yıldız dizilimi, bilinen en eski yıldız haritalarından biri sayılır ve belirli bir tarihi işaret ettiği düşünülür.",
      "The star pattern on the lion relief is counted among the oldest known star charts, and is thought to fix a specific date.",
    ),
  ],
  harran: [
    f(
      "Dünyanın en uzun süre kesintisiz yaşanmış yerleşimlerinden biridir; Tevrat'a göre İbrahim ailesiyle burada konakladı.",
      "One of the longest continuously inhabited places on earth; in the Book of Genesis, Abraham stayed here with his family.",
    ),
    f(
      "Konik kubbeli kerpiç evler, elektriksiz serinleme için tasarlanmış bir mimaridir ve biçimleri binlerce yıldır değişmedi.",
      "The conical mud-brick houses are an architecture for staying cool without electricity, and their shape has not changed in millennia.",
    ),
    f(
      "Ay tanrısı Sin'in kült merkeziydi ve pagan geleneğini en geç bırakan yerlerdendi; İslam döneminde ise buradaki okul astronomi ve matematikte ün yaptı.",
      "It was the cult centre of the moon god Sin and one of the last places to give up its pagan tradition; under Islam its school became famous for astronomy and mathematics.",
    ),
  ],
  dara: [
    f(
      "Bizans'ın Sasani sınırındaki ileri karakoluydu. 530'daki Dara Savaşı'nda Belisarius, sayıca üstün Pers ordusunu burada yendi.",
      "Byzantium's forward fortress on the Sasanian frontier. At the Battle of Dara in 530, Belisarius defeated a numerically superior Persian army here.",
    ),
    f(
      "Kayaya oyulmuş dev sarnıçlar, kuşatmada kentin ne kadar dayanabileceğini belirleyen asıl silahtı.",
      "The vast rock-cut cisterns were the real weapon in a siege: they decided how long the city could hold.",
    ),
    f(
      "Nekropoldeki kayaya oyulmuş çok katlı mezar odaları, bölgedeki en etkileyici Geç Antik yapılardandır.",
      "The multi-storey rock-cut tomb chambers in the necropolis are among the most striking late antique structures in the region.",
    ),
  ],
  carchemish: [
    f(
      "Kentin Geç Hitit kabartmaları Ankara'daki Anadolu Medeniyetleri Müzesi'nin omurgasını oluşturur.",
      "The city's Neo-Hittite reliefs form the backbone of the Museum of Anatolian Civilizations in Ankara.",
    ),
    f(
      "1911-14 kazılarında henüz genç bir arkeolog olan T. E. Lawrence — Arabistanlı Lawrence — burada çalıştı.",
      "T. E. Lawrence — Lawrence of Arabia — worked here as a young archaeologist on the 1911-14 excavations.",
    ),
    f(
      "Alan bugün Türkiye-Suriye sınırının tam üzerindedir ve uzun yıllar mayınlı olduğu için kazılamadı.",
      "The site straddles the Turkish-Syrian border and could not be dug for years because it was mined.",
    ),
  ],
  "sam-al": [
    f(
      "Dairesel çift surla çevrili planı, Yakın Doğu'da benzeri az görülen bir kent tasarımıdır.",
      "Its circular double walls make a city plan with few parallels in the Near East.",
    ),
    f(
      "Kral Kilamuwa ve Panamuwa yazıtları, Sami dillerinin tarihinde birinci elden belgelerdir; kentte Fenikece, Aramca ve Luvice bir arada kullanıldı.",
      "The inscriptions of kings Kilamuwa and Panamuwa are primary documents in the history of the Semitic languages; Phoenician, Aramaic and Luwian were all in use here.",
    ),
    f(
      "Kapı aslanları bugün Berlin ve İstanbul müzelerinde sergileniyor.",
      "Its gate lions are now displayed in the museums of Berlin and Istanbul.",
    ),
  ],
  arsameia: [
    f(
      "Kommagene'nin yazlık başkentiydi; Nemrut'taki mezarın sahibi Antiokhos, babası Mithridates için burayı kutsal alan yaptı.",
      "The summer capital of Commagene: Antiochus, whose tomb crowns Nemrut, made this a sanctuary for his father Mithridates.",
    ),
    f(
      "Herakles ile Kral Mithridates'in el sıkıştığı kabartma, en iyi korunmuş Kommagene eseridir — bir tanrıyla bir kral aynı boyda.",
      "The relief of Heracles shaking hands with King Mithridates is the best-preserved Commagene work — a god and a king shown the same height.",
    ),
    f(
      "Kayaya oyulmuş 158 metrelik dik tünel, hâlâ tam olarak ne işe yaradığı bilinmeyen bir yapıdır.",
      "A 158-metre shaft cut straight into the rock remains a structure whose purpose is not fully understood.",
    ),
  ],
  hasankeyf: [
    f(
      "12.000 yıllık yerleşim, 2020'de Ilısu Barajı'nın suları altında büyük ölçüde kaldı. Zeynel Bey Türbesi tek parça halinde kaldırılıp yeni yerine taşındı.",
      "A 12,000-year-old settlement, largely submerged by the Ilısu dam in 2020. The tomb of Zeynel Bey was lifted whole and moved to new ground.",
    ),
    f(
      "Artuklu Köprüsü zamanında Ortadoğu'nun en geniş açıklıklı köprüsü sayılıyordu; ayakları hâlâ sudan çıkıyor.",
      "The Artuqid bridge was reckoned the widest-spanning in the Middle East of its day; its piers still break the water.",
    ),
    f(
      "Kayalığa oyulmuş binlerce mağara ev vardı ve bir kısmında 20. yüzyıla kadar yaşanıyordu.",
      "Thousands of cave dwellings were cut into the cliff, and some were still lived in during the twentieth century.",
    ),
  ],
  sogmatar: [
    f(
      "Gezegenlere ve ay tanrısı Sin'e adanmış açık hava kutsal alanıdır; kayalara oyulmuş Süryanice yazıtlar MS 2-3. yüzyıla tarihlenir.",
      "An open-air sanctuary of the planets and the moon god Sin, with Syriac inscriptions cut into the rock in the second and third centuries AD.",
    ),
    f(
      "Merkezdeki kutsal tepenin çevresine yedi gezegen için yedi ayrı yapı dağıtıldığı düşünülüyor.",
      "Seven separate structures are thought to be scattered around the central sacred hill, one for each planet.",
    ),
  ],
  "karahan-tepe": [
    f(
      "Göbekli Tepe'nin çağdaşıdır. Ana odada, ana kayadan yontularak bırakılmış on bir sütun dikilir ve duvardan bir insan başı çıkar.",
      "A contemporary of Göbekli Tepe. In the main chamber eleven pillars were left standing out of the bedrock itself, and a human head emerges from the wall.",
    ),
    f(
      "Bölgedeki benzer alanları kapsayan 'Taş Tepeler' araştırma programının merkezlerindendir; kazılan alan henüz çok küçük.",
      "It is one of the hubs of the 'Taş Tepeler' research programme covering similar sites in the region, and only a small part of it has been dug.",
    ),
  ],
  "nevali-cori": [
    f(
      "Atatürk Barajı'nın suları altında kaldı. Buradan çıkan T biçimli sütunlar, Göbekli Tepe kazılmadan yıllar önce böyle bir dünyanın var olduğunun ilk işaretiydi.",
      "It lies beneath the Atatürk dam. The T-shaped pillars found here were the first sign that such a world existed, years before Göbekli Tepe was dug.",
    ),
    f(
      "Kireç taşından yontulmuş insan ve kuş heykelleri, bilinen en eski anıtsal heykeller arasındadır.",
      "Its limestone human and bird figures are among the oldest known monumental sculpture.",
    ),
  ],

  // ————— Doğu Anadolu —————
  ani: [
    f(
      "'Bin bir kilise şehri' olarak anılırdı ve zirvesinde nüfusu yüz bine yaklaştı — çağının İstanbul ve Bağdat'la anılan kentlerinden.",
      "Known as the city of a thousand and one churches, it approached a hundred thousand people at its height, spoken of alongside Constantinople and Baghdad.",
    ),
    f(
      "Katedralin mimarı Trdat, İstanbul'daki Ayasofya'nın depremde çöken kubbesini onaran kişidir.",
      "Trdat, the cathedral's architect, was the man who repaired the earthquake-collapsed dome of Hagia Sophia in Constantinople.",
    ),
    f(
      "İpek Yolu güzergâhı değişince ve 1319 depreminden sonra kent boşaldı; bugün sınır hattında, bozkırın ortasında bomboş duruyor.",
      "When the Silk Road shifted, and after the earthquake of 1319, the city emptied. It stands today on the border, alone in the steppe.",
    ),
  ],
  tuspa: [
    f(
      "Urartu'nun başkentiydi. Kayaya oyulmuş kral mezarlarına ve I. Argişti'nin yıllıklarına, kalenin dik yüzünden bakılabiliyor.",
      "Capital of Urartu. The rock-cut royal tombs and the annals of Argishti I look out from the sheer face of the citadel.",
    ),
    f(
      "Pers Kralı Xerxes'in üç dilli çivi yazılı yazıtı, kayalığın erişilmesi güç bir yerine oyulmuştur ve hâlâ okunabiliyor.",
      "Xerxes' trilingual cuneiform inscription is cut into an all but unreachable spot on the cliff, and can still be read.",
    ),
    f(
      "Kalenin eteğindeki düzlük, 1915 öncesi Eski Van şehrinin yeridir; şehir bugün yok, sadece iki cami ayakta.",
      "The flat ground below the citadel is where the old city of Van stood before 1915; nothing of it remains but two mosques.",
    ),
  ],
  cavustepe: [
    f(
      "Urartu Kralı II. Sarduri'nin kalesidir ve Anadolu'da bilinen en eski tuvaletlerden biri buradadır.",
      "The fortress of the Urartian king Sarduri II, and the site of one of the oldest known lavatories in Anatolia.",
    ),
    f(
      "Haldi Tapınağı'nın cilalı bazalt blokları o kadar düzgün işlenmiştir ki aralarına bıçak girmez.",
      "The polished basalt blocks of the temple of Haldi are dressed so finely that a knife will not pass between them.",
    ),
  ],
  arslantepe: [
    f(
      "MÖ 3300'e tarihlenen yapısı, dünyanın bilinen en eski saraylarından biridir — devlet denen şeyin ilk mimarisi.",
      "Its building of around 3300 BC is among the earliest known palaces in the world: the first architecture of the thing we call a state.",
    ),
    f(
      "Burada bulunan bakır-arsenik alaşımlı kılıçlar, dünyanın bilinen en eski kılıçları sayılır.",
      "The arsenical copper swords found here are counted as the oldest known swords in the world.",
    ),
    f(
      "2021'de UNESCO Dünya Mirası Listesi'ne alındı.",
      "It was inscribed on the UNESCO World Heritage List in 2021.",
    ),
  ],
  harput: [
    f(
      "Urartu'dan Osmanlı'ya kesintisiz kullanılmış bir kaledir; 'Süt Kalesi' adı, harcına su yerine süt karıldığı efsanesinden gelir.",
      "A fortress used without a break from Urartu to the Ottomans. Its name, 'Milk Castle', comes from a legend that milk was mixed into the mortar instead of water.",
    ),
    f(
      "Elazığ şehri, 19. yüzyılda Harput'un ovaya inmesiyle kuruldu; yani modern kent, antik kentin taşınmış halidir.",
      "The city of Elazığ was founded when Harput came down to the plain in the nineteenth century: the modern town is the old one, relocated.",
    ),
  ],
  palu: [
    f(
      "Kaledeki çivi yazılı kaya yazıtı Urartu Kralı I. Menua'ya aittir ve bölgedeki Urartu varlığının en batıdaki kanıtlarındandır.",
      "The cuneiform rock inscription in the citadel belongs to the Urartian king Menua, and is among the westernmost proofs of Urartian reach.",
    ),
    f(
      "Eski Palu, depremlerden sonra 20. yüzyılda terk edildi; cami, kilise ve evleriyle bir hayalet yerleşim olarak duruyor.",
      "Old Palu was abandoned after earthquakes in the twentieth century and stands as a ghost settlement of mosque, church and houses.",
    ),
  ],
  hosap: [
    f(
      "1643'te Mahmudi beyi Sarı Süleyman yaptırdı; kayalık bir tepeyi baştan aşağı saran görüntüsüyle Anadolu'nun en teatral kalelerindendir.",
      "Built in 1643 by Sarı Süleyman, bey of the Mahmudi, and one of the most theatrical castles in Anatolia as it wraps a whole rock outcrop.",
    ),
    f(
      "Anlatıya göre bey, benzerinin bir daha yapılmaması için mimarın elini kestirmiştir.",
      "The story goes that the bey had the architect's hand cut off so that its like could never be built again.",
    ),
  ],
  ahtamar: [
    f(
      "915-921 arasında Kral I. Gagik için yapılan Kutsal Haç Kilisesi'nin dış duvarları baştan sona kabartmalarla kaplıdır: Yunus, Davut ve Golyat, asma dalları ve hayvanlar.",
      "The exterior of the Church of the Holy Cross, built for King Gagik I between 915 and 921, is covered wall to wall in relief: Jonah, David and Goliath, vine scrolls and animals.",
    ),
    f(
      "Kilise 2007'de müze olarak restore edildi ve o tarihten beri yılda bir kez ayin yapılıyor.",
      "The church was restored as a museum in 2007, and a service has been held there once a year since.",
    ),
  ],
  altintepe: [
    f(
      "Urartu kalesinde bulunan sütunlu salon (apadana), Pers apadanalarının habercisi sayılır.",
      "The columned hall of this Urartian fortress is regarded as a forerunner of the Persian apadana.",
    ),
    f(
      "Duvar resimleri ve kral mezarlarından çıkan bronz eserler, Urartu sanatının en iyi korunmuş örneklerindendir.",
      "Its wall paintings and the bronzes from its royal tombs are among the best-preserved works of Urartian art.",
    ),
  ],
  ayanis: [
    f(
      "Urartu Kralı II. Rusa'nın MÖ 7. yüzyılda tek seferde kurduğu kale, kısa süre sonra yıkıldığı için tek dönemlik bir zaman kapsülüdür.",
      "Built in one campaign by Rusa II in the seventh century BC and destroyed soon after, the fortress is a single-period time capsule.",
    ),
    f(
      "Haldi Tapınağı'nın duvarındaki uzun çivi yazılı yazıt, kalenin kuruluşunu kralın kendi ağzından anlatır.",
      "The long cuneiform inscription on the wall of the temple of Haldi tells the fortress's founding in the king's own words.",
    ),
  ],

  // ————— Kalan İç Anadolu —————
  "asikli-hoyuk": [
    f(
      "Orta Anadolu'nun bilinen en eski köyüdür (yaklaşık MÖ 8400) ve tarımın buraya nasıl geldiğini adım adım gösterir.",
      "The oldest known village in central Anatolia, from about 8400 BC, and a step-by-step record of how farming arrived here.",
    ),
    f(
      "Burada bulunan bir kadın iskeletindeki kafatası ameliyatı izi, dünyanın en eski beyin cerrahisi kanıtlarından biridir — ve hasta ameliyattan sonra bir süre yaşamıştır.",
      "A woman's skeleton found here bears the trace of skull surgery, among the oldest evidence of brain surgery anywhere — and she lived on for some time afterwards.",
    ),
  ],
  acemhoyuk: [
    f(
      "Asur ticaret kolonileri çağının büyük merkezlerindendi; saray depolarından fildişi eserler ve obsidiyen kaplar çıktı.",
      "One of the great centres of the Assyrian trading-colony period; its palace stores yielded ivories and obsidian vessels.",
    ),
    f(
      "Sarayda bulunan mühür baskıları, Mezopotamya ve Suriye ile kurulan ticaretin kimlerle yapıldığını isim isim belgeliyor.",
      "Seal impressions from the palace document, name by name, who the trade with Mesopotamia and Syria was done with.",
    ),
  ],
  sapinuwa: [
    f(
      "Hitit'in ikinci başkenti sayılır; buradan dört binden fazla çivi yazılı tablet çıktı.",
      "Reckoned a second Hittite capital, it has produced more than four thousand cuneiform tablets.",
    ),
    f(
      "Sarayı yakan yangın, kil tabletleri pişirerek sertleştirdi ve arşivi yok etmek yerine günümüze taşıdı.",
      "The fire that destroyed the palace baked the clay tablets hard, carrying the archive down to us instead of destroying it.",
    ),
  ],
  midas: [
    f(
      "Frig kaya anıtı 17 metre yüksekliğindedir ve üzerinde eski Frigce yazıtta 'Midas' adı geçer.",
      "The Phrygian rock monument stands seventeen metres high, and an old Phrygian inscription on it names Midas.",
    ),
    f(
      "Bir tapınak cephesi gibi görünür ama arkasında oda yoktur: kapı da dahil her şey kabartmadır, kayaya çizilmiş bir tapınak fikridir.",
      "It looks like a temple façade but there is no chamber behind it: everything, the door included, is relief — the idea of a temple drawn on rock.",
    ),
  ],

  // ————— Kalan Ege —————
  kaunos: [
    f(
      "Kaya mezarları tapınak cephesi biçiminde, dik kayalığa oyulmuştur ve Dalyan Kanalı'ndan tekneyle geçerken tam karşıdan görülür.",
      "The rock tombs are cut into the cliff as temple façades, and face you head-on as the boat passes down the Dalyan channel.",
    ),
    f(
      "Kentin limanı alüvyonla dolup göle dönüştü; deniz kenti, bugün sazlıkların arkasında kaldı.",
      "Its harbour silted into a lake: a maritime city now stranded behind the reed beds.",
    ),
    f(
      "Antik yazarlar Kaunosluların sıtmadan ötürü solgun olduğunu yazar; Strabon halkın 'yeşilimsi' teninden söz eder.",
      "Ancient writers describe the Caunians as sallow with malaria; Strabo remarks on the greenish complexion of its people.",
    ),
  ],
  stratonikeia: [
    f(
      "Antik kentin içine bir Osmanlı-Türk köyü kuruldu. Eskihisar'ın evleri, kahvesi ve çeşmesi antik sütunların arasında durur; iki katman iç içe yaşar.",
      "An Ottoman village was built inside the ancient city. The houses, coffee house and fountain of Eskihisar stand among ancient columns — two layers living inside each other.",
    ),
    f(
      "Kuzey kent kapısı, Anadolu'daki en büyük antik kent kapılarından biridir.",
      "Its north gate is one of the largest ancient city gates in Anatolia.",
    ),
    f(
      "Kent adını Seleukos kraliçesi Stratonike'den alır; kraliçe, kayınpederiyle evlendirilen ünlü hikâyenin kadınıdır.",
      "The city takes its name from the Seleucid queen Stratonice — the woman of the famous story in which she was married to her stepson's father.",
    ),
  ],
  labraunda: [
    f(
      "Zeus Labraundos kutsal alanını Karya satrapı Maussollos ve kardeşi Idrieus yaptırdı; Mozole'yi yaptıran hanedanın dağdaki tapınağıdır.",
      "The sanctuary of Zeus Labraundos was built by the Carian satrap Mausolus and his brother Idrieus: the mountain temple of the dynasty that raised the Mausoleum.",
    ),
    f(
      "Milas'a 14 kilometrelik bir Kutsal Yol'la bağlıydı; alayın bu yolu tırmanarak geldiği biliniyor.",
      "A fourteen-kilometre Sacred Way linked it to Mylasa, and the procession is known to have climbed it on foot.",
    ),
    f(
      "Buradaki andronlar — kral ziyafet salonları — Yunan dünyasında bilinen en iyi korunmuş örneklerdir.",
      "Its andrones, the royal banqueting halls, are the best-preserved examples known in the Greek world.",
    ),
  ],
  magnesia: [
    f(
      "Artemis Leukophryene Tapınağı, mimar Hermogenes'in geliştirdiği 'pseudodipteros' düzeninin başyapıtıdır ve Vitruvius onu örnek olarak anlatır.",
      "The Temple of Artemis Leukophryene is the masterwork of the pseudodipteral plan devised by Hermogenes, and Vitruvius holds it up as the model.",
    ),
    f(
      "Menderes'in alüvyonu kenti defalarca gömdü; stadyum yüzyıllarca toprak altında kaldıktan sonra kazıyla ortaya çıkarıldı.",
      "The Maeander's silt buried the city again and again; its stadium lay underground for centuries before excavation brought it back.",
    ),
    f(
      "Tapınağın frizindeki Amazon savaşı sahneleri Paris ve Berlin müzelerine dağılmıştır.",
      "The Amazonomachy frieze of the temple is now split between museums in Paris and Berlin.",
    ),
  ],
  teos: [
    f(
      "Dionysos Tapınağı, antik dünyanın Dionysos'a adanmış en büyük tapınağıdır.",
      "Its Temple of Dionysus is the largest temple to the god known from the ancient world.",
    ),
    f(
      "Dionysos sanatçıları birliği burada örgütlendi: tarihin bilinen ilk oyuncu ve müzisyen loncası.",
      "The Artists of Dionysus organised here — the first known guild of actors and musicians in history.",
    ),
    f(
      "Şarap ve aşk şiirleriyle tanınan şair Anakreon bu kentliydi.",
      "Anacreon, the poet of wine and love, came from this city.",
    ),
  ],
  klazomenai: [
    f(
      "Burada bulunan MÖ 6. yüzyıl zeytinyağı işliği, dünyanın bilinen en eski örneklerindendir ve deneysel olarak yeniden kurulup çalıştırıldı.",
      "The sixth-century BC olive oil workshop found here is among the oldest known anywhere, and has been rebuilt and run experimentally.",
    ),
    f(
      "Güneşin 'kızgın bir taş' olduğunu söyleyerek Atina'da yargılanan filozof Anaksagoras buradandır.",
      "Anaxagoras — put on trial in Athens for saying the sun was a red-hot stone — came from here.",
    ),
    f(
      "'Klazomenai lahitleri' denen boyalı pişmiş toprak lahitler, arkaik dönem resim sanatının ender tanıklarıdır.",
      "The painted terracotta 'Clazomenian sarcophagi' are rare witnesses to archaic painting.",
    ),
  ],
  klaros: [
    f(
      "Apollon'un kehanet merkeziydi. Kâhin, tapınağın altındaki odada kutsal kaynaktan su içer ve kehaneti dizeler halinde söylerdi.",
      "An oracle of Apollo. The prophet drank from the sacred spring in a chamber beneath the temple and delivered the answer in verse.",
    ),
    f(
      "Tapınağın altındaki tonozlu kehanet odaları ve su kanalı korunmuştur; ziyaretçiler kâhinin indiği merdiveni görebiliyor.",
      "The vaulted oracular chambers and the water channel beneath the temple survive, and the stair the prophet went down can still be seen.",
    ),
    f(
      "Apollon, Artemis ve Leto'nun yaklaşık üç metrelik heykellerinin parçaları bulundu; sadece ayak ve el parçaları bile insan boyunu aşıyor.",
      "Fragments of roughly three-metre statues of Apollo, Artemis and Leto were found here: even the surviving feet and hands are taller than a person.",
    ),
  ],
  aizanoi: [
    f(
      "Zeus Tapınağı, Anadolu'nun en iyi korunmuş antik tapınağıdır ve altında Kibele'ye ait tonozlu bir alt yapı vardır — iki din, iki kat.",
      "The Temple of Zeus is the best-preserved ancient temple in Anatolia, and beneath it lies a vaulted undercroft belonging to Cybele: two religions, two storeys.",
    ),
    f(
      "Macellum'un duvarına kazınmış Diocletianus'un Fiyat Fermanı, dünyanın bilinen ilk borsa binası sayılan yapıyı bir belge haline getirir.",
      "Diocletian's Price Edict, carved on the wall of the macellum, turns what is called the first known exchange building into a document.",
    ),
    f(
      "Tiyatro ve stadyum sırt sırta tek bir yapı olarak inşa edilmiştir; antik dünyada bu birleşim son derece enderdir.",
      "Theatre and stadium were built back to back as a single structure — a combination extremely rare in the ancient world.",
    ),
  ],

  // ————— Kalan Akdeniz —————
  letoon: [
    f(
      "Leto, Apollon ve Artemis'e adanmış üç tapınak yan yana durur: bir aileye adanmış üçlü kutsal alan.",
      "Three temples stand side by side, to Leto, Apollo and Artemis: a sanctuary dedicated to one family.",
    ),
    f(
      "Likçe-Yunanca-Aramca üç dilli yazıt burada bulundu ve Likçenin çözülmesinde anahtar rol oynadı.",
      "The trilingual inscription in Lycian, Greek and Aramaic was found here, and was key to deciphering Lycian.",
    ),
    f(
      "Yükselen taban suyu nedeniyle alanın bir bölümü su altındadır; tapınak temelleri suya yansıyor.",
      "Rising groundwater has flooded part of the site, and the temple foundations are mirrored in the water.",
    ),
  ],
  limyra: [
    f(
      "Likya Kralı Perikle'nin başkentiydi ve kentin üzerindeki kayalıkta dört yüzden fazla mezar sıralanır.",
      "Capital of the Lycian king Pericles, with more than four hundred tombs ranged on the cliff above it.",
    ),
    f(
      "Augustus'un torunu ve veliahtı Gaius Caesar burada öldü; onun için yapılan anıt mezarın kabartmaları kentte bulundu.",
      "Gaius Caesar, Augustus' grandson and heir, died here; the reliefs of the cenotaph raised for him were found in the city.",
    ),
  ],
  arykanda: [
    f(
      "Dik yamaca teraslar halinde kurulmuştur; tiyatro, stadyum ve hamamlar üst üste basamaklanır ve manzarası antik kentler arasında ayrı anılır.",
      "It is terraced up a steep slope, theatre, stadium and baths stacked one above another, and its view is singled out among ancient cities.",
    ),
    f(
      "Adındaki '-anda' eki Anadolu kökenlidir ve kentin Yunan kolonizasyonundan çok önce var olduğunu gösterir.",
      "The '-anda' ending of its name is native Anatolian, showing the city existed long before Greek colonisation.",
    ),
    f(
      "Antik kaynaklar Arykandalıların eğlenceye düşkünlüğünden ve borca batmışlığından söz eder.",
      "Ancient sources remark on the Arykandans' appetite for pleasure — and on their debts.",
    ),
  ],
  tlos: [
    f(
      "Akropoldeki kaya mezarlarından birinde Bellerophon, kanatlı atı Pegasus'un üzerinde kabartma olarak işlenmiştir.",
      "One of the rock tombs on the acropolis carries a relief of Bellerophon mounted on the winged horse Pegasus.",
    ),
    f(
      "Likya'nın en eski kentlerindendir ve dört bin yıl boyunca kesintisiz yaşandı; akropolün tepesinde 19. yüzyıldan kalma bir Osmanlı ağa kalesi durur.",
      "One of Lycia's oldest cities, inhabited without a break for four thousand years; a nineteenth-century Ottoman lord's castle crowns the acropolis.",
    ),
  ],
  kibyra: [
    f(
      "Odeon'un tabanındaki Medusa, renkli mermer kakma (opus sectile) tekniğiyle yapılmıştır ve türünün en iyi korunmuş örneklerindendir.",
      "The Medusa in the floor of the odeon is worked in cut coloured marble, opus sectile, and is among the best-preserved of its kind.",
    ),
    f(
      "Kayaya oyulmuş stadyumu on bin kişiliktir ve oturma sıraları doğrudan yamaçtan çıkarılmıştır.",
      "Its rock-cut stadium seats ten thousand, its rows carved straight out of the hillside.",
    ),
    f(
      "Kent gladyatör yetiştiriciliği ve at üretimiyle ün yapmıştı; antik kaynaklar Kibyra süvarisini över.",
      "The city was known for training gladiators and breeding horses; ancient sources praise the Kibyran cavalry.",
    ),
  ],
  "antioch-pisidia": [
    f(
      "Aziz Pavlus ilk büyük vaazını burada verdi; Elçilerin İşleri'nde adı geçen sinagogun bulunduğu kent budur.",
      "Saint Paul preached his first major sermon here; this is the city whose synagogue Acts names.",
    ),
    f(
      "Augustus'un kendi eylemlerini anlattığı Res Gestae'nin en önemli Latince kopyalarından biri burada bulundu.",
      "One of the most important Latin copies of Augustus' Res Gestae, his own account of his deeds, was found here.",
    ),
    f(
      "Kent, emekli Roma lejyonerlerine dağıtılan bir koloni olarak kuruldu; sokak planı bir askerî kamp mantığıyla çizilmiştir.",
      "It was founded as a colony settled with retired legionaries, and its street plan follows the logic of a military camp.",
    ),
  ],
  anemurium: [
    f(
      "Anadolu'nun en güney ucundadır; açık havada Kıbrıs kıyıları altmış kilometre karşıda görünür.",
      "It stands on the southernmost point of Anatolia; on a clear day the coast of Cyprus is visible sixty kilometres away.",
    ),
    f(
      "Üç yüzden fazla anıt mezarıyla antik dünyanın en büyük nekropollerinden birine sahiptir; mezarların çoğu iki katlı ve tonozludur.",
      "With over three hundred monumental tombs it has one of the largest necropolises of the ancient world, most of them two-storeyed and vaulted.",
    ),
    f(
      "İki hamamı, iki tiyatrosu ve mozaik tabanlı kiliseleriyle kent, kıyıdan denize doğru terk edildiği gibi duruyor.",
      "With two bath complexes, two theatres and mosaic-floored churches, the city lies as it was left, sloping to the sea.",
    ),
  ],
  uzuncaburc: [
    f(
      "Zeus Olbios Tapınağı, Anadolu'daki en erken Korint düzenli tapınaklardan biridir; başlıkların icadına yakın bir tarihte yapılmıştır.",
      "The Temple of Zeus Olbios is among the earliest Corinthian temples in Anatolia, raised not long after the order itself was devised.",
    ),
    f(
      "Kenti Teukridler adlı bir rahip-kral hanedanı yönetti: din adamlığı ile hükümdarlığın aynı kişide birleştiği ender bir düzen.",
      "The city was ruled by the Teucrids, a dynasty of priest-kings — a rare arrangement in which priesthood and rule sat in the same person.",
    ),
    f(
      "Kente adını veren yirmi iki metrelik Helenistik kule hâlâ ayaktadır: 'Uzuncaburç', uzun burç demektir.",
      "The twenty-two-metre Hellenistic tower that gives the village its name still stands: 'Uzuncaburç' means 'tall tower'.",
    ),
  ],
  karatepe: [
    f(
      "Buradaki çift dilli yazıt — Fenike alfabesi ve Luvi hiyeroglifi yan yana — Luvi hiyeroglifinin çözülmesini sağlayan anahtardı: Anadolu'nun Rosetta Taşı.",
      "The bilingual inscription here, Phoenician alphabet beside Luwian hieroglyphs, was the key that unlocked Luwian hieroglyphic: Anatolia's Rosetta Stone.",
    ),
    f(
      "Kral Azatiwataş'ın kalesindeki kabartmalar yerlerinden hiç sökülmedi; ziyaretçi onları kralın diktiği yerde görür.",
      "The reliefs in King Azatiwataş's fortress were never removed; a visitor sees them where the king set them.",
    ),
    f(
      "Kazıyı yürüten Halet Çambel, alanın çevresini milli park ilan ettirerek eserleri müzeye taşımak yerine yerinde korumayı seçti.",
      "Halet Çambel, who led the excavation, had the surroundings declared a national park — choosing to protect the works in place rather than move them to a museum.",
    ),
  ],
  anavarza: [
    f(
      "Kent, dik yamaçlı devasa bir kaya kütlesinin dibine kurulmuştur; kale tepede, kent ovadadır.",
      "The city sits at the foot of a vast sheer rock; the castle is on top and the city on the plain.",
    ),
    f(
      "Sütunlu caddesi ve zafer takı ayaktadır; villalarından çıkan mozaikler bölgenin en iyi örneklerindendir.",
      "Its colonnaded street and triumphal arch survive, and the mosaics from its villas are among the finest in the region.",
    ),
    f(
      "Yüzyıllarca Avrupa'nın temel eczacılık kitabı olan De Materia Medica'nın yazarı Dioskorides buradandır.",
      "Dioscorides, author of De Materia Medica — Europe's standard pharmacology text for centuries — came from here.",
    ),
  ],
  "tell-atchana": [
    f(
      "Kral Idrimi, kendi heykelinin üzerine hayat hikâyesini 104 satır halinde yazdırdı: tahtı kaybedişini, kaçışını ve geri dönüşünü. Heykel bugün British Museum'da.",
      "King Idrimi had his life story carved onto his own statue in 104 lines — losing his throne, fleeing, and returning. The statue is now in the British Museum.",
    ),
    f(
      "Sarayın duvarlarında Girit'teki Minos saraylarının tekniğiyle yapılmış freskler bulundu; Ege ile Doğu Akdeniz arasındaki bağın en somut kanıtlarından.",
      "Frescoes painted in the technique of the Minoan palaces of Crete were found on the palace walls: some of the most concrete evidence of the link between the Aegean and the eastern Mediterranean.",
    ),
    f(
      "Kral Niqmepa'nın çivi yazılı arşivi, Tunç Çağı'nda küçük bir krallığın büyük güçler arasında nasıl ayakta kaldığını belgeliyor.",
      "The cuneiform archive of King Niqmepa records how a small Bronze Age kingdom kept its footing between great powers.",
    ),
  ],
};

/** The extra facts for a site, or an empty list when none are written yet. */
export function factsFor(slug: string): Localized[] {
  return siteFacts[slug] ?? [];
}
