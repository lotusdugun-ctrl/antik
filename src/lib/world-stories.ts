/*
 * What the people of the world cities beyond Greece and Rome say when tapped:
 * Egypt, Mesopotamia, Persia, India, Cambodia, the Americas, China and Japan.
 * Each line is tr, en, de, ru, and says only what is broadly known of the
 * culture, not of any one person: no names, no dates, no numbers.
 */

type Line = readonly [string, string, string, string];
type WorldRole =
  "citizen" | "priest" | "soldier" | "merchant" | "cook" | "potter" | "butcher" | "carpenter";
export type WorldPool = Partial<Record<WorldRole, readonly Line[]>>;

export const EGYPTIAN: WorldPool = {
  citizen: [
    [
      "Nil her yıl taşar; çekilince bıraktığı kara çamura ekeriz.",
      "The Nile floods every year; we sow in the black mud it leaves behind.",
      "Der Nil tritt jedes Jahr über die Ufer; wir säen in den schwarzen Schlamm, den er zurücklässt.",
      "Нил разливается каждый год, и мы сеем в чёрный ил, который он оставляет.",
    ],
    [
      "Firavun tanrıların yeryüzündeki oğludur; tapınakları o yaptırır.",
      "Pharaoh is the son of the gods on earth; he has the temples built.",
      "Der Pharao ist der Sohn der Götter auf Erden; er lässt die Tempel bauen.",
      "Фараон — сын богов на земле; это он строит храмы.",
    ],
    [
      "Ekmek ve arpa birası, işte her gün yediğimiz.",
      "Bread and barley beer: that is what we eat every day.",
      "Brot und Gerstenbier: das essen wir jeden Tag.",
      "Хлеб и ячменное пиво — вот что мы едим каждый день.",
    ],
    [
      "Bayramda tanrının heykeli kayıkla tapınaktan çıkarılır; herkes yolda bekler.",
      "At the festival the god's statue leaves the temple in a boat, and everyone waits along the way.",
      "Am Fest verlässt die Statue des Gottes den Tempel in einer Barke, und alle warten am Weg.",
      "В праздник статую бога выносят из храма в ладье, и все ждут вдоль дороги.",
    ],
    [
      "Keten giyeriz; sıcakta hafif ve serin tutar.",
      "We wear linen; in the heat it is light and cool.",
      "Wir tragen Leinen; in der Hitze ist es leicht und kühl.",
      "Мы носим лён — в жару он лёгкий и прохладный.",
    ],
    [
      "Kâtipler hiyerogliflerle yazar; okumayı bilen az kişi vardır.",
      "The scribes write in hieroglyphs; few people can read.",
      "Die Schreiber schreiben in Hieroglyphen; nur wenige können lesen.",
      "Писцы пишут иероглифами, а читать умеют немногие.",
    ],
  ],
  priest: [
    [
      "Tapınağa girmeden önce yıkanır, başımızı tıraş ederiz; temiz olmalıyız.",
      "Before entering the temple we wash and shave our heads; we must be pure.",
      "Bevor wir den Tempel betreten, waschen wir uns und scheren den Kopf; wir müssen rein sein.",
      "Перед входом в храм мы омываемся и бреем голову: мы должны быть чисты.",
    ],
    [
      "Her sabah tanrının heykelini uyandırır, giydirir ve ona yemek sunarız.",
      "Every morning we wake the god's statue, dress it and offer it food.",
      "Jeden Morgen wecken wir die Statue des Gottes, kleiden sie und bringen ihr Speisen dar.",
      "Каждое утро мы будим статую бога, одеваем её и подносим ей пищу.",
    ],
    [
      "Tapınağın en içteki odasına yalnızca biz gireriz.",
      "Only we enter the innermost room of the temple.",
      "Nur wir betreten den innersten Raum des Tempels.",
      "Во внутреннее святилище храма входим только мы.",
    ],
    [
      "Sütunlu salon papirüs bataklığı gibidir; dünya ilk böyle başlamış.",
      "The columned hall is like a papyrus marsh; that is how the world first began.",
      "Die Säulenhalle ist wie ein Papyrussumpf; so hat die Welt zuerst begonnen.",
      "Колонный зал подобен папирусному болоту: так когда-то начался мир.",
    ],
    [
      "Duvarlardaki kabartmalar firavunun tanrılara sunularını anlatır.",
      "The reliefs on the walls show Pharaoh's offerings to the gods.",
      "Die Reliefs an den Wänden zeigen die Opfergaben des Pharaos an die Götter.",
      "Рельефы на стенах показывают дары фараона богам.",
    ],
    [
      "Tütsü yakarız; kokusu tanrılara hoş gelir.",
      "We burn incense; its scent pleases the gods.",
      "Wir verbrennen Weihrauch; sein Duft erfreut die Götter.",
      "Мы воскуряем благовония — их запах угоден богам.",
    ],
  ],
  potter: [
    [
      "Kili Nil çamurundan alırım; çark ayağımla döner.",
      "I take my clay from the Nile mud; the wheel turns under my hand.",
      "Meinen Ton nehme ich aus dem Nilschlamm; die Scheibe dreht sich unter meiner Hand.",
      "Глину я беру из нильского ила, а круг вращаю рукой.",
    ],
    [
      "Bira ve tahıl için büyük küpler yaparım.",
      "I make big jars for beer and grain.",
      "Ich mache große Krüge für Bier und Getreide.",
      "Я делаю большие сосуды для пива и зерна.",
    ],
    [
      "Pişmeden önce kaplar güneşte kurur.",
      "The pots dry in the sun before they are fired.",
      "Die Gefäße trocknen in der Sonne, bevor sie gebrannt werden.",
      "Перед обжигом горшки сохнут на солнце.",
    ],
    [
      "Tapınağa sunulacak ekmek için kalıplar da yaparım.",
      "I also make moulds for the bread offered at the temple.",
      "Ich mache auch Formen für das Brot, das im Tempel geopfert wird.",
      "Я делаю и формы для хлеба, который приносят в храм.",
    ],
    [
      "Kırık çömlekleri atmayız; kâtipler üstüne not yazar.",
      "We do not throw away broken pots; the scribes write notes on them.",
      "Zerbrochene Töpfe werfen wir nicht weg; die Schreiber schreiben Notizen darauf.",
      "Битые горшки мы не выбрасываем: писцы делают на черепках записи.",
    ],
    [
      "Kırmızı kili cilalarım; zenginler parlak kap ister.",
      "I burnish the red clay; the rich want shiny pots.",
      "Ich poliere den roten Ton; die Reichen wollen glänzende Gefäße.",
      "Я лощу красную глину — богатые любят блестящую посуду.",
    ],
  ],
  butcher: [
    [
      "Bu sığır tapınağa sunulacak; en iyi parçalar tanrıya gider.",
      "This ox is for the temple; the best cuts go to the god.",
      "Dieses Rind ist für den Tempel; die besten Stücke gehen an den Gott.",
      "Этот бык — для храма; лучшие куски достанутся богу.",
    ],
    [
      "Sunudan sonra et rahiplere ve tapınak işçilerine dağıtılır.",
      "After the offering the meat is shared among the priests and temple workers.",
      "Nach dem Opfer wird das Fleisch unter Priestern und Tempelarbeitern verteilt.",
      "После жертвоприношения мясо делят между жрецами и работниками храма.",
    ],
    [
      "Sığır eti pahalıdır; halk daha çok balık ve kümes hayvanı yer.",
      "Beef is costly; ordinary people mostly eat fish and fowl.",
      "Rindfleisch ist teuer; einfache Leute essen meist Fisch und Geflügel.",
      "Говядина дорога; простые люди едят больше рыбу и птицу.",
    ],
    [
      "Bıçağım çakmaktaşından; keskin tutarım.",
      "My knife is flint; I keep it sharp.",
      "Mein Messer ist aus Feuerstein; ich halte es scharf.",
      "Мой нож из кремня, и я держу его острым.",
    ],
    [
      "Eti tuzlar, kuruturuz; sıcakta çabuk bozulur.",
      "We salt and dry the meat; in the heat it spoils fast.",
      "Wir salzen und trocknen das Fleisch; in der Hitze verdirbt es schnell.",
      "Мы солим и сушим мясо — в жару оно быстро портится.",
    ],
    [
      "Bayram günü burada kuyruk olur.",
      "On a feast day there is a queue here.",
      "An einem Festtag gibt es hier eine Schlange.",
      "В праздничный день здесь выстраивается очередь.",
    ],
  ],
};

