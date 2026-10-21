import type { Lang, Localized } from "@/lib/i18n";
import type { Era, Person } from "@/lib/scene-life";

/**
 * What the people of a model say when they are tapped.
 *
 * Every line is a first-person voice of nobody in particular — a vendor, a
 * priest, a carver — saying something that is generally true of that kind of
 * person in that period: what an amphora held, how a Roman sacrificed with
 * the head covered, that the Göbekli Tepe carvers worked limestone with
 * flint. No invented names, no invented events; the only named people are
 * the historical ones the place itself is about (Antiochus I at Nemrut,
 * Maussollos and Artemisia at Halicarnassus), and only for what is on record.
 *
 * A person's part in the scene is read off what the scene gave them — their
 * dress, what they carry, what they are doing — since `scene-life` keeps no
 * role on a person. Which of the several lines they say is chosen from their
 * place in the scene, so the same person says the same thing every visit,
 * and the next line on the next tap.
 */

export type StoryRole =
  | "citizen"
  | "reader"
  | "amphora"
  | "basket"
  | "water"
  | "mason"
  | "priest"
  | "priestess"
  | "worshipper"
  | "musician"
  | "actor"
  | "athlete"
  | "soldier"
  | "hunter"
  | "torch"
  | "child"
  | "official"
  | "spectator";

/** tr, en, de, ru. */
type Line = readonly [string, string, string, string];
type Pool = Partial<Record<StoryRole, readonly Line[]>>;

const WHITE = 0xf0ece2;

/** The part someone plays, read off how the scene dressed and equipped them. */
export function storyRole(person: Person): StoryRole {
  const { look, action, carry, carryLeft } = person;
  if (person.height < 1.35) return "child";
  if (look.headwear === "mask") return "actor";
  if (carry === "lyre" || carry === "aulos") return "musician";
  if (action === "run") return "athlete";
  if (look.garment === "exomis" && look.main === WHITE && look.trim === WHITE) return "athlete";
  if (carry === "chisel") return "mason";
  if (
    look.garment === "armour" ||
    carry === "spear" ||
    carry === "shield" ||
    carryLeft === "shield"
  )
    return look.garment === "hide" ? "hunter" : "soldier";
  if (carry === "torch") return "torch";
  if (
    carry === "incense" ||
    carry === "barsom" ||
    look.headwear === "tiara" ||
    // A long gown is a priest's only when it is white, or under a hood: the
    // laywomen of Hattusa, Troy and Ani wear coloured ones.
    (look.garment === "robe" && (look.main === WHITE || look.headwear === "hood")) ||
    (look.garment === "toga" && look.headwear === "veil")
  )
    return "priest";
  if (
    look.female &&
    look.garment === "chiton" &&
    look.main === WHITE &&
    (look.headwear === "wreath" || look.headwear === "fillet")
  )
    return "priestess";
  if (carry === "offering" || action === "pray" || action === "kneel") return "worshipper";
  if (carry === "scroll" || carry === "tablet" || action === "read") return "reader";
  if (carry === "amphora") return "amphora";
  if (carry === "basket") return "basket";
  if (carry === "jar") return "water";
  if (look.garment === "toga") return "official";
  if (action === "cheer") return "spectator";
  return "citizen";
}

/* ------------------------------------------------------------------ *
 * Shared by the Greek and Roman worlds (and the Hellenised kingdoms)
 * ------------------------------------------------------------------ */

const CLASSICAL: Pool = {
  child: [
    [
      "Aşık kemikleriyle oynuyoruz; dört kemiği atıp nasıl düştüklerine bakarız.",
      "We are playing knucklebones: you throw four and see how they land.",
      "Wir spielen mit Knöchelchen: Man wirft vier und schaut, wie sie fallen.",
      "Мы играем в бабки: бросаешь четыре косточки и смотришь, как они упадут.",
    ],
    [
      "Çember çevirmede kimse beni geçemez; sopayla iterim, yokuş aşağı uçar.",
      "Nobody beats me at hoop-rolling: I push it with a stick and it flies downhill.",
      "Beim Reifentreiben schlägt mich keiner: Ich treibe ihn mit dem Stock, und bergab fliegt er.",
      "В катании обруча меня никто не обгонит: толкаю палкой — и он летит под гору.",
    ],
    [
      "Okulda harfleri balmumu tabletlere kazıyarak öğreniyoruz.",
      "At school we learn our letters by scratching them into wax tablets.",
      "In der Schule lernen wir die Buchstaben, indem wir sie in Wachstafeln ritzen.",
      "В школе мы учим буквы, выцарапывая их на восковых табличках.",
    ],
    [
      "Cevizlerle oynuyoruz: dizinin tepesine atan hepsini alır.",
      "We are playing with nuts: whoever knocks down the little pile wins them all.",
      "Wir spielen mit Nüssen: Wer das Häufchen umwirft, bekommt alle.",
      "Мы играем в орехи: кто собьёт горку, тот забирает все.",
    ],
    [
      "Boynumdaki muska beni nazardan korur; annem hiç çıkarmamamı söyledi.",
      "The amulet round my neck keeps the evil eye away; my mother says never to take it off.",
      "Das Amulett um meinen Hals hält den bösen Blick fern; Mutter sagt, ich soll es nie abnehmen.",
      "Амулет на шее бережёт меня от сглаза; мама велела никогда его не снимать.",
    ],
    [
      "Bayram var! Akşam kurban etinden bize de pay düşecek.",
      "It's a festival! Tonight we get a share of the sacrifice too.",
      "Es ist Festtag! Heute Abend bekommen auch wir etwas vom Opferfleisch.",
      "Сегодня праздник! Вечером и нам достанется мясо от жертвоприношения.",
    ],
  ],
  water: [
    [
      "Çeşmeden su taşıyorum; evlerin çoğunda akan su yok.",
      "I am carrying water from the fountain; most houses have no running water.",
      "Ich trage Wasser vom Brunnen; die meisten Häuser haben kein fließendes Wasser.",
      "Я несу воду от фонтана: в большинстве домов нет водопровода.",
    ],
    [
      "Testi pişmiş topraktan; su içinde serin kalır.",
      "The jar is fired clay; water stays cool in it.",
      "Der Krug ist aus gebranntem Ton; darin bleibt das Wasser kühl.",
      "Кувшин из обожжённой глины — вода в нём остаётся прохладной.",
    ],
    [
      "Sabah erkenden çeşme başında sıra olur; bütün haberler orada konuşulur.",
      "Early in the morning there is a queue at the fountain, and all the news is told there.",
      "Frühmorgens steht man am Brunnen Schlange, und dort erzählt man sich alle Neuigkeiten.",
      "Рано утром у фонтана очередь — там и узнаёшь все новости.",
    ],
    [
      "Testiyi başımda taşırım; boynum alıştı artık.",
      "I carry the jar on my head; my neck is used to it by now.",
      "Ich trage den Krug auf dem Kopf; mein Nacken ist es längst gewohnt.",
      "Я ношу кувшин на голове — шея давно привыкла.",
    ],
    [
      "Su değerli; bir damlasını bile boşa dökmem.",
      "Water is precious; I don't spill a drop of it.",
      "Wasser ist kostbar; ich verschütte keinen Tropfen.",
      "Вода драгоценна — я не пролью ни капли.",
    ],
    [
      "Bu su yemek ve yıkanmak için; içmelik suyu ayrı testide tutarız.",
      "This water is for cooking and washing; drinking water we keep in a jar of its own.",
      "Dieses Wasser ist zum Kochen und Waschen; Trinkwasser halten wir in einem eigenen Krug.",
      "Эта вода для готовки и мытья, а питьевую мы держим в отдельном кувшине.",
    ],
  ],
  basket: [
    [
      "Taze incir ve ekmek satıyorum; erken gelen en iyisini alır.",
      "I sell fresh figs and bread; whoever comes early gets the best.",
      "Ich verkaufe frische Feigen und Brot; wer früh kommt, bekommt das Beste.",
      "Продаю свежий инжир и хлеб — кто пришёл рано, тому лучшее.",
    ],
    [
      "Sepet sazdan örülü; hafif ama sağlamdır.",
      "The basket is woven from reeds: light, but strong.",
      "Der Korb ist aus Schilf geflochten: leicht, aber fest.",
      "Корзина сплетена из тростника: лёгкая, но крепкая.",
    ],
    [
      "Pazarda tartıları ve fiyatları pazar memuru denetler; hile yapan ceza öder.",
      "The market official checks the weights and prices; a cheat pays a fine.",
      "Der Marktaufseher prüft Gewichte und Preise; wer betrügt, zahlt Strafe.",
      "Рыночный надзиратель проверяет весы и цены — обманщик платит штраф.",
    ],
    [
      "Bugün sebze bol: pırasa, lahana, bakla. Hangisinden istersin?",
      "Plenty of vegetables today: leeks, cabbage, broad beans. What will it be?",
      "Heute gibt es reichlich Gemüse: Lauch, Kohl, Saubohnen. Was darf es sein?",
      "Сегодня много овощей: лук-порей, капуста, бобы. Что возьмёте?",
    ],
    [
      "Kentin kendi bastığı bakır sikkeler de geçer; gümüş istemem.",
      "The city's own bronze coins are good here; I don't need silver.",
      "Die Bronzemünzen, die die Stadt selbst prägt, gelten hier; Silber brauche ich nicht.",
      "Здесь ходят и бронзовые монеты, что чеканит сам город, — серебро мне не нужно.",
    ],
    [
      "Zeytinlerimi tuzlu suda beklettim; tadına bak.",
      "My olives have been cured in brine. Have a taste.",
      "Meine Oliven lagen in Salzlake. Probier mal.",
      "Мои оливки выдержаны в рассоле. Попробуйте.",
    ],
  ],
  amphora: [
    [
      "Bu amforada zeytinyağı var; ağzını kilden bir tıkaçla mühürledik.",
      "There is olive oil in this amphora; we sealed its mouth with a clay stopper.",
      "In dieser Amphore ist Olivenöl; wir haben die Öffnung mit einem Tonpfropfen versiegelt.",
      "В этой амфоре оливковое масло; горло мы запечатали глиняной пробкой.",
    ],
    [
      "Kulpundaki damga, amforayı yapan atölyeyi gösterir.",
      "The stamp on the handle tells you which workshop made the amphora.",
      "Der Stempel am Henkel verrät, welche Werkstatt die Amphore gemacht hat.",
      "Клеймо на ручке говорит, в какой мастерской сделана амфора.",
    ],
    [
      "Sivri dibi sayesinde gemide kuma saplanır, istif kolay olur.",
      "Its pointed foot lets it stand in sand in a ship's hold, so they stack easily.",
      "Dank des spitzen Fußes steckt sie im Schiffsraum im Sand, so lässt sie sich gut stapeln.",
      "Острое дно позволяет поставить её в песок в трюме — так их удобно складывать.",
    ],
    [
      "Şarabı suyla karıştırıp içeriz; saf şarap içmek kabalık sayılır.",
      "We drink our wine mixed with water; drinking it neat is thought uncouth.",
      "Wir trinken den Wein mit Wasser gemischt; ihn pur zu trinken gilt als ungehobelt.",
      "Вино мы пьём, смешивая с водой: пить неразбавленным считается грубостью.",
    ],
    [
      "Kandiller de yemek de zeytinyağıyla; bu kentte yağsız ev yok.",
      "Lamps and cooking both run on olive oil; there's no house in town without it.",
      "Lampen und Küche brauchen Olivenöl; ohne Öl gibt es hier kein Haus.",
      "И светильники, и кухня — всё на оливковом масле; без него здесь нет ни одного дома.",
    ],
    [
      "Dolu bir amfora bir insan kadar ağır olabilir; dikkatli taşırım.",
      "A full amphora can weigh as much as a person; I carry it carefully.",
      "Eine volle Amphore kann so viel wiegen wie ein Mensch; ich trage sie vorsichtig.",
      "Полная амфора может весить как человек — несу её осторожно.",
    ],
  ],
  reader: [
    [
      "Bu bir papirüs rulosu; okurken bir elimle açar, ötekiyle sararım.",
      "This is a papyrus roll: as I read I unroll it with one hand and roll it up with the other.",
      "Das ist eine Papyrusrolle: Beim Lesen rolle ich sie mit einer Hand auf und mit der anderen zu.",
      "Это папирусный свиток: читая, я одной рукой разворачиваю его, а другой сворачиваю.",
    ],
    [
      "Her kitap elle kopyalanır; iyi bir kâtibin yazısı değerlidir.",
      "Every book is copied by hand; a good scribe's writing is worth a lot.",
      "Jedes Buch wird von Hand abgeschrieben; die Schrift eines guten Schreibers ist viel wert.",
      "Каждую книгу переписывают от руки — почерк хорошего писца ценится дорого.",
    ],
    [
      "Yüksek sesle okurum; sessiz okumak bana tuhaf gelir.",
      "I read aloud; reading in silence feels odd to me.",
      "Ich lese laut; still zu lesen kommt mir seltsam vor.",
      "Я читаю вслух — читать про себя мне непривычно.",
    ],
    [
      "Homeros'un dizelerini çocukken ezberledik; hâlâ okumaktan sıkılmam.",
      "We learned Homer's verses by heart as children, and I still never tire of them.",
      "Homers Verse haben wir als Kinder auswendig gelernt, und ich werde ihrer nie müde.",
      "Стихи Гомера мы учили наизусть ещё детьми — и они мне до сих пор не надоели.",
    ],
    [
      "Kelimeler arasında boşluk yok; alışana kadar okumak zor.",
      "There are no spaces between the words; it is hard to read until you are used to it.",
      "Zwischen den Wörtern gibt es keine Abstände; bis man es gewohnt ist, liest es sich schwer.",
      "Между словами нет пробелов — пока не привыкнешь, читать трудно.",
    ],
    [
      "Bugün hekimlik üzerine bir kitap arıyorum; ruloların ucundaki etiketlerden bulunur.",
      "Today I'm after a book on medicine; you find them by the tags on the ends of the rolls.",
      "Heute suche ich ein Buch über Heilkunde; man findet sie an den Schildchen an den Rollenenden.",
      "Сегодня ищу книгу по медицине — их находят по ярлычкам на концах свитков.",
    ],
  ],
  athlete: [
    [
      "Yarıştan önce vücuduma zeytinyağı sürerim; sonra tozu ve teri strigille kazırım.",
      "Before a race I rub myself with olive oil; afterwards I scrape off dust and sweat with a strigil.",
      "Vor dem Lauf reibe ich mich mit Olivenöl ein; danach schabe ich Staub und Schweiß mit der Strigilis ab.",
      "Перед бегом я натираюсь оливковым маслом, а потом счищаю пыль и пот стригилем.",
    ],
    [
      "Bir stadion koşusu pistin bir ucundan öteki ucuna, yaklaşık altı yüz ayak.",
      "The stadion race runs from one end of the track to the other, about six hundred feet.",
      "Der Stadionlauf geht von einem Ende der Bahn zum anderen, etwa sechshundert Fuß.",
      "Забег на стадий — от одного конца дорожки до другого, около шестисот футов.",
    ],
    [
      "Kazanırsam taç takarım; kentim bana bir ömür boyu yemek bile verebilir.",
      "If I win I am crowned, and my city may even feed me for life.",
      "Wenn ich gewinne, werde ich bekränzt, und meine Stadt verköstigt mich vielleicht lebenslang.",
      "Если я выиграю, меня увенчают, а родной город, может, будет кормить меня всю жизнь.",
    ],
    [
      "Hakemler elinde sopa tutar; erken çıkan ya da itişen cezayı yer.",
      "The judges carry rods; anyone who false-starts or shoves gets a beating.",
      "Die Kampfrichter tragen Stöcke; wer zu früh startet oder schubst, bekommt Schläge.",
      "Судьи держат палки: кто сорвался раньше времени или толкается, получит удар.",
    ],
    [
      "Sabahları gymnasionda çalışırım; yarış günü ise burada, bütün kentin önünde koşarım.",
      "In the mornings I train at the gymnasium; on race day I run here, in front of the whole city.",
      "Morgens trainiere ich im Gymnasion; am Wettkampftag laufe ich hier, vor der ganzen Stadt.",
      "По утрам я тренируюсь в гимнасии, а в день состязаний бегу здесь, на глазах у всего города.",
    ],
    [
      "Başlangıç taşındaki oluklara ayak parmaklarımı yerleştiririm.",
      "I set my toes in the grooves cut into the starting stone.",
      "Ich setze die Zehen in die Rillen der steinernen Startschwelle.",
      "Я ставлю пальцы ног в бороздки стартового камня.",
    ],
  ],
  actor: [
    [
      "Maskemi görünce seyirci kimi oynadığımı hemen anlar.",
      "One look at my mask and the audience knows at once whom I'm playing.",
      "Ein Blick auf meine Maske, und das Publikum weiß sofort, wen ich spiele.",
      "Зрители с первого взгляда на маску понимают, кого я играю.",
    ],
    [
      "Maskeli oyunlarda kadın rollerini de erkekler oynar.",
      "In the masked plays, men play the women's parts too.",
      "In den Maskenspielen spielen Männer auch die Frauenrollen.",
      "В спектаклях в масках и женские роли играют мужчины.",
    ],
    [
      "Maskemi değiştirerek aynı oyunda birkaç rol oynayabilirim.",
      "By changing my mask I can play several parts in the same play.",
      "Mit einem Maskenwechsel kann ich mehrere Rollen im selben Stück spielen.",
      "Меняя маску, я могу сыграть в одной пьесе несколько ролей.",
    ],
    [
      "Bu akşam bir komedide kurnaz köleyi oynuyorum; en çok o güldürür.",
      "Tonight I'm the cunning slave in a comedy; he always gets the biggest laughs.",
      "Heute Abend spiele ich in einer Komödie den schlauen Sklaven; er bekommt immer die meisten Lacher.",
      "Сегодня в комедии я играю хитрого раба — над ним смеются больше всех.",
    ],
    [
      "Seyirci beğenmezse ıslık çalar, beğenirse alkıştan yer yerinden oynar.",
      "If the audience dislikes us they whistle; if they like us the whole cavea thunders.",
      "Gefällt es dem Publikum nicht, pfeift es; gefällt es ihm, donnert das ganze Rund.",
      "Если публике не нравится — свистят, если нравится — гремит весь зрительный зал.",
    ],
    [
      "Sesimi arka sıralara ulaştırmak için yıllarca çalıştım.",
      "I trained for years to make my voice carry to the back rows.",
      "Ich habe jahrelang geübt, damit meine Stimme bis in die letzten Reihen trägt.",
      "Я годами учился, чтобы мой голос долетал до последних рядов.",
    ],
  ],
  musician: [
    [
      "Aulos çift borulu bir nefesli çalgı; iki boruyu birden üflerim.",
      "The aulos is a double reed pipe; I blow both pipes at once.",
      "Der Aulos ist ein doppeltes Rohrblattinstrument; ich blase beide Röhren zugleich.",
      "Авлос — двойная язычковая флейта: я дую в обе трубки сразу.",
    ],
    [
      "Lirin gövdesi kaplumbağa kabuğundan, telleri bağırsaktandır.",
      "A lyre's sound box is a tortoise shell; its strings are gut.",
      "Der Klangkörper der Lyra ist ein Schildkrötenpanzer, die Saiten sind aus Darm.",
      "Корпус лиры — черепаховый панцирь, а струны жильные.",
    ],
    [
      "Kurban sırasında aulos çalınır; uğursuz bir ses duyulmasın diye.",
      "The aulos plays during a sacrifice, so that no ill-omened sound is heard.",
      "Beim Opfer spielt der Aulos, damit kein unheilvoller Laut zu hören ist.",
      "Во время жертвоприношения играет авлос, чтобы не прозвучал дурной знак.",
    ],
    [
      "Alay yürürken müzik adımları tutar.",
      "When the procession walks, the music keeps its step.",
      "Wenn die Prozession geht, hält die Musik den Schritt.",
      "Когда идёт процессия, музыка задаёт шаг.",
    ],
    [
      "Müzik yarışmalarında kazananın adı taşa yazılır.",
      "At the music contests, the winner's name is cut in stone.",
      "Bei den musischen Wettkämpfen wird der Name des Siegers in Stein gemeißelt.",
      "На музыкальных состязаниях имя победителя высекают на камне.",
    ],
    [
      "Koroya ben eşlik ederim; şarkıcılar sesimi izler.",
      "I accompany the chorus; the singers follow my pipes.",
      "Ich begleite den Chor; die Sänger folgen meinem Spiel.",
      "Я аккомпанирую хору — певцы следуют за моей мелодией.",
    ],
  ],
  torch: [
    [
      "Akşam alayı için meşale taşıyorum; reçineli çam iyi yanar.",
      "I'm carrying a torch for the evening procession; resinous pine burns well.",
      "Ich trage eine Fackel für die Abendprozession; harzige Kiefer brennt gut.",
      "Я несу факел для вечерней процессии: смолистая сосна горит хорошо.",
    ],
    [
      "Gece sokaklar karanlık; meşalesiz kimse dolaşmaz.",
      "The streets are dark at night; nobody goes out without a torch.",
      "Nachts sind die Straßen dunkel; ohne Fackel geht keiner hinaus.",
      "Ночью улицы темны — без факела никто не выходит.",
    ],
    [
      "Meşale yarışında ateş sönmeden elden ele geçmeli.",
      "In the torch race the flame must pass from hand to hand without going out.",
      "Beim Fackellauf muss die Flamme von Hand zu Hand gehen, ohne zu erlöschen.",
      "В эстафете с факелами огонь должен переходить из рук в руки и не погаснуть.",
    ],
    [
      "Alayın önünde yürüyorum; yolu ben aydınlatırım.",
      "I walk at the head of the procession and light the way.",
      "Ich gehe der Prozession voran und leuchte den Weg.",
      "Я иду впереди процессии и освещаю путь.",
    ],
    [
      "Evde kandillerde zeytinyağı yakarız; meşale dışarısı için.",
      "At home we burn olive oil in lamps; torches are for outdoors.",
      "Zu Hause brennen wir Olivenöl in Lampen; Fackeln sind für draußen.",
      "Дома мы жжём оливковое масло в светильниках, а факелы — для улицы.",
    ],
    [
      "Rüzgâr esince alev yana yatar; kıvılcımlar giysime değmesin diye uzak tutarım.",
      "When the wind blows the flame leans over; I hold it away so the sparks miss my clothes.",
      "Wenn der Wind weht, neigt sich die Flamme; ich halte sie weg, damit die Funken mein Gewand verfehlen.",
      "Когда дует ветер, пламя клонится — держу факел подальше, чтобы искры не попали на одежду.",
    ],
  ],
  spectator: [
    [
      "Bu yeri kapmak için sabah erkenden geldim; iyi yerler çabuk dolar.",
      "I came early to get this seat; the good places fill fast.",
      "Ich bin früh gekommen, um diesen Platz zu bekommen; die guten Plätze sind schnell weg.",
      "Я пришёл пораньше, чтобы занять это место: хорошие места быстро заполняются.",
    ],
    [
      "Ön sıralar kentin ileri gelenlerine ayrılmıştır; biz yukarıda otururuz.",
      "The front rows are kept for the city's leading men; we sit higher up.",
      "Die vorderen Reihen sind den Honoratioren vorbehalten; wir sitzen weiter oben.",
      "Первые ряды отведены для знати, а мы сидим выше.",
    ],
    [
      "Yanıma bir minder getirdim; taş sıralar uzun bir günde sertleşir.",
      "I brought a cushion; the stone benches get hard over a long day.",
      "Ich habe ein Kissen mitgebracht; die Steinbänke werden über einen langen Tag hart.",
      "Я взял с собой подушку: за долгий день каменные скамьи становятся жёсткими.",
    ],
    [
      "Bazı sıralara isimler kazınmış; o yerler belli kişilerin ya da derneklerin.",
      "Some seats have names carved on them; those places belong to certain people or associations.",
      "In manche Sitze sind Namen eingeritzt; diese Plätze gehören bestimmten Leuten oder Vereinen.",
      "На некоторых местах вырезаны имена — эти места принадлежат определённым людям или союзам.",
    ],
    [
      "Bütün kent burada; komşularımı, ustamı, hatta rakiplerimi görüyorum.",
      "The whole city is here: I can see my neighbours, my master, even my rivals.",
      "Die ganze Stadt ist hier: Ich sehe meine Nachbarn, meinen Meister, sogar meine Rivalen.",
      "Здесь весь город: вижу соседей, своего мастера и даже соперников.",
    ],
    [
      "Yemeğimi de getirdim: ekmek, peynir ve birkaç incir.",
      "I brought my lunch too: bread, cheese and a few figs.",
      "Ich habe auch mein Essen dabei: Brot, Käse und ein paar Feigen.",
      "Я и еду взял: хлеб, сыр и несколько смокв.",
    ],
  ],
};

