/* ============================================================
   Vitaliia beauty studio — app.js
   ============================================================ */

/* ------------------------------------------------------------
   GALERIA — lista plików
   Aby dodać zdjęcie: wrzuć plik do /img i dopisz jego nazwę
   poniżej. Układ siatki działa dla dowolnej liczby zdjęć.
   Brakujący plik nie psuje siatki — kafelek znika po nieudanej próbie
   wczytania obrazka.
   ------------------------------------------------------------ */
const galleryImages = [
  'work-2.jpg',
  'work-1.jpg',
  'master-1.jpg',
  'work-3.jpg',
  'work-5.jpg',
  'work-4.jpg',
  'interior-1.jpg'
  // kolejne zdjęcia dopisz tutaj, np.:
  // , 'work-6.jpg'
  // , 'interior-2.jpg'
];

/* ------------------------------------------------------------
   TŁUMACZENIA / ПЕРЕКЛАДИ
   ------------------------------------------------------------ */
const translations = {
  pl: {
    nav_services: 'Usługi',
    nav_gallery: 'Galeria',
    nav_pricing: 'Cennik',
    nav_reviews: 'Opinie',
    nav_contact: 'Kontakt',

    hero_eyebrow: 'Siechnice',
    hero_sub: 'Manicure, pedicure, brwi i rzęsy, makijaż permanentny, depilacja laserowa i masaż endosferyczny w Siechnicach.',
    btn_call: 'Zadzwoń',
    btn_call_book: 'Zadzwoń i umów wizytę',

    services_title: 'Usługi',
    services_lead: 'Sześć kierunków pracy studia — kliknij, aby zobaczyć ceny.',
    cat_manicure: 'Manicure',
    cat_manicure_meta: 'od 80 zł',
    cat_pedicure: 'Pedicure',
    cat_pedicure_meta: 'od 120 zł',
    cat_oko: 'Brwi i rzęsy',
    cat_oko_full: 'Stylizacja i oprawa oka',
    cat_oko_meta: 'od 30 zł',
    cat_pmu: 'Makijaż permanentny',
    cat_pmu_meta: '600 zł',
    cat_laser: 'Depilacja laserowa',
    cat_laser_meta: 'od 50 zł',
    cat_masaz: 'Masaż endosferyczny',
    cat_masaz_full: 'Masaż endosferyczny (rolkowy)',
    cat_masaz_meta: 'od 100 zł',

    gallery_title: 'Galeria',
    gallery_lead: 'Prace studia i wnętrze salonu.',
    gallery_empty: 'Zdjęcia wkrótce.',
    alt_work: 'Praca studia',
    alt_interior: 'Wnętrze salonu',
    alt_master: 'Vitaliia przy pracy',

    reviews_title: 'Opinie',
    reviews_lead: 'Opinie klientek studia.',

    pricing_title: 'Cennik',
    pricing_lead: 'Ceny w złotych. Pakiety zabiegów są tańsze.',

    p_od10: 'od 10 zł',

    m_klasyczny: 'klasyczny',
    m_hybrydowy: 'hybrydowy',
    m_uzup: 'uzupełnienie żelu',
    m_prz_sred: 'przedłużanie średnie',
    m_prz_dlug: 'przedłużanie długie',
    m_french: 'french/ombre',
    m_zdobienia: 'zdobienia',
    m_naprawa: 'naprawa paznokcia',
    m_sc_hyb: 'ściągnięcie hybrydy',
    m_sc_zel: 'ściągnięcie żelu',
    m_sc_plus: 'ściągnięcie hybrydy/żelu + manicure klasyczny',

    p_klasyczny: 'klasyczny',
    p_hybrydowy: 'hybrydowy',
    p_hyb_stopy: 'hybryda paznokcie u stóp',
    p_french: 'french',
    p_sc_hyb: 'ściągnięcie hybrydy',
    p_sc_plus: 'ściągnięcie hybrydy + pedicure klasyczny',

    o_henna_brwi: 'henna brwi',
    o_henna_rzes: 'henna rzęs',
    o_henna_oba: 'henna rzęs i brwi',
    o_regulacja: 'regulacja brwi',
    o_henna_reg: 'henna brwi + regulacja',
    o_henna_oba_reg: 'henna rzęs i brwi + regulacja',
    o_lam_rzes: 'laminacja rzęs',
    o_lam_brwi: 'laminacja brwi',
    o_lam_henna: 'laminacja brwi + henna',
    o_architektura: 'architektura brwi',
    o_meskie: 'regulacja brwi u mężczyzn',

    pm_usta_ombre: 'usta — metoda ombre',
    pm_usta_dop: 'usta — dopigmentowanie',
    pm_brwi_ombre: 'brwi — metoda ombre',
    pm_brwi_dop: 'brwi — dopigmentowanie',
    pm_kreska: 'kreska w linii rzęs',
    pm_kreska_dop: 'kreska w linii rzęs — dopigmentowanie',
    pm_usuwanie: 'usuwanie removerem',
    pm_konsultacja: 'Konsultacja jest darmowa.',

    l_pachy: 'pachy',
    l_rece: 'całe ręce',
    l_lydki: 'łydki',
    l_przedramiona: 'przedramiona',
    l_uda: 'uda',
    l_nogi: 'całe nogi',
    l_bikini_gl: 'bikini głębokie',
    l_bikini_kl: 'bikini klasyczne',
    l_posladki: 'pośladki',
    l_brzuch: 'brzuch cały',
    l_klatka: 'klatka piersiowa',
    l_plecy: 'plecy',
    l_twarz: 'cała twarz',
    l_wasik: 'wąsik / broda / linia brzucha / bródka / baczki',
    l_pak1: 'bikini głębokie + pachy + całe nogi',
    l_pak2: 'bikini głębokie + pachy',
    l_pak3: 'bikini głębokie + pachy + łydki',
    l_pak4: 'całe nogi + pachy',
    l_pak5: 'bikini głębokie + całe nogi',
    l_pak6: 'twarz + całe ciało',

    mas_30: 'Masaż 30 minut',
    mas_60: 'Masaż 60 minut',
    mas_twarz: 'twarz',
    mas_6_twarz: '6 zabiegów / twarz',
    mas_10_twarz: '10 zabiegów / twarz',
    mas_cialo: 'całe ciało',
    mas_6_cialo: '6 zabiegów / całe ciało',
    mas_10_cialo: '10 zabiegów / całe ciało',
    mas_note: 'Pakiety 6 zabiegów — 10% taniej, pakiety 10 zabiegów — 20% taniej.',

    contact_title: 'Kontakt',
    contact_address: 'Adres',
    contact_hours: 'Godziny otwarcia',
    contact_phone: 'Telefon',
    day_mon_fri: 'pon. – pt.',
    day_sat: 'sobota',
    day_sun: 'niedziela',
    closed: 'nieczynne',

    lb_close: 'Zamknij',
    lb_prev: 'Poprzednie zdjęcie',
    lb_next: 'Następne zdjęcie'
  },

  ua: {
    nav_services: 'Послуги',
    nav_gallery: 'Галерея',
    nav_pricing: 'Ціни',
    nav_reviews: 'Відгуки',
    nav_contact: 'Контакти',

    hero_eyebrow: 'Сехниці',
    hero_sub: 'Манікюр, педикюр, брови та вії, перманентний макіяж, лазерна епіляція та ендосферний масаж у Сехницях.',
    btn_call: 'Зателефонувати',
    btn_call_book: 'Зателефонувати і записатися',

    services_title: 'Послуги',
    services_lead: 'Шість напрямків роботи студії — натисніть, щоб побачити ціни.',
    cat_manicure: 'Манікюр',
    cat_manicure_meta: 'від 80 zł',
    cat_pedicure: 'Педикюр',
    cat_pedicure_meta: 'від 120 zł',
    cat_oko: 'Брови та вії',
    cat_oko_full: 'Стилізація та оформлення очей',
    cat_oko_meta: 'від 30 zł',
    cat_pmu: 'Перманентний макіяж',
    cat_pmu_meta: '600 zł',
    cat_laser: 'Лазерна епіляція',
    cat_laser_meta: 'від 50 zł',
    cat_masaz: 'Ендосферний масаж',
    cat_masaz_full: 'Ендосферний (роликовий) масаж',
    cat_masaz_meta: 'від 100 zł',

    gallery_title: 'Галерея',
    gallery_lead: 'Роботи студії та інтер’єр салону.',
    gallery_empty: 'Фото незабаром.',
    alt_work: 'Робота студії',
    alt_interior: 'Інтер’єр салону',
    alt_master: 'Віталія за роботою',

    reviews_title: 'Відгуки',
    reviews_lead: 'Відгуки клієнток студії.',

    pricing_title: 'Ціни',
    pricing_lead: 'Ціни у злотих. Пакети процедур — дешевше.',

    p_od10: 'від 10 zł',

    m_klasyczny: 'класичний',
    m_hybrydowy: 'гібридний',
    m_uzup: 'корекція гелю',
    m_prz_sred: 'нарощення середнє',
    m_prz_dlug: 'нарощення довге',
    m_french: 'френч/омбре',
    m_zdobienia: 'дизайн',
    m_naprawa: 'ремонт нігтя',
    m_sc_hyb: 'зняття гібриду',
    m_sc_zel: 'зняття гелю',
    m_sc_plus: 'зняття гібриду/гелю + класичний манікюр',

    p_klasyczny: 'класичний',
    p_hybrydowy: 'гібридний',
    p_hyb_stopy: 'гібрид на нігтях стоп',
    p_french: 'френч',
    p_sc_hyb: 'зняття гібриду',
    p_sc_plus: 'зняття гібриду + класичний педикюр',

    o_henna_brwi: 'хна для брів',
    o_henna_rzes: 'хна для вій',
    o_henna_oba: 'хна для вій і брів',
    o_regulacja: 'корекція брів',
    o_henna_reg: 'хна для брів + корекція',
    o_henna_oba_reg: 'хна для вій і брів + корекція',
    o_lam_rzes: 'ламінування вій',
    o_lam_brwi: 'ламінування брів',
    o_lam_henna: 'ламінування брів + хна',
    o_architektura: 'архітектура брів',
    o_meskie: 'корекція брів для чоловіків',

    pm_usta_ombre: 'губи — метод омбре',
    pm_usta_dop: 'губи — докорекція пігменту',
    pm_brwi_ombre: 'брови — метод омбре',
    pm_brwi_dop: 'брови — докорекція пігменту',
    pm_kreska: 'стрілка по лінії вій',
    pm_kreska_dop: 'стрілка по лінії вій — докорекція пігменту',
    pm_usuwanie: 'видалення ремувером',
    pm_konsultacja: 'Консультація безкоштовна.',

    l_pachy: 'пахви',
    l_rece: 'руки повністю',
    l_lydki: 'гомілки',
    l_przedramiona: 'передпліччя',
    l_uda: 'стегна',
    l_nogi: 'ноги повністю',
    l_bikini_gl: 'глибоке бікіні',
    l_bikini_kl: 'класичне бікіні',
    l_posladki: 'сідниці',
    l_brzuch: 'живіт повністю',
    l_klatka: 'грудна клітка',
    l_plecy: 'спина',
    l_twarz: 'обличчя повністю',
    l_wasik: 'вусики / борода / лінія живота / підборіддя / бакенбарди',
    l_pak1: 'глибоке бікіні + пахви + ноги повністю',
    l_pak2: 'глибоке бікіні + пахви',
    l_pak3: 'глибоке бікіні + пахви + гомілки',
    l_pak4: 'ноги повністю + пахви',
    l_pak5: 'глибоке бікіні + ноги повністю',
    l_pak6: 'обличчя + все тіло',

    mas_30: 'Масаж 30 хвилин',
    mas_60: 'Масаж 60 хвилин',
    mas_twarz: 'обличчя',
    mas_6_twarz: '6 процедур / обличчя',
    mas_10_twarz: '10 процедур / обличчя',
    mas_cialo: 'все тіло',
    mas_6_cialo: '6 процедур / все тіло',
    mas_10_cialo: '10 процедур / все тіло',
    mas_note: 'Пакети з 6 процедур — на 10% дешевше, пакети з 10 процедур — на 20% дешевше.',

    contact_title: 'Контакти',
    contact_address: 'Адреса',
    contact_hours: 'Години роботи',
    contact_phone: 'Телефон',
    day_mon_fri: 'пн – пт',
    day_sat: 'субота',
    day_sun: 'неділя',
    closed: 'зачинено',

    lb_close: 'Закрити',
    lb_prev: 'Попереднє фото',
    lb_next: 'Наступне фото'
  }
};