export const MESOPOTAMIAN: WorldPool = {
  citizen: [
    [
      "Tarlalarımızı kanallarla sularız; yağmur bu ovada azdır.",
      "We water our fields with canals; rain is scarce on this plain.",
      "Wir bewässern unsere Felder mit Kanälen; Regen ist selten in dieser Ebene.",
      "Мы орошаем поля каналами — дождей на этой равнине мало.",
    ],
    [
      "Evler kerpiçten; taş bu topraklarda bulunmaz.",
      "Our houses are mud brick; there is no stone in this land.",
      "Unsere Häuser sind aus Lehmziegeln; Stein gibt es in diesem Land nicht.",
      "Наши дома из сырцового кирпича — камня в этой земле нет.",
    ],
    [
      "Kâtipler kile çivi yazısıyla yazar; anlaşmalar bile tablete geçer.",
      "Scribes write in cuneiform on clay; even contracts go on tablets.",
      "Schreiber schreiben in Keilschrift auf Ton; sogar Verträge kommen auf Tafeln.",
      "Писцы пишут клинописью на глине — даже договоры заносят на таблички.",
    ],
    [
      "Zigurat kentin tanrısının evidir; tepesine tapınak oturur.",
      "The ziggurat is the house of the city's god, with a temple on its top.",
      "Die Zikkurat ist das Haus des Stadtgottes, mit einem Tempel auf der Spitze.",
      "Зиккурат — дом бога города, а на вершине стоит храм.",
    ],
    [
      "Arpa ekmeği, hurma ve bira; sofralarımız bunlarla dolar.",
      "Barley bread, dates and beer fill our tables.",
      "Gerstenbrot, Datteln und Bier füllen unsere Tische.",
      "Ячменный хлеб, финики и пиво — вот что на наших столах.",
    ],
    [
      "Nehir taşarsa tarlalar boğulur; kanalları hep birlikte temizleriz.",
      "If the river floods, the fields drown; we all clean the canals together.",
      "Wenn der Fluss über die Ufer tritt, ertrinken die Felder; wir reinigen die Kanäle gemeinsam.",
      "Если река разливается, поля тонут; каналы мы чистим все вместе.",
    ],
  ],
  priest: [
    [
      "Tanrının heykeline her gün yemek ve içki sunarız.",
      "Every day we offer food and drink to the god's statue.",
      "Jeden Tag bringen wir der Statue des Gottes Speise und Trank dar.",
      "Каждый день мы подносим статуе бога еду и питьё.",
    ],
    [
      "Yıldızları izler, ayın dönüşlerini kaydederiz.",
      "We watch the stars and record the turns of the moon.",
      "Wir beobachten die Sterne und zeichnen die Mondphasen auf.",
      "Мы наблюдаем звёзды и записываем смену луны.",
    ],
    [
      "Yeni yıl bayramında tanrılar kente gelir; tören yolu kalabalıktır.",
      "At the New Year festival the gods come to the city; the processional way is crowded.",
      "Am Neujahrsfest kommen die Götter in die Stadt; die Prozessionsstraße ist voller Menschen.",
      "На празднике Нового года боги приходят в город — дорога процессий полна народа.",
    ],
    [
      "Tapınağın tarlaları, sürüleri ve işçileri vardır.",
      "The temple has its own fields, flocks and workers.",
      "Der Tempel hat eigene Felder, Herden und Arbeiter.",
      "У храма свои поля, стада и работники.",
    ],
    [
      "Kurban edilen hayvanın ciğerine bakıp tanrıların isteğini okuruz.",
      "We read the gods' will in the liver of the sacrificed animal.",
      "Wir lesen den Willen der Götter in der Leber des Opfertiers.",
      "По печени жертвенного животного мы читаем волю богов.",
    ],
    [
      "Tapınak tabletleri arşivde saklanır; hesaplar oraya yazılır.",
      "The temple tablets are kept in the archive; the accounts are written there.",
      "Die Tempeltafeln werden im Archiv aufbewahrt; dort stehen die Abrechnungen.",
      "Храмовые таблички хранятся в архиве — там записаны все счета.",
    ],
  ],
  merchant: [
    [
      "Kereste ve taş dışarıdan gelir; biz karşılığında tahıl ve kumaş veririz.",
      "Timber and stone come from abroad; we give grain and cloth in return.",
      "Holz und Stein kommen von weit her; wir geben Getreide und Tuch dafür.",
      "Лес и камень привозят издалека, а мы платим зерном и тканью.",
    ],
    [
      "Fiyatı gümüşün ağırlığıyla ölçeriz.",
      "We reckon the price in weights of silver.",
      "Wir rechnen den Preis in Silbergewicht.",
      "Цену мы считаем на вес серебра.",
    ],
    [
      "Her satış tablete yazılır ve mühürlenir.",
      "Every sale is written on a tablet and sealed.",
      "Jeder Verkauf wird auf einer Tafel festgehalten und gesiegelt.",
      "Каждая сделка записывается на табличку и скрепляется печатью.",
    ],
  ],
  cook: [
    [
      "Arpa unundan yassı ekmek pişiririm.",
      "I bake flat bread from barley flour.",
      "Ich backe Fladenbrot aus Gerstenmehl.",
      "Я пеку лепёшки из ячменной муки.",
    ],
    [
      "Bira arpadan yapılır; kamışla içilir.",
      "Beer is made from barley and drunk through a reed.",
      "Bier wird aus Gerste gemacht und mit einem Halm getrunken.",
      "Пиво варят из ячменя и пьют через тростинку.",
    ],
    [
      "Hurma tatlıdır; balla karıştırıp sunarız.",
      "Dates are sweet; we mix them with honey and serve them.",
      "Datteln sind süß; wir mischen sie mit Honig und reichen sie.",
      "Финики сладкие — мы смешиваем их с мёдом и подаём.",
    ],
  ],
  potter: [
    [
      "Çark hızlı döner; günde çok kap yaparım.",
      "The wheel turns fast; I make many pots a day.",
      "Die Scheibe dreht sich schnell; ich mache viele Gefäße am Tag.",
      "Круг крутится быстро — за день я делаю много горшков.",
    ],
    [
      "Kâtiplerin tableti de kilden; onları da pişiririz bazen.",
      "The scribes' tablets are clay too; sometimes we fire them as well.",
      "Auch die Tafeln der Schreiber sind aus Ton; manchmal brennen wir sie ebenfalls.",
      "Таблички писцов тоже из глины — иногда мы обжигаем и их.",
    ],
    [
      "Sırlı tuğla en pahalı iştir; mavisi uzaktan parlar.",
      "Glazed brick is the costliest work; its blue shines from afar.",
      "Glasierte Ziegel sind die teuerste Arbeit; ihr Blau leuchtet von weitem.",
      "Глазурованный кирпич — самая дорогая работа: его синева видна издалека.",
    ],
  ],
};

