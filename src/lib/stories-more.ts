import type { Localized } from "@/lib/i18n";
import type { Choice, Story } from "@/lib/stories";

/**
 * Four more days in antiquity — and one in the nineteenth century, because
 * the most consequential day in Troy's modern history was a dig, not a siege.
 * The rules are the stories' rules: the people are invented, the world is
 * not, and every "history" note says only what the record says.
 */
const l = (tr: string, en: string): Localized => ({ tr, en });
const go = (tr: string, en: string, to: string): Choice => ({ label: l(tr, en), to });

export const moreStories: Story[] = [
  /* ————————————————————————— Troy ————————————————————————— */
  {
    id: "troya-hazine",
    siteSlug: "troya",
    title: l("Priamos'un Hazinesi", "Priam's Treasure"),
    role: l(
      "Hisarlık kazısında çalışan, yakın köyden genç bir işçi",
      "A young labourer from a nearby village, working on the dig at Hisarlık",
    ),
    period: l("Mayıs 1873", "May 1873"),
    blurb: l(
      "Alman tüccar Heinrich Schliemann, Homeros'un Troyası'nı bulmaya kararlı. Tepeyi ortasından yarıyorlar. Bir sabah kazmanın ucu toprağın içinde parlayan bir şeye değiyor.",
      "The German merchant Heinrich Schliemann is determined to find Homer's Troy. They are cutting the mound open down the middle. One morning a pick strikes something that gleams in the earth.",
    ),
    start: "hendek",
    scenes: {
      hendek: {
        text: l(
          "Güneş yeni doğmuş. Yüzlerce işçi tepenin ortasındaki dev hendekte toprak taşıyor; arabalar, sepetler, kürekler. Schliemann bağırıyor: daha derine, Homeros'un kentine kadar. Üstteki duvarlar söküldükçe yıkılıyor. Yanında çalışan yaşlı adam fısıldıyor: 'Aradığı kat bu değil belki de; ama kim dinler?'",
          "The sun is barely up. Hundreds of labourers are carrying earth out of the huge trench through the middle of the mound — carts, baskets, shovels. Schliemann shouts: deeper, down to Homer's city. The walls above are torn out as they go. The old man working beside you whispers: 'Maybe the layer he wants isn't this one. But who listens?'",
        ),
        history: l(
          "Schliemann 1871-1873 arasında Hisarlık'ın ortasından büyük bir kuzey-güney hendeği açtı. Aradığı Homeros'un Troyası'nın en alt katlarda olduğunu düşünüyordu; bu yüzden üstteki katmanların, sonradan daha önemli olduğu anlaşılan Geç Tunç Çağı kalıntıları dahil, bir kısmını tahrip etti.",
          "Between 1871 and 1873 Schliemann drove a great north-south trench through the middle of Hisarlık. Believing Homer's Troy lay at the bottom, he destroyed part of the upper layers — including Late Bronze Age remains later recognised as the more important ones.",
        ),
        choices: [go("Kazmaya devam et", "Keep digging", "parilti")],
      },
      parilti: {
        text: l(
          "Kazmanın ucu metale çarpıyor. Toprağın arasından yeşilimsi bir bakır kap ve onun altında sarı bir parıltı. Arkana bakıyorsun: Schliemann seni görmüş bile. 'Dur!' diyor, 'herkes kahvaltıya gitsin. Hemen!'",
          "Your pick hits metal. Out of the earth comes a greenish copper vessel, and under it a yellow gleam. You look round: Schliemann has already seen you. 'Stop!' he says. 'Everyone go to breakfast. Now!'",
        ),
        history: l(
          "Schliemann, buluntunun Mayıs 1873'ün sonunda ortaya çıktığını ve işçileri bir bahaneyle uzaklaştırıp hazineyi kendisinin çıkardığını yazdı.",
          "Schliemann wrote that the find came to light at the end of May 1873, and that he sent the workmen away on a pretext and dug the treasure out himself.",
        ),
        choices: [
          go("Söyleneni yap, uzaklaş", "Do as you're told and walk away", "kahvalti"),
          go("Bir kenarda saklanıp izle", "Hide nearby and watch", "izle"),
        ],
      },
      izle: {
        text: l(
          "Bir duvarın arkasından bakıyorsun. Schliemann çakısıyla toprağı kazıyor: diademler, küpeler, binlerce küçük altın boncuk, kupalar. Hepsini büyük bir şala sarıyor. Karısı Sophia'nın orada olduğunu sonradan anlatacak; ama sen o sabah tepede tek bir kadın görmüyorsun.",
          "You watch from behind a wall. Schliemann digs with his knife: diadems, earrings, thousands of tiny gold beads, cups. He wraps it all in a large shawl. Later he will say his wife Sophia was at his side; but that morning you see no woman on the hill at all.",
        ),
        history: l(
          "Schliemann, hazineyi karısı Sophia'nın şalında taşıdığını anlattı. Ancak Sophia o günlerde Atina'daydı; Schliemann bunu sonradan bir mektubunda kabul etti.",
          "Schliemann told how his wife Sophia carried the treasure off in her shawl. Sophia was in fact in Athens at the time, which Schliemann later admitted in a letter.",
        ),
        choices: [
          go("Osmanlı gözlemcisine haber ver", "Tell the Ottoman inspector", "gozlemci"),
          go("Sus — bu senin işin değil", "Say nothing — it's not your business", "sessiz"),
        ],
      },
      kahvalti: {
        text: l(
          "Kahvaltıda kimse bir şey konuşmuyor ama herkes bir şey biliyor. Akşam Schliemann'ın evinden kilitli sandıklar çıkıyor. Birkaç gün sonra kazı kapanıyor ve yabancılar gidiyor.",
          "Nobody says anything at breakfast, but everyone knows something. In the evening locked crates leave Schliemann's house. A few days later the dig closes and the foreigners leave.",
        ),
        choices: [
          go(
            "Haftalar sonra köyde dolaşan haberi dinle",
            "Weeks later, hear the news going round the village",
            "haber",
          ),
        ],
      },
      gozlemci: {
        text: l(
          "Kazıyı izlemekle görevli Osmanlı memuruna koşuyorsun. Adam sana inanıyor ama Schliemann'ın evine girdiğinde sandıklar çoktan kapanmış, bir kısmı yola çıkmış. Memur rapor yazıyor; İstanbul'a, oradan da mahkemeye gidecek bir rapor.",
          "You run to the Ottoman official appointed to watch the dig. He believes you, but by the time he reaches Schliemann's house the crates are shut and some are already on their way. The official writes a report — one that will go to Istanbul, and from there to a court.",
        ),
        history: l(
          "Schliemann'ın kazı izni, buluntuların bir kısmının Osmanlı devletine verilmesini şart koşuyordu. Hazineyi gizlice Yunanistan'a kaçırdı. Osmanlı hükümeti Atina'da dava açtı; Schliemann tazminat ödemek zorunda kaldı; daha sonra yeniden kazı izni aldı.",
          "Schliemann's permit required part of the finds to go to the Ottoman state. He smuggled the treasure to Greece instead. The Ottoman government sued him in Athens; Schliemann had to pay compensation, and was later granted a new excavation permit.",
        ),
        choices: [],
        ending: { title: l("Bir rapor", "A report"), kind: "bittersweet" },
      },
      sessiz: {
        text: l(
          "Susuyorsun. Yıllar sonra torunlarına anlatacaksın: o sabah tepenin altından çıkan altınları gördüğünü, şala sarılıp götürüldüğünü. 'Priamos'un hazinesi' diyorlardı. Oysa senin gördüğün altın Priamos'tan bin yıl daha eskiydi — ama bunu o zaman kimse bilmiyordu.",
          "You keep quiet. Years later you will tell your grandchildren: how that morning you saw gold come out from under the hill, wrapped in a shawl and carried away. 'Priam's treasure', they called it. But the gold you saw was a thousand years older than Priam — though no one knew that then.",
        ),
        history: l(
          "Hazinenin bulunduğu katman Troya II'dir, yaklaşık MÖ 2500-2300. Homeros'un anlattığı savaşla ilişkilendirilen Troya VI-VII katmanlarından yaklaşık bin yıl eskidir.",
          "The layer the treasure came from is Troy II, about 2500-2300 BC — roughly a thousand years older than Troy VI-VII, the layers connected with the war Homer describes.",
        ),
        choices: [go("Hazinenin sonrasını öğren", "Find out what became of the treasure", "haber")],
      },
      haber: {
        text: l(
          "Hazine Atina'ya, sonra Berlin'e gidiyor. Bir savaşın sonunda ortadan kayboluyor ve yarım yüzyıl boyunca kimse nerede olduğunu bilmiyor. Hisarlık'ın tepesinde ise Schliemann'ın açtığı hendek hâlâ duruyor; ziyaretçiler bugün de içine bakıp katmanları sayıyor.",
          "The treasure goes to Athens, then to Berlin. At the end of a war it vanishes, and for half a century nobody knows where it is. On the top of Hisarlık, Schliemann's trench is still there; visitors look into it today and count the layers.",
        ),
        history: l(
          "Hazine 1945'te Berlin'den Sovyet birliklerince götürüldü ve uzun süre kayıp sayıldı. 1993'te Moskova'daki Puşkin Müzesi'nde olduğu açıklandı ve 1996'dan beri orada sergileniyor. 'Schliemann Hendeği' Troya'da bugün de görülebilir.",
          "The treasure was removed from Berlin by Soviet troops in 1945 and long counted as lost. In 1993 it was revealed to be in the Pushkin Museum in Moscow, where it has been on display since 1996. 'Schliemann's Trench' can still be seen at Troy today.",
        ),
        choices: [],
        ending: { title: l("Hendeğin bekçisi", "Keeper of the trench"), kind: "good" },
      },
    },
  },

  /* ————————————————————————— Hattusa ————————————————————————— */
  {
    id: "hattusa-katip",
    siteSlug: "hattusa",
    title: l("Barışın Kâtibi", "The Scribe of the Peace"),
    role: l(
      "Hattuşa'nın tablet arşivinde genç bir kâtip",
      "A young scribe in the tablet archive at Hattusa",
    ),
    period: l("Yaklaşık MÖ 1259", "About 1259 BC"),
    blurb: l(
      "Kadeş'teki büyük savaştan on beş yıl sonra Hitit kralı ile Mısır firavunu barış yapmak üzere. Antlaşmanın metni senin elinden geçecek — ve tek bir yanlış işaret bir savaşı yeniden başlatabilir.",
      "Fifteen years after the great battle at Kadesh, the Hittite king and the pharaoh of Egypt are about to make peace. The text of the treaty will pass through your hands — and one wrong sign could start a war again.",
    ),
    start: "arsiv",
    scenes: {
      arsiv: {
        text: l(
          "Büyükkale'nin arşiv odasında raflar dolusu kil tablet. Baş kâtip önüne ıslak bir kil levha koyuyor: 'Kralımız Hattuşili ile Mısır kralı Ramses arasındaki antlaşmanın Akadca metni. Gümüş levhaya yazılacak olanın taslağı bu. Bir işareti bile karıştırırsan...'",
          "In the archive room of Büyükkale, shelves full of clay tablets. The chief scribe sets a damp clay slab in front of you: 'The Akkadian text of the treaty between our king Hattusili and Ramesses, king of Egypt. This is the draft for the one to be written on silver. Mix up a single sign...'",
        ),
        history: l(
          "Hattuşa'da kazılarda on binlerce çivi yazılı tablet parçası bulundu. Mısır ile yapılan antlaşmanın Hitit kopyası, uluslararası diplomasinin dili olan Akadca ile yazılmıştır. Antlaşmanın aslının gümüş levhalara yazıldığı Mısır metninde belirtilir.",
          "Tens of thousands of cuneiform tablet fragments have been excavated at Hattusa. The Hittite copy of the treaty with Egypt is written in Akkadian, the language of international diplomacy. The Egyptian version says the original was written on tablets of silver.",
        ),
        choices: [
          go("Metni hemen kopyalamaya başla", "Start copying straight away", "kopya"),
          go(
            "Önce Mısır'dan gelen versiyonu iste",
            "First ask for the version sent from Egypt",
            "misir",
          ),
        ],
      },
      misir: {
        text: l(
          "Baş kâtip kaşlarını kaldırıyor ama Mısır elçisinin getirdiği metni getirtiyor. İkisini yan yana koyuyorsun. Mısır metninde barışı Hititlerin istediği yazıyor; bizimkinde Mısırlıların. İkisi de barışı karşı tarafın istediğini söylüyor.",
          "The chief scribe raises his eyebrows, but has the text the Egyptian envoy brought fetched. You lay the two side by side. In the Egyptian text it is the Hittites who asked for peace; in ours, the Egyptians. Each says the other side asked.",
        ),
        history: l(
          "Antlaşmanın hem Hitit hem Mısır nüshaları günümüze ulaştı. Mısır'daki hiyeroglif metin Karnak ve Ramesseum'da duvarlara kazınmıştır. İki metin büyük ölçüde örtüşür, ancak barışı hangi tarafın talep ettiği konusunda her biri kendi kralını yüceltir.",
          "Both the Hittite and Egyptian versions of the treaty survive; the hieroglyphic text is carved on temple walls at Karnak and the Ramesseum. The two largely agree, but each flatters its own king on the question of who asked for peace.",
        ),
        choices: [
          go("Kendi metnine dön", "Go back to your own text", "kopya"),
          go(
            "Mısır'ın ifadesini olduğu gibi kopyala",
            "Copy the Egyptian wording exactly as it is",
            "yanlis",
          ),
        ],
      },
      yanlis: {
        text: l(
          "Mısır'ın cümlesini kendi tabletine geçiriyorsun: barışı isteyen Hitit kralıymış. Baş kâtip okuyunca rengi atıyor. 'Bu tablet kralın önüne gitseydi,' diyor, 'başımız da giderdi.' Tableti kırıp hamuruna geri katıyor. Seni ertesi gün sınır kalesine, tahıl sayımı kaydetmeye gönderiyorlar.",
          "You put the Egyptian sentence into your own tablet: it was the Hittite king who asked for peace. The chief scribe goes pale when he reads it. 'If this tablet had gone before the king,' he says, 'our heads would have gone too.' He breaks the tablet and kneads it back into clay. The next day you are sent to a frontier fort to keep the grain tallies.",
        ),
        history: l(
          "Diplomatik yazışmalarda unvan ve itibar dili titizlikle korunurdu; her saray kendi kralını üstün gösteren ifadeleri seçerdi. Kâtiplik, Hitit devletinde uzun bir eğitim gerektiren saygın bir meslekti.",
          "Diplomatic correspondence guarded the language of rank and honour closely; each court chose wording that showed its own king as the greater. Scribes in the Hittite state were a respected profession that took long training.",
        ),
        choices: [],
        ending: { title: l("Sınırdaki sayım", "Tallies at the frontier"), kind: "hard" },
      },
      kopya: {
        text: l(
          "Kamış kalemi kile bastırıyorsun: kama, kama, köşe. 'Kardeşlik ve barış sonsuza dek.' Bir maddede iki kral birbirinin topraklarına saldırmamaya, diğerine düşman saldırırsa yardım etmeye, kaçakları geri vermeye söz veriyor. Kapıda bir hizmetkâr beliriyor: Kraliçe Puduhepa seni çağırıyor.",
          "You press the reed into the clay: wedge, wedge, corner. 'Brotherhood and peace forever.' In one clause the two kings promise not to attack each other's land, to help if an enemy attacks the other, and to hand back fugitives. A servant appears at the door: Queen Puduhepa is asking for you.",
        ),
        history: l(
          "Antlaşma karşılıklı saldırmazlık, ortak savunma ve kaçakların iadesi maddelerini içerir; bilinen en eski yazılı barış antlaşmalarından biri sayılır. Kraliçe Puduhepa'nın Ramses ile yazışmaları da arşivde bulunmuştur.",
          "The treaty includes clauses on mutual non-aggression, joint defence and the return of fugitives, and is counted among the oldest written peace treaties known. Queen Puduhepa's own correspondence with Ramesses has also been found in the archive.",
        ),
        choices: [
          go("Kraliçeye git", "Go to the queen", "kralice"),
          go("Önce metni bitir", "Finish the text first", "bitir"),
        ],
      },
      kralice: {
        text: l(
          "Puduhepa bir mektup yazdırıyor, Mısır kraliçesine. Sesi sakin ama kelimeleri keskin: hediyelerin değerini, düğün pazarlıklarını, iki sarayın onurunu tartıyor. 'Bunu da Akadca yaz,' diyor. 'Ve Mısırlılara biz Hititlerin yazı bilmediğimizi düşündürme.'",
          "Puduhepa dictates a letter — to the queen of Egypt. Her voice is calm but her words are sharp: she weighs the value of the gifts, the bargaining over a marriage, the honour of two courts. 'Write this in Akkadian too,' she says. 'And don't let the Egyptians think we Hittites can't write.'",
        ),
        history: l(
          "Puduhepa, Hitit tarihinin en etkili kraliçelerinden biridir; kendi mührüyle belgeler onayladığı ve Mısır sarayıyla doğrudan yazıştığı bilinir. Antlaşmadan yıllar sonra bir Hitit prensesi Ramses ile evlendirildi.",
          "Puduhepa was among the most influential queens in Hittite history; she is known to have sealed documents with her own seal and to have corresponded directly with the Egyptian court. Years after the treaty, a Hittite princess was married to Ramesses.",
        ),
        choices: [go("Arşive dön", "Go back to the archive", "bitir")],
      },
      bitir: {
        text: l(
          "Tablet kuruyor. Baş kâtip onu ışığa tutup satır satır okuyor, sonra rafa, Mısır'dan gelen mektupların yanına koyuyor. 'Senden sonra da okunacak,' diyor. Haklı: üç bin iki yüz yıl sonra o tabletin bir kopyası, dünyanın bütün ülkelerinin toplandığı bir binanın duvarında asılı olacak.",
          "The tablet dries. The chief scribe holds it to the light and reads it line by line, then puts it on the shelf beside the letters from Egypt. 'It will be read after you,' he says. He is right: thirty-two centuries later a copy of that tablet will hang on the wall of a building where all the countries of the world meet.",
        ),
        history: l(
          "Antlaşmanın Hattuşa'da bulunan kil tableti İstanbul Arkeoloji Müzeleri'ndedir. Bir kopyası, barış diplomasisinin erken bir örneği olarak New York'taki Birleşmiş Milletler genel merkezinde sergilenir.",
          "The clay tablet of the treaty found at Hattusa is in the Istanbul Archaeology Museums. A copy is displayed at United Nations headquarters in New York as an early example of peace diplomacy.",
        ),
        choices: [],
        ending: { title: l("Rafa konan barış", "A peace on the shelf"), kind: "good" },
      },
    },
  },

  /* ————————————————————————— Aphrodisias ————————————————————————— */
  {
    id: "aphrodisias-atolye",
    siteSlug: "aphrodisias",
    title: l("Mermerin İçindeki İmparator", "The Emperor in the Marble"),
    role: l(
      "Aphrodisias'ta bir heykeltıraş atölyesinde çırak",
      "An apprentice in a sculptor's workshop at Aphrodisias",
    ),
    period: l("MS 1. yüzyılın ortası", "Mid-first century AD"),
    blurb: l(
      "Kent, Augustus'un ailesine ve tanrılara adanmış görkemli bir tapınak kompleksi yapıyor: Sebasteion. Atölyenize kabartma panolardan biri verildi. Ustanız hasta ve iş sana kaldı.",
      "The city is building a splendid temple complex dedicated to the family of Augustus and the gods: the Sebasteion. Your workshop has been given one of the relief panels. Your master is ill, and the work falls to you.",
    ),
    start: "ocak",
    scenes: {
      ocak: {
        text: l(
          "Sabah, kentin birkaç kilometre dışındaki mermer ocağındasın. İşçiler kama ve tokmakla bloğu kayadan ayırıyor. Taş beyaz, ince taneli, iri bir damar bile yok. 'Bu taştan bir imparator çıkar,' diyor ocak ustası. Ama hangi blok?",
          "Morning, at the marble quarry a few kilometres outside the city. Workmen split the block from the rock with wedges and mallets. The stone is white, fine-grained, without a single heavy vein. 'An emperor will come out of this stone,' says the quarry foreman. But which block?",
        ),
        history: l(
          "Aphrodisias'ın kuzeydoğusundaki mermer ocakları kentin heykeltıraşlık okulunun temeliydi. Kentin heykeltıraşları eserlerini 'Aphrodisieus' (Aphrodisiaslı) diye imzalardı; bu imzalar Roma dahil imparatorluğun birçok yerinde bulunmuştur.",
          "The marble quarries north-east of Aphrodisias were the foundation of the city's school of sculpture. Its sculptors signed their work 'Aphrodisieus' — 'of Aphrodisias' — and such signatures have been found across the empire, Rome included.",
        ),
        choices: [
          go("Kusursuz beyaz bloğu seç", "Choose the flawless white block", "beyaz"),
          go(
            "Hafif damarlı, daha büyük bloğu seç",
            "Choose the bigger, lightly veined block",
            "damarli",
          ),
        ],
      },
      beyaz: {
        text: l(
          "Blok kızaklarla atölyeye taşınıyor. Kâğıt yok, ama ustanın çizdiği bir balmumu tablet var: bir imparator, çıplak, kahramanca bir duruşla, önünde diz çökmüş bir kadın figürü. Kadın yenilmiş bir halkı temsil ediyor. 'Hangi halk?' diye soruyorsun. Usta öksürerek yanıtlıyor: 'Britanya.'",
          "The block is hauled on sledges to the workshop. There is no paper, but there is a wax tablet with your master's sketch: an emperor, nude, in a heroic pose, and before him a kneeling female figure. She stands for a conquered people. 'Which people?' you ask. Your master answers between coughs: 'Britannia.'",
        ),
        history: l(
          "Sebasteion kabartmalarından birinde İmparator Claudius, yere serilmiş Britannia'yı yenerken gösterilir; Roma'nın MS 43'te Britanya'yı fethine göndermedir. Kabartmalar bugün Aphrodisias Müzesi'ndedir.",
          "One of the Sebasteion reliefs shows the emperor Claudius overpowering a fallen Britannia — a reference to Rome's conquest of Britain in AD 43. The reliefs are now in the Aphrodisias Museum.",
        ),
        choices: [go("Yontmaya başla", "Start carving", "yont")],
      },
      damarli: {
        text: l(
          "Büyük blok daha ucuz ve daha yüksek bir pano çıkarıyor. Ama yontmaya başladığında gri bir damar tam imparatorun yüzünden geçiyor. Usta yatağından kalkıp bakıyor ve uzun süre susuyor. 'Yüzü yarım parmak yana kaydır,' diyor sonunda, 'damar omzuna düşsün. Taşın söylediğini dinle.'",
          "The big block is cheaper and gives a taller panel. But when you begin to carve, a grey vein runs straight across the emperor's face. Your master gets up from his bed to look and is silent for a long time. 'Move the face half a finger to the side,' he says at last, 'so the vein falls on his shoulder. Listen to what the stone tells you.'",
        ),
        choices: [go("Yontmaya başla", "Start carving", "yont")],
      },
      yont: {
        text: l(
          "Haftalar boyunca keski, matkap, törpü. Kasların gölgesini matkapla derinleştiriyorsun, deriyi zımpara taşıyla parlatıyorsun. Pano bittiğinde boyacılar geliyor: dudaklara kırmızı, pelerine mavi, gözlere siyah. Bir şey eksik.",
          "Weeks of chisel, drill and rasp. You deepen the shadows of the muscles with the drill and polish the skin with an abrasive stone. When the panel is finished the painters come: red for the lips, blue for the cloak, black for the eyes. Something is missing.",
        ),
        history: l(
          "Antik mermer heykeller ve kabartmalar boyalıydı; Aphrodisias'taki bazı eserlerde boya izleri bulunmuştur. Bugün gördüğümüz beyaz yüzeyler boyanın yüzyıllar içinde kaybolmasının sonucudur.",
          "Ancient marble statues and reliefs were painted, and traces of paint have been found on sculpture at Aphrodisias. The white surfaces we see today are what centuries have left once the paint was gone.",
        ),
        choices: [
          go("Panoya ustanın adını yaz", "Carve your master's name on the panel", "usta"),
          go("Kendi adını yaz", "Carve your own name", "imza"),
        ],
      },
      usta: {
        text: l(
          "Kaidenin kenarına ustanın adını kazıyorsun. Pano yerine konduğu gün usta, değneğine dayanarak gelip ona uzun uzun bakıyor. 'Benim elim değil bu,' diyor, 'ama benim okulum.' Ertesi kış ölüyor. Atölye artık senin.",
          "On the edge of the base you carve your master's name. The day the panel is set in place, he comes leaning on his stick and looks at it for a long time. 'This is not my hand,' he says, 'but it is my school.' He dies the next winter. The workshop is yours now.",
        ),
        choices: [],
        ending: { title: l("Bir okulun mirası", "Heir to a school"), kind: "good" },
      },
      imza: {
        text: l(
          "Kaidenin kenarına kendi adını ve 'Aphrodisieus' kelimesini kazıyorsun. Usta görünce gülümsüyor ama hiçbir şey söylemiyor. Yıllar sonra Roma'da bir patronun villasında, başka birinin yaptığı bir heykelde aynı kelimeyi görüyorsun ve tanımadığın bir hemşehrini selamlıyorsun.",
          "On the edge of the base you carve your own name and the word 'Aphrodisieus'. Your master smiles when he sees it but says nothing. Years later, in a patron's villa in Rome, you see the same word on a statue someone else made, and you greet a fellow citizen you have never met.",
        ),
        history: l(
          "Aphrodisiaslı heykeltıraşların imzalı eserleri Roma'da ve imparatorluğun başka kentlerinde bulunmuştur. Kentte yapılan kazılarda yarım kalmış heykellerle dolu geç antik bir heykeltıraş atölyesi de ortaya çıkarılmıştır.",
          "Signed works by sculptors of Aphrodisias have been found in Rome and other cities of the empire. Excavations in the city have also uncovered a late antique sculptor's workshop, full of unfinished statues.",
        ),
        choices: [],
        ending: { title: l("Aphrodisieus", "Aphrodisieus"), kind: "good" },
      },
    },
  },

  /* ————————————————————————— Göreme ————————————————————————— */
  {
    id: "goreme-fresk",
    siteSlug: "goreme",
    title: l("Karanlıktaki Renkler", "Colours in the Dark"),
    role: l(
      "Kaya kiliselerinde çalışan bir fresk ressamının çırağı",
      "Apprentice to a fresco painter in the rock-cut churches",
    ),
    period: l("11. yüzyıl", "11th century"),
    blurb: l(
      "Vadide peribacalarına oyulmuş bir kilisenin duvarlarını boyuyorsunuz. Sıva kurumadan önce işin bitmesi gerek. Ama tepeden bir duman yükseliyor: köyde baskın korkusu var.",
      "You are painting the walls of a church carved into the rock of the valley. The work must be finished before the plaster dries. But smoke is rising from the hilltop: the village fears a raid.",
    ),
    start: "sıva",
    scenes: {
      sıva: {
        text: l(
          "Sabah erkenden ustanın yanında, kayaya oyulmuş kubbenin altındasın. Duvara bugün boyanacak kadar taze kireç sıva sürüyorsunuz; boya ıslak sıvaya işlenecek ve onunla birlikte taşlaşacak. Usta İsa'nın yüzünü çizecek. Sana pigmentleri ezmek düşüyor.",
          "Early morning, with your master under the dome carved into the rock. You spread as much fresh lime plaster on the wall as can be painted today; the colour will sink into the wet plaster and harden with it. Your master will draw the face of Christ. Your job is to grind the pigments.",
        ),
        history: l(
          "Göreme'nin kaya kiliselerinin büyük bölümü 10-12. yüzyıllarda boyandı. Karanlık Kilise'nin freskleri, kiliseye çok az ışık girdiği için olağanüstü iyi korunmuştur.",
          "Most of Göreme's rock-cut churches were painted between the 10th and 12th centuries. The frescoes of the Dark Church (Karanlık Kilise) are exceptionally well preserved because so little light enters it.",
        ),
        choices: [
          go("Mavi için pahalı lapis taşını ez", "Grind the costly lapis for blue", "lapis"),
          go("Yerel toprak boyalarla yetin", "Make do with local earth pigments", "toprak"),
        ],
      },
      lapis: {
        text: l(
          "Usta küçük kesesini açıyor: uzak dağlardan gelmiş birkaç parça lacivert taş. 'Meryem'in örtüsü için,' diyor, 'başka hiçbir şey için değil.' Taşı havanda dikkatle eziyorsun; toz parmaklarına gökyüzü gibi bulaşıyor.",
          "Your master opens his little pouch: a few pieces of deep blue stone from distant mountains. 'For the Virgin's veil,' he says, 'and nothing else.' You grind it carefully in the mortar; the powder stains your fingers like the sky.",
        ),
        choices: [go("Dışarıdan gelen sesi dinle", "Listen to the noise from outside", "duman")],
      },
      toprak: {
        text: l(
          "Vadinin kendi toprağı: kırmızı aşı boyası, sarı okra, yanmış kemikten siyah. Usta gülümsüyor: 'Bu vadinin rengini bu vadinin toprağı verir.' Kırmızıyı İsa'nın giysisine, sarıyı halelere ayırıyorsun.",
          "The valley's own earth: red ochre, yellow ochre, black from burnt bone. Your master smiles: 'The colour of this valley comes from this valley's soil.' You set the red aside for Christ's robe and the yellow for the haloes.",
        ),
        choices: [go("Dışarıdan gelen sesi dinle", "Listen to the noise from outside", "duman")],
      },
      duman: {
        text: l(
          "Kapıdan bir çocuk koşarak giriyor: tepede işaret ateşi yakılmış. Atlılar yaklaşıyor olabilir. Köylüler eşyalarını alıp yeraltındaki şehre iniyor. Usta duvara bakıyor: sıva ıslak, yüz yarım.",
          "A child runs in at the door: a signal fire has been lit on the hilltop. Horsemen may be coming. The villagers are taking their belongings down to the underground city. Your master looks at the wall: the plaster is wet, the face half-finished.",
        ),
        history: l(
          "Kapadokya'daki Derinkuyu ve Kaymaklı gibi yeraltı şehirleri, özellikle Bizans döneminde baskınlar sırasında sığınak olarak kullanıldı. Katları, havalandırma bacaları ve girişi kapatan büyük döner taş kapıları vardır.",
          "Cappadocia's underground cities, such as Derinkuyu and Kaymaklı, were used as refuges during raids, especially in the Byzantine period. They have many levels, ventilation shafts, and great rolling stone doors to seal the entrances.",
        ),
        choices: [
          go("Ustanı ikna et, yeraltına inin", "Persuade your master — go underground", "yeralti"),
          go("Kal ve yüzü bitirmesine yardım et", "Stay and help him finish the face", "kal"),
        ],
      },
      yeralti: {
        text: l(
          "Merdivenler daralıyor, hava serinliyor. Kandil ışığında ahırları, şarap teknelerini, havalandırma bacasını geçiyorsunuz. En son giren adam yuvarlak taş kapıyı yuvarlıyor. Karanlıkta üç gün bekliyorsunuz. Çıktığınızda vadi sessiz — atlılar bu kez başka yöne gitmiş. Ama duvardaki sıva kurumuş ve yüz yarım kalmış.",
          "The stairs narrow, the air cools. By lamplight you pass stables, wine troughs, a ventilation shaft. The last man in rolls the round stone door across. You wait three days in the dark. When you come out the valley is silent — this time the horsemen went another way. But the plaster on the wall has dried, and the face is half done.",
        ),
        choices: [go("Yeniden başla", "Start again", "yeniden")],
      },
      kal: {
        text: l(
          "Usta fırçayı hızlı ama titremeden sürüyor. Sen kandili tutuyor, boyaları uzatıyorsun. Dışarıda atlar, bağırışlar... sonra sessizlik. Atlılar kilisenin girişini görmeden geçip gidiyor. Akşam olduğunda yüz bitmiş: büyük, sakin gözler karanlıkta size bakıyor.",
          "Your master moves the brush quickly but without a tremor. You hold the lamp and pass him the colours. Outside, horses, shouting... then silence. The horsemen ride past without seeing the church door. By evening the face is finished: large, calm eyes looking at you out of the dark.",
        ),
        choices: [],
        ending: { title: l("Karanlıktaki yüz", "The face in the dark"), kind: "good" },
      },
      yeniden: {
        text: l(
          "Kuru sıvayı kazıyıp yenisini sürüyorsunuz. Bu kez usta yüzü sana bırakıyor. 'Benim yaptığımın kopyası olmasın,' diyor. Fırçayı tutuyorsun. Dokuz yüz yıl sonra o kilisenin loşluğunda turistler aynı yüze bakacak ve kimin elinden çıktığını hiç bilmeyecek.",
          "You scrape off the dry plaster and lay on fresh. This time your master leaves the face to you. 'Don't let it be a copy of mine,' he says. You take the brush. Nine hundred years later, in the half-light of that church, visitors will look at the same face and never know whose hand made it.",
        ),
        history: l(
          "Göreme Milli Parkı ve Kapadokya'nın kaya yerleşimleri 1985'te UNESCO Dünya Mirası Listesi'ne alındı. Fresklerin çoğunu yapan ressamların adları bilinmiyor.",
          "Göreme National Park and the rock sites of Cappadocia were inscribed on the UNESCO World Heritage List in 1985. The names of most of the painters of the frescoes are unknown.",
        ),
        choices: [],
        ending: { title: l("Adsız bir el", "A nameless hand"), kind: "bittersweet" },
      },
    },
  },
];

