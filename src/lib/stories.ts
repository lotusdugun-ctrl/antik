import type { Localized } from "@/lib/i18n";
import { moreStories } from "@/lib/stories-more";
import { registerTranslations } from "@/lib/i18n";
import { tm as translations } from "@/lib/locales/tm-stories";

/**
 * "A day in antiquity": short branching stories, one per site.
 *
 * The people are invented and say so; the world they move through is not.
 * Every scene that leans on the record carries a `history` note saying what
 * the record actually says — and, where scholars disagree, that they do — so
 * a reader can always tell the scene from the source. Nothing in a note may
 * be stronger than what is known: "according to Acts", "some researchers
 * argue", never a guess written as a fact.
 */
export type Choice = { label: Localized; to: string };

export type Scene = {
  text: Localized;
  history?: Localized;
  /** Empty on an ending. */
  choices: Choice[];
  ending?: { title: Localized; kind: "good" | "bittersweet" | "hard" };
};

export type Story = {
  id: string;
  siteSlug: string;
  title: Localized;
  /** Who you are. */
  role: Localized;
  period: Localized;
  blurb: Localized;
  start: string;
  scenes: Record<string, Scene>;
};

const l = (tr: string, en: string): Localized => ({ tr, en });
const go = (tr: string, en: string, to: string): Choice => ({ label: l(tr, en), to });