export const ACHAEMENID: WorldPool = {
  citizen: [
    [
      "Kralların kralı geniş bir ülkeyi yönetir; elçiler her yerden gelir.",
      "The King of Kings rules a vast land; envoys come from everywhere.",
      "Der König der Könige herrscht über ein weites Land; Gesandte kommen von überall.",
      "Царь царей правит огромной страной; послы приходят отовсюду.",
    ],
    [
      "Kral yolu ülkeyi baştan başa geçer; ulaklar konaklarda at değiştirir.",
      "The royal road crosses the land; messengers change horses at the stations.",
      "Die Königsstraße durchquert das Land; Boten wechseln an den Stationen die Pferde.",
      "Царская дорога пересекает страну; гонцы меняют коней на станциях.",
    ],
    [
      "Merdivenlerdeki kabartmalarda her halkın elçisi kendi armağanını taşır.",
      "On the stair reliefs the envoys of every people carry their own gifts.",
      "Auf den Treppenreliefs tragen die Gesandten jedes Volkes ihre eigenen Gaben.",
      "На рельефах лестниц послы каждого народа несут свои дары.",
    ],
    [
      "Doğruyu söylemek en büyük erdemdir; yalan en kötü suç sayılır.",
      "Telling the truth is the highest virtue; a lie is the worst offence.",
      "Die Wahrheit zu sagen ist die höchste Tugend; die Lüge gilt als schlimmstes Vergehen.",
      "Говорить правду — высшая добродетель, а ложь считается худшим проступком.",
    ],
    [
      "Kumaşlarımız renkli; pantolon ve kollu ceket giyeriz.",
      "Our cloth is colourful; we wear trousers and a sleeved coat.",
      "Unsere Stoffe sind bunt; wir tragen Hosen und einen Ärmelrock.",
      "Наши ткани яркие; мы носим штаны и кафтан с рукавами.",
    ],
    [
      "Yeni yılda saraya armağanlar getirilir.",
      "At the New Year gifts are brought to the palace.",
      "Zum Neujahr werden Gaben in den Palast gebracht.",
      "На Новый год во дворец приносят дары.",
    ],
  ],
  priest: [
    [
      "Ateş kutsaldır; onu hiç söndürmeyiz.",
      "Fire is sacred; we never let it go out.",
      "Das Feuer ist heilig; wir lassen es nie erlöschen.",
      "Огонь священен — мы никогда не даём ему погаснуть.",
    ],
    [
      "Biz maglarız; törenleri biz yönetiriz.",
      "We are the magi; we lead the rites.",
      "Wir sind die Magier; wir leiten die Riten.",
      "Мы маги и руководим обрядами.",
    ],
    [
      "Ahura Mazda'ya dua ederiz; iyiliğin ve doğruluğun tanrısıdır.",
      "We pray to Ahura Mazda, the god of goodness and truth.",
      "Wir beten zu Ahura Mazda, dem Gott des Guten und der Wahrheit.",
      "Мы молимся Ахурамазде — богу добра и истины.",
    ],
    [
      "Ateşe nefesimiz değmesin diye ağzımızı örteriz.",
      "We cover our mouths so our breath does not touch the fire.",
      "Wir bedecken den Mund, damit unser Atem das Feuer nicht berührt.",
      "Мы закрываем рот, чтобы наше дыхание не коснулось огня.",
    ],
    [
      "Su ve toprak da temiz tutulmalıdır.",
      "Water and earth must be kept pure as well.",
      "Auch Wasser und Erde müssen rein gehalten werden.",
      "Вода и земля тоже должны оставаться чистыми.",
    ],
    [
      "Elimizdeki dal demetine barsom denir; dua ederken tutarız.",
      "The bundle of twigs in our hands is the barsom; we hold it as we pray.",
      "Das Zweigbündel in unseren Händen ist das Barsom; wir halten es beim Gebet.",
      "Пучок прутьев в наших руках — барсом; мы держим его во время молитвы.",
    ],
  ],
  merchant: [
    [
      "Kral sikke bastırdı; altın darik her yerde geçer.",
      "The king has coins struck; the gold daric is good everywhere.",
      "Der König lässt Münzen prägen; der goldene Dareikos gilt überall.",
      "Царь чеканит монету — золотой дарик принимают повсюду.",
    ],
    [
      "Yollar güvenli; kervanlar uzak eyaletlerden mal getirir.",
      "The roads are safe; caravans bring goods from distant provinces.",
      "Die Straßen sind sicher; Karawanen bringen Waren aus fernen Provinzen.",
      "Дороги безопасны — караваны везут товары из дальних сатрапий.",
    ],
    [
      "Halılar ve renkli kumaşlar en çok aranan mallardır.",
      "Carpets and coloured cloth are the goods most sought after.",
      "Teppiche und bunte Stoffe sind die gefragtesten Waren.",
      "Ковры и цветные ткани — самый ходовой товар.",
    ],
    [
      "Vergi eyalet eyalet toplanır; kimi gümüş, kimi mal öder.",
      "Tribute is gathered province by province; some pay silver, some goods.",
      "Der Tribut wird Provinz für Provinz eingezogen; manche zahlen Silber, manche Waren.",
      "Дань собирают по сатрапиям: кто платит серебром, кто товаром.",
    ],
    [
      "Saray için yiyecek ve şarap getiriyorum; hesabı tablete yazılır.",
      "I bring food and wine for the palace; the account goes on a tablet.",
      "Ich bringe Speisen und Wein für den Palast; die Rechnung kommt auf eine Tafel.",
      "Я везу во дворец еду и вино — счёт записывают на табличку.",
    ],
    [
      "Pazarlık sabır ister, ama yalan yok.",
      "Bargaining takes patience, but no lies.",
      "Feilschen braucht Geduld, aber keine Lügen.",
      "Торг требует терпения, но не лжи.",
    ],
  ],
};

