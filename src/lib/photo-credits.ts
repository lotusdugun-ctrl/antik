/**
 * Attribution for every Wikimedia Commons photo the app displays.
 *
 * Most of these images are CC BY or CC BY-SA: showing them without naming the
 * author and the licence is a licence breach, not a nicety. So this file is
 * generated from the Commons API (`extmetadata`) rather than written by hand,
 * and `creditFor` is keyed off the photo URL itself â€” a photo added to the data
 * layer without a matching entry here renders no credit, which is the signal to
 * regenerate rather than to ship it uncredited.
 */
export type PhotoCredit = {
  /** Photographer or uploader, exactly as Commons records them. */
  author: string;
  /** Short licence name, e.g. "CC BY-SA 4.0". */
  license: string;
  /** Canonical licence deed. Absent for public-domain files, which have none. */
  licenseUrl?: string;
};

/** Keyed by the Commons file name as it appears in the photo URL. */
export const photoCredits: Record<string, PhotoCredit> = {
  "Akhtamar_Island_on_Lake_Van_with_the_Armenian_Cathedral_of_the_Holy_Cross.jpg": {
    author: "gozturk",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "20110419_Ani_North_Walls_Turkey_Panorama.jpg": {
    author: "Ggia",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Akhisar_ruins_Tempemezari_1.jpg": {
    author: "User:Quintucket",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Akhisar_ruins_Tempemezari_2.jpg": {
    author: "User:Quintucket",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Agora_(Perge)_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "3D_reconstruction_temple_Pessinus_Angelo_Verlinde.jpg": {
    author: "Averlind",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Acemhöyük01.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Acemhöyük03.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Acemhöyük_02.jpg": {
    author: "Laszlovszky András",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Acemhöyük_01.jpg": {
    author: "Laszlovszky András",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "00_0361_Nemrut_Dağı_-_Provinz_Adiyaman,_Türkei_(Taurusgebirge).jpg": {
    author: "W. Bulach",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "001362_Nemrut_Dağı_-_Türkei.jpg": {
    author: "W. Bulach",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "00_1372_Mount_Nemrut_-_Adiyaman,_Türkei.jpg": {
    author: "W. Bulach",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "AIZANOI_theatre_et_stade_ok.jpg": {
    author: "Franck devedjian",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "2019_Phaselis_2.jpg": {
    author: "Qasinka",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Agora,_İzmir,_2019_05.jpg": {
    author: "Gargarapalvin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "20180511_153347_phaselis_antik_kenti.jpg": {
    author: "Özgesncnnnn",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Acropolis_amphitheatre_of_Pergamon_(2020).jpg": {
    author: "Antoloji",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "A_view_from_Troy_Ancient_City,_Çanakkale,_Turkey.jpg": {
    author: "Kadı",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "2009_in_Amasra_14.jpg": {
    author: "Gargarapalvin",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Aizanoi_taş_kalıntılar_05.jpg": {
    author: "Nabbegat",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Aizanoi_taş_kalıntılar_11.jpg": {
    author: "Nabbegat",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Aizanoi_taş_kalıntılar_15.jpg": {
    author: "Nabbegat",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "20230429_Gymnasium_at_Sardis_4.jpg": {
    author: "Basak",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "A_Road_in_Alexandria_Troas.jpg": {
    author: "Raicem",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Amasra,_Turkey,_Castle,_view_from_the_island.jpg": {
    author: "Babbsack",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Altintepe-apadanaW.jpg": {
    author: "Bertramz",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Altintepe-templeS.jpg": {
    author: "Bertramz",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Altintepe-towerS.jpg": {
    author: "Bertramz",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Altintepe-pithoi.jpg": {
    author: "Bertramz",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Amisos_Tepesi'nde_kuzey_tümülüsü.JPG": {
    author: "Cobija",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Amisos_Tepesi_kuzey_tümülüsü_girişi.JPG": {
    author: "Cobija",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Amasra_192.JPG": {
    author: "Vikiçizer",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Alaca_Höyük_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Alacahöyük.jpg": {
    author: "E4024",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Alalakh_panneau_descriptif_à_l'entrée_du_site.jpg": {
    author: "Nicoleon",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Amasra,_Turkey_-_panoramio.jpg": {
    author: "Murat Erendil",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Amorion,_ausgegrabene_Gebäude_in_der_Unterstadt.jpg": {
    author: "Torsten62",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Amasya_II_numaralı_hamam_ve_kral_mezaları.jpg": {
    author: "Cobija",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Amasya_evleri.jpg": {
    author: "Cobija",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Alacahöyük_müzesi.jpg": {
    author: "Acar54",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Amasya_004.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Alişar_Höyük_01.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Alişar_Höyük_02.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Alişar_Höyük_03.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Alişar_Höyük_04.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Alexandria_Troas_-_2.jpg": {
    author: "Raicem",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Amasya_Mountain_to_south_Town_view_Kings'_Tombs_2629.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Alexandria_Troas_2025-08-31_10-25-37.jpg": {
    author: "Özgür Arda BAYRAM",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Alexandria_Troas_2025-08-31_10-24-54.jpg": {
    author: "Özgür Arda BAYRAM",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Amphitheatre_of_Troy.jpg": {
    author: "Brian Harrington Spier",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Anazarbus_klikya_city_south_gate.jpg": {
    author: "MUSTAFA TOR at English Wikipedia",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Antalya_Side_Apollo.jpg": {
    author: "Saffron Blaze",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Antandros1.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Anavarza_Castle.jpg": {
    author: "Nedim Ardoğa",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Anemurium_Aqueduct_5287.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Anemurium_5663_Panorama.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Anemurium_7270.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Anavarza_ancient_Anazarbus_2764.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Anavarza_Triumphal_arch_in_Anazarbus_2755.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ani_Archeological_Site,_March_2020_1.jpg": {
    author: "Héctor Ochoa 'Robot8A'",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ancient_City_of_Olympos_Peak.jpg": {
    author: "Güney Özdamar",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ani_Harabeleri.jpg": {
    author: "Oktay Bölükbaşı",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Anastasioupolis_(Mesopotamia),_Turkey_-_52414859844.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Anastasioupolis_(Mesopotamia),_Turkey_-_52414064822.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Anastasioupolis_(Mesopotamia),_Turkey_-_52414640937.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Ani,_rovine,_veduta_04.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ankara_Anatolian_Civilizations_Carchemish_orthostats_Long_Wall_Chariot_scene_A_in_2004_11.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ankara_Anatolian_Civilizations_Carchemish_orthostats_Long_Wall_Chariot_scene_A_in_2011_02.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ankara_Anatolian_Civilizations_Carchemish_orthostats_Long_Wall_Chariot_scene_A_B_C_in_2019_01.jpg":
    {
      author: "Dosseman",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
  "Ankara_Anatolian_Civilizations_Carchemish_orthostats_Long_Wall_Chariot_scene_B_in_2004_03.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ankara_Anatolian_Civilizations_Carchemish_orthostats_Long_Wall_Chariot_scene_D_in_2011_07.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ancient_city_of_Patara,_Lycia,_Turkey_10_47_41_347000.jpeg": {
    author: "Roman_Zacharij",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ancient_city_of_Patara,_Lycia,_Turkey_10_47_44_742000.jpeg": {
    author: "Roman_Zacharij",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ancient_city_of_Patara,_Lycia,_Turkey_10_47_48_141000.jpeg": {
    author: "Roman_Zacharij",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arsameia_(4955068809).jpg": {
    author: "Klearchos Kapoutsis from Santorini, Greece",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Antandros2.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Antandros3.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Archaeological_site_of_Alalakh_(Tell_Atchana).JPG": {
    author: "Fkitselis",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Archway_dedicated_to_the_Emperor_Vespasian,_Xanthos,_Lycia,_Turkey_(8814672323).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Aqueduct_of_Aspendos_02.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Aphrodisias_-_Tetrapylon_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Aphrodisias_-_Stadium_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Aphrodisias_-_Odeion_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Aphrodisias_-_Portico_of_Tiberius_02.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Architectural_elements_from_the_Mausoleum_of_Halicarnassus,_constructed_for_King_Mausolus_during_the_mid-4th_century_BC_at_Halicarnassus_in_Caria,_Bodrum,_Turkey_(17364177689).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Arsameia_am_Nymphaios_(3._Jhdt.v.Chr.)_(40413951172).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Arsameia_am_Nymphaios_(3._Jhdt.v.Chr.)_(40457819871).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Arsameia_am_Nymphaios_(3._Jhdt.v.Chr.)_(40457811281).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Arslantepe_Ruins,_Malatya_01.jpg": {
    author: "Zeynel Cebeci",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arslantepe_Ruins,_Malatya_03.jpg": {
    author: "Zeynel Cebeci",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arslantepe_Ruins,_Malatya_06.jpg": {
    author: "Zeynel Cebeci",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antioch_of_Pisidia_2887.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antioch_of_Pisidia_2888.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antioch_of_Pisidia_2897.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antioch_of_Pisidia_2898.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arykanda_from_Prytaneion_4973.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arykanda_Odeon_3806.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arslantepe_Löwentor_Delaporte.jpg": {
    author: "Louis Delaporte (1874-1944)",
    license: "Public domain",
  },
  "APOLLON_NEMRUT_MOUNTAIN.jpg": {
    author: "Mkrc85",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bridge_near_Limyra._Pic_04.jpg": {
    author: "Ralf Rochow",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Asikli-hoyuk.jpg": {
    author: "Katpatuka",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Aspendos_Amphitheatre.jpg": {
    author: "Saffron Blaze",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Aspendos_Basilica_Antalya_Turkey.jpg": {
    author: "Saffron Blaze",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Arykanda_Thermen.jpg": {
    author: "Getüm",
    license: "CC BY-SA 2.0 de",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/de/deed.en",
  },
  "Bishop's_Church_at_Priene_(4).jpg": {
    author: "José Luiz",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Cardo_(Perge).jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Basilica_Baths,_Hierapolis_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Basilica_Baths,_Hierapolis_02.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Aşıklı_Höyük_05.jpg": {
    author: "Isimon49",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Aşıklı_Höyük_06.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Back_Alley_in_Olympos_Ruins.jpg": {
    author: "Güney Özdamar",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arykanda_State_Agora_Retaining_wall_5071.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bandirma_Cyzicus_2874.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bandirma_Cyzicus_Zeus_temple_2860.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bar-Restaurant_atop_the_Sinop_Tower_Wall,_Sinop_Turkey.jpg": {
    author: "Clara S.",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Bridge_of_Hasankeyf_(49391828182).jpg": {
    author: "Vicuna R from Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Aşıklı_Höyük_Copy_of_the_buildings.jpg": {
    author: "Joe Wallace",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Assos,_Turkey_-_6452171295.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Assos,_Turkey_-_6452161411.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Assos,_Turkey_-_6452150369.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Assos,_Turkey_-_6452137971.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Claros,_Ionia,_Turkey.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Claros,_Ionia,_Turkey_-_53579164316.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Aspendos_Theatre,_Turkey.jpg": {
    author: "Lee Vilenski",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Entrance_into_theatre_of_Xanthos.jpg": {
    author: "Pot Noodle",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Columns_in_Perge_03.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Colonnade,_Perge_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Ephesus_-_Prytaneion.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Ephesus_-_Celsus_Library.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Elaiussa_Sebaste_-_amphitheatre_-_1.jpg": {
    author: "Vassia Atanassova - Spiritia",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Elaiussa_Sebaste_-_amphitheatre_-_2.jpg": {
    author: "Vassia Atanassova - Spiritia",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "DALYAN-KAUNOS_-_panoramio.jpg": {
    author: "HALUK COMERTEL",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Çatalhöyük,_7400_BC,_Konya,_Turkey_-_UNESCO_World_Heritage_Site,_02.jpg": {
    author: "Murat Özsoy 1958",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Çatalhöyük,_7400_BC,_Konya,_Turkey_-_UNESCO_World_Heritage_Site,_03.jpg": {
    author: "Murat Özsoy 1958",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Çatalhöyük,_7400_BC,_Konya,_Turkey_-_UNESCO_World_Heritage_Site,_01.jpg": {
    author: "Murat Özsoy 1958",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Çatalhöyük,_7400_BC,_Konya,_Turkey_-_UNESCO_World_Heritage_Site,_06.jpg": {
    author: "Murat Özsoy 1958",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ephesus_-_Great_Theater.jpg": {
    author: "Handecinarq",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Elaiussa_Sebaste_Theatre_1302.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Datça-Knidos.jpg": { author: "Wikimedia Commons", license: "Public domain" },
  "Didyma,_Turkey,_Temple_of_Apollon,_Face.jpg": {
    author: "Frunze103",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Didyma,_Turkey,_Temple_of_Apollon,_more_stairs.jpg": {
    author: "Frunze103",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Didyma,_Turkey,_Temple_of_Apollon,_figures.jpg": {
    author: "Frunze103",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Diocaesarea_(Isauria)_information_3415.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Elaiussa_Sebaste_approaching_theatre_2139.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Elaiussa_Sebaste_approaching_theatre_2137.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Constantinople,_Nicaea,_Turkey_-_52865549511.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Constantinople,_Nicaea,_Turkey_-_52864968147.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Columns_of_Thiatira.jpg": {
    author: "Pragdon",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Dara_Nekropol_Alanı.jpg": {
    author: "Hamdigumus",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Filyos_Bay.jpg": {
    author: "Makalp",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Göbekli_Tepe.jpg": {
    author: "Creator:Rolfcosar",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Ephesus_Celsus_Library_Façade.jpg": {
    author: "Benh LIEU SONG",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Göbekli_Tepe,_Urfa.jpg": {
    author: "Teomancimit",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Festung_Harput.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Eski_Palu_Überblick.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Eski_Palu_Kalesi.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Gordion_Museum,_Turkey_01.jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Güzelsu,_Burg_Hoşap_(kurdisch,_17._Jhdt.)_(26551030028).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Güzelsu,_Burg_Hoşap_(kurdisch,_17._Jhdt.)_(26551028758).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Gaziantep_Zeugma_Museum_Andromeda_mosaic_4170.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Gaziantep_Zeugma_Museum_Dionysos_Triumf_mosaic_1921.jpg": {
    author: "Dosseman",
    license: "Public domain",
  },
  "Gordion_Citadel_Mound_aerial_overview_2017.jpg": {
    author: "Gordion Archive, Penn Museum",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Filyos_kalesi.jpg": {
    author: "Gezgin67",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Euromos_Antik_Kenti_01.jpg": {
    author: "Gargarapalvin",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Euromos_Antik_Kenti_02.jpg": {
    author: "Gargarapalvin",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Euromos_Antik_Kenti_05.jpg": {
    author: "Gargarapalvin",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Euromos_Antik_Kenti_06.jpg": {
    author: "Gargarapalvin",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Euromos_Antik_Kenti_18.jpg": {
    author: "Gargarapalvin",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Göbekli_Tepe_(2).jpg": {
    author: "Radosław Botev",
    license: "CC BY 3.0 pl",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/pl/deed.en",
  },
  "Gordion_18_05_1989_Ruinen_und_Tumulus_(Hintergrund).jpg": {
    author: "Volker Höhfeld",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Gobekli_Tepe_childbirth_stone_engraving.jpg": {
    author: "Luke Hancock",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Gordion_Müzesi_(19.05.2023)_09.jpg": {
    author: "Gargarapalvin",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Filyos_Tios_Örenyeri.jpg": {
    author: "kültür portalı",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Filyos.jpg": {
    author: "Unknown authorUnknown author",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Hasankeyf.JPG": {
    author:
      "No machine-readable author provided. Bertilvidet~commonswiki assumed (based on copyright claims).",
    license: "CC BY 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by/2.5",
  },
  "Harran-beehouses.jpg": {
    author: "Original uploader was Acarvin at en.wikipedia",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Hattusa_sign.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Hierapolis,_Turkey_(17187550372).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Hemidrachme_Parion_Rs.JPG": {
    author: "Hermann Junghans",
    license: "CC BY-SA 3.0 de",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/de/deed.en",
  },
  "Harput_kalesi-Harput-Elazığ_-_panoramio.jpg": {
    author: "HALUK COMERTEL",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Hasankeyf_-_panoramio_(7).jpg": {
    author: "Ramazan B.",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Harput,_23350_Elâzığ_Merkez-Elâzığ,_Turkey_-_panoramio.jpg": {
    author: "EROL AKBULUT",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Güzelsu,_Burg_Hoşap_(kurdisch,_17._Jhdt.)_(38611354250).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Güzelsu,_Burg_Hoşap_(kurdisch,_17._Jhdt.)_(38611357460).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Insel_Akdamar_Աղթամար_(39526201035).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Insel_Akdamar_Աղթամար_(39526208675).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Insel_Akdamar_Աղթամար_(26550945298).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Hasankeyf_(26572340438).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Hasankeyf_(26572339938).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Harran_Beehive_houses_192b.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Hellenistic_theatre_in_Letoon,_seats,_2045.jpg": {
    author: "Zde",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Istanbul_Archaeology_Museum_Tray_from_Lampsacus_6th-7th_C_CE_4090.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Istanbul_Archaeology_Museum_Tray_from_Lampsacus_6th-7th_C_CE_4091.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Hierapolis,_Pamukkale_5.jpg": {
    author: "Slyronit",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Harran_2015.jpg": {
    author: "Hamdigumus",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Harput_113_(59495).jpg": {
    author: "Ruhsuz25",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Inschrift_Çavuştepe_01.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Hisarlık_(Ancient_City_of_Troy).jpg": {
    author: "Barrowbob",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Istanbul_Ancient_Orient_Museum_Neo-Hittite_Relief_of_sphynx_at_gate_in_Zincirli_8th_century_BC_from_Zincirli_in_2003_17_01431.jpg":
    {
      author: "Dosseman",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
  "Izmir_Agora.JPG": {
    author: "Wikimedia Commons",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Klaros01.jpg": {
    author: "User:Nikater",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Karatepe_Stadtmauer.JPG": {
    author: "Elelicht",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Klaros_004.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Karatepe_©_Abdullah_Kıyga_-_panoramio.jpg": {
    author: "Abdullah kıyga",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "KilSilifkeG01.jpg": {
    author: "Ziegler175",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Kanis_03.jpg": {
    author: "Laszlovszky András",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kibyra_Theatre_9919.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Iznik_Green_mosque_8159.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kaunos_Kral_Mezarları_Dalyan_Ortaca_Muğla.jpg": {
    author: "Atakan Yasin KANUT",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kaunos_Stoa_area_4378.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Izmir_Agora_October_2015_2022.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Izmir_view_from_citadel_5683.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Iznik_Wall_at_Sarayi_Gate_099.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Karatepe_sept_2008_5206.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Karatepe_to_South_Gate_5240.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kibyra_Basilica_9926.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kibyra_View_9816.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kibyra_View_towards_stadium_9766_panorama.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kaunos_Agora_view_6865_panorama.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Klazomenai_(Liman_Tepe)_Early_Bronze_Age_fortification_wall.jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Karahan_Tepe_overview.jpg": { author: "Frantisek Trampota", license: "Public domain" },
  "Karahan_Tepe_excavation.jpg": { author: "Frantisek Trampota", license: "Public domain" },
  "Karahan_Tepe_stelae.jpg": { author: "Frantisek Trampota", license: "Public domain" },
  "Karahan_Tepe_man.jpg": {
    author: "Marco Restano",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Klazomenai.jpg": {
    author: "http://en.wikipedia.org/wiki/Image:Klazomenai.jpg",
    license: "Public domain",
  },
  "Knidos_05772_05776.jpg": {
    author: "Nevit Dilmen",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Knidos-Häfen.jpg": {
    author: "Tischbeinahe",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Lion_Gate,_Hattusa_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Kral_Kaya_Mezarları,_Amasya.jpg": {
    author: "Zeynel Cebeci",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Lampsacus_Treasure_inscribed_spoons.jpg": {
    author: "Ashley Van Haeften",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Limyra_5182.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Letoon_Temple_Area_2019.jpg": {
    author: "Bjørn Christian Tørrissen",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Labraunda_South_Terrace_3790_Panorama.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Labraunda_South_Terrace_Panorama_3773.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Labraunda_at_foot_of_terrace_3818_Panorama.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Labraunda_rock_opening_3875.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Limyra_Building_next_to_Roman_Theatre_3785.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Limyra_Kaineus_Tomb_5202.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kyzikos_ve_Bandırma_Körfezi.jpg": {
    author: "Aerdemsenturk",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Knidos_(Turkey)_banner.jpg": {
    author:
      "1. Patrickneil 2. Aminlakestani 3. Bozan32 4. Jorge Franganillo 5. Mstyslav Chernov 6. Nevit Dilmen",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Klazomenai_Archaic_houses_02_(1991).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Klazomenai_Archaic_houses_03_(1991).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Kultepe_Karum_excavations_(1993)_06.jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Kultepe_Karum_trenches_and_mound_(1993).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Kultepe_mound_-_'Large_palace_on_south_terrace'_from_S_(1993).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Laodicea_Ancient_City_2026,_03.jpg": {
    author: "Biologg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Laodicea_Ancient_City_2026,_08.jpg": {
    author: "Biologg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Laodicea_Ancient_City_2026,_108.jpg": {
    author: "Biologg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Laodicea_Ancient_City_2026,_131.jpg": {
    author: "Biologg",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Lion_Zincirli.JPG": {
    author: "User:Lusitana",
    license: "CC BY 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by/2.5",
  },
  "MidasSehri.Tomb.jpg": {
    author: "User:China_Crisis",
    license: "CC BY-SA 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5",
  },
  "MidasSehriAkropolis.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Minoan_painting_alalakh.jpg": {
    author: "Udimu",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Myra_Rock_Tombs.jpg": {
    author: "Saffron Blaze",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Lion_sculptures_from_Zincirli.jpg": { author: "Interfase", license: "Public domain" },
  "Mensole_of_the_Nysa's_Bouleuterion-1.jpg": {
    author: "MM DecArch",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Lion_Gate,_Hattusa_02.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Midas_City,_Yazılıkaya_05.jpg": {
    author: "Zeynel Cebeci",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Midas_Monument,_Yazılıkaya.jpg": {
    author: "Zeynel Cebeci",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Miletus_-_Ancient_Greek_theatre_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Miletus_-_Ancient_Greek_theatre_02.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Model_of_the_Mausoleum_of_Halicarnassus,_constructed_for_King_Mausolus_during_the_mid-4th_century_BC_at_Halicarnassus_in_Caria,_Bodrum,_Turkey_(17362934180).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Nevali_Çori_kazı_alanı_maketi_(2).jpg": {
    author: "Cobija",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Nevali_Çori_terazzo_taban.jpg": {
    author: "Cobija",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Mausoleum_at_Halicarnassus_at_the_Bodrum_Museum_of_Underwater_Archaeology.jpg": {
    author: "Jona Lendering",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Myra_Antik_Kenti-Örenyeri.jpg": {
    author: "Esginmurat",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Lion_Gate,_Hattusa,_Boğazkale,_Çorum,_Turkey_02.jpg": {
    author: "Murat Özsoy 1958",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Miletus_(Turkey)_Market_Gate,_c._100_AD,_Reconstruction_(1).jpg": {
    author: "Gary Todd",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Miletus_(Turkey)_Market_Gate,_c._100_AD,_Reconstruction_(2).jpg": {
    author: "Gary Todd",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Myra-south-necropolis.jpg": {
    author: "Rab Lawrence",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Lycian_Tomb,_Xanthos.jpg": {
    author: "Deniz Mutlu",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Magnesia_on_the_Maeander_Temple_of_Artemis_Ionic_capital.jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Myra_Necropolis,_Lycia,_Turkey_-_52619304899.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Mosaic_with_the_personification_of_Halicarnassus,_British_Museum.jpg": {
    author: "14GTR",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Pinara_Amphitheatre_Fethiye_Mugla_Turkiye.JPG": {
    author: "Osmanyaylali",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Panorama_alexandriatroas.jpg": {
    author: "Horacio36",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Nysa,_Anatolia.JPG": { author: "Musti at English Wikipedia", license: "Public domain" },
  "Odeon_Teos_Seferihisar_Turkey.jpg": {
    author: "Ms. Sevil Ege",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Pergamon_-_02.jpg": {
    author: "Carlos Delgado",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Oinoanda_1.JPG": {
    author: "Ansgar Bovet",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Oinoanda_4.JPG": {
    author: "Ansgar Bovet",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Olba,_Uzuncaburç.JPG": {
    author: "Cobija",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Olympos,_Lycia,_Turkey_(9653784149).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Olympos,_Lycia,_Turkey_(9653957867).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Palugesamt.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Phaselis_August_2019_01.jpg": {
    author: "Лобачев Владимир",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Phaselis_Antalya.jpg": {
    author: "Zamir94",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Pessinus_Ancient_City_-_2.jpg": {
    author: "Raicem",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Pediment_of_Pergamon_2.jpg": {
    author: "Ayratayrat",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Pergamon_27.jpg": {
    author: "Leon petrosyan",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Nysa_on_the_Maeander,_Turkey_-_52534664137.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Nysa_bouleuterion_from_NW_(1991).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Nysa_bouleuterion_from_N_(1991).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Periodo_urartiano,_bulla_con_iscrizione_cuneiforme,_in_pietra,_dalla_fortezza_di_ayanis.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Periodo_urartiano,_elmo_a_punta,_in_bronzo,_dalla_fortezza_di_ayanis.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Patara_Kaş.jpg": {
    author: "Hamdigumus",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Panorama_Pessinus_temple_area_(sector_H_and_B).jpg": {
    author: "Averlind",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Pessinus_Ancient_City_-_11.jpg": {
    author: "Nabbegat",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Pessinus_Ancient_City_-_10.jpg": {
    author: "Nabbegat",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Sar-Comana.jpg": {
    author: "Katpatuka",
    license: "FAL",
    licenseUrl: "http://artlibre.org/licence/lal/en",
  },
  "Relife_depicting_a_sacrificial_scene.jpg": {
    author: "Alborz fallah",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sagalassos_-_Agora.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sagalassos_-_Nymphaeum.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sagalassos_-_Overview.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sagalassos_-_Statue_on_Agora.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sapinuwa2.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sapinuwa3.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sapinuwa4.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sapinuwa9.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Roman_theatre_-_Side_-_Antalya_Province,_Turkey_-_8_June_2015.jpg": {
    author: "Miguel Discart",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Sardis_Synagogue,_late_3rd_century_AD,_Sardis,_Lydia,_Turkey_(18897204194).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Ruins_of_Thyateira.jpg": { author: "Akkinvet", license: "Public domain" },
  "SINOP_KALESI_(_WALL)_-_panoramio.jpg": {
    author: "Kayhan ERTUGRUL",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sardis_(Lydia),_Turkey_(31358504373).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Sardis_(Lydia),_Turkey_(31327424774).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Priene_Acropolis.jpg": {
    author: "Christopher de Lisle",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Priene_01.jpg": {
    author: "Tomisti",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Priene_04.jpg": {
    author: "Tomisti",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Red_burnished_flask_Alalakh_BM.jpg": {
    author: "Zunkir",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Pompeiopolis_(Mezitli)_09.1987_Säulenstraße.jpg": {
    author: "Volker Höhfeld",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Pinara_Theatre_in_2013_4505.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Pinara_Theatre_in_2013_4503.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Pinara_Theatre_in_2013_4501.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Reconstruction_drawing_of_the_Temple_of_Diana,_Magnesia_on_the_Maeander,_Turkey_(01).jpg": {
    author: "Unknown authorUnknown author",
    license: "Public domain",
  },
  "Stater_Zeus_Lampsacus_CdM.jpg": { author: "Jastrow (2010)", license: "Public domain" },
  "Silifke_castle_arrival.jpg": {
    author: "Frank Verleye",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Stratonicee_Sebasteion.JPG": { author: "gabri331", license: "Public domain" },
  "Side_-_Vespasian_Gate.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Silifke_Kalesi_ve_Silifke_2.jpg": {
    author: "Cobija",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sphinx_Gate,_Alaca_Höyük_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Silifke_Castle_01.jpg": {
    author: "Zeynel Cebeci",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Soli_Pompeiopolis_20141116_02.jpg": {
    author: "Vassia Atanassova - Spiritia",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Soli_Pompeiopolis_20141116_04.jpg": {
    author: "Vassia Atanassova - Spiritia",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Soli_Pompeiopolis_20141116_06.jpg": {
    author: "Vassia Atanassova - Spiritia",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Temple_of_Apollo,_Didyma_-_Adyton.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Sinop-Castle.jpg": {
    author: "Ertly",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Side_1606-116.jpg": {
    author: "NoX",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Şanlıurfa_Müzesi_Nevali_Çori_(2).jpg": {
    author: "Cobija",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Stratonicea-street.jpg": {
    author: "Raicem",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Stratonicea-ancient-theatre-road.jpg": {
    author: "Raicem",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Stratonicea-gates.jpg": {
    author: "Raicem",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Sinop_Eastern_Bastion_9138.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Sinop_Eastern_Bastion_9139.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Soğmatar_from_Urfa_Carvings_in_1997_142.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Soğmatar_from_Urfa_Carvings_in_1997_121.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Soğmatar_from_Urfa_Carvings_in_1997_133.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Soğmatar_from_Urfa_Carvings_in_1997_144.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Soğmatar_from_Urfa_Carvings_in_1997_143.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Temple_from_Nevalı_Çori_stela.jpg": {
    author: "Cobija",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Tlos_ruins_Turkey.jpg": {
    author: "Toksave",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Tlos-tomb-ruins.jpg": {
    author: "Rol1000",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Tuwanuwa_-_Tyana_-_Kemerhisar.jpg": {
    author: "Htkava",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Termessos_-_Baths.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Termessos_-_Overview.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Termessos_-_Theater.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Turkey,_Anamur_-_Anemurion_01.jpg": {
    author: "Островский Александр, Киев",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "The_Roman_theatre,_built_in_the_mid-2nd_century_AD,_Xanthos,_Lycia,_Turkey_(8825114404).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Theater_Pinara_Türkei.JPG": {
    author: "Gisela s",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Tyana,_Cappadocia,_Turkey_(23777522658).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Tyana,_Cappadocia,_Turkey_(23777524208).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "The_Pediment_of_the_Temple_of_Artemis_Leukophryene,_Magnesia_ad_Maeandrum,_Turkey_(5786893105).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "TERMESSOS_Odéon_intérieur.jpg": {
    author: "Franck devedjian",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Tushpa_11.jpg": {
    author: "Leon petrosyan",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Troy_archaeological_site_-_Turkey_(1).jpg": {
    author: "Radosław Botev",
    license: "CC BY 3.0 pl",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/pl/deed.en",
  },
  "Teos,_Sığacık.jpg": {
    author: "Kadı",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Turecko_Harran_(01).jpg": {
    author: "Zorka Sojka",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Tlos_Overview_4214.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Temple_of_Artemis_in_Letoon,_2056.jpg": {
    author: "Zde",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Temple_of_Leto_in_Letoon_before_restoration,_2051.jpg": {
    author: "Zde",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "The_remains_of_the_Temple_of_Hadrian,_Cyzicus_(Kyzikos),_the_eighth_wonder_of_the_ancient_world,_Mysia,_Turkey_-_53075003232.jpg":
    {
      author: "Carole Raddato",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Tlos.jpg": {
    author: "Vano111ru",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Teos_bouleuterion.jpg": {
    author: "Isabeau",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Teos_theatre.jpg": {
    author: "Isabeau",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Thyatira_Basilica_(8691956539).jpg": {
    author: "simonjenkins' photos",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "UzuncaburcZeus.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Urartian_fort_in_Çavuştepe.jpg": {
    author: "Martijn Munneke from Netherlands",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Urartian_fort_in_Çavuştepe_total.jpg": {
    author: "Martijn Munneke from Netherlands",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Van_Fortress_From_Northwest.JPG": {
    author: "Bjørn Christian Tørrissen",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Магнесия_на_Меандре._Пропилеи.jpg": {
    author: "Vadimph",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Zeugma.jpg": {
    author: "Anadolu",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Uzuncaburç,_Mersin_Province.jpg": {
    author: "Nedim Ardoğa",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Tyana,_Cappadocia,_Turkey_(23777525848).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Xweşav.jpg": {
    author: "Dûrzan Cîrano",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Zonguldak_Cehennem_Ağzı_Mağaraları.jpg": {
    author: "Oğuz67",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Van_Fortress_from_northwest_Fortress_3999.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Van_Fortress_climb_4144.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Zeugma_Mosaic_Museum,_Gaziantep,_Turkey_(52414721257).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Van_Museum_-_Inscription_Ayanis_Fortress.jpg": {
    author: "Clemens Schmillen",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
};

/**
 * The Commons file name inside a photo URL, or `undefined` for anything that is
 * not a Commons URL â€” the bundled region artwork, mainly.
 *
 * Both shapes Commons serves are accepted: the `/thumb/<h>/<hh>/<file>/<w>px-â€¦`
 * form the data layer stores, and the plain `/<h>/<hh>/<file>` original.
 */
export function commonsFileName(url: string): string | undefined {
  const match = /\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?]+)/.exec(url);
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]!);
  } catch {
    return match[1];
  }
}

export type ResolvedCredit = PhotoCredit & {
  /** Commons file name, used as the caption's link text where one is needed. */
  file: string;
  /** The file's description page, which is where the licence actually lives. */
  source: string;
};

export function creditFor(url: string): ResolvedCredit | undefined {
  const file = commonsFileName(url);
  if (!file) return undefined;
  const credit = photoCredits[file];
  if (!credit) return undefined;
  return {
    ...credit,
    file,
    source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`,
  };
}

/** "Bernard Gagnon Â· CC BY-SA 3.0" â€” the one-line form used under a photo. */
export function creditLine(url: string): string | undefined {
  const credit = creditFor(url);
  return credit ? `${credit.author} Â· ${credit.license}` : undefined;
}

/**
 * Credits for a set of photos, deduplicated and in the order given, so a page
 * showing the same photographer four times lists them once.
 */
export function creditsFor(urls: readonly string[]): ResolvedCredit[] {
  const seen = new Set<string>();
  const out: ResolvedCredit[] = [];
  for (const url of urls) {
    const credit = creditFor(url);
    if (!credit || seen.has(credit.file)) continue;
    seen.add(credit.file);
    out.push(credit);
  }
  return out;
}
