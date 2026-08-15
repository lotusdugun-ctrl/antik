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
  "04-12_Silifke_13_Remains_of_the_Temple_of_Zeus_1.jpg": {
    author: "Maarten Sepp",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "20110419_Ani_North_Walls_Turkey_Panorama.jpg": {
    author: "Ggia",
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
  "ACM_ANKARA4665_KT051021.jpg": {
    author: "Kiss Tamás (Kit36a)",
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
  "2019_Phaselis_2.jpg": {
    author: "Qasinka",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "00_2404_Ishak_Pasha_Palace_-_Turkey.jpg": {
    author: "W. Bulach",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "00_3411_İshak_Paşa_Sarayı_-_Turkey.jpg": {
    author: "W. Bulach",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Achilles_dragging_the_body_of_Hector_around_the_walls_of_Troy_Met_DP888749.jpg": {
    author: "Pietro Testa",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "20180511_153347_phaselis_antik_kenti.jpg": {
    author: "Özgesncnnnn",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "A_view_from_Troy_Ancient_City,_Çanakkale,_Turkey.jpg": {
    author: "Kadı",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "A_piece_of_the_sacred_Apollo_complex.jpg": {
    author: "ftrc",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "2009_in_Amasra_14.jpg": {
    author: "Gargarapalvin",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "20230429_Gymnasium_at_Sardis_4.jpg": {
    author: "Basak",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "A_stone-carved_Medusa_head,_Apollo_Temple,_Didyma.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "A_Road_in_Alexandria_Troas.jpg": {
    author: "Raicem",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "A_circular_door_at_Kaymakli_Underground_City.jpg": {
    author: "Slyronit",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "20221202_Aphrodite_of_Knidos.jpg": {
    author: "Flocci Nivis",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "1999_in_Amasra_Bedesten_022.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Akhtamar_Island_on_Lake_Van_with_the_Armenian_Cathedral_of_the_Holy_Cross.jpg": {
    author: "gozturk",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Afrodisias_-_Sebastión_-_Sebasteion.jpg": {
    author: "Carlos Delgado",
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
  "Agora_of_Hadrian_which_opens_up_into_the_city_square_in_the_centre_of_the_city,_Phaselis,_Lycia,_Turkey_(9696098294).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
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
  "Agora_(Perge)_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Alalakh_panneau_descriptif_à_l'entrée_du_site.jpg": {
    author: "Nicoleon",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Alexandria_AMC_Theatre_arcade.jpg": {
    author: "Ser_Amantio_di_Nicolao",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Alacahöyük_müzesi.jpg": {
    author: "Acar54",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "AIZANOI_theatre_et_stade_ok.jpg": {
    author: "Franck devedjian",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Al_Ittihad_Alexandria_vs._Porto_Suez,_Alexandria_Stadium.jpg": {
    author: "Ben5218",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Aizanoi_Zeus_temple_2114.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Aizanoi_Penkalas_Bridge_june_2008_2316.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Aizanoi_Roman_bath_2nd_century_2258.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Agora,_İzmir,_2019_05.jpg": {
    author: "Gargarapalvin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Afyonkarahisar,_Kocatepe_Anıtı_,_a_historical_place_with_great_view_scene.jpg": {
    author: "Enas Rudaini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Aerial_view_of_Lake_İznik_from_north-east_(IMG_2266).jpg": {
    author: "DmitTrix",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Acropolis_amphitheatre_of_Pergamon_(2020).jpg": {
    author: "Antoloji",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Alexander_sarcophagus_in_the_Istanbul_Archaeological_Museums-Detail.jpg": {
    author: "Yair-haklai",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Alacahöyük_Museum_Bath_Hittite_Imperial_Period_1450-12200_BC_3307.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Amphitheatre_of_Troy.jpg": {
    author: "Brian Harrington Spier",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
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
  "Amasya_evleri_ve_Yeşilırmak_(2).jpg": {
    author: "Cobija",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Amasya_evleri.jpg": {
    author: "Cobija",
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
  "Anastasioupolis_(Mesopotamia),_Turkey_-_52414064822.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
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
  "Anadolu_Medeniyetleri_Müzesi_Güneş_Kursu.jpg": {
    author: "Dursun Sülük",
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
  "Anazarbus_klikya_city_south_gate.jpg": {
    author: "MUSTAFA TOR at English Wikipedia",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Anavarza_Castle.jpg": {
    author: "Nedim Ardoğa",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Ancient_Roman_theatre,_Hierapolis.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Ancient_Graffiti,_Temple_of_Athena,_Priene_(2).jpg": {
    author: "Christopher de Lisle",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Anemurium_Odeon_5373.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Anemurium_Large_bath_5388.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Anemurium_Necropolis_101.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Anıtsal_Çeşme_(Side).jpg": {
    author: "Buzancar",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ancient_Greek_theatre_in_Patara.jpg": {
    author: "Alexey Komarov",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Anastasioupolis_(Mesopotamia),_Turkey_-_52414859844.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Anastasioupolis_(Mesopotamia),_Turkey_-_52414640937.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Ancient_Theatre_of_Phaselis_-_Front_view.jpg": {
    author: "Nowhere1111",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ancient_Aspendos_Stadium,_view_from_the_hill_(2024)_(1).jpg": {
    author: "Olos88",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Ancient_theatre_of_Myra_10.jpg": {
    author: "Interfase",
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
  "Antalya_Side_Apollo.jpg": {
    author: "Saffron Blaze",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Antakya_Archaeology_Museum_The_jugglers_inv_831_mosiac_sept_2019_5928.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antalya_Archaeology_Museum_Dionysus_Sarcophagus_02.jpg": {
    author: "Engin_Akyurt",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Antalya_Archaeology_Museum_04.jpg": {
    author: "Engin_Akyurt",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Antalya_Archaeology_Museum_07.jpg": {
    author: "Engin_Akyurt",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Antalya_Archaeology_Museum_09.jpg": {
    author: "Engin_Akyurt",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Antalya_Museum_Mosaic_P9281528.jpg": {
    author: "Joe Wallace",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Antalya_museum_Perge_South_Bath_frieze_(probably)_4872.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antalya_Museum_Gaius_Caesar_cenotaph_Limyra's_monuments_6590.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antalya_museum_Heroon)_of_Pericles_King_of_Lycia_Limyra's_monuments_3232.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antalya_Museum_Diorama_of_Patara_-_lighthouse_6474.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ani,_rovine,_veduta_04.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antakya_Vespasian_Titus_Tunnel_in_1996_01.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antakya_Vespasian_Titus_Tunnel_in_2004_03.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antakya_Vespasian_Titus_Tunnel_in_2004_12.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antakya_Vespasian_Titus_Tunnel_in_2004_With_names_of_emperors_11.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ankara_Anatolian_Civilizations_Alacahoyuk_orthostat_Goats_being_brought_to_sacrifice_by_a_priest_in_2004_01.jpg":
    {
      author: "Dosseman",
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
  "Ankara_Anatolian_Civilizations_Carchemish_orthostats_Water_Assyrian_dressed_figure_(Carchemish,_Water_Gate)_in_2004_04.jpg":
    {
      author: "Dosseman",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
  "Ankara_Anatolian_Civilizations_Carchemish_orthostats_Royal_Buttress_Front_face_All_in_2012_07.jpg":
    {
      author: "Dosseman",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
  "Animal_hunting_scene._Gobekli_Tepe.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Apollo_11_Crew.jpg": { author: "NASA", license: "Public domain" },
  "Apollo_Artemis_Brygos_Louvre_G151.jpg": { author: "Marie-Lan Nguyen", license: "Public domain" },
  "Antique_theatre_in_Hierapolis.jpg": {
    author: ". Original uploader was Алексей Шиянов at ru.wikipedia",
    license: "Public domain",
  },
  "Antandros1.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
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
  "Aphrodisias_-_Temple_of_Aphrodite_01.jpg": {
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
  "Armorial_Plate_(tondino)-_The_story_of_King_Midas_MET_DT740.jpg": {
    author: "Creator:Nicola da Urbino",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Architrave_with_sculpted_metope_showing_sun_god_Helios_in_a_quadriga;_from_temple_of_Athena_at_Troy,_ca_300-280_BCE;_Altes_Museum,_Berlin_(25308440197).jpg":
    {
      author: "Richard Mortel from Riyadh, Saudi Arabia",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0",
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
  "APOLLON_NEMRUT_MOUNTAIN.jpg": {
    author: "Mkrc85",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antioch_in_Pisidia_Great_Basilica_2864.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antioch_in_Pisidia_Augustus_Temple_041.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Antioch_in_Pisida_Theatre_in_1998_049.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Arsameia_(4955068809).jpg": {
    author: "Klearchos Kapoutsis from Santorini, Greece",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Assos_-_Doric_Temple_of_Athena_-_panoramio.jpg": {
    author: "horsch",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Assos_-_Akropolis_Wall_-_panoramio.jpg": {
    author: "horsch",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
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
  "Arsameia_am_Nymphaios_(3._Jhdt.v.Chr.),_König_Mithridates_oder_Antiochos_beim_Handschlag_mit_Herakles_(39561931695).jpg":
    {
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
  "Arykanda_State_Agora_Retaining_wall_5071.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arykanda_Stadion_and_Theatre_5057.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arykanda_Stadion_3832.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Artemis_Tapınağı_-_Sardes_Antik_Kenti.jpg": {
    author: "Ferit BAYCUMAN",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Aspendos_Agora_4698.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Assos_Harbour_001.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Arslantepe_Löwentor_Delaporte.jpg": {
    author: "Louis Delaporte (1874-1944)",
    license: "Public domain",
  },
  "Assos_agora_from_NE_(1991).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Aspendos_Theatre,_Turkey.jpg": {
    author: "Lee Vilenski",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bodrum_Castle_4.JPG": {
    author: "Ad Meskens",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Bishop's_Church_at_Priene_(4).jpg": {
    author: "José Luiz",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Baghdad_Kiosk_at_the_Topkapı_Palace_in_Istanbul,_Turkey_001.JPG": {
    author: "Moonik",
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
  "Bergama_-_Serapeion_-_kızıl_avlu-_Red_basilica_-_panoramio_(1).jpg": {
    author: "HALUK COMERTEL",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Bodrum_Castle_(2017).jpg": {
    author: "Serhio Magpie",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
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
  "Bergama_Asklepion_2.jpg": {
    author: "Özge Kesgin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bintepe_19_04_1984_lydische_Königsgräber_von_Sardes_Blick_vom_Kırmutaf_Tepe.jpg": {
    author: "Volker Höhfeld",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Ayasofya_Cami,_İznik_2014.jpg": {
    author: "Hamdigumus",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Bodrum_Kalesi_ve_Mendirek_2015.jpg": {
    author: "Hamdigumus",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Bodrum_Kalesi_ve_Yelkenliler_2015.jpg": {
    author: "Hamdigumus",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Bergama_Müzesi_Zeus_Sunağı.jpg": {
    author: "Canercangul",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Baptistry_-_Basilica_of_St._John,_Selçuk,_İzmir_Province,_Turkey_-_October_7,_2025.jpg": {
    author: "Giorgio Galeotti",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bridge_near_Limyra._Pic_04.jpg": {
    author: "Ralf Rochow",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Bogazkale_Hattusa_banner_Yazilikaya.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Cardo_(Perge).jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Castle_-_Rumelihisari_-_Fort_of_Rumeli_-_panoramio.jpg": {
    author: "---=XEON=---",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "City_Wall_and_Battlements_-_Diyarbakir_-_Turkey_(5777328071).jpg": {
    author: "Adam Jones from Kelowna, BC, Canada",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Clay_tablets_with_cuneiform_letters_found_Kültepe_(ancient_Kanesh),_1900_BC_-_1700_BC,_Museum_of_Anatolian_Civilizations,_Ankara_(30187162882).jpg":
    {
      author: "Carole Raddato from Frankfurt, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Bouleuterion,_Priene_(2).jpg": {
    author: "Christopher de Lisle",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Brazier_and_remains_of_charcoal_from_Kultepe.jpg": {
    author: "Interfase",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Büyük_Menderes_(ancient_Maeander)_river_panorama_from_Miletus.jpg": {
    author: "Tomisti",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bridge_of_Hasankeyf_(49391828182).jpg": {
    author: "Vicuna R from Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "City_walls_in_Diyarbakır_(4).jpg": {
    author: "Radosław Botev",
    license: "CC BY 3.0 pl",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/pl/deed.en",
  },
  "City_walls_in_Diyarbakır_(5).jpg": {
    author: "Radosław Botev",
    license: "CC BY 3.0 pl",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/pl/deed.en",
  },
  "Cella_(sacred_courtyard)_and_the_naiskos,_Apollo_Temple,_Didyma.jpg": {
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
  "Chapel_of_St_Nicholas,_Archbishop_of_Myra_of_Lycia_the_Wonderworker_2.jpg": {
    author: "Zac Allan",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Bursa_Cumalıkızık_in_the_snow_2004_0099.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bursa_Cumalıkızık_in_the_snow_2004_0104.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bursa_Cumalıkızık_in_the_snow_2004_0112.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bursa_Cumalıkızık_in_the_winter_2004_0162.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bursa_Cumalıkızık_in_the_winter_2004_0164.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Bodrum_Museum_Ceramics_in_2015_3644.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Chora,_Kariye_Camii,_Dome_with_the_geneology_of_Christ.jpg": {
    author: "ArtProjection",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Chora,_Kariye_Camii,_Life_of_Christ_Mosaic.jpg": {
    author: "ArtProjection",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Chora_Church,_Kariye_Camii,_Life_of_Mary.jpg": {
    author: "ArtProjection",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "DerinkuyuUndergroundCity02.jpg": {
    author: "Cactus26 (talk)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Derinkuyu_Underground_City.JPG": {
    author: "Bjørn Christian Tørrissen",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Courtyard_of_the_Süleymaniye_Mosque_in_Istanbul,_Turkey_004.jpg": {
    author: "Moonik",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Çatalhöyük_after_the_first_excavations_by_James_Mellaart_and_his_team..jpg": {
    author: "Omar hoftun",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Derinkuyu_Underground_City_9831_Nevit.jpg": {
    author: "Nevit Dilmen (talk)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Derinkuyu_Underground_City_9831_Nevit_Enhancer.jpg": {
    author: "Nevit Dilmen (talk)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Derinkuyu_Underground_City_9843_Nevit_Enhancer.jpg": {
    author: "Nevit Dilmen (talk)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
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
  "DALYAN-KAUNOS_-_panoramio.jpg": {
    author: "HALUK COMERTEL",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  'Çanakkale,_Turkey._Wooden_horse_(from_the_film_"Troy")_on_waterfront_-_panoramio.jpg': {
    author: "Maarten Sepp",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Detail,_Balawat_gate_of_Shalmaneser,_bronze_band,_from_Tell_Balawat.jpg": {
    author: "Osama Shukir Muhammed Amin FRCP(Glasg)",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Cyzicus_amphitheatre_10.jpg": {
    author: "Izabela Miszczak",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Datça-Knidos.jpg": { author: "Wikimedia Commons", license: "Public domain" },
  "Didyma,_Turkey,_Temple_of_Apollon,_Face.jpg": {
    author: "Frunze103",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Didyma_Temple_of_Apollo_adyton.jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
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
  "Dalyan,_Kaunos_Kaya_Mezarları.jpg": {
    author: "Mkrc85",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Diyarbakir_City_walls.jpg": {
    author:
      "No machine-readable author provided. Bertilvidet~commonswiki assumed (based on copyright claims).",
    license: "CC BY 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by/2.5",
  },
  "EfesMuseumEingang.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Divrigi,Moschee-Kale.jpg": {
    author: "Bertramz",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Eflatunpınar_Hitit_Anıtı.jpg": {
    author: "Caner Cangül",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Divrigi_mosque_detail009.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Divrigi_mosque_detail013.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Divrigi_mosque_detail017.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Divrigi_complex_DSCF3028.jpg": {
    author: "R Prazeres",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Diyarbakir_city_walls_DSCF9396.jpg": {
    author: "R Prazeres",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Diocaesarea_(Isauria)_Roman_theatre_3534.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Diocaesarea_(Isauria)_Tyche_temple_cella_3470.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Diocaesarea_(Isauria)_information_3415.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "East_terrace_of_Mount_Nemrut_(1).jpg": {
    author: "Radosław Botev",
    license: "CC BY 3.0 pl",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/pl/deed.en",
  },
  "Efes_Library_of_Celsus_from_Curetes_Street_13.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Edirne_Selimiye_Mosque_from_distance_4483.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Edirne_Selimiye_Mosque_from_distance_4496.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Edirne_Selimiye_Mosque_from_distance_in_2003_4381.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Doğubayazıt,_palazzo_di_ishak_pasha,_1685-1784,_ingresso_principale_03_nicchia.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Doğubayazıt,_cimitero_e_moschea_del_palazzo_di_ishak_pasha,_xviii_secolo,_00.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Doğubayazıt,_cimitero_e_moschea_del_palazzo_di_ishak_pasha,_xviii_secolo,_10.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Eflatunpınar_Hittite_Water_Monument_1.jpg": {
    author: "Bluetime93",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Efes._Artemision_Illustratie_van_een_kapiteel,_GD004540.jpg": {
    author: "Unknown authorUnknown author",
    license: "Public domain",
  },
  "Efes_Yamac_Evler_(1).jpg": {
    author: "Marmaracalypso",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Entrance_into_theatre_of_Xanthos.jpg": {
    author: "Pot Noodle",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Ephesus_Celsus_Library_Façade.jpg": {
    author: "Benh LIEU SONG",
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
  "Elaiussa_Sebaste_-_agora_and_basilica.jpg": {
    author: "Vassia Atanassova - Spiritia",
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
  "Elaiussa_Sebaste_Cistern_9189.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Elaiussa_Sebaste_church_east_of_basilica_1307.jpg": {
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
  "Elaiussa_Sebaste_monumental_area_1325.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ephesian_Artemis_-_125-175_AD,_Ephesus_Museum,_Selçuk,_Turkey_(23786518299).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Ephesian_Artemis_-_125-175_AD,_Ephesus_Museum,_Selçuk,_Turkey_(5742656983).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Ephesian_Artemis_-_125-175_ADE,_Ephesus_Museum,_Selçuk,_Turkey_(5743214836).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Ephesian_Artemis_-_125-175_AD,_Ephesus_Museum,_Selçuk,_Turkey_(5742648961).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Entrance_to_Göreme_Open_Air_Museum.jpg": {
    author: "Slyronit",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Eflatunpınar_Hittite_Water_Monument_9.jpg": {
    author: "Bluetime93",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Eflatunpınar_Hittite_Water_Monument_6.jpg": {
    author: "Bluetime93",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Enclosure_with_T_Shaped_Pillars,_Karahantepe_(Karahan_Tepe),_Turkey_(2).jpg": {
    author: "tobeytravels",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Entrance_and_Dromos_of_Tumulus_MM_Midas_Mound_Gordion.jpg": {
    author: "Ywpark2003",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Filyos_Bay.jpg": {
    author: "Makalp",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Euromos_-_Tempio_di_Zeus_(1).jpg": {
    author: "Cypsel",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Festung_Harput.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Four_ivory_sphinxes_from_Acemhöyük,_Turkey._Pratt_ivories,_Metropolitan_Museum_of_Art.jpg": {
    author: "Elizabeth Simpson",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Euromos_Theatre_2015_3452.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Gate_of_Istanbul_Archaeological_Museums.jpg": {
    author: "Antoloji",
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
  "Field_of_the_ancient_stadium_in_Perge.jpg": {
    author: "The7bab",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Fethiye_museum_Letoon_Apollo_temple_mosaic_in_2016_7049.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Gaziantep_Zeugma_Museum_Geometric_Mosaic_2_-3rd_century_Oceanos_Villa_in_2011_1963b.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Gaziantep_Zeugma_Museum_Oceanus_and_Thetys_mosaic_Maybe_Pan_in_2011_1861b.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Gaziantep_Zeugma_Museum_Oceanus_and_Thetys_mosaic_Eros_riding_dolphin_in_2011_1857b.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Gaziantep_Zeugma_Museum_Oceanus_and_Thetys_mosaic_Eros_riding_dolphin_in_2011_1858b.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Gaziantep_Zeugma_Museum_Oceanus_and_Thetys_mosaic_All_in_2011_1843b.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Gaziantep_Zeugma_Museum_Oceanus_and_Thetys_mosaic_Fishes_in_2011_1862b.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Frontinus_Gate_-_Hierapolis,_Pamukkale,_Denizli_Province,_Turkey_-_October_6,_2025.jpg": {
    author: "Giorgio Galeotti",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Gulets_at_Andriake,_Myra,_Turkey.JPG": {
    author: "Babbsack",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Göbekli_Tepe.jpg": {
    author: "Creator:Rolfcosar",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Göbekli_Tepe,_Urfa.jpg": {
    author: "Teomancimit",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Grand_Kiosk_of_Topkapı_Palace_in_Istanbul,_Turkey_002.jpg": {
    author: "Moonik",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Hadrianic_Odeon_in_Troy_IX_(Ilion),_Turkey.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Greater_podium_frieze_from_the_Nereid_Monument_of_Xanthos_showing_heroic_battle_scenes,_British_Museum,_London_(9501127451).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Goreme_open-air_museum_-_panoramio.jpg": {
    author: "Melih Rustu CALIKOGL…",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Göreme_Open_Air_Museum_01.jpg": {
    author: "Bernard Gagnon",
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
  "Güzelsu,_Burg_Hoşap_(kurdisch,_17._Jhdt.)_(38611354250).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Güzelsu,_Burg_Hoşap_(kurdisch,_17._Jhdt.)_(26551028758).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Güzelsu,_Burg_Hoşap_(kurdisch,_17._Jhdt.)_(38611357460).jpg": {
    author: "Herbert Frank from Wien (Vienna), AT",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Goreme_Open_Air_Museum_(163972393).jpeg": {
    author: "Vyacheslav Gusev",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Gordion_Citadel_Mound_aerial_overview_2017.jpg": {
    author: "Gordion Archive, Penn Museum",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Great_Temple,_Hattusa,_Boğazkale,_Çorum,_Turkey_01.jpg": {
    author: "Murat Özsoy 1958",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Göbekli_Tepe_(2).jpg": {
    author: "Radosław Botev",
    license: "CC BY 3.0 pl",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/pl/deed.en",
  },
  "Goreme_Open_Air_Museum,_Göreme_Açık_Hava_Müzesi_(52398956086).jpg": {
    author: "Sonse",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Hagia_Sophia_-_Omphalion_-_Ayasofya_-_Αγία_Σοφία_-_47856240641.jpg": {
    author: "fusion-of-horizons",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Hagia_Sophia_-_Omphalion_-_Ayasofya_-_Αγία_Σοφία_-_47066782154.jpg": {
    author: "fusion-of-horizons",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Hagia_Sophia_-_Omphalion_-_Ayasofya_-_Αγία_Σοφία_-_47856233651.jpg": {
    author: "fusion-of-horizons",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
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
  "Gordion_city_mound_megaron_M10_(1993).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
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
  "Hasankeyf_and_Dicle_pano_cr.jpg": {
    author: "Nevit Dilmen",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Hattusa_The_King_gate.JPG": {
    author: "Rita1234",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Hattusa_Yerkapi_rampant.JPG": {
    author: "Rita1234",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Hearths_in_houses_asikli_hoyuk.JPG": { author: "Kvaestad", license: "Public domain" },
  "Hagia_Sophia_Mars_2013.jpg": {
    author: "Arild Vågen",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Hattusa_sign.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Heads_in_Nemrut_(8948449137).jpg": {
    author: "Mr Hicks46",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Harran_Great_Mosque_(1589066885).jpg": {
    author: "Verity Cridland",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
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
  "Hatay_Archaeology_Museum,_Antakya,_Turkey_(36018225852).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Hatay_Archaeology_Museum,_Antakya,_Turkey_(36061659491).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Hatay_Archaeology_Museum,_Antakya,_Turkey_(35803279660).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
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
  "Harbour_street_in_Patara-1.jpg": {
    author: "Alexey Komarov",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Hellenistic_theatre_in_Letoon,_seats,_2045.jpg": {
    author: "Zde",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Hasankeyf_Rock_Dwellings_1835b.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Hagia_Sophia_Istanbul_July_2022-2.jpg": {
    author: "Alvesgaspar",
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
  "Istanbul_-_Kariye_Camii_(s._Salvatore_in_Chora)_-_Foto_G._Dall'Orto_26-5-2006.jpg": {
    author: "G.dallorto",
    license: "Attribution",
  },
  "Ihlara.jpg": {
    author: "The original uploader was Morphosis at Turkish Wikipedia.",
    license: "Public domain",
  },
  "Inscription_written_in_honor_of_the_emperor_Domitian_found_above_one_of_the_two_gates_that_faced_the_main_street,_Phaselis,_Lycia,_Turkey_(9646312146).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
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
  "Ihlara_Valley_-_panoramio_(4).jpg": {
    author: "Николай Максимович",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
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
  "Hittites_from_Carchemish_paying_Tribute_to_Shalmaneser.jpg": {
    author: "Author Georges Perrot Author Charles Chipiez Translator I. Gonino",
    license: "Public domain",
  },
  "Hittite_lions,_Arslantepe_01.jpg": {
    author: "Zeynel Cebeci",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Heraclea_City_walls_2.jpg": {
    author: "Rjdeadly",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Hosap_Castle_1.jpg": {
    author: "Leon petrosyan",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Herakleia_'Sanctuary_of_Endymion'_back_wall_from_NW_(1991).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Hierapolis_Museum_Birth_of_Apollo_4285.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Hierapolis_Eastern_Necropolis_031.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Herakleia_necropolis_5091.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Istanbul_Archaeological_Museum_Sarcophagus_of_the_mourning_women_border_with_hunt_on_one_long_side_4064b.jpg":
    {
      author: "Dosseman",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
  "Ihlara_Valley_in_summer.jpg": {
    author: "Andrada Boldis",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ihlara_Valley,_Turkey.jpg": {
    author: "Andrada Boldis",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Herodes_Atticus_Bath_near_Alexandria_Troas.jpg": {
    author: "Raicem",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Hierapolis,_Pamukkale_5.jpg": {
    author: "Slyronit",
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
  "Karain.JPG": {
    author: "Klaus-Peter Simon",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Karain_-_Cave_Chamber.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Izmir_-_Kadifekale.JPG": {
    author: "Glorious 93",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Karatepe_©_Abdullah_Kıyga_-_panoramio.jpg": {
    author: "Abdullah kıyga",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Karain_Mağarası4.jpg": {
    author: "Acar54",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Istanbul_Gate,_Iznik,_Turkey_(26771480449).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Kanis_03.jpg": {
    author: "Laszlovszky András",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Iznik_Green_mosque_8159.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Istanbul_asv2020-02_img23_Topkapı_Palace.jpg": {
    author: "A.Savin",
    license: "FAL",
    licenseUrl: "http://artlibre.org/licence/lal/en",
  },
  "Istanbul_asv2020-02_img25_Topkapı_Palace.jpg": {
    author: "A.Savin",
    license: "FAL",
    licenseUrl: "http://artlibre.org/licence/lal/en",
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
  "Karain_cave_antalya_museum_turkey_paleolitik.JPG": {
    author: "tr:User:Bruno Giordano",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Iznik_Wall_at_Sarayi_Gate_099.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Iznik_Church_remains_at_Theatre_Street_8211.jpg": {
    author: "Dosseman",
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
  "Istanbul_Archaeological_Museum_Stuma_Paten_4086.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ivriz_site_of_Neo-Hittite_relief_(1993).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Karahan_Tepe_overview.jpg": { author: "Frantisek Trampota", license: "Public domain" },
  "Karahan_Tepe_excavation.jpg": { author: "Frantisek Trampota", license: "Public domain" },
  "Karahan_Tepe_stelae.jpg": { author: "Frantisek Trampota", license: "Public domain" },
  "Karahan_Tepe_in-situ_small_stone_vessel.jpg": {
    author: "Frantisek Trampota",
    license: "Public domain",
  },
  "Karahan_Tepe_man.jpg": {
    author: "Marco Restano",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Kaymakli_underground_city_8891_Nevit.jpg": {
    author: "Nevit Dilmen (talk)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Kaymakli_underground_city_8898_Nevit.jpg": {
    author: "Nevit Dilmen (talk)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Kaymakli_underground_city_8899_Nevit.jpg": {
    author: "Nevit Dilmen (talk)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Kaymakli_underground_city_8972_Nevit.jpg": {
    author: "Nevit Dilmen (talk)",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Klaros_004.jpg": {
    author: "Ingeborg Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "KilSilifkeG01.jpg": {
    author: "Ziegler175",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Kibyra_Theatre_9919.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kaunos_Kral_Mezarları_Dalyan_Ortaca_Muğla.jpg": {
    author: "Atakan Yasin KANUT",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kaunos_Theatre_090.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kaunos_Bath_4419.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kaunos_Stoa_area_4378.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Karatepe_South_Gate_Philistine_script_on_back_of_god_Tarhunzas_statue_5277.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Karatepe_North_Gate_NKr_sphinx_5297.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Karatepe_North_Gate_lion_at_portal_5312.jpg": {
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
  "Kibyra_East_Roman_bath_9927.jpg": {
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
  "Kings_of_Macedon_-_AR_Drachm_323-317_BC._Philip_III_Arrhidaios,_Lampsakos_mint._vz_-_MA-Shops.jpg":
    { author: "The government of the Kingdom of Macedonia.", license: "Public domain" },
  "Kibyra_Agora_9852.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Kaunos_Agora_view_6865_panorama.jpg": {
    author: "Dosseman",
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
  "Knidos_Theatre_95_005.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Labraunda_Andron_A_3830.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Labraunda_Andron_A_3873.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Labraunda_Temple_of_Zeus_3832_Panorama.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Labraunda_Doric_Building_3781_Panorama.jpg": {
    author: "Dosseman",
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
  "Konya_Mevlana_Museum_Courtyard_095.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Konya_Mevlana_Museum_Courtyard_100.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Konya_Mevlana_Museum_072.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Klazomenai_(Liman_Tepe)_Early_Bronze_Age_fortification_wall.jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
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
  "Lion_Zincirli.JPG": {
    author: "User:Lusitana",
    license: "CC BY 2.5",
    licenseUrl: "https://creativecommons.org/licenses/by/2.5",
  },
  "Lion_sculptures_from_Zincirli.jpg": { author: "Interfase", license: "Public domain" },
  "Lycian_monumental_tombs,_the_Harpy_tomb_and_the_pillared_sarcophagus,_Xanthos,_Lycia,_Turkey_(8814489373).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Lion_Gate,_Hattusa_01.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Lion_Gate,_Hattusa_02.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Lycian_Tomb_at_Termessos_-_Western_Necropolis_-_panoramio.jpg": {
    author: "Adrian Farwell",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Magnesia_Stadium.jpg": {
    author: "Feridun F. Alkaya",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Letoon_trilingual_Greek_sample.jpg": {
    author: "Panegyrics of Granovetter",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
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
  "Laodikeia_water_distribution_center.jpg": {
    author: "Laszlovszky András",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Lion_Gate,_Hattusa,_Boğazkale,_Çorum,_Turkey_02.jpg": {
    author: "Murat Özsoy 1958",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Letoon_Temple_of_Artemis_5355.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Limyra_Rock_graves_3924.jpg": {
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
  "Lycian_Tomb,_Xanthos.jpg": {
    author: "Deniz Mutlu",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Laodikeia_ad_Lycum_mayby_West_Baths_4804.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Magnesia_on_the_Maeander_Temple_of_Artemis_Ionic_capital.jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Les_vestiges_du_théâtre_de_Pessinus.jpg": {
    author: "Raisem",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Laodicea_Syria-Street_20240929_085448.jpg": {
    author: "Rigorius",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Mensole_of_the_Nysa's_Bouleuterion-1.jpg": {
    author: "MM DecArch",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Medusa_mosaic_of_Kibyra.jpg": { author: "AnonymousUnknown author", license: "Public domain" },
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
  "Milet_-_Baths_of_Faustina.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
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
  "Mausoleum_at_Halicarnassus_at_the_Bodrum_Museum_of_Underwater_Archaeology.jpg": {
    author: "Jona Lendering",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Mevlana_Museum,_Konya_04.jpg": {
    author: "Murat Özsoy 1958",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Mevlana_Museum,_Konya_07.jpg": {
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
  "Malatya_museum_Arslantepe_wall_paintings_2023.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Miletus_North_Agora_in_2015_3382.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Monastero_di_sumela,_stanze_usate_dai_monaci_04,2.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Monastero_di_sumela,_stanze_usate_dai_monaci_04.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Monastero_di_sumela,_stanze_usate_dai_monaci_06_camino.jpg": {
    author: "Francesco Bini",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Mardin_panorama_1.png": {
    author: "KediÇobanı",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Mardin_panorama_3.png": {
    author: "KediÇobanı",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Mardin_panorama_2.png": {
    author: "KediÇobanı",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Marble_tripod_monument_from_the_Bouleuterion_at_Miletos_(Berlin_Antikensammlung_Sk_1581_A,_from_Milet_I.2,_pl_XX).jpg":
    { author: "unknown photographer", license: "Public domain" },
  "Nysa,_Anatolia.JPG": { author: "Musti at English Wikipedia", license: "Public domain" },
  "Odeon_Teos_Seferihisar_Turkey.jpg": {
    author: "Ms. Sevil Ege",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Myra_Rock_Tombs.jpg": {
    author: "Saffron Blaze",
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
  "Mosaic,_late_antiquity,_Lapidary_of_Şanlıurfa_Museum,_Urfm021.jpg": {
    author: "Zde",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Mosaic,_late_antiquity,_Lapidary_of_Şanlıurfa_Museum,_Urfm02.jpg": {
    author: "Zde",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Necklace_found_in_one_of_the_Hattian_graves_in_Alacahöyük,_2500-2250_BC,_Museum_of_Anatolian_Civilizations,_Ankara_(28109409113).jpg":
    {
      author: "Carole Raddato from Frankfurt, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Mosaic_of_the_abandoned_Ariadne,_from_Seleucia_Pieria_(Samandağ),_2nd-3rd_century_AD,_Hatay_Archaeology_Museum,_Antakya,_Turkey_(35381400983).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "NEMRUT_BATI_TERASI.jpg": {
    author: "M.necim",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Myra_Antik_Kenti-Örenyeri.jpg": {
    author: "Esginmurat",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Myra-south-necropolis.jpg": {
    author: "Rab Lawrence",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Olympos_Bath_of_Vespasian_in_2016_0542.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Nemrut_Lion_on_'fire_altar'_of_E_terrace_in_2006_1477.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Nysa_on_the_Maeander,_Turkey_-_52534664137.jpg": {
    author: "Carole Raddato",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Myra_Necropolis,_Lycia,_Turkey_-_52619304899.jpg": {
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
  "Nysa_library_east_block_west_side_from_NW_(1991).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Museum_of_Troy_(53022400001).jpg": {
    author: "Troya Müzesi from Çanakkale, Türkiye",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "North_east_side_of_the_Roman_Agora.jpg": {
    author: "Yair-haklai",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Mosaic_with_the_personification_of_Halicarnassus,_British_Museum.jpg": {
    author: "14GTR",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Panorama_alexandriatroas.jpg": {
    author: "Horacio36",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Pergamon_-_02.jpg": {
    author: "Carlos Delgado",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Perge_-_Sutunlu_Cadde.jpg": {
    author: "Anilcan06",
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
  "Panorama_of_Mardin_from_the_Valley.jpg": {
    author: "Balkanique",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Panorama_of_Mardin_from_Zinciriye_Medresesi.jpg": {
    author: "Balkanique",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Orchestra_of_the_Greek_theatre_at_Priene_(2).jpg": {
    author: "Christopher de Lisle",
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
  "Pergamon_Museum_reliefs_from_Sam'al_aka_Zincirli_7937.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Panorama_of_Perge_theatre.jpg": {
    author: "The7bab",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Patara_Assembly_Hall_of_the_Lycian_Laegue_exterior_in_2013_4604.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Olympos_Theatre_in_2016_0536.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
  "Periodo_urartiano,_sacra_lancia_di_haldi,_in_bronzo,_dalla_fortezza_di_ayanis.jpg": {
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
  "Perge_Helenistik_Kapı_Ve_Ana_Cadde.jpg": {
    author: "Me Mike Göl",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Pinara_Amphitheatre_Fethiye_Mugla_Turkiye.JPG": {
    author: "Osmanyaylali",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Relife_depicting_a_sacrificial_scene.jpg": {
    author: "Alborz fallah",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Rumelihisarı_as_seen_from_Asia.JPG": {
    author: "İhsan Deniz Kılıçoğlu",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Rumelihisarı.JPG": {
    author: "İhsan Deniz Kılıçoğlu",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Rumelihisarı_(8393629929).jpg": {
    author: "Jorge Láscar from Australia",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  "Roman_theatre_-_Side_-_Antalya_Province,_Turkey_-_8_June_2015.jpg": {
    author: "Miguel Discart",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
  "Ruins_of_Thyateira.jpg": { author: "Akkinvet", license: "Public domain" },
  "Remains_of_the_Sarıkaya_palace,_Acemhöyük,_Turkey._Area_where_ivory,_glass,_and_obsidian_artifacts_were_found.jpg":
    {
      author: "Elizabeth Simpson",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
  "Rumelihisarı,_Kale,_Istanbul.jpg": {
    author: "Jwslubbock",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Priene_Acropolis.jpg": {
    author: "Christopher de Lisle",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Phaselis_August_2019_01.jpg": {
    author: "Лобачев Владимир",
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
  "Pinara_Lower_terrace_Odeon_in_2013_4528.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Pinara_Acropolis_hill_rock_graves_in_2013_4480.jpg": {
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
  "PXL_20241210_102315450_Suleymaniye_Mosque_Süleymaniye_Camii_Istanbul_Turkey_01.jpg": {
    author: "Sourabh.biswas003",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "PXL_20241210_102315450_Suleymaniye_Mosque_Süleymaniye_Camii_Istanbul_Turkey_12.jpg": {
    author: "Sourabh.biswas003",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "PXL_20241210_102315450_Suleymaniye_Mosque_Süleymaniye_Camii_Istanbul_Turkey_16.jpg": {
    author: "Sourabh.biswas003",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "PXL_20241210_102315450_Suleymaniye_Mosque_Süleymaniye_Camii_Istanbul_Turkey_19.jpg": {
    author: "Sourabh.biswas003",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Safranbolu_traditional_houses-2.jpg": {
    author: "Makalp",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Safranbolu_traditional_houses-3.jpg": {
    author: "Makalp",
    license: "CC BY-SA 3.0",
    licenseUrl: "http://creativecommons.org/licenses/by-sa/3.0/",
  },
  "Sar-Comana.jpg": {
    author: "Katpatuka",
    license: "FAL",
    licenseUrl: "http://artlibre.org/licence/lal/en",
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
  "Sagalassos_-_Theatre.jpg": {
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
  "Sasabey_Turkish_bath,_Akhisar.JPG": { author: "Akkinvet", license: "Public domain" },
  "Sagalassos_-_Heroon,_Upper_Agora.jpg": {
    author: "Ingo Mehling",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Sardis_Synagogue,_late_3rd_century_AD,_Sardis,_Lydia,_Turkey_(18897204194).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
  },
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
  "Sagalassos_Antonine_Fountain_aedicula_inside_in_2012_2711.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Sagalassos_Baths_seen_from_Colonnaded_Street_2012_2756.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Sagalassos_Heroon_and_behind_it_in_2012_2547.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Safranbolu_houses_in_2006_8307b.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Safranbolu_Evleri_2014.jpg": {
    author: "Hamdigumus",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Safranbolu_Evleri_2014-12.jpg": {
    author: "Hamdigumus",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Selimiye_Cami,_Mimar_Sinan'ın_Ustalık_Eseri_2015.jpg": {
    author: "Hamdigumus",
    license: "CC0",
    licenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  },
  "Stater_Zeus_Lampsacus_CdM.jpg": { author: "Jastrow (2010)", license: "Public domain" },
  "Silifke_castle_arrival.jpg": {
    author: "Frank Verleye",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Stadium,_Nysa_(Caria).jpg": {
    author: "Htkava",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Silifke_Bridge_Mersin_Province.JPG": {
    author: "Nedim Ardoğa",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
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
  "Statuette_of_a_statry,_terracotta,_previously_thought_to_be_King_Midas,_from_Gordion,_Museum_of_Anatolian_Civilizations,_Ankara_(26322234546).jpg":
    {
      author: "Carole Raddato from Frankfurt, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Stratonicea-ancient-theatre-road.jpg": {
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
  "Soğmatar_Hb_29.05.2010_Pognon-Höhle,_Felstempel_Skulpturen_554.jpg": {
    author: "Volker Höhfeld",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Soğmatar_Hb_29.05.2010_Tempelberg_Kutsal_Tepe_Felsenkammer-(Tempel)-Eingang_546.jpg": {
    author: "Volker Höhfeld",
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
  "Soğmatar_from_Urfa_rock-cut_chamber_deep_beneath_the_circular_platform_on_top_in_1997_160.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Stratonicee_Sebasteion.JPG": { author: "gabri331", license: "Public domain" },
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
  "The_main_street_linking_the_central_and_south_harbours_with_Domitians_Agora_on_the_right,_Phaselis,_Lycia,_Turkey_(9646167024).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Temple_of_Apollo,_Didyma_-_Adyton.jpg": {
    author: "Bernard Gagnon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "SUMELA_MANASTRY-TRABZON_-_panoramio_-_HALUK_COMERTEL_(7).jpg": {
    author: "HALUK COMERTEL",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Sümela_monastery_trabzon_-_panoramio.jpg": {
    author: "bynyalcin",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Şanlıurfa_Müzesi_Nevali_Çori_(2).jpg": {
    author: "Cobija",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "The_Pediment_of_the_Temple_of_Artemis_Leukophryene,_Magnesia_ad_Maeandrum,_Turkey_(5786893105).jpg":
    {
      author: "Carole Raddato from FRANKFURT, Germany",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
    },
  "Termessos_Gymnasium_3331.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "TERMESSOS_Odéon_intérieur.jpg": {
    author: "Franck devedjian",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Stratonicea-street.jpg": {
    author: "Raicem",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Stratonicea-gates.jpg": {
    author: "Raicem",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Teos,_Sığacık.jpg": {
    author: "Kadı",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Termessos_Road_to_theatre_cistern_3631.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Termessos_Construction_along_the_road_leading_to_the_Alcesas_tomb_3722.jpg": {
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
  "Teos_Sanctuary_of_Dionysos_from_W_01_(1991).jpg": {
    author: "Mark Landon",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0",
  },
  "Temple_from_Nevalı_Çori_stela.jpg": {
    author: "Cobija",
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
  "Temple_of_Trajan_-_Pergamon,_Bergama,_Bergama_District,_İzmir_Province,_Turkey_-_October_8,_2025_06.jpg":
    {
      author: "Giorgio Galeotti",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    },
  "Teos_or_Klazomenai_-_LG_-_Bird-Kotyle_Workshop_-_oinochoe_-_aquatic_bird_-_London_BM_1860-0404-10_-_02.jpg":
    {
      author: "ArchaiOptix",
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
  "Topkapı_-_01.jpg": {
    author: "Carlos Delgado",
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
  "THEATRE_OF_NYSA,_AYDIN_-_panoramio.jpg": {
    author: "Ahmet KAYNARPUNAR",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Tlos_Kronos_Temple_4247.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Tlos_Hill_above_stadium_5403.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Tlos_Bellerophon_grave_5605.jpg": {
    author: "Dosseman",
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
  "Turecko_Harran_(01).jpg": {
    author: "Zorka Sojka",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Troy_Museum_(Çanakkale)_detail_of_sarcophagus_2505.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Troy_Museum_(Çanakkale)_detail_of_sarcophagus_2502.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Troy_Museum_(Çanakkale)_detail_of_a_sarcophagus_2509.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Troy_Museum_(Çanakkale)_7893.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Tlos_Agora_and_theatre_4177.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Tlos_Overview_4214.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "The_remains_of_the_Temple_of_Hadrian,_Cyzicus_(Kyzikos),_the_eighth_wonder_of_the_ancient_world,_Mysia,_Turkey_-_53075003242.jpg":
    {
      author: "Carole Raddato",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
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
  "Totemlike_head_from_Nevalı_Çori._Urfa_Museum_object,_with_tentative_reconstruction.jpg": {
    author: "Drawing: Klaus Schmidt Photograph: Dosseman",
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
  "UrfaMuseumGöbekli.jpg": {
    author: "Klaus-Peter Simon",
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
  "Vespasian-Titus-Tunnel.jpg": {
    author: "Klaus-Peter Simon",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  },
  "Zelve_Open_Air_Museum_-_2014.10_-_panoramio.jpg": {
    author: "rheins",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0",
  },
  "Tyana,_Cappadocia,_Turkey_(23777525848).jpg": {
    author: "Carole Raddato from FRANKFURT, Germany",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0",
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
  "Xweşav.jpg": {
    author: "Dûrzan Cîrano",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Ürgüp_Açık_Hava_müzesi,kuzey_manzarası.jpg": {
    author: "ArtOzlem",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Zonguldak_Cehennem_Ağzı_Mağaraları.jpg": {
    author: "Oğuz67",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Zelve_Monastery_1944.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Zelve_Monastery_1943.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Zelve_Monastery_3527.jpg": {
    author: "Dosseman",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  "Zelve_Monastery_1941.jpg": {
    author: "Dosseman",
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
  "Urfa_museum_Mini_T-shaped_stones_Göbekli_Tepe_-_Neolithic_age_-_4791.jpg": {
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
  "Zincirli_Höyük._Citadel_Detail_grondplan_Hilani_I,_GDE003360.jpg": {
    author: "Unknown",
    license: "Public domain",
  },
  "Магнесия_на_Меандре._Пропилеи.jpg": {
    author: "Vadimph",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
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