export const INDUS: WorldPool = {
  citizen: [
    [
      "Sokaklar dümdüz; kent bir ızgara gibi kurulmuş.",
      "The streets are straight; the city is laid out like a grid.",
      "Die Straßen sind gerade; die Stadt ist wie ein Gitter angelegt.",
      "Улицы прямые — город построен как решётка.",
    ],
    [
      "Evlerin çoğunda kuyu ve banyo var; atık su kapalı kanallara akar.",
      "Most houses have a well and a bathroom; the waste water runs into covered drains.",
      "Die meisten Häuser haben einen Brunnen und ein Bad; das Abwasser fließt in überdeckte Kanäle.",
      "Почти в каждом доме есть колодец и купальня; сточные воды уходят в крытые каналы.",
    ],
    [
      "Tuğlalarımız pişmiş; hepsi aynı ölçüde.",
      "Our bricks are fired, and all of the same proportions.",
      "Unsere Ziegel sind gebrannt und haben alle dieselben Maße.",
      "Наши кирпичи обожжённые и все одних пропорций.",
    ],
    [
      "Mühürlerimizde hayvanlar ve yazı var; o yazıyı bugün kimse okuyamıyor.",
      "Our seals carry animals and writing that no one can read today.",
      "Unsere Siegel tragen Tiere und eine Schrift, die heute niemand lesen kann.",
      "На наших печатях звери и письмена, которые сегодня никто не может прочесть.",
    ],
    [
      "Büyük Hamam'ın havuzu zift ile su geçirmez yapılmış.",
      "The pool of the Great Bath is made watertight with bitumen.",
      "Das Becken des Großen Bades ist mit Bitumen abgedichtet.",
      "Бассейн Большой купальни сделан водонепроницаемым с помощью битума.",
    ],
    [
      "Pamuk eker, dokuruz; buğday ve arpa da yetiştiririz.",
      "We grow and weave cotton, and we grow wheat and barley too.",
      "Wir bauen Baumwolle an und weben sie; auch Weizen und Gerste bauen wir an.",
      "Мы выращиваем и ткём хлопок, а ещё сеем пшеницу и ячмень.",
    ],
  ],
  priest: [
    [
      "Arınma için suya gireriz; su kutsaldır.",
      "We step into the water to be purified; water is holy.",
      "Wir steigen ins Wasser, um uns zu reinigen; Wasser ist heilig.",
      "Мы входим в воду для очищения — вода священна.",
    ],
    [
      "Alnımızdaki bant saygı işaretidir.",
      "The band on our brow is a mark of respect.",
      "Das Band auf unserer Stirn ist ein Zeichen der Achtung.",
      "Повязка на лбу — знак почёта.",
    ],
    [
      "Toprak ana küçük kil heykelciklerle anılır.",
      "The mother goddess is honoured with small clay figurines.",
      "Die Muttergöttin wird mit kleinen Tonfiguren verehrt.",
      "Богиню-мать почитают маленькими глиняными статуэтками.",
    ],
  ],
  potter: [
    [
      "Kırmızı kaplara siyah boyayla desen çizerim.",
      "I paint patterns in black on red pots.",
      "Ich male Muster in Schwarz auf rote Gefäße.",
      "Я расписываю красные сосуды чёрными узорами.",
    ],
    [
      "Çocuklar için kilden oyuncak arabalar da yaparım.",
      "I make clay toy carts for the children too.",
      "Ich mache auch Spielzeugkarren aus Ton für die Kinder.",
      "Я леплю для детей и игрушечные тележки из глины.",
    ],
    [
      "Fırınlar kentin kenarında; duman evlere gelmesin.",
      "The kilns are at the edge of town, so the smoke stays away from the houses.",
      "Die Brennöfen liegen am Stadtrand, damit der Rauch von den Häusern fernbleibt.",
      "Печи стоят на окраине, чтобы дым не шёл к домам.",
    ],
  ],
  merchant: [
    [
      "Taş ağırlıklarımız her yerde aynı; kimse aldatılmaz.",
      "Our stone weights are the same everywhere; no one is cheated.",
      "Unsere Steingewichte sind überall gleich; niemand wird betrogen.",
      "Наши каменные гири везде одинаковы — никого не обманут.",
    ],
    [
      "Mallarımızı mühürle işaretleriz.",
      "We mark our goods with a seal.",
      "Wir kennzeichnen unsere Waren mit einem Siegel.",
      "Мы метим свои товары печатью.",
    ],
    [
      "Boncuklarımız uzak ülkelere kadar gider.",
      "Our beads travel to distant lands.",
      "Unsere Perlen gelangen bis in ferne Länder.",
      "Наши бусы доходят до далёких стран.",
    ],
  ],
};

export const VIJAYANAGARA: WorldPool = {
  citizen: [
    [
      "Kent iri granit kayaların arasına kurulmuş; nehir yanı başımızda.",
      "The city is built among huge granite boulders, with the river beside us.",
      "Die Stadt ist zwischen riesigen Granitblöcken erbaut, der Fluss gleich neben uns.",
      "Город построен среди огромных гранитных валунов, а рядом течёт река.",
    ],
    [
      "Tapınak kapısının kulesi kat kat yükselir; uzaktan görünür.",
      "The temple gate tower rises storey on storey; it can be seen from afar.",
      "Der Turm des Tempeltors steigt Stockwerk um Stockwerk auf; man sieht ihn von weitem.",
      "Башня храмовых ворот поднимается ярус за ярусом и видна издалека.",
    ],
    [
      "Çarşı uzun ve sütunlu; at, mücevher ve baharat satılır.",
      "The bazaar street is long and pillared; horses, jewels and spices are sold.",
      "Die Basarstraße ist lang und von Pfeilern gesäumt; Pferde, Juwelen und Gewürze werden verkauft.",
      "Базарная улица длинная, с колоннами; здесь продают коней, самоцветы и пряности.",
    ],
    [
      "Bayramda tapınağın tahta arabası sokaklarda çekilir.",
      "At the festival the temple's wooden chariot is pulled through the streets.",
      "Am Fest wird der hölzerne Tempelwagen durch die Straßen gezogen.",
      "В праздник по улицам тянут деревянную храмовую колесницу.",
    ],
    [
      "Kanallar nehirden suyu tarlalara taşır.",
      "Canals carry the river water to the fields.",
      "Kanäle leiten das Flusswasser auf die Felder.",
      "Каналы несут речную воду на поля.",
    ],
    [
      "Pirinç ve darı ekeriz; yemekte baharat eksik olmaz.",
      "We grow rice and millet, and there is always spice in our food.",
      "Wir bauen Reis und Hirse an, und in unserem Essen fehlen nie Gewürze.",
      "Мы сеем рис и просо, и пряности в нашей еде есть всегда.",
    ],
  ],
  priest: [
    [
      "Sabah ezgileriyle tanrıyı uyandırır, çiçek sunarız.",
      "We wake the god with morning hymns and offer flowers.",
      "Wir wecken den Gott mit Morgenhymnen und bringen Blumen dar.",
      "Утренними гимнами мы будим бога и подносим цветы.",
    ],
    [
      "Tapınağın sütunları tek parça granitten oyulmuştur.",
      "The temple pillars are carved from single blocks of granite.",
      "Die Tempelpfeiler sind aus einzelnen Granitblöcken gehauen.",
      "Колонны храма высечены из цельных глыб гранита.",
    ],
    [
      "Kutsal metinleri ezbere okuruz.",
      "We recite the sacred texts by heart.",
      "Wir tragen die heiligen Texte auswendig vor.",
      "Мы читаем священные тексты наизусть.",
    ],
  ],
  merchant: [
    [
      "Atlar denizden gelir; ordu için çok aranır.",
      "Horses come by sea, much sought for the army.",
      "Pferde kommen über das Meer und sind für das Heer sehr gefragt.",
      "Коней привозят морем — для войска они нарасхват.",
    ],
    [
      "Biber ve tarçın kervanla limanlara gider.",
      "Pepper and cinnamon go by caravan to the ports.",
      "Pfeffer und Zimt gehen mit Karawanen zu den Häfen.",
      "Перец и корицу везут караванами в порты.",
    ],
    [
      "Pamuklu kumaşım ince ve renkli; bakın.",
      "My cotton cloth is fine and colourful; have a look.",
      "Mein Baumwollstoff ist fein und bunt; schauen Sie.",
      "Моя хлопковая ткань тонкая и яркая — взгляните.",
    ],
  ],
  cook: [
    [
      "Pirinci muz yaprağında sunarım.",
      "I serve the rice on a banana leaf.",
      "Ich reiche den Reis auf einem Bananenblatt.",
      "Я подаю рис на банановом листе.",
    ],
    [
      "Mercimek ve baharatla koyu bir yemek pişiriyorum.",
      "I am cooking a thick dish of lentils and spices.",
      "Ich koche ein dickes Gericht aus Linsen und Gewürzen.",
      "Я варю густое блюдо из чечевицы и пряностей.",
    ],
    [
      "Tapınakta pişen yemek hacılara dağıtılır.",
      "The food cooked at the temple is shared out to pilgrims.",
      "Das im Tempel gekochte Essen wird an Pilger verteilt.",
      "Еду, приготовленную при храме, раздают паломникам.",
    ],
  ],
  potter: [
    [
      "Su testisi gölgede serin kalır.",
      "A water jar stays cool in the shade.",
      "Ein Wasserkrug bleibt im Schatten kühl.",
      "Кувшин с водой в тени остаётся прохладным.",
    ],
    [
      "Kandiller için küçük kaplar yaparım.",
      "I make little bowls for the lamps.",
      "Ich mache kleine Schalen für die Lampen.",
      "Я делаю маленькие чашечки для светильников.",
    ],
    [
      "Kili nehir kıyısından alırım.",
      "I take my clay from the river bank.",
      "Meinen Ton hole ich vom Flussufer.",
      "Глину я беру на берегу реки.",
    ],
  ],
};

