import type { Lang, Localized } from "@/lib/i18n";
import type { Action, Era, Person } from "@/lib/scene-life";

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
  | "spectator"
  | "potter"
  | "weaver"
  | "scribe"
  | "merchant"
  | "baker"
  | "butcher"
  | "cook"
  | "carpenter"
  | "painter"
  | "servant"
  | "porter"
  | "farmer"
  | "herder"
  | "elder"
  | "beggar"
  | "performer"
  | "teacher";

/** tr, en, de, ru. */
type Line = readonly [string, string, string, string];
type Pool = Partial<Record<StoryRole, readonly Line[]>>;

const WHITE = 0xf0ece2;

/**
 * The voice each thing a person can be doing gives them, or `null` where
 * the doing says nothing of who they are and their dress and gear decide.
 * A `Record` over every action, so a new action in `scene-life` does not
 * compile until somebody has decided whose lines it speaks.
 */
const ACTION_VOICE: Record<Action, StoryRole | null> = {
  stand: null,
  walk: null,
  talk: null,
  sit: null,
  read: null,
  pray: null,
  perform: null,
  tend: null,
  kneel: null,
  run: null,
  play: null,
  ride: null,
  cheer: null,
  drive: null,
  pot: "potter",
  weave: "weaver",
  spin: "weaver",
  write: "scribe",
  count: "merchant",
  weigh: "merchant",
  haggle: "merchant",
  call: "merchant",
  knead: "baker",
  grind: "baker",
  chop: "butcher",
  stir: "cook",
  carve: "mason",
  saw: "carpenter",
  paint: "painter",
  sweep: "servant",
  hoe: "farmer",
  plough: "farmer",
  beg: "beggar",
  pour: "priest",
  dance: "performer",
  juggle: "performer",
  stretch: "athlete",
  wrestle: "athlete",
  throw: "athlete",
  march: "soldier",
  toss: "child",
  crouch: null,
  lean: null,
  point: null,
  gaze: null,
  chat: null,
  lecture: "teacher",
  strike: "priest",
};