/* ------------------------------------------------------------------ *
 * The eras
 * ------------------------------------------------------------------ */

const ROMAN: Pool = {
  citizen: [
    [
      "Eve dönmeden hamama uğrarım; herkesle orada görüşürüm.",
      "I never go home without stopping at the baths; that's where I meet everyone.",
      "Ich gehe nie nach Hause, ohne in den Thermen vorbeizuschauen – dort treffe ich alle.",
      "Я никогда не иду домой, не заглянув в термы: там я встречаю всех.",
    ],
    [
      "Bu sokaklarda Yunanca konuşulur ama Roma hukuku geçer; ben ikisine de alışkınım.",
      "In these streets people speak Greek, but Roman law rules; I'm used to both.",
      "In diesen Straßen spricht man Griechisch, aber es gilt römisches Recht – ich bin beides gewohnt.",
      "На этих улицах говорят по-гречески, но действует римское право — я привык к обоим.",
    ],
    [
      "Su kemeri dağlardan suyu getirir; çeşmeler bütün gün akar.",
      "The aqueduct brings water from the hills; the fountains run all day.",
      "Das Aquädukt bringt Wasser aus den Bergen; die Brunnen laufen den ganzen Tag.",
      "Акведук приносит воду с гор — фонтаны текут весь день.",
    ],
    [
      "Yeni bir yazıt dikilecekmiş; bir hayırsever yine adını taşa kazıtıyor.",
      "They say a new inscription is going up: another benefactor wants his name in stone.",
      "Es heißt, eine neue Inschrift wird aufgestellt: Wieder will ein Stifter seinen Namen in Stein.",
      "Говорят, поставят новую надпись: ещё один благотворитель хочет увековечить имя в камне.",
    ],
    [
      "Ben bir zanaatkârım; loncamız buradaki onarımlara para verdi.",
      "I'm a craftsman; our guild gave money for the repairs here.",
      "Ich bin Handwerker; unsere Zunft hat Geld für die Ausbesserungen hier gegeben.",
      "Я ремесленник: наша коллегия дала деньги на здешний ремонт.",
    ],
    [
      "Öğle sıcağında herkes gölgeye çekilir; iş sabah erkenden yapılır.",
      "In the midday heat everyone retreats to the shade; work is done early in the morning.",
      "In der Mittagshitze zieht sich jeder in den Schatten zurück; gearbeitet wird früh am Morgen.",
      "В полуденную жару все уходят в тень — работают с раннего утра.",
    ],
    [
      "İmparatorun heykeli agorada duruyor; onun adına yeminler edilir.",
      "The emperor's statue stands in the agora; oaths are sworn in his name.",
      "Die Statue des Kaisers steht auf der Agora; man schwört Eide in seinem Namen.",
      "Статуя императора стоит на агоре — клятвы приносят его именем.",
    ],
  ],
  official: [
    [
      "Toga Roma vatandaşının giysisidir; ben onu resmî günlerde giyerim.",
      "The toga is the dress of a Roman citizen; I wear it on formal days.",
      "Die Toga ist das Gewand des römischen Bürgers; ich trage sie an Festtagen.",
      "Тога — одежда римского гражданина; я надеваю её по торжественным дням.",
    ],
    [
      "Bu yılki oyunların masrafını ben üstlendim; adım yazıta geçecek.",
      "I'm paying for this year's games, and my name will go on the inscription.",
      "Ich bezahle die diesjährigen Spiele, und mein Name kommt auf die Inschrift.",
      "Я оплачиваю игры этого года — моё имя войдёт в надпись.",
    ],
    [
      "Meclis toplantısından çıktım; yolların onarımını konuştuk.",
      "I've just come from the council; we discussed mending the roads.",
      "Ich komme gerade aus dem Rat; wir haben über die Ausbesserung der Straßen gesprochen.",
      "Я только что с заседания совета: обсуждали ремонт дорог.",
    ],
    [
      "Vali yakında kente gelecek; mahkemeler kurulacak, her şey hazır olmalı.",
      "The governor arrives soon to hold court; everything must be ready.",
      "Der Statthalter kommt bald, um Gericht zu halten; alles muss bereit sein.",
      "Скоро приедет наместник вершить суд — всё должно быть готово.",
    ],
    [
      "Toganın kıvrımlarını tek başına düzeltemem; giyerken yardım gerekir.",
      "I can't arrange the folds of a toga on my own; it takes help to put on.",
      "Die Falten der Toga bekomme ich allein nicht hin; zum Anlegen braucht man Hilfe.",
      "Складки тоги самому не уложить — надевать её помогают.",
    ],
    [
      "Bayramda halka yağ ve şarap dağıttım; kent bana teşekkür heykeli dikecek.",
      "At the festival I handed out oil and wine; the city is putting up a statue in thanks.",
      "Beim Fest habe ich Öl und Wein verteilt; die Stadt stellt mir zum Dank eine Statue auf.",
      "На празднике я раздавал масло и вино — город в благодарность ставит мне статую.",
    ],
  ],
  priest: [
    [
      "Romalılar gibi kurban sırasında başımı togamla örterim.",
      "As Romans do, I cover my head with my toga while I sacrifice.",
      "Wie es Römer tun, bedecke ich beim Opfer den Kopf mit der Toga.",
      "По римскому обычаю во время жертвоприношения я покрываю голову тогой.",
    ],
    [
      "Duada tek kelime yanlış söylenirse tören baştan yapılır.",
      "If a single word of the prayer is wrong, the rite starts again from the beginning.",
      "Ist nur ein Wort des Gebets falsch, beginnt der Ritus von vorn.",
      "Если в молитве ошибиться хоть словом, обряд начинают заново.",
    ],
    [
      "İmparator kültünün rahibiyim; doğum gününde kentte şenlik olur.",
      "I'm a priest of the imperial cult; on the emperor's birthday the city celebrates.",
      "Ich bin Priester des Kaiserkults; am Geburtstag des Kaisers feiert die Stadt.",
      "Я жрец императорского культа: в день рождения императора город празднует.",
    ],
    [
      "Tütsüyü sunağa koyarım; dumanı tanrıya ulaşır.",
      "I put the incense on the altar, and its smoke rises to the god.",
      "Ich lege den Weihrauch auf den Altar, und sein Rauch steigt zum Gott auf.",
      "Я кладу ладан на алтарь — его дым поднимается к богу.",
    ],
    [
      "Kurbandan sonra et halka dağıtılır; tanrıya kemikler ve yağ kalır.",
      "After the sacrifice the meat goes to the people; the god receives the bones and the fat.",
      "Nach dem Opfer bekommt das Volk das Fleisch; dem Gott bleiben Knochen und Fett.",
      "После жертвоприношения мясо раздают людям, а богу остаются кости и жир.",
    ],
    [
      "Kurbanlık hayvan kusursuz olmalı; lekeli olanı geri çeviririm.",
      "The victim must be flawless; I turn away any animal with a blemish.",
      "Das Opfertier muss makellos sein; ein Tier mit Makel weise ich zurück.",
      "Жертвенное животное должно быть безупречным — с изъяном я не приму.",
    ],
  ],
  worshipper: [
    [
      "Tanrıya bir adak getirdim: biraz tütsü ve küçük bir kandil.",
      "I've brought the god an offering: some incense and a small lamp.",
      "Ich habe dem Gott eine Gabe gebracht: etwas Weihrauch und eine kleine Lampe.",
      "Я принёс богу дар: немного ладана и маленький светильник.",
    ],
    [
      "Dileğim kabul olursa yazıtlı bir adak taşı diktireceğim.",
      "If my prayer is granted, I'll set up a votive stone with an inscription.",
      "Wird mein Gebet erhört, lasse ich einen Weihestein mit Inschrift aufstellen.",
      "Если моя просьба исполнится, я поставлю посвятительный камень с надписью.",
    ],
    [
      "Tapınağın içine herkes girmez; biz önündeki sunakta dua ederiz.",
      "Not everyone goes inside the temple; we pray at the altar in front of it.",
      "Nicht jeder betritt den Tempel; wir beten am Altar davor.",
      "Внутрь храма заходят не все — мы молимся у алтаря перед ним.",
    ],
    [
      "Ellerimi göğe kaldırıp dua ederim; tanrılar yukarıdadır.",
      "I pray with my hands raised to the sky; the gods are above.",
      "Ich bete mit zum Himmel erhobenen Händen; die Götter sind oben.",
      "Я молюсь, воздев руки к небу: боги наверху.",
    ],
    [
      "Bayram günü tapınak çelenk ve çiçeklerle süslenir.",
      "On a feast day the temple is hung with garlands and flowers.",
      "Am Festtag wird der Tempel mit Girlanden und Blumen geschmückt.",
      "В праздник храм украшают гирляндами и цветами.",
    ],
    [
      "Hasta oğlum için geldim; tanrının yardımını diliyorum.",
      "I've come for my sick son; I'm asking the god for help.",
      "Ich komme wegen meines kranken Sohnes und bitte den Gott um Hilfe.",
      "Я пришёл ради больного сына — прошу у бога помощи.",
    ],
  ],
  soldier: [
    [
      "Kentin barışı uzun sürdü; nöbetlerimiz çoğu zaman sakin geçer.",
      "The city has known a long peace; my watches are usually quiet.",
      "Die Stadt erlebt einen langen Frieden; meine Wachen sind meist ruhig.",
      "Город давно живёт в мире — мои дозоры обычно спокойны.",
    ],
    [
      "Kalkanımı ve mızrağımı her gün bakımdan geçiririm.",
      "Every day I look after my shield and spear.",
      "Jeden Tag pflege ich Schild und Speer.",
      "Каждый день я привожу в порядок щит и копьё.",
    ],
    [
      "Bazı oyunlarda zırhla koşu yarışı olur; ağır ama heyecanlı.",
      "Some games have a race in armour: heavy, but thrilling.",
      "Bei manchen Spielen gibt es einen Lauf in Rüstung: schwer, aber packend.",
      "На некоторых играх бегут в доспехах — тяжело, но захватывающе.",
    ],
    [
      "Yardımcı birliklerde yirmi beş yıl hizmet eden Roma vatandaşı olur.",
      "Serve twenty-five years in the auxiliaries and you become a Roman citizen.",
      "Wer fünfundzwanzig Jahre in den Hilfstruppen dient, wird römischer Bürger.",
      "Отслужи двадцать пять лет во вспомогательных войсках — и станешь римским гражданином.",
    ],
    [
      "Miğferin altında keçe bir başlık var; yoksa güneşte kafam pişer.",
      "There's a felt cap under the helmet, or my head would cook in this sun.",
      "Unter dem Helm trage ich eine Filzkappe, sonst würde mein Kopf in der Sonne garen.",
      "Под шлемом у меня войлочная шапка, иначе голова сварится на солнце.",
    ],
    [
      "Bugün kalabalığı düzende tutmak bizim işimiz.",
      "Today our job is keeping the crowd in order.",
      "Heute ist es unsere Aufgabe, die Menge in Ordnung zu halten.",
      "Сегодня наша задача — следить за порядком в толпе.",
    ],
  ],
};