export const KHMER: WorldPool = {
  citizen: [
    [
      "Barayların suyu pirinç tarlalarımızı besler.",
      "The water of the great reservoirs feeds our rice fields.",
      "Das Wasser der großen Speicherbecken nährt unsere Reisfelder.",
      "Вода больших водохранилищ питает наши рисовые поля.",
    ],
    [
      "Tapınak taştan, evlerimiz ise ahşap ve kamıştan.",
      "The temple is stone; our houses are wood and thatch.",
      "Der Tempel ist aus Stein, unsere Häuser aus Holz und Stroh.",
      "Храм каменный, а наши дома — из дерева и тростника.",
    ],
    [
      "Hendek tapınağı çevreler; dünyayı saran okyanus gibidir.",
      "The moat rings the temple like the ocean around the world.",
      "Der Graben umgibt den Tempel wie der Ozean die Welt.",
      "Ров окружает храм, как океан окружает мир.",
    ],
    [
      "Kuleler kutsal dağın doruklarını andırır.",
      "The towers stand for the peaks of the sacred mountain.",
      "Die Türme stehen für die Gipfel des heiligen Berges.",
      "Башни изображают вершины священной горы.",
    ],
    [
      "Galerilerin duvarlarında savaşlar ve tanrıların hikâyeleri oyulu.",
      "Battles and stories of the gods are carved along the gallery walls.",
      "Schlachten und Göttergeschichten sind in die Galeriewände gemeißelt.",
      "На стенах галерей высечены битвы и сказания о богах.",
    ],
    [
      "Göl balığı ve pirinç; her günkü yemeğimiz bu.",
      "Lake fish and rice: that is our daily food.",
      "Seefisch und Reis: das ist unser tägliches Essen.",
      "Озёрная рыба и рис — наша каждодневная еда.",
    ],
  ],
  priest: [
    [
      "Kral tanrılar adına hüküm sürer; tapınak onun da anıtıdır.",
      "The king rules in the name of the gods; the temple is his monument too.",
      "Der König herrscht im Namen der Götter; der Tempel ist auch sein Denkmal.",
      "Царь правит от имени богов, и храм — это и его памятник.",
    ],
    [
      "Dans edenler törende tanrılar için dans eder.",
      "The dancers dance for the gods at the ceremony.",
      "Die Tänzerinnen tanzen bei der Zeremonie für die Götter.",
      "Танцовщицы танцуют для богов во время обряда.",
    ],
    [
      "Kutsal metinler Sanskritçe okunur.",
      "The sacred texts are recited in Sanskrit.",
      "Die heiligen Texte werden auf Sanskrit vorgetragen.",
      "Священные тексты читают на санскрите.",
    ],
    [
      "Tapınağa pirinç, çiçek ve tütsü sunarız.",
      "We offer the temple rice, flowers and incense.",
      "Wir bringen dem Tempel Reis, Blumen und Weihrauch dar.",
      "Мы приносим в храм рис, цветы и благовония.",
    ],
    [
      "Yüzler dört yöne bakar; hiçbir şey gözden kaçmaz.",
      "The faces look to the four directions; nothing escapes them.",
      "Die Gesichter blicken in die vier Richtungen; nichts entgeht ihnen.",
      "Лики смотрят на все четыре стороны — от них ничто не скроется.",
    ],
    [
      "Yılan korkuluklar suyu ve bereketi simgeler.",
      "The serpent balustrades stand for water and plenty.",
      "Die Schlangenbalustraden stehen für Wasser und Fülle.",
      "Перила-змеи символизируют воду и изобилие.",
    ],
  ],
  merchant: [
    [
      "Pazarı kadınlar yürütür; ben ipek ve tuz satarım.",
      "Women run the market; I sell silk and salt.",
      "Den Markt führen die Frauen; ich verkaufe Seide und Salz.",
      "Рынком заправляют женщины; я продаю шёлк и соль.",
    ],
    [
      "Uzaktan gelen tüccarlar seramik ve kumaş getirir.",
      "Traders from afar bring ceramics and cloth.",
      "Händler aus der Ferne bringen Keramik und Stoffe.",
      "Купцы издалека привозят керамику и ткани.",
    ],
    [
      "Ormandan reçine, fildişi ve kuş tüyü gelir.",
      "Resin, ivory and feathers come from the forest.",
      "Harz, Elfenbein und Federn kommen aus dem Wald.",
      "Смола, слоновая кость и перья приходят из леса.",
    ],
  ],
  cook: [
    [
      "Balığı mayalandırıp sos yaparız.",
      "We ferment fish to make a sauce.",
      "Wir lassen Fisch gären und machen daraus eine Soße.",
      "Мы квасим рыбу и делаем из неё соус.",
    ],
    [
      "Pirinç buharda pişer; her öğünde vardır.",
      "Rice is steamed; it is at every meal.",
      "Reis wird gedämpft; er gehört zu jeder Mahlzeit.",
      "Рис готовят на пару — он есть в каждой трапезе.",
    ],
    [
      "Hurma şekeri yemeği tatlandırır.",
      "Palm sugar sweetens the food.",
      "Palmzucker süßt das Essen.",
      "Пальмовый сахар подслащивает еду.",
    ],
  ],
};