/* ------------------------------------------------------------
   i18n
   ------------------------------------------------------------ */
const STORAGE_KEY = 'vbs-lang';
let currentLang = 'pl';

function readStoredLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
  } catch (e) { /* localStorage niedostępny */ }
  return 'pl';
}

function storeLang(lang) {
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
}

function t(key) {
  const dict = translations[currentLang] || translations.pl;
  return dict[key] !== undefined ? dict[key] : (translations.pl[key] || '');
}

function applyLang(lang) {
  currentLang = translations[lang] ? lang : 'pl';

  document.documentElement.lang = currentLang === 'ua' ? 'uk' : 'pl';

  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    const value = t(el.getAttribute('data-i18n'));
    if (value) el.textContent = value;
  });

  document.querySelectorAll('.lang-btn').forEach(function (btn) {
    const active = btn.getAttribute('data-lang') === currentLang;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  // alty galerii + etykiety lightboxa
  document.querySelectorAll('.gallery-item img').forEach(function (img) {
    img.alt = t(img.dataset.altKey || 'alt_work');
  });
  setLabel('lbClose', 'lb_close');
  setLabel('lbPrev', 'lb_prev');
  setLabel('lbNext', 'lb_next');

  storeLang(currentLang);
}

function setLabel(id, key) {
  const el = document.getElementById(id);
  if (el) el.setAttribute('aria-label', t(key));
}

document.querySelectorAll('.lang-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    applyLang(btn.getAttribute('data-lang'));
  });
});