const HELLENISTIC: Pool = {
  citizen: [
    [
      "Kralların gücü büyük ama kentimizin meclisi hâlâ toplanıp karar alıyor.",
      "The kings are powerful, but our city's assembly still meets and votes.",
      "Die Könige sind mächtig, aber die Volksversammlung unserer Stadt tagt und beschließt noch immer.",
      "Цари могущественны, но народное собрание нашего города по-прежнему собирается и голосует.",
    ],
    [
      "Yunanca bu kıyıların her yerinde konuşulur; Mısır'dan gelen tüccarla bile anlaşırım.",
      "Greek is spoken all along these coasts; I can talk even with a merchant from Egypt.",
      "Griechisch spricht man an all diesen Küsten; ich verständige mich sogar mit einem Händler aus Ägypten.",
      "По-гречески говорят по всему побережью — я договорюсь даже с купцом из Египта.",
    ],
    [
      "Bayram için komşu kentlerden de insanlar geldi; yollar kalabalık.",
      "People have come from the neighbouring cities for the festival; the roads are crowded.",
      "Zum Fest sind Leute aus den Nachbarstädten gekommen; die Straßen sind voll.",
      "На праздник пришли люди из соседних городов — дороги полны.",
    ],
    [
      "Gymnasionda büyüyen her genç Homeros okur ve güreş öğrenir.",
      "Every boy who grows up in the gymnasium reads Homer and learns to wrestle.",
      "Jeder Junge, der im Gymnasion aufwächst, liest Homer und lernt Ringen.",
      "Каждый юноша, выросший в гимнасии, читает Гомера и учится борьбе.",
    ],
    [
      "Sikkenin üzerindeki portre kralın; para onun adına basıldı.",
      "The portrait on this coin is the king's; it was struck in his name.",
      "Das Porträt auf dieser Münze ist das des Königs; sie wurde in seinem Namen geprägt.",
      "Портрет на этой монете — царский: её отчеканили от его имени.",
    ],
    [
      "Agorada filozoflar tartışıyor; ben dinlemeyi severim.",
      "Philosophers are arguing in the agora; I like to listen.",
      "Auf der Agora streiten Philosophen; ich höre gern zu.",
      "На агоре спорят философы — я люблю послушать.",
    ],
    [
      "Kutsal alana gelen herkes en güzel giysisini giyer.",
      "Everyone who comes to the sanctuary wears their best clothes.",
      "Wer ins Heiligtum kommt, trägt seine schönsten Kleider.",
      "Все, кто приходит в святилище, надевают лучшую одежду.",
    ],
  ],
  priest: [
    [
      "Kurban sunakta yakılır; yağa sarılı kemikler tanrının payıdır.",
      "The sacrifice burns on the altar; the bones wrapped in fat are the god's share.",
      "Das Opfer brennt auf dem Altar; die in Fett gehüllten Knochen sind der Anteil des Gottes.",
      "Жертва сгорает на алтаре: кости, обёрнутые жиром, — доля бога.",
    ],
    [
      "Bazı kentlerde rahiplik satın alınır; bazılarında ailede kalır.",
      "In some cities a priesthood is bought; in others it stays in the family.",
      "In manchen Städten kauft man ein Priesteramt, in anderen bleibt es in der Familie.",
      "В одних городах жречество покупают, в других оно передаётся в семье.",
    ],
    [
      "Başımdaki çelenk tanrıya hizmet ettiğimi gösterir.",
      "The wreath on my head shows that I serve the god.",
      "Der Kranz auf meinem Kopf zeigt, dass ich dem Gott diene.",
      "Венок на голове показывает, что я служу богу.",
    ],
    [
      "Sunağa çıkmadan önce ellerimi kutsal suyla yıkarım.",
      "Before I go up to the altar I wash my hands in holy water.",
      "Bevor ich zum Altar hinaufgehe, wasche ich mir die Hände mit geweihtem Wasser.",
      "Прежде чем подняться к алтарю, я омываю руки священной водой.",
    ],
    [
      "Tütsünün kokusu tanrıları memnun eder.",
      "The scent of incense pleases the gods.",
      "Der Duft des Weihrauchs erfreut die Götter.",
      "Аромат ладана угоден богам.",
    ],
    [
      "Takvimdeki bayramları ben yönetirim; her birinin kendi kurbanı vardır.",
      "I lead the festivals of the calendar; each has its own sacrifice.",
      "Ich leite die Feste des Kalenders; jedes hat sein eigenes Opfer.",
      "Я руковожу праздниками по календарю — у каждого своё жертвоприношение.",
    ],
  ],
  priestess: [
    [
      "Tanrıçaya hizmet ederken beyazlar giyerim.",
      "When I serve the goddess I wear white.",
      "Wenn ich der Göttin diene, trage ich Weiß.",
      "Служа богине, я ношу белое.",
    ],
    [
      "Bu görevi bir yıllığına üstlendim; sonra başka bir kadın gelecek.",
      "I hold this office for one year; then another woman will take it.",
      "Ich habe dieses Amt für ein Jahr; danach übernimmt es eine andere Frau.",
      "Я исполняю эту должность год, потом её примет другая женщина.",
    ],
    [
      "Alayda kutsal sepeti başımda ben taşırım.",
      "In the procession I carry the sacred basket on my head.",
      "In der Prozession trage ich den heiligen Korb auf dem Kopf.",
      "В процессии я несу на голове священную корзину.",
    ],
    [
      "Kızlar bayramda koro hâlinde ilahi söyler.",
      "At the festival the girls sing hymns as a chorus.",
      "Beim Fest singen die Mädchen im Chor Hymnen.",
      "На празднике девушки поют гимны хором.",
    ],
    [
      "Kutsal ateşin sönmemesine ben bakarım.",
      "I see to it that the sacred fire never goes out.",
      "Ich achte darauf, dass das heilige Feuer nie erlischt.",
      "Я слежу, чтобы священный огонь никогда не гас.",
    ],
    [
      "Adakları kayda geçiririz; hazinenin envanteri taşa yazılır.",
      "We record the offerings; the treasury's inventory is written in stone.",
      "Wir verzeichnen die Weihgaben; das Inventar des Schatzes wird in Stein gemeißelt.",
      "Мы записываем приношения — опись сокровищницы высекают на камне.",
    ],
  ],
  worshipper: [
    [
      "Tanrıya bir kâse meyve getirdim; bu yılki ilk ürünlerden.",
      "I've brought the god a bowl of fruit, the first of this year's harvest.",
      "Ich habe dem Gott eine Schale Obst gebracht, die ersten Früchte dieses Jahres.",
      "Я принёс богу чашу плодов — первые из урожая этого года.",
    ],
    [
      "Kimi tanrıya bir soru sormaya gelir; ben teşekkür etmeye geldim.",
      "Some come to ask the god a question; I came to give thanks.",
      "Manche kommen, um dem Gott eine Frage zu stellen; ich bin gekommen, um zu danken.",
      "Одни приходят задать богу вопрос, а я пришёл поблагодарить.",
    ],
    [
      "Ellerimi göğe açarak dua ederim.",
      "I pray with my hands open to the sky.",
      "Ich bete mit zum Himmel geöffneten Händen.",
      "Я молюсь, раскрыв ладони к небу.",
    ],
    [
      "Küçük bir pişmiş toprak heykelcik bıraktım; tapınak bunlarla dolu.",
      "I left a little terracotta figurine; the temple is full of them.",
      "Ich habe eine kleine Terrakottafigur hinterlassen; der Tempel ist voll davon.",
      "Я оставил маленькую терракотовую фигурку — в храме их множество.",
    ],
    [
      "Kutsal alanda kan dökmek yasak; buraya sığınan güvendedir.",
      "No blood may be shed in the sanctuary; whoever takes refuge here is safe.",
      "Im Heiligtum darf kein Blut vergossen werden; wer hier Zuflucht sucht, ist sicher.",
      "В святилище нельзя проливать кровь — нашедший здесь убежище в безопасности.",
    ],
    [
      "Alayla birlikte kutsal yoldan yürüyerek geldik.",
      "We came on foot along the sacred way with the procession.",
      "Wir sind mit der Prozession zu Fuß den heiligen Weg entlanggekommen.",
      "Мы пришли пешком по священной дороге вместе с процессией.",
    ],
  ],
  soldier: [
    [
      "Kralın paralı askeriyim; maaşım gümüş sikkeyle ödenir.",
      "I'm one of the king's mercenaries; I'm paid in silver coin.",
      "Ich bin Söldner des Königs; mein Sold wird in Silbermünzen gezahlt.",
      "Я наёмник царя — жалованье мне платят серебром.",
    ],
    [
      "Kutsal alanın hazinesini koruyoruz.",
      "We guard the sanctuary's treasury.",
      "Wir bewachen den Schatz des Heiligtums.",
      "Мы охраняем сокровищницу святилища.",
    ],
    [
      "Gençken efebos olarak iki yıl askerlik eğitimi aldım.",
      "As a youth I spent two years in training as an ephebe.",
      "Als junger Mann war ich zwei Jahre als Ephebe in der Ausbildung.",
      "В юности я два года обучался военному делу эфебом.",
    ],
    [
      "Falanksta uzun mızraklarla omuz omuza dururuz.",
      "In the phalanx we stand shoulder to shoulder with long spears.",
      "In der Phalanx stehen wir Schulter an Schulter mit langen Spießen.",
      "В фаланге мы стоим плечом к плечу с длинными копьями.",
    ],
    [
      "Bronz miğfer sıcakta fırın gibi olur.",
      "A bronze helmet turns into an oven in this heat.",
      "Ein Bronzehelm wird in dieser Hitze zum Backofen.",
      "Бронзовый шлем в такую жару превращается в печь.",
    ],
    [
      "Bayramda alayın yolunu açmak bizim işimiz.",
      "On feast days it's our job to clear the way for the procession.",
      "An Festtagen machen wir der Prozession den Weg frei.",
      "В праздники мы расчищаем путь процессии.",
    ],
  ],
};