export const MESOAMERICAN: WorldPool = {
  citizen: [
    [
      "Mısır her şeyimiz; ekmeğimizi de içeceğimizi de ondan yaparız.",
      "Maize is everything to us; we make our bread and our drink from it.",
      "Mais ist alles für uns; daraus machen wir unser Brot und unser Getränk.",
      "Кукуруза для нас всё: из неё мы делаем и лепёшки, и питьё.",
    ],
    [
      "Kakao çekirdeği o kadar değerli ki para gibi kullanılır.",
      "Cacao beans are so precious they are used like money.",
      "Kakaobohnen sind so wertvoll, dass man sie wie Geld benutzt.",
      "Какао-бобы так ценны, что ими платят, как деньгами.",
    ],
    [
      "Piramidin tepesindeki tapınağa yalnızca rahipler çıkar.",
      "Only the priests climb to the temple on top of the pyramid.",
      "Nur die Priester steigen zum Tempel auf der Pyramide hinauf.",
      "К храму на вершине пирамиды поднимаются только жрецы.",
    ],
    [
      "Top oyununda top kalçayla vurulur; elle dokunmak yasak.",
      "In the ballgame the ball is struck with the hips; touching it by hand is forbidden.",
      "Beim Ballspiel wird der Ball mit der Hüfte geschlagen; mit der Hand berühren ist verboten.",
      "В игре в мяч мяч отбивают бёдрами — касаться его руками нельзя.",
    ],
    [
      "Takvim günleri sayar; her günün kendi adı ve anlamı var.",
      "The calendar counts the days; each day has its own name and meaning.",
      "Der Kalender zählt die Tage; jeder Tag hat seinen eigenen Namen und seine Bedeutung.",
      "Календарь ведёт счёт дням; у каждого дня своё имя и значение.",
    ],
    [
      "Obsidyen bıçaklar çok keskindir; pazarda iyi para eder.",
      "Obsidian blades are very sharp and fetch a good price at the market.",
      "Obsidianklingen sind sehr scharf und bringen auf dem Markt gutes Geld.",
      "Обсидиановые лезвия очень острые и хорошо продаются на рынке.",
    ],
  ],
  priest: [
    [
      "Göğü izler, günleri sayarız; tören günlerini biz belirleriz.",
      "We watch the sky and count the days; we set the days of the rites.",
      "Wir beobachten den Himmel und zählen die Tage; wir bestimmen die Festtage.",
      "Мы следим за небом и считаем дни — мы назначаем дни обрядов.",
    ],
    [
      "Tütsü olarak kopal reçinesi yakarız.",
      "We burn copal resin as incense.",
      "Wir verbrennen Kopalharz als Weihrauch.",
      "Мы воскуряем смолу копал.",
    ],
    [
      "Tanrılar dünyayı yaratırken kendilerini feda ettiler; biz de borcumuzu öderiz.",
      "The gods gave of themselves to make the world; we repay that debt.",
      "Die Götter haben sich hingegeben, um die Welt zu erschaffen; wir zahlen diese Schuld zurück.",
      "Боги пожертвовали собой, чтобы создать мир, — и мы возвращаем этот долг.",
    ],
    [
      "Yağmur tanrısı olmadan mısır büyümez.",
      "Without the rain god the maize does not grow.",
      "Ohne den Regengott wächst der Mais nicht.",
      "Без бога дождя кукуруза не растёт.",
    ],
    [
      "Merdivenler çok dik; tepeye yavaş çıkılır.",
      "The stairs are very steep; one climbs to the top slowly.",
      "Die Treppen sind sehr steil; man steigt langsam nach oben.",
      "Лестницы очень крутые — наверх поднимаются медленно.",
    ],
    [
      "Kitaplarımız ağaç kabuğundan kâğıda boyanır ve katlanır.",
      "Our books are painted on bark paper and folded.",
      "Unsere Bücher werden auf Rindenpapier gemalt und gefaltet.",
      "Наши книги рисуют на бумаге из коры и складывают гармошкой.",
    ],
  ],
  merchant: [
    [
      "Kakao, pamuk ve tuz getirdim; karşılığında yeşim istiyorum.",
      "I have brought cacao, cotton and salt; I want jade in return.",
      "Ich habe Kakao, Baumwolle und Salz gebracht; dafür will ich Jade.",
      "Я привёз какао, хлопок и соль, а взамен хочу нефрит.",
    ],
    [
      "Yük hayvanımız yok; malları sırtımızda taşırız.",
      "We have no beasts of burden; we carry the goods on our backs.",
      "Wir haben keine Lasttiere; wir tragen die Waren auf dem Rücken.",
      "Вьючных животных у нас нет — товары мы носим на спине.",
    ],
    [
      "Kuş tüyleri ormandan gelir; en parlakları soylulara gider.",
      "Feathers come from the forest; the brightest go to the nobles.",
      "Federn kommen aus dem Wald; die leuchtendsten gehen an die Adligen.",
      "Перья приходят из леса, и самые яркие достаются знати.",
    ],
    [
      "Obsidyeni uzak dağlardan getirttik.",
      "We had the obsidian brought from distant mountains.",
      "Den Obsidian haben wir aus fernen Bergen bringen lassen.",
      "Обсидиан нам привезли из далёких гор.",
    ],
    [
      "Pazar günü kalabalık olur; herkes bir şey takas eder.",
      "Market day is crowded; everyone trades something.",
      "Am Markttag ist es voll; jeder tauscht etwas.",
      "В базарный день людно — каждый что-то выменивает.",
    ],
    [
      "Pamuklu kumaş da para gibi geçer.",
      "Cotton cloth passes like money too.",
      "Auch Baumwollstoff gilt wie Geld.",
      "Хлопковая ткань тоже ходит как деньги.",
    ],
  ],
  cook: [
    [
      "Mısırı kireçli suda haşlar, taşta öğütürüm.",
      "I soak the maize in lime water and grind it on the stone.",
      "Ich weiche den Mais in Kalkwasser ein und mahle ihn auf dem Stein.",
      "Я вымачиваю кукурузу в известковой воде и мелю её на камне.",
    ],
    [
      "Tortillaları kil tavada pişiririm.",
      "I cook the tortillas on a clay griddle.",
      "Ich backe die Tortillas auf einer Tonplatte.",
      "Я пеку тортильи на глиняной сковороде.",
    ],
    [
      "Fasulye, kabak ve acı biber; mısırın yanında hep bunlar var.",
      "Beans, squash and chilli always go with the maize.",
      "Bohnen, Kürbis und Chili gehören immer zum Mais.",
      "Фасоль, тыква и перец всегда идут вместе с кукурузой.",
    ],
    [
      "Kakaoyu köpürterek içeriz; soylular çok sever.",
      "We drink cacao frothed up; the nobles love it.",
      "Wir trinken den Kakao aufgeschäumt; die Adligen lieben ihn.",
      "Какао мы пьём взбитым в пену — знать его обожает.",
    ],
    [
      "Tamale'yi mısır yaprağına sarıp buharda pişiririm.",
      "I wrap tamales in maize leaves and steam them.",
      "Ich wickle Tamales in Maisblätter und dämpfe sie.",
      "Я заворачиваю тамале в кукурузные листья и готовлю на пару.",
    ],
    [
      "Hindi ve köpek eti bayram yemeğidir.",
      "Turkey and dog are feast-day meat.",
      "Truthahn und Hund sind Fleisch für Festtage.",
      "Индейка и собачье мясо — праздничная еда.",
    ],
  ],
};

