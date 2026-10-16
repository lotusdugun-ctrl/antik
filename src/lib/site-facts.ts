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
      "Stadyumun iki kavisli ucu da hâlâ ayaktadır.",
      "Both curved ends of the stadium are still standing.",
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
      "Astronom Eudoksos buralıydı; kentte gözlemevi olduğu düşünülen yapı onun adıyla anılır.",
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
      "Kapadokya Kralı Arkhelaos burayı ikinci başkenti yaptı ve Augustus onuruna Sebaste adını verdi.",
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
      "Zeus Tapınağı'nın sütunu ve Roma köprüsü bugünkü Silifke'nin trafiği arasında ayakta duruyor.",
      "A column of the Temple of Zeus and the Roman bridge still stand amid the traffic of modern Silifke.",
    ),
  ],

  // ————— Marmara —————
  troya: [
    f(
      "Höyükte dokuz kent üst üste durur. Schliemann 1871'de kazarken Homeros'un Troya'sını aradı, hızla derine inip aradığı katı geçti ve 'Priamos'un Hazinesi'ni bin yıl daha eski bir katta buldu.",
      "Nine cities stand stacked in the mound. Digging in 1871, Schliemann drove straight past the layer he was looking for and found his 'Treasure of Priam' in one a thousand years too old.",
    ),
    f(
      "Tahta attan hiçbir iz bulunmadı. Buna karşılık Hitit tabletlerinde, Troya'nın yeriyle uyuşan 'Wilusa' adlı bir kentle yapılan antlaşmalar geçer.",
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
      "838'de Halife Mutasım kenti kuşatıp yıktı. İslam'a geçmeyi reddeden komutanların idamı, 'Amorium'un 42 Şehidi' olarak Bizans azizler takvimine girdi.",
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
      "Diogenes bir küpün içinde yaşardı; Büyük İskender ona ne dilediğini sorduğunda 'gölge etme' demişti.",
      "Diogenes lived in a jar, and when Alexander asked him what he wanted, he said 'stand out of my light'.",
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
      "Kommagene Kralı I. Antiokhos, 2150 metre yükseklikte kendine bir mezar tümülüsü yaptırdı ve etrafına dev tanrı heykelleri dizdirdi. Depremler bütün başları yere indirdi; heykeller bugün başsız oturuyor, başlar önlerinde yerde duruyor.",
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
      "Pers Kralı Kserkses'in üç dilli çivi yazılı yazıtı, kayalığın erişilmesi güç bir yerine oyulmuştur ve hâlâ okunabiliyor.",
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
      "Kilise 2007'de restore edilerek müze olarak açıldı.",
      "The church was restored and opened as a museum in 2007.",
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
      "Hitit krallarının ikametgâhı olarak kullanıldığı için kimi araştırmacılar onu ikinci bir başkent sayar; kazılarda, A Yapısı dışındakiler de dahil, toplam dört binden fazla çivi yazılı tablet ve parça çıktı.",
      "Because Hittite kings resided here, some scholars count it a second capital; in all, including those found outside Building A, the excavations have produced more than four thousand cuneiform tablets and fragments.",
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
      "Kaya mezarları tapınak cephesi biçiminde, dik kayalığa oyulmuştur ve Dalyan Çayı'ndan tekneyle geçerken tam karşıdan görülür.",
      "The rock tombs are cut into the cliff as temple façades, and face you head-on as the boat passes down the Dalyan river.",
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
      "Zeus Labraundos kutsal alanını Karya satrapı Mausolos ve kardeşi Idrieus yaptırdı; Mozole'yi yaptıran hanedanın dağdaki tapınağıdır.",
      "The sanctuary of Zeus Labraundos was built by the Carian satrap Mausolus and his brother Idrieus: the mountain temple of the dynasty that raised the Mausoleum.",
    ),
    f(
      "Mylasa'ya (bugünkü Milas) 14 kilometrelik bir Kutsal Yol'la bağlıydı; alayın bu yolu tırmanarak geldiği biliniyor.",
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
      "Apollon, Artemis ve Leto heykellerinin parçaları bulundu; kalan ayak ve el parçaları bile heykellerin ne kadar dev olduğunu gösteriyor.",
      "Fragments of the statues of Apollo, Artemis and Leto were found here: even the surviving feet and hands show how colossal they were.",
    ),
  ],
  aizanoi: [
    f(
      "Zeus Tapınağı, Anadolu'nun en iyi korunmuş Zeus tapınağıdır ve altında Kibele'ye ait tonozlu bir alt yapı vardır — iki din, iki kat.",
      "The Temple of Zeus is the best-preserved temple of Zeus in Anatolia, and beneath it lies a vaulted undercroft belonging to Cybele: two religions, two storeys.",
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
      "Likya Kralı Perikles'in başkentiydi ve kentin üzerindeki kayalıkta dört yüzden fazla mezar sıralanır.",
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
      "Anadolu'nun en güney ucundadır; açık havada Kıbrıs kıyıları 64 kilometre karşıda görünür.",
      "It stands on the southernmost point of Anatolia; on a clear day the coast of Cyprus is visible 64 kilometres away.",
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
      "Kente adını veren yirmi iki metrelik Helenistik kule hâlâ ayaktadır.",
      "The twenty-two-metre Hellenistic tower that gives the village its name still stands.",
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

  // ————— Anıtlar ve mühendislik —————
  "titus-tuneli": [
    f(
      "Tünel 1380 metre uzunluğunda, yer yer 7 metre yüksekliğinde ve tamamen elle, çekiç ve keskiyle oyulmuştur. Antik dünyanın bilinen en büyük su tahliye tünelidir.",
      "The tunnel runs 1,380 metres, stands up to seven metres high in places, and was cut entirely by hand with hammer and chisel — the largest known diversion tunnel of the ancient world.",
    ),
    f(
      "İki uçtan aynı anda kazılmaya başlandı ve ekipler dağın ortasında buluştu; birleşme noktasındaki hafif kayma bugün tünelin içinde çıplak gözle görülebiliyor.",
      "Digging began from both ends at once and the teams met inside the mountain; the slight misalignment where they joined can still be seen with the naked eye.",
    ),
    f(
      "Tünelin çıkışındaki Beşikli Mağara, kayaya oyulmuş on iki mezar odasından oluşan bir Roma nekropolüdür.",
      "The Beşikli Cave at the tunnel's outflow is a Roman necropolis of twelve rock-cut burial chambers.",
    ),
  ],
  karain: [
    f(
      "Mağaranın dolgusu 11 metre kalınlığındadır ve içinde yarım milyon yıllık kesintisiz bir yerleşim dizisi barındırır — Türkiye'de bunun benzeri yoktur.",
      "The cave's deposits are eleven metres deep and hold an unbroken sequence of half a million years of occupation — there is nothing else like it in Türkiye.",
    ),
    f(
      "Anadolu'da bulunan ilk Neandertal kalıntıları buradan çıktı; aynı katmanlarda Homo sapiens izleri de var.",
      "The first Neanderthal remains found in Anatolia came from here, and traces of Homo sapiens occur in the same layers.",
    ),
  ],
  ivriz: [
    f(
      "Kabartmada tanrı kraldan neredeyse iki kat büyük gösterilmiştir; boyut farkı Geç Hitit sanatında hiyerarşiyi anlatmanın standart yoludur.",
      "The god is shown nearly twice the king's height: in Neo-Hittite art, scale is the standard way of stating rank.",
    ),
    f(
      "Tanrının elindeki başak ve üzüm, bir tanrının elinde tarım ürünüyle betimlendiği bilinen en eski örneklerdendir.",
      "The grain and grapes in the god's hands are among the earliest known images of a deity holding the produce of farming.",
    ),
  ],
  eflatunpinar: [
    f(
      "Anıt, bir kaynağın tam üzerine kurulmuştur ve su hâlâ akmaktadır: üç bin yıl önce tasarlanan havuz bugün de dolu.",
      "The monument was built directly over a spring, and the water still runs: the pool designed three thousand years ago is full today.",
    ),
    f(
      "Hitit dünyasından günümüze kalan anıtsal su yapısı sayısı bir elin parmaklarını geçmez; Eflatunpınar bunların en eksiksizidir.",
      "Monumental Hittite waterworks that survive can be counted on one hand, and Eflatunpınar is the most complete of them.",
    ),
  ],

  // ————— Kapadokya —————
  goreme: [
    f(
      "Karanlık Kilise adını tek bir küçük pencereden alır; içeri az ışık girdiği için freskleri Kapadokya'nın en canlı renkli resimleridir.",
      "The Dark Church is named for its single small window: because so little light gets in, its frescoes are the most vividly coloured in Cappadocia.",
    ),
    f(
      "Kaya kiliselerinin çoğunda taşıyıcı işlevi olmayan sütunlar ve kemerler yontulmuştur — kayanın içinde gereksiz olan bu ögeler, yalnızca gerçek bir kilise gibi görünsün diye yapılmıştır.",
      "Most of the rock churches were carved with columns and arches that hold nothing up. Inside solid rock they are structurally pointless: they are there so the space would look like a real church.",
    ),
    f(
      "Tokalı Kilise'nin mavi rengi, o dönemde altından pahalı olan lapis lazuli taşından elde edilmişti.",
      "The blue of the Buckle Church was made from lapis lazuli — at the time, more expensive than gold.",
    ),
  ],
  derinkuyu: [
    f(
      "Katları ayıran yuvarlak taş kapıların ağırlığı bir tonu bulabilir; kapılar yalnızca içeriden açılabilecek biçimde tasarlanmıştır.",
      "The round stone doors between levels can weigh up to about a tonne and were designed to be opened only from the inside.",
    ),
    f(
      "55 metre derinliğindeki havalandırma bacası aynı zamanda kuyu olarak da kullanılıyordu.",
      "The 55-metre ventilation shaft also served as a well.",
    ),
  ],
  kaymakli: [
    f(
      "Koridorlar kasten alçak ve dar yapılmıştır: içeri girmek zorunda kalan bir saldırgan eğilmek ve tek sıra ilerlemek zorundadır.",
      "The corridors were made deliberately low and narrow: an attacker who got in had to stoop, and go single file.",
    ),
    f(
      "Yüzeydeki köyün evleri hâlâ bu tünellerin üzerinde duruyor ve köylüler bir bölümünü depo olarak kullanmayı sürdürüyor.",
      "The village above still stands on these tunnels, and its people still use parts of them for storage.",
    ),
  ],
  zelve: [
    f(
      "Zelve, aynı kaya kütlesinde bir kaya kilisesi ile kayaya oyulmuş bir caminin yan yana bulunduğu ender yerlerdendir.",
      "Zelve is one of the few places where a rock-cut church and a rock-cut mosque stand side by side in the same cliff.",
    ),
    f(
      "Köy, kayaların çökme tehlikesi nedeniyle boşaltılmıştı.",
      "The village was evacuated because the rock was starting to collapse.",
    ),
  ],
  ihlara: [
    f(
      "Vadi 14 kilometre uzunluğunda ve yer yer 100 metre derinliğindedir; duvarlarına yüzden fazla kilise ve şapel oyulmuştur.",
      "The valley runs fourteen kilometres and reaches a hundred metres deep, with more than a hundred churches and chapels cut into its walls.",
    ),
    f(
      "Freskler iki ayrı dünyanın resmini bir arada gösterir: yerel Kapadokya üslubu Doğu etkisi taşırken, aynı vadideki bazı kiliseler İstanbul saray üslubuyla boyanmıştır.",
      "The frescoes hold two worlds together: the local Cappadocian manner shows eastern influence, while other churches in the same valley are painted in the court style of Constantinople.",
    ),
  ],

  // ————— Manastır ve kiliseler —————
  sumela: [
    f(
      "Manastır, vadi tabanından 300 metre yükseklikteki dik kayaya yaslanmıştır; yapıya ulaşan tek yol yamacı tırmanan patikadır.",
      "The monastery is pressed against a cliff 300 metres above the valley floor, reached only by the path that climbs the slope.",
    ),
    f(
      "Kaya Kilisesi'nin dış duvarı da baştan sona fresklidir: içeri sığmayanların ayini dışarıdan izleyebilmesi için resimler binanın dışına taşırılmıştır.",
      "The rock church is frescoed on the outside too, so that those who could not fit in could follow the service from the terrace.",
    ),
    f(
      "Osmanlı padişahları manastırın ayrıcalıklarını fermanlarla korudu; Yavuz Sultan Selim'in verdiği ferman da bunların arasındadır.",
      "Ottoman sultans confirmed the monastery's privileges by decree — among them Selim I.",
    ),
  ],
  ayasofya: [
    f(
      "Kubbe 55 metre yükseklikte ve 31 metre çapındadır; bin yıl boyunca dünyanın en büyük kapalı mekânı olarak kaldı.",
      "The dome stands 55 metres high and 31 metres across, and for a thousand years covered the largest enclosed space in the world.",
    ),
    f(
      "Kubbenin tabanındaki kırk pencere sırası, ağırlığı gizleyerek kubbenin havada asılı durduğu izlenimini verir; Prokopios kubbenin 'gökten altın bir zincirle sarkıyor gibi' göründüğünü yazar.",
      "The ring of forty windows at the dome's base hides its weight and makes it seem to float; Procopius wrote that it looked as if it hung from heaven on a golden chain.",
    ),
    f(
      "Kuzey galerinin mermer korkuluğunda bir Varang muhafızının kazıdığı rünik yazıt vardır — 'Halfdan bunu yazdı' diye okunur.",
      "A Varangian guardsman scratched a runic inscription into a marble parapet in the north gallery: it reads as 'Halfdan carved this'.",
    ),
  ],
  kariye: [
    f(
      "Parekklesion'daki Anastasis (Diriliş) freski Bizans resminin en tanınmış eseridir: İsa, Âdem ile Havva'yı bileklerinden tutup mezardan çekip çıkarır.",
      "The Anastasis in the side chapel is the best-known image in Byzantine art: Christ hauls Adam and Eve out of their tombs by the wrists.",
    ),
    f(
      "Bağışçı Theodoros Metokhites, kapı üstündeki mozaikte binanın maketini İsa'ya sunarken betimlenmiştir; devlet adamı olarak servetini kaybetti ve ömrünün sonunu bu manastırda keşiş olarak geçirdi.",
      "The donor Theodore Metochites is shown above the door offering Christ a model of the building. He later lost his fortune and ended his life as a monk in this same monastery.",
    ),
  ],

  // ————— Camiler —————
  selimiye: [
    f(
      "Kubbe 31,25 metre çapıyla Ayasofya'nınkinden geniştir; Sinan ömrü boyunca uğraştığı bu hedefe seksen yaşından sonra ulaştı.",
      "At 31.25 metres the dome is wider than that of Hagia Sophia — the goal Sinan worked towards his whole life, and reached after eighty.",
    ),
    f(
      "Sinan taşıyıcı ayakları duvarlara iterek içeride hiçbir sütunun bölmediği tek bir hacim elde etti: caminin her noktasından mihrap görülür.",
      "By pushing the piers into the walls Sinan won a single volume broken by no column: the mihrab is visible from every point in the mosque.",
    ),
    f(
      "Müezzin mahfilinin altındaki sütunlardan birinde ters duran bir lale motifi vardır; arazisini vakfa vermek istemeyen lale bahçesi sahibinin inadını kaydettiği anlatılır.",
      "One column beneath the muezzin's platform carries an upside-down tulip, said to record the stubbornness of a tulip grower who would not give up his land.",
    ),
  ],
  divrigi: [
    f(
      "Taç kapılardaki kabartmalar o kadar derindir ki taş dokuma kumaş etkisi verir; İslam mimarisinde bu ölçekte ve serbestlikte başka bir bezeme yoktur.",
      "The carving on the portals is so deep that the stone reads as woven cloth; no other ornament in Islamic architecture works at this scale or this freedom.",
    ),
    f(
      "Yılın belirli günlerinde güneş, batı kapısının kabartmaları üzerinde namaz kılan bir insan silueti oluşturur.",
      "On certain days of the year the sun casts, across the west portal's carving, the silhouette of a figure at prayer.",
    ),
    f(
      "Darüşşifada hastaların su sesi ve müzikle tedavi edildiği, avlunun akustiğinin bunun için tasarlandığı kabul edilir.",
      "The hospital is held to have treated patients with the sound of water and with music, and its courtyard acoustics to have been designed for it.",
    ),
  ],
  suleymaniye: [
    f(
      "Kandillerin isi, tavandaki hava akımıyla tek bir odada toplanırdı; biriken kurum hattatların mürekkebi olurdu.",
      "Soot from the lamps was funnelled by the airflow into a single chamber and collected to make ink for calligraphers.",
    ),
    f(
      "Duvarların içine akustik için boşluklu küpler yerleştirilmiştir; imamın sesi mikrofonsuz olarak caminin her yerinden duyulur.",
      "Hollow jars were built into the walls for the acoustics: without amplification, the imam is heard everywhere in the mosque.",
    ),
    f(
      "Sinan kendi türbesini külliyenin dışına, köşedeki mütevazı bir yere yaptırdı; yaptığı camiye değil, ona giden yola bakar.",
      "Sinan placed his own tomb outside the complex, in a modest corner — facing not the mosque he built but the road to it.",
    ),
  ],

  // ————— Saray ve kaleler —————
  topkapi: [
    f(
      "Saray tek bir yapı değil, dört avlu boyunca uzanan bir yerleşkedir; içeri doğru gidildikçe girebilenlerin sayısı azalır ve dördüncü avlu yalnızca padişaha açıktır.",
      "The palace is a compound, not a building: four courtyards deep, each admitting fewer people, until the fourth is open to the sultan alone.",
    ),
    f(
      "Mutfaklarda günde beş bine yakın kişiye yemek çıkardı; bacaları Sinan'ın yeniden tasarladığı bu yapılar bugün Çin porselenleri koleksiyonunu barındırıyor.",
      "The kitchens fed close to five thousand people a day. Sinan redesigned their chimneys, and the buildings now hold the Chinese porcelain collection.",
    ),
    f(
      "Harem'in duvarlarındaki İznik çinileri, 16. yüzyılda kaybolan ve bir daha üretilemeyen mercan kırmızısıyla boyanmıştır.",
      "The İznik tiles of the Harem carry the coral red that was lost in the sixteenth century and never reproduced.",
    ),
  ],
  "ishak-pasa": [
    f(
      "Sarayın merkezi ısıtma ve kanalizasyon sistemi vardı; 18. yüzyılda Anadolu'da bu donanıma sahip başka bir konut yapısı bilinmiyor.",
      "The palace had central heating and a drainage system — no other residence in eighteenth-century Anatolia is known to have had either.",
    ),
    f(
      "Altın kaplama kapı kanatları 1917'de sökülüp Rusya'ya götürüldü ve bugün Moskova'da bir müzede sergileniyor.",
      "Its gilded door leaves were removed to Russia in 1917 and are shown today in a Moscow museum.",
    ),
    f(
      "Yapıda Selçuklu, Osmanlı, Gürcü ve Ermeni taş işçiliği aynı cephede yan yana durur; hiçbir üslubun tek başına hâkim olmadığı ender bir örnektir.",
      "Seljuk, Ottoman, Georgian and Armenian stonework stand side by side on the same façade — a rare case in which no one style takes over.",
    ),
  ],
  "rumeli-hisari": [
    f(
      "Kale, İstanbul kuşatmasından önce yalnızca dört ayda tamamlandı; üç büyük kulenin her biri bir vezire verilmişti ve kuleler hâlâ onların adını taşır.",
      "The fortress went up in four months before the siege of Constantinople. Each of its three great towers was assigned to a vizier, and still carries his name.",
    ),
    f(
      "İnşaat sırasında Boğaz'dan izinsiz geçmeye çalışan bir Venedik gemisi batırıldı; olay Bizans'ın dışarıdan yardım umudunu fiilen bitirdi.",
      "A Venetian ship that tried to run the strait while it was being built was sunk — which effectively ended Byzantine hopes of relief.",
    ),
  ],
  "diyarbakir-surlari": [
    f(
      "5,8 kilometrelik bazalt sur, Çin Seddi'nden sonra dünyanın en uzun kesintisiz savunma duvarı sayılır.",
      "Its 5.8 kilometres of basalt are reckoned the longest unbroken defensive circuit in the world after the Great Wall.",
    ),
    f(
      "Burçların üzerindeki kitabeler Roma'dan Osmanlı'ya kenti yöneten her hanedanın imzasını taşır: sur, taş üzerine yazılmış bir iktidar arşividir.",
      "The inscriptions on its towers carry the signature of every dynasty that held the city, from Rome to the Ottomans: the wall is an archive of power written in stone.",
    ),
    f(
      "Surların dibindeki Hevsel Bahçeleri sekiz bin yıldır kesintisiz ekilip biçiliyor ve UNESCO listesine surlarla birlikte tek bir bütün olarak girdi.",
      "The Hevsel Gardens below the walls have been farmed without a break for eight thousand years, and UNESCO inscribed them together with the walls as one whole.",
    ),
  ],

  // ————— Tarihi kent dokuları —————
  safranbolu: [
    f(
      "Kasabada bin kadar tescilli Osmanlı evi ayaktadır; demiryolu ve karayolu güzergâhlarının Safranbolu'yu atlaması dokuyu koruyan asıl etken oldu.",
      "Around a thousand registered Ottoman houses still stand. The railway and the highway both passed the town by, and that is what preserved it.",
    ),
    f(
      "Evlerin çoğunda harem ile selamlık arasında dönen bir dolap vardır: yemek, iki taraf birbirini görmeden bu raf döndürülerek aktarılırdı.",
      "Most houses have a revolving cupboard between the family and guest quarters: food was passed by turning the shelf, without either side seeing the other.",
    ),
    f(
      "Kasabanın adı, çevresinde yetiştirilen ve bir zamanlar altınla tartılan safrandan gelir.",
      "The town is named for the saffron grown around it, once weighed against gold.",
    ),
  ],
  cumalikizik: [
    f(
      "Köy, geliri bir vakfa bağlandığı için yedi yüzyıl boyunca bölünmedi; sokak dokusu ve parselleme 14. yüzyıldan bu yana değişmedi.",
      "Because its income was tied to a foundation, the village was never broken up: its street pattern and plot divisions are unchanged since the fourteenth century.",
    ),
    f(
      "Yaklaşık 270 evin yarısından fazlası hâlâ ayaktadır ve içinde yaşanmaya devam eder — burası müze değil, çalışan bir köydür.",
      "More than half of its roughly 270 houses still stand and are still lived in: this is a working village, not a museum.",
    ),
  ],
  "mardin-eski-kent": [
    f(
      "Kent, her evin damı bir üstündeki evin avlusu olacak biçimde teraslanmıştır; bu düzen bütün kente kesintisiz bir ova manzarası verir.",
      "The town is terraced so that each house's roof is the courtyard of the one above, which gives every house an unbroken view over the plain.",
    ),
    f(
      "Cami, medrese, kilise ve manastır aynı sokakta yan yana durur; Süryani cemaatinin Deyrulzafaran Manastırı 1500 yıldır aynı yerdedir.",
      "Mosque, madrasa, church and monastery stand on the same street, and the Syriac monastery of Deyrulzafaran has been in the same place for 1,500 years.",
    ),
    f(
      "Kasımiye Medresesi'nin avlusundaki uzun havuz, kaynaktan çıkan, havuzda duran ve akıp giden suyla insan ömrünü anlatacak biçimde tasarlanmıştır.",
      "The long pool in the Kasımiye Madrasa was designed to describe a human life: water rises, rests in the basin, and flows away.",
    ),
  ],

  // ————— Müzeler —————
  "anadolu-medeniyetleri-muzesi": [
    f(
      "Müze, 15. yüzyıldan kalma bir bedesten ile bir hanın restore edilip birleştirilmesiyle kuruldu; yani bina da koleksiyonun bir parçasıdır.",
      "The museum was made by restoring and joining a fifteenth-century bedesten and a han: the building is part of the collection.",
    ),
    f(
      "1997'de 'Yılın Avrupa Müzesi' seçildi; ödülü kazanan ilk Türkiye müzesidir.",
      "It was named European Museum of the Year in 1997, the first museum in Türkiye to win the award.",
    ),
    f(
      "Dünyanın en kapsamlı Hitit ve Geç Hitit koleksiyonu buradadır; Karatepe, Carchemish ve Arslantepe'nin ortostatları aynı salonda sıralanır.",
      "It holds the world's fullest Hittite and Neo-Hittite collection: the orthostats of Karatepe, Carchemish and Arslantepe line up in one hall.",
    ),
  ],
  "istanbul-arkeoloji-muzeleri": [
    f(
      "Türkiye'nin ilk müzesidir ve eski eserlerin yurt dışına çıkarılmasını yasaklayan düzenlemelerle birlikte doğdu: kazıdan çıkanın ülkede kalması için bir yer gerekiyordu.",
      "Türkiye's first museum, born alongside the rules that stopped antiquities leaving the country: what came out of the ground needed somewhere to stay.",
    ),
    f(
      "İskender Lahdi'nin adı yanıltıcıdır: lahit İskender için değil, çağdaşı Sidon kralı Abdalonymos için yapılmıştır.",
      "The Alexander Sarcophagus is misnamed: it was made not for Alexander but for Abdalonymus, king of Sidon.",
    ),
    f(
      "Kadeş Antlaşması'nın çivi yazılı tableti buradadır — bilinen en eski yazılı barış antlaşmasının bir kopyası New York'taki BM binasında asılıdır.",
      "The cuneiform tablet of the Treaty of Kadesh is here; a copy of the oldest known written peace treaty hangs at the UN in New York.",
    ),
  ],
  "zeugma-muzesi": [
    f(
      "Dünyanın en büyük mozaik müzesidir; sergilenen mozaikler Birecik Barajı suları yükselmeden önce kurtarma kazısıyla sökülüp çıkarıldı.",
      "It is the largest mosaic museum in the world, and its floors were lifted out in a rescue dig before the Birecik dam filled.",
    ),
    f(
      "Mozaikler, bulundukları odaların planına sadık kalarak yerleştirilmiştir: ziyaretçi mozaiklerin üzerinde değil, evlerin içinde dolaşır.",
      "The mosaics are laid out following the plans of the rooms they came from, so a visitor walks through the houses rather than over the floors.",
    ),
    f(
      "'Çingene Kızı' aslında büyük bir mozaiğin küçük bir parçasıdır; figürün bir Menad ya da toprak tanrıçası Gaia olduğunu savunan araştırmacılar vardır.",
      "The 'Gypsy Girl' is a small fragment of a much larger mosaic, and some scholars read the figure as a maenad, or as the earth goddess Gaia.",
    ),
  ],
  "sanliurfa-muzesi": [
    f(
      "Türkiye'nin en büyük kapalı sergi alanına sahiptir ve Göbekli Tepe'nin bir yapısı, kazı alanındaki ölçüleriyle müzenin içinde yeniden kurulmuştur.",
      "It has the largest indoor exhibition space in Türkiye, and one of the enclosures of Göbekli Tepe has been rebuilt inside it at full excavation scale.",
    ),
    f(
      "Balıklıgöl Heykeli yaklaşık 11.000 yaşındadır ve bilinen en eski insan boyutlu heykeldir; gözlerine obsidyen yerleştirilmiş, ağzı ise hiç yapılmamıştır.",
      "The Balıklıgöl statue is about 11,000 years old, the oldest known life-size human figure. Obsidian was set into its eyes; it was never given a mouth.",
    ),
  ],
  "hatay-muzesi": [
    f(
      "Antakya, Roma İmparatorluğu'nun en büyük üçüncü kentiydi; çevresindeki villaların taban mozaikleri dünyanın en zengin Roma mozaik koleksiyonlarından birini oluşturur.",
      "Antioch was the third city of the Roman Empire, and the floors of the villas around it make up one of the richest collections of Roman mosaic in the world.",
    ),
    f(
      "Koleksiyondaki 'Uğursuzluğa Karşı' mozaiği nazarı bir göz olarak resmeder ve üstüne kargalar, bir akrep ve bir yılan salar: MS 2. yüzyıldan kalma bir muska.",
      "The museum's 'Evil Eye' mosaic paints the curse as an eye and sets crows, a scorpion and a snake on it — a charm from the second century AD.",
    ),
  ],
  "efes-muzesi": [
    f(
      "Artemis heykellerinin gövdesini kaplayan yumurta biçimli çıkıntıların ne olduğu hâlâ tartışılır: göğüs, boğa testisi, hurma ya da adak keseleri olduğu öne sürülmüştür.",
      "What the egg-shaped protrusions on the Artemis statues are is still argued: breasts, bulls' testicles, dates and votive pouches have all been proposed.",
    ),
    f(
      "Yamaç Evler'in fresk ve mozaikleri buradadır; Roma'da bir zenginin evinin içinin nasıl göründüğünü gösteren en eksiksiz buluntu gruplarındandır.",
      "The frescoes and mosaics of the Terrace Houses are here — among the fullest surviving evidence of what the inside of a wealthy Roman home looked like.",
    ),
  ],
  "antalya-muzesi": [
    f(
      "Müze 1922'de, kentteki eserlerin yurt dışına çıkarılmasını engellemek isteyen bir öğretmenin kişisel çabasıyla kuruldu.",
      "The museum was founded in 1922 through the personal effort of a schoolteacher trying to keep the city's antiquities from leaving the country.",
    ),
    f(
      "'Ağırbaşlı Herakles' heykelinin üst yarısı 1960'larda kaçırılıp Boston'a satılmıştı; alt yarısı Antalya'da kaldı ve iki parça 2011'de birleştirildi.",
      "The upper half of the Weary Heracles was smuggled out and sold in Boston in the 1960s while the lower half stayed here. The two were reunited in 2011.",
    ),
  ],
  "bodrum-sualti-muzesi": [
    f(
      "Müze, Halikarnas Mozolesi'nin taşlarıyla kısmen inşa edilmiş bir Haçlı kalesinin içindedir: bina, sergilediği tarihin bir parçasıdır.",
      "The museum sits inside a crusader castle partly built from the stones of the Mausoleum: the building is a piece of the history it displays.",
    ),
    f(
      "MÖ 14. yüzyıla tarihlenen Uluburun batığı, on bir farklı kültürün malını taşıyordu: bakır külçe, fildişi, Baltık kehribarı ve Mısır mücevheri aynı gemide.",
      "The Uluburun ship, of the fourteenth century BC, carried goods from eleven cultures: copper ingots, ivory, Baltic amber and Egyptian jewellery in one hold.",
    ),
    f(
      "Batıktan çıkan bir altın eserin üzerinde Mısır kraliçesi Nefertiti'nin adı yazılıdır; gemi battığında bu parça zaten yüz yıllıktı.",
      "A gold object from the wreck carries the name of the Egyptian queen Nefertiti — already a century old when the ship went down.",
    ),
  ],
  "troya-muzesi": [
    f(
      "Müze, toprağa gömülü paslı çelik bir küp olarak tasarlandı: bina, kazı alanı gibi aşağıdan yukarıya doğru gezilir.",
      "The museum was designed as a rusted steel cube sunk into the ground, walked from the bottom up like the excavation itself.",
    ),
    f(
      "Schliemann'ın çıkardığı 'Priamos Hazinesi' önce Almanya'ya götürüldü, savaşta kayboldu ve 1993'te Moskova'da ortaya çıktı; hâlâ Rusya'da.",
      "The 'Treasure of Priam' went to Germany, vanished in the war, and reappeared in Moscow in 1993. It is still in Russia.",
    ),
  ],
  "mevlana-muzesi": [
    f(
      "Yeşil çinili kubbe 13. yüzyıldan kalmadır ve Konya'nın simgesidir; türbenin bulunduğu arazi Selçuklu sarayının gül bahçesiydi.",
      "The green-tiled dome dates from the thirteenth century and is the emblem of Konya. The ground it stands on was the rose garden of the Seljuk palace.",
    ),
    f(
      "Mevlânâ'nın öldüğü gece 'Şeb-i Arûs', yani düğün gecesi diye anılır ve her yıl 17 Aralık'ta törenle anılır.",
      "The night Mevlâna died is called Şeb-i Arûs — the wedding night — and is marked every 17 December.",
    ),
  ],

  // ————— Camiler, köprüler, hanlar ve konaklar —————
  "sultanahmet-camii": [
    f(
      "Altı minare, yapıldığı sırada yalnızca Mekke'deki Harem-i Şerif'te vardı; iddia tartışma yaratınca Mekke'ye bir minare daha eklendi.",
      "Six minarets were, at the time, matched only by the sanctuary at Mecca; when the claim caused offence, a further minaret was added there.",
    ),
    f(
      "Cami hâlâ ibadete açıktır ve ziyaret saatleri namaz vakitlerine göre değişir; giriş ücretsizdir.",
      "The mosque is still in use for prayer, so visiting hours shift with the prayer times. There is no entry charge.",
    ),
    f(
      "Yapı, Bizans Büyük Sarayı'nın üzerine kuruldu; sarayın mozaik tabanı bugün caminin arkasındaki müzede yerinde durur.",
      "It was built over the Byzantine Great Palace, whose mosaic floor still lies in place in the museum behind it.",
    ),
  ],
  "bursa-ulu-cami": [
    f(
      "Yirmi kubbe, Yıldırım Bayezid'in Niğbolu zaferi için adadığı yirmi caminin yerine geçti.",
      "The twenty domes stand in place of the twenty mosques Bayezid I had vowed for his victory at Nicopolis.",
    ),
    f(
      "Ortadaki şadırvan, kubbelerden birinin yerine bırakılan açıklığın altındadır: avlusu olmayan camide avlunun işlevini içerisi görür.",
      "The fountain at the centre sits under the opening left where a dome would be: with no courtyard, the interior does the courtyard's work.",
    ),
  ],
  "yesil-turbe": [
    f(
      "Türbeye adını veren firuze çini kaplama, 1855 depreminden sonra yenilendi; özgün çinilerin bir bölümü içeride korunur.",
      "The turquoise tiling that gives the tomb its name was renewed after the earthquake of 1855; some of the original tiles survive inside.",
    ),
    f(
      "Çelebi Mehmed'in sandukası, Osmanlı çini sanatının Bursa dönemindeki en gösterişli örneğidir.",
      "The cenotaph of Mehmed I is the most elaborate piece of Ottoman tilework surviving from the Bursa period.",
    ),
  ],
  "esrefoglu-cami": [
    f(
      "Camiyi taşıyan kırk iki sedir sütunun hiçbiri sonradan değiştirilmedi; yedi yüz yıldır aynı ağaçlar ayakta.",
      "None of the forty-two cedar columns has ever been replaced: the same trees have carried the roof for seven centuries.",
    ),
    f(
      "2023'te Anadolu'nun ahşap direkli camileri UNESCO Dünya Mirası Listesi'ne alındı; Eşrefoğlu bu grubun en büyüğüdür.",
      "In 2023 Anatolia's wooden hypostyle mosques entered the World Heritage List, and Eşrefoğlu is the largest of them.",
    ),
  ],
  "diyarbakir-ulu-cami": [
    f(
      "Avlunun cephesinde kullanılan sütun ve başlıklar, kentin Roma yapılarından sökülerek yeniden kullanıldı.",
      "The columns and capitals of the courtyard front were taken from the city's Roman buildings and used again.",
    ),
    f(
      "Cami, aynı avluyu paylaşan Mesudiye ve Zinciriye medreseleriyle birlikte bir külliye oluşturur.",
      "The mosque forms a complex with the Mesudiye and Zinciriye madrasas, which share its courtyard.",
    ),
  ],
  sultanhani: [
    f(
      "Avlunun ortasındaki köşk mescit, dört ayak üzerinde yükselir; altından geçen kervan yükünü boşaltmadan avluya girebilirdi.",
      "The kiosk mosque in the middle of the court stands on four piers, so a loaded caravan could pass beneath it into the yard.",
    ),
    f(
      "Han, yazlık avlu ve kışlık kapalı hol olarak ikiye ayrılır; Anadolu'nun sert kışı Selçuklu han planını böyle belirledi.",
      "The han is split between an open summer court and a covered winter hall — the Anatolian winter wrote the Seljuk plan.",
    ),
  ],
  sarihan: [
    f(
      "Han, Kapadokya'daki Selçuklu kervansaraylarının en geç tarihlilerindendir ve yapının adını çevredeki ocakların sarı taşı verir.",
      "It is among the latest of the Seljuk caravanserais in Cappadocia, and takes its name from the yellow stone of the quarries around it.",
    ),
    f(
      "Yirminci yüzyılda yıkılmaya yüz tutan yapı, 1980'lerdeki restorasyonla bütün olarak ayağa kaldırıldı.",
      "Close to collapse in the twentieth century, the building was raised again whole in the restoration of the 1980s.",
    ),
  ],
  "cendere-koprusu": [
    f(
      "Köprünün dört sütunundan biri eksiktir: Geta'nın adı ölümünden sonra kayıtlardan silinince sütunu da kaldırıldı.",
      "One of the bridge's four columns is missing: when Geta's name was struck from the record after his death, his column came down with it.",
    ),
    f(
      "Yapı Nemrut Dağı'na çıkan yolun üzerindedir; Kommagene gezisinin çoğu bu köprüden geçer.",
      "The bridge sits on the road up to Mount Nemrut, so most Commagene itineraries cross it.",
    ),
  ],
  "malabadi-koprusu": [
    f(
      "Tek kemerin açıklığı otuz sekiz metreyi aşar; Orta Çağ'da bu genişlikte örülmüş taş kemer sayısı bir elin parmaklarını geçmez.",
      "The single span passes thirty-eight metres — medieval stone arches built that wide can be counted on one hand.",
    ),
    f(
      "Köprünün yan duvarlarındaki odalar, kış aylarında yolcuların geceyi geçirmesi için yapılmıştı.",
      "The rooms in the bridge's flanks were built so that travellers could spend a winter night inside it.",
    ),
  ],
  "doner-kumbet": [
    f(
      "Kümbet dönmez: adı, on iki yüzlü gövdenin çevresinde yürüyen birine yapı dönüyormuş gibi görünmesinden gelir.",
      "The tomb does not turn: the name comes from the way the twelve-sided shaft seems to rotate as you walk around it.",
    ),
    f(
      "Gövdedeki hayat ağacı kabartmasının iki yanında karşılıklı duran hayvan figürleri, Orta Asya'dan gelen bir bezeme geleneğini sürdürür.",
      "The animals facing each other across the tree-of-life relief continue a decorative tradition carried from Central Asia.",
    ),
  ],
  "bozdogan-kemeri": [
    f(
      "Kemer, kenti Trakya'daki kaynaklara bağlayan yüzlerce kilometrelik su hattının yalnızca son halkasıydı.",
      "The aqueduct was only the last link of a water line hundreds of kilometres long reaching back to the springs of Thrace.",
    ),
    f(
      "Osmanlı döneminde de bakımı sürdürüldü; su sistemi yüzyıllar boyunca bu Roma hattı üzerinden işledi.",
      "It was maintained under the Ottomans too, and the city's water ran along this Roman line for centuries.",
    ),
  ],
  "yerebatan-sarnici": [
    f(
      "Sarnıcın 336 sütunu farklı yapılardan toplandı; boyları tutmadığı için kimi kaideler yükseltildi, kimi başlıklar ters çevrildi.",
      "Its 336 columns were gathered from different buildings, so where the heights did not match, bases were raised and capitals turned over.",
    ),
    f(
      "Sarnıcın varlığı Osmanlı döneminde unutulmuştu; 16. yüzyılda üstündeki evlerin bodrumundan balık çıkaran mahalleliler sayesinde yeniden kayda geçti.",
      "The cistern had been forgotten under the Ottomans, and was recorded again in the sixteenth century only because people were pulling fish up through their cellar floors.",
    ),
  ],
  "dolmabahce-sarayi": [
    f(
      "Muayede Salonu'nun 4,5 tonluk avizesi, dünyanın en ağır kristal avizelerindendir ve salonun kubbesine asılıdır.",
      "The four-and-a-half-tonne chandelier of the ceremonial hall is among the heaviest crystal chandeliers anywhere, hung from the dome.",
    ),
    f(
      "Atatürk 10 Kasım 1938'de bu sarayda öldü; öldüğü odadaki saat hâlâ 09:05'i gösterir.",
      "Atatürk died in this palace on 10 November 1938, and the clock in the room still shows 09:05.",
    ),
  ],
  "galata-kulesi": [
    f(
      "Kuleyi Cenevizliler 1348'de kendi surlarının en yüksek noktasına dikti ve 'İsa Kulesi' adını verdi.",
      "The Genoese raised the tower in 1348 at the highest point of their own walls and named it the Tower of Christ.",
    ),
    f(
      "Osmanlı döneminde kule yangın gözetleme noktasıydı; ahşap kentte yangın haberi buradan verilirdi.",
      "Under the Ottomans it was a fire watchtower — in a city of timber, the alarm was raised from here.",
    ),
  ],
  anitkabir: [
    f(
      "Anıtın yeri, Ankara'ya hâkim Rasattepe'ydi; inşaat sırasında tepenin altından Frig dönemine ait tümülüsler çıktı.",
      "The monument stands on Rasattepe above Ankara, and the building work uncovered Phrygian tumuli beneath the hill.",
    ),
  ],
  "alanya-kalesi": [
    f(
      "Yarımadayı çeviren sur 6,5 kilometre uzunluğundadır ve içinde yüzlerce sarnıç bulunur; kale kuşatmada suyunu kendi toplardı.",
      "The wall around the peninsula runs 6.5 kilometres and encloses hundreds of cisterns: under siege the castle collected its own water.",
    ),
    f(
      "Kızılkule, Selçuklu tersanesini korumak için yapıldı ve Anadolu Selçuklu askerî mimarisinin en iyi korunmuş kulesidir.",
      "The Red Tower was built to protect the Seljuk shipyard and is the best preserved tower of Anatolian Seljuk military architecture.",
    ),
  ],
  kizkalesi: [
    f(
      "Kale, kıyıdan iki yüz metre açıktaki adacığın tamamını kaplar; karadaki Korykos Kalesi'yle birlikte limanın iki yanını tutardı.",
      "The castle covers the whole islet two hundred metres offshore, holding one side of the harbour while Korykos Castle held the other.",
    ),
    f(
      "Adını, kral kızının yılan sokmasından ölmesini önlemek için buraya kapatıldığı halk anlatısından alır.",
      "Its name comes from the story of a king's daughter shut up here to keep her from a prophesied snakebite.",
    ),
  ],
  odunpazari: [
    f(
      "Evlerin üst katları alt katlardan geniştir: cumbalar sokağa doğru çıkma yaparak dar arsadan fazladan oda kazandırır.",
      "The upper floors are wider than the lower ones: the bays corbel out over the lane and win extra rooms from a narrow plot.",
    ),
    f(
      "Mahalle, dünyanın en kaliteli lületaşının çıktığı Eskişehir ocaklarının pipo ve süs eşyası atölyelerine ev sahipliği yapar.",
      "The quarter houses the pipe and carving workshops fed by the Eskişehir seams, which produce the finest meerschaum in the world.",
    ),
  ],
  "amasya-yaliboyu-evleri": [
    f(
      "Evlerin arkasındaki kayalıkta Pontus krallarının anıt mezarları vardır; konaklar ile mezarlar arasında iki bin yıl bulunur.",
      "The rock face behind the houses carries the monumental tombs of the Pontic kings: two thousand years separate the mansions from the graves.",
    ),
    f(
      "Coğrafyacı Strabon MÖ 64'te bu kentte doğdu ve ırmağın iki yakasını kendi satırlarında tarif etti.",
      "The geographer Strabo was born in this city in 64 BC and described both banks of its river himself.",
    ),
  ],
  "mor-gabriel": [
    f(
      "397'de kurulan manastır, Süryani Ortodoks Kilisesi'nin kesintisiz olarak ayakta kalan en eski manastırıdır.",
      "Founded in 397, it is the oldest Syriac Orthodox monastery still in continuous use.",
    ),
    f(
      "Turabdin, Süryanicede 'kulların dağı' demektir; bu yaylada bir zamanlar seksenden fazla manastır vardı.",
      "Turabdin means 'mountain of the servants of God' in Syriac; more than eighty monasteries once stood on this plateau.",
    ),
  ],
  deyrulzafaran: [
    f(
      "Manastır, Süryani Ortodoks patrikliğinin yüzyıllar boyunca merkeziydi; patriklik 1932'de Şam'a taşındı.",
      "The monastery was the seat of the Syriac Orthodox patriarchate for centuries, until it moved to Damascus in 1932.",
    ),
    f(
      "Altındaki tonozlu oda, harç kullanılmadan örülmüş taş bloklarla örtülüdür ve manastırdan çok daha eskidir.",
      "The vaulted room beneath it is roofed with blocks laid without mortar and is far older than the monastery.",
    ),
  ],
  soganli: [
    f(
      "Vadi, Göreme Milli Parkı ile birlikte Dünya Mirası kapsamındadır ama ziyaretçisi Göreme'nin küçük bir bölümü kadardır.",
      "The valley falls within the same World Heritage inscription as the Göreme National Park, yet sees a fraction of its visitors.",
    ),
    f(
      "Kayalara oyulmuş güvercinlikler süs değildi: güvercin gübresi yüzyıllarca buradaki bağların başlıca gübresiydi.",
      "The dovecotes cut into the rock were not decorative — pigeon droppings were for centuries the main fertiliser of these vineyards.",
    ),
  ],

  // ————— Müzeler, ikinci grup —————
  "turk-islam-eserleri-muzesi": [
    f(
      "Müze, Kanuni'nin sadrazamı İbrahim Paşa'nın sarayındadır; yapı, Osmanlı sivil mimarisinden günümüze kalan en eski saraylardandır.",
      "The museum occupies the palace of İbrahim Pasha, Süleyman's grand vizier — among the oldest surviving examples of Ottoman domestic palace architecture.",
    ),
    f(
      "Konya'da bulunan 13. yüzyıl Selçuklu halıları, dünyada bilinen en eski düğümlü halı gruplarındandır.",
      "The thirteenth-century Seljuk carpets found at Konya are among the oldest groups of knotted carpets known anywhere.",
    ),
  ],
  "buyuk-saray-mozaikleri": [
    f(
      "Mozaik sökülüp taşınmadı: bulunduğu yerde, Bizans sarayının avlu tabanı olarak korunuyor.",
      "The mosaic was never lifted: it is kept where it was found, as the courtyard floor of the Byzantine palace.",
    ),
    f(
      "Sahnelerin hiçbiri dinî ya da hanedana ait değildir; av, çoban ve hayvan tasvirleri kırsal hayatı anlatır.",
      "Not one scene is religious or dynastic: hunters, herdsmen and animals describe life in the countryside.",
    ),
  ],
  "izmir-arkeoloji-muzesi": [
    f(
      "Koleksiyonun çekirdeği Smyrna Agorası kazılarından gelir; agoranın Poseidon ve Demeter heykelleri burada sergilenir.",
      "The core of the collection comes from the Smyrna agora excavations, including its statues of Poseidon and Demeter.",
    ),
    f(
      "Müze, İzmir çevresindeki İon kentlerinin — Klazomenai, Teos, Bayraklı — buluntularını tek çatı altında toplar.",
      "It gathers the finds of the Ionian cities around İzmir — Klazomenai, Teos, Bayraklı — under one roof.",
    ),
  ],
  "bergama-muzesi": [
    f(
      "Zeus Sunağı'nın büyük frizi Berlin'dedir; sunağın Bergama'da görülebilen tek özgün parçaları bu müzededir.",
      "The great frieze of the Altar of Zeus is in Berlin; the only original fragments of it that can be seen in Bergama are here.",
    ),
    f(
      "Koleksiyon, Asklepion'un sağlık merkezinden çıkan adak eserlerini de içerir.",
      "The collection includes the votive objects found in the healing centre of the Asklepion.",
    ),
  ],
  "hierapolis-muzesi": [
    f(
      "Müze, kentin Roma hamamının kubbeli salonlarına yerleştirildi; bina koleksiyonun bir parçasıdır.",
      "The museum was installed in the vaulted halls of the city's Roman baths, so the building is part of the collection.",
    ),
    f(
      "Tiyatronun sahne binasından sökülen kabartmalar, Apollon ve Artemis kültünü anlatan en kapsamlı Roma dizilerindendir.",
      "The reliefs taken from the theatre's stage building are among the fullest Roman sequences describing the cult of Apollo and Artemis.",
    ),
  ],
  "usak-muzesi": [
    f(
      "Karun Hazinesi, kaçırıldıktan yıllar sonra açılan bir davayla New York'tan geri getirildi.",
      "The Lydian Hoard was brought back from New York years after it was smuggled out, through a lawsuit.",
    ),
    f(
      "Koleksiyonun simgesi kanatlı deniz atı broşu, dönüşünden sonra bir kez daha çalınıp sahtesiyle değiştirildi; aslı sonradan bulundu.",
      "The winged sea-horse brooch, the collection's emblem, was stolen again after its return and swapped for a fake; the original was later recovered.",
    ),
  ],
  "side-muzesi": [
    f(
      "Müze, kentin Roma hamamıdır: heykeller bugün, Side'nin yıkandığı salonlarda duruyor.",
      "The museum is the city's Roman bath: the sculpture stands in the rooms where Side washed.",
    ),
    f(
      "Side, Pamfilya'nın köle ticaretinin merkeziydi; Strabon limanda tutsakların açık artırmayla satıldığını yazar.",
      "Side was the slave-trading centre of Pamphylia, and Strabo writes of captives auctioned in its harbour.",
    ),
  ],
  "adana-muzesi": [
    f(
      "Müze, 20. yüzyılın başından kalma bir dokuma fabrikasının salonlarına taşındı ve Türkiye'nin en büyük müze binalarından biri oldu.",
      "The museum moved into the halls of a textile mill from the start of the twentieth century, becoming one of the largest museum buildings in Türkiye.",
    ),
    f(
      "Fabrikanın dokuma makineleri sökülmedi: aynı çatı altında Roma lahitleriyle sanayi mirası birlikte sergileniyor.",
      "The mill's looms were left in place, so Roman sarcophagi and industrial heritage are shown under the same roof.",
    ),
  ],
  "mardin-muzesi": [
    f(
      "Müze, Süryani Katolik Patrikliği'nin konağındadır; Mardin taş oymacılığının en iyi örneklerinden biri binanın kendisidir.",
      "The museum is in the mansion of the Syriac Catholic patriarchate, and the finest example of Mardin stone carving in it is the building itself.",
    ),
    f(
      "Koleksiyon, Nusaybin yakınındaki Girnavaz höyüğünün Asur katmanlarından çıkan buluntuları içerir.",
      "The collection holds the finds from the Assyrian levels of the Girnavaz mound near Nusaybin.",
    ),
  ],
  "van-muzesi": [
    f(
      "Urartu tunç işçiliği koleksiyonu dünyadaki en kapsamlılardandır: kemerler, miğferler ve at koşum takımları aynı salonda.",
      "Its collection of Urartian bronzes is among the fullest anywhere — belts, helmets and horse harness in a single hall.",
    ),
    f(
      "Hakkâri'de bulunan steller, Anadolu'da bilinen hiçbir sanat geleneğine benzemez; hangi halka ait oldukları tartışılmaya devam ediyor.",
      "The stelae found at Hakkâri resemble no known Anatolian tradition, and which people made them is still debated.",
    ),
  ],
  "amasya-muzesi": [
    f(
      "Müzedeki İlhanlı dönemi mumyaları, Anadolu'da bu biçimde korunmuş cesetlerin bilinen tek grubudur.",
      "The Ilkhanid-period mummies here are the only known group of bodies preserved this way in Anatolia.",
    ),
    f(
      "Koleksiyon, kentin Kalkolitik dönemden Hitit, Pontus ve Osmanlı'ya uzanan katmanlarını tek bir sırada izler.",
      "The collection follows the city's layers from the Chalcolithic through the Hittites and Pontus to the Ottomans in a single sequence.",
    ),
  ],
  "trabzon-muzesi": [
    f(
      "Bina, bir bankacı ailesinin konağıydı ve 1924'te Atatürk'ün Trabzon'daki ikametgâhı oldu.",
      "The building was a banking family's mansion and became Atatürk's residence in Trabzon in 1924.",
    ),
    f(
      "Konak, Karadeniz'in 19. yüzyıl sonu ve 20. yüzyıl başı sivil mimarisinin en iyi örneklerindendir.",
      "The house is among the best examples of Black Sea domestic architecture from the turn of the twentieth century.",
    ),
  ],
  "corum-muzesi": [
    f(
      "Müze, Hattuşa ve Alacahöyük kazılarının merkez koleksiyonudur; Hitit mühürleri ve tabletleri burada toplanır.",
      "The museum is the central collection for the Hattusa and Alacahöyük excavations, where the Hittite seals and tablets are gathered.",
    ),
    f(
      "Hattuşa'da bulunan tabletler, Hint-Avrupa dillerinin bilinen en eski yazılı örneklerini verdi.",
      "The tablets found at Hattusa yielded the earliest written record of any Indo-European language.",
    ),
  ],
  "karatay-muzesi": [
    f(
      "Medresenin kubbesi, ortadaki havuza yansıyan bir gece göğü olarak tasarlandı; mavi ve siyah çiniler yıldızları kurar.",
      "The dome of the madrasa was designed as a night sky reflected in the pool below, its blue and black tiles making the stars.",
    ),
    f(
      "Kubadabad Sarayı'ndan sökülen çinilerde av kuşları ve sirenler görülür; Selçuklu sanatında figürlü bezemenin en zengin örneğidir.",
      "The tiles taken from the Kubadabad palace carry hunting birds and sirens — the richest figural decoration of Seljuk art.",
    ),
  ],

  // ————— Üçüncü grup —————
  "milet-muzesi": [
    f(
      "Müze Milet'in yanı sıra Didyma ve Priene buluntularını da barındırır; üç kentin de limanı Menderes'in alüvyonuyla doldu.",
      "The museum holds the finds of Didyma and Priene as well as Miletus — the harbours of all three were filled by silt from the Meander.",
    ),
    f(
      "Izgara plan fikrini ortaya atan Hippodamos Miletliydi; kenti Perslerce yıkıldıktan sonra onun planına göre yeniden kuruldu.",
      "Hippodamus, who devised the grid plan, was from Miletus, and the city was rebuilt to his design after the Persians destroyed it.",
    ),
  ],
  "afrodisias-muzesi": [
    f(
      "Aphrodisias'ın mermer ocağı kente iki kilometre uzaktaydı; heykeltıraşlarının imzaları Roma'dan Kuzey Afrika'ya kadar bulundu.",
      "The marble quarry lay two kilometres from the city, and the signatures of its sculptors turn up from Rome to North Africa.",
    ),
    f(
      "Koleksiyondaki yarım kalmış heykeller, bir Roma heykelinin kaba bloktan cilaya kadar geçtiği bütün aşamaları tek sırada gösterir.",
      "The unfinished pieces in the collection show every stage of a Roman statue, from rough block to polish, in a single row.",
    ),
  ],
  "kutahya-cini-muzesi": [
    f(
      "İznik atölyeleri kapandıktan sonra Osmanlı çiniciliği Kütahya'da sürdü ve 20. yüzyıla kadar kesintisiz üretim yapıldı.",
      "After the İznik workshops closed, Ottoman tilemaking carried on at Kütahya, in continuous production into the twentieth century.",
    ),
    f(
      "Kütahya çinisi sarı ve açık yeşil kullanımıyla İznik'in mavi-beyazından ayrılır; çizgisi daha serbesttir.",
      "Kütahya ware parts from İznik's blue and white in its yellows and light greens, and in a freer line.",
    ),
  ],
  "alanya-muzesi": [
    f(
      "Müzenin en değerli eseri, yalnızca 52 santimetrelik MS 2. yüzyıl tunç Herakles heykelciğidir.",
      "The finest object in the museum is a bronze Herakles of the second century AD, just 52 centimetres tall.",
    ),
    f(
      "Bahçedeki lahitler ve Osmanlı mezar taşları, kentin Roma Coracesium'undan Selçuklu Alaiye'sine uzanan katmanlarını yan yana koyar.",
      "The sarcophagi and Ottoman gravestones in the garden set the town's layers side by side, from Roman Coracesium to Seljuk Alaiye.",
    ),
  ],
  "kayseri-muzesi": [
    f(
      "Kültepe-Kaniş tabletleri Anadolu'nun bilinen en eski yazılı belgeleridir ve hepsi ticaret kaydı, sözleşme ya da borç senedidir.",
      "The Kültepe-Kanesh tablets are Anatolia's earliest written documents, and every one of them is a trade record, a contract or a note of debt.",
    ),
    f(
      "Tabletler kil zarflar içinde bulundu: zarfa sözleşmenin özeti yazılır, mühürlenir ve ancak anlaşmazlıkta kırılırdı.",
      "The tablets came out inside clay envelopes: a summary was written on the envelope, sealed, and broken open only in a dispute.",
    ),
  ],
  "aksaray-muzesi": [
    f(
      "Aşıklı Höyük'te bulunan bir kadın iskeleti, dünyada bilinen en eski beyin ameliyatı izini taşır; hasta ameliyattan sonra bir süre yaşamış.",
      "A woman's skeleton from Aşıklı Höyük carries the oldest known trace of brain surgery — and she lived on after the operation.",
    ),
    f(
      "Koleksiyon on bin yıllık bir aralığı kapsar: Neolitik Aşıklı Höyük'ten Selçuklu kervan yoluna kadar.",
      "The collection spans ten thousand years, from Neolithic Aşıklı Höyük to the Seljuk caravan road.",
    ),
  ],
  "erzurum-muzesi": [
    f(
      "Karaz kültürünün siyah açkılı çanak çömleği elde yapılır ve pişirildikten sonra çakıl taşıyla parlatılırdı; hâlâ ayna gibi durur.",
      "The black burnished pottery of the Karaz culture was hand-built and polished with a pebble after firing — it still shines like a mirror.",
    ),
    f(
      "Bu seramik geleneği Kafkaslardan İran'a uzanan geniş bir bölgede aynı biçimde görülür ve Erken Tunç Çağı'nda büyük bir göç ağını işaret eder.",
      "The same pottery appears across a belt from the Caucasus to Iran, pointing to a wide network of movement in the Early Bronze Age.",
    ),
  ],
  "kars-muzesi": [
    f(
      "Müze, Ani harabelerindeki kazıların merkez koleksiyonudur.",
      "The museum is the central collection for the excavations at Ani.",
    ),
    f(
      "Bahçedeki kilise çanları ve buhar makineleri, Kars'ın 1878-1918 arasındaki Rus dönemine aittir.",
      "The church bells and steam engines in the garden belong to the Russian period at Kars, between 1878 and 1918.",
    ),
  ],
  "sinop-muzesi": [
    f(
      "Müzenin bahçesinde, inşaat sırasında bulunan Serapis Tapınağı'nın kalıntıları yerinde korunuyor.",
      "The remains of a temple of Serapis, found during building work, are kept in place in the museum garden.",
    ),
    f(
      "Sinope amphoraları bütün Karadeniz kıyısında bulunur; üzerlerindeki damgalar hangi atölyede ve hangi yıl üretildiklerini kaydeder.",
      "Sinopean amphorae are found all round the Black Sea, and their stamps record which workshop made them and when.",
    ),
  ],
  "samsun-muzesi": [
    f(
      "Amisos tümülüsünde 1995'te bulunan Helenistik altın hazinesi müzenin en tanınmış bölümüdür.",
      "The Hellenistic gold hoard found in the Amisos tumulus in 1995 is the best known part of the museum.",
    ),
    f(
      "İkiztepe'den çıkan tunç aletler arasında cerrahi bıçaklar vardır: MÖ 3. binyılda bu kıyıda ameliyat yapılıyordu.",
      "Among the bronze tools from İkiztepe are surgical blades — operations were being performed on this coast in the third millennium BC.",
    ),
  ],
  "diyarbakir-muzesi": [
    f(
      "Çayönü'nde bulunan bakır boncuklar, insanlığın madeni ilk dövmeye başladığı döneme, MÖ 7000 dolaylarına aittir.",
      "The copper beads from Çayönü belong to the moment people first hammered metal, around 7000 BC.",
    ),
    f(
      "Müze, Yukarı Dicle havzasının kazılarının merkez koleksiyonudur ve tarıma geçişi katman katman izler.",
      "The museum is the central collection for the upper Tigris excavations, and follows the passage to farming layer by layer.",
    ),
  ],
  "adiyaman-muzesi": [
    f(
      "Kommagene'nin başkenti Samosata bugün tamamen Atatürk Barajı gölünün altındadır; kentten geriye kalan mozaikler bu müzededir.",
      "Samosata, the Commagenian capital, now lies entirely beneath the Atatürk reservoir; the mosaics that survive from it are in this museum.",
    ),
    f(
      "Koleksiyonun bir bölümü, baraj suları yükselmeden önce yapılan kurtarma kazılarından gelir.",
      "Part of the collection comes from rescue excavations run before the reservoir waters rose.",
    ),
  ],
  "edirne-muzesi": [
    f(
      "Trakya'nın dolmenleri MÖ 2. binyıla uzanır ve Anadolu'nun geri kalanında benzeri olmayan bir mezar geleneğini temsil eder.",
      "The dolmens of Thrace reach back to the second millennium BC and represent a burial tradition with no parallel elsewhere in Anatolia.",
    ),
    f(
      "Müzede sergilenen Edirnekâri, ahşap üzerine bezeme ve vernik tekniğidir ve yalnızca bu kentte gelişti.",
      "The Edirnekâri work shown here is a technique of painting and lacquering on wood that developed in this city alone.",
    ),
  ],
  "pera-muzesi": [
    f(
      "Osman Hamdi Bey'in 'Kaplumbağa Terbiyecisi' 2004'te rekor bir bedelle satın alındı ve müzenin simgesi oldu.",
      "Osman Hamdi Bey's 'The Tortoise Trainer' was bought at a record price in 2004 and became the museum's emblem.",
    ),
    f(
      "Müze, 1893 tarihli Bristol Oteli binasındadır; cephesi korunup içi bütünüyle galeriye dönüştürüldü.",
      "The museum occupies the Bristol Hotel building of 1893, its façade kept and its interior rebuilt entirely as gallery space.",
    ),
  ],
  yarimburgaz: [
    f(
      "Mağaranın Alt Paleolitik tabakaları, Marmara çevresindeki en eski insan varlığını belgeler.",
      "The cave's Lower Palaeolithic layers record the oldest human presence around the Sea of Marmara.",
    ),
    f(
      "Üst katmanlarda Bizans döneminde oyulmuş bir kilise vardır: aynı mağara yüz binlerce yıl arayla iki kez kullanılmış.",
      "A Byzantine church was cut into its upper levels: the same cave was used twice, hundreds of thousands of years apart.",
    ),
  ],
  okuzini: [
    f(
      "Mağaranın tabakaları MÖ 16.000 ile 10.000 arasını kesintisiz kapsar ve Anadolu'da buzul çağının sonunu en iyi belgeleyen dizidir.",
      "Its layers cover 16,000 to 10,000 BC without a break — the best record in Anatolia of the end of the ice age.",
    ),
    f(
      "Adı 'öküz ini' demektir ve duvarındaki kazıma boğa figüründen gelir.",
      "The name means 'the ox's den', after the incised figure of a bull on its wall.",
    ),
  ],
  "maglova-kemeri": [
    f(
      "Mimar Sinan kemerin ayaklarını akıntıyı yaran sivri bir kesitle yaptı; yapı dört yüz elli yıldır bu sayede sellere dayanıyor.",
      "Sinan gave the piers a pointed section that splits the current, and it has carried the aqueduct through four and a half centuries of floods.",
    ),
    f(
      "Kemer 1563'teki büyük selde zarar gördü ve yine Sinan tarafından yeniden yapıldı.",
      "The aqueduct was damaged in the great flood of 1563 and rebuilt by Sinan himself.",
    ),
  ],
  binbirdirek: [
    f(
      "Adı 'bin bir direk' demektir; gerçekte 224 sütun vardır.",
      "The name means 'a thousand and one columns'; there are in fact 224.",
    ),
  ],
  "serefiye-sarnici": [
    f(
      "Sarnıcın üzerine yüzyıllarca ev ve dükkân yapıldı; varlığı ancak 2010'daki bir yıkım sırasında yeniden anlaşıldı.",
      "Houses and shops were built over the cistern for centuries; it came to light again only during a demolition in 2010.",
    ),
    f(
      "Sekiz yıl süren onarımın ardından 2018'de ziyarete açıldı.",
      "After eight years of repair it opened to visitors in 2018.",
    ),
  ],
  "halime-hatun-kumbeti": [
    f(
      "On iki yüzün her birinde farklı bir bezeme düzeni işlenmiştir; hiçbiri tekrar etmez.",
      "Each of the twelve faces carries a different arrangement of carving, and none is repeated.",
    ),
    f(
      "Çevresindeki mezarlıkta yüzlerce koç ve koyun biçimli mezar taşı vardır; bu biçim göçebe geleneğinden gelir.",
      "The cemetery around it holds hundreds of gravestones carved as rams and sheep, a form carried over from nomadic practice.",
    ),
  ],
  "mama-hatun-turbesi": [
    f(
      "Türbe, dairesel bir avlu duvarının tam ortasında durur; bu plan Anadolu Türk mimarisinde başka hiçbir yerde tekrarlanmadı.",
      "The tomb stands at the centre of a circular walled court — a plan repeated nowhere else in Anatolian Turkish architecture.",
    ),
    f(
      "Mama Hatun, Anadolu'da kendi adına para bastıran ve devlet yöneten birkaç kadın hükümdardan biriydi.",
      "Mama Hatun was one of the few women in Anatolia to rule a state and strike coins in her own name.",
    ),
  ],
  gumuskesen: [
    f(
      "Yapı, Halikarnassos'taki Mausoleion'un küçültülmüş bir yorumu kabul edilir; o yapı temeline kadar söküldüğü için kayıp harikaya dair en somut fikri bu mezar verir.",
      "The tomb is read as a scaled-down version of the Mausoleum at Halicarnassus; since that building was stripped to its foundations, this gives the clearest idea of the lost wonder.",
    ),
    f(
      "Mezar odasının tabanındaki delik, ölüye sunulan sıvıların aşağı akması için açılmıştı.",
      "The opening in the burial chamber floor was cut so that liquids offered to the dead could run down through it.",
    ),
  ],
  agzikarahan: [
    f(
      "Selçuklu hanları birbirinden bir günlük deve yürüyüşü, otuz-kırk kilometre aralıkla kuruldu; Sultanhanı'na uzaklığı tam bu kadardır.",
      "Seljuk hans were set a day's camel march apart, thirty to forty kilometres; the distance to the Sultan Han is exactly that.",
    ),
    f(
      "Avlunun ortasındaki köşk mescit dört ayak üzerinde yükselir, altından yüklü develer geçebilirdi.",
      "The kiosk mosque at the centre of the court stands on four piers, high enough for loaded camels to pass beneath.",
    ),
  ],
  "alara-han": [
    f(
      "Handa yolcular için bir hamam vardı; bu ayrıntı Selçuklu kervansaraylarının azında bulunur ve Alara'nın yolun ilk gecesi olmasıyla açıklanır.",
      "The han had a bath for travellers — a feature few Seljuk caravanserais had, explained by its being the first night on the road.",
    ),
    f(
      "Yukarısındaki kayalık tepede aynı dönemde yapılan Alara Kalesi yolu gözetliyordu.",
      "Alara Castle, built in the same years on the crag above, watched the road.",
    ),
  ],
  "justinianus-koprusu": [
    f(
      "Nehir sonraki yüzyıllarda yatağını değiştirdi; 430 metrelik köprü bugün büyük ölçüde kuru ovanın üzerinde durur.",
      "The river later shifted its bed, so the 430-metre bridge now stands largely over dry ground.",
    ),
    f(
      "Köprünün bir ucundaki zafer takının kaideleri hâlâ yerinde; yapı bir geçitten çok anıt olarak tasarlanmıştı.",
      "The footings of a triumphal arch at one end are still in place: the bridge was conceived as a monument, not merely a crossing.",
    ),
  ],
  uzunkopru: [
    f(
      "1.238 metre uzunluğuyla dünyanın en uzun taş kemerli köprüsüdür.",
      "At 1,238 metres it is the longest stone arch bridge in the world.",
    ),
    f(
      "174 gözün kilit taşlarında aslan, fil, lale ve kartal kabartmaları vardır ve hiçbiri tekrarlanmaz.",
      "The keystones of its 174 arches carry lions, elephants, tulips and eagles, and no two are the same.",
    ),
  ],
  "irgandi-koprusu": [
    f(
      "Üzerinde çarşı bulunan ve ayakta kalan köprü sayısı dünyada bir elin parmaklarını geçmez; Irgandı ile Floransa'daki Ponte Vecchio aynı listededir.",
      "Bridges that still carry a market can be counted on one hand: Irgandı and the Ponte Vecchio in Florence are on the same list.",
    ),
    f(
      "Köprü 1949'da yıkılıp düz bir betonarme geçitle değiştirildi; özgün çarşılı biçimi 2004'te yeniden inşa edildi.",
      "The bridge was demolished in 1949 and replaced by a flat concrete crossing; its original market form was rebuilt in 2004.",
    ),
  ],
  "beylerbeyi-sarayi": [
    f(
      "Saray devlet konuğu ağırlamak için kullanıldı; Fransa İmparatoriçesi Eugénie ve İran Şahı burada kaldı.",
      "The palace was used to receive heads of state: the Empress Eugénie of France and the Shah of Persia stayed here.",
    ),
    f(
      "Salonların tabanını Mısır hasırları kaplar; nemli Boğaz havasında odaları serin tutmak için seçilmişlerdi.",
      "Egyptian reed matting covers the floors, chosen to keep the rooms cool in the damp air off the Bosphorus.",
    ),
  ],
  kubadabad: [
    f(
      "Sarayın duvarlarını kaplayan figürlü çiniler bugün Konya'daki Karatay Müzesi'nde sergileniyor.",
      "The figured tiles that lined the palace walls are displayed today in the Karatay Museum in Konya.",
    ),
    f(
      "Çinilerde sultanın kendisi, sirenler ve çift başlı kartallar resmedilmiştir; figür yasağı Selçuklu sarayının içinde geçerli değildi.",
      "The tiles show the sultan himself, sirens and double-headed eagles: the prohibition on figures did not hold inside a Seljuk palace.",
    ),
  ],
  "anadolu-hisari": [
    f(
      "Hisar 1394'te yapıldı; altmış yıl sonra karşı kıyıya Rumeli Hisarı yapılınca Boğaz'dan geçen her gemi iki kalenin arasında kaldı.",
      "The fortress went up in 1394; sixty years later Rumeli Hisarı rose opposite and every ship in the strait was caught between the two.",
    ),
    f(
      "Sur duvarlarının arasına kurulan mahalle bugün de yerindedir; hisarın içinde hâlâ evler var.",
      "The quarter that grew between its walls is still there: houses stand inside the fortress to this day.",
    ),
  ],
  "ankara-kalesi": [
    f(
      "Kale duvarlarındaki yazıtlı bloklar, Ankara'nın Roma mezar taşlarının en büyük toplu koleksiyonudur — hiçbiri müzede değil, hepsi duvarın içinde.",
      "The inscribed blocks in its walls are the largest collection of Ankara's Roman gravestones, and not one is in a museum: they are all in the wall.",
    ),
    f(
      "Bugünkü duvarlar 7. yüzyılda, Bizans'ın Arap akınlarına karşı savunma hattı kurduğu dönemde örüldü.",
      "The present walls were built in the seventh century, when Byzantium was raising a defensive line against Arab raids.",
    ),
  ],
  "mamure-kalesi": [
    f(
      "Otuz dokuz burcu ve hendeğiyle Akdeniz kıyısının en büyük ve en iyi korunmuş kalesidir.",
      "With thirty-nine towers and a moat it is the largest and best preserved castle on the Mediterranean coast.",
    ),
    f(
      "Kalenin hendeği hâlâ suyla dolar ve içinde kaplumbağalar yaşar.",
      "The moat still fills with water, and turtles live in it.",
    ),
  ],
  yedikule: [
    f(
      "Hisar, Theodosius surlarının Altın Kapı bölümüne 1458'de üç kule eklenerek oluşturuldu; var olan dört kuleyle sayı yediye çıktı.",
      "The fortress was made in 1458 by adding three towers to the Golden Gate of the Theodosian walls; with the four already there, the count reached seven.",
    ),
    f(
      "Zindan duvarlarında tutsakların kazıdığı Latince, Yunanca, Fransızca ve Rusça isimler hâlâ okunuyor.",
      "Names scratched by prisoners into the cell walls — in Latin, Greek, French and Russian — can still be read.",
    ),
  ],
  alahan: [
    f(
      "Doğu kilisesinin taş kubbe kasnağı, Ayasofya'dan önce denenen kubbe çözümlerinin en iyi korunmuş örneğidir.",
      "The stone dome drum of the east church is the best preserved of the solutions tried before Hagia Sophia.",
    ),
    f(
      "Batı kilisesinin kapısındaki kabartmada başmelekler, ayakları altında ezilmiş putperest figürleriyle betimlenmiştir.",
      "The relief over the west church door shows the archangels with pagan figures crushed beneath their feet.",
    ),
  ],
  vazelon: [
    f(
      "Manastır 270 yılında kuruldu ve Sümela'dan yaklaşık yüz yıl daha eskidir.",
      "The monastery was founded in 270, about a century before Sümela.",
    ),
    f(
      "Manastırın tuttuğu 'Vazelon Kayıtları' köylüleri adlarıyla ve toprak paylarıyla sıralar; sıradan insanların adının geçtiği ender ortaçağ belgelerindendir.",
      "The Vazelon Registers list villagers by name with their shares of land — a rare medieval document in which ordinary people are named.",
    ),
  ],
  "meryem-ana-evi": [
    f(
      "Ev, 19. yüzyılda bir Alman rahibenin tariflerine dayanılarak arandı ve 1891'de bulundu.",
      "The house was sought out on the strength of a German nun's visions and found in 1891.",
    ),
    f(
      "Hem Hristiyanların hem Müslümanların ziyaret ettiği az sayıdaki hac yerinden biridir; Meryem, Kuran'da adıyla anılan tek kadındır.",
      "It is one of the few pilgrimage places visited by Christians and Muslims alike: Mary is the only woman named in the Qur'an.",
    ),
  ],
  beypazari: [
    f(
      "Kasaba, Anadolu'da tek tek yapı değil bütün bir doku ölçeğinde korunabilmiş az sayıdaki örnekten biridir.",
      "The town is one of the few places in Anatolia where the whole fabric, rather than individual buildings, was saved.",
    ),
    f(
      "Seksen katlı baklavası, yufkanın bölgenin kuru havasında daha ince açılabilmesinin sonucudur.",
      "Its eighty-layer baklava is a consequence of the dry local air, which lets the dough be rolled thinner.",
    ),
  ],
  sirince: [
    f(
      "Köy 1923 nüfus mübadelesine kadar Rum yerleşimiydi ve şarapçılıkla geçiniyordu.",
      "The village was a Greek settlement living by winemaking until the population exchange of 1923.",
    ),
    f(
      "Adı önce 'Çirkince'ydi; anlatıya göre kurucuları başkalarını uzak tutmak için böyle adlandırmıştı.",
      "It was first called Çirkince, 'the ugly place' — named that by its founders, the story goes, to keep others away.",
    ),
  ],
  "antalya-kaleici": [
    f(
      "Hadrianus Kapısı, imparatorun MS 130'daki ziyareti için yapıldı ve bugün hâlâ eski kentin ana girişlerinden biridir.",
      "Hadrian's Gate was built for the emperor's visit in AD 130 and is still one of the main ways into the old town.",
    ),
    f(
      "Kesik Minare'nin altındaki yapı sırayla Roma tapınağı, Bizans kilisesi, cami, yeniden kilise ve tekrar cami oldu.",
      "The building beneath the Broken Minaret was in turn a Roman temple, a Byzantine church, a mosque, a church again and a mosque once more.",
    ),
  ],
  "alaeddin-camii": [
    f(
      "1155 tarihli ebanoz minber, Anadolu Selçuklu ahşap işçiliğinin tarihi bilinen en eski eseridir ve çivisiz yapılmıştır.",
      "The ebony minbar of 1155 is the earliest dated piece of Anatolian Seljuk woodwork, and it was built without nails.",
    ),
    f(
      "Avludaki iki türbede sekiz Selçuklu sultanı gömülüdür.",
      "Eight Seljuk sultans are buried in the two tombs in its courtyard.",
    ),
  ],
  "uc-serefeli-cami": [
    f(
      "Cami, Osmanlı mimarisinde ilk kez yirmi dört metre çapında bir merkezî kubbenin denendiği yapıdır.",
      "This is the building where Ottoman architecture first attempted a central dome twenty-four metres across.",
    ),
    f(
      "En yüksek minarenin içinde üç şerefeye ayrı ayrı çıkan üç bağımsız merdiven vardır.",
      "The tallest minaret holds three separate staircases, one to each of its balconies.",
    ),
  ],
  "mahmut-bey-camii": [
    f(
      "Caminin ahşap taşıyıcıları ve tavanı tek bir çivi kullanılmadan, yalnızca geçme tekniğiyle birleştirildi.",
      "The mosque's timber frame and ceiling are joined entirely by interlocking joinery, without a single nail.",
    ),
    f(
      "Tavandaki ve sütun başlıklarındaki kalem işi boyalar altı yüz elli yıldır özgündür, hiç yenilenmedi.",
      "The painted decoration on the ceiling and capitals is original after six hundred and fifty years and has never been renewed.",
    ),
  ],
  "rustem-pasa-camii": [
    f(
      "Cami, Eminönü çarşısının üzerine, dükkânların oluşturduğu bir platformun üstüne kuruldu; dükkânlar hem geliri sağladı hem yapıyı kalabalıktan yükseltti.",
      "The mosque sits on a platform formed by the shops of the Eminönü market beneath it — they funded it and lifted it above the crowd at once.",
    ),
    f(
      "Çinilerdeki domates kırmızısı, İznik atölyelerinin ancak kısa bir dönem üretebildiği renktir; bu cami onun en geniş uygulamasıdır.",
      "The tomato red of its tiles is a colour İznik could make only briefly, and this mosque is its largest application.",
    ),
  ],
  "kiz-kulesi": [
    f(
      "Adacıktaki ilk yapıyı MÖ 5. yüzyılda Atinalı komutan Alkibiades, Boğaz'dan geçen gemilerden vergi almak için kurdurdu.",
      "The first structure on the islet was raised in the fifth century BC by the Athenian commander Alcibiades, to tax ships passing through.",
    ),
    f(
      "Kule bir dönem kolera karantina istasyonuydu; gelen gemilerin hastaları buraya çıkarılırdı.",
      "The tower served for a time as a cholera quarantine station, where the sick from arriving ships were put ashore.",
    ),
  ],
  yesemek: [
    f(
      "Yamaçta üç yüzden fazla yarım kalmış aslan, sfenks ve dağ tanrısı figürü bulunduğu yerde duruyor.",
      "More than three hundred half-finished lions, sphinxes and mountain gods lie on the slope where they were left.",
    ),
    f(
      "Atölye bir Asur saldırısıyla aniden terk edildiği için üretim süreci donmuş hâlde kaldı: kaba yontudan bitmiş esere kadar her aşama yan yana.",
      "The workshop was abandoned suddenly under Assyrian attack, so the process froze: every stage from rough blocking to finished carving sits side by side.",
    ),
  ],
  dikilitas: [
    f(
      "Taş MÖ 15. yüzyılda Karnak'ta dikildi, MS 390'da Konstantinopolis'e getirildi: yaşı, üzerinde durduğu kentten iki bin yıl fazladır.",
      "The stone was raised at Karnak in the fifteenth century BC and brought to Constantinople in AD 390 — it is two thousand years older than the city it stands in.",
    ),
    f(
      "Mermer kaidedeki kabartmalar, dikilitaşın makara ve halatlarla nasıl dikildiğini adım adım gösterir.",
      "The reliefs on the marble base show step by step how the obelisk was raised with pulleys and ropes.",
    ),
  ],
  ozkonak: [
    f(
      "Yeraltı şehri 1972'de, tarlasını sularken suyun kaybolduğunu fark eden bir çiftçi tarafından bulundu.",
      "The underground city was found in 1972 by a farmer who noticed his irrigation water disappearing.",
    ),
    f(
      "Kat aralarına açılmış borulardan saldırganların üzerine kaynar sıvı dökülebiliyordu; bu savunma düzeni Kapadokya'da tektir.",
      "Pipes cut between the storeys let hot liquid be poured on attackers — a defensive arrangement unique in Cappadocia.",
    ),
  ],
  aciksaray: [
    f(
      "Yerleşim dinî değil sivildir: konutlar, ahırlar ve avlulardan oluşur, kiliseleri azdır ve küçüktür.",
      "The settlement is civil rather than religious: dwellings, stables and courtyards, with few and small churches.",
    ),
    f(
      "Kaya cephelerine oyulmuş sütun ve kemerler, taştan yapılmış bir konağın cephesini taklit eder.",
      "The columns and arches cut into the rock faces imitate the front of a built mansion.",
    ),
  ],
  yazilikaya: [
    f(
      "İki kaya odasının duvarlarında altmışı aşkın tanrı ve tanrıça kabartma olarak yürür; bu, Hitit tanrı listesinin taşa geçirilmiş hâlidir.",
      "More than sixty gods and goddesses walk in relief along the walls of two rock chambers — the Hittite pantheon set into stone.",
    ),
    f(
      "Tanrıların çoğunun adı başlarının yanına Luvi hiyeroglifiyle yazılmıştır; kimliklerini bu yazılar sayesinde okuyabiliyoruz.",
      "Most of the gods have their names written beside their heads in Luwian hieroglyphs, and it is those that make them identifiable.",
    ),
  ],
  smintheion: [
    f(
      "Tapınağın friz kabartmaları doğrudan İlyada sahnelerini anlatır; bir destanın kendi kült merkezinde resmedildiği ender bir örnektir.",
      "The temple frieze is carved with scenes from the Iliad — a rare case of an epic depicted at its own cult centre.",
    ),
    f(
      "'Smintheus' sıfatı 'fare' demektir: Apollon burada hem tarlaları fareden koruyan hem veba gönderen tanrıydı.",
      "The epithet Smintheus means 'of the mouse': here Apollo both kept mice off the fields and sent plague.",
    ),
  ],
  yumuktepe: [
    f(
      "Otuz üç yerleşim katmanıyla dünyanın kesintisiz iskân edilmiş en eski yerlerinden biridir; en alt tabaka MÖ 7000'e iner.",
      "With thirty-three settlement layers it is among the longest continuously inhabited places on earth, the lowest reaching to 7000 BC.",
    ),
    f(
      "Kalkolitik sur ve kapı sistemi, savunma mimarisinin köyden kaleye geçtiği anı gösterir: MÖ 5000'de burada kuleli bir duvar vardı.",
      "Its Chalcolithic wall and gate mark the moment defence passes from village to fortress: by 5000 BC there was a towered circuit here.",
    ),
  ],
  domuztepe: [
    f(
      "Höyük, Halaf kültürünün bilinen en büyük yerleşimidir ve MÖ 6. binyıla tarihlenir.",
      "The mound is the largest known settlement of the Halaf culture and dates to the sixth millennium BC.",
    ),
    f(
      "'Ölüm Çukuru'nda en az otuz beş kişiye ait parçalanmış kemikler hayvan kemikleriyle karışık bulundu; ne anlama geldiği hâlâ tartışılıyor.",
      "In the Death Pit the disarticulated bones of at least thirty-five people were found mixed with animal bone, and what it means is still argued over.",
    ),
  ],
  sillyon: [
    f(
      "Büyük İskender MÖ 333'te kenti kuşattı ama alamadan çekildi; Anadolu'da bu sonucu veren birkaç kentten biridir.",
      "Alexander besieged the city in 333 BC and withdrew without taking it — one of the few places in Anatolia to end that way.",
    ),
    f(
      "Kentte bulunan yazıt, Pamfilya lehçesinin bilinen en uzun metnidir; bu lehçe Yunancanın başka yerde kaydedilmemiş bir koludur.",
      "The inscription found here is the longest known text in the Pamphylian dialect, a branch of Greek recorded nowhere else.",
    ),
  ],
  kremna: [
    f(
      "MS 278'deki isyanı bastırmak için Romalıların yığdığı kuşatma rampası ve karargâh bugün hâlâ arazide izlenebiliyor.",
      "The siege ramp and camp the Romans raised to put down the revolt of AD 278 can still be traced on the ground.",
    ),
    f(
      "Kremna, Roma kuşatma tekniğinin arazide bütün olarak korunduğu dünyadaki sayılı yerden biridir.",
      "Kremna is one of the few places in the world where a Roman siege survives whole in the landscape.",
    ),
  ],

  // ————— Dördüncü grup —————
  "bursa-turk-islam-muzesi": [
    f(
      "Müze, Yeşil Külliye'nin medresesindedir; öğrenci hücreleri vitrine dönüştürülmüştür.",
      "The museum occupies the madrasa of the Green complex, its students' cells turned into display cases.",
    ),
    f(
      "Koleksiyondaki bazı çiniler, aynı külliyenin camisinde kullanılan çinilerin atölye denemeleridir.",
      "Some of the tiles here are workshop trials for the ones that went into the mosque of the same complex.",
    ),
  ],
  "kahramanmaras-muzesi": [
    f(
      "Müze, Domuztepe'nin Halaf dönemi buluntularının merkez koleksiyonudur.",
      "The museum is the central collection for the Halaf-period finds of Domuztepe.",
    ),
    f(
      "Bölgede bulunan fil fosilleri, Maraş ovasının bir zamanlar bataklık ve savan olduğunu gösteriyor.",
      "The fossil elephants found here show the Maraş plain was once marsh and savanna.",
    ),
  ],
  "afyon-muzesi": [
    f(
      "Yakındaki Dokimeion ocakları, Roma dünyasının en aranan mor damarlı beyaz mermerini üretiyordu.",
      "The nearby quarries of Docimium produced the Roman world's most sought-after purple-veined white marble.",
    ),
    f(
      "Bu mermer Roma'ya kadar taşındı; Pantheon'un sütunlarının bir bölümü bu ocaklardan çıktı.",
      "That marble travelled as far as Rome: some of the Pantheon's columns came out of these quarries.",
    ),
  ],
  "burdur-muzesi": [
    f(
      "Sagalassos'ta bulunan devasa Hadrianus başı ve ayağı, beş metrelik bir heykelden kalmadır.",
      "The colossal head and foot of Hadrian from Sagalassos come from a statue five metres tall.",
    ),
    f(
      "Aynı çatı altında yaklaşık yedi bin yıl vardır: Neolitik Hacılar kapları ile Roma heykelleri yan yana.",
      "About seven thousand years sit under one roof here: Neolithic Hacılar pots beside Roman sculpture.",
    ),
  ],
  "malatya-muzesi": [
    f(
      "Arslantepe'de bulunan dokuz kılıç, dünyada bilinen en eski kılıçlardır ve arsenikli bakırdan yapılmıştır.",
      "The nine swords from Arslantepe are the oldest known anywhere, made of arsenical copper.",
    ),
    f(
      "Höyüğün MÖ 4. binyıla ait sarayı, devlet örgütlenmesinin en erken kanıtları arasında sayılır.",
      "The mound's palace of the fourth millennium BC is counted among the earliest evidence for state organisation.",
    ),
  ],
  "tokat-muzesi": [
    f(
      "Müze uzun yıllar Selçuklu Gök Medrese'sinde barındı ve sonradan yeni binasına taşındı.",
      "The museum was housed for years in the Seljuk Gök Medrese before moving to a new building.",
    ),
    f(
      "Komana Pontika'nın tapınağına bağlı altı bin kişilik bir hizmetli topluluğu vardı.",
      "The temple at Komana Pontica had a staff of six thousand attached to it.",
    ),
  ],
  "kastamonu-muzesi": [
    f(
      "Atatürk şapka devrimini 1925'te bu binanın salonunda duyurdu.",
      "Atatürk announced the hat reform in the hall of this building in 1925.",
    ),
    f(
      "Paflagonya kaya mezarları Likya'nınkilere benzer, ama iki bölge arasında bilinen bir bağ yoktur.",
      "The Paphlagonian rock tombs resemble Lycia's, yet no connection between the two regions is known.",
    ),
  ],
  "sadberk-hanim-muzesi": [
    f(
      "1980'de açılan müze Türkiye'nin ilk özel müzesidir.",
      "Opened in 1980, this is Türkiye's first private museum.",
    ),
    f(
      "Büyükdere'deki iki yalıdan biri arkeolojiye, diğeri Osmanlı el sanatlarına ayrılmıştır.",
      "Of its two waterfront houses at Büyükdere, one is given to archaeology and one to Ottoman craft.",
    ),
  ],
  metropolis: [
    f(
      "Kentin adı 'ana tanrıça kenti' demektir; Meter Gallesia kültünün merkeziydi.",
      "The name means 'city of the mother goddess': it was the centre of the cult of Meter Gallesia.",
    ),
    f(
      "Hamam-gymnasium yapısı iki bin kişiye hizmet verecek ölçüde tasarlanmıştı.",
      "Its bath-gymnasium was built to serve two thousand people at once.",
    ),
  ],
  blaundos: [
    f(
      "Kent, üç yanı derin vadilerle çevrili bir burun üzerindedir; konumu onu kendiliğinden savunulur kılar.",
      "The city sits on a promontory ringed on three sides by gorges, a position that defends itself.",
    ),
    f(
      "Yazıtlarda kent 'Makedonlar Blaundos'u' diye anılır: adını buraya yerleştirilen Makedon askerlerden alır.",
      "Inscriptions call it 'Blaundos of the Macedonians', after the soldiers settled here.",
    ),
  ],
  "tripolis-meander": [
    f(
      "Kent, Lydia, Karia ve Frigya'nın kesiştiği noktada kuruldu; adı bu üçlü sınıra gönderme yapar.",
      "The city was founded where Lydia, Caria and Phrygia meet, and its name refers to that triple border.",
    ),
    f(
      "Sütunlu caddenin dükkânlarıyla birlikte bütün olarak açığa çıkarılması ender bir durumdur.",
      "Uncovering the colonnaded street whole, with the shops that lined it, is a rare thing.",
    ),
  ],
  "herakleia-latmos": [
    f(
      "Bafa Gölü bir zamanlar deniz körfeziydi; Menderes'in alüvyonu körfezi kapatınca liman kenti içeride kaldı.",
      "Lake Bafa was once a sea gulf; silt from the Meander closed it and left the harbour town inland.",
    ),
    f(
      "Latmos dağlarındaki kaya resimleri MÖ 6. binyıla iner ve Batı Anadolu'nun en eski resimli anlatılarıdır.",
      "The rock paintings in the Latmos hills go back to the sixth millennium BC, the oldest pictorial narratives in western Anatolia.",
    ),
  ],
  alabanda: [
    f(
      "Kent, çevresindeki mermer ocakları ve siyah graniti sayesinde zenginleşti ve Roma'da serbest kent statüsü kazandı.",
      "The city grew rich on its marble quarries and black granite, and won the status of a free city under Rome.",
    ),
    f(
      "Strabon kentin lüks düşkünlüğüyle ün saldığını ve 'akrep dolu' olduğunu yazar.",
      "Strabo writes that the city was known for its luxury and was 'full of scorpions'.",
    ),
  ],
  alinda: [
    f(
      "Karia kraliçesi Ada, MÖ 334'te Büyük İskender'i burada evlat edindi ve karşılığında Karia'nın yönetimini geri aldı.",
      "Here in 334 BC the Carian queen Ada adopted Alexander and got the rule of Caria back in return.",
    ),
    f(
      "Üç katlı agora binası, antik dünyanın en iyi korunmuş ticaret yapılarındandır.",
      "Its three-storey market building is among the best preserved commercial structures of antiquity.",
    ),
  ],
  iasos: [
    f(
      "Kentin mavi-beyaz damarlı mermeri Roma'da 'cipollino' adıyla satıldı ve imparatorluk yapılarında kullanıldı.",
      "The city's blue-and-white veined marble was sold in Rome as cipollino and used in imperial buildings.",
    ),
    f(
      "Antik yazarlar, ünlü bir müzisyenin konserinin balık pazarı çanı çalınca yarıda kaldığını anlatır.",
      "Ancient writers tell of a famous musician's recital emptying the moment the fish-market bell rang.",
    ),
  ],
  rhodiapolis: [
    f(
      "Opramoas MS 2. yüzyılda Likya'nın yirmi sekiz kentine deprem sonrası yardım gönderdi.",
      "In the second century AD Opramoas sent aid to twenty-eight Lycian cities after earthquakes.",
    ),
    f(
      "Anıt mezarındaki yazıt yetmiş bir belgeden oluşur ve Roma taşrasında hayırseverliğin en ayrıntılı kaydıdır.",
      "The inscription on his tomb runs to seventy-one documents, the fullest record of public giving in the Roman provinces.",
    ),
  ],
  andriake: [
    f(
      "Hadrianus'un yaptırdığı tahıl ambarı sekiz bölmesiyle neredeyse tam olarak ayakta.",
      "The granary Hadrian built still stands almost entire, with its eight chambers.",
    ),
    f(
      "Limanda kazılan sinagog, Anadolu'da bulunmuş en iyi korunmuş erken sinagoglardan biridir.",
      "The synagogue excavated at the harbour is one of the best preserved early synagogues found in Anatolia.",
    ),
  ],
  selge: [
    f(
      "Kent bin yüz metre yükseklikte kurulmuştu ve konumu sayesinde bağımsızlığını uzun süre korudu.",
      "The city stood eleven hundred metres up, and its position kept it independent for a long time.",
    ),
    f(
      "Selge sikkelerinde storaks ağacının dalı resmedilir; bu reçine antik dünyada tütsü olarak yakılırdı.",
      "Selgian coins show a branch of the storax tree: its resin was burned as incense across the ancient world.",
    ),
  ],
  lagina: [
    f(
      "Burası, Hekate'ye adanmış ve antik dünyada bilinen tek büyük kutsal alandır.",
      "This is the only major sanctuary of Hecate known in the ancient world.",
    ),
    f(
      "Stratonikeia'dan buraya uzanan on bir kilometrelik kutsal yol boyunca her yıl anahtar taşıma töreni yapılırdı.",
      "The procession of the key was carried each year along the eleven-kilometre sacred way from Stratonikeia.",
    ),
  ],
  "apollon-lairbenos": [
    f(
      "Buradan çıkan yüzlerce 'günah itirafı' yazıtı, tanrının cezalandırdığı kişilerin suçlarını açıkça kaydeder.",
      "Hundreds of confession inscriptions from here record, plainly, the offences of people the god had punished.",
    ),
    f(
      "Bu yazıtlar Roma taşrasında sıradan insanların inancını kendi sözleriyle aktaran en doğrudan kaynaktır.",
      "They are the most direct source we have for the belief of ordinary people in the Roman countryside, in their own words.",
    ),
  ],
  panionion: [
    f(
      "On iki İon kentinin ortak kutsal alanı ve birliğin toplandığı yerdi.",
      "It was the common sanctuary of the twelve Ionian cities and the seat of their league.",
    ),
    f(
      "Thales'in kentlerin tek devlet altında birleşmesi önerisi burada reddedildi; İon kentleri teker teker Perslere yenildi.",
      "Thales' proposal that the cities unite under one government was rejected here, and they were beaten by Persia one by one.",
    ),
  ],
  hacilar: [
    f(
      "Höyükten çıkan boyalı çanak çömlek, Yakın Doğu'nun en erken ve en gelişkin örneklerindendir.",
      "The painted pottery from the mound is among the earliest and most accomplished in the Near East.",
    ),
    f(
      "Kazıdan sonra piyasaya çıkan sahte Hacılar kapları o kadar çoğaldı ki, testler müzelerdeki parçaların çoğunun sahte olduğunu gösterdi.",
      "So many fake Hacılar pots reached the market that testing showed most of the pieces in museums were forgeries.",
    ),
  ],
  beycesultan: [
    f(
      "Kırk yerleşim katmanıyla Batı Anadolu'nun en derin höyüklerindendir.",
      "With forty settlement layers it is among the deepest mounds in western Anatolia.",
    ),
    f(
      "Sarayın yanmış tabakası yapının aniden terk edildiğini gösteriyor; içeride bırakılan eşyaları yangının kendisi korumuş.",
      "The palace's burnt layer shows it was abandoned suddenly, and the fire itself preserved what was left inside.",
    ),
  ],
  tilmen: [
    f(
      "Höyük MÖ 2. binyılda bir kent devletinin başkentiydi ve Halep ile Hitit dünyası arasında duruyordu.",
      "The mound was the capital of a city state in the second millennium BC, standing between Aleppo and the Hittite world.",
    ),
    f(
      "Buluntular yerinde ayağa kaldırıldı: ziyaretçi temel değil, duvar görüyor.",
      "The finds were re-erected in place, so a visitor sees walls rather than foundations.",
    ),
  ],
  "yilanli-sutun": [
    f(
      "Sütun, Plataia'da Persleri yenen otuz bir Yunan kentinin ele geçirdikleri silahları eritmesiyle döküldü.",
      "The column was cast from the weapons captured by the thirty-one Greek cities that beat Persia at Plataea.",
    ),
    f(
      "Gövdesine kazınan otuz bir kentin adı, Yunan tarihinin ayakta kalan en eski ittifak listesidir.",
      "The thirty-one city names cut into the shaft are the oldest surviving list of a Greek alliance.",
    ),
  ],
  cemberlitas: [
    f(
      "Konstantin sütunu 330'da kendi forumunun ortasına diktirdi ve tepesine kendi heykelini koydurdu; heykel 1106'da bir fırtınada düştü.",
      "Constantine set the column at the centre of his forum in 330 and put his own statue on top; it came down in a storm in 1106.",
    ),
    f(
      "Kentin ayakta duran en eski anıtıdır: Ayasofya'dan iki, Sultanahmet'ten on üç yüzyıl önce dikildi.",
      "It is the city's oldest standing monument — raised two centuries before Hagia Sophia and thirteen before the Blue Mosque.",
    ),
  ],
  fasillar: [
    f(
      "Yedi metrelik heykel, çıkarıldığı taş ocağında yattığı yerde duruyor ve hiç tamamlanmadı.",
      "The seven-metre statue lies where it was cut, in its own quarry, and was never finished.",
    ),
  ],
  beldibi: [
    f(
      "Kaya sığınağının duvarlarındaki kazıma figürler, Anadolu'da bilinen en eski kaya resimleri arasındadır.",
      "The incised figures on the shelter walls are among the oldest rock art known in Anatolia.",
    ),
    f(
      "Sığınakta bulunan deniz kabukları, buradaki topluluğun kıyı kaynaklarını düzenli kullandığını gösteriyor.",
      "Sea shells found in the shelter show the community drew regularly on the resources of the coast.",
    ),
  ],
  direkli: [
    f(
      "Mağara, buzul çağının sonunda avcı topluluklarının mevsimlik kampıydı.",
      "The cave was a seasonal camp for hunting groups at the end of the ice age.",
    ),
    f(
      "Ocak yerleri, aynı noktanın binlerce yıl boyunca tekrar tekrar kullanıldığını gösteriyor.",
      "Its hearths show the same spot was returned to over thousands of years.",
    ),
  ],
  manazan: [
    f(
      "Yerleşim vadi duvarına beş kat hâlinde oyulmuştur ve en üst kata yalnızca içeriden ulaşılır.",
      "The settlement is cut five storeys into a valley wall, and its top floor can be reached only from within.",
    ),
    f(
      "Kuru mağara ikliminde korunmuş cesetler 'Manazan mumyaları' olarak bilinir.",
      "Bodies preserved by the dry cave air are known as the Manazan mummies.",
    ),
  ],
  mazi: [
    f(
      "Yeraltı şehrinin dört ayrı girişi vardır ve büyük bölümü hâlâ kazılmamıştır.",
      "The underground city has four separate entrances and much of it is still unexcavated.",
    ),
    f(
      "Yeraltı şehirlerinde ahırlar hep en üst kattadır: hayvanları aşağı indirmek zordu ve hava yukarıda daha iyiydi.",
      "Stables in these cities are always on the top level: animals were hard to take down, and the air was better near the surface.",
    ),
  ],
  gumusler: [
    f(
      "Ana kilisenin freskinde Meryem gülümser betimlenmiştir; bu, Bizans ikonografisinde son derece ender bir seçimdir.",
      "In the fresco of the main church the Virgin is shown smiling — an extremely rare choice in Byzantine iconography.",
    ),
    f(
      "Freskler kayanın içinde kaldıkları için güneş ve nemden korunmuş, renkleri canlı kalmıştır.",
      "Because they stayed inside the rock the frescoes were shielded from sun and damp, and their colours stayed bright.",
    ),
  ],
  "aya-irini": [
    f(
      "Kentin ilk kilisesidir ve 381'deki İkinci Ekümenik Konsil burada toplandı.",
      "It is the city's first church, and the Second Ecumenical Council met in it in 381.",
    ),
    f(
      "Camiye çevrilmediği için iç mekânı özgün hâlini korudu; apsisteki sade haç ikona kırıcılık döneminden kalmadır.",
      "It was never converted into a mosque, so the interior survives as it was, and the plain cross in the apse dates from iconoclasm.",
    ),
  ],
  "aziz-nikolaos": [
    f(
      "Kilise, Myra piskoposu Nikolaos'un mezarı üzerine kuruldu ve Bizans'ta önemli bir hac merkezi oldu.",
      "The church was built over the tomb of Nicholas, bishop of Myra, and became a major place of pilgrimage.",
    ),
    f(
      "1087'de İtalyan tüccarlar azizin kemiklerinin büyük bölümünü Bari'ye kaçırdı.",
      "In 1087 Italian merchants carried most of the saint's bones off to Bari.",
    ),
  ],
  "aziz-petrus": [
    f(
      "Elçilerin İşleri'ne göre inananlar ilk kez bu kentte 'Hristiyan' diye anıldı.",
      "According to Acts, it was in this city that believers were first called Christians.",
    ),
    f(
      "Kilisenin arkasında dağın içine açılan bir tünel vardır; baskın anında kaçış için yapıldığı düşünülüyor.",
      "A tunnel runs from the back of the church into the mountain, thought to have been cut for escape during a raid.",
    ),
  ],
  "aziz-yuhanna": [
    f(
      "Justinianus'un yaptırdığı bazilika tamamlandığında Ayasofya'dan sonraki en büyük kiliseydi.",
      "When Justinian's basilica was finished it was the largest church after Hagia Sophia.",
    ),
    f(
      "Planı, Yuhanna'nın mezarının tam olarak kubbelerin kesiştiği noktanın altına gelmesi için kuruldu.",
      "The plan was set so that the tomb of John would fall exactly beneath the crossing of the domes.",
    ),
  ],
  "yesil-cami": [
    f(
      "Caminin bezemesini Tebriz'den gelen çini ustaları yürüttü; hünkâr mahfili erken Osmanlı süslemesinin doruğudur.",
      "Tile masters from Tabriz carried out the decoration, and the royal loge is the high point of early Ottoman ornament.",
    ),
    f(
      "Dış cephe hiç tamamlanmadı; taş yüzeyde ustaların bıraktığı ölçü çizgileri hâlâ görülüyor.",
      "The exterior was never finished, and the masons' setting-out lines can still be seen on the stone.",
    ),
  ],
  "sivrihisar-ulu-cami": [
    f(
      "Altmış yedi ahşap sütunuyla Anadolu'nun en çok sütunlu ahşap direkli camisidir.",
      "With sixty-seven wooden columns it is the most heavily columned timber mosque in Anatolia.",
    ),
    f(
      "Tavan kirişleri bilerek gevşek geçmelerle bağlandı: ahşabın nem alıp vermesine izin verilmesi gerekiyordu.",
      "The roof joints were left deliberately loose, because the timber had to be able to take up and give off moisture.",
    ),
  ],
  "afyon-ulu-cami": [
    f(
      "1272 tarihli cami, ahşap direkli camilerin bilinen en erken tarihlilerindendir.",
      "Dated 1272, it is among the earliest dated timber hypostyle mosques.",
    ),
    f(
      "Tuğla minaresi, firuze çini şeritleriyle Selçuklu minare geleneğinin batıdaki en uç örneğidir.",
      "Its brick minaret, banded with turquoise tile, is the westernmost example of the Seljuk minaret tradition.",
    ),
  ],
  "arslanhane-camii": [
    f(
      "Cami adını duvarına yerleştirilmiş Roma dönemi aslan kabartmasından alır.",
      "The mosque takes its name from the Roman lion relief set into its wall.",
    ),
    f(
      "Yapı Ahi teşkilatının Ankara'daki merkeziydi; esnaf loncalarının toplantıları burada yapılırdı.",
      "It was the Ankara seat of the Ahi brotherhood, and the craft guilds met in it.",
    ),
  ],
  "cifte-minareli-medrese": [
    f(
      "Anadolu'nun en büyük açık avlulu medresesidir ve iki katlıdır.",
      "It is the largest open-courtyard madrasa in Anatolia, and it rises two storeys.",
    ),
    f(
      "Arkasındaki kümbet Anadolu'daki en büyük Selçuklu kümbetidir; yapı bir hanedan anıtı olarak tasarlandı.",
      "The tomb tower behind it is the largest Seljuk kümbet in Anatolia: the building was conceived as a dynastic monument.",
    ),
  ],
  "gok-medrese": [
    f(
      "Adını minarelerini kaplayan firuze çinilerden alır; taç kapısındaki on iki hayvanlı burç dizisi Anadolu'da eşsizdir.",
      "It takes its name from the turquoise tiles on its minarets, and the zodiac of twelve animals on its portal is without equal in Anatolia.",
    ),
    f(
      "Sivas'ta 1271'de üç büyük medrese birden yapıldı; kent bilerek bir eğitim merkezine dönüştürülüyordu.",
      "Three great madrasas went up in Sivas in 1271: the city was being deliberately turned into a centre of learning.",
    ),
  ],
  "sifaiye-medresesi": [
    f(
      "Yapı hem hastane hem tıp medresesiydi; tedavide su sesi ve müzik kullanılırdı.",
      "The building was both hospital and medical school, and running water and music were part of the treatment.",
    ),
    f(
      "Veremden ölen sultan I. İzzeddin Keykâvus, avlunun güney eyvanındaki çini kaplı türbeye gömüldü.",
      "Sultan Kaykaus I, who died of tuberculosis, was buried in the tiled tomb in the south iwan of the courtyard.",
    ),
  ],
  "ince-minareli-medrese": [
    f(
      "Taç kapısında yazı, taşın üzerine kurdele gibi düğümlenerek işlenmiştir; Selçuklu oymacılığının en cüretli örneğidir.",
      "On its portal the inscription is knotted across the stone like ribbon — the boldest piece of Seljuk carving.",
    ),
    f(
      "Adını veren ince minare 1901'de yıldırım düşmesiyle üst bölümünü kaybetti.",
      "The slender minaret that gave it its name lost its upper part to lightning in 1901.",
    ),
  ],
  "gevher-nesibe": [
    f(
      "Bir hastane ile tıp medresesinin bitişik kurulduğu bilinen ilk yapıdır: hastalar tedavi edilirken öğrenciler aynı avluda ders görüyordu.",
      "It is the first known building to set a hospital and a medical school adjoining: patients were treated while students studied across the same courtyard.",
    ),
    f(
      "Yapıda akıl hastalarının tedavisine ayrılmış odalar vardır; ruh sağlığının hastane içinde ele alındığı en erken örneklerdendir.",
      "It set aside rooms for the treatment of mental illness — among the earliest cases of psychiatric care inside a hospital.",
    ),
  ],
  "yildiz-sarayi": [
    f(
      "II. Abdülhamid otuz üç yıl boyunca devleti buradan yönetti; saray tek bir bina değil, koruya dağılmış bir yerleşkedir.",
      "Abdülhamid II governed for thirty-three years from here, and the palace is not one building but a compound scattered through a park.",
    ),
    f(
      "Bahçedeki porselen fabrikası Avrupa'ya karşı yerli üretim kurma girişimiydi ve hâlâ çalışıyor.",
      "The porcelain factory in the grounds was an attempt to build home production against European imports, and it is still working.",
    ),
  ],
  "edirne-sarayi": [
    f(
      "Yapımına Topkapı'dan önce başlanan saray, Osmanlı padişahlarının başlıca saraylarından biriydi.",
      "Begun before Topkapı, it was one of the principal palaces of the Ottoman sultans.",
    ),
    f(
      "1878'de Rus işgali sırasında cephanelik patlatılınca yapının büyük bölümü yıkıldı.",
      "Most of it came down in 1878, when its magazine was blown up during the Russian occupation.",
    ),
  ],
  "amasra-kalesi": [
    f(
      "Ceneviz armaları kale kapılarının üstünde hâlâ duruyor.",
      "Genoese coats of arms still sit above the castle gates.",
    ),
    f(
      "Surların içinde bugün de bir mahalle yaşar; bu, Türkiye'de kesintisiz iskân edilmiş ender bir ortaçağ kalesidir.",
      "A neighbourhood still lives inside the walls — a rare case in Türkiye of a medieval castle inhabited without a break.",
    ),
  ],
  "sanliurfa-kalesi": [
    f(
      "Doğu ucundaki iki Korint sütunu, Edessa kralı Manu'nun diktirdiği anıttan kalmadır ve halk arasında 'Nemrut'un tahtı' diye anılır.",
      "The two Corinthian columns at its eastern end survive from a monument raised by king Manu of Edessa, and are locally called the throne of Nimrod.",
    ),
    f(
      "Kuzey hendeği kayaya oyularak açıldı ve kaleyi tepeden gelen saldırılara karşı adaya çevirdi.",
      "The northern ditch was cut into the living rock, turning the citadel into an island against attack from the hill.",
    ),
  ],
  "erzurum-kalesi": [
    f(
      "İç kale MS 5. yüzyılda Theodosius döneminde kuruldu.",
      "The inner citadel was founded under Theodosius in the fifth century AD.",
    ),
    f(
      "Saltuklu döneminden kalan Tepsi Minare sonradan saat kulesine dönüştü; mekanizması 19. yüzyılda İngiltere'den getirildi.",
      "The Saltukid Tepsi Minaret was later turned into a clock tower, its movement brought from England in the nineteenth century.",
    ),
  ],
  "silifke-kalesi": [
    f(
      "Kale Haçlı seferleri boyunca Kilikya'nın anahtarı sayıldı ve Tapınak Şövalyeleri ile Ermeni Krallığı arasında defalarca el değiştirdi.",
      "The castle counted through the crusades as the key to Cilicia and changed hands repeatedly between the Templars and the Armenian kingdom.",
    ),
    f(
      "Kutsal Roma İmparatoru Friedrich Barbarossa 1190'da kalenin altındaki Göksu Nehri'nde boğuldu.",
      "The Holy Roman Emperor Frederick Barbarossa drowned in 1190 in the Göksu below this castle.",
    ),
  ],
  zerzevan: [
    f(
      "Kayaya oyulmuş Mithras tapınağı, bu askerî kültün Anadolu'da bilinen en iyi korunmuş mabedidir.",
      "The rock-cut Mithraeum is the best preserved temple of that soldiers' cult known in Anatolia.",
    ),
    f(
      "Kent, Roma'nın Pers sınırındaki garnizonuydu ve dört yüzyıl boyunca kullanıldı.",
      "The town was a Roman garrison on the Persian frontier and stayed in use for four centuries.",
    ),
  ],
  "kayseri-sultanhani": [
    f(
      "Aksaray'daki adaşıyla birlikte imparatorluk ölçeğinde yapılmış iki Selçuklu hanından biridir.",
      "With its namesake at Aksaray, it is one of only two Seljuk hans built at imperial scale.",
    ),
    f(
      "İki hanın planı neredeyse aynıdır: aynı hükümdar aynı yıllarda yolun iki ucunda aynı yapıyı tekrarlattı.",
      "The two follow almost the same plan: one ruler repeated one building at both ends of the road in the same years.",
    ),
  ],
  "karatay-han": [
    f(
      "Taç kapısındaki insan başlı figürler ve aslanlar, Selçuklu taş süslemesinin en zengin dizilerinden biridir.",
      "The human-headed figures and lions of its portal make one of the richest sequences of Seljuk ornament.",
    ),
    f(
      "Karatay'ın vakfiyesi, handa konaklayanların din ve mezhep ayrımı gözetilmeden ağırlanmasını şart koşar.",
      "Karatay's endowment deed requires travellers to be received without regard to religion or sect.",
    ),
  ],
  "cinci-hani": [
    f(
      "Han 1645'te yapıldı ve Safranbolu'nun İpek Yolu üzerindeki konumu sayesinde yüzyıllarca işledi.",
      "Built in 1645, the han worked for centuries thanks to Safranbolu's place on the Silk Road.",
    ),
    f(
      "Yaptıran Cinci Hoca, servetini saray çevresindeki nüfuzuna borçluydu ve handan kısa süre sonra idam edildi.",
      "Cinci Hoca, who built it, owed his fortune to his influence at court and was executed soon after it was finished.",
    ),
  ],
  "adana-taskopru": [
    f(
      "Roma köprüsü on yedi yüzyıl boyunca kesintisiz kullanıldı ve 2007'ye kadar araç trafiği taşıdı.",
      "The Roman bridge has been in use for seventeen centuries and carried motor traffic until 2007.",
    ),
    f(
      "Özgün yirmi bir gözünden on dördü ayakta.",
      "Fourteen of its original twenty-one arches survive.",
    ),
  ],
  cobandede: [
    f(
      "Yedi gözlü İlhanlı köprüsü, kesme taş işçiliğiyle Doğu Anadolu'nun en gösterişli ortaçağ köprüsüdür.",
      "The seven-arched Ilkhanid bridge is, for its ashlar work, the most imposing medieval bridge in eastern Anatolia.",
    ),
    f(
      "Kemer gözleri ortadan kenarlara doğru küçülür; bu düzen hem yükü dağıtır hem taşkın suyunu geçirir.",
      "Its arches shrink from the middle outwards, a plan that spreads the load and lets flood water through.",
    ),
  ],
  "koyunbaba-koprusu": [
    f(
      "On beş gözlü köprü 250 metre uzunluğuyla Kızılırmak'ın en uzun tarihî geçididir.",
      "At 250 metres, the fifteen-arched bridge is the longest historic crossing of the Kızılırmak.",
    ),
    f(
      "Kızılırmak'ın taşkınları üzerindeki köprülerin çoğunu götürdü; Koyunbaba beş yüz otuz yıldır duruyor.",
      "The river's floods carried away most of the bridges built over it; Koyunbaba has stood for five hundred and thirty years.",
    ),
  ],
  kursunlugerme: [
    f(
      "Kemer, iki ayrı su yolunu üst üste taşır; farklı kaynaklardan gelen sular karışmadan kente ulaşırdı.",
      "The aqueduct carries two channels one above the other, so water from different springs reached the city without mixing.",
    ),
    f(
      "Konstantinopolis'in su hattı, Roma dünyasının bilinen en uzun su yolu sistemidir: 400 kilometreyi aşar.",
      "The water line to Constantinople is the longest known aqueduct system of the Roman world, at more than 400 kilometres.",
    ),
  ],
  "aspendos-su-kemeri": [
    f(
      "Su yolu vadiyi geçerken basınç kuleleriyle çalışan bir ters sifon sistemi kullanır.",
      "The line crosses the valley on an inverted siphon worked by pressure towers.",
    ),
    f(
      "Sistemin çalışması için borulardaki basıncın hesaplanması gerekiyordu; bunun nasıl yapıldığı hâlâ tam bilinmiyor.",
      "Making it work required calculating the pressure in the pipes, and how that was done is still not fully known.",
    ),
  ],
  fildami: [
    f(
      "127 metreye 76 metrelik açık sarnıcın duvarları bugün de tam yükseklikte ayakta.",
      "The walls of this open cistern, 127 metres by 76, still stand to full height.",
    ),
    f(
      "Sarnıç, Bizans imparatorlarının ordunun önünde taç giydiği Hebdomon'un suyunu tutuyordu.",
      "It held the water of Hebdomon, where Byzantine emperors were crowned before the army.",
    ),
  ],
  "uc-kumbetler": [
    f(
      "En eskisi olan Emir Saltuk Kümbeti, Anadolu'daki kümbet mimarisinin başlangıcı sayılır.",
      "The oldest of the three, that of Emir Saltuk, is taken as the beginning of the tomb-tower form in Anatolia.",
    ),
    f(
      "Kümbet biçimi Orta Asya'nın çadır mimarisinden gelir: konik külah, keçe çadırın taşa çevrilmiş hâlidir.",
      "The form comes from the tents of Central Asia: the conical cap is a felt tent translated into stone.",
    ),
  ],
  "hudavend-hatun": [
    f(
      "Gövdedeki melek figürleri, çift başlı kartallar ve insan yüzleri Anadolu'da bu bileşimde başka hiçbir yapıda yoktur.",
      "Its angels, double-headed eagles and human faces appear in this combination on no other building in Anatolia.",
    ),
    f(
      "Kabartmalardaki meleklerin Hüdavend Hatun'un kendisini temsil ettiği öne sürülür; kesin bir yorum yoktur.",
      "It has been argued that the angels represent Hüdavend Hatun herself, though no reading is settled.",
    ),
  ],
  "osmangazi-turbesi": [
    f(
      "Türbeler bir Bizans manastırının kalıntıları üzerindedir; Orhan Gazi'nin türbesinde manastırın taban mozaiği hâlâ yerindedir.",
      "The tombs stand over the remains of a Byzantine monastery, and its floor mosaic is still in place in Orhan's.",
    ),
    f(
      "Osman Gazi'nin oğluna vasiyeti Bursa'ya gömülmekti; kent o ölmeden hemen önce alınmıştı.",
      "Osman's last wish to his son was to be buried at Bursa, and the city had been taken just before his death.",
    ),
  ],
  birgi: [
    f(
      "Kasaba 14. yüzyılda Aydınoğulları Beyliği'nin başkentiydi.",
      "The town was the capital of the Aydınid emirate in the fourteenth century.",
    ),
    f(
      "Ulu Cami'nin duvarlarında, yakındaki antik Hypaipa kentinden getirilmiş mermer bloklar ve yazıtlar kullanıldı.",
      "Marble blocks and inscriptions from the nearby ancient city of Hypaipa were built into the walls of the great mosque.",
    ),
  ],
  goynuk: [
    f(
      "Yerleşim, Fatih'in hocası Akşemseddin'in türbesinin çevresinde büyüdü.",
      "The settlement grew around the tomb of Akşemseddin, tutor to Mehmed the Conqueror.",
    ),
    f(
      "Akşemseddin, bulaşıcı hastalıkların gözle görülmeyen canlılarla yayıldığını yazan ilk Osmanlı yazarlarındandır.",
      "Akşemseddin was among the first Ottoman writers to hold that contagious disease spread by living things too small to see.",
    ),
  ],
  kula: [
    f(
      "Kasabada altı yüzden fazla tescilli Osmanlı evi ayakta ve sokak dokusu neredeyse hiç değişmedi.",
      "More than six hundred listed Ottoman houses survive here, and the street pattern has barely changed.",
    ),
    f(
      "Yakındaki lav tabakasında bulunan insan ayak izleri yaklaşık on bin yıllıktır ve Anadolu'nun en eski insan izleridir.",
      "Human footprints found in the lava nearby are about ten thousand years old, the oldest human traces in Anatolia.",
    ),
  ],
};

/** The extra facts for a site, or an empty list when none are written yet. */
export function factsFor(slug: string): Localized[] {
  return siteFacts[slug] ?? [];
}