const NEOLITHIC: Pool = {
  citizen: [
    [
      "Taş direkleri dikmek için birçok topluluk bir araya gelir; sonra hep birlikte şölen yaparız.",
      "Many groups come together to raise the stone pillars, and afterwards we all feast together.",
      "Viele Gruppen kommen zusammen, um die Steinpfeiler aufzurichten, und danach feiern wir gemeinsam.",
      "Чтобы поставить каменные столбы, собираются многие общины, а потом все вместе пируем.",
    ],
    [
      "Yabani buğday başaklarını çakmaktaşı ağızlı oraklarla keseriz.",
      "We cut the ears of wild wheat with sickles edged with flint.",
      "Wir schneiden die Ähren des wilden Weizens mit Sicheln aus Feuerstein.",
      "Колосья дикой пшеницы мы срезаем серпами с кремнёвыми вкладышами.",
    ],
    [
      "Ceylan sürüleri her yıl aynı mevsimde ovadan geçer; onları bekleriz.",
      "Every year the gazelle herds cross the plain in the same season, and we wait for them.",
      "Jedes Jahr ziehen die Gazellenherden zur selben Zeit durch die Ebene, und wir warten auf sie.",
      "Каждый год в одно и то же время стада газелей проходят по равнине — мы их ждём.",
    ],
    [
      "Direklerdeki tilki, yaban domuzu ve yılan bizim için önemlidir; hikâyeleri ateş başında anlatılır.",
      "The fox, the boar and the snake on the pillars matter to us; their stories are told by the fire.",
      "Fuchs, Keiler und Schlange auf den Pfeilern sind uns wichtig; ihre Geschichten erzählt man am Feuer.",
      "Лиса, кабан и змея на столбах важны для нас — их истории рассказывают у огня.",
    ],
    [
      "Taşı taşla döverek biçimlendiririz; çekiç taşı işin çoğunu yapar.",
      "We shape stone by pounding it with stone; the hammerstone does most of the work.",
      "Wir formen Stein, indem wir ihn mit Stein bearbeiten; der Schlagstein macht die meiste Arbeit.",
      "Камень мы обрабатываем камнем — основную работу делает отбойник.",
    ],
    [
      "Yabani arpa ve buğdayı taş öğütme taşlarında una çeviririz.",
      "We grind wild barley and wheat into flour on grinding stones.",
      "Wilde Gerste und Weizen mahlen wir auf Reibsteinen zu Mehl.",
      "Дикий ячмень и пшеницу мы перетираем в муку на зернотёрках.",
    ],
    [
      "Obsidyen uzak dağlardan gelir; parlak ve çakmaktaşından da keskin.",
      "Obsidian comes from far-off mountains; it is glossy and sharper even than flint.",
      "Obsidian kommt aus fernen Bergen; er glänzt und ist schärfer als Feuerstein.",
      "Обсидиан приносят с далёких гор — он блестящий и острее кремня.",
    ],
  ],
  mason: [
    [
      "Bu T biçimli direği tepenin yanındaki kireçtaşı ocağından çıkardık.",
      "We cut this T-shaped pillar from the limestone quarry beside the hill.",
      "Diesen T-förmigen Pfeiler haben wir im Kalksteinbruch neben dem Hügel gebrochen.",
      "Этот Т-образный столб мы вырубили в известняковой каменоломне рядом с холмом.",
    ],
    [
      "Kabartmaları çakmaktaşı aletlerle oyarım; ağır ve sabır isteyen bir iş.",
      "I carve the reliefs with flint tools; it is slow work that takes patience.",
      "Ich meißle die Reliefs mit Feuersteingeräten; das ist langsame Arbeit, die Geduld braucht.",
      "Я вырезаю рельефы кремнёвыми орудиями — работа медленная, нужно терпение.",
    ],
    [
      "Bazı direklere kollar ve eller oyarız; direk o zaman bir varlık gibi durur.",
      "On some pillars we carve arms and hands, and then the pillar stands like a being.",
      "In manche Pfeiler meißeln wir Arme und Hände, und dann steht der Pfeiler da wie ein Wesen.",
      "На некоторых столбах мы вырезаем руки и кисти — и столб стоит, как живое существо.",
    ],
    [
      "Bir direği kaldırmak için onlarca kişi gerekir: ipler, kaldıraçlar ve çok sesli bir şarkı.",
      "Raising a pillar takes dozens of people: ropes, levers and a song everyone sings.",
      "Einen Pfeiler aufzurichten braucht Dutzende Leute: Seile, Hebel und ein Lied, das alle singen.",
      "Чтобы поднять столб, нужны десятки людей: верёвки, рычаги и песня, которую поют все.",
    ],
    [
      "Hayvanları taşa sığ oyarım; ışık yandan vurunca canlanırlar.",
      "I cut the animals shallow in the stone; when the light falls from the side they come alive.",
      "Ich schneide die Tiere flach in den Stein; fällt das Licht von der Seite, werden sie lebendig.",
      "Я вырезаю животных неглубоко — при боковом свете они оживают.",
    ],
    [
      "Taş tozu gözlerimi yakıyor ama bu direk bitmeden dinlenmeyeceğim.",
      "The stone dust stings my eyes, but I won't rest until this pillar is finished.",
      "Der Steinstaub brennt mir in den Augen, aber ich ruhe nicht, bis dieser Pfeiler fertig ist.",
      "Каменная пыль ест глаза, но я не отдохну, пока не закончу этот столб.",
    ],
  ],
  hunter: [
    [
      "Mızrağımın ucu çakmaktaşından; uçları kendim yontarım.",
      "My spear has a flint point; I knap the points myself.",
      "Mein Speer hat eine Spitze aus Feuerstein; die Spitzen schlage ich selbst.",
      "Наконечник моего копья кремнёвый — я сам их оббиваю.",
    ],
    [
      "Yaban sığırı çok tehlikelidir; ona yalnızca birlikte avlanırız.",
      "The wild aurochs is very dangerous; we only ever hunt it together.",
      "Der wilde Auerochse ist sehr gefährlich; wir jagen ihn nur gemeinsam.",
      "Тур очень опасен — на него мы охотимся только вместе.",
    ],
    [
      "Ceylan avından sonra et herkesle paylaşılır.",
      "After a gazelle hunt the meat is shared with everyone.",
      "Nach der Gazellenjagd wird das Fleisch mit allen geteilt.",
      "После охоты на газелей мясо делят со всеми.",
    ],
    [
      "Belimdeki tilki postu benim işaretim.",
      "The fox pelt at my belt is my sign.",
      "Das Fuchsfell an meinem Gürtel ist mein Zeichen.",
      "Лисья шкура на поясе — мой знак.",
    ],
    [
      "Akbabalar gökte dönüyor; nereye indiklerine bakarım.",
      "Vultures are circling up there; I watch where they come down.",
      "Geier kreisen dort oben; ich schaue, wo sie niedergehen.",
      "В небе кружат грифы — я слежу, куда они опустятся.",
    ],
    [
      "Yaban domuzunun izini sabah çiyinde sürmek kolaydır.",
      "In the morning dew a boar's tracks are easy to follow.",
      "Im Morgentau ist die Fährte eines Keilers leicht zu verfolgen.",
      "По утренней росе кабаний след найти легко.",
    ],
  ],
  water: [
    [
      "Bu kap taştan oyulmuş; ağır ama kırılmaz.",
      "This vessel is carved from stone: heavy, but it won't break.",
      "Dieses Gefäß ist aus Stein gehauen: schwer, aber es zerbricht nicht.",
      "Этот сосуд выдолблен из камня: тяжёлый, зато не разобьётся.",
    ],
    [
      "Yağmur suyunu kayaya oyulmuş havuzlarda toplarız.",
      "We collect rainwater in basins cut into the rock.",
      "Wir sammeln Regenwasser in Becken, die in den Fels gehauen sind.",
      "Дождевую воду мы собираем в высеченных в скале водоёмах.",
    ],
    [
      "Deriden bir tulumda su taşımak daha hafif.",
      "Carrying water in a skin bag is lighter.",
      "Wasser im Lederschlauch zu tragen ist leichter.",
      "Носить воду в кожаном бурдюке легче.",
    ],
    [
      "Bu tepe kurak; buraya gelen herkes suyu paylaşır.",
      "This hill is dry; everyone who comes here shares the water.",
      "Dieser Hügel ist trocken; wer herkommt, teilt das Wasser.",
      "Этот холм сухой — все, кто приходит сюда, делятся водой.",
    ],
  ],
  child: [
    [
      "Taşları dizip ev yapma oyunu oynuyorum.",
      "I'm playing at building houses with stones.",
      "Ich spiele Häuserbauen mit Steinen.",
      "Я играю — строю домики из камней.",
    ],
    [
      "Babam bana çakmaktaşı yontmayı öğretiyor; daha çok parmağımı kesiyorum.",
      "My father is teaching me to knap flint; mostly I cut my fingers.",
      "Mein Vater bringt mir bei, Feuerstein zu schlagen; meistens schneide ich mir in die Finger.",
      "Отец учит меня оббивать кремень — пока я больше режу пальцы.",
    ],
    [
      "Büyükler direkleri dikerken uzaktan izliyorum.",
      "I watch from a distance while the grown-ups raise the pillars.",
      "Ich sehe aus der Ferne zu, wie die Großen die Pfeiler aufrichten.",
      "Я смотрю издалека, как взрослые ставят столбы.",
    ],
    [
      "Bugün şölen var; ateşte et pişiyor!",
      "There's a feast today; meat is roasting on the fire!",
      "Heute ist ein Fest; über dem Feuer brät Fleisch!",
      "Сегодня пир — на огне жарится мясо!",
    ],
  ],
  worshipper: [
    [
      "Burada atalarımızı ve hayvanların ruhlarını anarız.",
      "Here we remember our ancestors and the spirits of the animals.",
      "Hier gedenken wir unserer Ahnen und der Geister der Tiere.",
      "Здесь мы чтим предков и духов животных.",
    ],
    [
      "Direklerin arasında sessiz olmak gerekir.",
      "Among the pillars one must be quiet.",
      "Zwischen den Pfeilern muss man still sein.",
      "Среди столбов надо хранить тишину.",
    ],
    [
      "Şölenden kalan kemikleri buraya, duvarın dibine bırakırız.",
      "We leave the bones from the feast here, at the foot of the wall.",
      "Die Knochen vom Festmahl legen wir hier am Fuß der Mauer nieder.",
      "Кости с пира мы оставляем здесь, у подножия стены.",
    ],
    [
      "Diz çöküp ellerimi taşa koyarım; taş serin ve eski.",
      "I kneel and lay my hands on the stone; it is cool and old.",
      "Ich knie nieder und lege die Hände auf den Stein; er ist kühl und alt.",
      "Я становлюсь на колени и кладу руки на камень — он прохладный и древний.",
    ],
  ],
};