/* ------------------------------------------------------------
   GALERIA
   ------------------------------------------------------------ */
const galleryEl = document.getElementById('gallery');
const loaded = []; // { src } — tylko zdjęcia, które istnieją

function altKeyFor(src) {
  const file = src.replace('img/', '');
  if (file.indexOf('interior') === 0) return 'alt_interior';
  if (file.indexOf('master') === 0) return 'alt_master';
  return 'alt_work';
}

function renderGallery() {
  if (!galleryEl) return;

  galleryImages.forEach(function (file) {
    const src = 'img/' + file;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.dataset.altKey = altKeyFor(src);
    img.alt = t(img.dataset.altKey);

    // brak pliku w /img → kafelek znika, siatka zostaje poprawna
    img.addEventListener('error', function () {
      btn.remove();
      const i = loaded.indexOf(src);
      if (i > -1) loaded.splice(i, 1);
      updateEmptyState();
    });

    btn.appendChild(img);
    btn.addEventListener('click', function () {
      openLightbox(loaded.indexOf(src));
    });

    galleryEl.appendChild(btn);
    loaded.push(src);
  });

  updateEmptyState();
}

function updateEmptyState() {
  if (!galleryEl) return;
  const existing = galleryEl.querySelector('.gallery-empty');
  if (loaded.length === 0) {
    if (!existing) {
      const p = document.createElement('p');
      p.className = 'gallery-empty';
      p.setAttribute('data-i18n', 'gallery_empty');
      p.textContent = t('gallery_empty');
      galleryEl.appendChild(p);
    }
  } else if (existing) {
    existing.remove();
  }
}

