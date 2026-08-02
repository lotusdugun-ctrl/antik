import type { Localized } from "@/lib/i18n";

/**
 * Curated info for common structures found across the sites.
 * `blurb` is shown in the structure detail dialog; `image` reuses a verified
 * Wikimedia Commons URL from the site gallery when one exists.
 */
export const structureInfo: Partial<Record<string, { blurb: Localized; image?: string }>> = {
  "Celsus Kütüphanesi": {
    blurb: {
      tr: "Roma döneminin en görkemli kütüphanelerinden biri; MS 117'de Celsus'un mezar anıtı olarak inşa edildi. Ön cephesi yaklaşık 12.000 parşomen tomarı barındırıyordu.",
      en: "One of the most magnificent libraries of the Roman world, built in AD 117 as the tomb monument of Celsus. Its façade once held around 12,000 scrolls.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ephesus_-_Celsus_Library.jpg/1280px-Ephesus_-_Celsus_Library.jpg",
  },
  "Library of Celsus": {
    blurb: {
      tr: "Roma döneminin en görkemli kütüphanelerinden biri; MS 117'de Celsus'un mezar anıtı olarak inşa edildi.",
      en: "One of the most magnificent libraries of the Roman world, built in AD 117 as the tomb monument of Celsus.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ephesus_-_Celsus_Library.jpg/1280px-Ephesus_-_Celsus_Library.jpg",
  },
  "Büyük Tiyatro": {
    blurb: {
      tr: "Yaklaşık 24.000 kişilik Efes'in büyük tiyatrosu; denize bakan yamaçta kesme taşla örülmüş, Roma'nın en büyük açık hava tiyatrolarından biridir.",
      en: "Ephesus' great theatre, seating about 24,000 people on a hillside facing the harbour — one of the largest open-air theatres of the Roman world.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Ephesus_-_Great_Theater.jpg/1280px-Ephesus_-_Great_Theater.jpg",
  },
  "Great Theatre": {
    blurb: {
      tr: "Yaklaşık 24.000 kişilik büyük tiyatro; Roma'nın en büyük açık hava tiyatrolarından biri.",
      en: "A theatre seating about 24,000 people — one of the largest open-air theatres of the Roman world.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Ephesus_-_Great_Theater.jpg/1280px-Ephesus_-_Great_Theater.jpg",
  },
  "Yamaç Evler": {
    blurb: {
      tr: "Bülbül Dağı yamacındaki zengin konutları; mozaikleri ve duvar resimleriyle 'Romalı zenginlerin evleri' olarak bilinir.",
      en: "The terraced houses of the wealthy on Bulbul Hill, famous for their mosaics and wall paintings.",
    },
  },
  "Terrace Houses": {
    blurb: {
      tr: "Zenginlerin yamaçtaki konutları; mozaikleri ve duvar resimleriyle ünlü.",
      en: "The terraced houses of the wealthy, famous for their mosaics and wall paintings.",
    },
  },
  "Artemis Tapınağı": {
    blurb: {
      tr: "Dünyanın Yedi Harikası'ndan biri; bugün ayakta kalan tek sütunu ve temel kalıntıları görülebilir.",
      en: "One of the Seven Wonders of the Ancient World; a single column and foundation remains are visible today.",
    },
  },
  "Temple of Artemis": {
    blurb: {
      tr: "Dünyanın Yedi Harikası'ndan biri; bugün ayakta kalan tek sütunu görülebilir.",
      en: "One of the Seven Wonders of the Ancient World; a single column remains today.",
    },
  },
  "Kuretler Caddesi": {
    blurb: {
      tr: "Celsus Kütüphanesi'ni tiyatroya bağlayan, anıtlar ve heykellerle süslü ana cadde.",
      en: "The main colonnaded street connecting the Library of Celsus to the theatre, lined with monuments and statues.",
    },
  },
  "Curetes Street": {
    blurb: {
      tr: "Kütüphaneyi tiyatroya bağlayan, heykellerle süslü ana cadde.",
      en: "The main street connecting the library to the theatre, lined with statues.",
    },
  },
  Tiyatro: {
    blurb: {
      tr: "Yamaca oyulmuş antik tiyatro; kentin sosyal ve kültürel hayatının kalbiydi.",
      en: "The ancient theatre carved into the hillside — the heart of the city's social and cultural life.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Aspendos_Theatre%2C_Turkey.jpg/1280px-Aspendos_Theatre%2C_Turkey.jpg",
  },
  Theatre: {
    blurb: {
      tr: "Yamaca oyulmuş antik tiyatro; kentin sosyal ve kültürel hayatının kalbiydi.",
      en: "The ancient theatre carved into the hillside — the heart of the city's social and cultural life.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Aspendos_Theatre%2C_Turkey.jpg/1280px-Aspendos_Theatre%2C_Turkey.jpg",
  },
  "Antik tiyatro": {
    blurb: {
      tr: "Yamaca oyulmuş antik tiyatro; kentin sosyal ve kültürel hayatının kalbiydi.",
      en: "The ancient theatre carved into the hillside — the heart of the city's social and cultural life.",
    },
  },
  "Antik theatre": {
    blurb: {
      tr: "Yamaca oyulmuş antik tiyatro; kentin sosyal ve kültürel hayatının kalbiydi.",
      en: "The ancient theatre carved into the hillside — the heart of the city's social and cultural life.",
    },
  },
  "Roma Tiyatrosu": {
    blurb: {
      tr: "Roma döneminde yamaca oyulmuş tiyatro; binlerce kişiyi ağırlardı.",
      en: "A Roman-era theatre carved into the hillside that seated thousands.",
    },
  },
  "Roman Theatre": {
    blurb: {
      tr: "Roma döneminde yamaca oyulmuş tiyatro; binlerce kişiyi ağırlardı.",
      en: "A Roman-era theatre carved into the hillside that seated thousands.",
    },
  },
  Agora: {
    blurb: {
      tr: "Kentin alışveriş, siyaset ve toplanma merkezi olan sütunlu açık meydan.",
      en: "The columned open square that served as the city's marketplace and civic meeting place.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Agora_%28Perge%29_01.jpg/1280px-Agora_%28Perge%29_01.jpg",
  },
  "Yukarı Agora": {
    blurb: {
      tr: "Kent merkezindeki ana toplanma ve ticaret meydanı.",
      en: "The main civic and commercial square at the centre of the city.",
    },
  },
  "Upper Agora": {
    blurb: {
      tr: "Kent merkezindeki ana toplanma ve ticaret meydanı.",
      en: "The main civic and commercial square at the centre of the city.",
    },
  },
  "Kuzey Agora": {
    blurb: {
      tr: "Kentin kuzeyindeki sütunlu ticaret ve toplanma meydanı.",
      en: "The colonnaded commercial square in the north of the city.",
    },
  },
  "North Agora": {
    blurb: {
      tr: "Kentin kuzeyindeki sütunlu ticaret meydanı.",
      en: "The colonnaded commercial square in the north of the city.",
    },
  },
  Stadyum: {
    blurb: {
      tr: "Yarış ve spor müsabakalarının yapıldığı uzun, at nalı biçimli arena.",
      en: "The long, horseshoe-shaped arena used for races and athletic contests.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Aphrodisias_-_Stadium_01.jpg/1280px-Aphrodisias_-_Stadium_01.jpg",
  },
  Stadium: {
    blurb: {
      tr: "Yarış ve spor müsabakalarının yapıldığı uzun arena.",
      en: "The long arena used for races and athletic contests.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Aphrodisias_-_Stadium_01.jpg/1280px-Aphrodisias_-_Stadium_01.jpg",
  },
  Nekropol: {
    blurb: {
      tr: "Kent sınırlarının dışındaki antik mezarlık; kaya mezarları ve lahitler barındırır.",
      en: "The ancient cemetery outside the city walls, containing rock-cut tombs and sarcophagi.",
    },
  },
  Necropolis: {
    blurb: {
      tr: "Kent sınırlarının dışındaki antik mezarlık.",
      en: "The ancient cemetery outside the city walls.",
    },
  },
  "Kaya mezarları": {
    blurb: {
      tr: "Kayalara oyulmuş, cepheleri sütun ve kabartmalarla süslü mezarlar.",
      en: "Tombs carved into the rock, their façades adorned with columns and reliefs.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Myra_Rock_Tombs.jpg/1280px-Myra_Rock_Tombs.jpg",
  },
  "Rock-cut tombs": {
    blurb: {
      tr: "Kayalara oyulmuş, cepheleri sütun ve kabartmalarla süslü mezarlar.",
      en: "Tombs carved into the rock, their façades adorned with columns and reliefs.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Myra_Rock_Tombs.jpg/1280px-Myra_Rock_Tombs.jpg",
  },
  "Kent surları": {
    blurb: {
      tr: "Kenti savunmak için taştan örülen çevre duvarları ve burçlar.",
      en: "The stone circuit walls and bastions built to defend the city.",
    },
  },
  "City walls": {
    blurb: {
      tr: "Kenti savunmak için taştan örülen çevre duvarları.",
      en: "The stone circuit walls built to defend the city.",
    },
  },
  "Kent kapısı": {
    blurb: {
      tr: "Sur hattındaki anıtsal giriş kapısı; zafer takı görünümünde yapılırdı.",
      en: "The monumental gateway in the city walls, often built in the form of a triumphal arch.",
    },
  },
  "City gate": {
    blurb: {
      tr: "Sur hattındaki anıtsal giriş kapısı.",
      en: "The monumental gateway in the city walls.",
    },
  },
  Hamam: {
    blurb: {
      tr: "Sıcak, ılık ve soğuk bölümleri olan Roma hamamı; ısıtma sistemi yerden geçerdi.",
      en: "A Roman bath with hot, warm and cold rooms, heated by an underfloor system.",
    },
  },
  Hamamlar: {
    blurb: {
      tr: "Yerden ısıtmalı, sıcak ve soğuk bölümleri olan Roma hamamları.",
      en: "Roman baths with underfloor heating and hot and cold rooms.",
    },
  },
  "Roma Hamamı": {
    blurb: {
      tr: "Yerden ısıtmalı, sıcak ve soğuk bölümleri olan büyük Roma hamamı.",
      en: "A large Roman bath complex with underfloor heating and hot and cold rooms.",
    },
  },
  Baths: {
    blurb: {
      tr: "Yerden ısıtmalı Roma hamamı.",
      en: "Roman baths with underfloor heating.",
    },
  },
  "Bath complex": {
    blurb: {
      tr: "Yerden ısıtmalı, çok bölümlü Roma hamam kompleksi.",
      en: "A multi-room Roman bath complex with underfloor heating.",
    },
  },
  "Anıtsal Çeşme": {
    blurb: {
      tr: "Tanrı ve mitolojik figürlerle süslü, kentin ana su dağıtım yapısı.",
      en: "The city's principal water-dispensing structure, adorned with gods and mythological figures.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Sagalassos_-_Nymphaeum.jpg/1280px-Sagalassos_-_Nymphaeum.jpg",
  },
  Nymphaeum: {
    blurb: {
      tr: "Tanrı ve mitolojik figürlerle süslü, kentin ana su dağıtım yapısı.",
      en: "The city's principal water-dispensing structure, adorned with gods and mythological figures.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Sagalassos_-_Nymphaeum.jpg/1280px-Sagalassos_-_Nymphaeum.jpg",
  },
  Mozaikler: {
    blurb: {
      tr: "Tabanda ve duvarlarda görülen, renkli taşlarla işlenmiş zengin mozaik döşemeler.",
      en: "Rich mosaic floors and wall panels worked in coloured stone.",
    },
  },
  Mosaics: {
    blurb: {
      tr: "Renkli taşlarla işlenmiş mozaik döşemeler.",
      en: "Mosaic floors worked in coloured stone.",
    },
  },
  "Kral Kapı": {
    blurb: {
      tr: "Kentin anıtsal kral kapısı; hükümdarın kente girişini simgeler.",
      en: "The city's monumental royal gate, symbolising the sovereign's entry.",
    },
  },
  "King's Gate": {
    blurb: {
      tr: "Kentin anıtsal kral kapısı.",
      en: "The city's monumental royal gate.",
    },
  },
  "Sfenksli Kapı": {
    blurb: {
      tr: "İki yanında sfenks kabartmaları bulunan anıtsal kapı.",
      en: "A monumental gate flanked by sphinx reliefs.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg/1280px-Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg",
  },
  "Sphinx Gate": {
    blurb: {
      tr: "İki yanında sfenks kabartmaları bulunan anıtsal kapı.",
      en: "A monumental gate flanked by sphinx reliefs.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg/1280px-Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg",
  },
  Bazilika: {
    blurb: {
      tr: "Uzun planlı, sütunlu bir bina; erken Hristiyanlıkta ibadet ve toplantı mekânı olarak kullanıldı.",
      en: "A long, columned building used for worship and assemblies in early Christianity.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Basilica_Baths%2C_Hierapolis_01.jpg/1280px-Basilica_Baths%2C_Hierapolis_01.jpg",
  },
  Basilica: {
    blurb: {
      tr: "Uzun planlı, sütunlu bina; erken Hristiyanlıkta ibadet ve toplantı mekânı olarak kullanıldı.",
      en: "A long, columned building used for worship and assemblies in early Christianity.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Basilica_Baths%2C_Hierapolis_01.jpg/1280px-Basilica_Baths%2C_Hierapolis_01.jpg",
  },
  Sinagog: {
    blurb: {
      tr: "Yahudi cemaatinin ibadet ve toplanma merkezi.",
      en: "The worship and assembly centre of the Jewish community.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Sardis_Synagogue%2C_late_3rd_century_AD%2C_Sardis%2C_Lydia%2C_Turkey_%2818897204194%29.jpg/1280px-Sardis_Synagogue%2C_late_3rd_century_AD%2C_Sardis%2C_Lydia%2C_Turkey_%2818897204194%29.jpg",
  },
  Synagogue: {
    blurb: {
      tr: "Yahudi cemaatinin ibadet ve toplanma merkezi.",
      en: "The worship and assembly centre of the Jewish community.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Sardis_Synagogue%2C_late_3rd_century_AD%2C_Sardis%2C_Lydia%2C_Turkey_%2818897204194%29.jpg/1280px-Sardis_Synagogue%2C_late_3rd_century_AD%2C_Sardis%2C_Lydia%2C_Turkey_%2818897204194%29.jpg",
  },
  "Hadrian Kapısı": {
    blurb: {
      tr: "Roma İmparatoru Hadrianus onuruna yapılan, zafer takı biçimli giriş kapısı.",
      en: "A triumphal-arch gateway built in honour of the Roman emperor Hadrian.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Side_-_Vespasian_Gate.jpg/1280px-Side_-_Vespasian_Gate.jpg",
  },
  "Hadrian's Gate": {
    blurb: {
      tr: "İmparator Hadrianus onuruna yapılan zafer takı biçimli kapı.",
      en: "A triumphal-arch gateway built in honour of the emperor Hadrian.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Side_-_Vespasian_Gate.jpg/1280px-Side_-_Vespasian_Gate.jpg",
  },
  "Sütunlu Cadde": {
    blurb: {
      tr: "İki yanı sütunlarla çevrili, kentin ana yaya arteri.",
      en: "The city's main pedestrian artery, flanked by colonnades.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Cardo_%28Perge%29.jpg/1280px-Cardo_%28Perge%29.jpg",
  },
  "Colonnaded Street": {
    blurb: {
      tr: "İki yanı sütunlarla çevrili ana yaya arteri.",
      en: "The main pedestrian artery flanked by colonnades.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Cardo_%28Perge%29.jpg/1280px-Cardo_%28Perge%29.jpg",
  },
  "Ani Katedrali": {
    blurb: {
      tr: "Ermeni mimarisinin başyapıtlarından; MS 1001 yılında tamamlanan kubbeli katedral.",
      en: "A masterpiece of Armenian architecture; the domed cathedral completed in AD 1001.",
    },
  },
  "Ani Cathedral": {
    blurb: {
      tr: "Ermeni mimarisinin başyapıtlarından; MS 1001'de tamamlanan kubbeli katedral.",
      en: "A masterpiece of Armenian architecture; the domed cathedral completed in AD 1001.",
    },
  },
  "Menuçehr Camii": {
    blurb: {
      tr: "Anadolu'nun en eski camilerinden kabul edilen Selçuklu yapısı.",
      en: "A Seljuk building regarded among Anatolia's oldest mosques.",
    },
  },
  "Menüçehr Mosque": {
    blurb: {
      tr: "Anadolu'nun en eski camilerinden kabul edilen Selçuklu yapısı.",
      en: "A Seljuk building regarded among Anatolia's oldest mosques.",
    },
  },
  "Haldi Tapınağı": {
    blurb: {
      tr: "Urartuların baş tanrısı Haldi'ye adanmış kutsal yapı.",
      en: "A sacred building dedicated to Haldi, chief god of the Urartians.",
    },
  },
  "Temple of Haldi": {
    blurb: {
      tr: "Urartuların baş tanrısı Haldi'ye adanmış kutsal yapı.",
      en: "A sacred building dedicated to Haldi, chief god of the Urartians.",
    },
  },
  "Sardur Burcu": {
    blurb: {
      tr: "Urartu Kralı Sarduri tarafından yaptırılan savunma burcu.",
      en: "A defensive bastion built by the Urartian king Sarduri.",
    },
  },
  "Sardur Bastion": {
    blurb: {
      tr: "Urartu Kralı Sarduri tarafından yaptırılan savunma burcu.",
      en: "A defensive bastion built by the Urartian king Sarduri.",
    },
  },
  "Kral Yolu": {
    blurb: {
      tr: "Perslerin başkentleri birbirine bağlayan ünlü anayolu.",
      en: "The famous royal road that connected the Persian capitals.",
    },
  },
  "King's Road": {
    blurb: {
      tr: "Perslerin başkentleri birbirine bağlayan ünlü anayolu.",
      en: "The famous royal road that connected the Persian capitals.",
    },
  },
  "T biçimli dikilitaşlar": {
    blurb: {
      tr: "Göbeklitepe'nin simgesi olan, hayvan kabartmalı T biçimli taşlar.",
      en: "The T-shaped monoliths with animal reliefs that symbolise Göbeklitepe.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/G%C3%B6bekli_Tepe%2C_Urfa.jpg/1280px-G%C3%B6bekli_Tepe%2C_Urfa.jpg",
  },
  "T-shaped pillars": {
    blurb: {
      tr: "Göbeklitepe'nin simgesi olan, hayvan kabartmalı T biçimli taşlar.",
      en: "The T-shaped monoliths with animal reliefs that symbolise Göbeklitepe.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/G%C3%B6bekli_Tepe%2C_Urfa.jpg/1280px-G%C3%B6bekli_Tepe%2C_Urfa.jpg",
  },
  "Dev tanrı başları": {
    blurb: {
      tr: "Nemrut Dağı'nın kuzey ve doğu teraslarında sıralanan dev heykel başları.",
      en: "The colossal heads lined up on Nemrut's north and east terraces.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/001362_Nemrut_Da%C4%9F%C4%B1_-_T%C3%BCrkei.jpg/1280px-001362_Nemrut_Da%C4%9F%C4%B1_-_T%C3%BCrkei.jpg",
  },
  "Colossal heads": {
    blurb: {
      tr: "Nemrut Dağı'nın teraslarında sıralanan dev heykel başları.",
      en: "The colossal heads lined up on Nemrut's terraces.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/001362_Nemrut_Da%C4%9F%C4%B1_-_T%C3%BCrkei.jpg/1280px-001362_Nemrut_Da%C4%9F%C4%B1_-_T%C3%BCrkei.jpg",
  },
  "Zeugma Mozaik Müzesi": {
    blurb: {
      tr: "Dünyanın en zengin mozaik koleksiyonlarından birine ev sahipliği yapan müze.",
      en: "A museum housing one of the world's richest mosaic collections.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Gaziantep_Zeugma_Museum_Dionysos_Triumf_mosaic_1921.jpg/1280px-Gaziantep_Zeugma_Museum_Dionysos_Triumf_mosaic_1921.jpg",
  },
  "Zeugma Mosaic Museum": {
    blurb: {
      tr: "Dünyanın en zengin mozaik koleksiyonlarından birine ev sahipliği yapan müze.",
      en: "A museum housing one of the world's richest mosaic collections.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Gaziantep_Zeugma_Museum_Dionysos_Triumf_mosaic_1921.jpg/1280px-Gaziantep_Zeugma_Museum_Dionysos_Triumf_mosaic_1921.jpg",
  },
  "Kümbet evler": {
    blurb: {
      tr: "Harran'ın simgesi olan, konik damlı balçık evler; içeride serin tutar.",
      en: "Harran's iconic beehive houses with conical mud-brick roofs that keep interiors cool.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Harran_Beehive_houses_192b.jpg/1280px-Harran_Beehive_houses_192b.jpg",
  },
  "Beehive houses": {
    blurb: {
      tr: "Harran'ın simgesi olan, konik damlı balçık evler.",
      en: "Harran's iconic beehive houses with conical mud-brick roofs.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Harran_Beehive_houses_192b.jpg/1280px-Harran_Beehive_houses_192b.jpg",
  },
  "Bodrum Kalesi": {
    blurb: {
      tr: "St. Jean Şövalyeleri'nin 15. yüzyılda inşa ettiği, günümüzde sualtı arkeoloji müzesi olan kale.",
      en: "A 15th-century fortress built by the Knights of St John, now home to a museum of underwater archaeology.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5e/Mausoleum_at_Halicarnassus_at_the_Bodrum_Museum_of_Underwater_Archaeology.jpg",
  },
  "Bodrum Castle": {
    blurb: {
      tr: "St. Jean Şövalyeleri'nin inşa ettiği, sualtı arkeoloji müzesi olan kale.",
      en: "A fortress built by the Knights of St John, now a museum of underwater archaeology.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5e/Mausoleum_at_Halicarnassus_at_the_Bodrum_Museum_of_Underwater_Archaeology.jpg",
  },
  "Yanartaş (Khimaira)": {
    blurb: {
      tr: "Kayadan çıkan sürekli alevler; mitolojide Khimaira'nın nefes aldığı yer sayılır.",
      en: "Everlasting flames rising from the rock, mythologically the breath of the Chimera.",
    },
  },
  "Chimaera flames": {
    blurb: {
      tr: "Kayadan çıkan sürekli alevler; Khimaira'nın nefesi sayılır.",
      en: "Everlasting flames rising from the rock, said to be the Chimera's breath.",
    },
  },
  "Truva atı replikası": {
    blurb: {
      tr: "Homeros'un İlyada destanındaki meşhur tahta atın bir replikası.",
      en: "A replica of the famous wooden horse of Homer's Iliad.",
    },
  },
  "Trojan horse replica": {
    blurb: {
      tr: "İlyada destanındaki meşhur tahta atın replikası.",
      en: "A replica of the famous wooden horse of the Iliad.",
    },
  },
  "Aziz Nikolaos Kilisesi": {
    blurb: {
      tr: "Noel Baba efsanesine ilham veren Aziz Nikolaos'un kenti Myra'daki kilisesi.",
      en: "The church of St Nicholas in Myra, whose legend inspired Santa Claus.",
    },
  },
  "Church of St Nicholas": {
    blurb: {
      tr: "Aziz Nikolaos'un kenti Myra'daki kilisesi.",
      en: "The church of St Nicholas in Myra.",
    },
  },
  "Zeus Sunağı terası": {
    blurb: {
      tr: "Helenistik dönemin en ünlü kabartmalı sunağının bulunduğu teras.",
      en: "The terrace that held the most famous sculpted altar of the Hellenistic age.",
    },
  },
  "Great Altar terrace": {
    blurb: {
      tr: "Helenistik dönemin en ünlü kabartmalı sunağının bulunduğu teras.",
      en: "The terrace that held the most famous sculpted altar of the Hellenistic age.",
    },
  },
  "Kızıl Avlu": {
    blurb: {
      tr: "Bergama'daki büyük tuğla yapı kompleksi; Mısır tanrılarının kutsal alanıydı.",
      en: "The great brick complex at Pergamon, once a sanctuary of the Egyptian gods.",
    },
  },
  "Red Basilica": {
    blurb: {
      tr: "Bergama'daki büyük tuğla yapı kompleksi.",
      en: "The great brick complex at Pergamon.",
    },
  },
  "Yerkapı tüneli": {
    blurb: {
      tr: "Hattuşa surlarının altından geçen 80 metrelik anıtsal tünel.",
      en: "The 80-metre monumental tunnel passing beneath the walls of Hattusa.",
    },
  },
  "Yerkapı tunnel": {
    blurb: {
      tr: "Hattuşa surlarının altından geçen 80 metrelik tünel.",
      en: "The 80-metre tunnel passing beneath the walls of Hattusa.",
    },
  },
  "Aslanlı Kapı": {
    blurb: {
      tr: "İki yanındaki aslan kabartmalarıyla ünlü Hitit başkentinin kapısı.",
      en: "The gate of the Hittite capital famed for its lion reliefs.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Lion_Gate%2C_Hattusa_01.jpg/1280px-Lion_Gate%2C_Hattusa_01.jpg",
  },
  "Lion Gate": {
    blurb: {
      tr: "İki yanındaki aslan kabartmalarıyla ünlü Hitit başkentinin kapısı.",
      en: "The gate of the Hittite capital famed for its lion reliefs.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Lion_Gate%2C_Hattusa_01.jpg/1280px-Lion_Gate%2C_Hattusa_01.jpg",
  },
  "Midas Tümülüsü": {
    blurb: {
      tr: "Anadolu'nun en büyük mezar höyüklerinden biri; Frig Kralı Midas'a atfedilir.",
      en: "One of Anatolia's largest burial mounds, attributed to the Phrygian king Midas.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Gordion_18_05_1989_Ruinen_und_Tumulus_%28Hintergrund%29.jpg/1280px-Gordion_18_05_1989_Ruinen_und_Tumulus_%28Hintergrund%29.jpg",
  },
  "Midas Tumulus": {
    blurb: {
      tr: "Anadolu'nun en büyük mezar höyüklerinden biri; Kral Midas'a atfedilir.",
      en: "One of Anatolia's largest burial mounds, attributed to King Midas.",
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Gordion_18_05_1989_Ruinen_und_Tumulus_%28Hintergrund%29.jpg/1280px-Gordion_18_05_1989_Ruinen_und_Tumulus_%28Hintergrund%29.jpg",
  },
  "dairesel kutsal yapılar": {
    blurb: {
      tr: "İçlerinde T biçimli dikilitaşlar barındıran, yuvarlak planlı kutsal yapılar; Taş Tepeler döneminin ortak özelliği.",
      en: "Round-planned cult enclosures housing T-shaped pillars — a hallmark of the Taş Tepeler period.",
    },
  },
  "circular enclosures": {
    blurb: {
      tr: "İçlerinde T biçimli dikilitaşlar barındıran, yuvarlak planlı kutsal yapılar; Taş Tepeler döneminin ortak özelliği.",
      en: "Round-planned cult enclosures housing T-shaped pillars — a hallmark of the Taş Tepeler period.",
    },
  },
  "kaya içi havuzlar": {
    blurb: {
      tr: "Kayaya oyulmuş, ritüel amaçlı olduğu düşünülen havuzlar.",
      en: "Basins carved into the bedrock, thought to have served ritual purposes.",
    },
  },
  "rock-cut basins": {
    blurb: {
      tr: "Kayaya oyulmuş, ritüel amaçlı olduğu düşünülen havuzlar.",
      en: "Basins carved into the bedrock, thought to have served ritual purposes.",
    },
  },
  "antropomorfik heykeller": {
    blurb: {
      tr: "İnsan biçimli taş heykeller; Neolitik dönemin en eski anıtsal örnekleri arasındadır.",
      en: "Human-shaped stone statues, among the earliest monumental examples of the Neolithic era.",
    },
  },
  "anthropomorphic statues": {
    blurb: {
      tr: "İnsan biçimli taş heykeller; Neolitik dönemin en eski anıtsal örnekleri arasındadır.",
      en: "Human-shaped stone statues, among the earliest monumental examples of the Neolithic era.",
    },
  },
  "taş oturma banklı yapı": {
    blurb: {
      tr: "İçinde taştan oturma bankları bulunan, toplanma amaçlı kullanılan yapı.",
      en: "A building with stone benches inside, used as a gathering place.",
    },
  },
  "structure with stone bench": {
    blurb: {
      tr: "İçinde taştan oturma bankları bulunan, toplanma amaçlı kullanılan yapı.",
      en: "A building with stone benches inside, used as a gathering place.",
    },
  },
  "kült yapısı": {
    blurb: {
      tr: "Dini törenler için inşa edilmiş, özel amaçlı yapı.",
      en: "A purpose-built structure reserved for religious rituals.",
    },
  },
  "cult building": {
    blurb: {
      tr: "Dini törenler için inşa edilmiş, özel amaçlı yapı.",
      en: "A purpose-built structure reserved for religious rituals.",
    },
  },
  "dikdörtgen evler": {
    blurb: {
      tr: "Neolitik yerleşimin bitişik düzende, dikdörtgen planlı konutları.",
      en: "The rectangular, tightly clustered dwellings of the Neolithic settlement.",
    },
  },
  "rectangular houses": {
    blurb: {
      tr: "Neolitik yerleşimin bitişik düzende, dikdörtgen planlı konutları.",
      en: "The rectangular, tightly clustered dwellings of the Neolithic settlement.",
    },
  },
  "taş baş heykeller": {
    blurb: {
      tr: "Bazıları taşınabilir, insan başı biçiminde yontulmuş heykelcikler.",
      en: "Carved human head statues, some of which were portable.",
    },
  },
  "stone head statues": {
    blurb: {
      tr: "Bazıları taşınabilir, insan başı biçiminde yontulmuş heykelcikler.",
      en: "Carved human head statues, some of which were portable.",
    },
  },
  "fırınlı açık alan": {
    blurb: {
      tr: "Toplu yemek pişirme için fırınlar içeren açık çalışma alanı.",
      en: "An open work area with ovens used for communal cooking.",
    },
  },
  "open area with ovens": {
    blurb: {
      tr: "Toplu yemek pişirme için fırınlar içeren açık çalışma alanı.",
      en: "An open work area with ovens used for communal cooking.",
    },
  },
  "kalıp kerpiç evler": {
    blurb: {
      tr: "Kalıpla şekillendirilmiş kerpiç bloklarla örülmüş konutlar.",
      en: "Houses built with mould-shaped mudbrick blocks.",
    },
  },
  "moulded mudbrick houses": {
    blurb: {
      tr: "Kalıpla şekillendirilmiş kerpiç bloklarla örülmüş konutlar.",
      en: "Houses built with mould-shaped mudbrick blocks.",
    },
  },
  "fırınlar ve ocaklar": {
    blurb: {
      tr: "Günlük yaşamda pişirme ve ısınma için kullanılan fırın ve ocaklar.",
      en: "Ovens and hearths used for cooking and heating in daily life.",
    },
  },
  "ovens and hearths": {
    blurb: {
      tr: "Günlük yaşamda pişirme ve ısınma için kullanılan fırın ve ocaklar.",
      en: "Ovens and hearths used for cooking and heating in daily life.",
    },
  },
  "düzenli sokak dokusu": {
    blurb: {
      tr: "Önceden planlanmış, paralel sokaklara sahip yerleşim düzeni.",
      en: "A planned settlement layout with parallel streets.",
    },
  },
  "regular street layout": {
    blurb: {
      tr: "Önceden planlanmış, paralel sokaklara sahip yerleşim düzeni.",
      en: "A planned settlement layout with parallel streets.",
    },
  },
  "çöp çukurları ve mezarlar": {
    blurb: {
      tr: "Yerleşim içindeki gömüler ve ev çukurları; günlük yaşama dair zengin buluntular verir.",
      en: "Burials and household pits that yield rich evidence of daily life.",
    },
  },
  "trash pits and burials": {
    blurb: {
      tr: "Yerleşim içindeki gömüler ve ev çukurları; günlük yaşama dair zengin buluntular verir.",
      en: "Burials and household pits that yield rich evidence of daily life.",
    },
  },
  "köy planlı yerleşim": {
    blurb: {
      tr: "Ortak alanlarla düzenlenmiş, erken yerleşimlerin örnek aldığı köy planı.",
      en: "A village layout arranged around communal spaces, typical of early settlements.",
    },
  },
  "village-planned settlement": {
    blurb: {
      tr: "Ortak alanlarla düzenlenmiş, erken yerleşimlerin örnek aldığı köy planı.",
      en: "A village layout arranged around communal spaces, typical of early settlements.",
    },
  },
  Saray: {
    blurb: {
      tr: "Anıtsal kerpiç saray; Asur ticaret kolonileri çağının önemli merkezlerindendi.",
      en: "The monumental mudbrick palace, a major centre of the Assyrian trading colony period.",
    },
  },
  "the Palace": {
    blurb: {
      tr: "Anıtsal kerpiç saray; Asur ticaret kolonileri çağının önemli merkezlerindendi.",
      en: "The monumental mudbrick palace, a major centre of the Assyrian trading colony period.",
    },
  },
  "Hatipler Sarayı": {
    blurb: {
      tr: "Acemhöyük'te ortaya çıkarılan büyük saray; çivi yazılı mühür baskılarıyla ünlüdür.",
      en: "The great palace unearthed at Acemhöyük, famous for its cuneiform seal impressions.",
    },
  },
  "Hatipler Palace": {
    blurb: {
      tr: "Acemhöyük'te ortaya çıkarılan büyük saray; çivi yazılı mühür baskılarıyla ünlüdür.",
      en: "The great palace unearthed at Acemhöyük, famous for its cuneiform seal impressions.",
    },
  },
  "anıtsal sur duvarları": {
    blurb: {
      tr: "Kerpiçten örülmüş, kalın ve yüksek savunma duvarları.",
      en: "Thick, towering fortification walls built of mudbrick.",
    },
  },
  "monumental fortification walls": {
    blurb: {
      tr: "Kerpiçten örülmüş, kalın ve yüksek savunma duvarları.",
      en: "Thick, towering fortification walls built of mudbrick.",
    },
  },
  "depo odaları": {
    blurb: {
      tr: "Tahıl ve ticari malların saklandığı bölmeler.",
      en: "Compartments used to store grain and trade goods.",
    },
  },
  "storage rooms": {
    blurb: {
      tr: "Tahıl ve ticari malların saklandığı bölmeler.",
      en: "Compartments used to store grain and trade goods.",
    },
  },
  "fildişi işlik alanı": {
    blurb: {
      tr: "Fildişi işçiliğinin yapıldığı atölye; bölgenin önemli zanaat merkezlerindendi.",
      en: "A workshop where ivory was worked — among the region's important craft centres.",
    },
  },
  "ivory workshop area": {
    blurb: {
      tr: "Fildişi işçiliğinin yapıldığı atölye; bölgenin önemli zanaat merkezlerindendi.",
      en: "A workshop where ivory was worked — among the region's important craft centres.",
    },
  },
  "A Yapısı (arşiv binası)": {
    blurb: {
      tr: "Acemhöyük'te mühür ve arşiv belgelerinin bulunduğu yapı.",
      en: "The building at Acemhöyük that held seals and archive documents.",
    },
  },
  "Building A (archive building)": {
    blurb: {
      tr: "Acemhöyük'te mühür ve arşiv belgelerinin bulunduğu yapı.",
      en: "The building at Acemhöyük that held seals and archive documents.",
    },
  },
  "B Yapısı (depo)": {
    blurb: {
      tr: "Acemhöyük'te depolama amaçlı kullanılan yapı.",
      en: "The storehouse building at Acemhöyük.",
    },
  },
  "Building B (storehouse)": {
    blurb: {
      tr: "Acemhöyük'te depolama amaçlı kullanılan yapı.",
      en: "The storehouse building at Acemhöyük.",
    },
  },
  "Yazılıkaya üsluplu orto statlı yapı": {
    blurb: {
      tr: "Duvar kaplama taşları (orto statlar) Hitit Yazılıkaya üslubunda kabartmalarla süslü yapı.",
      en: "A building whose orthostat slabs are carved with reliefs in the Hittite Yazılıkaya style.",
    },
  },
  "building with Yazılıkaya-style orthostat": {
    blurb: {
      tr: "Duvar kaplama taşları (orto statlar) Hitit Yazılıkaya üslubunda kabartmalarla süslü yapı.",
      en: "A building whose orthostat slabs are carved with reliefs in the Hittite Yazılıkaya style.",
    },
  },
  "dini tören alanları": {
    blurb: {
      tr: "İbadet ve törenler için ayrılmış mekânlar.",
      en: "Spaces reserved for worship and ceremonies.",
    },
  },
  "ritual areas": {
    blurb: {
      tr: "İbadet ve törenler için ayrılmış mekânlar.",
      en: "Spaces reserved for worship and ceremonies.",
    },
  },
  "üst ve alt şehir": {
    blurb: {
      tr: "Yüksekteki iç kale ile eteklerdeki yerleşimden oluşan iki katmanlı kent.",
      en: "A two-tiered city made up of the elevated citadel and the lower settlement.",
    },
  },
  "upper and lower city": {
    blurb: {
      tr: "Yüksekteki iç kale ile eteklerdeki yerleşimden oluşan iki katmanlı kent.",
      en: "A two-tiered city made up of the elevated citadel and the lower settlement.",
    },
  },
  "Midas Anıtı (Yazılıkaya)": {
    blurb: {
      tr: "Friglerin en ünlü kaya anıtı; ana tanrıça Matar'a adanmıştır.",
      en: "The most famous Phrygian rock monument, dedicated to the mother goddess Matar.",
    },
  },
  "Midas Monument (Yazılıkaya)": {
    blurb: {
      tr: "Friglerin en ünlü kaya anıtı; ana tanrıça Matar'a adanmıştır.",
      en: "The most famous Phrygian rock monument, dedicated to the mother goddess Matar.",
    },
  },
  "Kral Sunağı": {
    blurb: {
      tr: "Midas Şehri'nde kayaya oyulmuş, törenlerde kullanılan sunak.",
      en: "A rock-cut altar at Midas City used in ceremonies.",
    },
  },
  "King's Altar": {
    blurb: {
      tr: "Midas Şehri'nde kayaya oyulmuş, törenlerde kullanılan sunak.",
      en: "A rock-cut altar at Midas City used in ceremonies.",
    },
  },
  "kaya mezarları": {
    blurb: {
      tr: "Kayalara oyulmuş, cepheleri sütun ve kabartmalarla süslü mezarlar.",
      en: "Tombs carved into the rock, their façades adorned with columns and reliefs.",
    },
  },
  "rock-cut tombs": {
    blurb: {
      tr: "Kayalara oyulmuş, cepheleri sütun ve kabartmalarla süslü mezarlar.",
      en: "Tombs carved into the rock, their façades adorned with columns and reliefs.",
    },
  },
  "dev sarnıçlar": {
    blurb: {
      tr: "Kent suyunu depolayan, kayaya oyulmuş dev sarnıçlar.",
      en: "Great rock-cut cisterns that stored the city's water.",
    },
  },
  "great cisterns": {
    blurb: {
      tr: "Kent suyunu depolayan, kayaya oyulmuş dev sarnıçlar.",
      en: "Great rock-cut cisterns that stored the city's water.",
    },
  },
  "bitmemiş anıt": {
    blurb: {
      tr: "Yarım kalmış anıtsal yapı; antik inşa tekniklerini gösterir.",
      en: "A monumental structure left unfinished, revealing ancient building techniques.",
    },
  },
  "unfinished monument": {
    blurb: {
      tr: "Yarım kalmış anıtsal yapı; antik inşa tekniklerini gösterir.",
      en: "A monumental structure left unfinished, revealing ancient building techniques.",
    },
  },
  "apadanalı saray": {
    blurb: {
      tr: "Sütunlu büyük kabul salonu (apadana) içeren saray.",
      en: "A palace with a great columned audience hall (apadana).",
    },
  },
  "apadana palace": {
    blurb: {
      tr: "Sütunlu büyük kabul salonu (apadana) içeren saray.",
      en: "A palace with a great columned audience hall (apadana).",
    },
  },
  "açık hava tapınağı": {
    blurb: {
      tr: "Üstü kapalı olmayan, açık alanda kurulu kutsal yapı.",
      en: "A sanctuary laid out in the open, without a roof.",
    },
  },
  "open-air temple": {
    blurb: {
      tr: "Üstü kapalı olmayan, açık alanda kurulu kutsal yapı.",
      en: "A sanctuary laid out in the open, without a roof.",
    },
  },
  "büyük salon": {
    blurb: {
      tr: "Sarayın tören ve kabul amaçlı büyük salonu.",
      en: "The palace's great hall for ceremonies and audiences.",
    },
  },
  "great hall": {
    blurb: {
      tr: "Sarayın tören ve kabul amaçlı büyük salonu.",
      en: "The palace's great hall for ceremonies and audiences.",
    },
  },
  storehouses: {
    blurb: {
      tr: "Tahıl ve erzakın saklandığı depolar.",
      en: "Storehouses for grain and provisions.",
    },
  },
  "rock-cut chamber tombs": {
    blurb: {
      tr: "Kayaya oyulmuş, odalı mezar yapıları.",
      en: "Chamber tombs hewn into the rock.",
    },
  },
  "sütunlu salon": {
    blurb: {
      tr: "Sütun dizileriyle bölümlenen geniş salon.",
      en: "A wide hall divided by rows of columns.",
    },
  },
  "colonnaded hall": {
    blurb: {
      tr: "Sütun dizileriyle bölümlenen geniş salon.",
      en: "A wide hall divided by rows of columns.",
    },
  },
  "storage magazines": {
    blurb: {
      tr: "Ambar olarak kullanılan uzun depolama odaları.",
      en: "Long storage rooms used as magazines.",
    },
  },
  "andezit sur duvarları": {
    blurb: {
      tr: "Andezit bloklarla örülmüş sağlam kent surları.",
      en: "Sturdy city walls built of andesite blocks.",
    },
  },
  "andesite city walls": {
    blurb: {
      tr: "Andezit bloklarla örülmüş sağlam kent surları.",
      en: "Sturdy city walls built of andesite blocks.",
    },
  },
  "inşa yazıtı": {
    blurb: {
      tr: "Yapının kim tarafından, ne zaman yaptırıldığını anlatan yazıt.",
      en: "An inscription recording by whom and when the structure was built.",
    },
  },
  "foundation inscription": {
    blurb: {
      tr: "Yapının kim tarafından, ne zaman yaptırıldığını anlatan yazıt.",
      en: "An inscription recording by whom and when the structure was built.",
    },
  },
  "Kaya Mezarları": {
    blurb: {
      tr: "Kayalara oyulmuş, cepheleri sütun ve kabartmalarla süslü mezarlar.",
      en: "Tombs carved into the rock, their façades adorned with columns and reliefs.",
    },
  },
  "Rock-cut Tombs": {
    blurb: {
      tr: "Kayalara oyulmuş, cepheleri sütun ve kabartmalarla süslü mezarlar.",
      en: "Tombs carved into the rock, their façades adorned with columns and reliefs.",
    },
  },
  "Bizans Kilisesi": {
    blurb: {
      tr: "Bizans döneminde inşa edilmiş kilise.",
      en: "A church built in the Byzantine period.",
    },
  },
  "Byzantine Church": {
    blurb: {
      tr: "Bizans döneminde inşa edilmiş kilise.",
      en: "A church built in the Byzantine period.",
    },
  },
  Serapeion: {
    blurb: {
      tr: "Mısır tanrısı Serapis'e adanmış kutsal alan ve tapınak kompleksi.",
      en: "A sanctuary and temple complex dedicated to the Egyptian god Serapis.",
    },
  },
  Serapeum: {
    blurb: {
      tr: "Mısır tanrısı Serapis'e adanmış kutsal alan ve tapınak kompleksi.",
      en: "A sanctuary and temple complex dedicated to the Egyptian god Serapis.",
    },
  },
  Gymnasium: {
    blurb: {
      tr: "Gençlerin eğitim gördüğü, spor ve ders alanlarını içeren yapı kompleksi.",
      en: "A complex of sports and teaching halls where youths were educated.",
    },
  },
  "Kuzey Kent Kapısı": {
    blurb: {
      tr: "Kentin kuzeyindeki anıtsal giriş kapısı.",
      en: "The monumental entrance gate on the north of the city.",
    },
  },
  "North City Gate": {
    blurb: {
      tr: "Kentin kuzeyindeki anıtsal giriş kapısı.",
      en: "The monumental entrance gate on the north of the city.",
    },
  },
  "Sur Duvarları": {
    blurb: {
      tr: "Kenti çevreleyen savunma duvarları.",
      en: "The defensive walls encircling the city.",
    },
  },
  "City Walls": {
    blurb: {
      tr: "Kenti çevreleyen savunma duvarları.",
      en: "The defensive walls encircling the city.",
    },
  },
  "Zeus Tapınağı": {
    blurb: {
      tr: "Tanrıların kralı Zeus'a adanmış tapınak.",
      en: "A temple dedicated to Zeus, king of the gods.",
    },
  },
  "Temple of Zeus": {
    blurb: {
      tr: "Tanrıların kralı Zeus'a adanmış tapınak.",
      en: "A temple dedicated to Zeus, king of the gods.",
    },
  },
  "Andron A": {
    blurb: {
      tr: "Labraunda'da ziyafet salonu olarak kullanılan yapı.",
      en: "One of the banquet halls at Labraunda.",
    },
  },
  "Andron B": {
    blurb: {
      tr: "Labraunda'da ziyafet salonu olarak kullanılan ikinci yapı.",
      en: "The second banquet hall at Labraunda.",
    },
  },
  "Güney Propylon": {
    blurb: {
      tr: "Kutsal alanın güneyindeki anıtsal giriş kapısı.",
      en: "The monumental gateway at the south of the sanctuary.",
    },
  },
  "South Propylon": {
    blurb: {
      tr: "Kutsal alanın güneyindeki anıtsal giriş kapısı.",
      en: "The monumental gateway at the south of the sanctuary.",
    },
  },
  "Oikoi Binası": {
    blurb: {
      tr: "Labraunda'da küçük odalar içeren tören yapısı.",
      en: "A ceremonial building of small chambers at Labraunda.",
    },
  },
  "Oikoi Building": {
    blurb: {
      tr: "Labraunda'da küçük odalar içeren tören yapısı.",
      en: "A ceremonial building of small chambers at Labraunda.",
    },
  },
  "Artemis Leukophryene Tapınağı": {
    blurb: {
      tr: "Magnesia'nın koruyucu tanrıçası Artemis Leukophryene'ye adanmış, mimar Hermogenes'in başyapıtı tapınak.",
      en: "The masterpiece temple by the architect Hermogenes, dedicated to Magnesia's patron goddess Artemis Leukophryene.",
    },
  },
  "Temple of Artemis Leukophryene": {
    blurb: {
      tr: "Magnesia'nın koruyucu tanrıçası Artemis Leukophryene'ye adanmış, mimar Hermogenes'in başyapıtı tapınak.",
      en: "The masterpiece temple by the architect Hermogenes, dedicated to Magnesia's patron goddess Artemis Leukophryene.",
    },
  },
  "Dionysos Tapınağı": {
    blurb: {
      tr: "Şarap tanrısı Dionysos'a adanmış tapınak.",
      en: "A temple dedicated to Dionysos, god of wine.",
    },
  },
  "Temple of Dionysos": {
    blurb: {
      tr: "Şarap tanrısı Dionysos'a adanmış tapınak.",
      en: "A temple dedicated to Dionysos, god of wine.",
    },
  },
  Odeion: {
    blurb: {
      tr: "Müzik ve şiir dinletileri için küçük, kapalı tiyatro.",
      en: "A small, roofed theatre for music and poetry performances.",
    },
  },
  Odeon: {
    blurb: {
      tr: "Müzik ve şiir dinletileri için küçük, kapalı tiyatro.",
      en: "A small, roofed theatre for music and poetry performances.",
    },
  },
  Bouleuterion: {
    blurb: {
      tr: "Kent meclisinin toplandığı, yarım daire oturma sıralı yapı.",
      en: "The council house where the city assembly met, with semicircular seating.",
    },
  },
  "Zeytinyağı Atölyesi": {
    blurb: {
      tr: "Zeytinin işlenip yağının çıkarıldığı üretim atölyesi.",
      en: "A workshop where olives were pressed into oil.",
    },
  },
  "Olive Oil Workshop": {
    blurb: {
      tr: "Zeytinin işlenip yağının çıkarıldığı üretim atölyesi.",
      en: "A workshop where olives were pressed into oil.",
    },
  },
  Tapınak: {
    blurb: {
      tr: "Bir tanrı veya tanrıçaya adanmış kutsal yapı.",
      en: "A sacred building dedicated to a god or goddess.",
    },
  },
  Temple: {
    blurb: {
      tr: "Bir tanrı veya tanrıçaya adanmış kutsal yapı.",
      en: "A sacred building dedicated to a god or goddess.",
    },
  },
  "Liman Tepe Höyüğü": {
    blurb: {
      tr: "Klazomenai'ye komşu, Tunç Çağı'ndan kalma liman yerleşimi höyüğü.",
      en: "A Bronze Age harbour settlement mound near Klazomenai.",
    },
  },
  "Liman Tepe Mound": {
    blurb: {
      tr: "Klazomenai'ye komşu, Tunç Çağı'ndan kalma liman yerleşimi höyüğü.",
      en: "A Bronze Age harbour settlement mound near Klazomenai.",
    },
  },
  "Karantina Adası Akropolü": {
    blurb: {
      tr: "Klazomenai limanını koruyan ada akropolü.",
      en: "The island acropolis that guarded the harbour of Klazomenai.",
    },
  },
  "Karantina Island Acropolis": {
    blurb: {
      tr: "Klazomenai limanını koruyan ada akropolü.",
      en: "The island acropolis that guarded the harbour of Klazomenai.",
    },
  },
  "Apollon Tapınağı": {
    blurb: {
      tr: "Kahin tanrı Apollon'a adanmış tapınak.",
      en: "A temple dedicated to the oracular god Apollo.",
    },
  },
  "Temple of Apollo": {
    blurb: {
      tr: "Kahin tanrı Apollon'a adanmış tapınak.",
      en: "A temple dedicated to the oracular god Apollo.",
    },
  },
  "Artemis Sunağı": {
    blurb: {
      tr: "Klaros'ta Artemis kültü için yapılmış sunak.",
      en: "An altar built for the cult of Artemis at Klaros.",
    },
  },
  "Altar of Artemis": {
    blurb: {
      tr: "Klaros'ta Artemis kültü için yapılmış sunak.",
      en: "An altar built for the cult of Artemis at Klaros.",
    },
  },
  Propylon: {
    blurb: {
      tr: "Kutsal alana girişi sağlayan anıtsal kapı yapısı.",
      en: "The monumental gateway giving entry to the sanctuary.",
    },
  },
  "Kehanet Mahzeni (Krypta)": {
    blurb: {
      tr: "Klaros'un kahin kehanetlerinin verildiği yer altı odası.",
      en: "The underground chamber at Klaros where oracles were delivered.",
    },
  },
  "Oracular Crypt (Adyton)": {
    blurb: {
      tr: "Klaros'un kahin kehanetlerinin verildiği yer altı odası.",
      en: "The underground chamber at Klaros where oracles were delivered.",
    },
  },
  "Kutsal Yol": {
    blurb: {
      tr: "Tapınağa giden, iki yanı anıtlarla çevrili tören yolu.",
      en: "The processional road to the temple, lined with monuments.",
    },
  },
  "Sacred Way": {
    blurb: {
      tr: "Tapınağa giden, iki yanı anıtlarla çevrili tören yolu.",
      en: "The processional road to the temple, lined with monuments.",
    },
  },
  "Tiyatro-Stadyum Kompleksi": {
    blurb: {
      tr: "Tiyatro ve stadyumun bir arada planlandığı yapı grubu.",
      en: "A combined theatre and stadium complex.",
    },
  },
  "Theatre-Stadium Complex": {
    blurb: {
      tr: "Tiyatro ve stadyumun bir arada planlandığı yapı grubu.",
      en: "A combined theatre and stadium complex.",
    },
  },
  "Antik Borsa (Macellum)": {
    blurb: {
      tr: "Roma döneminin anıtsal gıda pazarı; Aizanoi'nin ünlü macellum'u.",
      en: "A monumental Roman food market; Aizanoi's famous macellum.",
    },
  },
  "Ancient Stock Exchange (Macellum)": {
    blurb: {
      tr: "Roma döneminin anıtsal gıda pazarı; Aizanoi'nin ünlü macellum'u.",
      en: "A monumental Roman food market; Aizanoi's famous macellum.",
    },
  },
  "Penkalas Köprüsü": {
    blurb: {
      tr: "Aizanoi'de Penkalas Çayı üzerindeki Roma köprülerinden biri.",
      en: "One of the Roman bridges over the Penkalas river at Aizanoi.",
    },
  },
  "Penkalas Bridge": {
    blurb: {
      tr: "Aizanoi'de Penkalas Çayı üzerindeki Roma köprülerinden biri.",
      en: "One of the Roman bridges over the Penkalas river at Aizanoi.",
    },
  },
  "Leto Tapınağı": {
    blurb: {
      tr: "Letoon'un ana tapınağı; anne tanrıça Leto'ya adanmıştır.",
      en: "The principal temple of Letoon, dedicated to the mother goddess Leto.",
    },
  },
  "Temple of Leto": {
    blurb: {
      tr: "Letoon'un ana tapınağı; anne tanrıça Leto'ya adanmıştır.",
      en: "The principal temple of Letoon, dedicated to the mother goddess Leto.",
    },
  },
  "Hadrian Nymphaeumu": {
    blurb: {
      tr: "İmparator Hadrianus döneminde yapılmış anıtsal çeşme.",
      en: "A monumental fountain built under the emperor Hadrian.",
    },
  },
  "Hadrianic Nymphaeum": {
    blurb: {
      tr: "İmparator Hadrianus döneminde yapılmış anıtsal çeşme.",
      en: "A monumental fountain built under the emperor Hadrian.",
    },
  },
  "Üç Dilli Yazıt": {
    blurb: {
      tr: "Letoon'da bulunan, Likçe, Yunanca ve Aramice yazılmış önemli yazıt.",
      en: "The important stele found at Letoon, written in Lycian, Greek and Aramaic.",
    },
  },
  "Trilingual Inscription": {
    blurb: {
      tr: "Letoon'da bulunan, Likçe, Yunanca ve Aramice yazılmış önemli yazıt.",
      en: "The important stele found at Letoon, written in Lycian, Greek and Aramaic.",
    },
  },
  "Perikles Heroonu": {
    blurb: {
      tr: "Limyra'nın ünlü kaya mezarı; Likyalı yönetici Perikles'e adanmış.",
      en: "Limyra's famous rock tomb dedicated to the Lycian ruler Pericles.",
    },
  },
  "Pericles Heroon": {
    blurb: {
      tr: "Limyra'nın ünlü kaya mezarı; Likyalı yönetici Perikles'e adanmış.",
      en: "Limyra's famous rock tomb dedicated to the Lycian ruler Pericles.",
    },
  },
  "Kaineus Kabartması": {
    blurb: {
      tr: "Limyra'da bulunan, mitolojik kahraman Kaineus'u betimleyen kabartma.",
      en: "A relief at Limyra depicting the mythological hero Kaineus.",
    },
  },
  "Kaineus Relief": {
    blurb: {
      tr: "Limyra'da bulunan, mitolojik kahraman Kaineus'u betimleyen kabartma.",
      en: "A relief at Limyra depicting the mythological hero Kaineus.",
    },
  },
  "Gaius Caesar Anıtı": {
    blurb: {
      tr: "Augustus'un varisi Gaius Caesar'ın anısına Limyra'da dikilen anıt.",
      en: "A monument raised at Limyra in memory of Gaius Caesar, heir of Augustus.",
    },
  },
  "Monument of Gaius Caesar": {
    blurb: {
      tr: "Augustus'un varisi Gaius Caesar'ın anısına Limyra'da dikilen anıt.",
      en: "A monument raised at Limyra in memory of Gaius Caesar, heir of Augustus.",
    },
  },
  "Odeion ve Bouleuterion": {
    blurb: {
      tr: "Toplantı ve gösteriler için bitişik yapılmış salonlar.",
      en: "Adjacent halls used for assemblies and performances.",
    },
  },
  "Odeon and Bouleuterion": {
    blurb: {
      tr: "Toplantı ve gösteriler için bitişik yapılmış salonlar.",
      en: "Adjacent halls used for assemblies and performances.",
    },
  },
  "Bellerophon Kaya Mezarı": {
    blurb: {
      tr: "Tlos'un simgesi; cephesinde Bellerophon ve Pegasus kabartması olan kaya mezarı.",
      en: "Tlos' icon: a rock tomb whose façade bears a relief of Bellerophon and Pegasus.",
    },
  },
  "Bellerophon Rock Tomb": {
    blurb: {
      tr: "Tlos'un simgesi; cephesinde Bellerophon ve Pegasus kabartması olan kaya mezarı.",
      en: "Tlos' icon: a rock tomb whose façade bears a relief of Bellerophon and Pegasus.",
    },
  },
  "Akropol Kalesi": {
    blurb: {
      tr: "Yüksek kayalık üzerine kurulmuş savunma kalesi.",
      en: "A defensive fortress set on a high rock.",
    },
  },
  "Acropolis Fortress": {
    blurb: {
      tr: "Yüksek kayalık üzerine kurulmuş savunma kalesi.",
      en: "A defensive fortress set on a high rock.",
    },
  },
  "Kronos Tapınağı": {
    blurb: {
      tr: "Titan tanrı Kronos'a adanmış tapınak.",
      en: "A temple dedicated to the Titan god Kronos.",
    },
  },
  "Temple of Kronos": {
    blurb: {
      tr: "Titan tanrı Kronos'a adanmış tapınak.",
      en: "A temple dedicated to the Titan god Kronos.",
    },
  },
  "Medusa Mozaiği Odeonu": {
    blurb: {
      tr: "Tabanında Medusa mozaiği bulunan odeon.",
      en: "An odeon whose floor bears a Medusa mosaic.",
    },
  },
  "Medusa Mosaic Odeon": {
    blurb: {
      tr: "Tabanında Medusa mozaiği bulunan odeon.",
      en: "An odeon whose floor bears a Medusa mosaic.",
    },
  },
  "Augustus Tapınağı (Augusteum)": {
    blurb: {
      tr: "İmparator Augustus'un kültüne adanmış tapınak.",
      en: "A temple dedicated to the cult of Augustus.",
    },
  },
  "Temple of Augustus (Augusteum)": {
    blurb: {
      tr: "İmparator Augustus'un kültüne adanmış tapınak.",
      en: "A temple dedicated to the cult of Augustus.",
    },
  },
  "Propylon (Anıtsal Kapı)": {
    blurb: {
      tr: "Antiochia'da kutsal alanı sınırlayan anıtsal giriş kapısı.",
      en: "The monumental entrance gate framing the sanctuary at Antiochia.",
    },
  },
  "Propylon (Monumental Gate)": {
    blurb: {
      tr: "Antiochia'da kutsal alanı sınırlayan anıtsal giriş kapısı.",
      en: "The monumental entrance gate framing the sanctuary at Antiochia.",
    },
  },
  "Aziz Paul Kilisesi (Büyük Bazilika)": {
    blurb: {
      tr: "Aziz Pavlus ile anılan, Antiochia'daki büyük bazilika.",
      en: "The great basilica at Antiochia, associated with St Paul.",
    },
  },
  "Church of St. Paul (Great Basilica)": {
    blurb: {
      tr: "Aziz Pavlus ile anılan, Antiochia'daki büyük bazilika.",
      en: "The great basilica at Antiochia, associated with St Paul.",
    },
  },
  "Su Kemerleri ve Nymphaeum": {
    blurb: {
      tr: "Kente su getiren kemerler ile anıtsal çeşme.",
      en: "The aqueducts that brought water to the city, and the monumental fountain.",
    },
  },
  "Aqueducts and Nymphaeum": {
    blurb: {
      tr: "Kente su getiren kemerler ile anıtsal çeşme.",
      en: "The aqueducts that brought water to the city, and the monumental fountain.",
    },
  },
  "Roma Hamamları": {
    blurb: {
      tr: "Yerden ısıtmalı, sıcak ve soğuk bölümleri olan Roma hamamları.",
      en: "Roman baths with underfloor heating and hot and cold rooms.",
    },
  },
  "Roman Baths": {
    blurb: {
      tr: "Yerden ısıtmalı, sıcak ve soğuk bölümleri olan Roma hamamları.",
      en: "Roman baths with underfloor heating and hot and cold rooms.",
    },
  },
  "Su Kemeri": {
    blurb: {
      tr: "Uzaktaki kaynaktan kente su taşıyan kemerli yapı.",
      en: "An arched structure carrying water from a distant source to the city.",
    },
  },
  Aqueduct: {
    blurb: {
      tr: "Uzaktaki kaynaktan kente su taşıyan kemerli yapı.",
      en: "An arched structure carrying water from a distant source to the city.",
    },
  },
  "Zeus Olbios Tapınağı": {
    blurb: {
      tr: "Uzuncaburç'ta Zeus Olbios'a adanmış Helenistik tapınak.",
      en: "The Hellenistic temple dedicated to Zeus Olbios at Uzuncaburç.",
    },
  },
  "Temple of Zeus Olbios": {
    blurb: {
      tr: "Uzuncaburç'ta Zeus Olbios'a adanmış Helenistik tapınak.",
      en: "The Hellenistic temple dedicated to Zeus Olbios at Uzuncaburç.",
    },
  },
  "Uzuncaburç Kulesi": {
    blurb: {
      tr: "Uzuncaburç'a adını veren, sur hattındaki yüksek kule.",
      en: "The tall tower that gives Uzuncaburç its name.",
    },
  },
  "The Tall Tower": {
    blurb: {
      tr: "Uzuncaburç'a adını veren, sur hattındaki yüksek kule.",
      en: "The tall tower that gives Uzuncaburç its name.",
    },
  },
  "Tyche Tapınağı": {
    blurb: {
      tr: "Şans tanrıçası Tyche'ye adanmış küçük tapınak.",
      en: "A small temple dedicated to Tyche, goddess of fortune.",
    },
  },
  "Temple of Tyche": {
    blurb: {
      tr: "Şans tanrıçası Tyche'ye adanmış küçük tapınak.",
      en: "A small temple dedicated to Tyche, goddess of fortune.",
    },
  },
  "Kuzey Kapı": {
    blurb: {
      tr: "Kentin kuzeyindeki giriş kapısı.",
      en: "The entrance gate on the north of the city.",
    },
  },
  "North Gate": {
    blurb: {
      tr: "Kentin kuzeyindeki giriş kapısı.",
      en: "The entrance gate on the north of the city.",
    },
  },
  "Güney Kapı": {
    blurb: {
      tr: "Kentin güneyindeki giriş kapısı.",
      en: "The entrance gate on the south of the city.",
    },
  },
  "South Gate": {
    blurb: {
      tr: "Kentin güneyindeki giriş kapısı.",
      en: "The entrance gate on the south of the city.",
    },
  },
  "Fırtına Tanrısı Heykeli": {
    blurb: {
      tr: "Karatepe'de Hitit fırtına tanrısını betimleyen kabartma.",
      en: "A relief at Karatepe depicting the Hittite storm god.",
    },
  },
  "Storm God Statue": {
    blurb: {
      tr: "Karatepe'de Hitit fırtına tanrısını betimleyen kabartma.",
      en: "A relief at Karatepe depicting the Hittite storm god.",
    },
  },
  "Aslan Heykelleri": {
    blurb: {
      tr: "Kapı ve surları süsleyen aslan kabartmaları ve heykelleri.",
      en: "Lion reliefs and statues adorning gates and walls.",
    },
  },
  "Lion Statues": {
    blurb: {
      tr: "Kapı ve surları süsleyen aslan kabartmaları ve heykelleri.",
      en: "Lion reliefs and statues adorning gates and walls.",
    },
  },
  "Sfenks Heykelleri": {
    blurb: {
      tr: "Girişleri koruyan sfenks heykelleri.",
      en: "Sphinx statues guarding the entrances.",
    },
  },
  "Sphinx Statues": {
    blurb: {
      tr: "Girişleri koruyan sfenks heykelleri.",
      en: "Sphinx statues guarding the entrances.",
    },
  },
  "Zafer Takı (Alakapı)": {
    blurb: {
      tr: "Anavarza'nın 'Alakapı' olarak bilinen üç gözlü Roma zafer takı.",
      en: "Anavarza's three-arched Roman triumphal arch, known as Alakapı.",
    },
  },
  "Triumphal Arch (Alakapı)": {
    blurb: {
      tr: "Anavarza'nın 'Alakapı' olarak bilinen üç gözlü Roma zafer takı.",
      en: "Anavarza's three-arched Roman triumphal arch, known as Alakapı.",
    },
  },
  "Anavarza Kalesi": {
    blurb: {
      tr: "Kaya üzerindeki ortaçağ kalesi; Roma kentine hâkim konumdadır.",
      en: "The medieval castle on the rock, overlooking the Roman city.",
    },
  },
  "Anavarza Castle": {
    blurb: {
      tr: "Kaya üzerindeki ortaçağ kalesi; Roma kentine hâkim konumdadır.",
      en: "The medieval castle on the rock, overlooking the Roman city.",
    },
  },
  "Niqmepa Sarayı": {
    blurb: {
      tr: "Alalah'ın (Tell Atchana) Geç Tunç Çağı kralı Niqmepa'ya atfedilen saray.",
      en: "The palace attributed to Niqmepa, Late Bronze Age ruler of Alalakh (Tell Atchana).",
    },
  },
  "Palace of Niqmepa": {
    blurb: {
      tr: "Alalah'ın (Tell Atchana) Geç Tunç Çağı kralı Niqmepa'ya atfedilen saray.",
      en: "The palace attributed to Niqmepa, Late Bronze Age ruler of Alalakh (Tell Atchana).",
    },
  },
  "Eski Saray (Saray VII)": {
    blurb: {
      tr: "Tell Atchana'da ortaya çıkarılan en eski saray yapısı.",
      en: "The earliest palace building excavated at Tell Atchana.",
    },
  },
  "Old Palace (Palace VII)": {
    blurb: {
      tr: "Tell Atchana'da ortaya çıkarılan en eski saray yapısı.",
      en: "The earliest palace building excavated at Tell Atchana.",
    },
  },
  Tapınaklar: {
    blurb: {
      tr: "Kutsal yapılar; bölgenin önemli bir dini merkez olduğunu gösterir.",
      en: "Sacred buildings, marking the region as an important religious centre.",
    },
  },
  Temples: {
    blurb: {
      tr: "Kutsal yapılar; bölgenin önemli bir dini merkez olduğunu gösterir.",
      en: "Sacred buildings, marking the region as an important religious centre.",
    },
  },
  "Şehir Surları": {
    blurb: {
      tr: "Kenti çevreleyen savunma duvarları.",
      en: "The defensive walls encircling the city.",
    },
  },
  "Tunç Çağı Konutları": {
    blurb: {
      tr: "Tell Atchana'da Tunç Çağı'na tarihlenen konut kalıntıları.",
      en: "Bronze Age house remains at Tell Atchana.",
    },
  },
  "Bronze Age Houses": {
    blurb: {
      tr: "Tell Atchana'da Tunç Çağı'na tarihlenen konut kalıntıları.",
      en: "Bronze Age house remains at Tell Atchana.",
    },
  },
};

/**
 * Pick the structure dialog image: an explicitly mapped one when available,
 * otherwise fall back to the site cover photo.
 */
export function structureImage(name: string, fallback: string) {
  return structureInfo[name]?.image ?? fallback;
}