const firstStories: Story[] = [
  /* ————————————————————————— Ephesus ————————————————————————— */
  {
    id: "efes-gumuscu-ciragi",
    siteSlug: "efes",
    title: l("Gümüşçünün Çırağı", "The Silversmith's Apprentice"),
    role: l(
      "Demetrios'un atölyesinde çalışan genç bir çırak",
      "A young apprentice in Demetrius' workshop",
    ),
    period: l("MS 50'lerin ortası", "Mid-50s AD"),
    blurb: l(
      "Artemis'in gümüş tapınakçıklarını döken atölyede işler bozuluyor. Kentte yeni bir öğretmen konuşuyor ve ustan öfkeli. Bir gün içinde kentin en büyük tiyatrosu dolacak.",
      "Business is falling off at the workshop that casts Artemis' little silver shrines. A new teacher is preaching in the city and your master is furious. Before the day is out, the city's greatest theatre will be full.",
    ),
    start: "atolye",
    scenes: {
      atolye: {
        text: l(
          "Sabah. Ocak çoktan yanıyor; kalıplardan çıkan küçük gümüş tapınaklar tezgâhta parlıyor — Artemis, nişinin içinde, hacıların eve götüreceği boyda. Ustan Demetrios ise bugün tek bir parçaya bakmıyor. 'Satışlar düştü,' diyor, 'şu Pavlus denen adam elle yapılan tanrının tanrı olmadığını söylüyor. Bütün zanaatkârları topla.'",
          "Morning. The furnace is already lit; little silver temples fresh from their moulds gleam on the bench — Artemis in her niche, sized for a pilgrim to carry home. But your master Demetrius won't look at a single piece today. 'Sales are down,' he says. 'This man Paul is telling people that gods made by hands are no gods at all. Gather every craftsman you can find.'",
        ),
        history: l(
          "Elçilerin İşleri 19. bölüme göre Demetrios adlı bir gümüşçü 'Artemis'in gümüş tapınakçıklarını' yapıyor ve zanaatkârlara iyi kazanç sağlıyordu. Pavlus'un vaazlarının hem işlerini hem de tapınağın itibarını tehdit ettiğini söyleyerek onları topladı.",
          "According to Acts 19, a silversmith named Demetrius made 'silver shrines of Artemis' and brought good business to the craftsmen. He gathered them, saying Paul's preaching threatened both their trade and the temple's standing.",
        ),
        choices: [
          go(
            "Ustanın dediğini yap, zanaatkârları çağır",
            "Do as you're told and fetch the craftsmen",
            "toplanti",
          ),
          go(
            "Önce şu Pavlus'u kendin dinlemeye git",
            "First go and hear this Paul for yourself",
            "tyrannos",
          ),
        ],
      },
      tyrannos: {
        text: l(
          "Öğle sıcağında, Tyrannos'un okulunda küçük bir kalabalık. Konuşan adam yorgun ama sesi net. Kimseyi kışkırtmıyor; yalnızca anlatıyor. Arkalarda birkaç kişi, evlerinden getirdikleri büyü kitaplarını yakmaktan söz ediyor. Atölyeye döndüğünde sokaklar kaynıyor.",
          "In the midday heat, a small crowd at the school of Tyrannus. The man speaking is tired but clear. He isn't stirring anyone up; he is simply explaining. At the back, a few people talk of burning the books of magic they have brought from home. When you get back to the workshop, the streets are boiling over.",
        ),
        history: l(
          "Elçilerin İşleri'ne göre Pavlus iki yıl boyunca 'Tyrannos'un okulunda' her gün konuştu; birçok Efesli büyü kitaplarını herkesin önünde yaktı. Kitapların değeri elli bin gümüş olarak verilir.",
          "Acts says Paul spoke daily for two years 'in the lecture hall of Tyrannus', and that many Ephesians burned their books of magic in public — valued, it says, at fifty thousand pieces of silver.",
        ),
        choices: [go("Kalabalığın peşinden git", "Follow the crowd", "toplanti")],
      },
      toplanti: {
        text: l(
          "Demetrios bir tezgâhın üstüne çıkmış: 'Yalnızca işimiz değil, büyük tanrıça Artemis'in tapınağı da hiçe sayılacak! Bütün Asya'nın, bütün dünyanın taptığı tanrıça!' Biri bağırıyor: 'Efeslilerin Artemis'i uludur!' Bir anda herkes bağırıyor ve kalabalık Liman Caddesi'nden tiyatroya doğru akmaya başlıyor.",
          "Demetrius has climbed onto a bench: 'Not only our trade — the temple of the great goddess Artemis will be counted as nothing! The goddess all Asia and the world worship!' Someone shouts, 'Great is Artemis of the Ephesians!' In a moment everyone is shouting, and the crowd begins to pour down towards the theatre.",
        ),
        history: l(
          "Demetrios'un konuşması ve 'Efeslilerin Artemis'i uludur!' haykırışı Elçilerin İşleri 19:25-28'de geçer. Kalabalık, Pavlus'un yol arkadaşları Makedonyalı Gaius ile Aristarkhos'u yakalayıp tiyatroya sürükler.",
          "Demetrius' speech and the cry 'Great is Artemis of the Ephesians!' are in Acts 19:25-28. The crowd seizes Paul's travelling companions, Gaius and Aristarchus of Macedonia, and drags them into the theatre.",
        ),
        choices: [
          go("Kalabalıkla tiyatroya koş", "Run with the crowd to the theatre", "tiyatro"),
          go(
            "Atölyede kalıp kalıpları kilitle",
            "Stay behind and lock up the moulds",
            "atolye-yalniz",
          ),
        ],
      },
      "atolye-yalniz": {
        text: l(
          "Atölye birden sessiz. Uzaktan, tiyatronun çanağından yükselen uğultu dalga dalga geliyor; bir saat, sonra bir saat daha. Tezgâhtaki küçük Artemis'lere bakıyorsun. Kimin haklı olduğunu bilmiyorsun ama bu kadar insanın aynı cümleyi iki saat boyunca bağırmasının bir sebebi olmalı.",
          "Suddenly the workshop is quiet. From far off, the roar rising out of the theatre's bowl comes in waves — an hour, then another. You look at the little Artemises on the bench. You don't know who is right, but there must be a reason so many people shout the same sentence for two hours.",
        ),
        choices: [
          go("Dayanamayıp tiyatroya git", "You can't stand it — go to the theatre", "tiyatro-gec"),
        ],
      },
      tiyatro: {
        text: l(
          "Yamaçtaki dev çanak tıklım tıklım. Çoğu kişi neden orada olduğunu bile bilmiyor — Elçilerin İşleri de bunu söyler. Sahnenin önünde iki yabancı, Gaius ve Aristarkhos, itilip kakılıyor. İskender adında biri konuşmak için öne itiliyor; Yahudi olduğu anlaşılınca ses bastırılıyor: 'Efeslilerin Artemis'i uludur!'",
          "The vast bowl on the hillside is packed. Most people don't even know why they are there — Acts says as much. In front of the stage two strangers, Gaius and Aristarchus, are being shoved about. A man named Alexander is pushed forward to speak; when they realise he is a Jew, the noise drowns him: 'Great is Artemis of the Ephesians!'",
        ),
        history: l(
          "Elçilerin İşleri 19:32-34: 'Topluluk karışıklık içindeydi; çoğu neden toplandığını bilmiyordu.' İskender'in konuşma girişimi ve iki saat süren haykırış burada anlatılır. Tiyatro yaklaşık 24.000 kişilikti.",
          "Acts 19:32-34: 'The assembly was in confusion; most did not know why they had come together.' Alexander's attempt to speak and the two-hour chant are told here. The theatre seated about 24,000.",
        ),
        choices: [
          go("Sen de bağır — ustan seni görüyor", "Shout along — your master is watching", "bagir"),
          go(
            "Sus ve iki yabancının yanına sokul",
            "Keep quiet and edge towards the two strangers",
            "yabancilar",
          ),
        ],
      },
      "tiyatro-gec": {
        text: l(
          "Vardığında haykırış hâlâ sürüyor ama sesler kısılmış, ayaklar yorulmuş. Sahne binasının önünde, mor kenarlı giysisiyle kentin yazmanı ayağa kalkıyor ve eliyle susun işareti yapıyor.",
          "When you arrive the chant is still going, but voices are hoarse and feet are tired. In front of the stage building, the town clerk rises in his bordered robe and signals for silence.",
        ),
        choices: [go("Dinle", "Listen", "yazman")],
      },
      bagir: {
        text: l(
          "Sesin ötekilere karışıyor; bir süre sonra kendi sesini duymuyorsun bile. Bir saat geçiyor. Boğazın yanıyor. Sonunda kentin yazmanı sahne önüne çıkıyor ve kalabalık, belki yalnızca yorgunluktan, susuyor.",
          "Your voice melts into the others; after a while you can't even hear it. An hour goes by. Your throat burns. At last the town clerk steps out in front of the stage and the crowd falls silent — perhaps from nothing more than exhaustion.",
        ),
        choices: [go("Dinle", "Listen", "yazman")],
      },
      yabancilar: {
        text: l(
          "Aristarkhos'un dudağı patlamış. Göz göze geliyorsunuz. Kimse sana bakmıyor; elindeki su kabını ona uzatıyorsun. Teşekkür etmiyor, sadece başını eğiyor. O sırada çanak birden susuyor: kentin yazmanı konuşacak.",
          "Aristarchus' lip is split. Your eyes meet. No one is watching you, so you hand him your water flask. He doesn't thank you; he only bows his head. Just then the bowl falls silent: the town clerk is going to speak.",
        ),
        choices: [go("Dinle", "Listen", "yazman-yakin")],
      },
      yazman: {
        text: l(
          "'Efesliler! Kentimizin büyük Artemis'in tapınağının bekçisi olduğunu bilmeyen var mı? Bu adamlar ne tapınak soyguncusu ne de tanrıçamıza küfredenler. Demetrios'un bir şikâyeti varsa mahkemeler açık, prokonsüller var. Bugünkü kargaşa yüzünden isyanla suçlanma tehlikesindeyiz.' Kalabalık dağılıyor. Akşam Demetrios atölyeye sessizce dönüyor; ertesi sabah ocak yine yanacak.",
          "'Men of Ephesus! Who does not know that our city is guardian of the temple of the great Artemis? These men are neither temple robbers nor blasphemers of our goddess. If Demetrius has a complaint, the courts are open and there are proconsuls. We are in danger of being charged with rioting because of today.' The crowd breaks up. That evening Demetrius walks back to the workshop in silence; tomorrow the furnace will be lit again.",
        ),
        history: l(
          "Yazmanın (grammateus) konuşması Elçilerin İşleri 19:35-41'dedir: davaların mahkemelere ve prokonsüllere götürülmesini, kentin Roma'ya karşı isyanla suçlanabileceğini söyler. Pavlus kısa süre sonra Efes'ten ayrılır.",
          "The clerk's (grammateus) speech is Acts 19:35-41: he tells them to take charges to the courts and proconsuls, and warns that the city could be accused of rioting. Paul leaves Ephesus soon afterwards.",
        ),
        choices: [],
        ending: {
          title: l("Ocak yine yanacak", "The furnace will be lit again"),
          kind: "bittersweet",
        },
      },
      "yazman-yakin": {
        text: l(
          "Yazman kalabalığı mahkemelere, prokonsüllere, Roma'nın sabrına havale ediyor; kalabalık homurdanarak dağılıyor. Gaius ile Aristarkhos itilip kakılmadan çıkıp gidiyor. Kapıdan çıkarken Aristarkhos dönüp sana bakıyor. Yıllar sonra, atölyenin sahibi olduğunda, tezgâhında hep bir parça gümüşü dökülmeden bırakacaksın — neden olduğunu kimseye anlatmadan.",
          "The clerk hands the crowd over to the courts, the proconsuls, Rome's patience; it disperses, grumbling. Gaius and Aristarchus walk out unharmed. At the gate Aristarchus turns and looks at you. Years later, when the workshop is yours, you will always leave one piece of silver on the bench uncast — without ever telling anyone why.",
        ),
        history: l(
          "Aristarkhos Pavlus'un mektuplarında yeniden anılır (Koloseliler 4:10, Filimon 24) ve onunla Roma'ya kadar gider. Efes Artemision'u ise MS 262'de Gotlarca yağmalanana dek kentin kalbi olarak kaldı.",
          "Aristarchus appears again in Paul's letters (Colossians 4:10, Philemon 24) and travels with him as far as Rome. The Artemision remained the heart of Ephesus until the Goths sacked it in AD 262.",
        ),
        choices: [],
        ending: { title: l("Dökülmemiş gümüş", "The uncast silver"), kind: "good" },
      },
    },
  },

  /* ————————————————————————— Aspendos ————————————————————————— */
  {
    id: "aspendos-acilis",
    siteSlug: "aspendos",
    title: l("Açılış Günü", "Opening Day"),
    role: l(
      "Mimar Zenon'un ekibinde genç bir taş ustası",
      "A young mason on the architect Zeno's crew",
    ),
    period: l("Marcus Aurelius dönemi, MS 160'lar-170'ler", "Under Marcus Aurelius, AD 160s-170s"),
    blurb: l(
      "Tiyatro bitmek üzere. Yarın kentin tanrılarına ve imparator ailesine adanacak. Ama sahne duvarında bir sorun var ve tenteyi taşıyacak direkler henüz denenmedi.",
      "The theatre is nearly finished. Tomorrow it will be dedicated to the gods of the city and the imperial house. But there is a problem in the stage wall, and the masts that will carry the awning have not yet been tried.",
    ),
    start: "sahne",
    scenes: {
      sahne: {
        text: l(
          "Gün doğarken iskelenin tepesindesin. Aşağıda, çanağın en üst sırasından bakan bir kadın sana el sallıyor — sesin oradan nasıl taşındığını deniyorlar. Usta Zenon yanına tırmanıyor: 'İkinci kattaki alınlıklardan birinin bloğu çatlak. Ya değiştiririz ya da yarın kimse fark etmesin diye dua ederiz.'",
          "At dawn you are at the top of the scaffolding. Below, a woman on the highest row of the bowl waves to you — they are testing how a voice carries up there. Master Zeno climbs up beside you: 'One of the blocks in a second-storey pediment is cracked. Either we replace it, or we pray no one notices tomorrow.'",
        ),
        history: l(
          "Tiyatronun yazıtları mimarı Theodoros oğlu Zenon olarak anar ve yapıyı Curtius Crispinus ile Curtius Auspicatus kardeşlerin, kentin tanrılarına ve imparator ailesine adadığını söyler. Yapım Marcus Aurelius dönemine tarihlenir.",
          "The theatre's inscriptions name its architect as Zeno son of Theodorus and record that the brothers Curtius Crispinus and Curtius Auspicatus dedicated it to the gods of the city and the imperial house. It dates to the reign of Marcus Aurelius.",
        ),
        choices: [
          go(
            "Bloğu değiştirelim — bütün gün sürse de",
            "Replace the block, even if it takes all day",
            "blok",
          ),
          go(
            "Çatlağı harçla gizleyelim, direkleri deneyelim",
            "Hide the crack with mortar and test the masts",
            "direkler",
          ),
        ],
      },
      blok: {
        text: l(
          "Yeni bloğu vinçle kaldırmak öğleni buluyor. Halat gıcırdıyor, dişli çark tıkırdıyor; sekiz adam büyük tekerleğin içinde yürüyor. Blok yerine oturduğunda Zenon tek kelime etmiyor, yalnızca omzuna vuruyor. Güneş tepede. Tente direkleri hâlâ denenmedi.",
          "Hoisting the new block takes until noon. The rope creaks, the gear wheel clicks; eight men walk inside the great treadwheel. When the block settles into place Zeno says nothing; he only claps your shoulder. The sun is overhead. The awning masts are still untested.",
        ),
        history: l(
          "Roma inşaatçıları ağır blokları içinde insanların yürüdüğü tekerlekli vinçlerle (polyspastos) kaldırırdı. Aspendos'un sahne duvarı iki katlı sütun düzeniyle bugün de neredeyse tam yüksekliğinde ayaktadır.",
          "Roman builders lifted heavy blocks with treadwheel cranes (polyspastos) that men walked inside. Aspendos' stage wall, with its two storeys of columns, still stands almost to its full height.",
        ),
        choices: [go("Direkleri denemeye koş", "Hurry to test the masts", "direkler")],
      },
      direkler: {
        text: l(
          "Çanağın en üstünde, dış duvarın taş konsollarına oturan ahşap direkler sıra sıra yükseliyor. Denizciler — tenteyi gerecek olanlar onlar — halatları çekiyor. Rüzgâr Eurymedon vadisinden geliyor ve büyük keten bez bir yelken gibi doluyor. Bir direk inliyor.",
          "Along the top of the bowl, wooden masts rise in a row, seated in the stone brackets on the outer wall. Sailors — they are the ones who will rig the awning — haul the ropes. The wind comes up the Eurymedon valley and the great linen sheet fills like a sail. One mast groans.",
        ),
        history: l(
          "Roma tiyatrolarında seyirciyi güneşten koruyan tente (velarium) dış duvardaki konsollara oturan direklere gerilirdi; Roma'da bu işi donanma denizcilerinin yaptığı bilinir. Aspendos'ta bu konsollar bugün de görülür.",
          "Roman theatres shaded their audience with an awning (velarium) stretched from masts seated in brackets on the outer wall; in Rome, sailors from the fleet are known to have rigged it. At Aspendos the brackets can still be seen.",
        ),
        choices: [
          go("İnleyen direği hemen indirt", "Have the groaning mast taken down at once", "indir"),
          go("Halatları gevşet, yükü dağıt", "Slacken the ropes and spread the load", "gevset"),
        ],
      },
      indir: {
        text: l(
          "Direği indiriyorlar; dibi çürümüş. Yarın tentenin bir köşesi eksik kalacak ve bir dilim seyirci güneşte oturacak. Zenon kaşlarını çatıyor ama başını sallıyor: 'Bir köşe güneş, bir ölüden iyidir.'",
          "They lower the mast; its foot has rotted. Tomorrow one corner of the awning will be missing and a wedge of the audience will sit in the sun. Zeno frowns, but nods: 'A corner of sun is better than a corpse.'",
        ),
        choices: [go("Ertesi gün: açılış", "The next day: the opening", "acilis")],
      },
      gevset: {
        text: l(
          "Halatlar gevşeyince direğin inlemesi duruyor. Ama gece rüzgâr dönüyor ve sabah direğin konsolunda ince bir çatlak beliriyor. Kimse görmüyor. Bunu yalnızca sen biliyorsun.",
          "Once the ropes slacken, the mast stops groaning. But in the night the wind turns, and by morning a hairline crack shows in the mast's bracket. No one sees it. Only you know.",
        ),
        choices: [
          go("Zenon'a söyle", "Tell Zeno", "indir"),
          go(
            "Sus — yarın her şey yolunda gidecek",
            "Say nothing — tomorrow will be fine",
            "acilis-risk",
          ),
        ],
      },
      acilis: {
        text: l(
          "Çanak doluyor. Rahipler kurban sunuyor, yazıt okunuyor: kentin tanrılarına ve imparator ailesine. Sahnede bir pantomim dansçısı tek başına bütün bir efsaneyi anlatıyor ve en üst sırada oturan kadın her nefesi duyuyor. Gölgede kalan seyirciler, güneşte oturan dilime şakayla su atıyor.",
          "The bowl fills. Priests make sacrifice, the inscription is read out: to the gods of the city and the imperial house. On stage, a single pantomime dancer tells a whole myth alone, and the woman on the top row hears every breath. The people in the shade flick water, joking, at the wedge sitting in the sun.",
        ),
        history: l(
          "Aspendos tiyatrosu akustiğiyle ünlüdür ve bugün de konser ve opera için kullanılır. Selçuklu döneminde bir kervansaray ve saray olarak kullanılması onun bu kadar sağlam kalmasının bir nedeni sayılır.",
          "The theatre at Aspendos is famous for its acoustics and is still used for concerts and opera. Its use as a caravanserai and palace in the Seljuk period is counted among the reasons it survives so complete.",
        ),
        choices: [],
        ending: { title: l("Bir köşe güneş", "A corner of sun"), kind: "good" },
      },
      "acilis-risk": {
        text: l(
          "Gösterinin ortasında bir çatırtı. Direk yan yatıyor, tentenin bir kanadı çanağın üstüne çöküyor; insanlar çığlıklarla kaçışıyor. Kimse ölmüyor — denizciler halatı son anda yakalıyor. Ama ertesi gün Zenon'un yüzüne bakamıyorsun ve o yaz iskeleye bir daha çıkmıyorsun.",
          "Halfway through the performance, a crack. The mast keels over and one wing of the awning collapses onto the bowl; people scatter screaming. No one dies — the sailors catch the rope at the last moment. But the next day you can't look Zeno in the face, and that summer you never climb the scaffold again.",
        ),
        history: l(
          "Kalabalık yapılardaki kazalar antik kaynaklarda bilinir: Tacitus, MS 27'de Fidenae'de çöken ahşap bir amfitiyatroda binlerce kişinin öldüğünü yazar. Aspendos'ta böyle bir olay bilinmiyor; bu sahne kurgudur.",
          "Disasters in crowded buildings are known from the ancient sources: Tacitus records thousands killed when a wooden amphitheatre collapsed at Fidenae in AD 27. No such event is known at Aspendos; this scene is fiction.",
        ),
        choices: [],
        ending: { title: l("Söylenmemiş çatlak", "The crack left unspoken"), kind: "hard" },
      },
    },
  },

  /* ————————————————————————— Göbeklitepe ————————————————————————— */
  {
    id: "gobeklitepe-buyuk-toplanti",
    siteSlug: "gobeklitepe",
    title: l("Büyük Toplanma", "The Great Gathering"),
    role: l(
      "Ceylan sürülerini izleyen bir avcı topluluğundan genç biri",
      "A young member of a band that follows the gazelle herds",
    ),
    period: l("Yaklaşık MÖ 9500", "About 9500 BC"),
    blurb: l(
      "Yaz sonu. Uzak vadilerden topluluklar tepeye geliyor: taş kesilecek, et paylaşılacak, ölüler anılacak. Bu yıl sana ilk kez bir dikili taşın başında yer verilecek.",
      "Late summer. Bands from distant valleys are coming to the hill: stone will be cut, meat shared, the dead remembered. This year, for the first time, you will be given a place at one of the standing stones.",
    ),
    start: "yolculuk",
    scenes: {
      yolculuk: {
        text: l(
          "Üç gündür yürüyorsunuz. Ovada ceylan sürüleri kuzeye akıyor. Tepeye yaklaştıkça başka grupların dumanlarını görüyorsun. Annen sırtındaki torbada yabani buğday taşıyor; baban, çakmaktaşı uçlu mızrakları. 'Bu yıl,' diyor annen, 'büyük taşı sen de çekeceksin.'",
          "You have been walking for three days. On the plain, herds of gazelle stream north. As you near the hill you see the smoke of other bands. Your mother carries wild wheat in the bag on her back; your father, the flint-tipped spears. 'This year,' your mother says, 'you'll haul the great stone too.'",
        ),
        history: l(
          "Göbeklitepe'deki hayvan kemiklerinin büyük kısmı ceylana aittir; yaban sığırı, yaban domuzu ve yaban eşeği de vardır. Kazı ekibi alanın, büyük toplanmaların ve şölenlerin yapıldığı bir yer olduğunu öne sürmüştür. Yakın dönem çalışmalar burada konutlar da olduğunu, yani alanın yalnızca bir tapınak olmadığını göstermiştir.",
          "Most of the animal bone at Göbeklitepe is gazelle; aurochs, wild boar and wild ass are also present. The excavators proposed it was a place of large gatherings and feasts. More recent work has found dwellings too — the site was not only a sanctuary.",
        ),
        choices: [
          go(
            "Ceylanları izle — şölen için av getir",
            "Track the gazelles — bring meat for the feast",
            "av",
          ),
          go("Doğruca taş ocağına git", "Go straight to the quarry", "tasocagi"),
        ],
      },
      av: {
        text: l(
          "Avcılar çukur bir vadiye doğru sürüyü yönlendiriyor; taş duvarlar ceylanları daralan bir geçide sıkıştırıyor. Sen, kanatlardan birinde, bağırıyor ve kollarını sallıyorsun. Akşam yedi ceylanla dönüyorsunuz. Tepede ateşler yanıyor ve büyük taş teknelerde bir şey kaynıyor — keskin, ekşimsi bir koku.",
          "The hunters drive the herd towards a hollow valley; stone walls squeeze the gazelles into a narrowing pass. Out on one wing, you shout and wave your arms. By evening you come back with seven. Fires burn on the hill, and something is brewing in the great stone basins — a sharp, sourish smell.",
        ),
        history: l(
          "Bölgede ceylanların toplu avlandığı, uzun taş duvarlı tuzaklar ('çöl uçurtmaları') bilinir, ancak bunların bir kısmı daha geç dönemlere tarihlenir. Göbeklitepe'deki büyük kireçtaşı teknelerde bulunan kalıntılar bazı araştırmacılarca tahıl fermantasyonuyla ilişkilendirilmiştir; bu yorum tartışmalıdır.",
          "Long stone-walled traps for mass gazelle hunting ('desert kites') are known in the region, though many date later. Residues in Göbeklitepe's large limestone basins have been linked by some researchers to fermenting grain; the interpretation is debated.",
        ),
        choices: [go("Ateşin başına otur", "Sit down by the fire", "ates")],
      },
      tasocagi: {
        text: l(
          "Tepenin kireçtaşı kayasında yarı oyulmuş bir dikili taş yatıyor; senin boyunun üç katı. Yaşlılar çakmaktaşı kalemlerle kenarını oyuyor. Biri sana bir kalem uzatıyor: 'Taşın yüzünde ne olacağına sen karar ver.'",
          "In the hill's limestone bedrock lies a half-cut standing stone, three times your height. The elders are chipping at its edge with flint picks. One of them hands you a pick: 'You decide what will be on the stone's face.'",
        ),
        history: l(
          "Göbeklitepe'nin T biçimli dikili taşları tepenin kendi kireçtaşından kesilmiştir; çevredeki ana kayada yarım kalmış taşlar ve ocak izleri görülür. En büyük bitmemiş taşın yaklaşık 7 metre uzunluğunda olduğu tahmin edilir.",
          "Göbeklitepe's T-shaped pillars were cut from the hill's own limestone; unfinished pillars and quarry traces can be seen in the bedrock around it. The largest unfinished one is estimated at about 7 metres long.",
        ),
        choices: [go("Bir tilki", "A fox", "tilki"), go("Bir akbaba", "A vulture", "akbaba")],
      },
      tilki: {
        text: l(
          "Tilkiyi kazıyorsun: dişleri açık, kuyruğu kalkık, sıçramaya hazır. Yaşlılardan biri gülümsüyor. 'Tilki kurnazdır,' diyor, 'ölüler ile diriler arasındaki çitin üstünden atlar.' Akşam ateşin başına dönüyorsun.",
          "You carve the fox: teeth bared, tail up, ready to spring. One of the elders smiles. 'The fox is cunning,' she says. 'It leaps the fence between the dead and the living.' In the evening you go back to the fire.",
        ),
        history: l(
          "Tilki, Göbeklitepe kabartmalarında en sık görülen hayvandır. D yapısındaki 18 numaralı dikili taşta, insan biçimli figürün kemerinden sarkan bir tilki postu görülür.",
          "The fox is the animal most often shown in Göbeklitepe's reliefs. On Pillar 18 in Enclosure D, a fox pelt hangs from the human-like figure's belt.",
        ),
        choices: [go("Ateşin başına otur", "Sit down by the fire", "ates")],
      },
      akbaba: {
        text: l(
          "Akbabayı kazıyorsun: kanatları açık, pençesinde yuvarlak bir şey. Yaşlı kadın uzun süre bakıyor. 'Ölüleri gökyüzüne o taşır,' diyor sonunda. 'İyi düşünmüşsün.' Akşam ateşin başına dönüyorsun.",
          "You carve the vulture: wings spread, something round in its claws. The old woman looks for a long time. 'It is the one that carries the dead into the sky,' she says at last. 'You chose well.' In the evening you go back to the fire.",
        ),
        history: l(
          "D yapısındaki 43 numaralı dikili taş ('Akbaba Taşı'), kanadının altında bir daire tutan akbaba kabartmasıyla bilinir. Akbabanın ölü gömme pratikleriyle ilişkili olabileceği öne sürülmüştür; anlamı kesin bilinmiyor.",
          "Pillar 43 in Enclosure D, the 'Vulture Stone', is known for a vulture holding a disc beneath its wing. A link with treatment of the dead has been suggested; its meaning is not known for certain.",
        ),
        choices: [go("Ateşin başına otur", "Sit down by the fire", "ates")],
      },
      ates: {
        text: l(
          "Gece, halkanın içinde iki büyük taş karşı karşıya duruyor; kolları gövdelerini sarıyor, elleri karınlarında birleşiyor. Ateş ışığında yüzleri olmayan ama insan oldukları belli devler. Biri şarkı söylüyor. Ertesi gün taşı çekmek için ip yapılacak; ya da sen, ilk kez, ölülerin anıldığı yere çağrılacaksın.",
          "At night, inside the ring, two great stones face each other; arms wrap their bodies, hands meeting at the belly. In the firelight they are giants without faces, plainly human. Someone sings. Tomorrow rope will be made to haul the stone — or you will be called, for the first time, to where the dead are remembered.",
        ),
        history: l(
          "Yapıların ortasındaki iki büyük T biçimli taş (D yapısında 18 ve 31 numaralı) kollar, eller, kemer ve peştamal kabartmalarıyla insan ya da insan benzeri varlıkları temsil eder. Yüzleri yoktur.",
          "The two great central T-pillars (Pillars 18 and 31 in Enclosure D) carry arms, hands, belts and loincloths in relief — they represent humans or human-like beings. They have no faces.",
        ),
        choices: [
          go("İp örmeye katıl", "Join the rope-making", "ip"),
          go("Ölülerin anıldığı yere git", "Go to where the dead are remembered", "anma"),
        ],
      },
      ip: {
        text: l(
          "Sabahtan akşama dek lif büküyorsunuz. Yüzlerce kişi taşın önüne diziliyor ve taş, tahta kızaklar üstünde, bir parmak, bir karış, bir adım ilerliyor. Akşam taş hâlâ yolun yarısında. Ama ertesi yıl döndüğünde onu halkada, ayakta bulacaksın — ve yüzünde senin hayvanın olacak.",
          "From morning to evening you twist fibre. Hundreds line up before the stone, and on wooden runners it moves a finger, a hand's breadth, a step. By evening it is still halfway. But when you come back next year you will find it standing in the ring — with your animal on its face.",
        ),
        choices: [],
        ending: { title: l("Ayakta bir taş", "A stone standing"), kind: "good" },
      },
      anma: {
        text: l(
          "Yaşlılar seni bir kenara, kafataslarının durduğu yere götürüyor. Birinin üstünde ince oyuklar var; büyükannen. Kimse bir şey söylemiyor. Ateş sönerken anlıyorsun: buraya yalnızca et ve taş için gelinmiyor. Gelecek yıl da geleceksin; ondan sonraki yıl da — bir gün biri seni de anana dek.",
          "The elders take you aside, to where the skulls are kept. One has fine grooves cut into it: your grandmother. No one says anything. As the fire dies you understand: people don't come here only for meat and stone. You'll come next year, and the year after — until one day someone remembers you too.",
        ),
        history: l(
          "Göbeklitepe'de üzerinde kesik oluklar bulunan insan kafatası parçaları bulunmuştur (Gresky vd., 2017); bunların bir tür kafatası kültüyle ilişkili olabileceği düşünülür. Kesin anlamı bilinmiyor.",
          "Fragments of human skulls with carved grooves were found at Göbeklitepe (Gresky et al., 2017); they are thought to relate to some kind of skull cult. Their exact meaning is unknown.",
        ),
        choices: [],
        ending: { title: l("Anılanlar", "The remembered"), kind: "bittersweet" },
      },
    },
  },

  /* ————————————————————————— Pergamon ————————————————————————— */
  {
    id: "pergamon-asklepion-gecesi",
    siteSlug: "pergamon",
    title: l("Asklepion'da Bir Gece", "A Night at the Asklepion"),
    role: l(
      "Bacağı iyileşmeyen yaralı bir gladyatör",
      "A wounded gladiator whose leg will not heal",
    ),
    period: l("Yaklaşık MS 158", "About AD 158"),
    blurb: l(
      "Arenada aldığın yara iltihaplandı. Asya'nın başrahibinin gladyatörlerine yeni, genç bir hekim atandı: kentin kendi çocuğu Galenos. Ama sen önce tanrıya gitmek istiyorsun.",
      "The wound you took in the arena has turned bad. The high priest of Asia's gladiators have a new, young physician — a son of the city named Galen. But you want to go to the god first.",
    ),
    start: "yol",
    scenes: {
      yol: {
        text: l(
          "Kutsal Yol'un sütunları arasında topallayarak yürüyorsun. Önünde Asklepion'un propylonu, ardında akropol ve tiyatronun baş döndürücü yamacı. Kapıda bir rahip yolunu kesiyor: 'Tanrıya gelen önce arınır. Kutsal pınardan iç, yıkan, sonra uyku salonuna geç.'",
          "You limp between the columns of the Sacred Way. Ahead is the gateway of the Asklepion; behind you, the acropolis and the dizzying slope of its theatre. At the gate a priest bars your way: 'Whoever comes to the god is purified first. Drink from the sacred spring, wash, then go to the hall of sleep.'",
        ),
        history: l(
          "Pergamon Asklepion'u, Tıp tanrısı Asklepios'un antik dünyadaki en ünlü kutsal alanlarından biriydi. Kutsal Yol kenti Asklepion'a bağlar. Hastalar kutsal kaynakta arınır, tapınakta 'enkoimesis' denen kutsal uykuya yatardı.",
          "The Asklepion of Pergamon was one of the most famous sanctuaries of Asclepius, god of medicine. The Sacred Way linked it with the city. Patients purified themselves at the sacred spring and slept in the temple in 'incubation' (enkoimesis).",
        ),
        choices: [
          go("Rahibin dediğini yap", "Do as the priest says", "pinar"),
          go("Geri dön, genç hekimi bul", "Turn back and find the young physician", "galenos"),
        ],
      },
      pinar: {
        text: l(
          "Su buz gibi. Sonra rahip seni tonozlu bir tünele götürüyor; tavandaki açıklıklardan ay ışığı süzülüyor, duvarların içinden akan suyun sesi geliyor. 'Burada yürürken tanrı seni duyar,' diyor. Tünelin sonundaki yuvarlak yapıda samanlar serilmiş; onlarca hasta uyumaya çalışıyor.",
          "The water is ice-cold. Then the priest leads you into a vaulted tunnel; moonlight filters through openings in the roof, and you hear water running inside the walls. 'While you walk here, the god hears you,' he says. In the round building at the tunnel's end straw is spread out; dozens of the sick are trying to sleep.",
        ),
        history: l(
          "Asklepion'daki yaklaşık 80 metrelik yeraltı tüneli (kriptoportik) kutsal pınarı iki katlı yuvarlak tedavi yapısına bağlar. Tavanındaki açıklıklar ışık ve hava sağlar. Bu yapının tedavideki rolü hakkındaki bazı ayrıntılar yorumdur.",
          "The Asklepion's underground tunnel, about 80 metres long (a cryptoporticus), links the sacred spring with the two-storey round treatment building. Openings in its roof let in light and air. Some details of its role in treatment are interpretation.",
        ),
        choices: [go("Uzan ve gözlerini kapat", "Lie down and close your eyes", "ruya")],
      },
      ruya: {
        text: l(
          "Rüyanda bir yılan bacağına dolanıyor, sonra bir el yaranın üstüne sıcak bir şey bastırıyor. Sabah bir rahip rüyanı dinliyor ve yorumluyor: 'Tanrı, yaranın kesilip temizlenmesini ve şarapla yıkanmasını istiyor. Bunu yapacak eli de tanrı gönderecek.' Kapıda biri bekliyor — genç, sabırsız, elinde bir çanta.",
          "In your dream a snake winds round your leg, then a hand presses something warm onto the wound. In the morning a priest hears your dream and interprets it: 'The god wants the wound opened, cleaned and washed with wine. And the god will send the hand to do it.' Someone is waiting at the gate — young, impatient, a bag in his hand.",
        ),
        history: l(
          "Asklepion'daki tedavi rüyalarla yönlendirilirdi; rahipler rüyaları yorumlar, tedaviyi buna göre belirlerdi. Retorikçi Aelius Aristides, aynı dönemde burada geçirdiği yılları ve rüyalarını 'Kutsal Söylevler'inde ayrıntılı biçimde anlatır.",
          "Treatment at the Asklepion was guided by dreams, which the priests interpreted. The orator Aelius Aristides, here in the same decades, describes his years at the sanctuary and his dreams in detail in his 'Sacred Tales'.",
        ),
        choices: [go("Kapıdaki adama git", "Go to the man at the gate", "galenos")],
      },
      galenos: {
        text: l(
          "'Galenos,' diyor, kendini tanıtmadan önce bacağına bakarak. 'Başrahip beni gladyatörlerin hekimi yaptı. Yaran kötü, ama ölümcül değil — henüz.' Bir kap şarap çıkarıyor. 'Bunu yaraya dökeceğim, sargıyı da şaraba batıracağım ve kurumasına izin vermeyeceğim. Acıtacak.'",
          "'Galen,' he says, looking at your leg before he has even introduced himself. 'The high priest has made me physician to the gladiators. Your wound is bad, but not fatal — not yet.' He takes out a flask of wine. 'I'll pour this into the wound, soak the dressing in it and never let it dry. It will hurt.'",
        ),
        history: l(
          "Galenos Pergamon'da doğdu (MS 129) ve burada Asklepion çevresinde yetişti. MS 157 civarında Asya başrahibinin gladyatörlerine hekim olarak atandı. Kendi yazılarında yaraları şaraba batırılmış sargılarla tedavi ettiğini ve onun döneminde çok az gladyatörün öldüğünü anlatır.",
          "Galen was born in Pergamon (AD 129) and trained around its Asklepion. About AD 157 he was appointed physician to the high priest of Asia's gladiators. In his own writings he describes treating wounds with dressings soaked in wine, and claims very few gladiators died in his care.",
        ),
        choices: [
          go("Dişini sık, izin ver", "Grit your teeth and let him", "tedavi"),
          go(
            "Kaç — arenaya bu bacakla dönersin",
            "Run — you'll go back to the arena on this leg",
            "kacis",
          ),
        ],
      },
      tedavi: {
        text: l(
          "Haftalarca her sabah Galenos geliyor, sargıyı ıslatıyor, yaranın kenarına bakıp homurdanıyor, bazen kendi kendine not alıyor. Bir sabah ayağa kalkıp yürüyorsun. Kutsal Yol'da geri dönerken Asklepion'a bir adak bırakıyorsun: taştan küçük bir bacak. Kime teşekkür ettiğinden tam emin değilsin.",
          "For weeks Galen comes every morning, wets the dressing, peers at the wound's edge and grunts, sometimes making notes to himself. One morning you stand up and walk. Going back along the Sacred Way you leave an offering at the Asklepion: a small stone leg. You're not quite sure whom you are thanking.",
        ),
        history: l(
          "Asklepios kutsal alanlarında iyileşen hastaların bıraktığı, iyileşen organı gösteren adak kabartmaları bulunmuştur. Galenos bir dinsel kurum içinde çalışan, ama gözleme ve deneye dayanan bir tıp yazdı; eserleri yüzyıllarca Avrupa ve İslam dünyasında temel kaynak oldu.",
          "Votive reliefs of healed body parts, left by grateful patients, have been found in sanctuaries of Asclepius. Galen worked within a religious institution yet wrote a medicine built on observation and experiment; his works were standard texts in Europe and the Islamic world for centuries.",
        ),
        choices: [],
        ending: { title: l("Taştan bir bacak", "A leg of stone"), kind: "good" },
      },
      kacis: {
        text: l(
          "Kaçıyorsun. Bir ay sonra arenadasın; bacağın seni taşıyor, sonra taşımıyor. Seyirciler bağırıyor. Bir sonraki sabah, ateşler içinde, Galenos'un yine başında olduğunu görüyorsun. 'Sana acıtacak demiştim,' diyor, 'ölümcül değil, henüz demiştim. Şimdi ikisi de doğru.'",
          "You run. A month later you are in the arena; your leg holds you up, and then it doesn't. The crowd roars. The next morning, burning with fever, you find Galen at your side again. 'I told you it would hurt,' he says. 'I told you it wasn't fatal — yet. Now both are true.'",
        ),
        history: l(
          "Gladyatör mezar taşları ve Efes'teki gladyatör mezarlığında incelenen kemikler, iyileşmiş ağır yaralanmalar gösterir: gladyatörler değerli yatırımlardı ve tedavi edilirlerdi.",
          "Gladiator tombstones, and the bones studied from the gladiators' cemetery at Ephesus, show severe wounds that had healed: gladiators were valuable investments, and they were treated.",
        ),
        choices: [
          go("Bu kez dinle", "This time, listen", "tedavi"),
          go(
            "Ateş düşer düşmez arenaya dön",
            "Go back to the arena the moment the fever breaks",
            "son-dovus",
          ),
        ],
      },
      "son-dovus": {
        text: l(
          "Ateş düşüyor, bacak düşmüyor. Arenadaki son dövüşünde rakibin topalladığını görüyor ve öne atılıyor. Kalabalık senin için bağırmıyor. Bir sabah, Kutsal Yol'un kenarında, sütunların gölgesinde oturan bir dilenci olacaksın — Asklepion'a gelenlere, tanrıyı değil hekimi dinlemelerini söyleyen.",
          "The fever breaks; the leg does not mend. In your last fight your opponent sees the limp and lunges. The crowd does not shout your name. One morning you will be a beggar sitting in the shade of the columns on the Sacred Way — telling everyone who comes to the Asklepion to listen to the physician, not only to the god.",
        ),
        choices: [],
        ending: { title: l("Sütunların gölgesi", "In the shade of the columns"), kind: "hard" },
      },
    },
  },
];

/** Every story, in the order the list shows them. */
export const stories: Story[] = [...firstStories, ...moreStories];

export function getStory(id: string): Story | undefined {
  return stories.find((story) => story.id === id);
}

export function storiesFor(slug: string): Story[] {
  return stories.filter((story) => story.siteSlug === slug);
}

export function endingsOf(story: Story): string[] {
  return Object.entries(story.scenes)
    .filter(([, scene]) => scene.ending)
    .map(([id]) => id);
}

registerTranslations(translations);
