import { structureInfoAt } from "@/lib/structure-names";

/**
 * A photograph of one structure, at one city.
 *
 * `structureInfo` is keyed by structure name alone, which works for a name
 * only one city owns ("Library of Celsus") and cannot work for the rest:
 * "Tiyatro" appears in more than thirty cities, so a single image under that
 * key would be the wrong theatre in twenty-nine of them. Keying on the pair
 * is what lets the structure dialog show the structure instead of falling
 * back to the city cover.
 *
 * Every entry was matched by requiring the Commons file name to carry both
 * the city and the structure; a search hit alone is not evidence of either.
 */
const photos: Record<string, string> = {
  "acemhoyuk|fildişi işlik alanı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Four_ivory_sphinxes_from_Acemh%C3%B6y%C3%BCk%2C_Turkey._Pratt_ivories%2C_Metropolitan_Museum_of_Art.jpg/1280px-Four_ivory_sphinxes_from_Acemh%C3%B6y%C3%BCk%2C_Turkey._Pratt_ivories%2C_Metropolitan_Museum_of_Art.jpg",
  "acemhoyuk|Saray":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Remains_of_the_Sar%C4%B1kaya_palace%2C_Acemh%C3%B6y%C3%BCk%2C_Turkey._Area_where_ivory%2C_glass%2C_and_obsidian_artifacts_were_found.jpg/1280px-Remains_of_the_Sar%C4%B1kaya_palace%2C_Acemh%C3%B6y%C3%BCk%2C_Turkey._Area_where_ivory%2C_glass%2C_and_obsidian_artifacts_were_found.jpg",
  "ahtamar|Kutsal Haç Kilisesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Akhtamar_Island_on_Lake_Van_with_the_Armenian_Cathedral_of_the_Holy_Cross.jpg/960px-Akhtamar_Island_on_Lake_Van_with_the_Armenian_Cathedral_of_the_Holy_Cross.jpg",
  "aizanoi|Penkalas Köprüsü":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Aizanoi_Penkalas_Bridge_june_2008_2316.jpg/1280px-Aizanoi_Penkalas_Bridge_june_2008_2316.jpg",
  "aizanoi|Roma Hamamı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Aizanoi_Roman_bath_2nd_century_2258.jpg/1280px-Aizanoi_Roman_bath_2nd_century_2258.jpg",
  "aizanoi|Zeus Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Aizanoi_Zeus_temple_2114.jpg/1280px-Aizanoi_Zeus_temple_2114.jpg",
  "alacahoyuk|Hatti kral mezarları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Necklace_found_in_one_of_the_Hattian_graves_in_Alacah%C3%B6y%C3%BCk%2C_2500-2250_BC%2C_Museum_of_Anatolian_Civilizations%2C_Ankara_%2828109409113%29.jpg/1280px-Necklace_found_in_one_of_the_Hattian_graves_in_Alacah%C3%B6y%C3%BCk%2C_2500-2250_BC%2C_Museum_of_Anatolian_Civilizations%2C_Ankara_%2828109409113%29.jpg",
  "alacahoyuk|Hitit tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Alacah%C3%B6y%C3%BCk_Museum_Bath_Hittite_Imperial_Period_1450-12200_BC_3307.jpg/1280px-Alacah%C3%B6y%C3%BCk_Museum_Bath_Hittite_Imperial_Period_1450-12200_BC_3307.jpg",
  "alacahoyuk|Kabartmalar":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ankara_Anatolian_Civilizations_Alacahoyuk_orthostat_Goats_being_brought_to_sacrifice_by_a_priest_in_2004_01.jpg/1280px-Ankara_Anatolian_Civilizations_Alacahoyuk_orthostat_Goats_being_brought_to_sacrifice_by_a_priest_in_2004_01.jpg",
  "alacahoyuk|Sfenksli Kapı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg/1280px-Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg",
  "alexandria-troas|Roma Hamamı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Herodes_Atticus_Bath_near_Alexandria_Troas.jpg/1280px-Herodes_Atticus_Bath_near_Alexandria_Troas.jpg",
  "altintepe|apadanalı saray":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Altintepe-apadanaW.jpg/1280px-Altintepe-apadanaW.jpg",
  "amaseia|Amasya Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Amasya_evleri.jpg/1280px-Amasya_evleri.jpg",
  "amaseia|Pontus Kral Mezarları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Kral_Kaya_Mezarlar%C4%B1%2C_Amasya.jpg/1280px-Kral_Kaya_Mezarlar%C4%B1%2C_Amasya.jpg",
  "amaseia|Yeşilırmak Köprüleri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Amasya_evleri_ve_Ye%C5%9Fil%C4%B1rmak_%282%29.jpg/1280px-Amasya_evleri_ve_Ye%C5%9Fil%C4%B1rmak_%282%29.jpg",
  "amastris|Bedesten":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/1999_in_Amasra_Bedesten_022.jpg/1280px-1999_in_Amasra_Bedesten_022.jpg",
  "amisos|Amisos Tümülüsleri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Amisos_Tepesi_kuzey_t%C3%BCm%C3%BCl%C3%BCs%C3%BC_giri%C5%9Fi.JPG/1280px-Amisos_Tepesi_kuzey_t%C3%BCm%C3%BCl%C3%BCs%C3%BC_giri%C5%9Fi.JPG",
  "anavarza|Anavarza Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Anavarza_Castle.jpg/1280px-Anavarza_Castle.jpg",
  "anemurium|Nekropolis":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Anemurium_Necropolis_101.jpg/1280px-Anemurium_Necropolis_101.jpg",
  "anemurium|Odeon":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Anemurium_Odeon_5373.jpg/1280px-Anemurium_Odeon_5373.jpg",
  "anemurium|Roma Hamamları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Anemurium_Large_bath_5388.jpg/1280px-Anemurium_Large_bath_5388.jpg",
  "anemurium|Su Kemeri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Anemurium_Aqueduct_5287.jpg/1280px-Anemurium_Aqueduct_5287.jpg",
  "ani|Surlar":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/20110419_Ani_North_Walls_Turkey_Panorama.jpg/1280px-20110419_Ani_North_Walls_Turkey_Panorama.jpg",
  "antioch-pisidia|Augustus Tapınağı (Augusteum)":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Antioch_in_Pisidia_Augustus_Temple_041.jpg/1280px-Antioch_in_Pisidia_Augustus_Temple_041.jpg",
  "antioch-pisidia|Aziz Paul Kilisesi (Büyük Bazilika)":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Antioch_in_Pisidia_Great_Basilica_2864.jpg/1280px-Antioch_in_Pisidia_Great_Basilica_2864.jpg",
  "antioch-pisidia|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Antioch_in_Pisida_Theatre_in_1998_049.jpg/1280px-Antioch_in_Pisida_Theatre_in_1998_049.jpg",
  "aphrodisias|Aphrodite Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Aphrodisias_-_Temple_of_Aphrodite_01.jpg/1280px-Aphrodisias_-_Temple_of_Aphrodite_01.jpg",
  "aphrodisias|Sebasteion":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Afrodisias_-_Sebasti%C3%B3n_-_Sebasteion.jpg/1280px-Afrodisias_-_Sebasti%C3%B3n_-_Sebasteion.jpg",
  "aphrodisias|Stadyum":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Aphrodisias_-_Stadium_01.jpg/1280px-Aphrodisias_-_Stadium_01.jpg",
  "aphrodisias|Tetrapylon":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Aphrodisias_-_Tetrapylon_01.jpg/1280px-Aphrodisias_-_Tetrapylon_01.jpg",
  "arsameia|Mitridates Kabartması":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Arsameia_am_Nymphaios_%283._Jhdt.v.Chr.%29%2C_K%C3%B6nig_Mithridates_oder_Antiochos_beim_Handschlag_mit_Herakles_%2839561931695%29.jpg/1280px-Arsameia_am_Nymphaios_%283._Jhdt.v.Chr.%29%2C_K%C3%B6nig_Mithridates_oder_Antiochos_beim_Handschlag_mit_Herakles_%2839561931695%29.jpg",
  "arslantepe|Aslanlı kapı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Hittite_lions%2C_Arslantepe_01.jpg/1280px-Hittite_lions%2C_Arslantepe_01.jpg",
  "arslantepe|Duvar resimleri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Malatya_museum_Arslantepe_wall_paintings_2023.jpg/1280px-Malatya_museum_Arslantepe_wall_paintings_2023.jpg",
  "arykanda|Agora":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Arykanda_State_Agora_Retaining_wall_5071.jpg/1280px-Arykanda_State_Agora_Retaining_wall_5071.jpg",
  "arykanda|Odeion ve Bouleuterion":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Arykanda_Odeon_3806.jpg/1280px-Arykanda_Odeon_3806.jpg",
  "arykanda|Roma Hamamı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Arykanda_Thermen.jpg/1280px-Arykanda_Thermen.jpg",
  "arykanda|Stadyum":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Arykanda_Stadion_3832.jpg/1280px-Arykanda_Stadion_3832.jpg",
  "arykanda|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Arykanda_Stadion_and_Theatre_5057.jpg/1280px-Arykanda_Stadion_and_Theatre_5057.jpg",
  "asikli-hoyuk|fırınlar ve ocaklar":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Hearths_in_houses_asikli_hoyuk.JPG/1280px-Hearths_in_houses_asikli_hoyuk.JPG",
  "aspendos|Agora":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Aspendos_Agora_4698.jpg/1280px-Aspendos_Agora_4698.jpg",
  "aspendos|Bazilika":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Aspendos_Basilica_Antalya_Turkey.jpg/1280px-Aspendos_Basilica_Antalya_Turkey.jpg",
  "aspendos|Roma Tiyatrosu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Aspendos_Amphitheatre.jpg/1280px-Aspendos_Amphitheatre.jpg",
  "aspendos|Stadyum":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Ancient_Aspendos_Stadium%2C_view_from_the_hill_%282024%29_%281%29.jpg/1280px-Ancient_Aspendos_Stadium%2C_view_from_the_hill_%282024%29_%281%29.jpg",
  "assos|Agora":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Assos_agora_from_NE_%281991%29.jpg/1280px-Assos_agora_from_NE_%281991%29.jpg",
  "assos|Antik liman":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Assos_Harbour_001.jpg/1280px-Assos_Harbour_001.jpg",
  "assos|Athena Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Assos_-_Doric_Temple_of_Athena_-_panoramio.jpg/1280px-Assos_-_Doric_Temple_of_Athena_-_panoramio.jpg",
  "assos|Surlar":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Assos_-_Akropolis_Wall_-_panoramio.jpg/1280px-Assos_-_Akropolis_Wall_-_panoramio.jpg",
  "ayanis|Haldi Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Periodo_urartiano%2C_sacra_lancia_di_haldi%2C_in_bronzo%2C_dalla_fortezza_di_ayanis.jpg/1280px-Periodo_urartiano%2C_sacra_lancia_di_haldi%2C_in_bronzo%2C_dalla_fortezza_di_ayanis.jpg",
  "carchemish|Asur Yazıtları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Ankara_Anatolian_Civilizations_Carchemish_orthostats_Water_Assyrian_dressed_figure_%28Carchemish%2C_Water_Gate%29_in_2004_04.jpg/1280px-Ankara_Anatolian_Civilizations_Carchemish_orthostats_Water_Assyrian_dressed_figure_%28Carchemish%2C_Water_Gate%29_in_2004_04.jpg",
  "carchemish|Hitit Sarayı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Hittites_from_Carchemish_paying_Tribute_to_Shalmaneser.jpg/1280px-Hittites_from_Carchemish_paying_Tribute_to_Shalmaneser.jpg",
  "carchemish|Kral Yolu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Ankara_Anatolian_Civilizations_Carchemish_orthostats_Royal_Buttress_Front_face_All_in_2012_07.jpg/1280px-Ankara_Anatolian_Civilizations_Carchemish_orthostats_Royal_Buttress_Front_face_All_in_2012_07.jpg",
  "carchemish|Uzun Duvar Kabartmaları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Ankara_Anatolian_Civilizations_Carchemish_orthostats_Long_Wall_Chariot_scene_D_in_2011_07.jpg/1280px-Ankara_Anatolian_Civilizations_Carchemish_orthostats_Long_Wall_Chariot_scene_D_in_2011_07.jpg",
  "catalhoyuk|Güney höyük":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_02.jpg/1280px-%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_02.jpg",
  "catalhoyuk|Kuzey kazı alanı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/%C3%87atalh%C3%B6y%C3%BCk_after_the_first_excavations_by_James_Mellaart_and_his_team..jpg/1280px-%C3%87atalh%C3%B6y%C3%BCk_after_the_first_excavations_by_James_Mellaart_and_his_team..jpg",
  "dara|Nekropol":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Dara_Nekropol_Alan%C4%B1.jpg/1280px-Dara_Nekropol_Alan%C4%B1.jpg",
  "didyma|Adyton":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Temple_of_Apollo%2C_Didyma_-_Adyton.jpg/1280px-Temple_of_Apollo%2C_Didyma_-_Adyton.jpg",
  "didyma|Apollon Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Didyma%2C_Turkey%2C_Temple_of_Apollon%2C_Face.jpg/1280px-Didyma%2C_Turkey%2C_Temple_of_Apollon%2C_Face.jpg",
  "didyma|Kutsal Yol":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Cella_%28sacred_courtyard%29_and_the_naiskos%2C_Apollo_Temple%2C_Didyma.jpg/1280px-Cella_%28sacred_courtyard%29_and_the_naiskos%2C_Apollo_Temple%2C_Didyma.jpg",
  "didyma|Medusa başı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/A_stone-carved_Medusa_head%2C_Apollo_Temple%2C_Didyma.jpg/1280px-A_stone-carved_Medusa_head%2C_Apollo_Temple%2C_Didyma.jpg",
  "efes|Artemis Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/TR.IZ.Selcuk_Ephesus_2011-10-04_Temple-of-Artemis_07_3x2-R_5K.jpg/1280px-TR.IZ.Selcuk_Ephesus_2011-10-04_Temple-of-Artemis_07_3x2-R_5K.jpg",
  "efes|Büyük Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Ephesus_-_Great_Theater.jpg/1280px-Ephesus_-_Great_Theater.jpg",
  "efes|Celsus Kütüphanesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Ephesus_Celsus_Library_Fa%C3%A7ade.jpg/1280px-Ephesus_Celsus_Library_Fa%C3%A7ade.jpg",
  "efes|Kuretler Caddesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Efes_Library_of_Celsus_from_Curetes_Street_13.jpg/1280px-Efes_Library_of_Celsus_from_Curetes_Street_13.jpg",
  "efes|Yamaç Evler":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Efes_Yamac_Evler_%281%29.jpg/1280px-Efes_Yamac_Evler_%281%29.jpg",
  "elaiussa-sebaste|Agora":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Elaiussa_Sebaste_-_agora_and_basilica.jpg/1280px-Elaiussa_Sebaste_-_agora_and_basilica.jpg",
  "elaiussa-sebaste|Anıt Mezar":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Elaiussa_Sebaste_monumental_area_1325.jpg/1280px-Elaiussa_Sebaste_monumental_area_1325.jpg",
  "elaiussa-sebaste|Kilise":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Elaiussa_Sebaste_church_east_of_basilica_1307.jpg/1280px-Elaiussa_Sebaste_church_east_of_basilica_1307.jpg",
  "elaiussa-sebaste|Su Sarnıçları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Elaiussa_Sebaste_Cistern_9189.jpg/1280px-Elaiussa_Sebaste_Cistern_9189.jpg",
  "elaiussa-sebaste|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Elaiussa_Sebaste_approaching_theatre_2139.jpg/1280px-Elaiussa_Sebaste_approaching_theatre_2139.jpg",
  "euromos|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Euromos_Theatre_2015_3452.jpg/1280px-Euromos_Theatre_2015_3452.jpg",
  "euromos|Zeus Lepsinos Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Euromos_-_Tempio_di_Zeus_%281%29.jpg/1280px-Euromos_-_Tempio_di_Zeus_%281%29.jpg",
  "gobeklitepe|Hayvan kabartmaları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Animal_hunting_scene._Gobekli_Tepe.jpg/1280px-Animal_hunting_scene._Gobekli_Tepe.jpg",
  "gobeklitepe|T biçimli dikilitaşlar":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Urfa_museum_Mini_T-shaped_stones_G%C3%B6bekli_Tepe_-_Neolithic_age_-_4791.jpg/1280px-Urfa_museum_Mini_T-shaped_stones_G%C3%B6bekli_Tepe_-_Neolithic_age_-_4791.jpg",
  "gordion|Kral Kapısı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Gordion_Midas_Citadel_Gate_complex_in_2012_0935.jpg/1280px-Gordion_Midas_Citadel_Gate_complex_in_2012_0935.jpg",
  "gordion|Megaron yapıları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Gordion_city_mound_megaron_M10_%281993%29.jpg/1280px-Gordion_city_mound_megaron_M10_%281993%29.jpg",
  "gordion|Midas Tümülüsü":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Entrance_and_Dromos_of_Tumulus_MM_Midas_Mound_Gordion.jpg/1280px-Entrance_and_Dromos_of_Tumulus_MM_Midas_Mound_Gordion.jpg",
  "halikarnassos|Bodrum Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Bodrum_Castle%2C_Turkey.jpg/1280px-Bodrum_Castle%2C_Turkey.jpg",
  "halikarnassos|Mausoleion":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Mausoleum_of_Halicarnassus_2004.jpg/1280px-Mausoleum_of_Halicarnassus_2004.jpg",
  "harput|Harput Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Harput_113_%2859495%29.jpg/1280px-Harput_113_%2859495%29.jpg",
  "harput|Harput Müzesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Festung_Harput.jpg/1280px-Festung_Harput.jpg",
  "harran|Harran Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Harran_2015.jpg/1280px-Harran_2015.jpg",
  "harran|Kümbet evler":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Harran_Beehive_houses_192b.jpg/1280px-Harran_Beehive_houses_192b.jpg",
  "harran|Ulu Cami ve minare":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Harran_Great_Mosque_%281589066885%29.jpg/1280px-Harran_Great_Mosque_%281589066885%29.jpg",
  "hasankeyf|Dicle Köprüsü":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Hasankeyf_and_Dicle_pano_cr.jpg/1280px-Hasankeyf_and_Dicle_pano_cr.jpg",
  "hasankeyf|Hasankeyf Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Bridge_of_Hasankeyf_%2849391828182%29.jpg/1280px-Bridge_of_Hasankeyf_%2849391828182%29.jpg",
  "hasankeyf|Kaya Mezarları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Hasankeyf_Rock_Dwellings_1835b.jpg/1280px-Hasankeyf_Rock_Dwellings_1835b.jpg",
  "hattusa|Aslanlı Kapı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Lion_Gate%2C_Hattusa_01.jpg/1280px-Lion_Gate%2C_Hattusa_01.jpg",
  "hattusa|Büyük Tapınak":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Great_Temple%2C_Hattusa%2C_Bo%C4%9Fazkale%2C_%C3%87orum%2C_Turkey_01.jpg/1280px-Great_Temple%2C_Hattusa%2C_Bo%C4%9Fazkale%2C_%C3%87orum%2C_Turkey_01.jpg",
  "hattusa|Kral Kapı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Hattusa_The_King_gate.JPG/1280px-Hattusa_The_King_gate.JPG",
  "hattusa|Yazılıkaya":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Bogazkale_Hattusa_banner_Yazilikaya.jpg/1280px-Bogazkale_Hattusa_banner_Yazilikaya.jpg",
  "hattusa|Yerkapı tüneli":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Hattusa_Yerkapi_rampant.JPG/1280px-Hattusa_Yerkapi_rampant.JPG",
  "heraclia-pontica|Antik Surlar":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Heraclea_City_walls_2.jpg/1280px-Heraclea_City_walls_2.jpg",
  "heraclia-pontica|Cehennemağzı Mağaraları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Zonguldak_Cehennem_A%C4%9Fz%C4%B1_Ma%C4%9Faralar%C4%B1.jpg/1280px-Zonguldak_Cehennem_A%C4%9Fz%C4%B1_Ma%C4%9Faralar%C4%B1.jpg",
  "heraclia-pontica|Herakles Kutsal Alanı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Herakleia_%27Sanctuary_of_Endymion%27_back_wall_from_NW_%281991%29.jpg/1280px-Herakleia_%27Sanctuary_of_Endymion%27_back_wall_from_NW_%281991%29.jpg",
  "heraclia-pontica|Nekropol":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Herakleia_necropolis_5091.jpg/1280px-Herakleia_necropolis_5091.jpg",
  "hierapolis|Antik havuz":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Antique_theatre_in_Hierapolis.jpg/1280px-Antique_theatre_in_Hierapolis.jpg",
  "hierapolis|Apollon Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/The_Temple_of_Apollo_built_in_the_3rd_century_AD_using_stone_blocks_from_the_older_temple%2C_Hierapolis%2C_Phrygia%2C_Turkey_%2832332224546%29.jpg/1280px-The_Temple_of_Apollo_built_in_the_3rd_century_AD_using_stone_blocks_from_the_older_temple%2C_Hierapolis%2C_Phrygia%2C_Turkey_%2832332224546%29.jpg",
  "hierapolis|Frontinus Caddesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Frontinus_Gate_-_Hierapolis%2C_Pamukkale%2C_Denizli_Province%2C_Turkey_-_October_6%2C_2025.jpg/1280px-Frontinus_Gate_-_Hierapolis%2C_Pamukkale%2C_Denizli_Province%2C_Turkey_-_October_6%2C_2025.jpg",
  "hierapolis|Nekropol":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hierapolis_Eastern_Necropolis_031.jpg/1280px-Hierapolis_Eastern_Necropolis_031.jpg",
  "hierapolis|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Ancient_Roman_theatre%2C_Hierapolis.jpg/1280px-Ancient_Roman_theatre%2C_Hierapolis.jpg",
  "hosap|Hoşap Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/G%C3%BCzelsu%2C_Burg_Ho%C5%9Fap_%28kurdisch%2C_17._Jhdt.%29_%2826551030028%29.jpg/1280px-G%C3%BCzelsu%2C_Burg_Ho%C5%9Fap_%28kurdisch%2C_17._Jhdt.%29_%2826551030028%29.jpg",
  "hosap|Kale Kapısı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Hosap_Castle_1.jpg/1280px-Hosap_Castle_1.jpg",
  "karahan-tepe|T biçimli dikilitaşlar":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Enclosure_with_T_Shaped_Pillars%2C_Karahantepe_%28Karahan_Tepe%29%2C_Turkey_%282%29.jpg/1280px-Enclosure_with_T_Shaped_Pillars%2C_Karahantepe_%28Karahan_Tepe%29%2C_Turkey_%282%29.jpg",
  "karahan-tepe|taş oturma banklı yapı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Karahan_Tepe_in-situ_small_stone_vessel.jpg/1280px-Karahan_Tepe_in-situ_small_stone_vessel.jpg",
  "karatepe|Aslan Heykelleri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Karatepe_North_Gate_lion_at_portal_5312.jpg/1280px-Karatepe_North_Gate_lion_at_portal_5312.jpg",
  "karatepe|Fırtına Tanrısı Heykeli":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Karatepe_South_Gate_Philistine_script_on_back_of_god_Tarhunzas_statue_5277.jpg/1280px-Karatepe_South_Gate_Philistine_script_on_back_of_god_Tarhunzas_statue_5277.jpg",
  "karatepe|Güney Kapı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Karatepe_to_South_Gate_5240.jpg/1280px-Karatepe_to_South_Gate_5240.jpg",
  "karatepe|Sfenks Heykelleri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Karatepe_North_Gate_NKr_sphinx_5297.jpg/1280px-Karatepe_North_Gate_NKr_sphinx_5297.jpg",
  "kaunos|Agora":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Kaunos_Agora_view_6865_panorama.jpg/1280px-Kaunos_Agora_view_6865_panorama.jpg",
  "kaunos|Kaya Mezarları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Dalyan%2C_Kaunos_Kaya_Mezarlar%C4%B1.jpg/1280px-Dalyan%2C_Kaunos_Kaya_Mezarlar%C4%B1.jpg",
  "kaunos|Roma Hamamı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Kaunos_Bath_4419.jpg/1280px-Kaunos_Bath_4419.jpg",
  "kaunos|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Kaunos_Theatre_090.jpg/1280px-Kaunos_Theatre_090.jpg",
  "kibyra|Agora":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Kibyra_Agora_9852.jpg/1280px-Kibyra_Agora_9852.jpg",
  "kibyra|Medusa Mozaiği Odeonu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Medusa_mosaic_of_Kibyra.jpg/1280px-Medusa_mosaic_of_Kibyra.jpg",
  "kibyra|Roma Hamamı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Kibyra_East_Roman_bath_9927.jpg/1280px-Kibyra_East_Roman_bath_9927.jpg",
  "kibyra|Stadyum":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Kibyra_View_towards_stadium_9766_panorama.jpg/1280px-Kibyra_View_towards_stadium_9766_panorama.jpg",
  "kibyra|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Kibyra_Theatre_9919.jpg/1280px-Kibyra_Theatre_9919.jpg",
  "klazomenai|Liman Tepe Höyüğü":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Klazomenai_%28Liman_Tepe%29_Early_Bronze_Age_fortification_wall.jpg/1280px-Klazomenai_%28Liman_Tepe%29_Early_Bronze_Age_fortification_wall.jpg",
  "klazomenai|Zeytinyağı Atölyesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Teos_or_Klazomenai_-_LG_-_Bird-Kotyle_Workshop_-_oinochoe_-_aquatic_bird_-_London_BM_1860-0404-10_-_02.jpg/1280px-Teos_or_Klazomenai_-_LG_-_Bird-Kotyle_Workshop_-_oinochoe_-_aquatic_bird_-_London_BM_1860-0404-10_-_02.jpg",
  "knidos|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Knidos_Theatre_95_005.jpg/1280px-Knidos_Theatre_95_005.jpg",
  "knidos|Yuvarlak Aphrodite Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/20221202_Aphrodite_of_Knidos.jpg/1280px-20221202_Aphrodite_of_Knidos.jpg",
  "kultepe|Höyük":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Kultepe_mound_-_%27Large_palace_on_south_terrace%27_from_S_%281993%29.jpg/1280px-Kultepe_mound_-_%27Large_palace_on_south_terrace%27_from_S_%281993%29.jpg",
  "kultepe|Karum mahallesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Kultepe_Karum_trenches_and_mound_%281993%29.jpg/1280px-Kultepe_Karum_trenches_and_mound_%281993%29.jpg",
  "kultepe|Saray kalıntıları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Brazier_and_remains_of_charcoal_from_Kultepe.jpg/1280px-Brazier_and_remains_of_charcoal_from_Kultepe.jpg",
  "kultepe|Tablet arşivleri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Clay_tablets_with_cuneiform_letters_found_K%C3%BCltepe_%28ancient_Kanesh%29%2C_1900_BC_-_1700_BC%2C_Museum_of_Anatolian_Civilizations%2C_Ankara_%2830187162882%29.jpg/1280px-Clay_tablets_with_cuneiform_letters_found_K%C3%BCltepe_%28ancient_Kanesh%29%2C_1900_BC_-_1700_BC%2C_Museum_of_Anatolian_Civilizations%2C_Ankara_%2830187162882%29.jpg",
  "kyzikos|Amfitiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Cyzicus_amphitheatre_10.jpg/1280px-Cyzicus_amphitheatre_10.jpg",
  "kyzikos|Hadrianus Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/The_remains_of_the_Temple_of_Hadrian%2C_Cyzicus_%28Kyzikos%29%2C_the_eighth_wonder_of_the_ancient_world%2C_Mysia%2C_Turkey_-_53075003232.jpg/1280px-The_remains_of_the_Temple_of_Hadrian%2C_Cyzicus_%28Kyzikos%29%2C_the_eighth_wonder_of_the_ancient_world%2C_Mysia%2C_Turkey_-_53075003232.jpg",
  "kyzikos|Liman kalıntıları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/The_remains_of_the_Temple_of_Hadrian%2C_Cyzicus_%28Kyzikos%29%2C_the_eighth_wonder_of_the_ancient_world%2C_Mysia%2C_Turkey_-_53075003242.jpg/1280px-The_remains_of_the_Temple_of_Hadrian%2C_Cyzicus_%28Kyzikos%29%2C_the_eighth_wonder_of_the_ancient_world%2C_Mysia%2C_Turkey_-_53075003242.jpg",
  "labraunda|Andron A":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Labraunda_Andron_A_3830.jpg/1280px-Labraunda_Andron_A_3830.jpg",
  "labraunda|Andron B":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Labraunda_Andron_A_3873.jpg/1280px-Labraunda_Andron_A_3873.jpg",
  "labraunda|Güney Propylon":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Labraunda_South_Terrace_3790_Panorama.jpg/1280px-Labraunda_South_Terrace_3790_Panorama.jpg",
  "labraunda|Oikoi Binası":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Labraunda_Doric_Building_3781_Panorama.jpg/1280px-Labraunda_Doric_Building_3781_Panorama.jpg",
  "labraunda|Zeus Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Labraunda_Temple_of_Zeus_3832_Panorama.jpg/1280px-Labraunda_Temple_of_Zeus_3832_Panorama.jpg",
  "lampsacus|Sikke Darphanesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Kings_of_Macedon_-_AR_Drachm_323-317_BC._Philip_III_Arrhidaios%2C_Lampsakos_mint._vz_-_MA-Shops.jpg/1280px-Kings_of_Macedon_-_AR_Drachm_323-317_BC._Philip_III_Arrhidaios%2C_Lampsakos_mint._vz_-_MA-Shops.jpg",
  "lampsacus|Zeus Sunağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Stater_Zeus_Lampsacus_CdM.jpg/1280px-Stater_Zeus_Lampsacus_CdM.jpg",
  "laodikeia|Batı Tiyatrosu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Laodikeia_ad_Lycum_mayby_West_Baths_4804.jpg/1280px-Laodikeia_ad_Lycum_mayby_West_Baths_4804.jpg",
  "laodikeia|Laodikeia Kilisesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Laodicea_Ancient_City_2026%2C_108.jpg/1280px-Laodicea_Ancient_City_2026%2C_108.jpg",
  "laodikeia|Su dağıtım terminali":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Laodikeia_water_distribution_center.jpg/1280px-Laodikeia_water_distribution_center.jpg",
  "laodikeia|Suriye Caddesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Laodicea_Syria-Street_20240929_085448.jpg/1280px-Laodicea_Syria-Street_20240929_085448.jpg",
  "letoon|Apollon Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Fethiye_museum_Letoon_Apollo_temple_mosaic_in_2016_7049.jpg/1280px-Fethiye_museum_Letoon_Apollo_temple_mosaic_in_2016_7049.jpg",
  "letoon|Artemis Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Letoon_Temple_of_Artemis_5355.jpg/1280px-Letoon_Temple_of_Artemis_5355.jpg",
  "letoon|Leto Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Temple_of_Artemis_in_Letoon%2C_2056.jpg/1280px-Temple_of_Artemis_in_Letoon%2C_2056.jpg",
  "letoon|Üç Dilli Yazıt":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Letoon_trilingual_Greek_sample.jpg/1280px-Letoon_trilingual_Greek_sample.jpg",
  "limyra|Gaius Caesar Anıtı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Antalya_Museum_Gaius_Caesar_cenotaph_Limyra%27s_monuments_6590.jpg/1280px-Antalya_Museum_Gaius_Caesar_cenotaph_Limyra%27s_monuments_6590.jpg",
  "limyra|Kaineus Kabartması":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Limyra_Kaineus_Tomb_5202.jpg/1280px-Limyra_Kaineus_Tomb_5202.jpg",
  "limyra|Kaya Mezarları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Limyra_Rock_graves_3924.jpg/1280px-Limyra_Rock_graves_3924.jpg",
  "limyra|Perikles Heroonu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Antalya_museum_Heroon%29_of_Pericles_King_of_Lycia_Limyra%27s_monuments_3232.jpg/1280px-Antalya_museum_Heroon%29_of_Pericles_King_of_Lycia_Limyra%27s_monuments_3232.jpg",
  "limyra|Roma Tiyatrosu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Limyra_Building_next_to_Roman_Theatre_3785.jpg/1280px-Limyra_Building_next_to_Roman_Theatre_3785.jpg",
  "magnesia|Artemis Leukophryene Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/The_Pediment_of_the_Temple_of_Artemis_Leukophryene%2C_Magnesia_ad_Maeandrum%2C_Turkey_%285786893105%29.jpg/1280px-The_Pediment_of_the_Temple_of_Artemis_Leukophryene%2C_Magnesia_ad_Maeandrum%2C_Turkey_%285786893105%29.jpg",
  "magnesia|Stadyum":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Magnesia_Stadium.jpg/1280px-Magnesia_Stadium.jpg",
  "midas|bitmemiş anıt":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Midas_Monument%2C_Yaz%C4%B1l%C4%B1kaya.jpg/1280px-Midas_Monument%2C_Yaz%C4%B1l%C4%B1kaya.jpg",
  "midas|kaya mezarları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Midas_City%2C_Yaz%C4%B1l%C4%B1kaya_05.jpg/1280px-Midas_City%2C_Yaz%C4%B1l%C4%B1kaya_05.jpg",
  "midas|Midas Anıtı (Yazılıkaya)":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/MidasSehriAkropolis.jpg/1280px-MidasSehriAkropolis.jpg",
  "milet|Bouleuterion":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Marble_tripod_monument_from_the_Bouleuterion_at_Miletos_%28Berlin_Antikensammlung_Sk_1581_A%2C_from_Milet_I.2%2C_pl_XX%29.jpg/1280px-Marble_tripod_monument_from_the_Bouleuterion_at_Miletos_%28Berlin_Antikensammlung_Sk_1581_A%2C_from_Milet_I.2%2C_pl_XX%29.jpg",
  "milet|Büyük Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/B%C3%BCy%C3%BCk_Menderes_%28ancient_Maeander%29_river_panorama_from_Miletus.jpg/1280px-B%C3%BCy%C3%BCk_Menderes_%28ancient_Maeander%29_river_panorama_from_Miletus.jpg",
  "milet|Faustina Hamamı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Milet_-_Baths_of_Faustina.jpg/1280px-Milet_-_Baths_of_Faustina.jpg",
  "milet|Kuzey Agora":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Miletus_North_Agora_in_2015_3382.jpg/1280px-Miletus_North_Agora_in_2015_3382.jpg",
  "myra|Andriake limanı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Gulets_at_Andriake%2C_Myra%2C_Turkey.JPG/1280px-Gulets_at_Andriake%2C_Myra%2C_Turkey.JPG",
  "myra|Aziz Nikolaos Kilisesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Chapel_of_St_Nicholas%2C_Archbishop_of_Myra_of_Lycia_the_Wonderworker_2.jpg/1280px-Chapel_of_St_Nicholas%2C_Archbishop_of_Myra_of_Lycia_the_Wonderworker_2.jpg",
  "myra|Kaya mezarları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Myra_Rock_Tombs.jpg/1280px-Myra_Rock_Tombs.jpg",
  "myra|Roma tiyatrosu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Ancient_theatre_of_Myra_10.jpg/1280px-Ancient_theatre_of_Myra_10.jpg",
  "nemrut|Aslanlı horoskop":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Nemrut_Lion_on_%27fire_altar%27_of_E_terrace_in_2006_1477.jpg/1280px-Nemrut_Lion_on_%27fire_altar%27_of_E_terrace_in_2006_1477.jpg",
  "nemrut|Batı terası":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/NEMRUT_BATI_TERASI.jpg/1280px-NEMRUT_BATI_TERASI.jpg",
  "nemrut|Dev tanrı başları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Heads_in_Nemrut_%288948449137%29.jpg/1280px-Heads_in_Nemrut_%288948449137%29.jpg",
  "nemrut|Doğu terası":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/East_terrace_of_Mount_Nemrut_%281%29.jpg/1280px-East_terrace_of_Mount_Nemrut_%281%29.jpg",
  "nevali-cori|fırınlı açık alan":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Nevali_%C3%87ori_kaz%C4%B1_alan%C4%B1_maketi_%282%29.jpg/1280px-Nevali_%C3%87ori_kaz%C4%B1_alan%C4%B1_maketi_%282%29.jpg",
  "nevali-cori|taş baş heykeller":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Totemlike_head_from_Neval%C4%B1_%C3%87ori._Urfa_Museum_object%2C_with_tentative_reconstruction.jpg/1280px-Totemlike_head_from_Neval%C4%B1_%C3%87ori._Urfa_Museum_object%2C_with_tentative_reconstruction.jpg",
  "nikaia|Ayasofya (Orhan Camii)":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ayasofya_Cami%2C_%C4%B0znik_2014.jpg/1280px-Ayasofya_Cami%2C_%C4%B0znik_2014.jpg",
  "nikaia|Göl bazilikası":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Aerial_view_of_Lake_%C4%B0znik_from_north-east_%28IMG_2266%29.jpg/1280px-Aerial_view_of_Lake_%C4%B0znik_from_north-east_%28IMG_2266%29.jpg",
  "nikaia|İstanbul Kapı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Istanbul_Gate%2C_Iznik%2C_Turkey_%2826771480449%29.jpg/1280px-Istanbul_Gate%2C_Iznik%2C_Turkey_%2826771480449%29.jpg",
  "nikaia|Roma surları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Iznik_Wall_at_Sarayi_Gate_099.jpg/1280px-Iznik_Wall_at_Sarayi_Gate_099.jpg",
  "nikaia|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Iznik_Church_remains_at_Theatre_Street_8211.jpg/1280px-Iznik_Church_remains_at_Theatre_Street_8211.jpg",
  "nysa|Kütüphane":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nysa_library_east_block_west_side_from_NW_%281991%29.jpg/1280px-Nysa_library_east_block_west_side_from_NW_%281991%29.jpg",
  "nysa|Stadyum":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Stadium%2C_Nysa_%28Caria%29.jpg/1280px-Stadium%2C_Nysa_%28Caria%29.jpg",
  "nysa|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/THEATRE_OF_NYSA%2C_AYDIN_-_panoramio.jpg/1280px-THEATRE_OF_NYSA%2C_AYDIN_-_panoramio.jpg",
  "olympos|Liman hamamı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Olympos_Bath_of_Vespasian_in_2016_0542.jpg/1280px-Olympos_Bath_of_Vespasian_in_2016_0542.jpg",
  "olympos|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Olympos_Theatre_in_2016_0536.jpg/1280px-Olympos_Theatre_in_2016_0536.jpg",
  "palu|Eski Köprü":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Eski_Palu_%C3%9Cberblick.jpg/1280px-Eski_Palu_%C3%9Cberblick.jpg",
  "palu|Palu Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Palugesamt.jpg/1280px-Palugesamt.jpg",
  "patara|Ana Cadde":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Harbour_street_in_Patara-1.jpg/1280px-Harbour_street_in_Patara-1.jpg",
  "patara|Bouleuterion (Meclis)":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Patara_Assembly_Hall_of_the_Lycian_Laegue_exterior_in_2013_4604.jpg/1280px-Patara_Assembly_Hall_of_the_Lycian_Laegue_exterior_in_2013_4604.jpg",
  "patara|Deniz Feneri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Antalya_Museum_Diorama_of_Patara_-_lighthouse_6474.jpg/1280px-Antalya_Museum_Diorama_of_Patara_-_lighthouse_6474.jpg",
  "patara|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ancient_Greek_theatre_in_Patara.jpg/1280px-Ancient_Greek_theatre_in_Patara.jpg",
  "pergamon|Akropol":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Acropolis_amphitheatre_of_Pergamon_%282020%29.jpg/1280px-Acropolis_amphitheatre_of_Pergamon_%282020%29.jpg",
  "pergamon|Asklepion":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Bergama_Asklepion_2.jpg/1280px-Bergama_Asklepion_2.jpg",
  "pergamon|Kızıl Avlu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Bergama_-_Serapeion_-_k%C4%B1z%C4%B1l_avlu-_Red_basilica_-_panoramio_%281%29.jpg/1280px-Bergama_-_Serapeion_-_k%C4%B1z%C4%B1l_avlu-_Red_basilica_-_panoramio_%281%29.jpg",
  "pergamon|Trajan Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Temple_of_Trajan_-_Pergamon%2C_Bergama%2C_Bergama_District%2C_%C4%B0zmir_Province%2C_Turkey_-_October_8%2C_2025_06.jpg/1280px-Temple_of_Trajan_-_Pergamon%2C_Bergama%2C_Bergama_District%2C_%C4%B0zmir_Province%2C_Turkey_-_October_8%2C_2025_06.jpg",
  "pergamon|Zeus Sunağı terası":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Bergama_M%C3%BCzesi_Zeus_Suna%C4%9F%C4%B1.jpg/1280px-Bergama_M%C3%BCzesi_Zeus_Suna%C4%9F%C4%B1.jpg",
  "perge|Helenistik Kapı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Perge_Helenistik_Kap%C4%B1_Ve_Ana_Cadde.jpg/1280px-Perge_Helenistik_Kap%C4%B1_Ve_Ana_Cadde.jpg",
  "perge|Roma Hamamı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Antalya_museum_Perge_South_Bath_frieze_%28probably%29_4872.jpg/1280px-Antalya_museum_Perge_South_Bath_frieze_%28probably%29_4872.jpg",
  "perge|Stadyum":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Field_of_the_ancient_stadium_in_Perge.jpg/1280px-Field_of_the_ancient_stadium_in_Perge.jpg",
  "perge|Sütunlu Cadde":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Perge_-_Sutunlu_Cadde.jpg/1280px-Perge_-_Sutunlu_Cadde.jpg",
  "perge|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Panorama_of_Perge_theatre.jpg/1280px-Panorama_of_Perge_theatre.jpg",
  "pessinus|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Les_vestiges_du_th%C3%A9%C3%A2tre_de_Pessinus.jpg/1280px-Les_vestiges_du_th%C3%A9%C3%A2tre_de_Pessinus.jpg",
  "phaselis|Ana Cadde":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Inscription_written_in_honor_of_the_emperor_Domitian_found_above_one_of_the_two_gates_that_faced_the_main_street%2C_Phaselis%2C_Lycia%2C_Turkey_%289646312146%29.jpg/1280px-Inscription_written_in_honor_of_the_emperor_Domitian_found_above_one_of_the_two_gates_that_faced_the_main_street%2C_Phaselis%2C_Lycia%2C_Turkey_%289646312146%29.jpg",
  "phaselis|Hadrian Kapısı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Agora_of_Hadrian_which_opens_up_into_the_city_square_in_the_centre_of_the_city%2C_Phaselis%2C_Lycia%2C_Turkey_%289696098294%29.jpg/1280px-Agora_of_Hadrian_which_opens_up_into_the_city_square_in_the_centre_of_the_city%2C_Phaselis%2C_Lycia%2C_Turkey_%289696098294%29.jpg",
  "phaselis|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Ancient_Theatre_of_Phaselis_-_Front_view.jpg/1280px-Ancient_Theatre_of_Phaselis_-_Front_view.jpg",
  "phaselis|Üç liman":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/The_main_street_linking_the_central_and_south_harbours_with_Domitians_Agora_on_the_right%2C_Phaselis%2C_Lycia%2C_Turkey_%289646167024%29.jpg/1280px-The_main_street_linking_the_central_and_south_harbours_with_Domitians_Agora_on_the_right%2C_Phaselis%2C_Lycia%2C_Turkey_%289646167024%29.jpg",
  "pinara|Kaya Mezarları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Pinara_Acropolis_hill_rock_graves_in_2013_4480.jpg/1280px-Pinara_Acropolis_hill_rock_graves_in_2013_4480.jpg",
  "pinara|Odeion":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Pinara_Lower_terrace_Odeon_in_2013_4528.jpg/1280px-Pinara_Lower_terrace_Odeon_in_2013_4528.jpg",
  "pinara|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Pinara_Amphitheatre_Fethiye_Mugla_Turkiye.JPG/1280px-Pinara_Amphitheatre_Fethiye_Mugla_Turkiye.JPG",
  "priene|Athena Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ancient_Graffiti%2C_Temple_of_Athena%2C_Priene_%282%29.jpg/1280px-Ancient_Graffiti%2C_Temple_of_Athena%2C_Priene_%282%29.jpg",
  "priene|Bouleuterion":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Bouleuterion%2C_Priene_%282%29.jpg/1280px-Bouleuterion%2C_Priene_%282%29.jpg",
  "priene|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Orchestra_of_the_Greek_theatre_at_Priene_%282%29.jpg/1280px-Orchestra_of_the_Greek_theatre_at_Priene_%282%29.jpg",
  "sagalassos|Antoninler Çeşmesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Sagalassos_Antonine_Fountain_aedicula_inside_in_2012_2711.jpg/1280px-Sagalassos_Antonine_Fountain_aedicula_inside_in_2012_2711.jpg",
  "sagalassos|Heroon":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Sagalassos_Heroon_and_behind_it_in_2012_2547.jpg/1280px-Sagalassos_Heroon_and_behind_it_in_2012_2547.jpg",
  "sagalassos|Roma Hamamı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Sagalassos_Baths_seen_from_Colonnaded_Street_2012_2756.jpg/1280px-Sagalassos_Baths_seen_from_Colonnaded_Street_2012_2756.jpg",
  "sagalassos|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Sagalassos_-_Theatre.jpg/1280px-Sagalassos_-_Theatre.jpg",
  "sagalassos|Yukarı Agora":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Sagalassos_-_Heroon%2C_Upper_Agora.jpg/1280px-Sagalassos_-_Heroon%2C_Upper_Agora.jpg",
  "sam-al|Aslanlı Kapı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Lion_sculptures_from_Zincirli.jpg/1280px-Lion_sculptures_from_Zincirli.jpg",
  "sam-al|Çift Kapı Kabartmaları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Pergamon_Museum_reliefs_from_Sam%27al_aka_Zincirli_7937.jpg/1280px-Pergamon_Museum_reliefs_from_Sam%27al_aka_Zincirli_7937.jpg",
  "sam-al|Hilani Sarayı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Zincirli_H%C3%B6y%C3%BCk._Citadel_Detail_grondplan_Hilani_I%2C_GDE003360.jpg/1280px-Zincirli_H%C3%B6y%C3%BCk._Citadel_Detail_grondplan_Hilani_I%2C_GDE003360.jpg",
  "sardes|Artemis Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Artemis_Tap%C4%B1na%C4%9F%C4%B1_-_Sardes_Antik_Kenti.jpg/1280px-Artemis_Tap%C4%B1na%C4%9F%C4%B1_-_Sardes_Antik_Kenti.jpg",
  "sardes|Bin Tepe tümülüsleri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Bintepe_19_04_1984_lydische_K%C3%B6nigsgr%C3%A4ber_von_Sardes_Blick_vom_K%C4%B1rmutaf_Tepe.jpg/1280px-Bintepe_19_04_1984_lydische_K%C3%B6nigsgr%C3%A4ber_von_Sardes_Blick_vom_K%C4%B1rmutaf_Tepe.jpg",
  "sardes|Gymnasium":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/20230429_Gymnasium_at_Sardis_4.jpg/1280px-20230429_Gymnasium_at_Sardis_4.jpg",
  "sardes|Sinagog":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Sardis_Synagogue%2C_late_3rd_century_AD%2C_Sardis%2C_Lydia%2C_Turkey_%2818897204194%29.jpg/1280px-Sardis_Synagogue%2C_late_3rd_century_AD%2C_Sardis%2C_Lydia%2C_Turkey_%2818897204194%29.jpg",
  "seleucia-calycadnum|Roma Köprüsü":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Silifke_Bridge_Mersin_Province.JPG/1280px-Silifke_Bridge_Mersin_Province.JPG",
  "seleucia-calycadnum|Silifke Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/KilSilifkeG01.jpg/1280px-KilSilifkeG01.jpg",
  "seleucia-calycadnum|Zeus Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/04-12_Silifke_13_Remains_of_the_Temple_of_Zeus_1.jpg/1280px-04-12_Silifke_13_Remains_of_the_Temple_of_Zeus_1.jpg",
  "side|Agora":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/North_east_side_of_the_Roman_Agora.jpg/1280px-North_east_side_of_the_Roman_Agora.jpg",
  "side|Anıtsal Çeşme":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/An%C4%B1tsal_%C3%87e%C5%9Fme_%28Side%29.jpg/1280px-An%C4%B1tsal_%C3%87e%C5%9Fme_%28Side%29.jpg",
  "side|Apollon Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Antalya_Side_Apollo.jpg/1280px-Antalya_Side_Apollo.jpg",
  "side|Kent kapısı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Side_-_Vespasian_Gate.jpg/1280px-Side_-_Vespasian_Gate.jpg",
  "side|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Roman_theatre_-_Side_-_Antalya_Province%2C_Turkey_-_8_June_2015.jpg/1280px-Roman_theatre_-_Side_-_Antalya_Province%2C_Turkey_-_8_June_2015.jpg",
  "sinope|Sinop Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bar-Restaurant_atop_the_Sinop_Tower_Wall%2C_Sinop_Turkey.jpg/1280px-Bar-Restaurant_atop_the_Sinop_Tower_Wall%2C_Sinop_Turkey.jpg",
  "sinope|Sinop Müzesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Sinop_Eastern_Bastion_9139.jpg/1280px-Sinop_Eastern_Bastion_9139.jpg",
  "smyrna|Kadifekale":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Izmir_-_Kadifekale.JPG/1280px-Izmir_-_Kadifekale.JPG",
  "smyrna|Roma Agorası":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Izmir_Agora_October_2015_2022.jpg/1280px-Izmir_Agora_October_2015_2022.jpg",
  "sogmatar|Kaya Mezarları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/So%C4%9Fmatar_from_Urfa_rock-cut_chamber_deep_beneath_the_circular_platform_on_top_in_1997_160.jpg/1280px-So%C4%9Fmatar_from_Urfa_rock-cut_chamber_deep_beneath_the_circular_platform_on_top_in_1997_160.jpg",
  "sogmatar|Kutsal Tepe Kabartmaları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/So%C4%9Fmatar_Hb_29.05.2010_Tempelberg_Kutsal_Tepe_Felsenkammer-%28Tempel%29-Eingang_546.jpg/1280px-So%C4%9Fmatar_Hb_29.05.2010_Tempelberg_Kutsal_Tepe_Felsenkammer-%28Tempel%29-Eingang_546.jpg",
  "sogmatar|Pognon Mağarası":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/So%C4%9Fmatar_Hb_29.05.2010_Pognon-H%C3%B6hle%2C_Felstempel_Skulpturen_554.jpg/1280px-So%C4%9Fmatar_Hb_29.05.2010_Pognon-H%C3%B6hle%2C_Felstempel_Skulpturen_554.jpg",
  "stratonikeia|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Stratonicea-ancient-theatre-road.jpg/1280px-Stratonicea-ancient-theatre-road.jpg",
  "teos|Bouleuterion":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Teos_bouleuterion.jpg/1280px-Teos_bouleuterion.jpg",
  "teos|Dionysos Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Teos_Sanctuary_of_Dionysos_from_W_01_%281991%29.jpg/1280px-Teos_Sanctuary_of_Dionysos_from_W_01_%281991%29.jpg",
  "teos|Odeion":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Odeon_Teos_Seferihisar_Turkey.jpg/330px-Odeon_Teos_Seferihisar_Turkey.jpg",
  "teos|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Teos_theatre.jpg/1280px-Teos_theatre.jpg",
  "termessos|Gymnasium":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Termessos_Gymnasium_3331.jpg/1280px-Termessos_Gymnasium_3331.jpg",
  "termessos|Kral Yolu":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Termessos_Construction_along_the_road_leading_to_the_Alcesas_tomb_3722.jpg/1280px-Termessos_Construction_along_the_road_leading_to_the_Alcesas_tomb_3722.jpg",
  "termessos|Nekropol":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Lycian_Tomb_at_Termessos_-_Western_Necropolis_-_panoramio.jpg/1280px-Lycian_Tomb_at_Termessos_-_Western_Necropolis_-_panoramio.jpg",
  "termessos|Sarnıçlar":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Termessos_Road_to_theatre_cistern_3631.jpg/1280px-Termessos_Road_to_theatre_cistern_3631.jpg",
  "termessos|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Termessos_-_Theater.jpg/1280px-Termessos_-_Theater.jpg",
  "thyatira|Bazilika":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Thyatira_Basilica_%288691956539%29.jpg/1280px-Thyatira_Basilica_%288691956539%29.jpg",
  "tieion|Filyos Kalesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Filyos_Bay.jpg/1280px-Filyos_Bay.jpg",
  "tlos|Bellerophon Kaya Mezarı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Tlos_Bellerophon_grave_5605.jpg/1280px-Tlos_Bellerophon_grave_5605.jpg",
  "tlos|Kronos Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Tlos_Kronos_Temple_4247.jpg/1280px-Tlos_Kronos_Temple_4247.jpg",
  "tlos|Stadyum":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Tlos_Hill_above_stadium_5403.jpg/1280px-Tlos_Hill_above_stadium_5403.jpg",
  "tlos|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tlos_Agora_and_theatre_4177.jpg/1280px-Tlos_Agora_and_theatre_4177.jpg",
  "troya|Athena Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Architrave_with_sculpted_metope_showing_sun_god_Helios_in_a_quadriga%3B_from_temple_of_Athena_at_Troy%2C_ca_300-280_BCE%3B_Altes_Museum%2C_Berlin_%2825308440197%29.jpg/1280px-Architrave_with_sculpted_metope_showing_sun_god_Helios_in_a_quadriga%3B_from_temple_of_Athena_at_Troy%2C_ca_300-280_BCE%3B_Altes_Museum%2C_Berlin_%2825308440197%29.jpg",
  "troya|Kent surları":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Walls_of_Ancient_Troy.jpg/1280px-Walls_of_Ancient_Troy.jpg",
  "troya|Odeon":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hadrianic_Odeon_in_Troy_IX_%28Ilion%29%2C_Turkey.jpg/1280px-Hadrianic_Odeon_in_Troy_IX_%28Ilion%29%2C_Turkey.jpg",
  "troya|Truva atı replikası":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/%C3%87anakkale%2C_Turkey._Wooden_horse_%28from_the_film_%22Troy%22%29_on_waterfront_-_panoramio.jpg/1280px-%C3%87anakkale%2C_Turkey._Wooden_horse_%28from_the_film_%22Troy%22%29_on_waterfront_-_panoramio.jpg",
  "tyana|Roma su kemeri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Tuwanuwa_-_Tyana_-_Kemerhisar.jpg/1280px-Tuwanuwa_-_Tyana_-_Kemerhisar.jpg",
  "uzuncaburc|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Diocaesarea_%28Isauria%29_Roman_theatre_3534.jpg/1280px-Diocaesarea_%28Isauria%29_Roman_theatre_3534.jpg",
  "uzuncaburc|Tyche Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Diocaesarea_%28Isauria%29_Tyche_temple_cella_3470.jpg/1280px-Diocaesarea_%28Isauria%29_Tyche_temple_cella_3470.jpg",
  "uzuncaburc|Uzuncaburç Kulesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Olba%2C_Uzuncabur%C3%A7.JPG/1280px-Olba%2C_Uzuncabur%C3%A7.JPG",
  "uzuncaburc|Zeus Olbios Tapınağı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/UzuncaburcZeus.jpg/1280px-UzuncaburcZeus.jpg",
  "xanthos|Harpy Anıtı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Lycian_monumental_tombs%2C_the_Harpy_tomb_and_the_pillared_sarcophagus%2C_Xanthos%2C_Lycia%2C_Turkey_%288814489373%29.jpg/1280px-Lycian_monumental_tombs%2C_the_Harpy_tomb_and_the_pillared_sarcophagus%2C_Xanthos%2C_Lycia%2C_Turkey_%288814489373%29.jpg",
  "xanthos|Likya lahitleri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Lycian_Tomb%2C_Xanthos.jpg/1280px-Lycian_Tomb%2C_Xanthos.jpg",
  "xanthos|Nereidler Anıtı":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Greater_podium_frieze_from_the_Nereid_Monument_of_Xanthos_showing_heroic_battle_scenes%2C_British_Museum%2C_London_%289501127451%29.jpg/1280px-Greater_podium_frieze_from_the_Nereid_Monument_of_Xanthos_showing_heroic_battle_scenes%2C_British_Museum%2C_London_%289501127451%29.jpg",
  "xanthos|Tiyatro":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/The_Roman_theatre%2C_built_in_the_mid-2nd_century_AD%2C_Xanthos%2C_Lycia%2C_Turkey_%288825114404%29.jpg/1280px-The_Roman_theatre%2C_built_in_the_mid-2nd_century_AD%2C_Xanthos%2C_Lycia%2C_Turkey_%288825114404%29.jpg",
  "zeugma|Villa mozaikleri":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Gaziantep_Zeugma_Museum_Geometric_Mosaic_2_-3rd_century_Oceanos_Villa_in_2011_1963b.jpg/1280px-Gaziantep_Zeugma_Museum_Geometric_Mosaic_2_-3rd_century_Oceanos_Villa_in_2011_1963b.jpg",
  "zeugma|Zeugma Mozaik Müzesi":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Zeugma_Mosaic_Museum%2C_Gaziantep%2C_Turkey_%2852414721257%29.jpg/1280px-Zeugma_Mosaic_Museum%2C_Gaziantep%2C_Turkey_%2852414721257%29.jpg",
};

/** Keys are `${slug}|${structure.tr}` â€” the Turkish name is the stable one. */
export const structurePhotos = photos;

/**
 * The photo for a structure at a city, or `undefined` when we have none.
 *
 * Undefined rather than a city-wide fallback on purpose: the caller has to
 * decide what to show, and it has to say that what it shows is the city.
 */
export function structurePhotoFor(slug: string, structureTr: string): string | undefined {
  // A shared name's curated photograph is of another site's building.
  return photos[`${slug}|${structureTr}`] ?? structureInfoAt(structureTr)?.image;
}
