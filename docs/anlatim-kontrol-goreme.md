# Anlatım kontrolü: Göreme (site-goreme)

Dosya: `src/lib/narration-stories/en/site-goreme.json` (Türkçe sürüm de aynı içerikten üretiliyorsa o da).
Karşılaştırılan kaynak: `docs/yapi-kartlari/karanlik-kilise.md` (Kültür ve Turizm Bakanlığı, cappadociahistory.com, Wikipedia).

| Bölüm | Metindeki ifade | Sorun | Önerilen düzeltme |
|---|---|---|---|
| structure-1 | "Next stop: the dark church. Churches cut into the fairy chimneys…" | Karanlık Kilise bir peribacasında değil. Büyük bir kaya kütlesine oyulmuş, iki katlı cepheli bir manastır avlusunun içinde ve üst seviyede, merdivenle çıkılıyor. | "Next stop: the Dark Church. It is part of a monastery cut into a great mass of tuff: a small courtyard, a two-storey front with nineteen blind niches painted with red crosses, a refectory with a fifteen-metre stone table, and up a curving stair, the church itself." |
| facts | "a restoration that took ten years to lift away the soot" | Wikipedia 14 yıllık temizlik diyor; restorasyon 1980'lerde yapıldı. Kaynaklar çelişiyor. | "a restoration that took well over a decade" ya da kesin sayı kaldırılsın. |
| facts | "the intensity of their blue is unmatched in the Byzantine world" | Kaynaksız abartı. Karanlık'ın zeminleri mavi-gri; lacivert lapis vurgusu Tokalı Kilise için belgeli. | "their colours are the most vivid in Cappadocia, because so little light has reached them" (kaynaklarla uyumlu). |
| facts | "the blue of the Buckle Church was made from lapis lazuli, which at the time was more expensive than gold" | Kabaca doğru. Kaynak, Tokalı'daki lapisin değerini yaklaşık 31,5 libre altın olarak tahmin ediyor. "Altından pahalı" yerine bu biçim daha güvenli. | "…lapis lazuli brought from Badakhshan; the blue on its walls has been valued at the price of some fifteen kilos of gold." |

Not: Hikâye yeniden yazımı (HIKAYELERI-YENILE.bat → `scripts\rewrite-out2`) çalıştığında bu düzeltmeler istem olarak verilmeli ya da çıktı aktarılmadan önce elle uygulanmalı.
