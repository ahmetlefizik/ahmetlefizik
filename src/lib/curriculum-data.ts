export type Topic = { id: string; name: string; completed: boolean };
export type Subject = { id: string; name: string; topics: Topic[] };
export type Curriculum = { id: string; name: string; subjects: Subject[] };

export const FULL_CURRICULUM: Curriculum[] = [
  {
    id: "tyt",
    name: "TYT (Temel Yeterlilik)",
    subjects: [
      {
        id: "tyt-turkce",
        name: "Türkçe",
        topics: [
          { id: "tt1", name: "Sözcükte Anlam", completed: false },
          { id: "tt2", name: "Cümlede Anlam", completed: false },
          { id: "tt3", name: "Paragrafta Anlam", completed: false },
          { id: "tt4", name: "Ses Bilgisi", completed: false },
          { id: "tt5", name: "Yazım Kuralları", completed: false },
          { id: "tt6", name: "Noktalama İşaretleri", completed: false },
          { id: "tt7", name: "Sözcük Türleri", completed: false },
          { id: "tt8", name: "Fiiller ve Fiilimsi", completed: false },
          { id: "tt9", name: "Sözcük Yapısı", completed: false },
          { id: "tt10", name: "Cümlenin Ögeleri", completed: false },
          { id: "tt11", name: "Cümle Çeşitleri", completed: false },
          { id: "tt12", name: "Anlatım Bozuklukları", completed: false },
        ]
      },
      {
        id: "tyt-mat",
        name: "Matematik",
        topics: [
          { id: "tm1", name: "Temel Kavramlar", completed: false },
          { id: "tm2", name: "Sayı Basamakları", completed: false },
          { id: "tm3", name: "Bölme-Bölünebilme", completed: false },
          { id: "tm4", name: "EBOB-EKOK", completed: false },
          { id: "tm5", name: "Rasyonel Sayılar", completed: false },
          { id: "tm6", name: "Basit Eşitsizlikler", completed: false },
          { id: "tm7", name: "Mutlak Değer", completed: false },
          { id: "tm8", name: "Üslü Sayılar", completed: false },
          { id: "tm9", name: "Köklü Sayılar", completed: false },
          { id: "tm10", name: "Çarpanlara Ayırma", completed: false },
          { id: "tm11", name: "Oran-Orantı", completed: false },
          { id: "tm12", name: "Problemler", completed: false },
          { id: "tm13", name: "Kümeler ve Mantık", completed: false },
          { id: "tm14", name: "Fonksiyonlar", completed: false },
          { id: "tm15", name: "Polinomlar", completed: false },
          { id: "tm16", name: "Permütasyon-Kombinasyon-Olasılık", completed: false },
        ]
      },
      {
        id: "tyt-geo",
        name: "Geometri",
        topics: [
          { id: "tg1", name: "Açılar ve Üçgenler", completed: false },
          { id: "tg2", name: "Çokgenler ve Dörtgenler", completed: false },
          { id: "tg3", name: "Çember ve Daire", completed: false },
          { id: "tg4", name: "Katı Cisimler", completed: false },
          { id: "tg5", name: "Analitik Geometri", completed: false },
        ]
      },
      {
        id: "tyt-tarih",
        name: "Tarih",
        topics: [
          { id: "th1", name: "Tarih ve Zaman", completed: false },
          { id: "th2", name: "İlk ve Orta Çağlarda Türk Dünyası", completed: false },
          { id: "th3", name: "İslam Medeniyetinin Doğuşu", completed: false },
          { id: "th4", name: "Türklerin İslamiyet'i Kabulü", completed: false },
          { id: "th5", name: "Beylikten Devlete Osmanlı", completed: false },
          { id: "th6", name: "Dünya Gücü Osmanlı", completed: false },
          { id: "th7", name: "En Uzun Yüzyıl", completed: false },
          { id: "th8", name: "Milli Mücadele", completed: false },
          { id: "th9", name: "Atatürk İlke ve İnkılapları", completed: false },
        ]
      },
      {
        id: "tyt-cog",
        name: "Coğrafya",
        topics: [
          { id: "tc1", name: "Doğa ve İnsan", completed: false },
          { id: "tc2", name: "Dünya'nın Şekli ve Hareketleri", completed: false },
          { id: "tc3", name: "Yerel Saat ve Koordinatlar", completed: false },
          { id: "tc4", name: "Harita Bilgisi", completed: false },
          { id: "tc5", name: "İklim Bilgisi", completed: false },
          { id: "tc6", name: "İç ve Dış Kuvvetler", completed: false },
          { id: "tc7", name: "Nüfus ve Yerleşme", completed: false },
          { id: "tc8", name: "Bölgeler ve Ulaşım", completed: false },
          { id: "tc9", name: "Doğal Afetler", completed: false },
        ]
      },
      {
        id: "tyt-fel",
        name: "Felsefe",
        topics: [
          { id: "tf1", name: "Felsefeyi Tanıma", completed: false },
          { id: "tf2", name: "Bilgi Felsefesi", completed: false },
          { id: "tf3", name: "Varlık Felsefesi", completed: false },
          { id: "tf4", name: "Ahlak Felsefesi", completed: false },
          { id: "tf5", name: "Din Felsefesi", completed: false },
          { id: "tf6", name: "Siyaset Felsefesi", completed: false },
          { id: "tf7", name: "Bilim Felsefesi", completed: false },
        ]
      },
      {
        id: "tyt-din",
        name: "Din Kültürü",
        topics: [
          { id: "td1", name: "Bilgi ve İnanç", completed: false },
          { id: "td2", name: "Din ve İslam", completed: false },
          { id: "td3", name: "İslam ve İbadet", completed: false },
          { id: "td4", name: "Gençlik ve Değerler", completed: false },
          { id: "td5", name: "Allah İnsan İlişkisi", completed: false },
          { id: "td6", name: "Hz. Muhammed (sav)", completed: false },
        ]
      },
      {
        id: "tyt-fiz",
        name: "Fizik",
        topics: [
          { id: "tp1", name: "Fizik Bilimine Giriş", completed: false },
          { id: "tp2", name: "Madde ve Özellikleri", completed: false },
          { id: "tp3", name: "Hareket ve Kuvvet", completed: false },
          { id: "tp4", name: "Enerji", completed: false },
          { id: "tp5", name: "Isı ve Sıcaklık", completed: false },
          { id: "tp6", name: "Basınç ve Kaldırma Kuvveti", completed: false },
          { id: "tp7", name: "Elektrostatik", completed: false },
          { id: "tp8", name: "Elektrik ve Manyetizma", completed: false },
          { id: "tp9", name: "Optik", completed: false },
          { id: "tp10", name: "Dalgalar", completed: false },
        ]
      },
      {
        id: "tyt-kim",
        name: "Kimya",
        topics: [
          { id: "tk1", name: "Kimya Bilimi", completed: false },
          { id: "tk2", name: "Atom ve Periyodik Sistem", completed: false },
          { id: "tk3", name: "Türler Arası Etkileşimler", completed: false },
          { id: "tk4", name: "Maddenin Halleri", completed: false },
          { id: "tk5", name: "Doğa ve Kimya", completed: false },
          { id: "tk6", name: "Kimyanın Temel Kanunları", completed: false },
          { id: "tk7", name: "Karışımlar", completed: false },
          { id: "tk8", name: "Asitler, Bazlar ve Tuzlar", completed: false },
          { id: "tk9", name: "Kimya Her Yerde", completed: false },
        ]
      },
      {
        id: "tyt-biy",
        name: "Biyoloji",
        topics: [
          { id: "tb1", name: "Canlıların Ortak Özellikleri", completed: false },
          { id: "tb2", name: "Canlıların Temel Bileşenleri", completed: false },
          { id: "tb3", name: "Hücre ve Yapısı", completed: false },
          { id: "tb4", name: "Canlıların Sınıflandırılması", completed: false },
          { id: "tb5", name: "Hücre Bölünmeleri", completed: false },
          { id: "tb6", name: "Kalıtım", completed: false },
          { id: "tb7", name: "Ekosistem Ekolojisi", completed: false },
        ]
      }
    ]
  },
  {
    id: "ayt",
    name: "AYT (Alan Yeterlilik)",
    subjects: [
      {
        id: "ayt-edb",
        name: "Edebiyat",
        topics: [
          { id: "ae1", name: "Şiir Bilgisi", completed: false },
          { id: "ae2", name: "Edebi Sanatlar", completed: false },
          { id: "ae3", name: "Türk Edebiyatı Dönemleri", completed: false },
          { id: "ae4", name: "Halk Edebiyatı", completed: false },
          { id: "ae5", name: "Divan Edebiyatı", completed: false },
          { id: "ae6", name: "Tanzimat Edebiyatı", completed: false },
          { id: "ae7", name: "Servet-i Fünun ve Fecr-i Ati", completed: false },
          { id: "ae8", name: "Milli Edebiyat", completed: false },
          { id: "ae9", name: "Cumhuriyet Dönemi Edebiyatı", completed: false },
          { id: "ae10", name: "Edebi Akımlar", completed: false },
        ]
      },
      {
        id: "ayt-mat",
        name: "Matematik",
        topics: [
          { id: "am1", name: "Polinomlar ve Karmaşık Sayılar", completed: false },
          { id: "am2", name: "İkinci Dereceden Denklemler", completed: false },
          { id: "am3", name: "Fonksiyonlarda Uygulamalar", completed: false },
          { id: "am4", name: "Trigonometri", completed: false },
          { id: "am5", name: "Logaritma", completed: false },
          { id: "am6", name: "Diziler", completed: false },
          { id: "am7", name: "Limit ve Süreklilik", completed: false },
          { id: "am8", name: "Türev", completed: false },
          { id: "am9", name: "İntegral", completed: false },
        ]
      },
      {
        id: "ayt-tarih",
        name: "Tarih-1/2",
        topics: [
          { id: "ah1", name: "Tarih ve Zaman", completed: false },
          { id: "ah2", name: "İslam Medeniyeti", completed: false },
          { id: "ah3", name: "Osmanlı Kültür ve Medeniyeti", completed: false },
          { id: "ah4", name: "20. Yüzyıl Başlarında Dünya", completed: false },
          { id: "ah5", name: "I. ve II. Dünya Savaşı", completed: false },
          { id: "ah6", name: "Soğuk Savaş Dönemi", completed: false },
        ]
      },
      {
        id: "ayt-cog",
        name: "Coğrafya-1/2",
        topics: [
          { id: "ac1", name: "Ekosistem ve Biyoçeşitlilik", completed: false },
          { id: "ac2", name: "Nüfus Politikaları", completed: false },
          { id: "ac3", name: "Türkiye'de Ekonomik Faaliyetler", completed: false },
          { id: "ac4", name: "Küresel Ortam: Ülkeler", completed: false },
          { id: "ac5", name: "Çevre ve Toplum", completed: false },
        ]
      },
      {
        id: "ayt-fel-grubu",
        name: "Felsefe Grubu",
        topics: [
          { id: "ag1", name: "Psikolojinin Konusu", completed: false },
          { id: "ag2", name: "Sosyolojinin Konusu", completed: false },
          { id: "ag3", name: "Mantığa Giriş", completed: false },
          { id: "ag4", name: "Klasik Mantık", completed: false },
        ]
      },
      {
        id: "ayt-fiz",
        name: "Fizik",
        topics: [
          { id: "ap1", name: "Vektörler ve Kuvvet", completed: false },
          { id: "ap2", name: "Bağıl Hareket", completed: false },
          { id: "ap3", name: "Newton'un Hareket Yasaları", completed: false },
          { id: "ap4", name: "Atışlar", completed: false },
          { id: "ap5", name: "İtme ve Momentum", completed: false },
          { id: "ap6", name: "Elektrik ve Manyetizma", completed: false },
          { id: "ap7", name: "Çembersel Hareket", completed: false },
          { id: "ap8", name: "Modern Fizik", completed: false },
        ]
      },
      {
        id: "ayt-kim",
        name: "Kimya",
        topics: [
          { id: "ak1", name: "Modern Atom Teorisi", completed: false },
          { id: "ak2", name: "Gazlar", completed: false },
          { id: "ak3", name: "Sıvı Çözeltiler", completed: false },
          { id: "ak4", name: "Kimyasal Enerji ve Hız", completed: false },
          { id: "ak5", name: "Kimyasal Denge", completed: false },
          { id: "ak6", name: "Organik Kimya", completed: false },
        ]
      },
      {
        id: "ayt-biy",
        name: "Biyoloji",
        topics: [
          { id: "ab1", name: "Sistemler", completed: false },
          { id: "ab2", name: "Genden Proteine", completed: false },
          { id: "ab3", name: "Bitki Biyolojisi", completed: false },
          { id: "ab4", name: "Canlılar ve Çevre", completed: false },
        ]
      },
      {
        id: "ayt-ydt",
        name: "YDT (İngilizce)",
        topics: [
          { id: "ay1", name: "Kelime Bilgisi", completed: false },
          { id: "ay2", name: "Gramer (Zamanlar, Modals...)", completed: false },
          { id: "ay3", name: "Cümle Tamamlama", completed: false },
          { id: "ay4", name: "Okuma Parçaları", completed: false },
          { id: "ay5", name: "Çeviri", completed: false },
          { id: "ay6", name: "Diyalog Tamamlama", completed: false },
          { id: "ay7", name: "Eş Anlamlı Cümleler", completed: false },
          { id: "ay8", name: "Paragraf Tamamlama", completed: false },
          { id: "ay9", name: "Akışı Bozan Cümle", completed: false },
        ]
      }
    ]
  },
  {
    id: "lgs",
    name: "LGS (Lise Geçiş)",
    subjects: [
      {
        id: "lgs-turkce",
        name: "Türkçe",
        topics: [
          { id: "lt1", name: "Fiilimsiler", completed: false },
          { id: "lt2", name: "Cümlenin Ögeleri", completed: false },
          { id: "lt3", name: "Sözcük/Cümle/Paragraf", completed: false },
          { id: "lt4", name: "Yazım ve Noktalama", completed: false },
        ]
      },
      {
        id: "lgs-mat",
        name: "Matematik",
        topics: [
          { id: "lm1", name: "Çarpanlar ve Katlar", completed: false },
          { id: "lm2", name: "Üslü ve Kareköklü İfadeler", completed: false },
          { id: "lm3", name: "Cebirsel İfadeler", completed: false },
          { id: "lm4", name: "Üçgenler", completed: false },
        ]
      },
      {
        id: "lgs-fen",
        name: "Fen Bilimleri",
        topics: [
          { id: "lf1", name: "Mevsimler ve İklim", completed: false },
          { id: "lf2", name: "DNA ve Genetik Kod", completed: false },
          { id: "lf3", name: "Basınç", completed: false },
          { id: "lf4", name: "Basit Makineler", completed: false },
        ]
      },
      {
        id: "lgs-ink",
        name: "İnkılap Tarihi",
        topics: [
          { id: "li1", name: "Bir Kahraman Doğuyor", completed: false },
          { id: "li2", name: "Milli Uyanış", completed: false },
          { id: "li3", name: "Milli Bir Destan", completed: false },
        ]
      },
      {
        id: "lgs-din",
        name: "Din Kültürü",
        topics: [
          { id: "ld1", name: "Kader İnancı", completed: false },
          { id: "ld2", name: "Zekat ve Sadaka", completed: false },
          { id: "ld3", name: "Din ve Hayat", completed: false },
        ]
      }
    ]
  }
];