export const ANDEAN: WorldPool = {
  citizen: [
    [
      "Dağın yamacını teraslarla basamak basamak tarlaya çeviririz.",
      "We turn the mountainside into fields with terraces, step by step.",
      "Wir verwandeln den Berghang mit Terrassen Stufe für Stufe in Felder.",
      "Мы превращаем склон горы в поля — терраса за террасой.",
    ],
    [
      "Patates ve mısır ekeriz; yüksekte patates daha iyi yetişir.",
      "We grow potatoes and maize; higher up, potatoes do better.",
      "Wir bauen Kartoffeln und Mais an; weiter oben gedeihen Kartoffeln besser.",
      "Мы сажаем картофель и кукурузу; повыше лучше растёт картофель.",
    ],
    [
      "Lamalar yük taşır; yünleri de giysimiz olur.",
      "The llamas carry loads, and their wool becomes our clothes.",
      "Die Lamas tragen Lasten, und aus ihrer Wolle wird unsere Kleidung.",
      "Ламы носят грузы, а из их шерсти мы делаем одежду.",
    ],
    [
      "Dokuma altından değerlidir; en iyi kumaş armağan olarak verilir.",
      "Weaving is worth more than gold; the finest cloth is given as a gift.",
      "Weberei ist mehr wert als Gold; das feinste Tuch wird als Geschenk gegeben.",
      "Ткань ценится выше золота; лучшую дарят.",
    ],
    [
      "Taşlar harçsız oturtulur; aralarına bıçak bile girmez.",
      "The stones are fitted without mortar; not even a blade goes between them.",
      "Die Steine sind ohne Mörtel gefügt; nicht einmal eine Klinge passt dazwischen.",
      "Камни подогнаны без раствора — между ними не пройдёт даже лезвие.",
    ],
    [
      "Mısır birası bayramlarda bol bol içilir.",
      "Maize beer flows freely at the festivals.",
      "Maisbier fließt bei den Festen reichlich.",
      "Кукурузное пиво на праздниках льётся рекой.",
    ],
  ],
  priest: [
    [
      "Güneş en büyük tanrıdır; gündönümünde onu selamlarız.",
      "The Sun is the greatest god; we greet it at the solstice.",
      "Die Sonne ist der größte Gott; zur Sonnenwende begrüßen wir sie.",
      "Солнце — величайший бог, и в солнцестояние мы его приветствуем.",
    ],
    [
      "Dağlar kutsaldır; her dorukta bir ruh yaşar.",
      "The mountains are sacred; a spirit lives on every peak.",
      "Die Berge sind heilig; auf jedem Gipfel wohnt ein Geist.",
      "Горы священны — на каждой вершине живёт дух.",
    ],
    [
      "Toprak Ana'ya mısır birası dökeriz.",
      "We pour maize beer for Mother Earth.",
      "Wir gießen Maisbier für Mutter Erde aus.",
      "Мы проливаем кукурузное пиво для Матери-Земли.",
    ],
    [
      "Kutsal kayalar ve kaynaklar dua yeridir.",
      "Sacred rocks and springs are places of prayer.",
      "Heilige Felsen und Quellen sind Orte des Gebets.",
      "Священные камни и источники — места молитвы.",
    ],
    [
      "Koka yaprağı sunuların en değerlisidir.",
      "Coca leaf is the most precious of offerings.",
      "Das Kokablatt ist die kostbarste Opfergabe.",
      "Лист коки — самое ценное подношение.",
    ],
    [
      "Atalarımızın mumyaları da onurlandırılır.",
      "The mummies of our ancestors are honoured too.",
      "Auch die Mumien unserer Vorfahren werden geehrt.",
      "Мумии наших предков тоже почитают.",
    ],
  ],
  cook: [
    [
      "Patatesi gece dondurup gündüz kurutarak uzun süre saklarız.",
      "We freeze potatoes by night and dry them by day so they keep a long time.",
      "Wir lassen Kartoffeln nachts gefrieren und tagsüber trocknen, damit sie lange halten.",
      "Мы замораживаем картофель ночью и сушим днём, чтобы он долго хранился.",
    ],
    [
      "Mısır birasını büyük küplerde mayalarım.",
      "I ferment the maize beer in big jars.",
      "Ich lasse das Maisbier in großen Krügen gären.",
      "Я завожу кукурузное пиво в больших сосудах.",
    ],
    [
      "Kinoa ve fasulye ile koyu bir çorba pişiriyorum.",
      "I am cooking a thick soup with quinoa and beans.",
      "Ich koche eine dicke Suppe mit Quinoa und Bohnen.",
      "Я варю густую похлёбку из киноа и фасоли.",
    ],
    [
      "Lama etini kurutup yol azığı yaparız.",
      "We dry llama meat for food on the road.",
      "Wir trocknen Lamafleisch als Wegzehrung.",
      "Мы сушим мясо ламы в дорогу.",
    ],
    [
      "Kobay bayram sofrasının etidir.",
      "Guinea pig is the meat of the feast table.",
      "Meerschweinchen ist das Fleisch für die Festtafel.",
      "Морская свинка — мясо для праздничного стола.",
    ],
    [
      "Ocak taştan; yakıt olarak kurumuş tezek yakarız.",
      "The hearth is stone; we burn dried dung as fuel.",
      "Der Herd ist aus Stein; als Brennstoff verbrennen wir getrockneten Dung.",
      "Очаг каменный, а топим мы сухим навозом.",
    ],
  ],
  merchant: [
    [
      "Kıyıdan kurutulmuş balık ve deniz kabuğu getirdik.",
      "We have brought dried fish and sea shells from the coast.",
      "Wir haben getrockneten Fisch und Meeresmuscheln von der Küste gebracht.",
      "Мы привезли с побережья сушёную рыбу и морские раковины.",
    ],
    [
      "Lama kervanları dağ yollarında mal taşır.",
      "Llama caravans carry the goods along the mountain roads.",
      "Lamakarawanen tragen die Waren über die Bergwege.",
      "Караваны лам несут товары по горным дорогам.",
    ],
    [
      "Para yok; mal mala değişilir.",
      "There is no money; goods are exchanged for goods.",
      "Es gibt kein Geld; Ware wird gegen Ware getauscht.",
      "Денег нет — товар меняют на товар.",
    ],
    [
      "Ormandan tüy, sıcak vadilerden koka gelir.",
      "Feathers come from the forest, coca from the warm valleys.",
      "Federn kommen aus dem Wald, Koka aus den warmen Tälern.",
      "Перья приходят из леса, а кока — из тёплых долин.",
    ],
    [
      "Yünüm yaylalardan; en yumuşağı alpakadan.",
      "My wool is from the high plains; the softest is alpaca.",
      "Meine Wolle kommt aus dem Hochland; die weichste ist Alpaka.",
      "Моя шерсть с высокогорья, а самая мягкая — альпаки.",
    ],
    [
      "Tuz her yerde aranır; ben de tuz getirdim.",
      "Salt is wanted everywhere, so I have brought salt.",
      "Salz ist überall gefragt, also habe ich Salz gebracht.",
      "Соль нужна всем — вот я и привёз соль.",
    ],
  ],
  potter: [
    [
      "Kaplarımı çarksız, kil fitillerle yaparım.",
      "I build my pots without a wheel, from coils of clay.",
      "Ich forme meine Gefäße ohne Scheibe aus Tonwülsten.",
      "Я леплю сосуды без круга — из глиняных жгутов.",
    ],
    [
      "Kaplara hayvan ve insan biçimleri veririz.",
      "We shape our pots like animals and people.",
      "Wir formen unsere Gefäße wie Tiere und Menschen.",
      "Мы придаём сосудам облик животных и людей.",
    ],
    [
      "Uzun boyunlu küpler bira taşımak için.",
      "The long-necked jars are for carrying beer.",
      "Die langhalsigen Krüge sind zum Biertragen.",
      "Высокогорлые сосуды — для переноски пива.",
    ],
  ],
};

export const CHINESE: WorldPool = {
  citizen: [
    [
      "Kent dama tahtası gibi; her mahallenin duvarı ve kapısı var.",
      "The city is like a chessboard; every ward has its own wall and gate.",
      "Die Stadt ist wie ein Schachbrett; jedes Viertel hat eigene Mauer und Tor.",
      "Город как шахматная доска: у каждого квартала своя стена и ворота.",
    ],
    [
      "Akşam davul çalınca mahalle kapıları kapanır.",
      "When the drums sound at dusk, the ward gates close.",
      "Wenn abends die Trommeln schlagen, schließen sich die Tore der Viertel.",
      "Когда вечером бьют барабаны, ворота кварталов закрываются.",
    ],
    [
      "Batıdan gelen kervanlar ipek yolundan mal getirir.",
      "Caravans from the west bring goods along the Silk Road.",
      "Karawanen aus dem Westen bringen Waren über die Seidenstraße.",
      "Караваны с запада везут товары по Шёлковому пути.",
    ],
    [
      "Memur olmak için sınava girilir; klasikleri ezbere bilmek gerekir.",
      "To become an official you sit an examination and must know the classics by heart.",
      "Um Beamter zu werden, legt man eine Prüfung ab und muss die Klassiker auswendig kennen.",
      "Чтобы стать чиновником, сдают экзамен и знают классиков наизусть.",
    ],
    [
      "Çay içmek giderek yaygınlaşıyor.",
      "Drinking tea is becoming more and more common.",
      "Teetrinken wird immer verbreiteter.",
      "Пить чай становится всё привычнее.",
    ],
    [
      "Şiir okumak ve yazmak eğitimli herkesin işidir.",
      "Reading and writing poetry is the business of every educated person.",
      "Gedichte zu lesen und zu schreiben ist Sache jedes Gebildeten.",
      "Читать и писать стихи — дело каждого образованного человека.",
    ],
  ],
  merchant: [
    [
      "Doğu ve Batı pazarları ayrıdır; ben Batı Pazarı'nda satarım.",
      "The East and West markets are separate; I sell in the West Market.",
      "Der Ost- und der Westmarkt sind getrennt; ich verkaufe auf dem Westmarkt.",
      "Восточный и Западный рынки разделены; я торгую на Западном.",
    ],
    [
      "İpeğimiz uzak ülkelere kadar gider.",
      "Our silk travels to distant lands.",
      "Unsere Seide gelangt bis in ferne Länder.",
      "Наш шёлк доходит до далёких стран.",
    ],
    [
      "Delikli bakır sikkeleri ipe dizip taşırız.",
      "We carry copper coins with a hole, strung on a cord.",
      "Wir tragen Kupfermünzen mit Loch, auf eine Schnur gefädelt.",
      "Медные монеты с дыркой мы носим нанизанными на шнурок.",
    ],
    [
      "Pazar memurları fiyatları ve ölçüleri denetler.",
      "Market officials check prices and measures.",
      "Marktbeamte prüfen Preise und Maße.",
      "Рыночные чиновники следят за ценами и мерами.",
    ],
    [
      "Batıdan gelen tüccarlar at, cam ve baharat satar.",
      "Merchants from the west sell horses, glass and spices.",
      "Händler aus dem Westen verkaufen Pferde, Glas und Gewürze.",
      "Купцы с запада продают коней, стекло и пряности.",
    ],
    [
      "Çinim ince ve sırlı; dikkatli taşıyın.",
      "My porcelain is fine and glazed; carry it carefully.",
      "Mein Porzellan ist fein und glasiert; tragen Sie es vorsichtig.",
      "Мой фарфор тонкий и глазурованный — несите осторожно.",
    ],
  ],
  carpenter: [
    [
      "Çatıyı tutan ahşap konsolları çivisiz birbirine geçiririz.",
      "We fit the wooden brackets that hold the roof together without nails.",
      "Die Holzkonsolen, die das Dach tragen, fügen wir ohne Nägel zusammen.",
      "Деревянные кронштейны, держащие крышу, мы соединяем без гвоздей.",
    ],
    [
      "Sütunları kırmızıya boyarız.",
      "We paint the columns red.",
      "Wir streichen die Säulen rot.",
      "Мы красим колонны в красный цвет.",
    ],
    [
      "Salonlar taş temel üzerinde ahşaptan yükselir.",
      "The halls rise in timber on a stone base.",
      "Die Hallen erheben sich aus Holz auf einem Steinsockel.",
      "Залы поднимаются из дерева на каменном основании.",
    ],
    [
      "Kiremitli çatının saçakları yukarı kıvrılır.",
      "The eaves of the tiled roof curve upward.",
      "Die Traufen des Ziegeldachs biegen sich nach oben.",
      "Карнизы черепичной крыши изгибаются вверх.",
    ],
    [
      "Kereste uzaktaki ormanlardan nehirle gelir.",
      "The timber comes by river from distant forests.",
      "Das Bauholz kommt auf dem Fluss aus fernen Wäldern.",
      "Лес сплавляют по реке из далёких лесов.",
    ],
    [
      "Sur kapılarının kuleleri de ahşaptan.",
      "The towers over the city gates are wooden too.",
      "Auch die Türme über den Stadttoren sind aus Holz.",
      "Башни над городскими воротами тоже деревянные.",
    ],
  ],
};