/* ------------------------------------------------------------
   LIGHTBOX
   ------------------------------------------------------------ */
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCounter = document.getElementById('lbCounter');
const lbStage = document.getElementById('lbStage');
let lbIndex = 0;

function openLightbox(index) {
  if (index < 0 || loaded.length === 0) return;
  lbIndex = index;
  showSlide();
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lb.hidden = true;
  lbImg.src = '';
  document.body.style.overflow = '';
}

function showSlide() {
  if (loaded.length === 0) { closeLightbox(); return; }
  lbIndex = (lbIndex + loaded.length) % loaded.length;
  lbImg.src = loaded[lbIndex];
  lbImg.alt = t(altKeyFor(loaded[lbIndex]));
  lbCounter.textContent = (lbIndex + 1) + ' / ' + loaded.length;
}

function step(delta) {
  lbIndex += delta;
  showSlide();
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', function () { step(-1); });
document.getElementById('lbNext').addEventListener('click', function () { step(1); });

lb.addEventListener('click', function (e) {
  if (e.target === lb || e.target === lbStage) closeLightbox();
});

document.addEventListener('keydown', function (e) {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'ArrowRight') step(1);
});

/* swipe na telefonie */
let touchX = 0;
let touchY = 0;

lbStage.addEventListener('touchstart', function (e) {
  touchX = e.changedTouches[0].clientX;
  touchY = e.changedTouches[0].clientY;
}, { passive: true });

lbStage.addEventListener('touchend', function (e) {
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
}, { passive: true });

/* ------------------------------------------------------------
   START
   ------------------------------------------------------------ */
renderGallery();
applyLang(readStoredLang());