/** The part someone plays, read off how the scene dressed and equipped them. */
export function storyRole(person: Person): StoryRole {
  const { look, action, carry, carryLeft } = person;
  if (person.height < 1.35) return "child";
  if (look.headwear === "mask") return "actor";
  const voice = ACTION_VOICE[action];
  if (voice) return voice;
  if (carry === "lyre" || carry === "aulos" || carryLeft === "drum") return "musician";
  if (carry === "pole" || carry === "sack" || carry === "reeds") return "porter";
  if (carry === "crook") return "herder";
  if (look.old && (action === "sit" || action === "chat")) return "elder";
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
  potter: [
    [
      "Çarkı ayağımla döndürürüm; ellerim çamuru yukarı çeker.",
      "I turn the wheel with my foot; my hands draw the clay upward.",
      "Ich drehe die Scheibe mit dem Fuß; meine Hände ziehen den Ton nach oben.",
      "Я кручу круг ногой, а руки вытягивают глину вверх.",
    ],
    [
      "Kaplar önce gölgede kurur, sonra fırında pişer.",
      "The pots dry in the shade first, then they are fired in the kiln.",
      "Die Gefäße trocknen erst im Schatten, dann werden sie im Ofen gebrannt.",
      "Сосуды сначала сохнут в тени, потом их обжигают в печи.",
    ],
    [
      "Parlak kırmızı astar çok ince kilden yapılır; pişince ışıldar.",
      "The glossy red slip is made of very fine clay; once fired, it shines.",
      "Der glänzend rote Überzug ist aus sehr feinem Ton; gebrannt leuchtet er.",
      "Блестящий красный ангоб делают из тончайшей глины; после обжига он сияет.",
    ],
    [
      "Atölyemin adını kabın dibine mühürle basarım.",
      "I stamp my workshop's name on the base of the pot.",
      "Ich stemple den Namen meiner Werkstatt auf den Gefäßboden.",
      "Я ставлю клеймо своей мастерской на дно сосуда.",
    ],
    [
      "Herkes çanak çömlek kullanır; kırılan hemen yenisiyle değişir.",
      "Everyone uses pottery, and what breaks is replaced at once.",
      "Jeder braucht Töpferware, und was zerbricht, wird gleich ersetzt.",
      "Глиняной посудой пользуются все, а разбитую сразу заменяют.",
    ],
    [
      "Kili dere kenarından getirir, günlerce suda dinlendiririm.",
      "I fetch the clay from the riverbank and leave it to rest in water for days.",
      "Den Ton hole ich vom Flussufer und lasse ihn tagelang im Wasser ruhen.",
      "Глину я беру у реки и много дней вымачиваю в воде.",
    ],
  ],
  weaver: [
    [
      "Tezgâhın ipleri pişmiş toprak ağırlıklarla gerilir; bu ağırlıklar her evde bulunur.",
      "The loom's threads are held taut by clay weights; such weights turn up in every house.",
      "Die Kettfäden werden mit Tongewichten gespannt; solche Gewichte findet man in jedem Haus.",
      "Нити основы натягивают глиняными грузилами; такие грузила находят в каждом доме.",
    ],
    [
      "Önce yünü örekeden eğiririm, sonra dokurum.",
      "First I spin the wool from the distaff, then I weave it.",
      "Erst spinne ich die Wolle vom Rocken, dann webe ich sie.",
      "Сначала я пряду шерсть с прялки, потом тку.",
    ],
    [
      "Bir pelerin dokumak haftalar sürer.",
      "Weaving a single cloak takes weeks.",
      "Einen einzigen Mantel zu weben dauert Wochen.",
      "Чтобы соткать один плащ, нужны недели.",
    ],
    [
      "Boyalar bitkilerden gelir: kökboya kırmızı, muhabbet çiçeği sarı verir.",
      "The dyes come from plants: madder gives red, weld gives yellow.",
      "Die Farben kommen von Pflanzen: Krapp gibt Rot, Wau Gelb.",
      "Краски дают растения: марена — красную, резеда — жёлтую.",
    ],
    [
      "Evin kumaşını kadınlar dokur; artanı pazarda satılır.",
      "The women of the house weave its cloth; what is left over is sold at market.",
      "Die Frauen des Hauses weben seinen Stoff; was übrig ist, wird auf dem Markt verkauft.",
      "Ткань для дома ткут женщины, а лишнее продают на рынке.",
    ],
    [
      "İğ dönerken ipliği parmaklarımla inceltirim.",
      "While the spindle turns, I draw the thread thin with my fingers.",
      "Während die Spindel sich dreht, ziehe ich den Faden mit den Fingern dünn.",
      "Пока веретено крутится, я истончаю нить пальцами.",
    ],
  ],
  scribe: [
    [
      "Balmumu tablete kalemin sivri ucuyla yazar, düz ucuyla silerim.",
      "I write on the wax with the pointed end of the stylus and smooth it out with the flat end.",
      "Ich schreibe mit der Spitze des Griffels ins Wachs und glätte es mit dem flachen Ende.",
      "Я пишу на воске острым концом стиля и стираю плоским.",
    ],
    [
      "Yazı bilmeyenler için mektup yazarım; ücreti satır başına.",
      "I write letters for those who cannot; I charge by the line.",
      "Ich schreibe Briefe für die, die es nicht können; bezahlt wird nach Zeilen.",
      "Пишу письма для неграмотных; плата — за строку.",
    ],
    [
      "Önemli olanı sonra papirüse ya da parşömene temize çekerim.",
      "Whatever matters I copy out fair later, on papyrus or parchment.",
      "Was wichtig ist, schreibe ich später ins Reine, auf Papyrus oder Pergament.",
      "Важное я потом переписываю набело на папирус или пергамент.",
    ],
    [
      "Sözleşme, makbuz, vasiyet: hepsi yazılı olmalı.",
      "Contracts, receipts, wills: all of it has to be written down.",
      "Verträge, Quittungen, Testamente: alles muss schriftlich sein.",
      "Договоры, расписки, завещания — всё надо записать.",
    ],
    [
      "Harfleri okulda tabletlere kazıyarak öğrendim; hâlâ aynı tür kalemi kullanırım.",
      "I learned my letters scratching them into tablets at school; I still use the same kind of stylus.",
      "Die Buchstaben lernte ich in der Schule auf Wachstafeln; ich benutze noch immer solch einen Griffel.",
      "Буквы я учил в школе на восковых табличках и до сих пор пишу таким же стилем.",
    ],
    [
      "Hesap tutmak kolay değil: sayılar da harflerle yazılır.",
      "Keeping accounts is not easy: numbers are written with letters too.",
      "Rechnungen führen ist nicht leicht: Auch Zahlen schreibt man mit Buchstaben.",
      "Вести счёт непросто: числа тоже пишутся буквами.",
    ],
  ],
  merchant: [
    [
      "Teraziyle tartarım; pazar denetçisi ağırlıklarımı sık sık kontrol eder.",
      "I weigh on the balance; the market inspector checks my weights often.",
      "Ich wiege auf der Waage; der Marktaufseher prüft meine Gewichte oft.",
      "Я взвешиваю на весах, а рыночный надзиратель часто проверяет мои гири.",
    ],
    [
      "Bu fiyata mı? Bu baharat çok uzaklardan geldi!",
      "At that price? This spice came from very far away!",
      "Zu dem Preis? Dieses Gewürz kam von sehr weit her!",
      "За такую цену? Эта пряность прибыла издалека!",
    ],
    [
      "Yabancı sikkeleri değiştiririm; her kentin kendi parası var.",
      "I change foreign coins; every city has its own money.",
      "Ich wechsle fremde Münzen; jede Stadt hat ihr eigenes Geld.",
      "Я меняю чужие монеты: у каждого города свои деньги.",
    ],
    [
      "Sikkeyi tartar, sesine kulak veririm; sahtesini hemen anlarım.",
      "I weigh a coin and listen to its ring; I know a false one at once.",
      "Ich wiege die Münze und höre auf ihren Klang; eine falsche erkenne ich sofort.",
      "Я взвешиваю монету и слушаю её звон — фальшивку узнаю сразу.",
    ],
    [
      "Pazarlık etmeden alan iki kat öder.",
      "Whoever buys without haggling pays twice.",
      "Wer ohne Feilschen kauft, zahlt doppelt.",
      "Кто покупает не торгуясь, платит вдвое.",
    ],
    [
      "Gelin, bakın! Taze, ucuz, en iyisi!",
      "Come and look! Fresh, cheap, the best there is!",
      "Kommt und schaut! Frisch, billig, das Beste!",
      "Подходите, смотрите! Свежее, дёшево, лучшее!",
    ],
  ],
  baker: [
    [
      "Hamuru gün doğmadan yoğururum; ekmek sıcakken satılır.",
      "I knead the dough before dawn; bread sells while it is warm.",
      "Ich knete den Teig vor Tagesanbruch; Brot verkauft sich, solange es warm ist.",
      "Я замешиваю тесто до рассвета: хлеб продают горячим.",
    ],
    [
      "Kubbeli fırını odunla ısıtır, külü süpürür, ekmekleri içine sürerim.",
      "I heat the domed oven with wood, sweep out the ashes and slide the loaves in.",
      "Ich heize den Kuppelofen mit Holz, kehre die Asche aus und schiebe die Brote hinein.",
      "Я топлю купольную печь дровами, выметаю золу и сажаю хлебы.",
    ],
    [
      "Unu taş değirmenlerde öğütürüz; ekmekte biraz kum olması bundandır.",
      "The flour is ground between millstones; that is why bread has a little grit in it.",
      "Das Mehl wird zwischen Mühlsteinen gemahlen; darum ist etwas Sand im Brot.",
      "Муку мелют жерновами — оттого в хлебе бывает песок.",
    ],
    [
      "Somunları pişirmeden önce dilimlere çizerim, kolay bölünsün diye.",
      "I score the loaves into wedges before baking, so they break apart easily.",
      "Ich ritze die Laibe vor dem Backen in Stücke, damit man sie leicht bricht.",
      "Перед выпечкой я надрезаю караваи на доли, чтобы их легко было ломать.",
    ],
    [
      "Buğday ekmeği varlıklıların, arpa ekmeği yoksulların.",
      "Wheat bread is for those with money, barley bread for the poor.",
      "Weizenbrot ist für die Wohlhabenden, Gerstenbrot für die Armen.",
      "Пшеничный хлеб — для богатых, ячменный — для бедных.",
    ],
    [
      "Komşular kendi hamurlarını getirir, ben fırınımda pişiririm.",
      "The neighbours bring their own dough and I bake it in my oven.",
      "Die Nachbarn bringen ihren eigenen Teig, und ich backe ihn in meinem Ofen.",
      "Соседи приносят своё тесто, а я пеку его в своей печи.",
    ],
  ],
  butcher: [
    [
      "Satırı bir kez indiririm; kemik temiz ayrılmalı.",
      "I bring the cleaver down once; the bone must part cleanly.",
      "Ich lasse das Hackmesser einmal niederfahren; der Knochen muss sauber brechen.",
      "Я опускаю тесак один раз — кость должна разойтись чисто.",
    ],
    [
      "Kurban edilen hayvanın etinin çoğu satılır ya da şölende yenir.",
      "Most of the meat of a sacrificed animal is sold, or eaten at the feast.",
      "Das meiste Fleisch eines Opfertiers wird verkauft oder beim Festmahl gegessen.",
      "Большую часть мяса жертвенного животного продают или съедают на пиру.",
    ],
    [
      "En çok keçi ve koyun eti satılır; sığır eti pahalıdır.",
      "Goat and mutton sell best; beef is dear.",
      "Ziegen- und Hammelfleisch gehen am besten; Rindfleisch ist teuer.",
      "Лучше всего берут козлятину и баранину; говядина дорогая.",
    ],
    [
      "Et çabuk bozulur; tuzlar ya da tütsülerim.",
      "Meat spoils fast, so I salt it or smoke it.",
      "Fleisch verdirbt schnell, also salze oder räuchere ich es.",
      "Мясо быстро портится, поэтому я его солю или копчу.",
    ],
    [
      "Çengellerdeki parçalar gün bitmeden satılmalı.",
      "What hangs on the hooks has to be sold before the day is out.",
      "Was an den Haken hängt, muss vor Abend verkauft sein.",
      "Всё, что висит на крюках, надо продать до вечера.",
    ],
    [
      "Önlüğüm kandan kararmış; bu iş temiz değildir.",
      "My apron is dark with blood; this is not clean work.",
      "Meine Schürze ist dunkel vom Blut; das ist keine saubere Arbeit.",
      "Мой фартук потемнел от крови — работа нечистая.",
    ],
  ],
  cook: [
    [
      "Kazanda mercimekle et kaynıyor; bir kepçesi bir bakır sikke.",
      "Lentils and meat are boiling in the pot; a ladleful costs a copper coin.",
      "Im Kessel kochen Linsen und Fleisch; eine Kelle kostet eine Kupfermünze.",
      "В котле варятся чечевица и мясо; черпак стоит медную монету.",
    ],
    [
      "Evlerin çoğunda mutfak yok; insanlar sıcak yemeği sokaktan alır.",
      "Most homes have no kitchen; people buy their hot food in the street.",
      "Die meisten Wohnungen haben keine Küche; warmes Essen kauft man auf der Straße.",
      "В большинстве жилищ нет кухни; горячую еду покупают на улице.",
    ],
    [
      "Tuz, kekik, sirke: yemeğin tadı bunlarla çıkar.",
      "Salt, thyme and vinegar: that is what gives food its taste.",
      "Salz, Thymian und Essig: Das gibt dem Essen den Geschmack.",
      "Соль, чабрец и уксус — вот что даёт еде вкус.",
    ],
    [
      "Ateşi canlı tutmak, karıştırmak kadar önemlidir.",
      "Keeping the fire alive matters as much as stirring.",
      "Das Feuer am Leben zu halten ist so wichtig wie das Rühren.",
      "Поддерживать огонь так же важно, как помешивать.",
    ],
    [
      "Bayram yemeği için sabahtan beri pişiriyorum.",
      "I have been cooking since morning for the festival meal.",
      "Ich koche seit dem Morgen für das Festmahl.",
      "С утра готовлю праздничную трапезу.",
    ],
    [
      "Arpa lapası karın doyurmanın en ucuz yoludur.",
      "Barley porridge is the cheapest way to fill a belly.",
      "Gerstenbrei ist der billigste Weg, satt zu werden.",
      "Ячменная каша — самый дешёвый способ наесться.",
    ],
  ],
  carpenter: [
    [
      "Testere demirden; dişlerini her gün eğeyle bilerim.",
      "The saw is iron; I sharpen its teeth with a file every day.",
      "Die Säge ist aus Eisen; ich schärfe ihre Zähne jeden Tag mit der Feile.",
      "Пила железная; каждый день я точу её зубья напильником.",
    ],
    [
      "Tavan kirişleri, kapılar, sandıklar: hepsi benim işim.",
      "Roof beams, doors, chests: all of that is my work.",
      "Dachbalken, Türen, Truhen: das alles ist meine Arbeit.",
      "Балки, двери, сундуки — всё это моя работа.",
    ],
    [
      "Çivi pahalı; tahtaları zıvanayla birleştiririm.",
      "Nails are dear, so I join the timbers with mortise and tenon.",
      "Nägel sind teuer, also verbinde ich die Hölzer mit Zapfen.",
      "Гвозди дороги, поэтому я соединяю доски шипом и пазом.",
    ],
    [
      "En iyi kereste dağlardan gelir: sedir ve çam.",
      "The best timber comes down from the mountains: cedar and pine.",
      "Das beste Holz kommt aus den Bergen: Zeder und Kiefer.",
      "Лучший лес везут с гор: кедр и сосну.",
    ],
    [
      "Tahtayı sehpaya bastırır, çizgiye göre keserim.",
      "I hold the plank down on the trestle and cut to the line.",
      "Ich drücke das Brett auf den Bock und säge an der Linie entlang.",
      "Я прижимаю доску к козлам и пилю по разметке.",
    ],
    [
      "İskeleyi de biz kurarız; ustalar onsuz yükselemez.",
      "We put up the scaffolding too; the masons cannot climb without it.",
      "Auch die Gerüste bauen wir; ohne sie kommen die Maurer nicht hinauf.",
      "Леса тоже ставим мы — без них каменщикам не подняться.",
    ],
  ],
  painter: [
    [
      "Fresk, sıva yaşken boyanır; acele etmem gerek.",
      "A fresco is painted while the plaster is wet, so I have to be quick.",
      "Ein Fresko malt man, solange der Putz feucht ist; ich muss mich beeilen.",
      "Фреску пишут по сырой штукатурке, так что надо спешить.",
    ],
    [
      "Kırmızı aşı toprağından, mavi ise pahalı Mısır mavisinden.",
      "The red comes from ochre, the blue from costly Egyptian blue.",
      "Das Rot kommt aus Ocker, das Blau aus teurem Ägyptisch Blau.",
      "Красный — из охры, синий — из дорогой египетской лазури.",
    ],
    [
      "Ev sahibi duvarlarında bahçeler, kuşlar ve tiyatro maskeleri istiyor.",
      "The owner wants gardens, birds and theatre masks on his walls.",
      "Der Hausherr will Gärten, Vögel und Theatermasken an seinen Wänden.",
      "Хозяин хочет на стенах сады, птиц и театральные маски.",
    ],
    [
      "Duvarlar birkaç kuşakta bir yeniden boyanır; moda değişir.",
      "Walls are repainted every few generations; fashions change.",
      "Die Wände werden alle paar Generationen neu bemalt; die Mode ändert sich.",
      "Стены перекрашивают каждые несколько поколений: мода меняется.",
    ],
    [
      "Fırçalarım hayvan kılından; ince işler için en yumuşağı.",
      "My brushes are made of animal hair, the softest for fine work.",
      "Meine Pinsel sind aus Tierhaar, die weichsten für feine Arbeit.",
      "Мои кисти из звериного волоса, самые мягкие — для тонкой работы.",
    ],
    [
      "Önce hatları kazırım, sonra renkleri sürerim.",
      "First I scratch in the outlines, then I lay on the colours.",
      "Zuerst ritze ich die Umrisse ein, dann trage ich die Farben auf.",
      "Сначала я процарапываю контуры, потом кладу краски.",
    ],
  ],
  servant: [
    [
      "Avluyu her sabah süpürürüm; toz hiç bitmez.",
      "I sweep the court every morning; the dust never ends.",
      "Ich fege jeden Morgen den Hof; der Staub nimmt kein Ende.",
      "Каждое утро я мету двор — пыли нет конца.",
    ],
    [
      "Evin suyunu çeşmeden ben taşırım.",
      "I carry the household's water from the fountain.",
      "Ich trage das Wasser des Hauses vom Brunnen.",
      "Воду для дома ношу из фонтана я.",
    ],
    [
      "Efendimin konukları gelecek; her yer temiz olmalı.",
      "My master's guests are coming; everything has to be clean.",
      "Die Gäste meines Herrn kommen; alles muss sauber sein.",
      "К хозяину придут гости — всё должно быть чисто.",
    ],
    [
      "Süpürgem çalı dallarından bağlanmış.",
      "My broom is a bundle of twigs tied together.",
      "Mein Besen ist ein Bündel zusammengebundener Zweige.",
      "Моя метла — пучок связанных прутьев.",
    ],
    [
      "Azat edilmeyi umuyorum; biraz biriktirdim.",
      "I hope to be freed one day; I have put a little money by.",
      "Ich hoffe, eines Tages freigelassen zu werden; ich habe etwas gespart.",
      "Надеюсь когда-нибудь получить свободу — я кое-что скопил.",
    ],
    [
      "Akşam kandilleri yakmak ve yağlarını doldurmak da bana düşer.",
      "Lighting the lamps at dusk and filling their oil is my job too.",
      "Die Lampen am Abend anzuzünden und Öl nachzufüllen ist auch meine Aufgabe.",
      "Зажигать вечером светильники и подливать масло — тоже моя забота.",
    ],
  ],
  porter: [
    [
      "Amforayı sırığa asar, iki kişi omuzlarımızda taşırız.",
      "We hang the amphora from the pole and carry it on our two shoulders.",
      "Wir hängen die Amphore an die Stange und tragen sie zu zweit auf den Schultern.",
      "Мы подвешиваем амфору на шест и несём её вдвоём на плечах.",
    ],
    [
      "Dolu bir amfora, bir adamın uzağa taşıyabileceğinden ağırdır.",
      "A full amphora is more than one man can carry far.",
      "Eine volle Amphore ist mehr, als ein Mann weit tragen kann.",
      "Полная амфора — больше, чем один человек унесёт далеко.",
    ],
    [
      "Gemiden ambara, ambardan pazara: bütün gün yürürüz.",
      "From ship to store, from store to market: we walk all day.",
      "Vom Schiff zum Speicher, vom Speicher zum Markt: Wir laufen den ganzen Tag.",
      "С корабля на склад, со склада на рынок — весь день на ногах.",
    ],
    [
      "Ücretimizi yük başına alırız.",
      "We are paid by the load.",
      "Wir werden nach Ladungen bezahlt.",
      "Нам платят за каждую ношу.",
    ],
    [
      "Adımımızı uydurmazsak yük sallanır.",
      "If we do not keep in step, the load swings.",
      "Wenn wir nicht im Gleichschritt gehen, schaukelt die Last.",
      "Если не идти в ногу, груз раскачивается.",
    ],
    [
      "Bir çuval buğday: bu kentin ekmeği uzak tarlalardan gelir.",
      "A sack of wheat: this town's bread comes from fields far away.",
      "Ein Sack Weizen: Das Brot dieser Stadt kommt von fernen Feldern.",
      "Мешок пшеницы: хлеб этого города растёт на далёких полях.",
    ],
  ],
  farmer: [
    [
      "Karasaban toprağı çizer, devirmez; o yüzden iki kez, çapraz süreriz.",
      "The ard scratches the soil rather than turning it, so we plough twice, crosswise.",
      "Der Hakenpflug ritzt den Boden, statt ihn zu wenden; darum pflügen wir zweimal, über Kreuz.",
      "Рало царапает землю, а не переворачивает, поэтому пашем дважды, крест-накрест.",
    ],
    [
      "Öküzlerim boyunduruğa alışkın; sesimi tanırlar.",
      "My oxen are used to the yoke; they know my voice.",
      "Meine Ochsen sind ans Joch gewöhnt; sie kennen meine Stimme.",
      "Мои волы привыкли к ярму и знают мой голос.",
    ],
    [
      "Ekim sonbaharda, yağmurlar başlayınca yapılır.",
      "We sow in autumn, when the rains begin.",
      "Gesät wird im Herbst, wenn der Regen einsetzt.",
      "Сеем осенью, когда начинаются дожди.",
    ],
    [
      "Bir yıl buğday, bir yıl nadas: toprak dinlenmeli.",
      "A year of wheat, a year of fallow: the land has to rest.",
      "Ein Jahr Weizen, ein Jahr Brache: Der Boden muss ruhen.",
      "Год пшеница, год пар — земле нужен отдых.",
    ],
    [
      "Çapayla yabani otları temizlerim, yoksa ürün cılız kalır.",
      "I clear the weeds with the hoe, or the crop will be thin.",
      "Ich jäte mit der Hacke, sonst wird die Ernte mager.",
      "Я выпалываю сорняки мотыгой, иначе урожай будет скудным.",
    ],
    [
      "Hasadın bir kısmı vergi olarak gider.",
      "Part of the harvest goes in tax.",
      "Ein Teil der Ernte geht als Steuer weg.",
      "Часть урожая уходит в налог.",
    ],
  ],
  herder: [
    [
      "Değneğimin kancasıyla kaçan kuzuyu bacağından yakalarım.",
      "With the hook of my crook I catch a straying lamb by the leg.",
      "Mit dem Haken meines Stabs fange ich ein ausreißendes Lamm am Bein.",
      "Крюком посоха я ловлю отбившегося ягнёнка за ногу.",
    ],
    [
      "Yazın sürüyü yaylaya çıkarırız.",
      "In summer we take the flock up to the high pastures.",
      "Im Sommer treiben wir die Herde auf die Hochweiden.",
      "Летом мы гоним стадо на горные пастбища.",
    ],
    [
      "Köpeklerim kurdu uzak tutar.",
      "My dogs keep the wolves away.",
      "Meine Hunde halten die Wölfe fern.",
      "Мои собаки отгоняют волков.",
    ],
    [
      "Sütten peynir yapılır; yün de kırkımda satılır.",
      "The milk becomes cheese, and the wool is sold at shearing.",
      "Aus der Milch wird Käse, die Wolle verkauft man bei der Schur.",
      "Из молока делают сыр, а шерсть продают после стрижки.",
    ],
    [
      "Her hayvanımı tanırım; akşam yine sayarım.",
      "I know every one of my animals, and I count them again at dusk.",
      "Ich kenne jedes meiner Tiere und zähle sie abends noch einmal.",
      "Я знаю каждое животное и вечером снова их пересчитываю.",
    ],
    [
      "Bugün bir kuzum kurbanlık olarak tapınağa satıldı.",
      "Today one of my lambs was sold to the temple for a sacrifice.",
      "Heute wurde eines meiner Lämmer als Opfer an den Tempel verkauft.",
      "Сегодня одного из моих ягнят продали храму для жертвы.",
    ],
  ],
  elder: [
    [
      "Ben gençken bu meydan daha küçüktü.",
      "When I was young this square was smaller.",
      "Als ich jung war, war dieser Platz kleiner.",
      "Когда я был молод, эта площадь была меньше.",
    ],
    [
      "Torunlarım okula gidiyor; ben gidemedim.",
      "My grandchildren go to school; I never could.",
      "Meine Enkel gehen zur Schule; ich konnte das nie.",
      "Мои внуки ходят в школу, а мне не довелось.",
    ],
    [
      "Her gün bu bankta oturur, kentin haberlerini konuşuruz.",
      "Every day we sit on this bench and talk over the town's news.",
      "Jeden Tag sitzen wir auf dieser Bank und besprechen die Neuigkeiten der Stadt.",
      "Каждый день мы сидим на этой скамье и обсуждаем городские новости.",
    ],
    [
      "Yaşlılara saygı gösterilir; sözümüz dinlenir.",
      "The old are respected here; people listen to what we say.",
      "Die Alten werden geachtet; man hört auf uns.",
      "Стариков здесь уважают и слушают.",
    ],
    [
      "Dizlerim ağrıyor ama hâlâ her sabah yürürüm.",
      "My knees ache, but I still walk every morning.",
      "Meine Knie schmerzen, aber ich gehe noch jeden Morgen spazieren.",
      "Колени болят, но я всё ещё гуляю каждое утро.",
    ],
    [
      "Kaç bayram, kaç kıtlık gördüm, sayamam.",
      "I have seen more festivals and famines than I can count.",
      "Ich habe mehr Feste und Hungersnöte gesehen, als ich zählen kann.",
      "Я видел больше праздников и голодных лет, чем могу сосчитать.",
    ],
  ],
  beggar: [
    [
      "Bir sikke, bir lokma ekmek... Tanrılar cömertleri sever.",
      "A coin, a mouthful of bread... the gods love the generous.",
      "Eine Münze, ein Bissen Brot... die Götter lieben die Freigebigen.",
      "Монетку, кусок хлеба... боги любят щедрых.",
    ],
    [
      "Savaşta yaralandım; artık çalışamıyorum.",
      "I was wounded in war; I can no longer work.",
      "Ich wurde im Krieg verwundet; arbeiten kann ich nicht mehr.",
      "Меня ранили на войне, работать я больше не могу.",
    ],
    [
      "En çok bayram günlerinde, tapınak kapısında verilir.",
      "People give most on feast days, at the temple gate.",
      "Am meisten gibt man an Festtagen, am Tempeltor.",
      "Больше всего подают в праздники, у ворот храма.",
    ],
    [
      "Kent bazen yoksullara tahıl dağıtır, ama herkese yetmez.",
      "Sometimes the city hands out grain to the poor, but there is never enough for all.",
      "Manchmal verteilt die Stadt Getreide an die Armen, doch es reicht nie für alle.",
      "Иногда город раздаёт бедным зерно, но всем не хватает.",
    ],
    [
      "Geceyi revaklarda geçiririm; çatısı yağmuru tutar.",
      "I spend the night in the colonnades; their roof keeps off the rain.",
      "Die Nacht verbringe ich in den Säulenhallen; ihr Dach hält den Regen ab.",
      "Ночую под портиками — их крыша укрывает от дождя.",
    ],
    [
      "Bana değil, kâseye bak.",
      "Don't look at me, look at the bowl.",
      "Schau nicht mich an, schau in die Schale.",
      "Не на меня смотри — на чашу.",
    ],
  ],
  performer: [
    [
      "Üç topu havada tutmak kolay; dördüncüsü zor.",
      "Three balls in the air are easy; the fourth is hard.",
      "Drei Bälle in der Luft sind leicht; der vierte ist schwer.",
      "Три мяча в воздухе — легко; четвёртый — трудно.",
    ],
    [
      "Bayramlarda meydanda oynarız, kalabalık sikke atar.",
      "On feast days we perform in the square and the crowd throws coins.",
      "An Festtagen treten wir auf dem Platz auf, und die Leute werfen Münzen.",
      "По праздникам мы выступаем на площади, и толпа бросает монеты.",
    ],
    [
      "Def ve aulos çalarken dans ederiz.",
      "We dance to the frame drum and the pipes.",
      "Wir tanzen zur Rahmentrommel und zum Aulos.",
      "Мы танцуем под бубен и авлос.",
    ],
    [
      "Bu dans tanrıça için; adımlarını annemden öğrendim.",
      "This dance is for the goddess; I learned its steps from my mother.",
      "Dieser Tanz ist für die Göttin; die Schritte lernte ich von meiner Mutter.",
      "Этот танец — для богини; шаги я выучила у матери.",
    ],
    [
      "Kentten kente dolaşırız; bir yerde mutlaka bayram vardır.",
      "We go from town to town; somewhere there is always a festival.",
      "Wir ziehen von Stadt zu Stadt; irgendwo ist immer ein Fest.",
      "Мы ходим из города в город — где-нибудь всегда праздник.",
    ],
    [
      "Hokkabazlar ve cambazlar oyun aralarında seyirciyi eğlendirir.",
      "Jugglers and acrobats keep the crowd amused between the plays.",
      "Gaukler und Akrobaten unterhalten das Publikum zwischen den Stücken.",
      "Жонглёры и акробаты развлекают публику между представлениями.",
    ],
  ],
  teacher: [
    [
      "Önce harfler, sonra heceler, sonra Homeros.",
      "First the letters, then the syllables, then Homer.",
      "Erst die Buchstaben, dann die Silben, dann Homer.",
      "Сначала буквы, потом слоги, потом Гомер.",
    ],
    [
      "Ders şafakta başlar, öğleye kadar sürer.",
      "Lessons begin at dawn and go on till noon.",
      "Der Unterricht beginnt im Morgengrauen und dauert bis Mittag.",
      "Уроки начинаются на рассвете и идут до полудня.",
    ],
    [
      "Ailelerden ayda birkaç sikke alırım; az ama düzenli.",
      "Parents pay me a few coins a month: not much, but regular.",
      "Die Eltern zahlen mir ein paar Münzen im Monat: wenig, aber regelmäßig.",
      "Родители платят мне несколько монет в месяц — немного, зато регулярно.",
    ],
    [
      "Düşünmek soruyla başlar: ben sorarım, siz cevap verin.",
      "Thinking begins with a question: I ask, and you answer.",
      "Denken beginnt mit einer Frage: Ich frage, ihr antwortet.",
      "Мысль начинается с вопроса: я спрашиваю, вы отвечаете.",
    ],
    [
      "Hatip olmak isteyen ezberlemeli ve güzel konuşmalı.",
      "Whoever would be an orator must learn by heart and speak well.",
      "Wer Redner werden will, muss auswendig lernen und gut sprechen.",
      "Кто хочет стать оратором, должен учить наизусть и говорить красиво.",
    ],
    [
      "Felsefe meydanda ve revakta öğretilir; okul binası gerekmez.",
      "Philosophy is taught in the square and the stoa; it needs no school building.",
      "Philosophie lehrt man auf dem Platz und in der Stoa; ein Schulhaus braucht sie nicht.",
      "Философии учат на площади и в портике — школьное здание ей не нужно.",
    ],
  ],
  mason: [
    [
      "Tokmakla keskiye vururum; taş yavaş yavaş biçim alır.",
      "I strike the chisel with the mallet, and the stone takes shape bit by bit.",
      "Ich schlage mit dem Klöpfel auf den Meißel, und der Stein nimmt nach und nach Gestalt an.",
      "Я бью киянкой по зубилу, и камень понемногу обретает форму.",
    ],
    [
      "Mermer ocaktan kaba yontulmuş gelir; inceliği burada verilir.",
      "The marble comes from the quarry roughly shaped; the fine work is done here.",
      "Der Marmor kommt grob behauen aus dem Bruch; die Feinarbeit geschieht hier.",
      "Мрамор привозят из каменоломни грубо обтёсанным; тонкая работа — здесь.",
    ],
    [
      "Heykel önce kabaca çıkarılır, sonra törpü ve zımparayla düzeltilir.",
      "A statue is first blocked out, then smoothed with rasps and abrasives.",
      "Eine Statue wird erst grob herausgehauen, dann mit Raspeln und Schleifmitteln geglättet.",
      "Статую сначала грубо вырубают, потом выравнивают рашпилем и шлифуют.",
    ],
    [
      "Bitince heykel boyanır; çıplak mermer bırakılmaz.",
      "When it is finished the statue is painted; marble is not left bare.",
      "Wenn sie fertig ist, wird die Statue bemalt; nackter Marmor bleibt nicht.",
      "Готовую статую раскрашивают — голым мрамор не оставляют.",
    ],
    [
      "Taş ustalarına gündelik ödenir; yapı hesapları taşa yazılır.",
      "Masons are paid by the day, and the building accounts are cut in stone.",
      "Steinmetze werden tageweise bezahlt, und die Bauabrechnungen meißelt man in Stein.",
      "Каменщикам платят поденно, а строительные счета высекают на камне.",
    ],
    [
      "Sütun tamburları tek tek yerine oturtulur, demir kenetle bağlanır.",
      "The column drums are set one by one and tied with iron clamps.",
      "Die Säulentrommeln werden einzeln versetzt und mit Eisenklammern verbunden.",
      "Барабаны колонн ставят по одному и скрепляют железными скобами.",
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
  baker: [
    [
      "Yabani tahılı taşta öğütürüz; bu tepe binlerce öğütme taşıyla dolu.",
      "We grind the wild grain on stone; this hill is full of thousands of grinding stones.",
      "Wir mahlen das wilde Getreide auf Stein; dieser Hügel ist voller Mahlsteine.",
      "Мы мелем дикое зерно на камне — этот холм полон тысяч зернотёрок.",
    ],
    [
      "Ezilen tahıldan lapa yapılır, belki şölen için içki de.",
      "The ground grain makes porridge, and perhaps drink for the feast.",
      "Aus dem gemahlenen Korn wird Brei, vielleicht auch ein Trank fürs Fest.",
      "Из молотого зерна варят кашу, а может, и напиток для пира.",
    ],
    [
      "Taşı taşa sürterim; kollarım güçlü olmalı.",
      "I rub stone against stone; my arms have to be strong.",
      "Ich reibe Stein auf Stein; meine Arme müssen kräftig sein.",
      "Я тру камень о камень — руки должны быть сильными.",
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
  baker: [
    [
      "Tahılı el değirmeninde öğütürüm; ekmeğin unu böyle olur.",
      "I grind the grain on the hand quern; that is how bread flour is made.",
      "Ich mahle das Getreide auf dem Handmahlstein; so entsteht Brotmehl.",
      "Я мелю зерно на ручной зернотёрке — так получается мука для хлеба.",
    ],
    [
      "Tabletlerde onlarca çeşit ekmeğin adı geçer.",
      "The tablets name dozens of different kinds of bread.",
      "Die Tontafeln nennen Dutzende Arten von Brot.",
      "На табличках названы десятки сортов хлеба.",
    ],
    [
      "Tanrılara da ekmek sunulur, ayinlerde bölünür.",
      "Bread is offered to the gods too, and broken in the rites.",
      "Auch den Göttern opfert man Brot und bricht es im Ritual.",
      "Хлеб приносят и богам, и преломляют его в обрядах.",
    ],
  ],
  herder: [
    [
      "Koyunlar ve keçiler ovada; kuzular ilkbaharda doğar.",
      "Sheep and goats on the plain; the lambs are born in spring.",
      "Schafe und Ziegen auf der Ebene; die Lämmer kommen im Frühjahr.",
      "Овцы и козы на равнине; ягнята родятся весной.",
    ],
    [
      "Hayvanların bir kısmı tapınaklara adanır.",
      "Some of the animals are given to the temples.",
      "Ein Teil der Tiere wird den Tempeln geweiht.",
      "Часть скота посвящают храмам.",
    ],
    [
      "Kışın sürüyü korunaklı vadilere indiririz.",
      "In winter we bring the flock down into the sheltered valleys.",
      "Im Winter treiben wir die Herde in die geschützten Täler.",
      "Зимой мы сгоняем стадо в укрытые долины.",
    ],
  ],
  merchant: [
    [
      "Küplerde yağ ve şarap var; gelin bakın!",
      "There is oil and wine in the jars: come and see!",
      "In den Krügen ist Öl und Wein: Kommt und seht!",
      "В кувшинах масло и вино — подходите, смотрите!",
    ],
    [
      "Burada sikke yok; tartılmış gümüşle ödenir.",
      "There are no coins here; we pay in weighed silver.",
      "Hier gibt es keine Münzen; man zahlt mit abgewogenem Silber.",
      "Монет здесь нет — платят взвешенным серебром.",
    ],
    [
      "Asurlu tüccarlar bu yolları çok önceden açtı.",
      "Assyrian merchants opened these roads long ago.",
      "Assyrische Kaufleute haben diese Wege schon vor langer Zeit erschlossen.",
      "Ассирийские купцы проложили эти пути давным-давно.",
    ],
  ],
  scribe: [
    [
      "Kil tablete kamışla çivi yazısı bastırırım.",
      "I press cuneiform signs into the clay tablet with a reed.",
      "Ich drücke mit dem Schilfgriffel Keilschrift in die Tontafel.",
      "Я выдавливаю клинопись на глиняной табличке тростинкой.",
    ],
    [
      "Kapıdan giren yükleri kaydederim; saray her şeyi bilmek ister.",
      "I record the loads that come through the gate; the palace wants to know everything.",
      "Ich verzeichne die Lasten, die durchs Tor kommen; der Palast will alles wissen.",
      "Я записываю грузы, что проходят через ворота: дворец хочет знать всё.",
    ],
    [
      "Hititçenin yanında Akadca da öğrendim; krallara mektuplar o dilde yazılır.",
      "Besides Hittite I learned Akkadian; letters to other kings are written in it.",
      "Neben Hethitisch lernte ich Akkadisch; Briefe an andere Könige schreibt man darin.",
      "Кроме хеттского я выучил аккадский — на нём пишут письма другим царям.",
    ],
  ],
  weaver: [
    [
      "Yün eğiriyorum; kumaşın çoğu evlerde dokunur.",
      "I am spinning wool; most cloth is woven at home.",
      "Ich spinne Wolle; der meiste Stoff wird zu Hause gewebt.",
      "Я пряду шерсть — большую часть ткани ткут дома.",
    ],
    [
      "Tanrı heykellerine de giysi dokunur; tabletler bunu yazar.",
      "Clothes are woven for the statues of the gods too; the tablets record it.",
      "Auch für die Götterbilder webt man Gewänder; die Tafeln verzeichnen es.",
      "Ткут одежды и для статуй богов — это записано на табличках.",
    ],
    [
      "İğ dönerken ipliği ince ve eşit çekerim.",
      "As the spindle turns I draw the thread thin and even.",
      "Während die Spindel kreist, ziehe ich den Faden dünn und gleichmäßig.",
      "Пока крутится веретено, я тяну нить тонкой и ровной.",
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
  farmer: [
    [
      "Arpa ve buğday ekeriz; ovanın toprağı bereketli.",
      "We sow barley and wheat; the soil of the plain is rich.",
      "Wir säen Gerste und Weizen; der Boden der Ebene ist fruchtbar.",
      "Мы сеем ячмень и пшеницу — земля на равнине плодородна.",
    ],
    [
      "Saban ağaçtan, ucu sert; öküzler çeker.",
      "The plough is wooden with a hardened point, and oxen pull it.",
      "Der Pflug ist aus Holz mit harter Spitze, und Ochsen ziehen ihn.",
      "Плуг деревянный, с твёрдым наконечником, тянут его волы.",
    ],
    [
      "Hasattan sonra tahıl kaledeki büyük küplere konur.",
      "After the harvest the grain goes into the great jars in the citadel.",
      "Nach der Ernte kommt das Getreide in die großen Vorratsgefäße der Burg.",
      "После жатвы зерно ссыпают в большие пифосы в крепости.",
    ],
  ],
  herder: [
    [
      "Koyunlarımın yünü dokumacılara gider.",
      "My sheep's wool goes to the weavers.",
      "Die Wolle meiner Schafe geht an die Weberinnen.",
      "Шерсть моих овец идёт ткачихам.",
    ],
    [
      "Ovada atlar da otlar; ozanlar bize 'at terbiyecileri' der.",
      "Horses graze the plain as well; the singers call us horse-tamers.",
      "Auf der Ebene weiden auch Pferde; die Sänger nennen uns Pferdebändiger.",
      "На равнине пасутся и кони; певцы зовут нас укротителями коней.",
    ],
    [
      "Akşam sürüyü surların dibine getiririm.",
      "At dusk I bring the flock in under the walls.",
      "Abends treibe ich die Herde unter die Mauern.",
      "К вечеру я пригоняю стадо к стенам.",
    ],
  ],
  potter: [
    [
      "Gri, perdahlı kaplar yaparım; bu kentin kendine özgü çanağı.",
      "I make grey, burnished pots, this town's own ware.",
      "Ich mache graue, polierte Gefäße, die eigene Ware dieser Stadt.",
      "Я делаю серую лощёную посуду — особую керамику этого города.",
    ],
    [
      "Çark hızlı döner; kap ince ve düzgün çıkar.",
      "The wheel spins fast and the pot comes out thin and even.",
      "Die Scheibe dreht sich schnell, und das Gefäß wird dünn und gleichmäßig.",
      "Круг вращается быстро, и сосуд выходит тонким и ровным.",
    ],
    [
      "Kaplarım denizden gelen tüccarlara da satılır.",
      "My pots are sold to the traders who come by sea, too.",
      "Meine Gefäße kaufen auch die Händler, die übers Meer kommen.",
      "Мои сосуды покупают и купцы, что приплывают морем.",
    ],
  ],
  weaver: [
    [
      "Ağırlıklı tezgâhta dokurum; ağırşaklar ipi gergin tutar.",
      "I weave at the weighted loom; the weights keep the threads taut.",
      "Ich webe am Gewichtswebstuhl; die Gewichte halten die Fäden straff.",
      "Я тку на станке с грузилами — они держат нити натянутыми.",
    ],
    [
      "Kalenin her evinde iğ ağırşakları bulunur; hepimiz ip eğiririz.",
      "Every house in the citadel has spindle whorls; we all spin.",
      "In jedem Haus der Burg gibt es Spinnwirtel; wir alle spinnen.",
      "В каждом доме крепости есть пряслица — прядём все.",
    ],
    [
      "Yünü koyunlarımızdan, rengi bitkilerden alırız.",
      "The wool comes from our sheep, the colours from plants.",
      "Die Wolle kommt von unseren Schafen, die Farben von Pflanzen.",
      "Шерсть — от наших овец, краски — из растений.",
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
  farmer: [
    [
      "Manastırın sebzesini kendimiz yetiştiririz: lahana, soğan, fasulye.",
      "We grow the monastery's vegetables ourselves: cabbage, onions, beans.",
      "Das Gemüse des Klosters ziehen wir selbst: Kohl, Zwiebeln, Bohnen.",
      "Овощи для монастыря мы растим сами: капусту, лук, бобы.",
    ],
    [
      "Dua ve emek: kuralımız ikisini de ister.",
      "Prayer and labour: our rule asks for both.",
      "Gebet und Arbeit: Unsere Regel verlangt beides.",
      "Молитва и труд — наш устав требует того и другого.",
    ],
    [
      "Dağda toprak az; bahçeyi taş setlerle yaptık.",
      "There is little soil on the mountain; we built the garden on stone terraces.",
      "Am Berg gibt es wenig Erde; den Garten haben wir auf Steinterrassen angelegt.",
      "На горе мало земли — огород мы устроили на каменных террасах.",
    ],
  ],
  scribe: [
    [
      "Kitapları elle kopyalarım; bir İncil aylar sürer.",
      "I copy books by hand; a single Gospel book takes months.",
      "Ich schreibe Bücher von Hand ab; ein einziges Evangeliar dauert Monate.",
      "Я переписываю книги от руки; одно Евангелие занимает месяцы.",
    ],
    [
      "Mürekkebi meşe mazısından, kalemi kamıştan yaparım.",
      "I make ink from oak galls and pens from reeds.",
      "Die Tinte mache ich aus Eichengallen, die Feder aus Schilfrohr.",
      "Чернила я делаю из дубовых орешков, перо — из тростника.",
    ],
    [
      "Sayfalar parşömen; her biri bir hayvanın derisinden.",
      "The pages are parchment, each made from an animal's skin.",
      "Die Seiten sind Pergament, jede aus der Haut eines Tieres.",
      "Страницы из пергамента — каждая из шкуры животного.",
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
    [
      "İncil kitabını kiliseye taşırım; kapağı gümüş işlemeli.",
      "I carry the Gospel book into the church; its cover is worked in silver.",
      "Ich trage das Evangeliar in die Kirche; sein Deckel ist mit Silber beschlagen.",
      "Я несу Евангелие в храм; его оклад украшен серебром.",
    ],
    [
      "Mumu önden taşırız; ışık Mesih'in ışığıdır.",
      "We carry the candle before it; the light stands for the light of Christ.",
      "Wir tragen die Kerze voraus; ihr Licht steht für das Licht Christi.",
      "Свечу несут впереди: её свет — знак света Христова.",
    ],
    [
      "Ayinler Ermenice yapılır; alfabemizi Mesrop Maştots yarattı.",
      "The services are in Armenian; our alphabet was made by Mesrop Mashtots.",
      "Der Gottesdienst ist armenisch; unser Alphabet schuf Mesrop Maschtoz.",
      "Службы идут на армянском; наш алфавит создал Месроп Маштоц.",
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
  merchant: [
    [
      "Kervan İran'dan geldi: ipek, baharat, boya.",
      "The caravan has come from Persia: silk, spices, dyes.",
      "Die Karawane kam aus Persien: Seide, Gewürze, Farbstoffe.",
      "Караван пришёл из Персии: шёлк, пряности, краски.",
    ],
    [
      "Ani'den geçen yol doğuyu batıya bağlar.",
      "The road through Ani joins the east to the west.",
      "Die Straße durch Ani verbindet den Osten mit dem Westen.",
      "Дорога через Ани соединяет восток с западом.",
    ],
    [
      "Develer günde uzun yol alır ve susuzluğa dayanır.",
      "Camels cover long stages in a day and bear thirst well.",
      "Kamele schaffen weite Tagesstrecken und ertragen den Durst.",
      "Верблюды проходят за день долгий путь и легко терпят жажду.",
    ],
    [
      "Bizans altını, Arap gümüşü: hepsini tartarak alırım.",
      "Byzantine gold, Arab silver: I take them all by weight.",
      "Byzantinisches Gold, arabisches Silber: Ich nehme alles nach Gewicht.",
      "Византийское золото, арабское серебро — всё принимаю на вес.",
    ],
    [
      "Kırmız böceğinden yapılan kırmızı boya buranın en değerli malı.",
      "The red dye made from the cochineal insect is the costliest thing we sell here.",
      "Das Rot aus der Cochenilleschildlaus ist die kostbarste Ware hier.",
      "Красная краска из червеца — самый ценный товар здесь.",
    ],
    [
      "Gece handa kalır, sabah yola devam ederiz.",
      "We stay the night at the inn and go on at dawn.",
      "Wir übernachten in der Herberge und ziehen im Morgengrauen weiter.",
      "Ночуем на постоялом дворе, а на рассвете — снова в путь.",
    ],
  ],
  mason: [
    [
      "Kesme tüfü kırmızı ve siyah taşla dönüşümlü dizeriz.",
      "We lay the dressed tuff in courses of red and black stone.",
      "Wir setzen den behauenen Tuff in Lagen aus rotem und schwarzem Stein.",
      "Мы кладём тёсаный туф рядами красного и чёрного камня.",
    ],
    [
      "Taşın yüzünü keskiyle düzeltirim; derzler incecik olmalı.",
      "I dress the face of the stone with the chisel; the joints must be hair-thin.",
      "Ich glätte die Steinfläche mit dem Meißel; die Fugen müssen haarfein sein.",
      "Я ровняю лицо камня зубилом — швы должны быть тонкими, как волос.",
    ],
    [
      "Duvarın içi harç ve molozla doldurulur; dışı kesme taşla kaplanır.",
      "The core of the wall is filled with mortar and rubble, its face clad in dressed stone.",
      "Das Mauerinnere füllt man mit Mörtel und Bruchstein, außen verkleidet man es mit Quadern.",
      "Сердцевину стены заполняют раствором и бутом, снаружи облицовывают тёсаным камнем.",
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
    [
      "Aşık kemikleriyle oynuyoruz; kendi koyunlarımızın kemikleri.",
      "We are playing knucklebones, from our own sheep.",
      "Wir spielen mit Knöchelchen von unseren eigenen Schafen.",
      "Мы играем в бабки — косточки от наших овец.",
    ],
    [
      "Damdan dama atlamak yasak, ama herkes yapar.",
      "Jumping from roof to roof is forbidden, but everyone does it.",
      "Von Dach zu Dach springen ist verboten, aber alle tun es.",
      "Прыгать с крыши на крышу запрещено, но все прыгают.",
    ],
    [
      "Annem duvarları yeniden sıvarken ben de yardım ederim.",
      "When my mother replasters the walls, I help her.",
      "Wenn meine Mutter die Wände neu verputzt, helfe ich ihr.",
      "Когда мама заново штукатурит стены, я ей помогаю.",
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
  baker: [
    [
      "Tahılı taşta öğütür, ekmeği evdeki fırında pişiririz.",
      "We grind the grain on a stone and bake the bread in the oven inside the house.",
      "Wir mahlen das Korn auf dem Stein und backen das Brot im Ofen im Haus.",
      "Мы мелем зерно на камне и печём хлеб в домашней печи.",
    ],
    [
      "Buğday ve arpa köyün çevresindeki tarlalarda yetişir.",
      "Wheat and barley grow in the fields round the village.",
      "Weizen und Gerste wachsen auf den Feldern rund ums Dorf.",
      "Пшеница и ячмень растут на полях вокруг селения.",
    ],
    [
      "Öğütme taşları kuşaktan kuşağa geçer.",
      "Grinding stones are handed down from one generation to the next.",
      "Mahlsteine werden von Generation zu Generation weitergegeben.",
      "Зернотёрки передаются из поколения в поколение.",
    ],
  ],
  porter: [
    [
      "Sazları bataklıktan keseriz; hasır ve dam için.",
      "We cut reeds in the marsh, for mats and for roofs.",
      "Wir schneiden Schilf im Sumpf, für Matten und Dächer.",
      "Мы режем тростник на болоте — для циновок и крыш.",
    ],
    [
      "Damlar kirişlerin üstüne saz ve çamurla örtülür.",
      "The roofs are laid with reeds and mud over the beams.",
      "Die Dächer deckt man mit Schilf und Lehm über den Balken.",
      "Крыши кроют тростником и глиной поверх балок.",
    ],
    [
      "Yük ağır ama yol kısa: damdan dama yürürüz.",
      "The load is heavy but the way is short: we walk from roof to roof.",
      "Die Last ist schwer, doch der Weg kurz: Wir gehen von Dach zu Dach.",
      "Ноша тяжёлая, но путь короткий — идём с крыши на крышу.",
    ],
  ],
  weaver: [
    [
      "İği döndürürüm; ağırşak ipliği eşit tutar.",
      "I twirl the spindle; the whorl keeps the thread even.",
      "Ich drehe die Spindel; der Wirtel hält den Faden gleichmäßig.",
      "Я кручу веретено — пряслице делает нить ровной.",
    ],
    [
      "Bitki liflerinden ince kumaş dokunur; ölülerimizi de onunla sararız.",
      "Fine cloth is woven from plant fibre; we wrap our dead in it too.",
      "Aus Pflanzenfasern webt man feinen Stoff; auch unsere Toten hüllen wir darin.",
      "Из растительных волокон ткут тонкую ткань; в неё же заворачивают умерших.",
    ],
    [
      "Kemik iğnelerle dikeriz.",
      "We sew with bone needles.",
      "Wir nähen mit Knochennadeln.",
      "Мы шьём костяными иглами.",
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
  potter: { tr: "Çömlekçi", en: "Potter", de: "Töpfer", ru: "Гончар" },
  weaver: { tr: "Dokumacı", en: "Weaver", de: "Weberin", ru: "Ткачиха" },
  scribe: { tr: "Kâtip", en: "Scribe", de: "Schreiber", ru: "Писец" },
  merchant: { tr: "Tüccar", en: "Trader", de: "Händler", ru: "Купец" },
  baker: { tr: "Fırıncı", en: "Baker", de: "Bäcker", ru: "Пекарь" },
  butcher: { tr: "Kasap", en: "Butcher", de: "Metzger", ru: "Мясник" },
  cook: { tr: "Aşçı", en: "Cook", de: "Koch", ru: "Повар" },
  carpenter: { tr: "Marangoz", en: "Carpenter", de: "Zimmermann", ru: "Плотник" },
  painter: { tr: "Ressam", en: "Painter", de: "Maler", ru: "Живописец" },
  servant: { tr: "Hizmetkâr", en: "Servant", de: "Diener", ru: "Слуга" },
  porter: { tr: "Hamal", en: "Porter", de: "Träger", ru: "Носильщик" },
  farmer: { tr: "Çiftçi", en: "Farmer", de: "Bauer", ru: "Земледелец" },
  herder: { tr: "Çoban", en: "Shepherd", de: "Hirte", ru: "Пастух" },
  elder: { tr: "Yaşlı", en: "Elder", de: "Alter", ru: "Старик" },
  beggar: { tr: "Dilenci", en: "Beggar", de: "Bettler", ru: "Нищий" },
  performer: { tr: "Gösterici", en: "Performer", de: "Gaukler", ru: "Артист" },
  teacher: { tr: "Öğretmen", en: "Teacher", de: "Lehrer", ru: "Учитель" },
};

/** The BCP 47 tag the device voice is asked for. */
export const SPEECH_LANG: Record<Lang, string> = {
  tr: "tr-TR",
  en: "en-GB",
  de: "de-DE",
  ru: "ru-RU",
};