const COMMAGENE: Pool = {
  citizen: [
    [
      "Kral Antiokhos'un yasası burada her ay, doğum gününde ve tahta çıkış gününde bayram emreder.",
      "King Antiochus' law orders a feast here every month, on his birthday and on the day he became king.",
      "König Antiochos' Gesetz ordnet hier jeden Monat ein Fest an, an seinem Geburtstag und am Tag seiner Krönung.",
      "Закон царя Антиоха велит устраивать здесь праздник каждый месяц — в день его рождения и в день воцарения.",
    ],
    [
      "Bayramda yemek ve şarap herkese; yasa kimsenin geri çevrilmemesini ister.",
      "At the feast there is food and wine for all; the law says no one may be turned away.",
      "Beim Fest gibt es Speise und Wein für alle; das Gesetz sagt, niemand darf abgewiesen werden.",
      "На празднике еда и вино для всех — закон требует никого не прогонять.",
    ],
    [
      "Bu tepeye çıkmak saatler sürdü ama buradan bütün krallık görünüyor.",
      "The climb took hours, but from here you can see the whole kingdom.",
      "Der Aufstieg hat Stunden gedauert, aber von hier sieht man das ganze Königreich.",
      "Подъём занял несколько часов, зато отсюда видно всё царство.",
    ],
    [
      "Kralımız soyunu bir yandan Perslere, öbür yandan Makedonlara dayandırır.",
      "Our king traces his line to the Persians on one side and the Macedonians on the other.",
      "Unser König führt seine Abstammung auf der einen Seite auf die Perser, auf der anderen auf die Makedonen zurück.",
      "Наш царь возводит свой род с одной стороны к персам, с другой — к македонянам.",
    ],
    [
      "Tanrıların adları hem Yunanca hem Farsça: Zeus-Oromasdes gibi.",
      "The gods' names are both Greek and Persian, like Zeus-Oromasdes.",
      "Die Namen der Götter sind griechisch und persisch zugleich, wie Zeus-Oromasdes.",
      "Имена богов и греческие, и персидские сразу — как Зевс-Оромазд.",
    ],
    [
      "Başkent Samosata Fırat kıyısında; kervanlar oradan geçer.",
      "The capital, Samosata, lies on the Euphrates; the caravans pass through it.",
      "Die Hauptstadt Samosata liegt am Euphrat; dort ziehen die Karawanen durch.",
      "Столица, Самосата, стоит на Евфрате — через неё идут караваны.",
    ],
  ],
  priest: [
    [
      "Kralın yasası bana Pers giysileri giymemi emreder.",
      "The king's law orders me to wear Persian dress.",
      "Das Gesetz des Königs schreibt mir persische Kleidung vor.",
      "Закон царя велит мне носить персидскую одежду.",
    ],
    [
      "Sunaklarda tütsü ve güzel kokulu otlar yakarım.",
      "I burn incense and fragrant herbs on the altars.",
      "Ich verbrenne Weihrauch und duftende Kräuter auf den Altären.",
      "На алтарях я возжигаю ладан и благовонные травы.",
    ],
    [
      "Elimdeki çubuk demetine barsom denir; Pers rahiplerinin geleneğidir.",
      "The bundle of rods in my hand is the barsom, a custom of Persian priests.",
      "Das Rutenbündel in meiner Hand heißt Barsom, ein Brauch persischer Priester.",
      "Пучок прутьев в моей руке — барсом, обычай персидских жрецов.",
    ],
    [
      "Bayram günü tanrıların heykellerine altın taçlar takarım.",
      "On feast days I crown the statues of the gods with golden crowns.",
      "An Festtagen kröne ich die Götterstatuen mit goldenen Kränzen.",
      "В праздничные дни я возлагаю на статуи богов золотые венцы.",
    ],
    [
      "Kutsal alanın gelirleri kralın adadığı köylerden gelir.",
      "The sanctuary's income comes from villages the king dedicated to it.",
      "Die Einkünfte des Heiligtums stammen aus Dörfern, die der König ihm geweiht hat.",
      "Доходы святилища идут из селений, которые царь ему посвятил.",
    ],
    [
      "Taştaki yazıtı kimse değiştiremez; kral bunu yapanı lanetledi.",
      "No one may alter the inscription in the stone; the king cursed anyone who does.",
      "Niemand darf die Inschrift im Stein ändern; der König hat jeden verflucht, der es tut.",
      "Никто не смеет менять надпись на камне — царь проклял всякого, кто это сделает.",
    ],
  ],
  amphora: [
    [
      "Bayram için şarap taşıyorum; yasa herkese içki verilmesini ister.",
      "I'm carrying wine for the feast; the law wants everyone given a drink.",
      "Ich trage Wein für das Fest; das Gesetz will, dass jeder zu trinken bekommt.",
      "Несу вино на праздник: закон велит угостить каждого.",
    ],
    [
      "Amforaları dağa eşekle getirdik; son yokuşu sırtımda taşıyorum.",
      "We brought the amphorae up the mountain by donkey; the last slope is on my back.",
      "Wir haben die Amphoren mit dem Esel heraufgebracht; den letzten Hang trage ich sie selbst.",
      "Амфоры мы подняли на гору на осле, а последний склон несу на спине.",
    ],
    [
      "Bu şarap Fırat vadisindeki bağlardan.",
      "This wine comes from the vineyards of the Euphrates valley.",
      "Dieser Wein kommt aus den Weinbergen des Euphrattals.",
      "Это вино с виноградников долины Евфрата.",
    ],
    [
      "Yağ da getirdik; ateşler ve kandiller bütün gece yanacak.",
      "We brought oil too; the fires and lamps will burn all night.",
      "Wir haben auch Öl gebracht; Feuer und Lampen brennen die ganze Nacht.",
      "Мы принесли и масло — огни и светильники будут гореть всю ночь.",
    ],
    [
      "Rahipler şarabı dağıtır; kimse kendi payından fazlasını almaz.",
      "The priests hand out the wine; no one takes more than their share.",
      "Die Priester teilen den Wein aus; niemand nimmt mehr als seinen Anteil.",
      "Вино раздают жрецы — никто не берёт больше своей доли.",
    ],
    [
      "Amforanın ağzını reçineyle mühürledik; yolda dökülmesin.",
      "We sealed the mouth with resin so nothing spills on the way.",
      "Wir haben die Öffnung mit Harz versiegelt, damit unterwegs nichts verschüttet wird.",
      "Горло мы запечатали смолой, чтобы в пути ничего не пролилось.",
    ],
  ],
  soldier: [
    [
      "Kutsal alanı bekliyorum; kralın yasası burayı korur.",
      "I guard the sanctuary; the king's law protects this place.",
      "Ich bewache das Heiligtum; das Gesetz des Königs schützt diesen Ort.",
      "Я охраняю святилище — его защищает закон царя.",
    ],
    [
      "Kommagene küçük bir krallık; Roma ile Partlar arasında dikkatli olmalıyız.",
      "Commagene is a small kingdom; between Rome and Parthia we must be careful.",
      "Kommagene ist ein kleines Königreich; zwischen Rom und den Parthern müssen wir vorsichtig sein.",
      "Коммагена — маленькое царство: между Римом и Парфией нужно быть осторожными.",
    ],
    [
      "Mızrağım ve kalkanım bugün tören için.",
      "Today my spear and shield are for the ceremony.",
      "Heute sind Speer und Schild für die Zeremonie.",
      "Сегодня копьё и щит у меня для церемонии.",
    ],
    [
      "Gece nöbetinde dağda rüzgâr çok sert eser.",
      "On the night watch the wind on the mountain is fierce.",
      "Bei der Nachtwache weht der Wind auf dem Berg heftig.",
      "В ночном дозоре ветер на горе очень резкий.",
    ],
    [
      "Dağın eteğindeki köylerden geldim; bayramda nöbet sırası bizde.",
      "I come from the villages at the foot of the mountain; at the feast it's our turn to stand guard.",
      "Ich komme aus den Dörfern am Fuß des Berges; beim Fest sind wir mit der Wache dran.",
      "Я из деревень у подножия горы — на празднике наш черёд стоять в карауле.",
    ],
    [
      "Kralın heykelinin önünden geçerken selam veririz.",
      "We salute as we pass the king's statue.",
      "Wenn wir an der Statue des Königs vorbeigehen, grüßen wir.",
      "Проходя мимо статуи царя, мы отдаём честь.",
    ],
  ],
  musician: [
    [
      "Yasa bayramlarda müzisyenlerin çalmasını ister; ben de onlardanım.",
      "The law asks for musicians at the feasts, and I am one of them.",
      "Das Gesetz verlangt Musiker bei den Festen, und ich bin einer von ihnen.",
      "Закон требует музыкантов на праздниках — я один из них.",
    ],
    [
      "Aulosun sesi dağda yankılanır.",
      "The sound of the aulos echoes across the mountain.",
      "Der Klang des Aulos hallt über den Berg.",
      "Звук авлоса разносится эхом по горе.",
    ],
    [
      "Bayram şarkılarını babamdan öğrendim.",
      "I learned the festival songs from my father.",
      "Die Festlieder habe ich von meinem Vater gelernt.",
      "Праздничные песни я выучил у отца.",
    ],
  ],
  torch: [
    [
      "Akşam olunca sunaklarda ateşler yanar; ben meşaleyi taşırım.",
      "When evening comes the fires on the altars are lit; I carry the torch.",
      "Wenn es Abend wird, brennen die Feuer auf den Altären; ich trage die Fackel.",
      "Вечером на алтарях зажигают огни — я несу факел.",
    ],
    [
      "Meşaleyle taşlık yamaçtan iniyoruz; adımına dikkat et.",
      "We go down the stony slope by torchlight; mind your step.",
      "Wir steigen im Fackelschein den steinigen Hang hinab; pass auf, wo du hintrittst.",
      "Мы спускаемся по каменистому склону при свете факела — смотри под ноги.",
    ],
    [
      "Perslerin geleneğinde ateş kutsaldır; sönmesine izin verilmez.",
      "In the Persian tradition fire is sacred; it must not be allowed to go out.",
      "In persischer Tradition ist das Feuer heilig; man darf es nicht verlöschen lassen.",
      "В персидской традиции огонь священен — ему нельзя дать погаснуть.",
    ],
  ],
  worshipper: [
    [
      "Tanrılara tütsü ve meyve getirdim.",
      "I've brought incense and fruit for the gods.",
      "Ich habe Weihrauch und Früchte für die Götter gebracht.",
      "Я принёс богам ладан и плоды.",
    ],
    [
      "Kralın atalarının kabartmalarına bakıyorum; hepsinin adı yazılı.",
      "I'm looking at the reliefs of the king's ancestors; each one's name is written there.",
      "Ich betrachte die Reliefs der Ahnen des Königs; bei jedem steht der Name.",
      "Смотрю на рельефы предков царя — у каждого написано имя.",
    ],
    [
      "Kral burada tanrılarla el sıkışırken gösterilir.",
      "Here the king is shown shaking hands with the gods.",
      "Hier wird der König gezeigt, wie er den Göttern die Hand reicht.",
      "Здесь царь изображён пожимающим руку богам.",
    ],
    [
      "Rüzgâr çok sert ama dua etmek için buraya kadar çıktım.",
      "The wind is fierce, but I climbed all this way to pray.",
      "Der Wind ist heftig, aber ich bin den ganzen Weg heraufgestiegen, um zu beten.",
      "Ветер сильный, но я поднялся сюда, чтобы помолиться.",
    ],
  ],
  water: [
    [
      "Dağda su yok; her şeyi aşağıdan taşıyoruz.",
      "There is no water on the mountain; we carry everything up from below.",
      "Auf dem Berg gibt es kein Wasser; wir tragen alles von unten herauf.",
      "На горе нет воды — всё носим снизу.",
    ],
    [
      "Testiyi sıkı tutarım; bu yokuşta düşerse bütün emek gider.",
      "I hold the jar tight; drop it on this slope and all the work is lost.",
      "Ich halte den Krug fest; fällt er an diesem Hang, ist alle Mühe umsonst.",
      "Крепко держу кувшин: уронишь на этом склоне — и весь труд пропал.",
    ],
    [
      "Rahipler törenlerden önce ellerini bu suyla yıkar.",
      "The priests wash their hands in this water before the rites.",
      "Die Priester waschen sich vor den Riten mit diesem Wasser die Hände.",
      "Перед обрядами жрецы омывают этой водой руки.",
    ],
  ],
  basket: [
    [
      "Sepette bayram için ekmek ve kuru meyve var.",
      "There's bread and dried fruit in the basket for the feast.",
      "Im Korb sind Brot und Trockenfrüchte für das Fest.",
      "В корзине хлеб и сушёные фрукты к празднику.",
    ],
    [
      "Köyümüzün payını getirdik; herkes bir şey getirir.",
      "We've brought our village's share; everyone brings something.",
      "Wir bringen den Anteil unseres Dorfes; jeder bringt etwas mit.",
      "Мы принесли долю нашей деревни — каждый что-то приносит.",
    ],
    [
      "Yokuş uzun ama sepet hafif.",
      "The climb is long, but the basket is light.",
      "Der Aufstieg ist lang, aber der Korb ist leicht.",
      "Подъём долгий, но корзина лёгкая.",
    ],
  ],
};