/**
 * A few questions per story, answered from its "history" notes rather than
 * its fiction — the quiz tests the record, not the plot.
 */
export type StoryQuestion = {
  storyId: string;
  prompt: Localized;
  correct: Localized;
  wrong: Localized[];
};

const q = (
  storyId: string,
  prompt: Localized,
  correct: Localized,
  ...wrong: Localized[]
): StoryQuestion => ({
  storyId,
  prompt,
  correct,
  wrong,
});

export const storyQuestions: StoryQuestion[] = [
  q(
    "efes-gumuscu-ciragi",
    l(
      "Elçilerin İşleri'ne göre Efes'teki ayaklanmayı başlatan gümüşçünün adı neydi?",
      "According to Acts, what was the name of the silversmith who started the riot at Ephesus?",
    ),
    l("Demetrios", "Demetrius"),
    l("Aristarkhos", "Aristarchus"),
    l("Tyrannos", "Tyrannus"),
    l("Celsus", "Celsus"),
  ),
  q(
    "efes-gumuscu-ciragi",
    l(
      "Kalabalığı yatıştırıp davaların mahkemelere götürülmesini söyleyen kimdi?",
      "Who calmed the crowd and told them to take their charges to the courts?",
    ),
    l("Kentin yazmanı", "The town clerk"),
    l("Roma prokonsülü", "The Roman proconsul"),
    l("Artemis'in başrahibi", "The high priest of Artemis"),
    l("Demetrios", "Demetrius"),
  ),
  q(
    "aspendos-acilis",
    l(
      "Aspendos tiyatrosunun yazıtlarında adı geçen mimar kimdir?",
      "Who is the architect named in the inscriptions of the theatre at Aspendos?",
    ),
    l("Theodoros oğlu Zenon", "Zeno son of Theodorus"),
    l("Vitruvius", "Vitruvius"),
    l("Hippodamos", "Hippodamus"),
    l("Pytheos", "Pytheos"),
  ),
  q(
    "aspendos-acilis",
    l(
      "Roma tiyatrolarında seyirciyi güneşten koruyan tentenin adı nedir?",
      "What was the awning that shaded the audience in Roman theatres called?",
    ),
    l("Velarium", "Velarium"),
    l("Orkestra", "Orchestra"),
    l("Diazoma", "Diazoma"),
    l("Skene", "Skene"),
  ),
  q(
    "gobeklitepe-buyuk-toplanti",
    l(
      "Göbeklitepe kabartmalarında en sık görülen hayvan hangisidir?",
      "Which animal appears most often in Göbeklitepe's reliefs?",
    ),
    l("Tilki", "The fox"),
    l("Aslan", "The lion"),
    l("At", "The horse"),
    l("Kartal", "The eagle"),
  ),
  q(
    "gobeklitepe-buyuk-toplanti",
    l(
      "Göbeklitepe'deki hayvan kemiklerinin büyük kısmı hangi hayvana aittir?",
      "Most of the animal bone at Göbeklitepe belongs to which animal?",
    ),
    l("Ceylan", "Gazelle"),
    l("Koyun", "Sheep"),
    l("Sığır", "Domestic cattle"),
    l("Domuz", "Domestic pig"),
  ),
  q(
    "pergamon-asklepion-gecesi",
    l(
      "Pergamonlu hekim Galenos hangi grubun hekimliğine atanmıştı?",
      "Galen of Pergamon was appointed physician to whom?",
    ),
    l("Asya başrahibinin gladyatörleri", "The gladiators of the high priest of Asia"),
    l("Roma lejyonları", "The Roman legions"),
    l("Pergamon kütüphanesinin kâtipleri", "The scribes of the Pergamon library"),
    l("Kentin rahibeleri", "The city's priestesses"),
  ),
  q(
    "pergamon-asklepion-gecesi",
    l(
      "Asklepion'da hastaların tapınakta uyuyup rüya görmesine ne denirdi?",
      "What was the practice of patients sleeping in the temple to dream called?",
    ),
    l("Enkoimesis", "Incubation (enkoimesis)"),
    l("Katharsis", "Catharsis"),
    l("Symposion", "Symposium"),
    l("Ekklesia", "Ekklesia"),
  ),
  q(
    "troya-hazine",
    l(
      "'Priamos'un Hazinesi' aslında Troya'nın hangi katmanından çıktı?",
      "Which layer of Troy did 'Priam's Treasure' actually come from?",
    ),
    l("Troya II (yaklaşık MÖ 2500-2300)", "Troy II (about 2500-2300 BC)"),
    l("Troya VI", "Troy VI"),
    l("Troya VIIa", "Troy VIIa"),
    l("Roma dönemi Ilion", "Roman Ilion"),
  ),
  q(
    "troya-hazine",
    l("Hazine bugün hangi müzede sergileniyor?", "Which museum displays the treasure today?"),
    l("Moskova'daki Puşkin Müzesi", "The Pushkin Museum in Moscow"),
    l("İstanbul Arkeoloji Müzeleri", "The Istanbul Archaeology Museums"),
    l("British Museum", "The British Museum"),
    l("Berlin'deki Neues Museum", "The Neues Museum in Berlin"),
  ),
  q(
    "hattusa-katip",
    l(
      "Hitit-Mısır antlaşmasının Hattuşa'daki kopyası hangi dilde yazılmıştır?",
      "In which language is the Hattusa copy of the Hittite-Egyptian treaty written?",
    ),
    l("Akadca", "Akkadian"),
    l("Hititçe", "Hittite"),
    l("Mısır hiyeroglifiyle", "Egyptian hieroglyphs"),
    l("Grekçe", "Greek"),
  ),
  q(
    "hattusa-katip",
    l(
      "Antlaşmanın Hattuşa'da bulunan kil tableti bugün nerede?",
      "Where is the clay tablet of the treaty found at Hattusa today?",
    ),
    l("İstanbul Arkeoloji Müzeleri", "The Istanbul Archaeology Museums"),
    l("Birleşmiş Milletler genel merkezi", "United Nations headquarters"),
    l("Kahire Mısır Müzesi", "The Egyptian Museum, Cairo"),
    l("Louvre", "The Louvre"),
  ),
  q(
    "aphrodisias-atolye",
    l(
      "Sebasteion kabartmalarından birinde İmparator Claudius kimi yenerken gösterilir?",
      "On one Sebasteion relief, whom is the emperor Claudius shown overpowering?",
    ),
    l("Britannia", "Britannia"),
    l("Galatia", "Galatia"),
    l("Kartaca", "Carthage"),
    l("Parthia", "Parthia"),
  ),
  q(
    "aphrodisias-atolye",
    l(
      "Aphrodisiaslı heykeltıraşlar eserlerini nasıl imzalardı?",
      "How did the sculptors of Aphrodisias sign their work?",
    ),
    l("Aphrodisieus — 'Aphrodisiaslı'", "Aphrodisieus — 'of Aphrodisias'"),
    l("Yalnızca bir aslan damgasıyla", "With a lion stamp only"),
    l("İmza atmazlardı", "They never signed"),
    l("İmparatorun adıyla", "With the emperor's name"),
  ),
  q(
    "goreme-fresk",
    l(
      "Karanlık Kilise'nin freskleri neden bu kadar iyi korunmuştur?",
      "Why are the frescoes of the Dark Church so well preserved?",
    ),
    l("Kiliseye çok az ışık girdiği için", "Because very little light enters it"),
    l("Yüzyıllarca toprak altında kaldıkları için", "Because they were buried for centuries"),
    l("Cam ile kaplandıkları için", "Because they were covered with glass"),
    l("19. yüzyılda yeniden boyandıkları için", "Because they were repainted in the 19th century"),
  ),
  q(
    "goreme-fresk",
    l(
      "Kapadokya'nın yeraltı şehirlerinin girişleri nasıl kapatılırdı?",
      "How were the entrances of Cappadocia's underground cities sealed?",
    ),
    l("Büyük döner taş kapılarla", "With great rolling stone doors"),
    l("Demir parmaklıklarla", "With iron grilles"),
    l("Ahşap kapılarla", "With wooden doors"),
    l("Hiç kapatılmazdı", "They were never sealed"),
  ),
];
