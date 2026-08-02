//#region node_modules/.nitro/vite/services/ssr/assets/sites-qcnwZ4V_.js
var hero_ephesus_default = "/assets/hero-ephesus-Cjxjaw1Y.jpg";
var region_ege_default = "/assets/region-ege-_jZN41bf.jpg";
var region_akdeniz_default = "/assets/region-akdeniz-DKskFcOe.jpg";
var region_ic_anadolu_default = "/assets/region-ic-anadolu-BKb11BN3.jpg";
var region_guneydogu_default = "/assets/region-guneydogu-CA9bzMKH.jpg";
var region_karadeniz_default = "/assets/region-karadeniz-B8GzTMdK.jpg";
var regions = [
	{
		id: "ege",
		name: {
			tr: "Ege",
			en: "Aegean"
		},
		image: region_ege_default,
		blurb: {
			tr: "İyonya'nın mermer kentleri, tiyatrolar ve liman şehirleri.",
			en: "Marble cities of Ionia, theatres and harbour towns."
		}
	},
	{
		id: "akdeniz",
		name: {
			tr: "Akdeniz",
			en: "Mediterranean"
		},
		image: region_akdeniz_default,
		blurb: {
			tr: "Likya kaya mezarları, Pamfilya tiyatroları ve deniz kentleri.",
			en: "Lycian rock tombs, Pamphylian theatres and coastal cities."
		}
	},
	{
		id: "marmara",
		name: {
			tr: "Marmara",
			en: "Marmara"
		},
		image: hero_ephesus_default,
		blurb: {
			tr: "Truva'dan İznik'e, iki kıtanın kavşağındaki kentler.",
			en: "From Troy to Nicaea, cities where two continents meet."
		}
	},
	{
		id: "ic-anadolu",
		name: {
			tr: "İç Anadolu",
			en: "Central Anatolia"
		},
		image: region_ic_anadolu_default,
		blurb: {
			tr: "Frig tümülüsleri, Neolitik höyükler ve bozkır kentleri.",
			en: "Phrygian tumuli, Neolithic mounds and steppe cities."
		}
	},
	{
		id: "karadeniz",
		name: {
			tr: "Karadeniz",
			en: "Black Sea"
		},
		image: region_karadeniz_default,
		blurb: {
			tr: "Hitit başkentleri ve yeşil tepelerdeki liman kaleleri.",
			en: "Hittite capitals and harbour fortresses on green hills."
		}
	},
	{
		id: "guneydogu",
		name: {
			tr: "Güneydoğu Anadolu",
			en: "Southeastern Anatolia"
		},
		image: region_guneydogu_default,
		blurb: {
			tr: "Dünyanın en eski tapınakları ve Fırat kıyısı kentleri.",
			en: "The world's oldest temples and cities along the Euphrates."
		}
	},
	{
		id: "dogu",
		name: {
			tr: "Doğu Anadolu",
			en: "Eastern Anatolia"
		},
		image: region_ic_anadolu_default,
		blurb: {
			tr: "Urartu kaleleri ve yüksek yaylalardaki taş kentler.",
			en: "Urartian fortresses and stone cities on high plateaus."
		}
	}
];
var regionImage = {
	ege: region_ege_default,
	akdeniz: region_akdeniz_default,
	marmara: hero_ephesus_default,
	"ic-anadolu": region_ic_anadolu_default,
	karadeniz: region_karadeniz_default,
	guneydogu: region_guneydogu_default,
	dogu: region_ic_anadolu_default
};
function coverImage(site) {
	return sitePhoto[site.slug] ?? (site.slug === "efes" ? "/assets/hero-ephesus-Cjxjaw1Y.jpg" : regionImage[site.region]);
}
function galleryImages(site) {
	const owned = siteGallery[site.slug];
	if (owned && owned.length > 0) return owned;
	const cover = coverImage(site);
	return [cover, ...[
		hero_ephesus_default,
		region_ege_default,
		region_akdeniz_default,
		region_ic_anadolu_default,
		region_guneydogu_default,
		region_karadeniz_default
	].filter((i) => i !== cover).slice(0, 3)];
}
/**
* Representative photo for a region card: the cover image of the region's
* most popular site, falling back to the generic region image.
*/
function regionCoverImage(regionId) {
	const list = sites.filter((s) => s.region === regionId);
	if (list.length === 0) return regionImage[regionId];
	const top = [...list].sort((a, b) => b.popularity - a.popularity)[0];
	return coverImage(top);
}
var heroImage = hero_ephesus_default;
/**
* Additional freely licensed photos per site (Wikimedia Commons), shown in
* the site detail gallery. The first photo of each site is its cover.
*/
var siteGallery = {
	efes: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ephesus_-_Celsus_Library.jpg/1280px-Ephesus_-_Celsus_Library.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Ephesus_-_Prytaneion.jpg/1280px-Ephesus_-_Prytaneion.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Ephesus_Celsus_Library_Fa%C3%A7ade.jpg/1280px-Ephesus_Celsus_Library_Fa%C3%A7ade.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Ephesus_-_Great_Theater.jpg/1280px-Ephesus_-_Great_Theater.jpg"
	],
	pergamon: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Acropolis_amphitheatre_of_Pergamon_%282020%29.jpg/1280px-Acropolis_amphitheatre_of_Pergamon_%282020%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Pergamon_-_02.jpg/1280px-Pergamon_-_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Pergamon_27.jpg/1280px-Pergamon_27.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/6/63/Pediment_of_Pergamon_2.jpg"
	],
	aphrodisias: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Aphrodisias_-_Tetrapylon_01.jpg/1280px-Aphrodisias_-_Tetrapylon_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Aphrodisias_-_Odeion_01.jpg/1280px-Aphrodisias_-_Odeion_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Aphrodisias_-_Portico_of_Tiberius_02.jpg/1280px-Aphrodisias_-_Portico_of_Tiberius_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Aphrodisias_-_Stadium_01.jpg/1280px-Aphrodisias_-_Stadium_01.jpg"
	],
	hierapolis: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Hierapolis%2C_Pamukkale_5.jpg/1280px-Hierapolis%2C_Pamukkale_5.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Basilica_Baths%2C_Hierapolis_01.jpg/1280px-Basilica_Baths%2C_Hierapolis_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Basilica_Baths%2C_Hierapolis_02.jpg/1280px-Basilica_Baths%2C_Hierapolis_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Hierapolis%2C_Turkey_%2817187550372%29.jpg/1280px-Hierapolis%2C_Turkey_%2817187550372%29.jpg"
	],
	milet: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Miletus_-_Ancient_Greek_theatre_01.jpg/1280px-Miletus_-_Ancient_Greek_theatre_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Miletus_%28Turkey%29_Market_Gate%2C_c._100_AD%2C_Reconstruction_%281%29.jpg/1280px-Miletus_%28Turkey%29_Market_Gate%2C_c._100_AD%2C_Reconstruction_%281%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Miletus_-_Ancient_Greek_theatre_02.jpg/1280px-Miletus_-_Ancient_Greek_theatre_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Miletus_%28Turkey%29_Market_Gate%2C_c._100_AD%2C_Reconstruction_%282%29.jpg/1280px-Miletus_%28Turkey%29_Market_Gate%2C_c._100_AD%2C_Reconstruction_%282%29.jpg"
	],
	didyma: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Temple_of_Apollo%2C_Didyma_-_Adyton.jpg/1280px-Temple_of_Apollo%2C_Didyma_-_Adyton.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Didyma%2C_Turkey%2C_Temple_of_Apollon%2C_Face.jpg/1280px-Didyma%2C_Turkey%2C_Temple_of_Apollon%2C_Face.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Didyma%2C_Turkey%2C_Temple_of_Apollon%2C_more_stairs.jpg/1280px-Didyma%2C_Turkey%2C_Temple_of_Apollon%2C_more_stairs.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Didyma%2C_Turkey%2C_Temple_of_Apollon%2C_figures.jpg/1280px-Didyma%2C_Turkey%2C_Temple_of_Apollon%2C_figures.jpg"
	],
	priene: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Priene_Acropolis.jpg/1280px-Priene_Acropolis.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Priene_01.jpg/1280px-Priene_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Priene_04.jpg/1280px-Priene_04.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Bishop%27s_Church_at_Priene_%284%29.jpg/1280px-Bishop%27s_Church_at_Priene_%284%29.jpg"
	],
	sardes: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/20230429_Gymnasium_at_Sardis_4.jpg/1280px-20230429_Gymnasium_at_Sardis_4.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Sardis_%28Lydia%29%2C_Turkey_%2831327424774%29.jpg/1280px-Sardis_%28Lydia%29%2C_Turkey_%2831327424774%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Sardis_Synagogue%2C_late_3rd_century_AD%2C_Sardis%2C_Lydia%2C_Turkey_%2818897204194%29.jpg/1280px-Sardis_Synagogue%2C_late_3rd_century_AD%2C_Sardis%2C_Lydia%2C_Turkey_%2818897204194%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Sardis_%28Lydia%29%2C_Turkey_%2831358504373%29.jpg/1280px-Sardis_%28Lydia%29%2C_Turkey_%2831358504373%29.jpg"
	],
	laodikeia: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Laodicea_Ancient_City_2026%2C_108.jpg/1280px-Laodicea_Ancient_City_2026%2C_108.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Laodicea_Ancient_City_2026%2C_03.jpg/1280px-Laodicea_Ancient_City_2026%2C_03.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Laodicea_Ancient_City_2026%2C_08.jpg/1280px-Laodicea_Ancient_City_2026%2C_08.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Laodicea_Ancient_City_2026%2C_131.jpg/1280px-Laodicea_Ancient_City_2026%2C_131.jpg"
	],
	halikarnassos: [
		"https://upload.wikimedia.org/wikipedia/commons/5/5e/Mausoleum_at_Halicarnassus_at_the_Bodrum_Museum_of_Underwater_Archaeology.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Architectural_elements_from_the_Mausoleum_of_Halicarnassus%2C_constructed_for_King_Mausolus_during_the_mid-4th_century_BC_at_Halicarnassus_in_Caria%2C_Bodrum%2C_Turkey_%2817364177689%29.jpg/1280px-thumbnail.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Model_of_the_Mausoleum_of_Halicarnassus%2C_constructed_for_King_Mausolus_during_the_mid-4th_century_BC_at_Halicarnassus_in_Caria%2C_Bodrum%2C_Turkey_%2817362934180%29.jpg/1280px-Model_of_the_Mausoleum_of_Halicarnassus%2C_constructed_for_King_Mausolus_during_the_mid-4th_century_BC_at_Halicarnassus_in_Caria%2C_Bodrum%2C_Turkey_%2817362934180%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Mosaic_with_the_personification_of_Halicarnassus%2C_British_Museum.jpg/1280px-Mosaic_with_the_personification_of_Halicarnassus%2C_British_Museum.jpg"
	],
	knidos: [
		"https://upload.wikimedia.org/wikipedia/commons/0/0b/Dat%C3%A7a-Knidos.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Knidos-H%C3%A4fen.jpg/1280px-Knidos-H%C3%A4fen.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Knidos_%28Turkey%29_banner.jpg/1280px-Knidos_%28Turkey%29_banner.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Knidos_05772_05776.jpg/1280px-Knidos_05772_05776.jpg"
	],
	patara: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Patara_Ka%C5%9F.jpg/1280px-Patara_Ka%C5%9F.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Ancient_city_of_Patara%2C_Lycia%2C_Turkey_10_47_41_347000.jpeg/1280px-Ancient_city_of_Patara%2C_Lycia%2C_Turkey_10_47_41_347000.jpeg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Ancient_city_of_Patara%2C_Lycia%2C_Turkey_10_47_44_742000.jpeg/1280px-Ancient_city_of_Patara%2C_Lycia%2C_Turkey_10_47_44_742000.jpeg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Ancient_city_of_Patara%2C_Lycia%2C_Turkey_10_47_48_141000.jpeg/1280px-Ancient_city_of_Patara%2C_Lycia%2C_Turkey_10_47_48_141000.jpeg"
	],
	xanthos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/The_Roman_theatre%2C_built_in_the_mid-2nd_century_AD%2C_Xanthos%2C_Lycia%2C_Turkey_%288825114404%29.jpg/1280px-The_Roman_theatre%2C_built_in_the_mid-2nd_century_AD%2C_Xanthos%2C_Lycia%2C_Turkey_%288825114404%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Archway_dedicated_to_the_Emperor_Vespasian%2C_Xanthos%2C_Lycia%2C_Turkey_%288814672323%29.jpg/1280px-Archway_dedicated_to_the_Emperor_Vespasian%2C_Xanthos%2C_Lycia%2C_Turkey_%288814672323%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Lycian_Tomb%2C_Xanthos.jpg/1280px-Lycian_Tomb%2C_Xanthos.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Entrance_into_theatre_of_Xanthos.jpg/1280px-Entrance_into_theatre_of_Xanthos.jpg"
	],
	myra: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Myra_Rock_Tombs.jpg/1280px-Myra_Rock_Tombs.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Myra-south-necropolis.jpg/1280px-Myra-south-necropolis.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Myra_Antik_Kenti-%C3%96renyeri.jpg/1280px-Myra_Antik_Kenti-%C3%96renyeri.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Myra_Necropolis%2C_Lycia%2C_Turkey_-_52619304899.jpg/1280px-Myra_Necropolis%2C_Lycia%2C_Turkey_-_52619304899.jpg"
	],
	olympos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Olympos%2C_Lycia%2C_Turkey_%289653957867%29.jpg/1280px-Olympos%2C_Lycia%2C_Turkey_%289653957867%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Ancient_City_of_Olympos_Peak.jpg/1280px-Ancient_City_of_Olympos_Peak.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Olympos%2C_Lycia%2C_Turkey_%289653784149%29.jpg/1280px-Olympos%2C_Lycia%2C_Turkey_%289653784149%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Back_Alley_in_Olympos_Ruins.jpg/1280px-Back_Alley_in_Olympos_Ruins.jpg"
	],
	phaselis: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20180511_153347_phaselis_antik_kenti.jpg/1280px-20180511_153347_phaselis_antik_kenti.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/2019_Phaselis_2.jpg/1280px-2019_Phaselis_2.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Phaselis_Antalya.jpg/1280px-Phaselis_Antalya.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Phaselis_August_2019_01.jpg/1280px-Phaselis_August_2019_01.jpg"
	],
	perge: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Columns_in_Perge_03.jpg/1280px-Columns_in_Perge_03.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Agora_%28Perge%29_01.jpg/1280px-Agora_%28Perge%29_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Cardo_%28Perge%29.jpg/1280px-Cardo_%28Perge%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Colonnade%2C_Perge_01.jpg/1280px-Colonnade%2C_Perge_01.jpg"
	],
	aspendos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Aspendos_Theatre%2C_Turkey.jpg/1280px-Aspendos_Theatre%2C_Turkey.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Aqueduct_of_Aspendos_02.jpg/1280px-Aqueduct_of_Aspendos_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Aspendos_Amphitheatre.jpg/1280px-Aspendos_Amphitheatre.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Aspendos_Basilica_Antalya_Turkey.jpg/1280px-Aspendos_Basilica_Antalya_Turkey.jpg"
	],
	side: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Antalya_Side_Apollo.jpg/1280px-Antalya_Side_Apollo.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Side_-_Vespasian_Gate.jpg/1280px-Side_-_Vespasian_Gate.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Roman_theatre_-_Side_-_Antalya_Province%2C_Turkey_-_8_June_2015.jpg/1280px-Roman_theatre_-_Side_-_Antalya_Province%2C_Turkey_-_8_June_2015.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Side_1606-116.jpg/1280px-Side_1606-116.jpg"
	],
	termessos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/TERMESSOS_Od%C3%A9on_int%C3%A9rieur.jpg/1280px-TERMESSOS_Od%C3%A9on_int%C3%A9rieur.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Termessos_-_Theater.jpg/1280px-Termessos_-_Theater.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Termessos_-_Overview.jpg/1280px-Termessos_-_Overview.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Termessos_-_Baths.jpg/1280px-Termessos_-_Baths.jpg"
	],
	sagalassos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Sagalassos_-_Nymphaeum.jpg/1280px-Sagalassos_-_Nymphaeum.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Sagalassos_-_Agora.jpg/1280px-Sagalassos_-_Agora.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Sagalassos_-_Overview.jpg/1280px-Sagalassos_-_Overview.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Sagalassos_-_Statue_on_Agora.jpg/1280px-Sagalassos_-_Statue_on_Agora.jpg"
	],
	troya: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Troy_archaeological_site_-_Turkey_%281%29.jpg/1280px-Troy_archaeological_site_-_Turkey_%281%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/A_view_from_Troy_Ancient_City%2C_%C3%87anakkale%2C_Turkey.jpg/1280px-A_view_from_Troy_Ancient_City%2C_%C3%87anakkale%2C_Turkey.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Amphitheatre_of_Troy.jpg/1280px-Amphitheatre_of_Troy.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Hisarl%C4%B1k_%28Ancient_City_of_Troy%29.jpg/1280px-Hisarl%C4%B1k_%28Ancient_City_of_Troy%29.jpg"
	],
	assos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Assos%2C_Turkey_-_6452161411.jpg/1280px-Assos%2C_Turkey_-_6452161411.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Assos%2C_Turkey_-_6452137971.jpg/1280px-Assos%2C_Turkey_-_6452137971.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Assos%2C_Turkey_-_6452150369.jpg/1280px-Assos%2C_Turkey_-_6452150369.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Assos%2C_Turkey_-_6452171295.jpg/1280px-Assos%2C_Turkey_-_6452171295.jpg"
	],
	kyzikos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Bandirma_Cyzicus_2874.jpg/1280px-Bandirma_Cyzicus_2874.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Bandirma_Cyzicus_Zeus_temple_2860.jpg/1280px-Bandirma_Cyzicus_Zeus_temple_2860.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/The_remains_of_the_Temple_of_Hadrian%2C_Cyzicus_%28Kyzikos%29%2C_the_eighth_wonder_of_the_ancient_world%2C_Mysia%2C_Turkey_-_53075003232.jpg/1280px-The_remains_of_the_Temple_of_Hadrian%2C_Cyzicus_%28Kyzikos%29%2C_the_eighth_wonder_of_the_ancient_world%2C_Mysia%2C_Turkey_-_53075003232.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Kyzikos_ve_Band%C4%B1rma_K%C3%B6rfezi.jpg/1280px-Kyzikos_ve_Band%C4%B1rma_K%C3%B6rfezi.jpg"
	],
	nikaia: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Iznik_Wall_at_Sarayi_Gate_099.jpg/1280px-Iznik_Wall_at_Sarayi_Gate_099.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Constantinople%2C_Nicaea%2C_Turkey_-_52864968147.jpg/1280px-Constantinople%2C_Nicaea%2C_Turkey_-_52864968147.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Constantinople%2C_Nicaea%2C_Turkey_-_52865549511.jpg/1280px-Constantinople%2C_Nicaea%2C_Turkey_-_52865549511.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Iznik_Green_mosque_8159.jpg/1280px-Iznik_Green_mosque_8159.jpg"
	],
	gordion: [
		"https://upload.wikimedia.org/wikipedia/commons/b/bd/Gordion_Citadel_Mound_aerial_overview_2017.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Gordion_18_05_1989_Ruinen_und_Tumulus_%28Hintergrund%29.jpg/1280px-Gordion_18_05_1989_Ruinen_und_Tumulus_%28Hintergrund%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Gordion_Museum%2C_Turkey_01.jpg/1280px-Gordion_Museum%2C_Turkey_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Gordion_M%C3%BCzesi_%2819.05.2023%29_09.jpg/1280px-Gordion_M%C3%BCzesi_%2819.05.2023%29_09.jpg"
	],
	catalhoyuk: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_02.jpg/1280px-%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_01.jpg/1280px-%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_03.jpg/1280px-%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_03.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_06.jpg/1280px-%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_06.jpg"
	],
	kultepe: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Kultepe_Karum_excavations_%281993%29_06.jpg/1280px-Kultepe_Karum_excavations_%281993%29_06.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Kultepe_Karum_trenches_and_mound_%281993%29.jpg/1280px-Kultepe_Karum_trenches_and_mound_%281993%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Kanis_03.jpg/1280px-Kanis_03.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Kultepe_mound_-_%27Large_palace_on_south_terrace%27_from_S_%281993%29.jpg/1280px-Kultepe_mound_-_%27Large_palace_on_south_terrace%27_from_S_%281993%29.jpg"
	],
	tyana: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Tuwanuwa_-_Tyana_-_Kemerhisar.jpg/1280px-Tuwanuwa_-_Tyana_-_Kemerhisar.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tyana%2C_Cappadocia%2C_Turkey_%2823777522658%29.jpg/1280px-Tyana%2C_Cappadocia%2C_Turkey_%2823777522658%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Tyana%2C_Cappadocia%2C_Turkey_%2823777524208%29.jpg/1280px-Tyana%2C_Cappadocia%2C_Turkey_%2823777524208%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Tyana%2C_Cappadocia%2C_Turkey_%2823777525848%29.jpg/1280px-Tyana%2C_Cappadocia%2C_Turkey_%2823777525848%29.jpg"
	],
	hattusa: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Lion_Gate%2C_Hattusa_01.jpg/1280px-Lion_Gate%2C_Hattusa_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Lion_Gate%2C_Hattusa%2C_Bo%C4%9Fazkale%2C_%C3%87orum%2C_Turkey_02.jpg/1280px-Lion_Gate%2C_Hattusa%2C_Bo%C4%9Fazkale%2C_%C3%87orum%2C_Turkey_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hattusa_sign.jpg/1280px-Hattusa_sign.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Lion_Gate%2C_Hattusa_02.jpg/1280px-Lion_Gate%2C_Hattusa_02.jpg"
	],
	alacahoyuk: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg/1280px-Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Alaca_H%C3%B6y%C3%BCk_01.jpg/1280px-Alaca_H%C3%B6y%C3%BCk_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Alacah%C3%B6y%C3%BCk.jpg/1280px-Alacah%C3%B6y%C3%BCk.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Alacah%C3%B6y%C3%BCk_m%C3%BCzesi.jpg/1280px-Alacah%C3%B6y%C3%BCk_m%C3%BCzesi.jpg"
	],
	pompeiopolis: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Soli_Pompeiopolis_20141116_02.jpg/1280px-Soli_Pompeiopolis_20141116_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Soli_Pompeiopolis_20141116_04.jpg/1280px-Soli_Pompeiopolis_20141116_04.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Soli_Pompeiopolis_20141116_06.jpg/1280px-Soli_Pompeiopolis_20141116_06.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Pompeiopolis_%28Mezitli%29_09.1987_S%C3%A4ulenstra%C3%9Fe.jpg/1280px-Pompeiopolis_%28Mezitli%29_09.1987_S%C3%A4ulenstra%C3%9Fe.jpg"
	],
	amastris: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/2009_in_Amasra_14.jpg/1280px-2009_in_Amasra_14.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Amasra%2C_Turkey%2C_Castle%2C_view_from_the_island.jpg/1280px-Amasra%2C_Turkey%2C_Castle%2C_view_from_the_island.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Amasra%2C_Turkey_-_panoramio.jpg/1280px-Amasra%2C_Turkey_-_panoramio.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Amasra_192.JPG/1280px-Amasra_192.JPG"
	],
	gobeklitepe: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/G%C3%B6bekli_Tepe%2C_Urfa.jpg/1280px-G%C3%B6bekli_Tepe%2C_Urfa.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/G%C3%B6bekli_Tepe.jpg/1280px-G%C3%B6bekli_Tepe.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/G%C3%B6bekli_Tepe_%282%29.jpg/1280px-G%C3%B6bekli_Tepe_%282%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/d/de/Gobekli_Tepe_childbirth_stone_engraving.jpg"
	],
	nemrut: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/001362_Nemrut_Da%C4%9F%C4%B1_-_T%C3%BCrkei.jpg/1280px-001362_Nemrut_Da%C4%9F%C4%B1_-_T%C3%BCrkei.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/00_0361_Nemrut_Da%C4%9F%C4%B1_-_Provinz_Adiyaman%2C_T%C3%BCrkei_%28Taurusgebirge%29.jpg/1280px-00_0361_Nemrut_Da%C4%9F%C4%B1_-_Provinz_Adiyaman%2C_T%C3%BCrkei_%28Taurusgebirge%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/00_1372_Mount_Nemrut_-_Adiyaman%2C_T%C3%BCrkei.jpg/1280px-00_1372_Mount_Nemrut_-_Adiyaman%2C_T%C3%BCrkei.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/APOLLON_NEMRUT_MOUNTAIN.jpg/1280px-APOLLON_NEMRUT_MOUNTAIN.jpg"
	],
	zeugma: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Gaziantep_Zeugma_Museum_Dionysos_Triumf_mosaic_1921.jpg/1280px-Gaziantep_Zeugma_Museum_Dionysos_Triumf_mosaic_1921.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Zeugma_Mosaic_Museum%2C_Gaziantep%2C_Turkey_%2852414721257%29.jpg/1280px-Zeugma_Mosaic_Museum%2C_Gaziantep%2C_Turkey_%2852414721257%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Gaziantep_Zeugma_Museum_Andromeda_mosaic_4170.jpg/1280px-Gaziantep_Zeugma_Museum_Andromeda_mosaic_4170.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Zeugma.jpg/1280px-Zeugma.jpg"
	],
	harran: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Harran_Beehive_houses_192b.jpg/1280px-Harran_Beehive_houses_192b.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/2/2b/Harran-beehouses.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Turecko_Harran_%2801%29.jpg/1280px-Turecko_Harran_%2801%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Harran_2015.jpg/1280px-Harran_2015.jpg"
	],
	dara: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Dara_Nekropol_Alan%C4%B1.jpg/1280px-Dara_Nekropol_Alan%C4%B1.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Anastasioupolis_%28Mesopotamia%29%2C_Turkey_-_52414064822.jpg/1280px-Anastasioupolis_%28Mesopotamia%29%2C_Turkey_-_52414064822.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Anastasioupolis_%28Mesopotamia%29%2C_Turkey_-_52414640937.jpg/1280px-Anastasioupolis_%28Mesopotamia%29%2C_Turkey_-_52414640937.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Anastasioupolis_%28Mesopotamia%29%2C_Turkey_-_52414859844.jpg/1280px-Anastasioupolis_%28Mesopotamia%29%2C_Turkey_-_52414859844.jpg"
	],
	ani: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Ani_Archeological_Site%2C_March_2020_1.jpg/1280px-Ani_Archeological_Site%2C_March_2020_1.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/20110419_Ani_North_Walls_Turkey_Panorama.jpg/1280px-20110419_Ani_North_Walls_Turkey_Panorama.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ani%2C_rovine%2C_veduta_04.jpg/1280px-Ani%2C_rovine%2C_veduta_04.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Ani_Harabeleri.jpg/1280px-Ani_Harabeleri.jpg"
	],
	tuspa: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tushpa_11.jpg/1280px-Tushpa_11.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Van_Fortress_From_Northwest.JPG/1280px-Van_Fortress_From_Northwest.JPG",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Van_Fortress_climb_4144.jpg/1280px-Van_Fortress_climb_4144.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Van_Fortress_from_northwest_Fortress_3999.jpg/1280px-Van_Fortress_from_northwest_Fortress_3999.jpg"
	],
	cavustepe: [
		"https://upload.wikimedia.org/wikipedia/commons/a/af/Urartian_fort_in_%C3%87avu%C5%9Ftepe.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/2/28/Urartian_fort_in_%C3%87avu%C5%9Ftepe_total.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Inschrift_%C3%87avu%C5%9Ftepe_01.jpg/1280px-Inschrift_%C3%87avu%C5%9Ftepe_01.jpg"
	],
	arslantepe: [
		"https://upload.wikimedia.org/wikipedia/commons/d/d6/Arslantepe_L%C3%B6wentor_Delaporte.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Arslantepe_Ruins%2C_Malatya_01.jpg/1280px-Arslantepe_Ruins%2C_Malatya_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Arslantepe_Ruins%2C_Malatya_03.jpg/1280px-Arslantepe_Ruins%2C_Malatya_03.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Arslantepe_Ruins%2C_Malatya_06.jpg/1280px-Arslantepe_Ruins%2C_Malatya_06.jpg"
	],
	"karahan-tepe": [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Karahan_Tepe_overview.jpg/1280px-Karahan_Tepe_overview.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Karahan_Tepe_man.jpg/1280px-Karahan_Tepe_man.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Karahan_Tepe_excavation.jpg/1280px-Karahan_Tepe_excavation.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Karahan_Tepe_stelae.jpg/1280px-Karahan_Tepe_stelae.jpg"
	],
	"nevali-cori": [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Nevali_%C3%87ori_kaz%C4%B1_alan%C4%B1_maketi_%282%29.jpg/1280px-Nevali_%C3%87ori_kaz%C4%B1_alan%C4%B1_maketi_%282%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/%C5%9Eanl%C4%B1urfa_M%C3%BCzesi_Nevali_%C3%87ori_%282%29.jpg/1280px-%C5%9Eanl%C4%B1urfa_M%C3%BCzesi_Nevali_%C3%87ori_%282%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Nevali_%C3%87ori_terazzo_taban.jpg/1280px-Nevali_%C3%87ori_terazzo_taban.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/7/7f/Temple_from_Neval%C4%B1_%C3%87ori_stela.jpg"
	],
	"asikli-hoyuk": [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Asikli-hoyuk.jpg/1280px-Asikli-hoyuk.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/A%C5%9F%C4%B1kl%C4%B1_H%C3%B6y%C3%BCk_05.jpg/1280px-A%C5%9F%C4%B1kl%C4%B1_H%C3%B6y%C3%BCk_05.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/A%C5%9F%C4%B1kl%C4%B1_H%C3%B6y%C3%BCk_06.jpg/1280px-A%C5%9F%C4%B1kl%C4%B1_H%C3%B6y%C3%BCk_06.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/A%C5%9F%C4%B1kl%C4%B1_H%C3%B6y%C3%BCk_Copy_of_the_buildings.jpg/1280px-A%C5%9F%C4%B1kl%C4%B1_H%C3%B6y%C3%BCk_Copy_of_the_buildings.jpg"
	],
	acemhoyuk: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Acemh%C3%B6y%C3%BCk_01.jpg/1280px-Acemh%C3%B6y%C3%BCk_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Acemh%C3%B6y%C3%BCk_02.jpg/1280px-Acemh%C3%B6y%C3%BCk_02.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Acemh%C3%B6y%C3%BCk01.jpg/1280px-Acemh%C3%B6y%C3%BCk01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Acemh%C3%B6y%C3%BCk03.jpg/1280px-Acemh%C3%B6y%C3%BCk03.jpg"
	],
	sapinuwa: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Sapinuwa3.jpg/1280px-Sapinuwa3.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Sapinuwa4.jpg/1280px-Sapinuwa4.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Sapinuwa2.jpg/1280px-Sapinuwa2.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sapinuwa9.jpg/1280px-Sapinuwa9.jpg"
	],
	midas: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Midas_Monument%2C_Yaz%C4%B1l%C4%B1kaya.jpg/1280px-Midas_Monument%2C_Yaz%C4%B1l%C4%B1kaya.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Midas_City%2C_Yaz%C4%B1l%C4%B1kaya_05.jpg/1280px-Midas_City%2C_Yaz%C4%B1l%C4%B1kaya_05.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/MidasSehriAkropolis.jpg/1280px-MidasSehriAkropolis.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/MidasSehri.Tomb.jpg/1280px-MidasSehri.Tomb.jpg"
	],
	altintepe: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Altintepe-apadanaW.jpg/1280px-Altintepe-apadanaW.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Altintepe-templeS.jpg/1280px-Altintepe-templeS.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Altintepe-towerS.jpg/1280px-Altintepe-towerS.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Altintepe-pithoi.jpg/1280px-Altintepe-pithoi.jpg"
	],
	ayanis: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Periodo_urartiano%2C_elmo_a_punta%2C_in_bronzo%2C_dalla_fortezza_di_ayanis.jpg/1280px-Periodo_urartiano%2C_elmo_a_punta%2C_in_bronzo%2C_dalla_fortezza_di_ayanis.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/4/4b/Van_Museum_-_Inscription_Ayanis_Fortress.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Periodo_urartiano%2C_bulla_con_iscrizione_cuneiforme%2C_in_pietra%2C_dalla_fortezza_di_ayanis.jpg/1280px-Periodo_urartiano%2C_bulla_con_iscrizione_cuneiforme%2C_in_pietra%2C_dalla_fortezza_di_ayanis.jpg"
	],
	kaunos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Kaunos_Kral_Mezarlar%C4%B1_Dalyan_Ortaca_Mu%C4%9Fla.jpg/1280px-Kaunos_Kral_Mezarlar%C4%B1_Dalyan_Ortaca_Mu%C4%9Fla.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/DALYAN-KAUNOS_-_panoramio.jpg/1280px-DALYAN-KAUNOS_-_panoramio.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Kaunos_Stoa_area_4378.jpg/1280px-Kaunos_Stoa_area_4378.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Kaunos_Agora_view_6865_panorama.jpg/1280px-Kaunos_Agora_view_6865_panorama.jpg"
	],
	tlos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Tlos_ruins_Turkey.jpg/1280px-Tlos_ruins_Turkey.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Tlos-tomb-ruins.jpg/1280px-Tlos-tomb-ruins.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Tlos_Overview_4214.jpg/1280px-Tlos_Overview_4214.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Tlos.jpg/1280px-Tlos.jpg"
	],
	stratonikeia: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Stratonicea-street.jpg/1280px-Stratonicea-street.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Stratonicee_Sebasteion.JPG/1280px-Stratonicee_Sebasteion.JPG",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Stratonicea-gates.jpg/1280px-Stratonicea-gates.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Stratonicea-ancient-theatre-road.jpg/1280px-Stratonicea-ancient-theatre-road.jpg"
	],
	labraunda: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Labraunda_South_Terrace_3790_Panorama.jpg/1280px-Labraunda_South_Terrace_3790_Panorama.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Labraunda_rock_opening_3875.jpg/1280px-Labraunda_rock_opening_3875.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Labraunda_at_foot_of_terrace_3818_Panorama.jpg/1280px-Labraunda_at_foot_of_terrace_3818_Panorama.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Labraunda_South_Terrace_Panorama_3773.jpg/1280px-Labraunda_South_Terrace_Panorama_3773.jpg"
	],
	magnesia: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/%D0%9C%D0%B0%D0%B3%D0%BD%D0%B5%D1%81%D0%B8%D1%8F_%D0%BD%D0%B0_%D0%9C%D0%B5%D0%B0%D0%BD%D0%B4%D1%80%D0%B5._%D0%9F%D1%80%D0%BE%D0%BF%D0%B8%D0%BB%D0%B5%D0%B8.jpg/1280px-%D0%9C%D0%B0%D0%B3%D0%BD%D0%B5%D1%81%D0%B8%D1%8F_%D0%BD%D0%B0_%D0%9C%D0%B5%D0%B0%D0%BD%D0%B4%D1%80%D0%B5._%D0%9F%D1%80%D0%BE%D0%BF%D0%B8%D0%BB%D0%B5%D0%B8.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Magnesia_on_the_Maeander_Temple_of_Artemis_Ionic_capital.jpg/1280px-Magnesia_on_the_Maeander_Temple_of_Artemis_Ionic_capital.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Reconstruction_drawing_of_the_Temple_of_Diana%2C_Magnesia_on_the_Maeander%2C_Turkey_%2801%29.jpg/1280px-Reconstruction_drawing_of_the_Temple_of_Diana%2C_Magnesia_on_the_Maeander%2C_Turkey_%2801%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/The_Pediment_of_the_Temple_of_Artemis_Leukophryene%2C_Magnesia_ad_Maeandrum%2C_Turkey_%285786893105%29.jpg/1280px-The_Pediment_of_the_Temple_of_Artemis_Leukophryene%2C_Magnesia_ad_Maeandrum%2C_Turkey_%285786893105%29.jpg"
	],
	teos: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Teos%2C_S%C4%B1%C4%9Fac%C4%B1k.jpg/1280px-Teos%2C_S%C4%B1%C4%9Fac%C4%B1k.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Teos_bouleuterion.jpg/1280px-Teos_bouleuterion.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Teos_theatre.jpg/1280px-Teos_theatre.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/2/21/Odeon_Teos_Seferihisar_Turkey.jpg"
	],
	klazomenai: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Klazomenai_Archaic_houses_02_%281991%29.jpg/1280px-Klazomenai_Archaic_houses_02_%281991%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Klazomenai_Archaic_houses_03_%281991%29.jpg/1280px-Klazomenai_Archaic_houses_03_%281991%29.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Klazomenai_%28Liman_Tepe%29_Early_Bronze_Age_fortification_wall.jpg/1280px-Klazomenai_%28Liman_Tepe%29_Early_Bronze_Age_fortification_wall.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/6/6f/Klazomenai.jpg"
	],
	klaros: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Klaros01.jpg/1280px-Klaros01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Klaros_004.jpg/1280px-Klaros_004.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Claros%2C_Ionia%2C_Turkey.jpg/1280px-Claros%2C_Ionia%2C_Turkey.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Claros%2C_Ionia%2C_Turkey_-_53579164316.jpg/1280px-Claros%2C_Ionia%2C_Turkey_-_53579164316.jpg"
	],
	aizanoi: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Aizanoi_ta%C5%9F_kal%C4%B1nt%C4%B1lar_05.jpg/1280px-Aizanoi_ta%C5%9F_kal%C4%B1nt%C4%B1lar_05.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/AIZANOI_theatre_et_stade_ok.jpg/1280px-AIZANOI_theatre_et_stade_ok.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Aizanoi_ta%C5%9F_kal%C4%B1nt%C4%B1lar_15.jpg/1280px-Aizanoi_ta%C5%9F_kal%C4%B1nt%C4%B1lar_15.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Aizanoi_ta%C5%9F_kal%C4%B1nt%C4%B1lar_11.jpg/1280px-Aizanoi_ta%C5%9F_kal%C4%B1nt%C4%B1lar_11.jpg"
	],
	letoon: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Letoon_Temple_Area_2019.jpg/1280px-Letoon_Temple_Area_2019.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Temple_of_Artemis_in_Letoon%2C_2056.jpg/1280px-Temple_of_Artemis_in_Letoon%2C_2056.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Temple_of_Leto_in_Letoon_before_restoration%2C_2051.jpg/1280px-Temple_of_Leto_in_Letoon_before_restoration%2C_2051.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Hellenistic_theatre_in_Letoon%2C_seats%2C_2045.jpg/1280px-Hellenistic_theatre_in_Letoon%2C_seats%2C_2045.jpg"
	],
	limyra: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Limyra_5182.jpg/1280px-Limyra_5182.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Limyra_Kaineus_Tomb_5202.jpg/1280px-Limyra_Kaineus_Tomb_5202.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Limyra_Building_next_to_Roman_Theatre_3785.jpg/1280px-Limyra_Building_next_to_Roman_Theatre_3785.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Bridge_near_Limyra._Pic_04.jpg/1280px-Bridge_near_Limyra._Pic_04.jpg"
	],
	arykanda: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Arykanda_from_Prytaneion_4973.jpg/1280px-Arykanda_from_Prytaneion_4973.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Arykanda_Thermen.jpg/1280px-Arykanda_Thermen.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Arykanda_Odeon_3806.jpg/1280px-Arykanda_Odeon_3806.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Arykanda_State_Agora_Retaining_wall_5071.jpg/1280px-Arykanda_State_Agora_Retaining_wall_5071.jpg"
	],
	anemurium: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Turkey%2C_Anamur_-_Anemurion_01.jpg/1280px-Turkey%2C_Anamur_-_Anemurion_01.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Anemurium_7270.jpg/1280px-Anemurium_7270.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Anemurium_5663_Panorama.jpg/1280px-Anemurium_5663_Panorama.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Anemurium_Aqueduct_5287.jpg/1280px-Anemurium_Aqueduct_5287.jpg"
	],
	uzuncaburc: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/UzuncaburcZeus.jpg/1280px-UzuncaburcZeus.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Olba%2C_Uzuncabur%C3%A7.JPG/1280px-Olba%2C_Uzuncabur%C3%A7.JPG",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Uzuncabur%C3%A7%2C_Mersin_Province.jpg/1280px-Uzuncabur%C3%A7%2C_Mersin_Province.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Diocaesarea_%28Isauria%29_information_3415.jpg/1280px-Diocaesarea_%28Isauria%29_information_3415.jpg"
	],
	karatepe: [
		"https://upload.wikimedia.org/wikipedia/commons/9/9d/Karatepe_Stadtmauer.JPG",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Karatepe_to_South_Gate_5240.jpg/1280px-Karatepe_to_South_Gate_5240.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Karatepe_%C2%A9_Abdullah_K%C4%B1yga_-_panoramio.jpg/1280px-Karatepe_%C2%A9_Abdullah_K%C4%B1yga_-_panoramio.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Karatepe_sept_2008_5206.jpg/1280px-Karatepe_sept_2008_5206.jpg"
	],
	anavarza: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Anavarza_Triumphal_arch_in_Anazarbus_2755.jpg/1280px-Anavarza_Triumphal_arch_in_Anazarbus_2755.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Anavarza_Castle.jpg/1280px-Anavarza_Castle.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Anazarbus_klikya_city_south_gate.jpg/1280px-Anazarbus_klikya_city_south_gate.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Anavarza_ancient_Anazarbus_2764.jpg/1280px-Anavarza_ancient_Anazarbus_2764.jpg"
	],
	"tell-atchana": [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Archaeological_site_of_Alalakh_%28Tell_Atchana%29.JPG/1280px-Archaeological_site_of_Alalakh_%28Tell_Atchana%29.JPG",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Red_burnished_flask_Alalakh_BM.jpg/1280px-Red_burnished_flask_Alalakh_BM.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/6/6a/Minoan_painting_alalakh.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Alalakh_panneau_descriptif_%C3%A0_l%27entr%C3%A9e_du_site.jpg/1280px-Alalakh_panneau_descriptif_%C3%A0_l%27entr%C3%A9e_du_site.jpg"
	],
	kibyra: [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Kibyra_Theatre_9919.jpg/1280px-Kibyra_Theatre_9919.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Kibyra_View_towards_stadium_9766_panorama.jpg/1280px-Kibyra_View_towards_stadium_9766_panorama.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Kibyra_Basilica_9926.jpg/1280px-Kibyra_Basilica_9926.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Kibyra_View_9816.jpg/1280px-Kibyra_View_9816.jpg"
	],
	"antioch-pisidia": [
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Antioch_of_Pisidia_2898.jpg/1280px-Antioch_of_Pisidia_2898.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Antioch_of_Pisidia_2888.jpg/1280px-Antioch_of_Pisidia_2888.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Antioch_of_Pisidia_2897.jpg/1280px-Antioch_of_Pisidia_2897.jpg",
		"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Antioch_of_Pisidia_2887.jpg/1280px-Antioch_of_Pisidia_2887.jpg"
	]
};
/**
* Freely licensed photos (Wikimedia Commons) per site. URL used verbatim;
* falls back to the region image when a site has no entry.
*/
var sitePhoto = {
	efes: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ephesus_-_Celsus_Library.jpg/1280px-Ephesus_-_Celsus_Library.jpg",
	pergamon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Acropolis_amphitheatre_of_Pergamon_%282020%29.jpg/1280px-Acropolis_amphitheatre_of_Pergamon_%282020%29.jpg",
	aphrodisias: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Aphrodisias_-_Tetrapylon_01.jpg/1280px-Aphrodisias_-_Tetrapylon_01.jpg",
	hierapolis: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Hierapolis%2C_Pamukkale_5.jpg/1280px-Hierapolis%2C_Pamukkale_5.jpg",
	milet: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Miletus_-_Ancient_Greek_theatre_01.jpg/1280px-Miletus_-_Ancient_Greek_theatre_01.jpg",
	didyma: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Temple_of_Apollo%2C_Didyma_-_Adyton.jpg/1280px-Temple_of_Apollo%2C_Didyma_-_Adyton.jpg",
	priene: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Priene_Acropolis.jpg/1280px-Priene_Acropolis.jpg",
	sardes: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/20230429_Gymnasium_at_Sardis_4.jpg/1280px-20230429_Gymnasium_at_Sardis_4.jpg",
	laodikeia: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Laodicea_Ancient_City_2026%2C_108.jpg/1280px-Laodicea_Ancient_City_2026%2C_108.jpg",
	halikarnassos: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Mausoleum_at_Halicarnassus_at_the_Bodrum_Museum_of_Underwater_Archaeology.jpg",
	knidos: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Dat%C3%A7a-Knidos.jpg",
	patara: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Patara_Ka%C5%9F.jpg/1280px-Patara_Ka%C5%9F.jpg",
	xanthos: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/The_Roman_theatre%2C_built_in_the_mid-2nd_century_AD%2C_Xanthos%2C_Lycia%2C_Turkey_%288825114404%29.jpg/1280px-The_Roman_theatre%2C_built_in_the_mid-2nd_century_AD%2C_Xanthos%2C_Lycia%2C_Turkey_%288825114404%29.jpg",
	myra: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Myra_Rock_Tombs.jpg/1280px-Myra_Rock_Tombs.jpg",
	olympos: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Olympos%2C_Lycia%2C_Turkey_%289653957867%29.jpg/1280px-Olympos%2C_Lycia%2C_Turkey_%289653957867%29.jpg",
	phaselis: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/20180511_153347_phaselis_antik_kenti.jpg/1280px-20180511_153347_phaselis_antik_kenti.jpg",
	perge: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Columns_in_Perge_03.jpg/1280px-Columns_in_Perge_03.jpg",
	aspendos: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Aspendos_Theatre%2C_Turkey.jpg/1280px-Aspendos_Theatre%2C_Turkey.jpg",
	side: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Antalya_Side_Apollo.jpg/1280px-Antalya_Side_Apollo.jpg",
	termessos: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/TERMESSOS_Od%C3%A9on_int%C3%A9rieur.jpg/1280px-TERMESSOS_Od%C3%A9on_int%C3%A9rieur.jpg",
	sagalassos: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Sagalassos_-_Nymphaeum.jpg/1280px-Sagalassos_-_Nymphaeum.jpg",
	troya: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Troy_archaeological_site_-_Turkey_%281%29.jpg/1280px-Troy_archaeological_site_-_Turkey_%281%29.jpg",
	assos: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Assos%2C_Turkey_-_6452161411.jpg/1280px-Assos%2C_Turkey_-_6452161411.jpg",
	kyzikos: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Bandirma_Cyzicus_2874.jpg/1280px-Bandirma_Cyzicus_2874.jpg",
	nikaia: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Iznik_Wall_at_Sarayi_Gate_099.jpg/1280px-Iznik_Wall_at_Sarayi_Gate_099.jpg",
	gordion: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Gordion_Citadel_Mound_aerial_overview_2017.jpg",
	catalhoyuk: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_02.jpg/1280px-%C3%87atalh%C3%B6y%C3%BCk%2C_7400_BC%2C_Konya%2C_Turkey_-_UNESCO_World_Heritage_Site%2C_02.jpg",
	kultepe: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Kultepe_Karum_excavations_%281993%29_06.jpg/1280px-Kultepe_Karum_excavations_%281993%29_06.jpg",
	tyana: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Tuwanuwa_-_Tyana_-_Kemerhisar.jpg/1280px-Tuwanuwa_-_Tyana_-_Kemerhisar.jpg",
	hattusa: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Lion_Gate%2C_Hattusa_01.jpg/1280px-Lion_Gate%2C_Hattusa_01.jpg",
	alacahoyuk: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg/1280px-Sphinx_Gate%2C_Alaca_H%C3%B6y%C3%BCk_01.jpg",
	pompeiopolis: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Soli_Pompeiopolis_20141116_02.jpg/1280px-Soli_Pompeiopolis_20141116_02.jpg",
	amastris: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/2009_in_Amasra_14.jpg/1280px-2009_in_Amasra_14.jpg",
	gobeklitepe: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/G%C3%B6bekli_Tepe%2C_Urfa.jpg/1280px-G%C3%B6bekli_Tepe%2C_Urfa.jpg",
	nemrut: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/001362_Nemrut_Da%C4%9F%C4%B1_-_T%C3%BCrkei.jpg/1280px-001362_Nemrut_Da%C4%9F%C4%B1_-_T%C3%BCrkei.jpg",
	zeugma: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Gaziantep_Zeugma_Museum_Dionysos_Triumf_mosaic_1921.jpg/1280px-Gaziantep_Zeugma_Museum_Dionysos_Triumf_mosaic_1921.jpg",
	harran: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Harran_Beehive_houses_192b.jpg/1280px-Harran_Beehive_houses_192b.jpg",
	dara: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Dara_Nekropol_Alan%C4%B1.jpg/1280px-Dara_Nekropol_Alan%C4%B1.jpg",
	ani: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Ani_Archeological_Site%2C_March_2020_1.jpg/1280px-Ani_Archeological_Site%2C_March_2020_1.jpg",
	tuspa: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tushpa_11.jpg/1280px-Tushpa_11.jpg",
	cavustepe: "https://upload.wikimedia.org/wikipedia/commons/a/af/Urartian_fort_in_%C3%87avu%C5%9Ftepe.jpg",
	arslantepe: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Arslantepe_L%C3%B6wentor_Delaporte.jpg",
	"karahan-tepe": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Karahan_Tepe_overview.jpg/1280px-Karahan_Tepe_overview.jpg",
	"nevali-cori": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Nevali_%C3%87ori_kaz%C4%B1_alan%C4%B1_maketi_%282%29.jpg/1280px-Nevali_%C3%87ori_kaz%C4%B1_alan%C4%B1_maketi_%282%29.jpg",
	"asikli-hoyuk": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Asikli-hoyuk.jpg/1280px-Asikli-hoyuk.jpg",
	acemhoyuk: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Acemh%C3%B6y%C3%BCk_01.jpg/1280px-Acemh%C3%B6y%C3%BCk_01.jpg",
	sapinuwa: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Sapinuwa3.jpg/1280px-Sapinuwa3.jpg",
	midas: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Midas_Monument%2C_Yaz%C4%B1l%C4%B1kaya.jpg/1280px-Midas_Monument%2C_Yaz%C4%B1l%C4%B1kaya.jpg",
	altintepe: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Altintepe-apadanaW.jpg/1280px-Altintepe-apadanaW.jpg",
	ayanis: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Periodo_urartiano%2C_elmo_a_punta%2C_in_bronzo%2C_dalla_fortezza_di_ayanis.jpg/1280px-Periodo_urartiano%2C_elmo_a_punta%2C_in_bronzo%2C_dalla_fortezza_di_ayanis.jpg",
	kaunos: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Kaunos_Kral_Mezarlar%C4%B1_Dalyan_Ortaca_Mu%C4%9Fla.jpg/1280px-Kaunos_Kral_Mezarlar%C4%B1_Dalyan_Ortaca_Mu%C4%9Fla.jpg",
	tlos: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Tlos_ruins_Turkey.jpg/1280px-Tlos_ruins_Turkey.jpg",
	stratonikeia: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Stratonicea-street.jpg/1280px-Stratonicea-street.jpg",
	labraunda: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Labraunda_South_Terrace_3790_Panorama.jpg/1280px-Labraunda_South_Terrace_3790_Panorama.jpg",
	magnesia: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Magnesia_on_the_Maeander_Temple_of_Artemis_Ionic_capital.jpg/1280px-Magnesia_on_the_Maeander_Temple_of_Artemis_Ionic_capital.jpg",
	teos: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Teos%2C_S%C4%B1%C4%9Fac%C4%B1k.jpg/1280px-Teos%2C_S%C4%B1%C4%9Fac%C4%B1k.jpg",
	klazomenai: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Klazomenai_Archaic_houses_02_%281991%29.jpg/1280px-Klazomenai_Archaic_houses_02_%281991%29.jpg",
	klaros: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Klaros01.jpg/1280px-Klaros01.jpg",
	aizanoi: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Aizanoi_ta%C5%9F_kal%C4%B1nt%C4%B1lar_05.jpg/1280px-Aizanoi_ta%C5%9F_kal%C4%B1nt%C4%B1lar_05.jpg",
	letoon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Letoon_Temple_Area_2019.jpg/1280px-Letoon_Temple_Area_2019.jpg",
	limyra: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Limyra_5182.jpg/1280px-Limyra_5182.jpg",
	arykanda: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Arykanda_from_Prytaneion_4973.jpg/1280px-Arykanda_from_Prytaneion_4973.jpg",
	anemurium: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Turkey%2C_Anamur_-_Anemurion_01.jpg/1280px-Turkey%2C_Anamur_-_Anemurion_01.jpg",
	uzuncaburc: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/UzuncaburcZeus.jpg/1280px-UzuncaburcZeus.jpg",
	karatepe: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Karatepe_Stadtmauer.JPG",
	anavarza: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Anavarza_Triumphal_arch_in_Anazarbus_2755.jpg/1280px-Anavarza_Triumphal_arch_in_Anazarbus_2755.jpg",
	"tell-atchana": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Archaeological_site_of_Alalakh_%28Tell_Atchana%29.JPG/1280px-Archaeological_site_of_Alalakh_%28Tell_Atchana%29.JPG",
	kibyra: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Kibyra_Theatre_9919.jpg/1280px-Kibyra_Theatre_9919.jpg",
	"antioch-pisidia": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Antioch_of_Pisidia_2898.jpg/1280px-Antioch_of_Pisidia_2898.jpg"
};
var s = (slug, nameTr, nameEn, region, provTr, provEn, lat, lng, civilizations, eraTr, eraEn, unesco, fee, sumTr, sumEn, hisTr, hisEn, structTr, structEn, factTr, factEn, figures, popularity, heritageType = "ancient-city") => ({
	slug,
	country: "TR",
	heritageType,
	name: {
		tr: nameTr,
		en: nameEn
	},
	region,
	province: {
		tr: provTr,
		en: provEn
	},
	lat,
	lng,
	civilizations,
	era: {
		tr: eraTr,
		en: eraEn
	},
	unesco,
	fee,
	hours: {
		tr: fee === 0 ? "Her gün, gün doğumu – gün batımı" : "Her gün 08:30 – 19:00 (kışın 17:00)",
		en: fee === 0 ? "Daily, sunrise – sunset" : "Daily 08:30 – 19:00 (17:00 in winter)"
	},
	summary: {
		tr: sumTr,
		en: sumEn
	},
	history: {
		tr: hisTr,
		en: hisEn
	},
	structures: structTr.map((tr, i) => ({
		tr,
		en: structEn[i] ?? tr
	})),
	funFact: {
		tr: factTr,
		en: factEn
	},
	figures,
	popularity
});
var sites = [
	s("efes", "Efes", "Ephesus", "ege", "İzmir", "İzmir", 37.9395, 27.3417, [
		"İon",
		"Lidya",
		"Roma",
		"Bizans"
	], "MÖ 10. yüzyıl", "10th century BC", "listed", 600, "Antik dünyanın en iyi korunmuş Roma kentlerinden biri; Celsus Kütüphanesi ile ünlü.", "One of the best-preserved Roman cities of antiquity, famed for the Library of Celsus.", "İyonların kurduğu kent, Artemis Tapınağı sayesinde Ege'nin dinî merkezi oldu. Roma döneminde Asia eyaletinin başkenti olarak 200 binden fazla nüfusa ulaştı; limanın alüvyonla dolmasıyla önemini yitirdi.", "Founded by Ionian settlers, the city grew around the Temple of Artemis. Under Rome it became capital of the province of Asia with over 200,000 people, then declined as its harbour silted up.", [
		"Celsus Kütüphanesi",
		"Büyük Tiyatro",
		"Yamaç Evler",
		"Artemis Tapınağı",
		"Kuretler Caddesi"
	], [
		"Library of Celsus",
		"Great Theatre",
		"Terrace Houses",
		"Temple of Artemis",
		"Curetes Street"
	], "Artemis Tapınağı Dünyanın Yedi Harikası'ndan biriydi; bugün ayakta sadece tek bir sütun var.", "The Temple of Artemis was one of the Seven Wonders; a single re-erected column remains today.", [
		"Herakleitos",
		"Celsus",
		"İmparator Hadrianus",
		"Aziz Yuhanna"
	], 10),
	s("pergamon", "Bergama (Pergamon)", "Pergamon", "ege", "İzmir", "İzmir", 39.1319, 27.1844, [
		"Helenistik",
		"Roma",
		"Bizans"
	], "MÖ 3. yüzyıl", "3rd century BC", "listed", 400, "Dik yamacına kurulmuş akropolü ve dünyanın en dik tiyatrosuyla tanınan krallık başkenti.", "A royal capital on a steep acropolis, home to the steepest theatre of the ancient world.", "Attalos hanedanının başkenti olarak parşömenin adını aldığı 200 bin ciltlik kütüphaneye ev sahipliği yaptı. MÖ 133'te Roma'ya miras bırakıldı ve sağlık merkezi Asklepion ile ün kazandı.", "Capital of the Attalid dynasty, its 200,000-scroll library gave parchment its name. Bequeathed to Rome in 133 BC, it became famous for the Asklepion healing centre.", [
		"Akropol",
		"Zeus Sunağı terası",
		"Trajan Tapınağı",
		"Asklepion",
		"Kızıl Avlu"
	], [
		"Acropolis",
		"Great Altar terrace",
		"Temple of Trajan",
		"Asklepion",
		"Red Basilica"
	], "Kentin adı 'parşömen' kelimesinin kökenidir: Mısır papirüs ihracatını kesince burada deri işlenmeye başlandı.", "The word 'parchment' comes from Pergamon: when Egypt cut off papyrus, the city perfected treated skins.", [
		"Attalos I",
		"Eumenes II",
		"Galenos"
	], 9),
	s("aphrodisias", "Afrodisias", "Aphrodisias", "ege", "Aydın", "Aydın", 37.7081, 28.7253, ["Karia", "Roma"], "MÖ 2. yüzyıl", "2nd century BC", "listed", 400, "Mermer ocaklarının yanı başında yükselen, heykeltıraşlık okuluyla ünlü Roma kenti.", "A Roman city beside its own marble quarries, famous for its school of sculpture.", "Aphrodite kültü etrafında büyüyen kent, Roma'ya sadakati sayesinde vergi muafiyeti kazandı. Yerli mermeri işleyen heykeltıraşları imparatorluk boyunca eser verdi.", "Grown around the cult of Aphrodite, the city won tax exemption for its loyalty to Rome. Its sculptors, working local marble, supplied statues across the empire.", [
		"Stadyum",
		"Aphrodite Tapınağı",
		"Tetrapylon",
		"Sebasteion",
		"Heykel atölyeleri"
	], [
		"Stadium",
		"Temple of Aphrodite",
		"Tetrapylon",
		"Sebasteion",
		"Sculpture workshops"
	], "30 bin kişilik stadyumu antik dünyanın en iyi korunmuş stadyumudur.", "Its 30,000-seat stadium is the best-preserved stadium surviving from antiquity.", [
		"Aphrodite",
		"Zoilos",
		"İmparator Augustus"
	], 9),
	s("hierapolis", "Hierapolis", "Hierapolis", "ege", "Denizli", "Denizli", 37.9257, 29.1246, [
		"Helenistik",
		"Roma",
		"Bizans"
	], "MÖ 2. yüzyıl", "2nd century BC", "listed", 700, "Pamukkale travertenlerinin üzerine kurulmuş kaplıca ve nekropol kenti.", "A spa and necropolis city built above the travertines of Pamukkale.", "Bergama kralları tarafından kurulan kent, sıcak su kaynakları sayesinde bir şifa merkezi oldu. Depremlerle yıkılıp Roma döneminde yeniden inşa edildi.", "Founded by the kings of Pergamon, its hot springs made it a healing centre. Destroyed by earthquakes, it was rebuilt in grand Roman style.", [
		"Antik havuz",
		"Tiyatro",
		"Nekropol",
		"Frontinus Caddesi",
		"Apollon Tapınağı"
	], [
		"Antique Pool",
		"Theatre",
		"Necropolis",
		"Frontinus Street",
		"Temple of Apollo"
	], "Antik havuzun dibindeki sütunlar MS 7. yüzyıldaki bir depremde suya düşen portiklere aittir.", "The columns lying in the Antique Pool fell there during a 7th-century earthquake.", ["Epiktetos", "Aziz Filipus"], 9),
	s("milet", "Milet", "Miletus", "ege", "Aydın", "Aydın", 37.5306, 27.2775, ["İon", "Roma"], "MÖ 15. yüzyıl", "15th century BC", "tentative", 200, "Izgara planlı kent tasarımının doğduğu, felsefenin beşiği sayılan liman kenti.", "The harbour city where grid-plan urbanism was born and philosophy took its first steps.", "Dört limanıyla Akdeniz ticaretinin merkeziydi ve 90'dan fazla koloni kurdu. Perslerce yıkıldıktan sonra Hippodamos'un ızgara planına göre yeniden kuruldu.", "With four harbours it dominated Mediterranean trade and founded over 90 colonies. After Persian destruction it was rebuilt on Hippodamus' grid plan.", [
		"Büyük Tiyatro",
		"Faustina Hamamı",
		"Bouleuterion",
		"Kuzey Agora",
		"İlyas Bey Camii"
	], [
		"Great Theatre",
		"Baths of Faustina",
		"Bouleuterion",
		"North Agora",
		"İlyas Bey Mosque"
	], "Bugün kent denize 8 km uzakta: Menderes Nehri limanları tamamen doldurdu.", "The city now lies 8 km inland — the Meander river filled in all four harbours.", [
		"Thales",
		"Anaksimandros",
		"Hippodamos"
	], 7),
	s("didyma", "Didyma", "Didyma", "ege", "Aydın", "Aydın", 37.3847, 27.2564, [
		"İon",
		"Helenistik",
		"Roma"
	], "MÖ 8. yüzyıl", "8th century BC", "tentative", 200, "Anadolu'nun en büyük tapınaklarından biri olan Apollon kehanet merkezi.", "The oracle sanctuary of Apollo, one of the largest temples in Anatolia.", "Milet'e kutsal yolla bağlı kehanet merkeziydi. Büyük İskender'in ziyaretinden sonra devasa tapınağın inşasına başlandı ama yapı hiç tamamlanamadı.", "Linked to Miletus by a sacred way, it was a major oracle. Work on the colossal temple began after Alexander's visit but was never finished.", [
		"Apollon Tapınağı",
		"Medusa başı",
		"Adyton",
		"Kutsal Yol"
	], [
		"Temple of Apollo",
		"Medusa head",
		"Adyton",
		"Sacred Way"
	], "Tapınağın duvarlarında hâlâ inşaat çizimleri (mimari şablonlar) görülebilir.", "Construction drawings used by ancient architects are still visible on the temple walls.", [
		"Apollon",
		"Büyük İskender",
		"Branchidai"
	], 7, "sanctuary"),
	s("priene", "Priene", "Priene", "ege", "Aydın", "Aydın", 37.6597, 27.2981, ["İon", "Helenistik"], "MÖ 4. yüzyıl", "4th century BC", "tentative", 200, "Mykale Dağı eteğinde, ızgara planı bozulmadan kalmış küçük İon kenti.", "A compact Ionian city on Mount Mycale whose grid plan survives intact.", "Helenistik dönemde yeniden kurulan kent hiç büyük bir Roma müdahalesi görmedi; bu yüzden klasik kent planlamasının en saf örneği sayılır.", "Refounded in the Hellenistic period, it escaped major Roman rebuilding and is the purest surviving example of classical town planning.", [
		"Athena Tapınağı",
		"Bouleuterion",
		"Tiyatro",
		"Ekklesiasterion"
	], [
		"Temple of Athena",
		"Bouleuterion",
		"Theatre",
		"Ekklesiasterion"
	], "Tiyatronun ön sırasındaki mermer koltuklar kent ileri gelenlerine ayrılmıştı.", "The marble armchairs in the theatre's front row were reserved for city dignitaries.", [
		"Bias",
		"Pytheos",
		"Büyük İskender"
	], 6),
	s("sardes", "Sardes", "Sardis", "ege", "Manisa", "Manisa", 38.4881, 28.0403, [
		"Lidya",
		"Pers",
		"Roma"
	], "MÖ 7. yüzyıl", "7th century BC", "tentative", 150, "Dünyanın ilk sikkesinin basıldığı Lidya Krallığı'nın başkenti.", "Capital of the Lydian kingdom, where the world's first coins were struck.", "Kral Kroisos'un zenginliğiyle ünlenen kent, Pers Kral Yolu'nun batı ucuydu. Roma döneminde büyük bir sinagog ve gymnasium kompleksiyle yeniden canlandı.", "Famed for the wealth of King Croesus, it was the western terminus of the Persian Royal Road, later revived by Rome with a huge synagogue and gymnasium.", [
		"Artemis Tapınağı",
		"Gymnasium",
		"Sinagog",
		"Sikke atölyesi",
		"Bin Tepe tümülüsleri"
	], [
		"Temple of Artemis",
		"Gymnasium",
		"Synagogue",
		"Mint workshop",
		"Bin Tepe tumuli"
	], "'Karun kadar zengin' deyimi Sardes kralı Kroisos'tan gelir.", "The phrase 'rich as Croesus' comes from this city's Lydian king.", [
		"Kroisos",
		"Gyges",
		"Kyros"
	], 7),
	s("laodikeia", "Laodikeia", "Laodicea", "ege", "Denizli", "Denizli", 37.8361, 29.1078, [
		"Helenistik",
		"Roma",
		"Bizans"
	], "MÖ 3. yüzyıl", "3rd century BC", "tentative", 150, "İki tiyatrosu ve geniş caddeleriyle Lykos Vadisi'nin zengin ticaret kenti.", "A wealthy trading city of the Lycus valley with two theatres and broad avenues.", "Seleukos kralı II. Antiokhos tarafından eşi Laodike adına kuruldu. Tekstil ve bankacılıkla zenginleşti; Hristiyanlığın yedi kilisesinden biri buradaydı.", "Founded by the Seleucid king Antiochus II for his wife Laodice, it grew rich on textiles and banking and hosted one of the Seven Churches.", [
		"Suriye Caddesi",
		"Batı Tiyatrosu",
		"Laodikeia Kilisesi",
		"Su dağıtım terminali"
	], [
		"Syria Street",
		"West Theatre",
		"Laodicea Church",
		"Water distribution terminal"
	], "Kent depremden sonra Roma'nın yardımını reddedip kendi parasıyla yeniden inşa edildi.", "After an earthquake the city refused Roman aid and rebuilt itself with its own money.", [
		"Antiokhos II",
		"Laodike",
		"Aziz Yuhanna"
	], 6),
	s("halikarnassos", "Halikarnassos", "Halicarnassus", "ege", "Muğla", "Muğla", 37.0379, 27.4241, [
		"Karia",
		"Helenistik",
		"Roma"
	], "MÖ 11. yüzyıl", "11th century BC", "tentative", 150, "Dünyanın Yedi Harikası'ndan Mausoleion'un yükseldiği Karia başkenti.", "The Carian capital where the Mausoleum, one of the Seven Wonders, once stood.", "Satrap Mausolos kenti başkent yaptı; ölümünden sonra kız kardeşi Artemisia devasa anıt mezarı tamamlattı. Anıt ortaçağda depremlerle yıkıldı, taşları kaleye taşındı.", "Satrap Mausolus made it his capital; after his death his sister Artemisia completed his colossal tomb, later toppled by earthquakes and quarried for the castle.", [
		"Mausoleion",
		"Antik tiyatro",
		"Myndos Kapısı",
		"Bodrum Kalesi"
	], [
		"Mausoleum",
		"Ancient theatre",
		"Myndos Gate",
		"Bodrum Castle"
	], "'Mozole' kelimesi doğrudan Kral Mausolos'un adından türemiştir.", "The word 'mausoleum' comes directly from King Mausolus' name.", [
		"Herodotos",
		"Mausolos",
		"Artemisia"
	], 7),
	s("knidos", "Knidos", "Knidos", "ege", "Muğla", "Muğla", 36.6853, 27.3742, [
		"Dor",
		"Helenistik",
		"Roma"
	], "MÖ 4. yüzyıl", "4th century BC", "tentative", 150, "Datça Yarımadası'nın ucunda, iki limanı olan bilim ve sanat kenti.", "A city of science and art with two harbours at the tip of the Datça peninsula.", "Ege ile Akdeniz'in buluştuğu noktada kurulan kent, gemiler için zorunlu bir uğraktı. Praksiteles'in Aphrodite heykeli antik dünyanın en çok ziyaret edilen eserlerindendi.", "Set where the Aegean meets the Mediterranean, it was an obligatory stop for ships. Praxiteles' Aphrodite drew visitors from across the ancient world.", [
		"Yuvarlak Aphrodite Tapınağı",
		"Tiyatro",
		"Güneş saati terası",
		"İki liman"
	], [
		"Round Temple of Aphrodite",
		"Theatre",
		"Sundial terrace",
		"Twin harbours"
	], "Astronom Eudoksos burada bir gözlemevi kurmuş ve yıl uzunluğunu şaşırtıcı doğrulukta hesaplamıştı.", "The astronomer Eudoxus built an observatory here and measured the year with striking accuracy.", [
		"Praksiteles",
		"Eudoksos",
		"Sostratos"
	], 6),
	s("patara", "Patara", "Patara", "akdeniz", "Antalya", "Antalya", 36.2661, 29.3178, ["Likya", "Roma"], "MÖ 5. yüzyıl", "5th century BC", "tentative", 300, "Likya Birliği'nin başkenti; dünyanın bilinen ilk parlamento binasına ev sahipliği yapar.", "Capital of the Lycian League, home to what may be the world's first parliament building.", "Likya'nın en önemli limanıydı ve Apollon kehanet merkeziyle ünlüydü. Roma döneminde Lykia eyaletinin idari merkezi oldu; kumullar altında kalarak korunmuş kaldı.", "Lycia's principal port and an oracle of Apollo, it became the Roman provincial capital and was preserved for centuries beneath sand dunes.", [
		"Bouleuterion (Meclis)",
		"Zafer Takı",
		"Tiyatro",
		"Deniz Feneri",
		"Ana Cadde"
	], [
		"Bouleuterion (Assembly)",
		"Triumphal Arch",
		"Theatre",
		"Lighthouse",
		"Colonnaded Street"
	], "Noel Baba olarak bilinen Aziz Nikolaos MS 270 civarında burada doğdu.", "Saint Nicholas — Santa Claus — was born here around AD 270.", [
		"Aziz Nikolaos",
		"Apollon",
		"İmparator Neron"
	], 8),
	s("xanthos", "Ksanthos", "Xanthos", "akdeniz", "Antalya", "Antalya", 36.3561, 29.3186, [
		"Likya",
		"Roma",
		"Bizans"
	], "MÖ 8. yüzyıl", "8th century BC", "listed", 200, "Likya'nın en büyük kenti ve anıt mezar mimarisinin başkenti.", "Lycia's largest city and the capital of monumental tomb architecture.", "Kent tarih boyunca iki kez, teslim olmaktansa kendini yakmayı seçti. Likçe yazıtların en zengin koleksiyonu buradan çıkmıştır.", "Twice in its history the city chose self-immolation over surrender. It yielded the richest collection of Lycian inscriptions known.", [
		"Harpy Anıtı",
		"Nereidler Anıtı",
		"Likya lahitleri",
		"Tiyatro",
		"Letoon kutsal alanı"
	], [
		"Harpy Monument",
		"Nereid Monument",
		"Lycian sarcophagi",
		"Theatre",
		"Letoon sanctuary"
	], "Nereidler Anıtı'nın özgün blokları bugün British Museum'da sergileniyor.", "The original blocks of the Nereid Monument are displayed in the British Museum today.", [
		"Harpagos",
		"Leto",
		"Brutus"
	], 7),
	s("myra", "Myra", "Myra", "akdeniz", "Antalya", "Antalya", 36.2589, 29.9853, [
		"Likya",
		"Roma",
		"Bizans"
	], "MÖ 5. yüzyıl", "5th century BC", "tentative", 300, "Kaya mezarlarıyla dolu yamacı ve Noel Baba kilisesiyle bilinen Likya kenti.", "A Lycian city known for its cliff of rock tombs and the church of Saint Nicholas.", "Likya Birliği'nin altı büyük kentinden biriydi. MS 4. yüzyılda piskoposu Nikolaos'un mezarı kenti önemli bir hac merkezine dönüştürdü.", "One of the six great cities of the Lycian League; in the 4th century the tomb of its bishop Nicholas turned it into a pilgrimage centre.", [
		"Kaya mezarları",
		"Roma tiyatrosu",
		"Aziz Nikolaos Kilisesi",
		"Andriake limanı"
	], [
		"Rock-cut tombs",
		"Roman theatre",
		"Church of St Nicholas",
		"Andriake harbour"
	], "Kaya mezarları ahşap Likya evlerini taklit eder; kirişler ve kapılar taşa oyulmuştur.", "The rock tombs imitate wooden Lycian houses, with beams and doors carved into stone.", ["Aziz Nikolaos", "Aziz Pavlus"], 8),
	s("olympos", "Olympos", "Olympos", "akdeniz", "Antalya", "Antalya", 36.3958, 30.4694, ["Likya", "Roma"], "MÖ 2. yüzyıl", "2nd century BC", "none", 150, "Defne ormanı içindeki kalıntılar ve hemen yanı başındaki sönmeyen Yanartaş.", "Ruins wrapped in laurel forest beside the never-dying flames of Chimaera.", "Korsanların üssü olarak ün yapan kent, Roma'nın Akdeniz'i temizlemesiyle sakinleşti. Hephaistos kültü yakındaki doğal gaz alevleriyle ilişkilendirildi.", "Notorious as a pirate base, the city was pacified when Rome cleared the seas. The cult of Hephaestus grew around the nearby natural gas flames.", [
		"Liman hamamı",
		"Tiyatro",
		"Lahitler",
		"Köprü ayakları",
		"Yanartaş (Khimaira)"
	], [
		"Harbour baths",
		"Theatre",
		"Sarcophagi",
		"Bridge piers",
		"Chimaera flames"
	], "Yanartaş'taki alevler en az 2500 yıldır kesintisiz yanıyor.", "The flames of Chimaera have burned without pause for at least 2,500 years.", ["Zeniketes", "Hephaistos"], 7),
	s("phaselis", "Phaselis", "Phaselis", "akdeniz", "Antalya", "Antalya", 36.5253, 30.5514, [
		"Rodos",
		"Likya",
		"Roma"
	], "MÖ 7. yüzyıl", "7th century BC", "none", 300, "Üç doğal limanı çam ormanıyla çevrili, denize sıfır antik liman kenti.", "A seaside port city with three natural harbours ringed by pine forest.", "Rodoslular tarafından kurulan kent ticaretle zenginleşti; gül yağı ve kerestesiyle tanınıyordu. Büyük İskender kışı burada geçirmişti.", "Founded by Rhodians, it prospered on trade in rose oil and timber. Alexander the Great wintered here.", [
		"Hadrian Kapısı",
		"Ana Cadde",
		"Tiyatro",
		"Üç liman",
		"Hamamlar"
	], [
		"Hadrian's Gate",
		"Main Street",
		"Theatre",
		"Three harbours",
		"Baths"
	], "Antik ana cadde bugün hâlâ iki limanı birbirine bağlıyor; üzerinde yürüyebilirsiniz.", "The ancient main street still connects two harbours — and you can walk it.", ["Büyük İskender", "Kylabras"], 7),
	s("perge", "Perge", "Perge", "akdeniz", "Antalya", "Antalya", 36.9614, 30.8536, [
		"Pamfilya",
		"Helenistik",
		"Roma"
	], "MÖ 12. yüzyıl", "12th century BC", "tentative", 400, "Sütunlu caddesi ve su kanalıyla Pamfilya'nın en görkemli Roma kenti.", "Pamphylia's grandest Roman city, with a colonnaded street and central water channel.", "Truva Savaşı sonrası göçlerle kurulduğu söylenir. Roma döneminde hayırsever Plancia Magna'nın bağışlarıyla anıtsal kapılar ve çeşmelerle donatıldı.", "Said to be founded by migrants after the Trojan War, it was monumentalised in Roman times by the benefactor Plancia Magna.", [
		"Helenistik Kapı",
		"Sütunlu Cadde",
		"Stadyum",
		"Tiyatro",
		"Roma Hamamı"
	], [
		"Hellenistic Gate",
		"Colonnaded Street",
		"Stadium",
		"Theatre",
		"Roman Baths"
	], "Sütunlu caddenin ortasından akan kanal, kenti serinletmek için tasarlanmış bir klima sistemiydi.", "The channel running down the main street was an ancient cooling system for the city.", [
		"Plancia Magna",
		"Apollonios",
		"Aziz Pavlus"
	], 8),
	s("aspendos", "Aspendos", "Aspendos", "akdeniz", "Antalya", "Antalya", 36.9392, 31.1722, ["Pamfilya", "Roma"], "MÖ 5. yüzyıl", "5th century BC", "tentative", 400, "Dünyanın en iyi korunmuş antik tiyatrosu; bugün hâlâ konser veriliyor.", "The best-preserved ancient theatre in the world — still hosting concerts today.", "Eurymedon Nehri sayesinde tuz, yağ ve at ticaretiyle zenginleşti. Tiyatro MS 2. yüzyılda mimar Zenon tarafından inşa edildi ve Selçuklular tarafından kervansaray olarak kullanıldığı için sağlam kaldı.", "Enriched by salt, oil and horse trade on the Eurymedon, its theatre was built by the architect Zeno in the 2nd century and survived because the Seljuks reused it as a caravanserai.", [
		"Roma Tiyatrosu",
		"Su kemerleri",
		"Bazilika",
		"Agora",
		"Stadyum"
	], [
		"Roman Theatre",
		"Aqueducts",
		"Basilica",
		"Agora",
		"Stadium"
	], "Tiyatronun akustiği o kadar iyi ki sahnede fısıldanan söz 41. sıradan duyulabiliyor.", "The acoustics are so precise that a whisper on stage reaches the 41st row.", ["Zenon", "İmparator Marcus Aurelius"], 9),
	s("side", "Side", "Side", "akdeniz", "Antalya", "Antalya", 36.7667, 31.3894, [
		"Pamfilya",
		"Helenistik",
		"Roma"
	], "MÖ 7. yüzyıl", "7th century BC", "tentative", 0, "Yarımadanın ucundaki Apollon Tapınağı ile ünlü, modern kasabayla iç içe antik kent.", "An ancient city woven into a modern town, famed for its Apollo temple on the point.", "Antik çağda köle ticaretinin merkeziydi ve kendine özgü bir dil konuşuyordu. Roma döneminde 15 bin kişilik tiyatrosuyla Pamfilya'nın en kalabalık kentlerindendi.", "A major slave-trade port with its own language, Side was among Pamphylia's largest cities, with a theatre seating 15,000.", [
		"Apollon Tapınağı",
		"Tiyatro",
		"Anıtsal Çeşme",
		"Agora",
		"Kent kapısı"
	], [
		"Temple of Apollo",
		"Theatre",
		"Monumental Fountain",
		"Agora",
		"City gate"
	], "Kleopatra ile Marcus Antonius'un buluştuğu kentlerden biri olarak anılır.", "Side is remembered as one of the places where Cleopatra met Mark Antony.", ["Kleopatra", "Marcus Antonius"], 8),
	s("termessos", "Termessos", "Termessos", "akdeniz", "Antalya", "Antalya", 36.9819, 30.4636, ["Pisidya", "Roma"], "MÖ 5. yüzyıl", "5th century BC", "none", 100, "1050 metre yükseklikte, Büyük İskender'in alamadığı kartal yuvası kent.", "An eagle's nest city at 1,050 m that Alexander the Great failed to take.", "Pisidyalıların kurduğu kent doğal savunması sayesinde hiç işgal edilmedi. Bir depremle su sistemi çöktükten sonra terk edildi ve orman içinde kaldı.", "Founded by the Pisidians, its natural defences kept invaders out. Abandoned after an earthquake wrecked its water system, it was swallowed by forest.", [
		"Tiyatro",
		"Gymnasium",
		"Sarnıçlar",
		"Nekropol",
		"Kral Yolu"
	], [
		"Theatre",
		"Gymnasium",
		"Cisterns",
		"Necropolis",
		"King's Road"
	], "Tiyatrodan Güllük Dağı'na bakan manzara antik dünyanın en dramatik sahne arkasıdır.", "Its theatre looks out over Güllük mountain — arguably antiquity's most dramatic backdrop.", ["Büyük İskender", "Alketas"], 7),
	s("sagalassos", "Sagalassos", "Sagalassos", "akdeniz", "Burdur", "Burdur", 37.6786, 30.5197, [
		"Pisidya",
		"Roma",
		"Bizans"
	], "MÖ 5. yüzyıl", "5th century BC", "tentative", 200, "1500 metre yükseklikte, çalışan antik çeşmesiyle ünlü dağ kenti.", "A mountain city at 1,500 m, famous for its restored and still-flowing fountain.", "Pisidya'nın 'ilk kenti' unvanını taşıdı ve seramikleriyle imparatorluğa ihracat yaptı. MS 6. yüzyıldaki deprem ve veba sonrası terk edildi.", "Titled 'first city of Pisidia', it exported fine tableware across the empire before earthquake and plague emptied it in the 6th century.", [
		"Antoninler Çeşmesi",
		"Yukarı Agora",
		"Tiyatro",
		"Heroon",
		"Roma Hamamı"
	], [
		"Antonine Nymphaeum",
		"Upper Agora",
		"Theatre",
		"Heroon",
		"Roman Baths"
	], "Restore edilen Antoninler Çeşmesi 1700 yıl sonra yeniden su akıtmaya başladı.", "The restored Antonine fountain flows again after 1,700 dry years.", ["İmparator Hadrianus", "Alexander Severus"], 7),
	s("troya", "Troya", "Troy", "marmara", "Çanakkale", "Çanakkale", 39.9575, 26.2389, [
		"Truva",
		"Helenistik",
		"Roma"
	], "MÖ 3000", "3000 BC", "listed", 400, "Homeros'un İlyada'sına konu olan, üst üste dokuz kentten oluşan efsanevi höyük.", "The legendary mound of nine superimposed cities behind Homer's Iliad.", "5000 yıl boyunca kesintisiz iskân gördü. Heinrich Schliemann'ın 1870'lerdeki kazıları efsaneyi arkeolojiyle buluşturdu ama katmanlara da zarar verdi.", "Occupied for 5,000 years, it was excavated by Heinrich Schliemann in the 1870s — proving the legend real while damaging its layers.", [
		"Kent surları",
		"Rampalı giriş",
		"Odeon",
		"Athena Tapınağı",
		"Truva atı replikası"
	], [
		"City walls",
		"Ramped gateway",
		"Odeon",
		"Temple of Athena",
		"Trojan horse replica"
	], "Höyükte dokuz farklı kent katmanı var; Homeros'un Truva'sı büyük olasılıkla Troya VI/VII.", "The mound holds nine city layers; Homer's Troy is most likely level VI/VII.", [
		"Homeros",
		"Priamos",
		"Hektor",
		"Schliemann"
	], 9, "mound"),
	s("assos", "Assos", "Assos", "marmara", "Çanakkale", "Çanakkale", 39.4894, 26.3372, [
		"Aiol",
		"Helenistik",
		"Roma"
	], "MÖ 7. yüzyıl", "7th century BC", "tentative", 200, "Ege'ye tepeden bakan Athena Tapınağı ve Aristoteles'in ders verdiği kent.", "A temple of Athena above the Aegean, and the city where Aristotle taught.", "Aristoteles üç yıl burada yaşayıp okul kurdu. Kent, andezit taşından surları ve limanıyla ünlüydü.", "Aristotle lived and taught here for three years. The city was known for its andesite walls and busy harbour.", [
		"Athena Tapınağı",
		"Antik liman",
		"Surlar",
		"Nekropol",
		"Agora"
	], [
		"Temple of Athena",
		"Ancient harbour",
		"City walls",
		"Necropolis",
		"Agora"
	], "Assos lahitlerinin cesetleri hızla çürüttüğüne inanılırdı; 'sarkophagos' (et yiyen) adı buradan gelir.", "Assos sarcophagi were believed to consume flesh — hence the word 'sarcophagus'.", [
		"Aristoteles",
		"Hermias",
		"Aziz Pavlus"
	], 7),
	s("kyzikos", "Kyzikos", "Cyzicus", "marmara", "Balıkesir", "Balıkesir", 40.3833, 27.8869, ["Miletos kolonisi", "Roma"], "MÖ 7. yüzyıl", "7th century BC", "tentative", 0, "Kapıdağ Yarımadası'nda, Hadrianus Tapınağı'yla anılan büyük Marmara kenti.", "A great Marmara city on the Kapıdağ peninsula, remembered for its Hadrian temple.", "Milet kolonisi olarak kurulan kent, elektrum sikkeleriyle Akdeniz ticaretinde standart oldu. Hadrianus Tapınağı antik çağda 'sekizinci harika' sayılıyordu.", "A Milesian colony whose electrum coins became a Mediterranean standard; its Temple of Hadrian was called the eighth wonder in antiquity.", [
		"Hadrianus Tapınağı",
		"Amfitiyatro",
		"Su kemerleri",
		"Liman kalıntıları"
	], [
		"Temple of Hadrian",
		"Amphitheatre",
		"Aqueducts",
		"Harbour remains"
	], "Kentin amfitiyatrosu Anadolu'daki sayılı gerçek amfitiyatrolardan biridir.", "Its amphitheatre is one of only a handful of true amphitheatres in Anatolia.", ["İmparator Hadrianus", "Kyzikos"], 5),
	s("nikaia", "Nikaia (İznik)", "Nicaea", "marmara", "Bursa", "Bursa", 40.4292, 29.7208, [
		"Helenistik",
		"Roma",
		"Bizans"
	], "MÖ 4. yüzyıl", "4th century BC", "tentative", 0, "Beş kilometrelik surları hâlâ ayakta olan, konsillerin toplandığı göl kenti.", "A lakeside city with 5 km of standing walls, host of the church councils.", "Büyük İskender'in generallerinden Antigonos tarafından kuruldu. MS 325'teki İznik Konsili burada toplandı; kent bir dönem Bizans'ın başkenti oldu.", "Founded by Alexander's general Antigonus, it hosted the Council of Nicaea in AD 325 and later served as a Byzantine capital.", [
		"Roma surları",
		"İstanbul Kapı",
		"Tiyatro",
		"Ayasofya (Orhan Camii)",
		"Göl bazilikası"
	], [
		"Roman walls",
		"Istanbul Gate",
		"Theatre",
		"Hagia Sophia (Orhan Mosque)",
		"Lake basilica"
	], "İznik Gölü'nün suyu altında MS 4. yüzyıla ait bir bazilika bulunuyor.", "A 4th-century basilica lies submerged beneath the waters of Lake İznik.", [
		"Antigonos",
		"İmparator Konstantin",
		"Lysimakhos"
	], 7),
	s("gordion", "Gordion", "Gordion", "ic-anadolu", "Ankara", "Ankara", 39.6511, 31.9931, [
		"Frig",
		"Pers",
		"Roma"
	], "MÖ 3. binyıl", "3rd millennium BC", "listed", 200, "Frig Krallığı'nın başkenti; Midas'ın tümülüsü ve Gordion Düğümü efsanesinin yurdu.", "Capital of Phrygia, home of the Midas tumulus and the Gordian Knot legend.", "Frig kralları burada yönetti; MÖ 8. yüzyılda Kral Midas döneminde zirveye ulaştı. Büyük İskender'in kılıcıyla kestiği düğüm bu kentteydi.", "Seat of the Phrygian kings, peaking under Midas in the 8th century BC. Here Alexander cut the knot that promised rule over Asia.", [
		"Midas Tümülüsü",
		"Kral Kapısı",
		"Megaron yapıları",
		"Sur sistemi"
	], [
		"Midas Tumulus",
		"King's Gate",
		"Megaron buildings",
		"Fortification system"
	], "Midas Tümülüsü dünyanın ayakta duran en eski ahşap mezar odasını barındırıyor.", "The Midas tumulus contains the oldest standing wooden chamber in the world.", [
		"Kral Midas",
		"Gordias",
		"Büyük İskender"
	], 8, "mound"),
	s("catalhoyuk", "Çatalhöyük", "Çatalhöyük", "ic-anadolu", "Konya", "Konya", 37.6667, 32.8264, ["Neolitik"], "MÖ 7400", "7400 BC", "listed", 100, "Sokaksız evleriyle dünyanın en eski kent yerleşimlerinden biri.", "One of the world's earliest urban settlements — a town without streets.", "Yaklaşık 8000 kişinin yaşadığı yerleşimde evlere çatıdan giriliyordu. Duvar resimleri ve ana tanrıça figürinleri tarih öncesi sanatın en önemli örnekleridir.", "Home to some 8,000 people who entered their houses through the roof. Its wall paintings and mother-goddess figurines are landmarks of prehistoric art.", [
		"Kuzey kazı alanı",
		"Deneysel ev",
		"Duvar resimleri",
		"Güney höyük"
	], [
		"North excavation shelter",
		"Experimental house",
		"Wall paintings",
		"South mound"
	], "Buradaki bir duvar resmi, dünyanın bilinen en eski haritası ve en eski volkan tasviri sayılıyor.", "A painting here is considered the world's oldest known map — and oldest volcano depiction.", ["James Mellaart", "Ana Tanrıça"], 8, "mound"),
	s("kultepe", "Kültepe (Kaniş-Karum)", "Kültepe (Kanesh)", "ic-anadolu", "Kayseri", "Kayseri", 38.8461, 35.6383, [
		"Hatti",
		"Asur",
		"Hitit"
	], "MÖ 3. binyıl", "3rd millennium BC", "tentative", 100, "Anadolu'nun ilk yazılı belgelerinin bulunduğu Asur ticaret kolonisi.", "The Assyrian trading colony that produced Anatolia's first written documents.", "Asurlu tüccarlar burada bir karum (ticaret mahallesi) kurdu. Bulunan 23 binden fazla çivi yazılı tablet Anadolu tarihinin yazılı başlangıcıdır.", "Assyrian merchants founded a karum here; over 23,000 cuneiform tablets found on site mark the beginning of written history in Anatolia.", [
		"Karum mahallesi",
		"Saray kalıntıları",
		"Tablet arşivleri",
		"Höyük"
	], [
		"Karum quarter",
		"Palace remains",
		"Tablet archives",
		"Mound"
	], "Tabletler arasında dünyanın bilinen en eski evlilik sözleşmelerinden biri de var.", "Among the tablets is one of the world's earliest known marriage contracts.", ["Anitta", "Asurlu tüccarlar"], 6, "mound"),
	s("tyana", "Tyana", "Tyana", "ic-anadolu", "Niğde", "Niğde", 37.8236, 34.6136, [
		"Hitit",
		"Roma",
		"Bizans"
	], "MÖ 2. binyıl", "2nd millennium BC", "none", 0, "Su kemerleri ve havuzuyla Kapadokya kapısındaki Roma kenti.", "A Roman city at the gate of Cappadocia, with aqueducts and a sacred pool.", "Geç Hitit kenti Tuwanuwa üzerine kuruldu. Roma döneminde Kapadokya'nın ikinci kenti oldu; filozof Apollonios burada doğdu.", "Built over the late Hittite town of Tuwanuwa, it became Cappadocia's second city under Rome. The philosopher Apollonius was born here.", [
		"Roma su kemeri",
		"Kaynak havuzu",
		"Mozaikler",
		"Höyük"
	], [
		"Roman aqueduct",
		"Spring pool",
		"Mosaics",
		"Mound"
	], "Kemerlerin taşıdığı su, kentin havuzunu 2000 yıl sonra hâlâ besliyor.", "The spring that fed the aqueduct still fills the city's pool today.", ["Apollonios", "Kral Warpalawas"], 5),
	s("hattusa", "Hattuşa", "Hattusa", "karadeniz", "Çorum", "Çorum", 40.0194, 34.6153, ["Hitit"], "MÖ 17. yüzyıl", "17th century BC", "listed", 200, "Hitit İmparatorluğu'nun başkenti; aslanlı kapıları ve kaya tapınağıyla ünlü.", "Capital of the Hittite Empire, famed for its lion gates and rock sanctuary.", "Anadolu'nun ilk büyük imparatorluğunu buradan yönetildi. Kentin arşivlerinde bulunan Kadeş Antlaşması dünyanın bilinen ilk yazılı barış antlaşmasıdır.", "Anatolia's first great empire was ruled from here. Its archives held the Treaty of Kadesh — the earliest known written peace treaty.", [
		"Aslanlı Kapı",
		"Kral Kapı",
		"Yerkapı tüneli",
		"Büyük Tapınak",
		"Yazılıkaya"
	], [
		"Lion Gate",
		"King's Gate",
		"Yerkapı tunnel",
		"Great Temple",
		"Yazılıkaya"
	], "Kadeş Antlaşması'nın bir kopyası BM binasının duvarında sergileniyor.", "A copy of the Treaty of Kadesh hangs on a wall at the United Nations.", [
		"III. Hattuşili",
		"II. Muvatalli",
		"Kraliçe Puduhepa"
	], 9),
	s("alacahoyuk", "Alacahöyük", "Alacahöyük", "karadeniz", "Çorum", "Çorum", 40.2306, 34.6944, ["Hatti", "Hitit"], "MÖ 4. binyıl", "4th millennium BC", "tentative", 100, "Sfenksli kapısı ve Hatti kral mezarlarıyla Anadolu'nun ilk kazı alanlarından biri.", "One of Anatolia's first excavation sites, with a sphinx gate and Hattian royal tombs.", "Cumhuriyet'in ilk arkeolojik kazısı burada yapıldı. Kral mezarlarından çıkan güneş kursları Anadolu uygarlıklarının simgesi oldu.", "The first excavation of the Turkish Republic took place here; the sun discs from its royal tombs became a symbol of Anatolian civilisation.", [
		"Sfenksli Kapı",
		"Hatti kral mezarları",
		"Hitit tapınağı",
		"Kabartmalar"
	], [
		"Sphinx Gate",
		"Hattian royal tombs",
		"Hittite temple",
		"Orthostat reliefs"
	], "Buradan çıkan güneş kursu uzun yıllar Ankara'nın simgesi olarak kullanıldı.", "The sun disc found here served for decades as the emblem of Ankara.", ["Atatürk", "Hatti kralları"], 6, "mound"),
	s("pompeiopolis", "Pompeiopolis", "Pompeiopolis", "karadeniz", "Kastamonu", "Kastamonu", 41.4383, 33.7772, ["Roma"], "MÖ 1. yüzyıl", "1st century BC", "none", 0, "Paphlagonia'nın Roma başkenti; mozaikli villalarıyla 'Karadeniz'in Zeugma'sı'.", "Roman capital of Paphlagonia, called the 'Zeugma of the Black Sea' for its mosaics.", "Pompeius tarafından kurulan kent bölgenin idari merkeziydi. Kazılarda ortaya çıkan Domus villası zengin mozaik döşemeleriyle dikkat çeker.", "Founded by Pompey as the regional capital; excavations revealed a Domus villa with rich mosaic floors.", [
		"Domus villası",
		"Mozaikler",
		"Hamam",
		"Sütunlu yapı"
	], [
		"Domus villa",
		"Mosaics",
		"Bath complex",
		"Colonnaded building"
	], "Kentin adı Roma generali Pompeius'tan gelir; bölgeyi MÖ 64'te düzenlemiştir.", "The city is named after Pompey the Great, who reorganised the region in 64 BC.", ["Pompeius"], 4),
	s("amastris", "Amastris (Amasra)", "Amastris", "karadeniz", "Bartın", "Bartın", 41.7469, 32.3861, [
		"Pers",
		"Helenistik",
		"Roma",
		"Bizans"
	], "MÖ 4. yüzyıl", "4th century BC", "tentative", 0, "İki koy arasındaki yarımadada kurulmuş, surları hâlâ kullanılan liman kenti.", "A harbour city on a peninsula between two bays, its walls still in daily use.", "Pers prensesi Amastris tarafından kuruldu. Roma ve Bizans dönemlerinde önemli bir liman olarak kaldı; Ceneviz surları kalıntılar üzerine eklendi.", "Founded by the Persian princess Amastris, it remained an important port through Roman and Byzantine times, later refortified by the Genoese.", [
		"Kuşkayası Yol Anıtı",
		"Roma surları",
		"Bedesten",
		"Liman"
	], [
		"Kuşkayası Road Monument",
		"Roman walls",
		"Bedesten",
		"Harbour"
	], "Kuşkayası'ndaki kaya kabartması Roma yol ağının bakım kaydı gibidir.", "The Kuşkayası rock relief functions as a maintenance record of the Roman road network.", ["Amastris", "Plinius"], 5),
	s("gobeklitepe", "Göbeklitepe", "Göbekli Tepe", "guneydogu", "Şanlıurfa", "Şanlıurfa", 37.2233, 38.9224, ["Neolitik"], "MÖ 9600", "9600 BC", "listed", 300, "Dünyanın bilinen en eski tapınak kompleksi; tarihi yeniden yazan T biçimli dikili taşlar.", "The world's oldest known temple complex — T-shaped pillars that rewrote history.", "Tarım devriminden bin yıllarca önce avcı-toplayıcılar tarafından inşa edildi. Bu keşif, 'önce yerleşim sonra tapınak' varsayımını tersine çevirdi.", "Built by hunter-gatherers millennia before agriculture, its discovery reversed the assumption that settlement preceded monumental religion.", [
		"A–D yapıları",
		"T biçimli dikilitaşlar",
		"Hayvan kabartmaları",
		"Koruma çatısı"
	], [
		"Enclosures A–D",
		"T-shaped pillars",
		"Animal reliefs",
		"Protective canopy"
	], "Stonehenge'den yaklaşık 6000, Giza piramitlerinden 7000 yıl daha eski.", "It predates Stonehenge by about 6,000 years and the pyramids of Giza by 7,000.", ["Klaus Schmidt"], 10, "sanctuary"),
	s("zeugma", "Zeugma", "Zeugma", "guneydogu", "Gaziantep", "Gaziantep", 37.0575, 37.8683, ["Helenistik", "Roma"], "MÖ 300", "300 BC", "tentative", 0, "Fırat kıyısındaki villa mozaikleriyle ünlü, 'Çingene Kızı'nın kenti.", "The Euphrates city of villa mosaics, home of the 'Gypsy Girl'.", "Seleukos I tarafından Fırat geçidinde kuruldu; Roma lejyonunun üssü oldu. Birecik Barajı'nın suları altında kalmadan önce olağanüstü mozaikler kurtarıldı.", "Founded by Seleucus I at a Euphrates crossing and later a Roman legionary base; extraordinary mosaics were rescued before the Birecik dam flooded the site.", [
		"Villa mozaikleri",
		"Roma evleri",
		"Kaya mezarları",
		"Zeugma Mozaik Müzesi"
	], [
		"Villa mosaics",
		"Roman houses",
		"Rock tombs",
		"Zeugma Mosaic Museum"
	], "'Çingene Kızı' mozaiği dünyanın en büyük mozaik müzesinde sergileniyor.", "The 'Gypsy Girl' mosaic is displayed in the world's largest mosaic museum.", ["Seleukos I", "Çingene Kızı"], 8),
	s("nemrut", "Nemrut Dağı", "Mount Nemrut", "guneydogu", "Adıyaman", "Adıyaman", 37.9806, 38.7411, ["Kommagene"], "MÖ 1. yüzyıl", "1st century BC", "listed", 300, "2150 metrede dev tanrı heykelleri ve kral mezar tümülüsü.", "Colossal god statues and a royal burial tumulus at 2,150 metres.", "Kommagene Kralı I. Antiokhos kendi hierotheionunu (kutsal mezar alanı) burada yaptırdı. Doğu ve Batı tanrılarını birleştiren heykeller depremlerle başlarından ayrıldı.", "King Antiochus I of Commagene built his hierotheion here. The statues, fusing eastern and western gods, lost their heads to earthquakes.", [
		"Doğu terası",
		"Batı terası",
		"Dev tanrı başları",
		"Tümülüs",
		"Aslanlı horoskop"
	], [
		"East terrace",
		"West terrace",
		"Colossal heads",
		"Tumulus",
		"Lion horoscope"
	], "Batı terasındaki aslan kabartması bilinen en eski yıldız haritalarından biridir.", "The lion relief on the west terrace is one of the oldest known star charts.", ["I. Antiokhos", "Mithridates"], 10, "monument"),
	s("harran", "Harran", "Harran", "guneydogu", "Şanlıurfa", "Şanlıurfa", 36.8636, 39.0311, [
		"Asur",
		"Babil",
		"Emevi"
	], "MÖ 3. binyıl", "3rd millennium BC", "tentative", 100, "Konik kubbeli evleri ve İslam dünyasının ilk üniversitesiyle bilinen kadim kent.", "An ancient city of beehive houses and the first university of the Islamic world.", "Ay tanrısı Sin kültünün merkeziydi ve bir ticaret kavşağıydı. Ortaçağda astronomi ve tıp çalışmalarının yürütüldüğü bir bilim merkezine dönüştü.", "A centre of the moon-god Sin and a caravan crossroads, it later became a hub of medieval astronomy and medicine.", [
		"Ulu Cami ve minare",
		"Harran Kalesi",
		"Kümbet evler",
		"Sur kapıları"
	], [
		"Great Mosque and minaret",
		"Harran Castle",
		"Beehive houses",
		"City gates"
	], "Konik kubbeli evler kerpiçten yapılır ve yazın içeriyi 10 derece serin tutar.", "The beehive houses are built of mudbrick and stay about 10°C cooler inside.", [
		"Hz. İbrahim",
		"Battani",
		"Cabir bin Hayyan"
	], 7),
	s("dara", "Dara", "Dara", "guneydogu", "Mardin", "Mardin", 37.1772, 40.9481, ["Bizans"], "MS 505", "AD 505", "tentative", 0, "Kayaya oyulmuş sarnıçları ve nekropolüyle Bizans'ın sınır garnizon kenti.", "A Byzantine frontier garrison with rock-cut cisterns and a monumental necropolis.", "İmparator Anastasius tarafından Sasani sınırında bir kale kent olarak kuruldu. Su sistemi ve zindanı mühendislik açısından dikkat çekicidir.", "Built by Emperor Anastasius as a fortress city on the Sasanian frontier; its water system and dungeon are engineering marvels.", [
		"Zindan",
		"Su sarnıçları",
		"Nekropol",
		"Su bendi",
		"Agora"
	], [
		"Dungeon",
		"Cisterns",
		"Necropolis",
		"Dam",
		"Agora"
	], "Devasa sarnıç kuşaklarca 'zindan' sanıldı; aslında kentin su deposuydu.", "The huge cistern was long mistaken for a dungeon — it was the city's water reservoir.", ["İmparator Anastasius", "Justinianus"], 6),
	s("ani", "Ani", "Ani", "dogu", "Kars", "Kars", 40.5075, 43.5725, [
		"Bagratlı",
		"Selçuklu",
		"Bizans"
	], "MS 5. yüzyıl", "5th century AD", "listed", 200, "'1001 kilise kenti'; Arpaçay vadisinin kenarındaki terk edilmiş ortaçağ başkenti.", "The 'city of 1001 churches', an abandoned medieval capital above the Arpaçay gorge.", "İpek Yolu üzerinde büyüyen kent 100 bin nüfusa ulaştı. Depremler ve ticaret yollarının değişmesiyle terk edildi.", "Grown on the Silk Road to some 100,000 people, it was abandoned after earthquakes and shifting trade routes.", [
		"Ani Katedrali",
		"Menuçehr Camii",
		"Surlar",
		"Ebul Menuçehr",
		"Kız Kalesi"
	], [
		"Ani Cathedral",
		"Menüçehr Mosque",
		"City walls",
		"Church of the Redeemer",
		"Maiden's Castle"
	], "Menuçehr Camii Anadolu'daki bilinen en eski Selçuklu camisi kabul edilir.", "The Menüçehr Mosque is regarded as the oldest known Seljuk mosque in Anatolia.", ["Alp Arslan", "Kral Gagik I"], 9),
	s("tuspa", "Tuşpa (Van Kalesi)", "Tushpa (Van Fortress)", "dogu", "Van", "Van", 38.5028, 43.3406, [
		"Urartu",
		"Roma",
		"Osmanlı"
	], "MÖ 9. yüzyıl", "9th century BC", "tentative", 100, "Van Gölü'ne bakan kayalık üzerinde Urartu Krallığı'nın başkenti.", "The Urartian capital on a rock ridge overlooking Lake Van.", "Kral Sarduri tarafından kurulan kent, Urartu'nun yönetim merkeziydi. Kayaya oyulmuş kral mezarları ve çivi yazılı yazıtlar hâlâ görülebilir.", "Founded by King Sarduri, it was Urartu's administrative heart; rock-cut royal tombs and cuneiform inscriptions survive.", [
		"Kral mezarları",
		"Sardur Burcu",
		"Çivi yazılı yazıtlar",
		"Eski Van şehri"
	], [
		"Royal tombs",
		"Sardur Bastion",
		"Cuneiform inscriptions",
		"Old Van city"
	], "Kalede Pers kralı Kserkses'in üç dilli yazıtı kayaya oyulmuş olarak bulunur.", "A trilingual inscription of the Persian king Xerxes is carved into the cliff here.", [
		"Sarduri I",
		"Kserkses",
		"Menua"
	], 7),
	s("cavustepe", "Çavuştepe", "Çavuştepe", "dogu", "Van", "Van", 38.2225, 43.6169, ["Urartu"], "MÖ 8. yüzyıl", "8th century BC", "tentative", 100, "Urartu kral sarayı, tapınağı ve hâlâ işleyen sulama kanalıyla bir kale kent.", "An Urartian fortress with royal palace, temple and an irrigation canal still in use.", "Kral II. Sarduri tarafından yaptırıldı. Kentin altındaki Şamran Kanalı 2700 yıldır tarlaları sulamaya devam ediyor.", "Built by King Sarduri II; the Şamran canal below the site has watered fields for 2,700 years.", [
		"Yukarı kale",
		"Haldi Tapınağı",
		"Saray mutfağı",
		"Şamran Kanalı"
	], [
		"Upper fortress",
		"Temple of Haldi",
		"Palace kitchen",
		"Şamran canal"
	], "Tapınağın cilalı bazalt blokları jilet gibi düzdür; harç kullanılmamıştır.", "The polished basalt blocks of the temple fit without mortar, smooth as glass.", ["II. Sarduri", "Haldi"], 5),
	s("arslantepe", "Arslantepe", "Arslantepe", "dogu", "Malatya", "Malatya", 38.3819, 38.3617, ["Geç Hitit", "Uruk"], "MÖ 6. binyıl", "6th millennium BC", "listed", 100, "Dünyanın bilinen en eski saraylarından birine ev sahipliği yapan höyük.", "A mound that holds one of the earliest known palaces in the world.", "Malatya ovasındaki höyük, devletin ve merkezî yönetimin doğuşunu belgeleyen katmanlar barındırır. Burada bulunan kılıçlar dünyanın en eski metal kılıçları arasındadır.", "Its layers document the birth of the state and centralised power; the swords found here are among the oldest metal swords known.", [
		"MÖ 4. binyıl sarayı",
		"Aslanlı kapı",
		"Duvar resimleri",
		"Koruma yapısı"
	], [
		"4th-millennium palace",
		"Lion gate",
		"Wall paintings",
		"Protective shelter"
	], "Buradaki mühür baskıları, yazıdan önceki bürokrasinin nasıl işlediğini gösteriyor.", "Seal impressions here show how bureaucracy worked before writing was invented.", ["Kral Tarhunza"], 6, "mound"),
	s("karahan-tepe", "Karahan Tepe", "Karahan Tepe", "guneydogu", "Şanlıurfa", "Şanlıurfa", 37.0925, 39.3036, ["Çanak Çömleksiz Neolitik"], "MÖ 10. binyıl", "10th millennium BC", "listed", 200, "Göbeklitepe'nin 'kardeş alanı' olarak bilinen, T biçimli dikilitaşları ve heykelleriyle Şanlıurfa'daki Çanak Çömleksiz Neolitik kutsal alan.", "A pre-pottery Neolithic sanctuary in Şanlıurfa, known as Göbekli Tepe's 'sister site' for its T-shaped pillars and sculptures.", "İlk olarak 1997'de Bahattin Çelik tarafından saptanan alan, 2019'dan itibaren Taş Tepeler Projesi kapsamında kazılmaktadır. MÖ 10.-9. binyıla tarihlenen anıtsal yapıları, avcı-toplayıcı toplulukların karmaşık inşaat ve tören örgütlenmesi kurabildiğini gösterir.", "First identified in 1997 by Bahattin Çelik, the site has been excavated since 2019 under the Taş Tepeler (Stone Hills) Project. Its monumental structures, dated to the 10th–9th millennium BC, show that hunter-gatherer communities could organize complex building and ritual work.", [
		"T biçimli dikilitaşlar",
		"dairesel kutsal yapılar",
		"kaya içi havuzlar",
		"antropomorfik heykeller",
		"taş oturma banklı yapı"
	], [
		"T-shaped pillars",
		"circular enclosures",
		"rock-cut basins",
		"anthropomorphic statues",
		"structure with stone bench"
	], "Bölge halkı alanı 'Keçilitepe' olarak adlandırır; 2023'te bulunan 2,3 metrelik oturan erkek heykeli, bilinen en eski gerçekçi insan heykellerinden biri sayılır.", "Locals call the site 'Keçilitepe', and the 2.3 m seated male statue found in 2023 is among the earliest realistic human sculptures known.", ["Bahattin Çelik", "Necmi Karul"], 7, "mound"),
	s("nevali-cori", "Nevali Çori", "Nevali Çori", "guneydogu", "Şanlıurfa", "Şanlıurfa", 37.5183, 38.6056, ["Çanak Çömleksiz Neolitik"], "MÖ 9. binyıl", "9th millennium BC", "none", 0, "Atatürk Barajı suları altında kalan, Fırat kıyısındaki Çanak Çömleksiz Neolitik yerleşim; kült yapısı ve taş baş heykelleriyle ünlüdür.", "A pre-pottery Neolithic settlement on the Euphrates now flooded by the Atatürk Dam reservoir, famous for its cult building and stone head sculptures.", "1983-1991 arasında Heidelberg Üniversitesi'nden Harald Hauptmann başkanlığında kurtarma kazılarıyla araştırıldı. MÖ 8400-8100'e tarihlenen yerleşimde, Göbeklitepe'dekine benzer T biçimli dikilitaşlı 'kült yapısı' ve dünyanın en eski evcilleştirilmiş kavuzlu buğday buluntuları ortaya çıkarıldı.", "Rescued between 1983 and 1991 by a University of Heidelberg team led by Harald Hauptmann. The settlement, dated c. 8400–8100 BC, yielded a 'cult building' with T-shaped pillars like those of Göbekli Tepe and the world's oldest domesticated einkorn wheat.", [
		"kült yapısı",
		"T biçimli dikilitaşlar",
		"dikdörtgen evler",
		"taş baş heykeller",
		"fırınlı açık alan"
	], [
		"cult building",
		"T-shaped pillars",
		"rectangular houses",
		"stone head statues",
		"open area with ovens"
	], "Alandan kurtarılan insan başı kabartmalı taşlar ve 'Nevali Çori Steli' olarak bilinen dikilitaş, günümüzde Şanlıurfa Müzesi'nde sergilenmektedir.", "The salvaged stone heads and the stele known as the 'Nevali Çori Stela' are today displayed in the Şanlıurfa Museum.", ["Harald Hauptmann"], 4, "mound"),
	s("asikli-hoyuk", "Aşıklı Höyük", "Aşıklı Höyük", "ic-anadolu", "Aksaray", "Aksaray", 38.3489, 34.23, ["Çanak Çömleksiz Neolitik"], "MÖ 9.-8. binyıl", "9th–8th millennium BC", "none", 0, "Aksaray yakınlarında, dünyanın bilinen en eski evcilleştirilmiş koyunlarına ve kalıp kerpiç mimariye ev sahipliği yapan Çanak Çömleksiz Neolitik höyük.", "A pre-pottery Neolithic mound near Aksaray that has yielded the world's earliest domesticated sheep and moulded mudbrick architecture.", "MÖ 8200-7500 arasında yaklaşık bin yıl kesintisiz iskân gören yerleşim, 1989'dan itibaren İstanbul Üniversitesi tarafından kazılmaktadır. Kalıp kerpiç duvarlı evleri, düzenli sokak dokusu ve koyun evcilleştirmesi, Anadolu'da yerleşik yaşamın en erken örneklerinden birini oluşturur.", "Occupied almost continuously for about a millennium between c. 8200 and 7500 BC, the site has been excavated since 1989 by Istanbul University. Its moulded mudbrick houses, planned streets and sheep domestication make it one of the earliest examples of sedentary life in Anatolia.", [
		"kalıp kerpiç evler",
		"fırınlar ve ocaklar",
		"düzenli sokak dokusu",
		"çöp çukurları ve mezarlar",
		"köy planlı yerleşim"
	], [
		"moulded mudbrick houses",
		"ovens and hearths",
		"regular street layout",
		"trash pits and burials",
		"village-planned settlement"
	], "Aşıklı'da bulunan en eski evcilleştirilmiş koyun kemikleri, koyunun günümüz Türkiye topraklarında evcilleştirildiğine dair en güçlü kanıtlardan biridir.", "The earliest domesticated sheep bones found at Aşıklı are among the strongest pieces of evidence that sheep were domesticated in present-day Turkey.", ["Ufuk Esin", "Mihriban Özbaşaran"], 5, "mound"),
	s("acemhoyuk", "Acemhöyük", "Acemhöyük", "ic-anadolu", "Aksaray", "Aksaray", 38.4116, 33.8355, ["Asur", "Hitit"], "MÖ 3.-2. binyıl", "3rd–2nd millennium BC", "none", 0, "Aksaray'da Asur Ticaret Kolonileri Çağı'nın en zengin merkezlerinden biri; saray yapıları ve fildişi eserleriyle tanınan höyük.", "A mound near Aksaray that was one of the richest centres of the Assyrian Trade Colonies period, renowned for its palaces and ivory artefacts.", "Antik Puruşhanda (Purušḫanda) olduğu düşünülen höyükte MÖ 3000 başlarından itibaren yerleşim vardır; en parlak dönemi MÖ 1950-1750 arasındaki Asur Ticaret Kolonileri Çağı'dır. Anıtsal 'Saray' ve 'Hatipler Sarayı' yapılarıyla Kültepe ile çağdaş bir ticaret ve yönetim merkeziydi.", "Likely ancient Purušhanda (Purušḫanda), the mound was inhabited from the early 3rd millennium BC and reached its peak during the Assyrian Trade Colonies period (c. 1950–1750 BC). With monumental buildings such as the 'Saray' and 'Hatipler Sarayı', it was a trade and administration centre contemporary with Kültepe.", [
		"Saray",
		"Hatipler Sarayı",
		"anıtsal sur duvarları",
		"depo odaları",
		"fildişi işlik alanı"
	], [
		"the Palace",
		"Hatipler Palace",
		"monumental fortification walls",
		"storage rooms",
		"ivory workshop area"
	], "Höyükte bulunan üzeri lapis lazuli, tunç ve demirle süslü fildişi kutu, Anadolu'nun en erken dönem lüks eşya zanaatkârlığının örneklerindendir.", "An ivory box inlaid with lapis lazuli, bronze and iron found at the mound is among the finest examples of early luxury craftsmanship in Anatolia.", ["Nimet Özgüç", "Tahsin Özgüç"], 4, "mound"),
	s("sapinuwa", "Şapinuva", "Sapinuwa", "ic-anadolu", "Çorum", "Çorum", 40.255, 35.236, ["Hitit"], "MÖ 14. yüzyıl", "14th century BC", "tentative", 0, "Çorum'un Ortaköy ilçesinde, binlerce çivi yazılı tabletin çıktığı Hitit kutsal şehri ve krali ikametgâh.", "A Hittite religious and administrative city at Ortaköy, Çorum, that has produced thousands of cuneiform tablets.", "1990'dan beri Aygül ve Mustafa Süel başkanlığında kazılan kent, MÖ 14. yüzyılda II. Tuthaliya döneminde krali ikametgâh olarak hizmet verdi. Yaklaşık 9 km²'lik alanıyla Yakın Doğu'nun en büyük kentlerinden biriydi; binlerce tablet bir yangında pişerek günümüze ulaştı.", "Excavated since 1990 under Aygül and Mustafa Süel, the city served as a royal residence during the reign of Tudhaliya II in the 14th century BC. With an area of about 9 km² it was one of the largest cities of the ancient Near East, and thousands of tablets survived after being baked in a fire.", [
		"A Yapısı (arşiv binası)",
		"B Yapısı (depo)",
		"Yazılıkaya üsluplu orto statlı yapı",
		"dini tören alanları",
		"üst ve alt şehir"
	], [
		"Building A (archive building)",
		"Building B (storehouse)",
		"building with Yazılıkaya-style orthostat",
		"ritual areas",
		"upper and lower city"
	], "A Yapısı'ndan çıkarılan 3.000'i aşkın tablet ve parça Hititçe, Hurrice ve Akadça gibi dillerde yazılmış olup aralarında çok sayıda Hurrice arınma ritüeli metni vardır.", "Over 3,000 tablets and fragments from Building A are written in Hittite, Hurrian, Akkadian and other languages, including many Hurrian purification rituals.", ["II. Tuthaliya", "Aygül Süel"], 4),
	s("midas", "Midas Anıtı (Yazılıkaya)", "Midas Monument (Yazılıkaya)", "ic-anadolu", "Eskişehir", "Eskişehir", 39.2003, 30.7138, ["Frig"], "MÖ 8.-6. yüzyıl", "8th–6th century BC", "tentative", 100, "Eskişehir'in Han ilçesinde, 17 metrelik dev Midas Anıtı ile ünlü Frig açık hava kutsal alanı ve kaya kenti.", "A Phrygian open-air sanctuary and rock-cut city in Han district, Eskişehir, famous for the 17 m-high Midas Monument.", "Friglerin ana tanrıçası Matar (Kibele) için MÖ 6. yüzyılda kayaya oyulan anıt, 1800'de William Martin Leake tarafından keşfedildi. Cephedeki Frigce yazıtta geçen 'Midai' adı nedeniyle 'Midas Anıtı' olarak anılır ve bölge 'Midas Şehri' diye bilinir.", "Carved into the rock in the 6th century BC for the Phrygian Mother Goddess Matar (Cybele), the monument was rediscovered in 1800 by William Martin Leake. The word 'Midai' in its Phrygian inscription gave the monument its name, and the surrounding plateau is called 'Midas City'.", [
		"Midas Anıtı (Yazılıkaya)",
		"Kral Sunağı",
		"kaya mezarları",
		"dev sarnıçlar",
		"bitmemiş anıt"
	], [
		"Midas Monument (Yazılıkaya)",
		"King's Altar",
		"rock-cut tombs",
		"great cisterns",
		"unfinished monument"
	], "Cephedeki 'Midas' sözcüğü efsanevi kralın değil, Frig ana tanrıçası Matar'ın bir sıfatıdır; anıt bir mezar değil, tanrıça heykelinin konduğu açık hava tapınağıdır.", "The word 'Midas' in the inscription is not the legendary king but an epithet of the Phrygian Mother Goddess Matar; the monument was an open-air temple for her statue, not a tomb.", [
		"Kral Midas",
		"Matar (Kibele)",
		"William Martin Leake"
	], 6, "monument"),
	s("altintepe", "Altıntepe", "Altıntepe", "dogu", "Erzincan", "Erzincan", 39.6964, 39.6467, ["Urartu"], "MÖ 9.-7. yüzyıl", "9th–7th century BC", "none", 100, "Erzincan'ın Üzümlü ilçesinde, apadanalı sarayı ve açık hava tapınağıyla Urartu dönemine ait kale kenti.", "An Urartian fortress city in Üzümlü district, Erzincan, with an apadana palace and an open-air temple.", "Fırat'a bakan 60 metre yüksekliğindeki volkanik tepede MÖ 9.-7. yüzyıllarda kurulan kale, 1959-1968 arasında Tahsin Özgüç tarafından kazıldı. Saray-apadana, büyük salon, depo odaları ve çok odalı kaya mezarları, Urartu mimarisinin önemli örneklerini sunar.", "Built on a 60 m volcanic hill overlooking the Euphrates in the 9th–7th century BC, the fortress was excavated by Tahsin Özgüç between 1959 and 1968. Its apadana-palace, great hall, storehouses and multi-roomed rock-cut tombs are key examples of Urartian architecture.", [
		"apadanalı saray",
		"açık hava tapınağı",
		"büyük salon",
		"depo odaları",
		"kaya mezarları"
	], [
		"apadana palace",
		"open-air temple",
		"great hall",
		"storehouses",
		"rock-cut chamber tombs"
	], "Altıntepe'de bulunan Urartu duvar resmi parçaları, Urartu krallığında saray duvar resminin bilinen en önemli örnekleri arasındadır.", "Fragments of Urartian wall painting found at Altıntepe are among the most important known examples of palace wall painting in the Urartian kingdom.", ["Sarduri II", "Tahsin Özgüç"], 5),
	s("ayanis", "Ayanis Kalesi", "Ayanis Fortress", "dogu", "Van", "Van", 38.7083, 43.2111, ["Urartu"], "MÖ 7. yüzyıl", "7th century BC", "tentative", 0, "Van Gölü'nün doğu kıyısında, Kral II. Rusa tarafından yaptırılan ve iyi korunmuş Haldi Tapınağı ile günümüze ulaşan Urartu kalesi.", "An Urartian fortress built by King Rusa II on the eastern shore of Lake Van, famous for its exceptionally well-preserved Temple of Haldi.", "MÖ 673/2 civarında II. Rusa tarafından 'Eiduru Dağı'nın önündeki Rusahinili' adıyla kurulan kale, kısa ömrünün ardından deprem ve yangınla terk edildi. Çöken yapılar kaleyi âdeta mühürlediği için tapınak duvarları, yazıtlar ve bronz silahlar olağanüstü korunmuştur.", "Founded around 673/2 BC by Rusa II as 'Rusahinili opposite Mount Eiduru', the fortress was abandoned after an earthquake and fire in the mid-7th century BC. Because the collapse effectively sealed the site, its temple walls, inscriptions and bronze weapons are remarkably preserved.", [
		"Haldi Tapınağı",
		"sütunlu salon",
		"depo odaları",
		"andezit sur duvarları",
		"inşa yazıtı"
	], [
		"Temple of Haldi",
		"colonnaded hall",
		"storage magazines",
		"andesite city walls",
		"foundation inscription"
	], "Tapınağın cephesinde Urartu'nun en uzun yazıtlarından biri bulunur; 1997'de ele geçen aslan başlı tunç kalkan, bu türden ilk kazı buluntusudur.", "One of the longest Urartian inscriptions survives on the temple façade, and the lion-headed bronze shield found in 1997 is the first example of its kind ever recovered in excavation.", [
		"II. Rusa",
		"Haldi",
		"Altan Çilingiroğlu"
	], 5),
	s("kaunos", "Kaunos Antik Kenti", "Ancient City of Kaunos", "ege", "Muğla", "Muğla", 36.8264, 28.6214, ["Karya", "Likya"], "MÖ 10. yüzyıl", "10th century BC", "tentative", 200, "Dalyan'ın karşısında, Karya ile Likya sınırındaki liman kenti; uçuruma oyulmuş ünlü kaya mezarlarıyla tanınır.", "A harbour city on the Carian-Lycian border opposite Dalyan, famed for its impressive rock-cut tombs.", "MÖ 10. yüzyılda kurulan Kaunos, iki limanlı önemli bir ticaret kentiydi ve Pers, Rodos ve Roma egemenliği altında yaşadı. Dalyan Çayı'nın getirdiği alüvyonlar limanlarını doldurunca denizle bağlantısını kaybetti. Sıtma salgını nedeniyle 15. yüzyılda tamamen terk edildi.", "Founded in the 10th century BC, Kaunos was an important trading city with two harbours, ruled in turn by the Persians, Rhodes and Rome. Siltation of the Dalyan river filled its harbours and cut it off from the sea. A malaria epidemic led to its abandonment in the 15th century AD.", [
		"Tiyatro",
		"Kaya Mezarları",
		"Agora",
		"Roma Hamamı",
		"Bizans Kilisesi"
	], [
		"Theatre",
		"Rock-cut Tombs",
		"Agora",
		"Roman Baths",
		"Byzantine Church"
	], "Uçurum yüzeyinde yaklaşık 150 kaya mezarı kazılmıştır; bunlardan tapınak cepheli olanları MÖ 4. yüzyıla tarihlenir ve Likya etkisi taşır.", "Around 150 rock-cut tombs are carved into the cliff face; the temple-fronted ones date to the 4th century BC and show Lycian influence.", [
		"Protogenes",
		"Zeno",
		"Mausolos"
	], 6),
	s("stratonikeia", "Stratonikeia Antik Kenti", "Ancient City of Stratonikeia", "ege", "Muğla", "Muğla", 37.3136, 28.0645, ["Karia", "Roma"], "MÖ 3. yüzyıl", "3rd century BC", "tentative", 100, "Yatağan'daki Eskihisar'da yer alan, mermerden inşa edilmiş 'Gladyatörler Şehri'.", "The 'City of Gladiators' at Eskihisar near Yatağan, a vast ancient city built of marble.", "Hitit döneminde Atriya olarak bilinen yerleşim, MÖ 281'den sonra Seleukos kralı I. Antiokhos tarafından eşi Stratonike adına yeniden adlandırıldı. Hellenistik ve Roma dönemlerinde önemli bir Karia kenti olan Stratonikeia, Roma döneminde ünlü gladyatör okuluna ev sahipliği yaptı. Bizans, Beylikler ve Osmanlı dönemlerinde de kesintisiz iskan edildi.", "The settlement, known as Atriya in Hittite times, was renamed after Stratonike, the wife of the Seleucid king Antiochus I, after 281 BC. A major Carian city in the Hellenistic and Roman periods, it housed a renowned gladiator school under Rome. It remained continuously inhabited through the Byzantine, Beylik and Ottoman periods.", [
		"Tiyatro",
		"Serapeion",
		"Gymnasium",
		"Kuzey Kent Kapısı",
		"Sur Duvarları"
	], [
		"Theatre",
		"Serapeum",
		"Gymnasium",
		"North City Gate",
		"City Walls"
	], "Kentin dev tiyatrosunda gladyatör gösterileri düzenlendiği için kent 'Gladyatörler Şehri' olarak anılır.", "The city is nicknamed the 'City of Gladiators' because gladiatorial games were held in its huge theatre.", [
		"Stratonike",
		"I. Antiokhos",
		"Hekate"
	], 5),
	s("labraunda", "Labraunda (Zeus Labraundos Kutsal Alanı)", "Labraunda (Sanctuary of Zeus Labraundos)", "ege", "Muğla", "Muğla", 37.4189, 27.8203, ["Karya"], "MÖ 7. yüzyıl", "7th century BC", "none", 100, "Latmos Dağları'nda, Mylasa'ya kutsal yolla bağlı, Karyalıların Zeus Labraundos kutsal alanı.", "The mountain sanctuary of Zeus Labraundos high in the Latmos mountains, linked to Mylasa by a sacred road.", "Kutsal alanın en eski buluntuları MÖ 600'lere uzanır. MÖ 4. yüzyılda Hekatomnid hanedanından Mausolos ve kardeşi Idrieus, Zeus Tapınağı, andronlar, stoalar ve propylonlarla alanı görkemli bir kült merkezine dönüştürdü. Kutsal alan Roma döneminde de yaşamaya devam etti ve Bizans döneminde bir kilise eklenene kadar kült sürdü.", "The earliest finds at the sanctuary date to around 600 BC. In the 4th century BC the Hecatomnid rulers Mausolus and his brother Idrieus transformed it into a splendid cult centre with the Temple of Zeus, androns, stoas and propylaia. The sanctuary continued in use in Roman times, and the cult lasted until a Byzantine church was built on the site.", [
		"Zeus Tapınağı",
		"Andron A",
		"Andron B",
		"Güney Propylon",
		"Oikoi Binası"
	], [
		"Temple of Zeus",
		"Andron A",
		"Andron B",
		"South Propylon",
		"Oikoi Building"
	], "Zeus Labraundos, sağ elinde çift başlı balta (labrys) tutarken betimlenirdi; 'labirent' sözcüğü de bu balta adıyla aynı köktendir.", "Zeus Labraundos was depicted holding a double-headed axe (labrys); the word 'labyrinth' shares the same root.", [
		"Zeus Labraundos",
		"Mausolos",
		"Idrieus"
	], 3, "sanctuary"),
	s("magnesia", "Magnesia ad Maeandrum Antik Kenti", "Ancient City of Magnesia ad Maeandrum", "ege", "Aydın", "Aydın", 37.8529, 27.5268, ["İon", "Roma"], "MÖ 5. yüzyıl", "5th century BC", "none", 100, "Mimarlık tarihinde örnek gösterilen Artemis Leukophryene Tapınağı ile ünlü İon kenti.", "An Ionian city famed for the Temple of Artemis Leukophryene, a landmark of ancient architectural design.", "Thessalia'dan gelen Magnetler tarafından kurulan kent, MÖ 400 civarında Lethaios (Gümüşçay) kıyısındaki yeni yerine taşındı. Hellenistik dönemde Seleukos ve Pergamon Krallığı'nın egemenliğinde altın çağını yaşadı, Roma döneminde bağımsız bir kentti. 1891'de Carl Humann tarafından kazılan kent, günümüzde de kazılmaya devam etmektedir.", "Founded by Magnetes from Thessaly, the city was moved around 400 BC to a new site on the Lethaios river. It reached its golden age under the Seleucids and the Kingdom of Pergamon and was an independent city in the Roman period. Excavated by Carl Humann in 1891, the site is still being excavated today.", [
		"Artemis Leukophryene Tapınağı",
		"Tiyatro",
		"Agora",
		"Zeus Tapınağı",
		"Stadyum"
	], [
		"Temple of Artemis Leukophryene",
		"Theatre",
		"Agora",
		"Temple of Zeus",
		"Stadium"
	], "Hermogenes'in pseudodipteros planlı Artemis Tapınağı, Roma dönemi mimar Vitruvius tarafından örnek alınan bir plan şeması olarak gösterilmiştir.", "Hermogenes' pseudodipteral Temple of Artemis established a plan type that the Roman architect Vitruvius cited as a model.", [
		"Hermogenes",
		"Artemis Leukophryene",
		"Themistokles"
	], 4),
	s("teos", "Teos Antik Kenti", "Ancient City of Teos", "ege", "İzmir", "İzmir", 38.1772, 26.785, ["İon", "Roma"], "MÖ 11. yüzyıl", "11th century BC", "none", 100, "Seferihisar'daki İon kenti; antik dünyanın en büyük Dionysos Tapınağı'na ev sahipliği yapmıştır.", "An Ionian city at Seferihisar, home to the largest Temple of Dionysos in the ancient world.", "MÖ 11-10. yüzyılda kurulan Teos, İon Birliği'nin on iki kentinden biriydi. MÖ 6. yüzyılda Pers egemenliğine giren kent, MÖ 543'te kentlilerin bir kısmı Abdera'yı kurdu. Hellenistik dönemde Pergamon Krallığı'na bağlanan kent, MÖ 3. yüzyıl sonlarında Dionysos Sanatçıları Birliği'ne ev sahipliği yaptı ve Roma döneminde önemini korudu.", "Founded in the 11th–10th century BC, Teos was one of the twelve cities of the Ionian League. Falling to Persia in the 6th century BC, some citizens fled to found Abdera in 543 BC. In the Hellenistic period the city came under Pergamon and hosted the Guild of Dionysiac Artists in the late 3rd century BC, keeping its importance in Roman times.", [
		"Dionysos Tapınağı",
		"Tiyatro",
		"Odeion",
		"Bouleuterion",
		"Agora"
	], [
		"Temple of Dionysos",
		"Theatre",
		"Odeon",
		"Bouleuterion",
		"Agora"
	], "Dionysos Sanatçıları Birliği (Technitai Dionysou), aktör, şair ve müzisyenlerden oluşan antik dünyanın ilk profesyonel sanatçı örgütüydü.", "The Guild of Dionysiac Artists (Technitai Dionysou) was the ancient world's first professional union of actors, poets and musicians.", [
		"Dionysos",
		"Anakreon",
		"Hermogenes"
	], 4),
	s("klazomenai", "Klazomenai Antik Kenti", "Ancient City of Klazomenai", "ege", "İzmir", "İzmir", 38.3614, 26.7703, ["İon"], "MÖ 4. binyıl (Liman Tepe); MÖ 8. yüzyıl (kent)", "4th millennium BC (Liman Tepe); 8th century BC (city)", "none", 30, "Urla'daki İon kenti; filozof Anaksimandros'un doğum yeri ve erken dönem endüstriyel zeytinyağı üretiminin merkezi.", "An Ionian city at Urla; birthplace of the philosopher Anaximander and a centre of early industrial olive oil production.", "Liman Tepe'deki yerleşim MÖ 4. binyıla kadar uzanır. MÖ 5. yüzyılda Perslerden çekinen kent halkı karadaki şehri terk edip Karantina Adası'na taşındı. MÖ 6. yüzyılda ilk gümüş sikkelerden bazılarını basan kent, gelişmiş zeytinyağı atölyeleri kurdu ve Büyük İskender adayı karaya bir yol ile bağladı.", "Settlement at Liman Tepe dates back to the 4th millennium BC. In the 5th century BC, fearing the Persians, the inhabitants left the mainland city and moved to Karantina Island. The city struck some of the earliest silver coins in the 6th century BC, ran advanced olive oil workshops, and Alexander the Great later linked the island to the mainland by a causeway.", [
		"Zeytinyağı Atölyesi",
		"Tiyatro",
		"Tapınak",
		"Liman Tepe Höyüğü",
		"Karantina Adası Akropolü"
	], [
		"Olive Oil Workshop",
		"Theatre",
		"Temple",
		"Liman Tepe Mound",
		"Karantina Island Acropolis"
	], "MÖ 6. yüzyıla tarihlenen zeytinyağı atölyesi, kayaya oyulmuş 15 çukuruyla endüstriyel ölçekli zeytinyağı üretiminin en erken kanıtlarından biridir.", "The 6th-century BC olive oil workshop, with 15 rock-cut pits, is among the earliest evidence of industrial-scale olive oil production.", [
		"Anaksimandros",
		"Anaksagoras",
		"Hermotimos"
	], 3),
	s("klaros", "Klaros (Apollon Kutsal Alanı)", "Klaros (Sanctuary of Apollo)", "ege", "İzmir", "İzmir", 38.0047, 27.1928, ["İon", "Roma"], "MÖ 13. yüzyıl", "13th century BC", "none", 0, "Kolophon'a bağlı, Delphi ve Didyma ile rekabet eden Apollon'un ünlü kehanet merkezi.", "The renowned oracular sanctuary of Apollo, belonging to Kolophon and rivalling Delphi and Didyma.", "Kutsal alanın kuruluşu geleneksel olarak MÖ 13. yüzyıla kadar uzanır. Apollon'un Dor düzenindeki kehanet tapınağı MÖ 3. yüzyılda inşa edilmeye başlandı ve Hadrianus döneminde tamamlandı; kehanet merkezi MS 4. yüzyıla kadar işledi. Kutsal alan, Notion'a 2 km'lik kutsal bir yolla bağlıydı ve yüzyıllarca alüvyon altında kalarak günümüze çok iyi korunarak ulaştı.", "Tradition dates the sanctuary's foundation to the 13th century BC. The Doric oracular temple of Apollo was begun in the 3rd century BC and completed under Hadrian; the oracle operated until the 4th century AD. Linked to Notion by a 2 km sacred road, the sanctuary lay buried under alluvium for centuries and survives exceptionally well preserved.", [
		"Apollon Tapınağı",
		"Artemis Sunağı",
		"Propylon",
		"Kehanet Mahzeni (Krypta)",
		"Kutsal Yol"
	], [
		"Temple of Apollo",
		"Altar of Artemis",
		"Propylon",
		"Oracular Crypt (Adyton)",
		"Sacred Way"
	], "Tapınak hücresinde 8 metre yüksekliğindeki Apollon, Artemis ve Leto kült heykelleri yerinde durur; kutsal alanda yüz hayvanın bağlandığı 'hekatomb' bloğu bulunur.", "Eight-metre-high cult statues of Apollo, Artemis and Leto still stand in place in the temple cella, and the sanctuary contains the 'hekatomb' block used to tether a hundred sacrificial animals.", [
		"Apollon Clarius",
		"Artemis",
		"Leto"
	], 3, "sanctuary"),
	s("aizanoi", "Aizanoi Antik Kenti", "Aizanoi Ancient City", "ege", "Kütahya", "Kütahya", 39.2006, 29.6128, ["Roma", "Frig"], "MÖ 3. binyıldan itibaren iskân; parlak dönem MS 2. yüzyıl", "Inhabited since the 3rd millennium BC; golden age in the 2nd century AD", "tentative", 100, "Kütahya'nın Çavdarhisar ilçesindeki Aizanoi, Anadolu'nun en iyi korunmuş Zeus Tapınağı ile ünlü Roma kentidir.", "Aizanoi in Çavdarhisar, Kütahya, is a Roman city famous for the best-preserved Temple of Zeus in Anatolia.", "Aizanoi'nin tarihi Erken Tunç Çağı'na kadar uzanır; kent Helenistik dönemde Frig bölgesinde önemli bir merkez haline geldi. Roma döneminde, özellikle MS 2. yüzyılda en parlak çağını yaşadı ve Zeus Tapınağı ile tiyatro-stadyum kompleksi bu dönemde inşa edildi. Kent aynı zamanda bilinen en eski antik borsa (macellum) binasına ev sahipliği yaptı.", "Aizanoi's history reaches back to the Early Bronze Age, and the city became an important centre in the Phrygian region during the Hellenistic period. Under Rome, especially in the 2nd century AD, it enjoyed its golden age, when the Temple of Zeus and the theatre-stadium complex were built. It also housed the earliest known ancient stock exchange (macellum) building.", [
		"Zeus Tapınağı",
		"Tiyatro-Stadyum Kompleksi",
		"Antik Borsa (Macellum)",
		"Penkalas Köprüsü",
		"Roma Hamamı"
	], [
		"Temple of Zeus",
		"Theatre-Stadium Complex",
		"Ancient Stock Exchange (Macellum)",
		"Penkalas Bridge",
		"Roman Baths"
	], "Aizanoi'deki macellum, üzerine kazınmış enflasyon fiyat listesiyle dünyanın ilk borsa binası olarak kabul edilir.", "The macellum at Aizanoi is considered the world's first stock exchange building, bearing an inscribed inflation price list.", [
		"Zeus",
		"Kybela (Cybele)",
		"Hadrian"
	], 7),
	s("letoon", "Letoon Kutsal Alanı", "Letoon Sanctuary", "akdeniz", "Muğla", "Muğla", 36.3268, 29.2976, ["Likya", "Roma"], "MÖ 6. yüzyıl – MS 4. yüzyıl", "6th century BC – 4th century AD", "listed", 100, "Xanthos ile birlikte UNESCO Dünya Mirası listesinde yer alan Letoon, Leto ile ikizleri Apollon ve Artemis'e adanmış Likya'nın kutsal alanıdır.", "Letoon, a Lycian sanctuary dedicated to Leto and her twins Apollo and Artemis, is listed together with Xanthos as a UNESCO World Heritage Site.", "Letoon, Likya'nın federal kutsal alanıydı ve Likya Birliği'nin dinî ile siyasi kararlarının halka duyurulduğu yerdi. MÖ 4. yüzyılda Leto, Artemis ve Apollon tapınakları inşa edildi; MÖ 337'ye tarihlenen ünlü üç dilli yazıt (Likçe, Grekçe, Aramice) burada bulundu. Erken Hristiyanlık döneminde kutsal alan terk edilmeye başlandı.", "Letoon was the federal sanctuary of Lycia, where the religious and political decisions of the Lycian League were proclaimed. In the 4th century BC temples to Leto, Artemis and Apollo were built, and the famous trilingual inscription of 337 BC in Lycian, Greek and Aramaic was found here. The sanctuary was gradually abandoned in the Early Christian period.", [
		"Leto Tapınağı",
		"Apollon Tapınağı",
		"Artemis Tapınağı",
		"Hadrian Nymphaeumu",
		"Üç Dilli Yazıt"
	], [
		"Temple of Leto",
		"Temple of Apollo",
		"Temple of Artemis",
		"Hadrianic Nymphaeum",
		"Trilingual Inscription"
	], "Letoon'da bulunan MÖ 337 tarihli üç dilli yazıt, Likya dilinin çözülmesinde kilit rol oynadı.", "The 337 BC trilingual inscription found at Letoon was key to deciphering the Lycian language.", [
		"Leto",
		"Apollon",
		"Artemis"
	], 6, "sanctuary"),
	s("limyra", "Limyra Antik Kenti", "Limyra Ancient City", "akdeniz", "Antalya", "Antalya", 36.339, 30.169, ["Likya", "Roma"], "MÖ 5. yüzyıl – MS 6. yüzyıl", "5th century BC – 6th century AD", "tentative", 50, "Antalya'nın Finike ilçesindeki Limyra, Likya kralı Perikles'in anıt mezarı, Roma tiyatrosu ve Kaineus kabartmasıyla tanınan Likya kentidir.", "Limyra in Finike, Antalya, is a Lycian city known for the tomb monument of Pericles of Limyra, a Roman theatre and the Kaineus relief.", "Limyra, Likya yazıtlarında 'Zemuri' adıyla anılır ve MÖ 4. yüzyılın ilk yarısında Kral Perikles döneminde Likya'nın başkenti oldu. Roma döneminde yeniden canlanan kent, MS 141 depreminde büyük hasar gördü ve Bizans döneminde piskoposluk merkezi olarak varlığını sürdürdü.", "Known as 'Zemuri' in Lycian inscriptions, Limyra became the capital of Lycia in the first half of the 4th century BC under King Pericles. Revived under Roman rule, the city was badly damaged by the earthquake of AD 141 and continued to exist as a bishopric in the Byzantine period.", [
		"Perikles Heroonu",
		"Roma Tiyatrosu",
		"Kaineus Kabartması",
		"Gaius Caesar Anıtı",
		"Kaya Mezarları"
	], [
		"Pericles Heroon",
		"Roman Theatre",
		"Kaineus Relief",
		"Monument of Gaius Caesar",
		"Rock-cut Tombs"
	], "Limyra'daki Kaineus kabartması, mızraklarla yere çakılan kahraman Kaineus'un hikâyesini canlandıran en ünlü antik betimdir.", "The Kaineus relief at Limyra is the most famous ancient depiction of the hero Kaineus, who was pinned into the ground with spears.", [
		"Perikles",
		"Gaius Caesar",
		"Kaineus"
	], 6),
	s("arykanda", "Arykanda Antik Kenti", "Arykanda Ancient City", "akdeniz", "Antalya", "Antalya", 36.5135, 30.0599, ["Likya", "Roma"], "MÖ 5. yüzyıl – MS 6. yüzyıl", "5th century BC – 6th century AD", "tentative", 50, "Dağların karşısında teraslar üzerine kurulu muhteşem Likya kenti Arykanda, Finike'ye hâkim eşsiz bir manzaraya sahiptir.", "Arykanda, a spectacular Lycian city built on terraces facing the mountains, offers a unique panorama over the Finike plain.", "Likya Birliği üyesi olan Arykanda, MÖ 5. yüzyıldan itibaren iskân edildi; teraslı yerleşim dokusu Helenistik ve Roma dönemlerinde gelişti. MS 2. yüzyılda büyük bir imar faaliyeti yaşayan kent, 6. yüzyıldaki depremlerle ağır hasar görerek kademeli olarak terk edildi.", "A member of the Lycian League, Arykanda was inhabited from the 5th century BC, and its terraced urban layout developed during the Hellenistic and Roman periods. After a major building boom in the 2nd century AD, the city was severely damaged by 6th-century earthquakes and was gradually abandoned.", [
		"Tiyatro",
		"Stadyum",
		"Odeion ve Bouleuterion",
		"Agora",
		"Roma Hamamı"
	], [
		"Theatre",
		"Stadium",
		"Odeon and Bouleuterion",
		"Agora",
		"Roman Baths"
	], "Arykanda, kayalık bir yamaca oturan beş büyük teras üzerine kurulu, dünyadaki ender antik kentlerden biridir.", "Arykanda is one of the rare ancient cities built on five large rock-cut terraces ascending a mountainside.", ["Athena"], 5),
	s("tlos", "Tlos Antik Kenti", "Tlos Ancient City", "akdeniz", "Muğla", "Muğla", 36.5525, 29.4208, ["Likya", "Roma"], "MÖ 2. binyıldan itibaren; Likya ve Roma dönemleri", "From the 2nd millennium BC; Lycian and Roman periods", "tentative", 100, "Bellerophon kaya mezarı ve uçurumun üzerindeki kalesiyle Tlos, Likya'nın en eski ve en büyük kentlerinden biridir.", "Tlos, with its Bellerophon rock tomb and fortress atop a cliff, is one of the oldest and largest cities of Lycia.", "Likya Birliği'nin altı kurucu kentinden biri olan Tlos, 4.000 yılı aşkın kesintisiz bir yerleşim gördü. Roma döneminde bölgenin önemli metropollerinden biri olan kent, Likya Birliği'nin de başlıca üyelerindendi. Akropoldeki kale, Bizans ve Osmanlı dönemlerinde de kullanılmaya devam etti.", "One of the six founding cities of the Lycian League, Tlos saw more than 4,000 years of continuous habitation. Under Roman rule it became a major metropolis of the region and a leading member of the League. The fortress on the acropolis continued in use through the Byzantine and Ottoman periods.", [
		"Bellerophon Kaya Mezarı",
		"Akropol Kalesi",
		"Tiyatro",
		"Stadyum",
		"Kronos Tapınağı"
	], [
		"Bellerophon Rock Tomb",
		"Acropolis Fortress",
		"Theatre",
		"Stadium",
		"Temple of Kronos"
	], "Mitolojide Tlos, kanatlı atı Pegasus'la Kimera'yı öldüren kahraman Bellerophon'un şehri olarak kabul edilir.", "In mythology Tlos is regarded as the city of the hero Bellerophon, who killed the Chimera with his winged horse Pegasus.", [
		"Bellerophon",
		"Pegasus",
		"Trqqas (Likya fırtına tanrısı)"
	], 6),
	s("kibyra", "Kibyra Antik Kenti", "Kibyra Ancient City", "akdeniz", "Burdur", "Burdur", 37.1602, 29.4918, ["Pisidya", "Roma"], "MÖ 2. yüzyıl – MS 6. yüzyıl", "2nd century BC – 6th century AD", "tentative", 100, "Odeonundaki dünyaca ünlü Medusa mozaiği ve gladyatör okuluyla tanınan Kibyra, 'Gladyatörler Şehri' olarak anılır.", "Kibyra, known as the 'City of Gladiators', is famous for its world-renowned Medusa mosaic in the odeon and its gladiator school.", "Strabon'a göre Kibyra, Kabalis bölgesine göç eden Lidyalılar tarafından kuruldu ve komşu kentlerle 'Dört Şehir' (Tetrapolis) birliğini oluşturdu. MS 23 depreminde yıkılan kent, İmparator Tiberius'un yardımlarıyla yeniden inşa edildi ve şükran göstergesi olarak 'Kaisareia Kibyra' adını aldı. Roma döneminde gladyatör okuluyla ünlü bir adalet ve ticaret merkeziydi.", "According to Strabo, Kibyra was founded by Lydians who migrated to the Kabalis region and formed the 'Tetrapolis' league of four cities with its neighbours. Destroyed by an earthquake in AD 23, the city was rebuilt with the aid of Emperor Tiberius and, in gratitude, was renamed 'Caesarea Kibyra'. Under Rome it was a centre of justice and trade, famous for its gladiator school.", [
		"Medusa Mozaiği Odeonu",
		"Stadyum",
		"Tiyatro",
		"Agora",
		"Roma Hamamı"
	], [
		"Medusa Mosaic Odeon",
		"Stadium",
		"Theatre",
		"Agora",
		"Roman Baths"
	], "Kibyra'daki Medusa mozaiği, dünyada 'opus sectile' tekniğiyle yapılmış bilinen tek Medusa tasviridir ve yılın büyük bölümünde korumaya alınır.", "The Medusa mosaic at Kibyra is the only known Medusa depiction made in the 'opus sectile' technique and is protected under cover for most of the year.", ["Medusa", "Tiberius"], 6),
	s("antioch-pisidia", "Pisidya Antiokheia Antik Kenti", "Antiochia ad Pisidiam (Antioch of Pisidia)", "akdeniz", "Isparta", "Isparta", 38.3061, 31.1892, ["Pisidya", "Roma"], "MÖ 3. yüzyıl – MS 6. yüzyıl", "3rd century BC – 6th century AD", "tentative", 100, "Havari Pavlus'un vaaz verdiği Roma koloni kenti Pisidya Antiokheia, Augustus Tapınağı (Augusteum) ile ünlüdür.", "Antioch of Pisidia, a Roman colony city where Paul the Apostle preached, is famous for its Temple of Augustus (Augusteum).", "Kent, MÖ 275 civarında Seleukos hanedanı tarafından Galat akınlarını denetlemek amacıyla kuruldu. MÖ 25'te Augustus burayı 'Colonia Caesarea' adlı bir Roma kolonisi yaptı; Havari Pavlus, Barnabas'la birlikte kente gelerek sinagogda vaaz verdi. Kent, Hristiyan hac merkezi olarak Bizans döneminde de önemini sürdürdü.", "The city was founded around 275 BC by the Seleucid dynasty to control Galatian raids. In 25 BC Augustus made it a Roman colony called 'Colonia Caesarea', and Paul the Apostle preached there with Barnabas in the local synagogue. The city remained an important Christian pilgrimage centre into the Byzantine period.", [
		"Augustus Tapınağı (Augusteum)",
		"Tiyatro",
		"Propylon (Anıtsal Kapı)",
		"Aziz Paul Kilisesi (Büyük Bazilika)",
		"Su Kemerleri ve Nymphaeum"
	], [
		"Temple of Augustus (Augusteum)",
		"Theatre",
		"Propylon (Monumental Gate)",
		"Church of St. Paul (Great Basilica)",
		"Aqueducts and Nymphaeum"
	], "Roma döneminde kentin ana caddesi 'Cardo Maximus', imparator kültünü yaymak için Augustus Tapınağı'na çıkardı ve halkı 'Augustus Halkı' olarak bilinirdi.", "In Roman times the city's main street, the 'Cardo Maximus', led up to the Temple of Augustus to promote the imperial cult, and the community was known as the 'People of Augustus'.", [
		"Pavlus (Aziz Paul)",
		"Augustus",
		"Barnabas"
	], 7),
	s("anemurium", "Anemurium Antik Kenti", "Anemurium", "akdeniz", "Mersin", "Mersin", 36.0243, 32.8026, ["Roma", "Bizans"], "MÖ 4. yüzyıl – MS 7. yüzyıl", "4th century BC – 7th century AD", "tentative", 100, "Akdeniz kıyısındaki bu iyi korunmuş Roma–Geç Roma liman kenti, hamamları, su kemeri ve geniş nekropolüyle dikkat çeker.", "This well-preserved Roman–Late Roman coastal city on the Mediterranean stands out with its baths, aqueduct and vast necropolis.", "Anamur Burnu'nun doğusunda kurulan Anemurium, özellikle Roma ve Bizans dönemlerinde Doğu Akdeniz ticaret yolunda önemli bir liman kentiydi. MS 7. yüzyıldaki Arap akınlarından sonra büyük ölçüde terk edilen kent, 12. yüzyılda Küçük Ermenistan Krallığı döneminde kısmen yeniden iskân edildi.", "Founded beside Cape Anamur, Anemurium was an important port city on the Eastern Mediterranean trade route during the Roman and Byzantine periods. Largely abandoned after the 7th-century Arab raids, it was partly reoccupied in the 12th century under the Armenian Kingdom of Cilicia.", [
		"Roma Hamamları",
		"Su Kemeri",
		"Odeon",
		"Nekropolis",
		"Bizans Kilisesi"
	], [
		"Roman Baths",
		"Aqueduct",
		"Odeon",
		"Necropolis",
		"Byzantine Church"
	], "Anemurium, Anadolu'nun en güney noktası olan Anamur Burnu'nun hemen yanında kurulmuştur ve Kıbrıs'a yalnızca 64 km uzaklıktadır.", "Anemurium lies right beside Cape Anamur, the southernmost point of Asia Minor, only 64 km from Cyprus.", ["Antiochos IV (Kommagene Kralı)", "Matronianus"], 5),
	s("uzuncaburc", "Uzuncaburç (Olba-Diocaesarea)", "Uzuncaburç / Olba-Diocaesarea", "akdeniz", "Mersin", "Mersin", 36.581, 33.9255, ["Helenistik", "Roma"], "MÖ 3. yüzyıl – MS 3. yüzyıl", "3rd century BC – 3rd century AD", "tentative", 100, "Olba rahip-krallarının kutsal merkezi olan kent, ayakta kalan Zeus Olbios Tapınağı sütunlarıyla ünlüdür.", "The sacred centre of the priest-kings of Olba, the city is famous for the standing columns of the Temple of Zeus Olbios.", "Uzuncaburç, Helenistik dönemde Olba Krallığı'nın kutsal alanı olarak kuruldu ve İmparator Vespasian döneminde Diocaesarea adıyla ayrı bir Roma kentine dönüştürüldü. Sütunlu cadde, tiyatro ve tapınaklar bu dönemin izlerini günümüze taşır.", "Uzuncaburç began as the sacred sanctuary of the Hellenistic kingdom of Olba and was turned into a separate Roman city, Diocaesarea, under Emperor Vespasian. The colonnaded street, theatre and temples survive from this period.", [
		"Zeus Olbios Tapınağı",
		"Uzuncaburç Kulesi",
		"Sütunlu Cadde",
		"Tiyatro",
		"Tyche Tapınağı"
	], [
		"Temple of Zeus Olbios",
		"The Tall Tower",
		"Colonnaded Street",
		"Theatre",
		"Temple of Tyche"
	], "Kent, 'uzun kule' anlamına gelen adını Zeus Olbios Tapınağı'nın yanındaki yüksek kuleden alır; bu kule antik kentin sikkelerinde de tasvir edilmiştir.", "The city takes its name, meaning 'tall tower', from the high tower beside the Temple of Zeus Olbios, a tower depicted on the city's ancient coins.", [
		"Zeus Olbios",
		"Seleukos I Nikator",
		"Vespasian"
	], 4),
	s("karatepe", "Karatepe-Aslantaş Açık Hava Müzesi", "Karatepe-Aslantaş Open-Air Museum", "akdeniz", "Osmaniye", "Osmaniye", 37.3002, 36.25, ["Geç Hitit"], "MÖ 8. yüzyıl (Geç Hitit)", "8th century BC (Late Hittite)", "tentative", 100, "Geç Hitit döneminden kalma kale, Luvi hiyerogliflerinin çözülmesini sağlayan çift dilli yazıtıyla açık hava müzesi olarak korunuyor.", "The Late Hittite fortress is preserved as an open-air museum thanks to the bilingual inscription that unlocked the decipherment of Luwian hieroglyphs.", "MÖ 8. yüzyılda Adanawa kent devletinin sınır kalesi Azatiwataya olarak inşa edilen kale, kuruluşundan kısa süre sonra terk edildi. 1946'dan itibaren yürütülen kazıların ardından Türkiye'nin ilk açık hava müzesi hâline getirildi.", "Built in the 8th century BC as Azatiwataya, the frontier fortress of the Adanawa city-state, the castle was abandoned shortly after its foundation. Excavations from 1946 made it Turkey's first open-air museum.", [
		"Kuzey Kapı",
		"Güney Kapı",
		"Fırtına Tanrısı Heykeli",
		"Aslan Heykelleri",
		"Sfenks Heykelleri"
	], [
		"North Gate",
		"South Gate",
		"Storm God Statue",
		"Lion Statues",
		"Sphinx Statues"
	], "Karatepe çift dilli yazıtı, Fenike alfabesiyle Luvi hiyerogliflerinin aynı metnini içerir ve 'Rasgele Taşı' gibi Anadolu hiyerogliflerinin çözülmesinde kilit rol oynamıştır.", "The Karatepe bilingual inscription carries the same text in Phoenician and Hieroglyphic Luwian and, like a 'Rosetta Stone', was pivotal in deciphering Anatolian hieroglyphs.", [
		"Azatiwada",
		"Tarhunzas (Fırtına Tanrısı)",
		"Halet Çambel"
	], 5, "monument"),
	s("anavarza", "Anavarza Antik Kenti", "Anavarza (Anazarbus)", "akdeniz", "Adana", "Adana", 37.2564, 35.8985, ["Roma", "Bizans"], "MÖ 1. yüzyıl – MS 14. yüzyıl", "1st century BC – 14th century AD", "tentative", 50, "Kilikya Ovası'nın ortasında yükselen kireçtaşı kaya kütlesi üzerindeki Roma kenti, anıtsal zafer takı ve kalesiyle ünlüdür.", "A Roman city on a limestone outcrop rising from the middle of the Cilician plain, famous for its monumental triumphal arch and fortress.", "MÖ 1. yüzyılda Roma egemenliğine giren kent, Septimius Severus döneminde metropolis unvanını aldı. Bizans, Arap, Ermeni ve Memluk dönemlerinde iskân gören kent, 1375'te Memluklar tarafından alındıktan sonra terk edildi.", "Brought under Roman control in the 1st century BC, the city gained the title of metropolis under Septimius Severus. Settled through Byzantine, Arab, Armenian and Mamluk periods, it was abandoned after being taken by the Mamluks in 1375.", [
		"Zafer Takı (Alakapı)",
		"Sütunlu Cadde",
		"Tiyatro",
		"Stadyum",
		"Anavarza Kalesi"
	], [
		"Triumphal Arch (Alakapı)",
		"Colonnaded Street",
		"Theatre",
		"Stadium",
		"Anavarza Castle"
	], "Anavarza, ünlü hekim Dioskorides'in doğduğu kent olarak bilinir; 2013'ten beri süren kazılar dünyanın ilk çift şeritli sütunlu caddesini ortaya çıkarmıştır.", "Anavarza is known as the birthplace of the famous physician Dioscorides, and excavations since 2013 have revealed the world's first known double-lane colonnaded road.", [
		"Tarkondimotos",
		"Dioskorides",
		"Augustus"
	], 3),
	s("tell-atchana", "Tell Atçana (Alalah)", "Tell Atchana (Alalakh)", "akdeniz", "Hatay", "Hatay", 36.2378, 36.3847, ["Amik Krallığı", "Hitit"], "MÖ 3. binyıl – MÖ 12. yüzyıl", "3rd millennium BC – 12th century BC", "tentative", 0, "Amik Ovası'ndaki Tunç Çağı kenti, Kral Niqmepa'nın çivi yazılı tablet arşiviyle öne çıkar.", "A Bronze Age city of the Amuq plain, famous for the cuneiform archive of King Niqmepa.", "MÖ 2. binyılda Muqiş Krallığı'nın başkenti olan Alalah, sarayları ve tapınaklarıyla bölgenin en önemli merkezlerinden biriydi. 1937-1949 yıllarında Leonard Woolley tarafından kazılan höyük, Tell Tayinat'ın hemen güneydoğusunda yer alır.", "Capital of the kingdom of Mukiš in the 2nd millennium BC, Alalakh was one of the region's most important centres with its palaces and temples. Excavated by Leonard Woolley between 1937 and 1949, the mound lies just southeast of Tell Tayinat.", [
		"Niqmepa Sarayı",
		"Eski Saray (Saray VII)",
		"Tapınaklar",
		"Şehir Surları",
		"Tunç Çağı Konutları"
	], [
		"Palace of Niqmepa",
		"Old Palace (Palace VII)",
		"Temples",
		"City Walls",
		"Bronze Age Houses"
	], "Kral Idrimi'nin heykeli üzerindeki yazıt, Antik Yakın Doğu'nun en önemli belgelerinden biri olan ve halk ağzıyla yazılmış çivi yazılı bir otobiyografidir.", "The inscription on the statue of King Idrimi is one of the most important documents of the ancient Near East — an autobiography written in cuneiform in the first person.", ["Idrimi", "Niqmepa"], 3, "mound")
];
var totalSites = sites.length;
function getSite(slug) {
	return sites.find((x) => x.slug === slug);
}
function sitesByRegion(region) {
	return sites.filter((x) => x.region === region);
}
function allCivilizations() {
	return Array.from(new Set(sites.flatMap((x) => x.civilizations))).sort((a, b) => a.localeCompare(b, "tr"));
}
function allProvinces() {
	return Array.from(new Set(sites.map((x) => x.province.tr))).sort((a, b) => a.localeCompare(b, "tr"));
}
function distanceKm(aLat, aLng, bLat, bLng) {
	const R = 6371;
	const dLat = (bLat - aLat) * Math.PI / 180;
	const dLng = (bLng - aLng) * Math.PI / 180;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
	return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
/** Deterministic "site of the day" so every visitor sees the same pick. */
function siteOfTheDay(date = /* @__PURE__ */ new Date()) {
	return sites[Math.floor(date.getTime() / 864e5) % sites.length];
}
//#endregion
export { galleryImages as a, regionCoverImage as c, sites as d, sitesByRegion as f, distanceKm as i, regions as l, allProvinces as n, getSite as o, totalSites as p, coverImage as r, heroImage as s, allCivilizations as t, siteOfTheDay as u };