const CARIAN: Pool = {
  citizen: [
    [
      "Maussollos başkenti Mylasa'dan buraya, Halikarnassos'a taşıdı.",
      "Maussollos moved the capital here to Halicarnassus from Mylasa.",
      "Maussollos hat die Hauptstadt von Mylasa hierher nach Halikarnassos verlegt.",
      "Мавсол перенёс столицу из Миласы сюда, в Галикарнас.",
    ],
    [
      "Frizleri Yunan dünyasının en ünlü heykeltıraşları oydu.",
      "The friezes were carved by the most famous sculptors of the Greek world.",
      "Die Friese haben die berühmtesten Bildhauer der griechischen Welt gemeißelt.",
      "Фризы вырезали самые знаменитые скульпторы греческого мира.",
    ],
    [
      "Artemisia kocasının ölümünden sonra yapımı sürdürdü.",
      "Artemisia carried on the building after her husband died.",
      "Artemisia führte den Bau nach dem Tod ihres Mannes weiter.",
      "Артемисия продолжила строительство после смерти мужа.",
    ],
    [
      "Evde Karca konuşuruz ama Yunanca yazar, Yunanca okuruz.",
      "At home we speak Carian, but we write and read in Greek.",
      "Zu Hause sprechen wir Karisch, aber wir schreiben und lesen Griechisch.",
      "Дома мы говорим по-карийски, а пишем и читаем по-гречески.",
    ],
    [
      "Bu anıt öyle büyük ki limana giren gemilerden bile görünür.",
      "The monument is so big you can see it from the ships entering the harbour.",
      "Das Denkmal ist so groß, dass man es sogar von den Schiffen aus sieht, die in den Hafen einlaufen.",
      "Памятник такой огромный, что его видно даже с кораблей, входящих в гавань.",
    ],
    [
      "Kral Pers'e bağlı bir satrap ama kentini kendi bildiği gibi yönetir.",
      "The ruler is a satrap of Persia, but he runs his city as he sees fit.",
      "Der Herrscher ist ein persischer Satrap, aber er regiert seine Stadt nach eigenem Gutdünken.",
      "Правитель — сатрап Персии, но управляет городом по-своему.",
    ],
  ],
  priest: [
    [
      "Ölünün anısına tütsü yakarım; duman göğe yükselir.",
      "I burn incense in the dead ruler's memory; the smoke rises to the sky.",
      "Ich verbrenne Weihrauch zum Gedenken an den toten Herrscher; der Rauch steigt zum Himmel.",
      "Я возжигаю ладан в память умершего правителя — дым поднимается к небу.",
    ],
    [
      "Anma töreninde kurban edilen hayvanların kemikleri merdivenin önüne gömülür.",
      "At the memorial rite the bones of the sacrificed animals are buried before the stair.",
      "Beim Gedenkritus werden die Knochen der Opfertiere vor der Treppe vergraben.",
      "Во время поминального обряда кости жертвенных животных закапывают перед лестницей.",
    ],
    [
      "Başımdaki çelenk tanrılara hizmet ettiğimi gösterir.",
      "The wreath on my head shows that I serve the gods.",
      "Der Kranz auf meinem Kopf zeigt, dass ich den Göttern diene.",
      "Венок на голове показывает, что я служу богам.",
    ],
    [
      "Kurbanlık hayvan alayın önünde yürür.",
      "The sacrificial animal walks at the head of the procession.",
      "Das Opfertier geht an der Spitze der Prozession.",
      "Жертвенное животное идёт впереди процессии.",
    ],
    [
      "Sunaktan önce ellerimi temiz suyla yıkarım.",
      "Before the altar I wash my hands in clean water.",
      "Vor dem Altar wasche ich mir die Hände mit reinem Wasser.",
      "Перед алтарём я омываю руки чистой водой.",
    ],
    [
      "Ölülere süt, bal ve şarap dökerek sunu yaparız.",
      "We make offerings to the dead by pouring milk, honey and wine.",
      "Wir opfern den Toten, indem wir Milch, Honig und Wein ausgießen.",
      "Мы приносим дары мёртвым, возливая молоко, мёд и вино.",
    ],
  ],
  worshipper: [
    [
      "Mezara sunu getirdim: bal, şarap ve çiçek.",
      "I've brought offerings to the tomb: honey, wine and flowers.",
      "Ich habe Gaben zum Grab gebracht: Honig, Wein und Blumen.",
      "Я принёс к гробнице дары: мёд, вино и цветы.",
    ],
    [
      "Ölülere saygı göstermek hepimizin görevi.",
      "Honouring the dead is a duty for all of us.",
      "Die Toten zu ehren ist unser aller Pflicht.",
      "Чтить мёртвых — долг каждого из нас.",
    ],
    [
      "Ellerimi göğe kaldırıp dua ediyorum.",
      "I pray with my hands raised to the sky.",
      "Ich bete mit zum Himmel erhobenen Händen.",
      "Я молюсь, воздев руки к небу.",
    ],
    [
      "Anıtın merdivenine kadar gelebiliriz; yukarısı yalnızca rahiplere.",
      "We may come as far as the steps; above them is for the priests alone.",
      "Bis zur Treppe dürfen wir kommen; darüber ist es nur den Priestern erlaubt.",
      "Нам можно подойти до ступеней — выше только жрецам.",
    ],
    [
      "Mezarın önüne bir kandil yaktım; gece boyunca yanacak.",
      "I've lit a lamp before the tomb; it will burn all night.",
      "Ich habe vor dem Grab eine Lampe entzündet; sie brennt die ganze Nacht.",
      "Я зажёг светильник перед гробницей — он будет гореть всю ночь.",
    ],
    [
      "Bu taşları oyan ustaların adları bile dilden dile dolaşıyor.",
      "Even the names of the sculptors who carved these stones are on everyone's lips.",
      "Sogar die Namen der Bildhauer, die diese Steine gemeißelt haben, sind in aller Munde.",
      "Даже имена скульпторов, что резали эти камни, у всех на устах.",
    ],
  ],
  soldier: [
    [
      "Hekatomnos hanedanının muhafızıyım.",
      "I am a guard of the Hecatomnid dynasty.",
      "Ich bin Wächter der Hekatomniden-Dynastie.",
      "Я страж династии Гекатомнидов.",
    ],
    [
      "Tören sırasında kıpırdamak yok; mızrağımı dimdik tutarım.",
      "No moving during the ceremony; I hold my spear bolt upright.",
      "Während der Zeremonie wird nicht gerührt; ich halte meinen Speer kerzengerade.",
      "Во время церемонии двигаться нельзя — держу копьё прямо.",
    ],
    [
      "Kenti güçlü surlar çevreler; Maussollos onları yeniden yaptırdı.",
      "Strong walls ring the city; Maussollos had them rebuilt.",
      "Starke Mauern umgeben die Stadt; Maussollos hat sie neu errichten lassen.",
      "Город опоясан мощными стенами — Мавсол велел их отстроить заново.",
    ],
    [
      "Limanı da biz koruruz; gizli bir liman sarayın hemen yanında.",
      "We guard the harbour too; there's a private harbour right beside the palace.",
      "Wir bewachen auch den Hafen; direkt neben dem Palast liegt ein eigener Hafen.",
      "Мы охраняем и гавань — рядом с дворцом есть отдельная гавань.",
    ],
    [
      "Bronz miğfer güneşte yanıyor ama nöbet nöbettir.",
      "The bronze helmet burns in the sun, but a watch is a watch.",
      "Der Bronzehelm glüht in der Sonne, aber Wache ist Wache.",
      "Бронзовый шлем раскалён на солнце, но дозор есть дозор.",
    ],
    [
      "Yabancı elçiler gelince onları ben karşılarım.",
      "When foreign envoys arrive, I'm the one who meets them.",
      "Wenn fremde Gesandte kommen, empfange ich sie.",
      "Когда приезжают чужеземные послы, встречаю их я.",
    ],
  ],
  torch: [
    [
      "Kralın anısına gece alayında meşale taşıyorum.",
      "I carry a torch in the night procession in the ruler's memory.",
      "Ich trage im nächtlichen Zug zum Gedenken an den Herrscher eine Fackel.",
      "Я несу факел в ночной процессии в память правителя.",
    ],
    [
      "Artemisia onun anısına bir hitabet yarışması düzenledi.",
      "Artemisia held a contest of orators in his memory.",
      "Artemisia veranstaltete zu seinem Gedenken einen Rednerwettstreit.",
      "Артемисия устроила в его память состязание ораторов.",
    ],
    [
      "Ateş yolu aydınlatıyor; basamaklar dik, dikkat et.",
      "The fire lights the way; the steps are steep, take care.",
      "Das Feuer leuchtet den Weg; die Stufen sind steil, gib acht.",
      "Огонь освещает путь — ступени крутые, осторожнее.",
    ],
    [
      "Alayda herkes sessiz yürür; yalnızca aulos çalar.",
      "Everyone in the procession walks in silence; only the aulos plays.",
      "In der Prozession gehen alle schweigend; nur der Aulos spielt.",
      "В процессии все идут молча — играет только авлос.",
    ],
    [
      "Reçineli çam meşalesi uzun yanar.",
      "A torch of resinous pine burns a long time.",
      "Eine Fackel aus harziger Kiefer brennt lange.",
      "Факел из смолистой сосны горит долго.",
    ],
    [
      "Gece anıtın beyaz mermeri ateşin ışığında altın gibi parlar.",
      "At night the monument's white marble glows like gold in the firelight.",
      "Nachts leuchtet der weiße Marmor des Denkmals im Feuerschein wie Gold.",
      "Ночью белый мрамор памятника в свете огня сияет, как золото.",
    ],
  ],
};

/* ------------------------------------------------------------------ *
 * Eras of the models being added: the Hittites, Bronze Age Troy,
 * Byzantium and medieval Armenia.
 * ------------------------------------------------------------------ */

const HITTITE: Pool = {
  citizen: [
    [
      "Kral Hattuşa'dan bütün Hatti ülkesini yönetir.",
      "The king rules the whole land of Hatti from Hattusa.",
      "Der König regiert von Hattuscha aus das ganze Land Hatti.",
      "Царь правит всей страной Хатти из Хаттусы.",
    ],
    [
      "Kâtipler kil tabletlere çivi yazısıyla yazar; arşivler tabletlerle dolu.",
      "The scribes write in cuneiform on clay tablets; the archives are full of them.",
      "Die Schreiber schreiben in Keilschrift auf Tontafeln; die Archive sind voll davon.",
      "Писцы пишут клинописью на глиняных табличках — архивы полны ими.",
    ],
    [
      "Bu ülkeye bin tanrının ülkesi derler; her kentin kendi tanrısı var.",
      "They call this the land of a thousand gods; every town has its own.",
      "Man nennt dies das Land der tausend Götter; jede Stadt hat ihren eigenen.",
      "Эту землю называют страной тысячи богов — у каждого города свой бог.",
    ],
    [
      "Fırtına Tanrısı yağmuru getirir; tarlalarımız ona bağlı.",
      "The Storm God brings the rain; our fields depend on him.",
      "Der Wettergott bringt den Regen; von ihm hängen unsere Felder ab.",
      "Бог грозы приносит дождь — от него зависят наши поля.",
    ],
    [
      "Kentin surları kalın; kapılarını aslanlar ve sfenksler korur.",
      "The city walls are thick, and lions and sphinxes guard the gates.",
      "Die Stadtmauern sind dick, und Löwen und Sphingen bewachen die Tore.",
      "Городские стены толстые, а ворота стерегут львы и сфинксы.",
    ],
    [
      "Büyük bayramlar ilkbaharda ve sonbaharda olur; kral da katılır.",
      "The great festivals are in spring and autumn, and the king takes part.",
      "Die großen Feste sind im Frühling und im Herbst, und der König nimmt teil.",
      "Большие праздники бывают весной и осенью, и в них участвует царь.",
    ],
  ],
  priest: [
    [
      "Tanrının evine girmeden önce yıkanırım; kirli giren cezalandırılır.",
      "I wash before entering the god's house; whoever enters unclean is punished.",
      "Bevor ich das Haus des Gottes betrete, wasche ich mich; wer unrein eintritt, wird bestraft.",
      "Перед тем как войти в дом бога, я омываюсь — вошедшего нечистым наказывают.",
    ],
    [
      "Tanrıya ekmek, bira ve şarap sunarız.",
      "We offer the god bread, beer and wine.",
      "Wir bringen dem Gott Brot, Bier und Wein dar.",
      "Мы приносим богу хлеб, пиво и вино.",
    ],
    [
      "Kurallar tabletlere yazılı; tapınak görevlileri onlara uymak zorunda.",
      "The rules are written on tablets, and the temple staff must follow them.",
      "Die Regeln stehen auf Tafeln, und das Tempelpersonal muss sie befolgen.",
      "Правила записаны на табличках — служители храма обязаны им следовать.",
    ],
    [
      "Kral aynı zamanda baş rahiptir; bayramlarda törenleri o yönetir.",
      "The king is also the high priest; he leads the rites at the festivals.",
      "Der König ist zugleich Oberpriester; bei den Festen leitet er die Riten.",
      "Царь — ещё и верховный жрец: на праздниках обряды ведёт он.",
    ],
    [
      "Kehanet için kuşların uçuşuna bakarız.",
      "For omens we watch how the birds fly.",
      "Für Vorzeichen beobachten wir den Flug der Vögel.",
      "Ради предзнаменований мы наблюдаем за полётом птиц.",
    ],
    [
      "Tanrının heykelini her gün yıkar, giydirir ve doyururuz.",
      "Every day we wash, dress and feed the god's statue.",
      "Jeden Tag waschen, kleiden und speisen wir das Bild des Gottes.",
      "Каждый день мы омываем, одеваем и кормим статую бога.",
    ],
  ],
  soldier: [
    [
      "Savaş arabası üç kişiliktir: sürücü, mızrakçı ve kalkancı.",
      "Our chariot carries three: a driver, a spearman and a shield-bearer.",
      "Unser Streitwagen trägt drei Mann: Lenker, Speerkämpfer und Schildträger.",
      "В нашей колеснице трое: возница, копейщик и щитоносец.",
    ],
    [
      "Kapıda nöbet tutuyorum; kimin girip çıktığını bilmeliyim.",
      "I keep watch at the gate; I must know who comes in and goes out.",
      "Ich halte am Tor Wache; ich muss wissen, wer kommt und geht.",
      "Я стою на страже у ворот — должен знать, кто входит и выходит.",
    ],
    [
      "Kralın seferleri uzun sürer; bazen bütün yaz evden uzağız.",
      "The king's campaigns are long; sometimes we're away all summer.",
      "Die Feldzüge des Königs dauern lange; manchmal sind wir den ganzen Sommer fort.",
      "Походы царя долгие — порой нас нет дома всё лето.",
    ],
    [
      "Atlara iyi bakılır; onları eğitmek uzmanların işidir.",
      "The horses are well cared for; training them is a job for experts.",
      "Die Pferde werden gut gepflegt; sie auszubilden ist Sache von Fachleuten.",
      "За лошадьми хорошо ухаживают — обучать их дело знатоков.",
    ],
    [
      "Askere yemin ettirilir; yeminini bozanı tanrılar cezalandırır.",
      "Soldiers swear an oath; the gods punish whoever breaks it.",
      "Soldaten leisten einen Eid; wer ihn bricht, den strafen die Götter.",
      "Воины приносят клятву — нарушившего её покарают боги.",
    ],
    [
      "Surların üstünden bütün ova görünür.",
      "From the top of the walls you can see the whole plain.",
      "Von der Mauerkrone aus sieht man die ganze Ebene.",
      "Со стен видна вся равнина.",
    ],
  ],
  worshipper: [
    [
      "Tanrıya bir kap bira ve ekmek getirdim.",
      "I've brought the god a jug of beer and some bread.",
      "Ich habe dem Gott einen Krug Bier und etwas Brot gebracht.",
      "Я принёс богу кувшин пива и хлеб.",
    ],
    [
      "Güneş Tanrıçası'na dua ediyorum; bereket getirsin.",
      "I'm praying to the Sun Goddess to bring a good harvest.",
      "Ich bete zur Sonnengöttin, dass sie eine gute Ernte bringt.",
      "Я молюсь Богине Солнца, чтобы послала урожай.",
    ],
    [
      "Bayram alayını izlemeye geldim; müzik ve dans olacak.",
      "I've come to watch the festival procession; there'll be music and dancing.",
      "Ich bin gekommen, um die Festprozession zu sehen; es gibt Musik und Tanz.",
      "Я пришёл посмотреть праздничную процессию — будут музыка и танцы.",
    ],
  ],
  amphora: [
    [
      "Kapta tahıl var; ambarlar kral adına doldurulur.",
      "There's grain in the vessel; the storehouses are filled in the king's name.",
      "Im Gefäß ist Getreide; die Speicher werden im Namen des Königs gefüllt.",
      "В сосуде зерно — хранилища наполняют от имени царя.",
    ],
    [
      "Büyük küpler toprağa gömülür; tahıl serin kalır.",
      "The big storage jars are sunk into the ground to keep the grain cool.",
      "Die großen Vorratsgefäße werden in den Boden eingelassen, damit das Getreide kühl bleibt.",
      "Большие пифосы вкапывают в землю, чтобы зерно оставалось прохладным.",
    ],
    [
      "Bira arpadan yapılır; bayramda herkese verilir.",
      "Beer is brewed from barley and given to everyone at the festival.",
      "Bier wird aus Gerste gebraut und beim Fest an alle ausgegeben.",
      "Пиво варят из ячменя и на празднике раздают всем.",
    ],
  ],
};