export const JAPANESE: WorldPool = {
  citizen: [
    [
      "Başkent Çin başkentinin planına göre kurulmuş; caddeler dik kesişir.",
      "The capital is laid out on the plan of the Chinese capital; the avenues cross at right angles.",
      "Die Hauptstadt ist nach dem Plan der chinesischen Hauptstadt angelegt; die Straßen kreuzen sich rechtwinklig.",
      "Столица построена по образцу китайской: улицы пересекаются под прямым углом.",
    ],
    [
      "Büyük tapınakta dev bir Buda heykeli var.",
      "The great temple holds a giant statue of the Buddha.",
      "Im großen Tempel steht eine riesige Buddhastatue.",
      "В большом храме стоит огромная статуя Будды.",
    ],
    [
      "Saraydaki soylular şiir yazışır.",
      "The nobles at court write poems to each other.",
      "Die Adligen am Hof schreiben einander Gedichte.",
      "Придворная знать переписывается стихами.",
    ],
    [
      "Pirinç ekeriz; vergiyi de pirinçle öderiz.",
      "We grow rice, and we pay our taxes in rice.",
      "Wir bauen Reis an und zahlen unsere Steuern in Reis.",
      "Мы выращиваем рис и рисом же платим подати.",
    ],
    [
      "Rüzgârda pagodanın çanları çınlar.",
      "The bells of the pagoda ring in the wind.",
      "Die Glöckchen der Pagode klingen im Wind.",
      "На ветру звенят колокольчики пагоды.",
    ],
    [
      "Mevsimleri izleriz; ilkbaharda çiçekleri seyretmeye çıkarız.",
      "We follow the seasons; in spring we go out to look at the blossoms.",
      "Wir achten auf die Jahreszeiten; im Frühling gehen wir die Blüten ansehen.",
      "Мы следим за временами года и весной ходим любоваться цветением.",
    ],
  ],
  merchant: [
    [
      "Doğu ve Batı pazarlarında mal satarım.",
      "I sell goods in the East and West markets.",
      "Ich verkaufe Waren auf dem Ost- und dem Westmarkt.",
      "Я торгую на Восточном и Западном рынках.",
    ],
    [
      "İpek ve kenevir kumaş en çok satılanlar.",
      "Silk and hemp cloth sell the best.",
      "Seide und Hanfstoff verkaufen sich am besten.",
      "Лучше всего продаются шёлк и пеньковая ткань.",
    ],
    [
      "Pirinç ve kumaş para yerine de geçer.",
      "Rice and cloth serve in place of money too.",
      "Reis und Stoff dienen auch als Geld.",
      "Рис и ткань тоже идут вместо денег.",
    ],
    [
      "Çin'den gelen kitaplar ve ilaçlar çok değerli.",
      "Books and medicines from China are very precious.",
      "Bücher und Arzneien aus China sind sehr kostbar.",
      "Книги и лекарства из Китая очень ценны.",
    ],
    [
      "Tuz kıyıdan gelir; dağ köylerine taşırım.",
      "Salt comes from the coast; I carry it to the mountain villages.",
      "Salz kommt von der Küste; ich bringe es in die Bergdörfer.",
      "Соль идёт с побережья, а я несу её в горные деревни.",
    ],
    [
      "Lake kaplar parlak ve hafif; saraya da satarım.",
      "Lacquered bowls are glossy and light; I sell them to the palace too.",
      "Lackschalen sind glänzend und leicht; ich verkaufe sie auch an den Palast.",
      "Лакированные чаши блестящие и лёгкие — я продаю их и ко двору.",
    ],
  ],
  carpenter: [
    [
      "Tapınağı servi ağacından yaparız; ahşap yüzyıllarca dayanır.",
      "We build the temple from cypress; the wood lasts for centuries.",
      "Wir bauen den Tempel aus Zypressenholz; es hält Jahrhunderte.",
      "Мы строим храм из кипариса — дерево служит веками.",
    ],
    [
      "Parçalar çivisiz, geçmelerle birleşir.",
      "The pieces join with joints, without nails.",
      "Die Teile werden ohne Nägel mit Verbindungen gefügt.",
      "Детали соединяются врубками, без гвоздей.",
    ],
    [
      "Pagodanın ortasındaki direk yapıyı dengeler.",
      "The central pillar of the pagoda keeps the building steady.",
      "Der Mittelpfeiler der Pagode hält das Gebäude im Gleichgewicht.",
      "Центральный столб пагоды придаёт зданию устойчивость.",
    ],
    [
      "Çatıların kenarları zarifçe yukarı kıvrılır.",
      "The roof edges curve gracefully upward.",
      "Die Dachränder schwingen sich anmutig nach oben.",
      "Края крыш изящно загибаются вверх.",
    ],
    [
      "Kirişleri kırmızıya, duvarları beyaza boyarız.",
      "We paint the beams red and the walls white.",
      "Wir streichen die Balken rot und die Wände weiß.",
      "Балки мы красим в красный, а стены — в белый.",
    ],
    [
      "Ustalarımızın çoğu işi denizin öbür yakasından öğrendi.",
      "Many of our master builders learned the craft from across the sea.",
      "Viele unserer Baumeister haben das Handwerk von jenseits des Meeres gelernt.",
      "Многие наши мастера научились ремеслу у тех, кто за морем.",
    ],
  ],
};