const TROY: Pool = {
  citizen: [
    [
      "Kentimiz Çanakkale Boğazı'na yakın; gemiler ve tüccarlar buradan geçer.",
      "Our city lies near the straits; ships and traders pass this way.",
      "Unsere Stadt liegt nahe der Meerenge; hier kommen Schiffe und Händler vorbei.",
      "Наш город близ пролива — здесь проходят корабли и купцы.",
    ],
    [
      "Surlarımız kalın ve eğimli; kale kenti yukarıdan korur.",
      "Our walls are thick and sloping; the citadel guards the town from above.",
      "Unsere Mauern sind dick und geböscht; die Burg schützt die Stadt von oben.",
      "Наши стены толстые и наклонные — цитадель охраняет город сверху.",
    ],
    [
      "Atlarımız ünlüdür; ovada otlarlar.",
      "Our horses are famous; they graze on the plain.",
      "Unsere Pferde sind berühmt; sie weiden in der Ebene.",
      "Наши кони славятся — они пасутся на равнине.",
    ],
    [
      "Evlerde yün eğrilir ve dokunur; ağırşaklar her yerde bulunur.",
      "In every house wool is spun and woven; you find spindle whorls everywhere.",
      "In jedem Haus wird Wolle gesponnen und gewebt; Spinnwirtel findet man überall.",
      "В каждом доме прядут и ткут шерсть — пряслица повсюду.",
    ],
    [
      "Kale kapısında pazar kurulur; uzak adalardan gelen kaplar satılır.",
      "A market gathers by the citadel gate; pots from distant islands are sold there.",
      "Am Burgtor ist Markt; dort verkauft man Gefäße von fernen Inseln.",
      "У ворот цитадели рынок — там продают сосуды с далёких островов.",
    ],
    [
      "Rüzgâr çoğu zaman kuzeyden eser; gemiler boğazda uygun rüzgârı bekler.",
      "The wind mostly blows from the north; ships wait in the straits for a fair one.",
      "Der Wind weht meist von Norden; die Schiffe warten an der Meerenge auf günstigen Wind.",
      "Ветер чаще дует с севера — корабли ждут у пролива попутного.",
    ],
  ],
  soldier: [
    [
      "Kale kapısında nöbet tutarım; kapı kuleyle korunur.",
      "I keep watch at the citadel gate, which a tower protects.",
      "Ich halte Wache am Burgtor, das ein Turm schützt.",
      "Я несу дозор у ворот цитадели, их прикрывает башня.",
    ],
    [
      "Mızrağımın ucu tunçtan; demir henüz çok nadir.",
      "My spearhead is bronze; iron is very rare.",
      "Meine Speerspitze ist aus Bronze; Eisen ist sehr selten.",
      "Наконечник моего копья бронзовый — железо большая редкость.",
    ],
    [
      "Savaş arabaları ovada hızlıdır.",
      "Chariots are fast on the plain.",
      "Streitwagen sind in der Ebene schnell.",
      "На равнине колесницы быстры.",
    ],
    [
      "Surların dibindeki hendek düşmanı yavaşlatır.",
      "The ditch at the foot of the walls slows an enemy down.",
      "Der Graben am Fuß der Mauern hält einen Feind auf.",
      "Ров у подножия стен задерживает врага.",
    ],
  ],
  priest: [
    [
      "Kapının yanındaki taş dikmeler tanrılar için; önlerine sunu bırakırız.",
      "The standing stones by the gate are for the gods; we leave offerings before them.",
      "Die Steinpfeiler am Tor sind für die Götter; wir legen Gaben davor.",
      "Каменные столбы у ворот — для богов, перед ними мы оставляем дары.",
    ],
    [
      "Kurbandan sonra şölen yapılır; herkes payını alır.",
      "After the sacrifice there is a feast, and everyone gets a share.",
      "Nach dem Opfer gibt es ein Festmahl, und jeder bekommt seinen Anteil.",
      "После жертвоприношения бывает пир — каждый получает долю.",
    ],
    [
      "Tanrılardan kenti korumalarını isteriz.",
      "We ask the gods to protect the city.",
      "Wir bitten die Götter, die Stadt zu schützen.",
      "Мы просим богов защитить город.",
    ],
  ],
};

const BYZANTINE: Pool = {
  citizen: [
    [
      "Kendimize Romalı deriz; dilimiz ise Yunanca.",
      "We call ourselves Romans, though our language is Greek.",
      "Wir nennen uns Römer, auch wenn unsere Sprache Griechisch ist.",
      "Мы зовём себя ромеями, хотя говорим по-гречески.",
    ],
    [
      "Pazar günü bütün mahalle kiliseye gider.",
      "On Sundays the whole neighbourhood goes to church.",
      "Am Sonntag geht das ganze Viertel in die Kirche.",
      "В воскресенье весь квартал идёт в церковь.",
    ],
    [
      "Altın sikke, solidus, her yerde geçer; tüccarlar ona güvenir.",
      "The gold coin, the solidus, is good everywhere; merchants trust it.",
      "Die Goldmünze, der Solidus, gilt überall; die Händler vertrauen ihr.",
      "Золотой солид принимают повсюду — купцы ему доверяют.",
    ],
    [
      "Hipodromda Maviler ve Yeşiller yarışır; hangi taraftasın?",
      "At the hippodrome the Blues and the Greens race. Which side are you on?",
      "Im Hippodrom treten die Blauen und die Grünen gegeneinander an. Zu wem hältst du?",
      "На ипподроме соревнуются венеты и прасины. Ты за кого?",
    ],
    [
      "Duvarlardaki mozaikler altın zemin üzerinde; mum ışığında parlar.",
      "The mosaics on the walls are set on gold; they shine in the candlelight.",
      "Die Mosaiken an den Wänden haben Goldgrund; im Kerzenlicht glänzen sie.",
      "Мозаики на стенах выложены на золотом фоне — они сияют в свете свечей.",
    ],
    [
      "Ustalar kubbeyi taşla değil, hafif tuğlayla örer.",
      "The builders vault the dome in light brick, not stone.",
      "Die Baumeister wölben die Kuppel aus leichten Ziegeln, nicht aus Stein.",
      "Мастера возводят купол из лёгкого кирпича, а не из камня.",
    ],
  ],
  priest: [
    [
      "Ayini Yunanca okurum; ilahileri koro söyler.",
      "I celebrate the liturgy in Greek; the choir sings the hymns.",
      "Ich feiere die Liturgie auf Griechisch; der Chor singt die Hymnen.",
      "Я служу литургию по-гречески, гимны поёт хор.",
    ],
    [
      "Tütsü buhurdanlıkta yanar; duman kubbeye yükselir.",
      "Incense burns in the censer and its smoke rises to the dome.",
      "Weihrauch brennt im Rauchfass, und sein Rauch steigt zur Kuppel auf.",
      "Ладан горит в кадиле, и дым поднимается к куполу.",
    ],
    [
      "Fakirlere ekmek dağıtmak kilisenin görevidir.",
      "Giving bread to the poor is the church's duty.",
      "Den Armen Brot zu geben ist die Pflicht der Kirche.",
      "Раздавать хлеб бедным — долг церкви.",
    ],
    [
      "Bayramlarda kilise kandillerle aydınlatılır.",
      "On feast days the church is lit with oil lamps.",
      "An Festtagen wird die Kirche mit Öllampen erleuchtet.",
      "По праздникам церковь освещают масляными лампадами.",
    ],
    [
      "Gece yarısı tahta simandron vurulur; kardeşler duaya kalkar.",
      "At midnight the wooden semantron is struck and the brothers rise to pray.",
      "Um Mitternacht wird das hölzerne Semantron geschlagen, und die Brüder stehen zum Gebet auf.",
      "В полночь бьют в деревянное било, и братия встаёт на молитву.",
    ],
    [
      "Hacılar vadiden saatlerce tırmanır; onlara ekmek ve kaynak suyu veririz.",
      "Pilgrims climb for hours from the valley; we give them bread and water from the spring.",
      "Pilger steigen stundenlang aus dem Tal herauf; wir geben ihnen Brot und Quellwasser.",
      "Паломники часами поднимаются из долины; мы даём им хлеб и воду из источника.",
    ],
    [
      "Kitapları elle kopyalarız; bir İncil bir yıl sürebilir.",
      "We copy the books by hand; a Gospel book can take a year.",
      "Wir schreiben die Bücher von Hand ab; ein Evangeliar kann ein Jahr dauern.",
      "Мы переписываем книги от руки; одно Евангелие может занять год.",
    ],
  ],
  soldier: [
    [
      "İmparatorun ordusunda hizmet ediyorum; sınırlar uzun.",
      "I serve in the emperor's army; the frontiers are long.",
      "Ich diene im Heer des Kaisers; die Grenzen sind lang.",
      "Я служу в войске императора — границы протяжённые.",
    ],
    [
      "Surlarda nöbet tutuyoruz; kapılar gece kapanır.",
      "We keep watch on the walls; the gates are shut at night.",
      "Wir halten Wache auf den Mauern; nachts werden die Tore geschlossen.",
      "Мы стоим в дозоре на стенах — на ночь ворота закрывают.",
    ],
    [
      "Kalkanıma bir haç işaretledim.",
      "I've marked a cross on my shield.",
      "Ich habe ein Kreuz auf meinen Schild gemalt.",
      "Я нанёс на щит знак креста.",
    ],
  ],
  worshipper: [
    [
      "İkonanın önünde mum yakıp dua ediyorum.",
      "I light a candle before the icon and pray.",
      "Ich zünde vor der Ikone eine Kerze an und bete.",
      "Я ставлю свечу перед иконой и молюсь.",
    ],
    [
      "Uzak bir köyden hacı olarak geldim.",
      "I've come as a pilgrim from a distant village.",
      "Ich bin als Pilger aus einem fernen Dorf gekommen.",
      "Я пришёл паломником из далёкой деревни.",
    ],
    [
      "Bayram ayininde kilise ağzına kadar doldu.",
      "For the feast-day liturgy the church is full to the doors.",
      "Zur Festliturgie ist die Kirche bis an die Türen gefüllt.",
      "На праздничной литургии церковь полна до дверей.",
    ],
  ],
};

const ARMENIAN: Pool = {
  citizen: [
    [
      "Harfleri Mesrop Maştots yarattı; o günden beri kendi dilimizde yazıyoruz.",
      "Mesrop Mashtots created our letters; since then we write in our own language.",
      "Mesrop Maschtoz schuf unsere Buchstaben; seitdem schreiben wir in unserer eigenen Sprache.",
      "Наши буквы создал Месроп Маштоц — с тех пор мы пишем на своём языке.",
    ],
    [
      "Kervanlar ipek ve baharatla buradan geçer; tüccarlar zengin.",
      "Caravans pass through with silk and spices; the merchants are rich.",
      "Karawanen ziehen mit Seide und Gewürzen hindurch; die Händler sind reich.",
      "Через нас идут караваны с шёлком и пряностями — купцы богаты.",
    ],
    [
      "Kentimizde o kadar çok kilise var ki saymak zor.",
      "There are so many churches in our city they're hard to count.",
      "In unserer Stadt gibt es so viele Kirchen, dass man sie kaum zählen kann.",
      "В нашем городе столько церквей, что и не сосчитать.",
    ],
    [
      "Taş ustaları haçkarlara, taş haçlara, ince süslemeler oyar.",
      "The stonemasons carve fine ornament on khachkars, the cross-stones.",
      "Die Steinmetze meißeln feinen Schmuck in Chatschkare, die Kreuzsteine.",
      "Каменотёсы вырезают тонкий узор на хачкарах — крестах-камнях.",
    ],
    [
      "Duvarlar tüf taşından; kırmızı ve siyah taşlar desen oluşturur.",
      "The walls are tuff; red and black stones make the patterns.",
      "Die Mauern sind aus Tuff; rote und schwarze Steine bilden die Muster.",
      "Стены из туфа — красные и чёрные камни складываются в узоры.",
    ],
    [
      "Kış uzun ve sert; yazın herkes tarlada.",
      "Winter is long and hard; in summer everyone is in the fields.",
      "Der Winter ist lang und hart; im Sommer sind alle auf den Feldern.",
      "Зима долгая и суровая, а летом все в поле.",
    ],
  ],
  priest: [
    [
      "Ayini Ermenice okurum; ilahiler kubbede yankılanır.",
      "I read the liturgy in Armenian; the hymns echo in the dome.",
      "Ich lese die Liturgie auf Armenisch; die Hymnen hallen in der Kuppel.",
      "Я служу литургию по-армянски — гимны отдаются эхом под куполом.",
    ],
    [
      "Manastırda keşişler kitapları elle kopyalar ve süsler.",
      "In the monastery the monks copy and illuminate books by hand.",
      "Im Kloster schreiben und illuminieren die Mönche Bücher von Hand.",
      "В монастыре монахи вручную переписывают и украшают книги.",
    ],
    [
      "Kilisenin duvarlarındaki kabartmalar Kutsal Kitap'tan hikâyeler anlatır.",
      "The reliefs on the church walls tell stories from the Bible.",
      "Die Reliefs an den Kirchenwänden erzählen Geschichten aus der Bibel.",
      "Рельефы на стенах церкви рассказывают библейские истории.",
    ],
    [
      "Tütsü yakar, cemaati kutsarım.",
      "I burn incense and bless the congregation.",
      "Ich verbrenne Weihrauch und segne die Gemeinde.",
      "Я возжигаю ладан и благословляю прихожан.",
    ],
  ],
  soldier: [
    [
      "Kentin çifte surlarını bekliyoruz.",
      "We guard the city's double walls.",
      "Wir bewachen die doppelten Mauern der Stadt.",
      "Мы охраняем двойные стены города.",
    ],
    [
      "Atlı birlikler dağ yollarını tutar.",
      "Mounted troops hold the mountain roads.",
      "Berittene Truppen halten die Bergstraßen.",
      "Конные отряды держат горные дороги.",
    ],
    [
      "Kale kapısında kervanları kontrol ederiz.",
      "At the gate we check the caravans.",
      "Am Tor kontrollieren wir die Karawanen.",
      "У ворот мы проверяем караваны.",
    ],
  ],
  worshipper: [
    [
      "Kiliseye bir mum ve küçük bir bağış getirdim.",
      "I've brought the church a candle and a small gift.",
      "Ich habe der Kirche eine Kerze und eine kleine Spende gebracht.",
      "Я принёс в церковь свечу и небольшое пожертвование.",
    ],
    [
      "Atalarım adına bir haçkar diktirdik.",
      "We had a khachkar set up in memory of my forebears.",
      "Wir haben zum Gedenken an meine Vorfahren einen Chatschkar aufstellen lassen.",
      "Мы поставили хачкар в память о моих предках.",
    ],
    [
      "Bayram ayininde ilahileri hep birlikte söyleriz.",
      "At the feast-day service we all sing the hymns together.",
      "Beim Festgottesdienst singen wir alle zusammen die Hymnen.",
      "На праздничной службе мы все вместе поём гимны.",
    ],
  ],
};

const VILLAGE_NEOLITHIC: Pool = {
  citizen: [
    [
      "Evlerimiz bitişik; sokak yok, damların üstünden yürürüz.",
      "Our houses are built wall to wall; there are no streets, we walk across the roofs.",
      "Unsere Häuser stehen Wand an Wand; Straßen gibt es keine, wir gehen über die Dächer.",
      "Наши дома стоят стена к стене: улиц нет, мы ходим по крышам.",
    ],
    [
      "Eve damdaki açıklıktan, bir merdivenle ineriz.",
      "We go down into the house through an opening in the roof, by a ladder.",
      "Ins Haus steigen wir durch eine Öffnung im Dach, über eine Leiter.",
      "В дом мы спускаемся по лестнице через отверстие в крыше.",
    ],
    [
      "Duvarları her yıl beyaz kille sıvarız; bazı odaların duvarları resimli.",
      "Every year we plaster the walls with white clay; in some rooms the walls are painted.",
      "Jedes Jahr verputzen wir die Wände mit weißem Lehm; in manchen Räumen sind sie bemalt.",
      "Каждый год мы обмазываем стены белой глиной, а в некоторых комнатах они расписаны.",
    ],
    [
      "Buğday, arpa ve bezelye ekeriz; koyun ve keçi de güderiz.",
      "We sow wheat, barley and peas, and we herd sheep and goats.",
      "Wir säen Weizen, Gerste und Erbsen und hüten Schafe und Ziegen.",
      "Мы сеем пшеницу, ячмень и горох, пасём овец и коз.",
    ],
    [
      "Ölülerimizi evin tabanının altına gömeriz; böylece bizimle kalırlar.",
      "We bury our dead beneath the floor of the house, so they stay with us.",
      "Unsere Toten begraben wir unter dem Boden des Hauses, so bleiben sie bei uns.",
      "Своих умерших мы хороним под полом дома — так они остаются с нами.",
    ],
    [
      "Duvardaki yaban sığırı boynuzları büyük bir avın hatırası.",
      "The wild bull's horns on the wall remember a great hunt.",
      "Die Hörner des Wildstiers an der Wand erinnern an eine große Jagd.",
      "Рога дикого быка на стене — память о большой охоте.",
    ],
    [
      "Obsidyeni volkanik dağlardan getiririz; ondan bıçak, hatta ayna yaparız.",
      "We fetch obsidian from the volcanic mountains and make blades from it, even mirrors.",
      "Obsidian holen wir aus den Vulkanbergen und machen daraus Klingen, sogar Spiegel.",
      "Обсидиан мы приносим с вулканических гор и делаем из него ножи и даже зеркала.",
    ],
  ],
  hunter: [
    [
      "Yaban sığırı avı bütün köyü bir araya getirir.",
      "Hunting the wild bull brings the whole village together.",
      "Die Jagd auf den Wildstier bringt das ganze Dorf zusammen.",
      "Охота на дикого быка собирает всю деревню.",
    ],
    [
      "Mızrağımın ucu obsidyenden; çok keskindir.",
      "My spear has an obsidian point; it is very sharp.",
      "Mein Speer hat eine Spitze aus Obsidian; sie ist sehr scharf.",
      "Наконечник моего копья обсидиановый — очень острый.",
    ],
    [
      "Bataklıkta kuş ve balık da avlarız.",
      "In the marshes we catch birds and fish too.",
      "In den Sümpfen fangen wir auch Vögel und Fische.",
      "На болотах мы ловим и птиц, и рыбу.",
    ],
    [
      "Leoparın postu cesaretin işaretidir.",
      "A leopard's skin is a sign of courage.",
      "Ein Leopardenfell ist ein Zeichen des Mutes.",
      "Шкура леопарда — знак отваги.",
    ],
  ],
  water: [
    [
      "Suyu yakındaki dereden taşırım.",
      "I carry water from the stream nearby.",
      "Ich trage Wasser vom nahen Bach.",
      "Я ношу воду из ближнего ручья.",
    ],
    [
      "Kap sepetten örülü, içi kille sıvalı.",
      "The vessel is a woven basket lined with clay.",
      "Das Gefäß ist ein geflochtener Korb, innen mit Lehm verstrichen.",
      "Сосуд — плетёная корзина, обмазанная внутри глиной.",
    ],
    [
      "Ovada su bol; bahar selleri tarlaları besler.",
      "Water is plentiful on the plain; the spring floods feed the fields.",
      "In der Ebene gibt es viel Wasser; die Frühjahrsfluten nähren die Felder.",
      "На равнине много воды — весенние разливы питают поля.",
    ],
  ],
  child: [
    [
      "Merdivenden dama tırmanmak en sevdiğim şey.",
      "Climbing the ladder up to the roof is my favourite thing.",
      "Die Leiter aufs Dach hinaufzuklettern mag ich am liebsten.",
      "Больше всего люблю залезать по лестнице на крышу.",
    ],
    [
      "Kilden küçük hayvan figürleri yapıyorum.",
      "I'm making little animals out of clay.",
      "Ich mache kleine Tiere aus Ton.",
      "Я леплю из глины маленьких зверушек.",
    ],
    [
      "Annem duvara el izlerimizi bastı.",
      "My mother pressed our handprints on the wall.",
      "Meine Mutter hat unsere Handabdrücke an die Wand gedrückt.",
      "Мама отпечатала наши ладошки на стене.",
    ],
  ],
  worshipper: [
    [
      "Evin içindeki kabartmalar ve boynuzlar bizim için kutsaldır.",
      "The reliefs and horns inside the house are sacred to us.",
      "Die Reliefs und Hörner im Haus sind uns heilig.",
      "Рельефы и рога в доме для нас священны.",
    ],
    [
      "Kilden küçük bir kadın heykelciği yaptım; ocağın yanında durur.",
      "I made a small clay figurine of a woman; it stands by the hearth.",
      "Ich habe eine kleine Frauenfigur aus Ton gemacht; sie steht beim Herd.",
      "Я вылепила маленькую глиняную женскую фигурку — она стоит у очага.",
    ],
    [
      "Atalarımız tabanın altında yatıyor; onlara saygı gösteririz.",
      "Our ancestors lie under the floor, and we honour them.",
      "Unsere Ahnen liegen unter dem Boden, und wir ehren sie.",
      "Наши предки лежат под полом, и мы их чтим.",
    ],
  ],
  mason: [
    [
      "Kerpiçleri çamur ve samandan yapar, güneşte kuruturum.",
      "I make mud bricks from clay and straw and dry them in the sun.",
      "Ich mache Lehmziegel aus Lehm und Stroh und trockne sie in der Sonne.",
      "Я делаю сырцовый кирпич из глины с соломой и сушу на солнце.",
    ],
    [
      "Duvar resimlerini toprak boyalarla yaparım: kırmızı, siyah, sarı.",
      "I paint the wall pictures with earth colours: red, black, yellow.",
      "Ich male die Wandbilder mit Erdfarben: Rot, Schwarz, Gelb.",
      "Я пишу настенные картины земляными красками: красной, чёрной, жёлтой.",
    ],
    [
      "Eski ev yıkılınca yenisini aynı yere, onun üstüne kurarız.",
      "When an old house comes down we build the new one in the same place, on top of it.",
      "Wenn ein altes Haus verfällt, bauen wir das neue an derselben Stelle, darauf.",
      "Когда старый дом рушится, новый строим на том же месте, поверх него.",
    ],
  ],
};

/* ------------------------------------------------------------------ *
 * Lookup
 * ------------------------------------------------------------------ */

/**
 * The pools by era. Keyed loosely, so lines for an era a model has yet to
 * use sit ready; the check below makes the compiler insist that every era
 * `scene-life` knows has its own.
 */
const BY_ERA = {
  roman: ROMAN,
  hellenistic: HELLENISTIC,
  neolithic: NEOLITHIC,
  "village-neolithic": VILLAGE_NEOLITHIC,
  commagene: COMMAGENE,
  carian: CARIAN,
  hittite: HITTITE,
  troy: TROY,
  trojan: TROY,
  "bronze-age": TROY,
  bronze: TROY,
  byzantine: BYZANTINE,
  armenian: ARMENIAN,
  medieval: ARMENIAN,
} satisfies Record<string, Pool>;

type MissingEras = Exclude<Era, keyof typeof BY_ERA>;
/** Fails to compile if `scene-life` gains an era with no lines here. */
const everyEraHasLines: [MissingEras] extends [never] ? true : MissingEras = true;
void everyEraHasLines;

/** The Greek and Roman world, where the shared classical lines are true. */
const CLASSICAL_ERAS: ReadonlySet<string> = new Set([
  "roman",
  "hellenistic",
  "carian",
  "commagene",
  "classical",
  "archaic",
]);

/** The lines someone of `role` in `era` can say, most specific first. */
export function linesFor(era: string, role: StoryRole): readonly Line[] {
  const pool: Pool | undefined = (BY_ERA as Record<string, Pool>)[era];
  const own = pool?.[role];
  if (own && own.length > 0) return own;
  if (CLASSICAL_ERAS.has(era)) {
    const shared = CLASSICAL[role];
    if (shared && shared.length > 0) return shared;
  }
  // A role this era has no voice for speaks as one of its ordinary people.
  return pool?.citizen ?? CLASSICAL.citizen ?? ROMAN.citizen!;
}

/** Every era with lines, for the tests. */
export const STORY_ERAS = Object.keys(BY_ERA);

/** A small stable hash of a person's place in the scene. */
function seedOf(person: Person, index: number): number {
  const [x, y, z] = person.at;
  let h = 2166136261 ^ index;
  for (const v of [x, y, z, person.rotY, person.phase]) {
    h = Math.imul(h ^ Math.round(v * 1000), 16777619);
  }
  return h >>> 0;
}

export type PersonLine = { role: StoryRole; text: Localized; variant: number; of: number };

/**
 * What person `index` of a scene says on their `tap`-th tap (from 0): a line
 * picked by their place in the scene, then the next one round on each tap.
 */
export function personLine(era: string, person: Person, index: number, tap = 0): PersonLine {
  const role = storyRole(person);
  const lines = linesFor(era, role);
  const variant = (seedOf(person, index) + tap) % lines.length;
  const [tr, en, de, ru] = lines[variant]!;
  return { role, text: { tr, en, de, ru }, variant, of: lines.length };
}

/**
 * What one of a seated crowd says: the crowd has no `Person` of its own, only
 * a seat, so the seat's number picks the line.
 */
export function spectatorLine(era: string, seat: number, tap = 0): PersonLine {
  const lines = linesFor(era, "spectator");
  const variant = (Math.imul(seat + 1, 2654435761) >>> 0) % lines.length;
  const chosen = (variant + tap) % lines.length;
  const [tr, en, de, ru] = lines[chosen]!;
  return { role: "spectator", text: { tr, en, de, ru }, variant: chosen, of: lines.length };
}

/** What the role is called, for the card's heading. */
export const ROLE_NAMES: Record<StoryRole, Localized> = {
  citizen: { tr: "Kentli", en: "Townsperson", de: "Bürger", ru: "Горожанин" },
  reader: { tr: "Okur", en: "Reader", de: "Leser", ru: "Читатель" },
  amphora: { tr: "Tüccar", en: "Merchant", de: "Händler", ru: "Торговец" },
  basket: { tr: "Satıcı", en: "Seller", de: "Verkäufer", ru: "Продавец" },
  water: { tr: "Su taşıyıcı", en: "Water carrier", de: "Wasserträger", ru: "Водонос" },
  mason: { tr: "Taş ustası", en: "Stone carver", de: "Steinmetz", ru: "Резчик по камню" },
  priest: { tr: "Rahip", en: "Priest", de: "Priester", ru: "Жрец" },
  priestess: { tr: "Rahibe", en: "Priestess", de: "Priesterin", ru: "Жрица" },
  worshipper: { tr: "Hacı", en: "Worshipper", de: "Pilger", ru: "Молящийся" },
  musician: { tr: "Müzisyen", en: "Musician", de: "Musiker", ru: "Музыкант" },
  actor: { tr: "Oyuncu", en: "Actor", de: "Schauspieler", ru: "Актёр" },
  athlete: { tr: "Atlet", en: "Athlete", de: "Athlet", ru: "Атлет" },
  soldier: { tr: "Asker", en: "Soldier", de: "Soldat", ru: "Воин" },
  hunter: { tr: "Avcı", en: "Hunter", de: "Jäger", ru: "Охотник" },
  torch: { tr: "Meşaleci", en: "Torchbearer", de: "Fackelträger", ru: "Факельщик" },
  child: { tr: "Çocuk", en: "Child", de: "Kind", ru: "Ребёнок" },
  official: { tr: "Yönetici", en: "Magistrate", de: "Amtsträger", ru: "Магистрат" },
  spectator: { tr: "Seyirci", en: "Spectator", de: "Zuschauer", ru: "Зритель" },
};

/** The BCP 47 tag the device voice is asked for. */
export const SPEECH_LANG: Record<Lang, string> = {
  tr: "tr-TR",
  en: "en-GB",
  de: "de-DE",
  ru: "ru-RU",
};
