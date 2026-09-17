/* =========================================================
   Kalkulator gotówki (PLN)
   Wszystkie obliczenia w groszach (liczby całkowite),
   żeby nigdy nie zgubić ani jednego grosza na zaokrągleniu.
   ========================================================= */

(function () {
  'use strict';

  /** Nominały: kolory nawiązują do barw polskich banknotów i monet. */
  var NOMINALY = [
    { gr: 50000, etykieta: '500', jednostka: 'zł', typ: 'banknot', kolor: '#6a5ea8' },
    { gr: 20000, etykieta: '200', jednostka: 'zł', typ: 'banknot', kolor: '#bd8a2c' },
    { gr: 10000, etykieta: '100', jednostka: 'zł', typ: 'banknot', kolor: '#6d7f3f' },
    { gr:  5000, etykieta:  '50', jednostka: 'zł', typ: 'banknot', kolor: '#3f6ea8' },
    { gr:  2000, etykieta:  '20', jednostka: 'zł', typ: 'banknot', kolor: '#a4568d' },
    { gr:  1000, etykieta:  '10', jednostka: 'zł', typ: 'banknot', kolor: '#9a6b42' },
    { gr:   500, etykieta:   '5', jednostka: 'zł', typ: 'moneta',  kolor: '#9c7b3f' },
    { gr:   200, etykieta:   '2', jednostka: 'zł', typ: 'moneta',  kolor: '#8d8a80' },
    { gr:   100, etykieta:   '1', jednostka: 'zł', typ: 'moneta',  kolor: '#8d8a80' },
    { gr:    50, etykieta:  '50', jednostka: 'gr', typ: 'moneta',  kolor: '#8d8a80' },
    { gr:    20, etykieta:  '20', jednostka: 'gr', typ: 'moneta',  kolor: '#8d8a80' },
    { gr:    10, etykieta:  '10', jednostka: 'gr', typ: 'moneta',  kolor: '#8d8a80' },
    { gr:     5, etykieta:   '5', jednostka: 'gr', typ: 'moneta',  kolor: '#a9713f' },
    { gr:     2, etykieta:   '2', jednostka: 'gr', typ: 'moneta',  kolor: '#a9713f' },
    { gr:     1, etykieta:   '1', jednostka: 'gr', typ: 'moneta',  kolor: '#a9713f' }
  ];

  var MAKS_SZTUK = 99999;
  var KLUCZ_STANU = 'kasa.stan.v1';
  var KLUCZ_MOTYWU = 'kasa.motyw';

  var waluta = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  /** Grosze -> "1 234,56 zł" */
  function kwota(gr) {
    return waluta.format(gr / 100);
  }

  /** Polska odmiana liczebnika: 1 sztuka, 2 sztuki, 5 sztuk, 12 sztuk, 22 sztuki... */
  function odmiana(n, f1, f2, f5) {
    var n10 = n % 10;
    var n100 = n % 100;
    if (n === 1) return f1;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return f2;
    return f5;
  }

  /** "1 234,56" / "1234.56" / "1234" -> grosze; null gdy nie da się odczytać. */
  function naGrosze(tekst) {
    var s = String(tekst).replace(/[\s  ]/g, '').replace('zł', '').replace(',', '.');
    if (s === '' || !/^\d*\.?\d*$/.test(s)) return null;
    var liczba = parseFloat(s);
    if (isNaN(liczba)) return null;
    return Math.round(liczba * 100);
  }

  /** Udział kwoty w sumie, opisany po ludzku: 0,3% nie ma udawać 0%. */
  function udzial(czesc, calosc) {
    if (calosc <= 0 || czesc <= 0) return '0%';
    var p = czesc / calosc * 100;
    if (p < 0.5) return 'poniżej 1%';
    if (p > 99.5 && czesc < calosc) return 'ponad 99%';
    return Math.round(p) + '%';
  }

  var el = {
    listaBanknoty: document.getElementById('lista-banknoty'),
    listaMonety: document.getElementById('lista-monety'),
    metaBanknoty: document.getElementById('meta-banknoty'),
    metaMonety: document.getElementById('meta-monety'),
    sztBanknoty: document.getElementById('szt-banknoty'),
    sztMonety: document.getElementById('szt-monety'),
    suma: document.getElementById('suma'),
    kwotaBanknoty: document.getElementById('kwota-banknoty'),
    kwotaMonety: document.getElementById('kwota-monety'),
    kwotaRazem: document.getElementById('kwota-razem'),
    dodBanknoty: document.getElementById('dod-banknoty'),
    dodMonety: document.getElementById('dod-monety'),
    dodRazem: document.getElementById('dod-razem'),
    pasek: document.getElementById('pasek'),
    paskaBanknoty: document.getElementById('pasek-banknoty'),
    paskaMonety: document.getElementById('pasek-monety'),
    statNominaly: document.getElementById('stat-nominaly'),
    oczekiwana: document.getElementById('oczekiwana'),
    roznica: document.getElementById('roznica'),
    komunikat: document.getElementById('komunikat'),
    btnKopiuj: document.getElementById('btn-kopiuj'),
    btnWyczysc: document.getElementById('btn-wyczysc'),
    btnDrukuj: document.getElementById('btn-drukuj'),
    btnMotyw: document.getElementById('btn-motyw'),
    wydrukData: document.getElementById('wydruk-data')
  };

  var stan = wczytajStan();
  var wiersze = [];   // { dane, li, input, wartosc }
  var pola = [];      // inputy w kolejności — do nawigacji klawiaturą

  /* ---------------- pamięć przeglądarki ---------------- */

  function wczytajStan() {
    try {
      var zapis = JSON.parse(localStorage.getItem(KLUCZ_STANU) || '{}');
      var wynik = {};
      NOMINALY.forEach(function (n) {
        var v = parseInt(zapis[n.gr], 10);
        wynik[n.gr] = isFinite(v) && v > 0 ? Math.min(v, MAKS_SZTUK) : 0;
      });
      return wynik;
    } catch (e) {
      var puste = {};
      NOMINALY.forEach(function (n) { puste[n.gr] = 0; });
      return puste;
    }
  }

  function zapiszStan() {
    try {
      localStorage.setItem(KLUCZ_STANU, JSON.stringify(stan));
    } catch (e) { /* tryb prywatny — trudno, liczymy dalej */ }
  }

  /* ---------------- budowa wierszy ---------------- */

  function zbudujWiersz(dane) {
    var li = document.createElement('li');
    li.className = 'wiersz';
    li.style.setProperty('--kolor', dane.kolor);

    var zeton = document.createElement('span');
    zeton.className = 'wiersz__zeton';
    zeton.innerHTML =
      '<span class="wiersz__nominal"></span><span class="wiersz__jednostka"></span>';
    zeton.firstChild.textContent = dane.etykieta;
    zeton.lastChild.textContent = dane.jednostka;

    var opis = dane.etykieta + ' ' + dane.jednostka;

    var krok = document.createElement('div');
    krok.className = 'krok';

    var minus = document.createElement('button');
    minus.type = 'button';
    minus.className = 'krok__btn';
    minus.textContent = '−';
    minus.setAttribute('aria-label', 'Odejmij sztukę: ' + opis);

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'krok__input';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.placeholder = '0';
    input.setAttribute('aria-label', 'Liczba sztuk, nominał ' + opis);
    input.value = stan[dane.gr] ? String(stan[dane.gr]) : '';

    var plus = document.createElement('button');
    plus.type = 'button';
    plus.className = 'krok__btn';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Dodaj sztukę: ' + opis);

    krok.append(minus, input, plus);

    var wartosc = document.createElement('output');
    wartosc.className = 'wiersz__wartosc';
    wartosc.textContent = kwota(0);

    li.append(zeton, krok, wartosc);

    var wiersz = { dane: dane, li: li, input: input, wartosc: wartosc };

    minus.addEventListener('click', function () { zmien(wiersz, -1); });
    plus.addEventListener('click', function () { zmien(wiersz, 1); });

    input.addEventListener('input', function () {
      var czyste = input.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 5);
      if (czyste !== input.value) input.value = czyste;
      stan[dane.gr] = czyste === '' ? 0 : Math.min(parseInt(czyste, 10), MAKS_SZTUK);
      przelicz();
    });

    input.addEventListener('focus', function () { input.select(); });

    input.addEventListener('keydown', function (zdarzenie) {
      if (zdarzenie.key === 'ArrowUp') {
        zdarzenie.preventDefault();
        zmien(wiersz, 1);
      } else if (zdarzenie.key === 'ArrowDown') {
        zdarzenie.preventDefault();
        zmien(wiersz, -1);
      } else if (zdarzenie.key === 'Enter') {
        zdarzenie.preventDefault();
        przejdz(input, zdarzenie.shiftKey ? -1 : 1);
      } else if (zdarzenie.key === 'Escape') {
        zdarzenie.preventDefault();
        ustaw(wiersz, 0);
      }
    });

    wiersze.push(wiersz);
    pola.push(input);
    return li;
  }

  function ustaw(wiersz, ile) {
    stan[wiersz.dane.gr] = Math.max(0, Math.min(ile, MAKS_SZTUK));
    wiersz.input.value = stan[wiersz.dane.gr] ? String(stan[wiersz.dane.gr]) : '';
    przelicz();
  }

  function zmien(wiersz, o) {
    ustaw(wiersz, (stan[wiersz.dane.gr] || 0) + o);
  }

  function przejdz(zPola, kierunek) {
    var i = pola.indexOf(zPola);
    if (i === -1) return;
    var nastepne = pola[(i + kierunek + pola.length) % pola.length];
    nastepne.focus();
    nastepne.select();
  }

  /* ---------------- przeliczanie ---------------- */

  var poprzedniaSuma = 0;

  function podsumuj() {
    var wynik = {
      razem: 0,
      banknotyGr: 0, banknotySzt: 0,
      monetyGr: 0, monetySzt: 0,
      nominaly: 0
    };
    NOMINALY.forEach(function (n) {
      var szt = stan[n.gr] || 0;
      var gr = szt * n.gr;
      wynik.razem += gr;
      if (szt > 0) wynik.nominaly++;
      if (n.typ === 'banknot') {
        wynik.banknotyGr += gr;
        wynik.banknotySzt += szt;
      } else {
        wynik.monetyGr += gr;
        wynik.monetySzt += szt;
      }
    });
    return wynik;
  }

  function przelicz() {
    var s = podsumuj();

    wiersze.forEach(function (w) {
      var szt = stan[w.dane.gr] || 0;
      w.wartosc.textContent = kwota(szt * w.dane.gr);
      w.li.classList.toggle('jest-aktywny', szt > 0);
    });

    var sztukRazem = s.banknotySzt + s.monetySzt;

    el.suma.textContent = kwota(s.razem);

    el.sztBanknoty.textContent = s.banknotySzt + ' szt.';
    el.sztMonety.textContent = s.monetySzt + ' szt.';
    el.metaBanknoty.textContent = kwota(s.banknotyGr);
    el.metaMonety.textContent = kwota(s.monetyGr);

    el.kwotaBanknoty.textContent = kwota(s.banknotyGr);
    el.kwotaMonety.textContent = kwota(s.monetyGr);
    el.kwotaRazem.textContent = kwota(s.razem);

    var udzialBanknotow = udzial(s.banknotyGr, s.razem);
    var udzialMonet = udzial(s.monetyGr, s.razem);

    el.dodBanknoty.textContent = s.banknotySzt + ' szt. · ' + udzialBanknotow;
    el.dodMonety.textContent = s.monetySzt + ' szt. · ' + udzialMonet;
    el.dodRazem.textContent = sztukRazem + ' ' + odmiana(sztukRazem, 'sztuka', 'sztuki', 'sztuk');

    var procentBanknotow = s.razem > 0 ? (s.banknotyGr / s.razem * 100) : 0;
    el.paskaBanknoty.style.width = procentBanknotow + '%';
    el.paskaMonety.style.width = (s.razem > 0 ? 100 - procentBanknotow : 0) + '%';
    el.pasek.setAttribute('aria-label', s.razem > 0
      ? 'Banknoty: ' + kwota(s.banknotyGr) + ' (' + udzialBanknotow + '), monety: ' +
        kwota(s.monetyGr) + ' (' + udzialMonet + ')'
      : 'Nic jeszcze nie policzono');

    el.statNominaly.textContent = String(s.nominaly);

    if (s.razem !== poprzedniaSuma) {
      el.suma.classList.add('drgnij');
      setTimeout(function () { el.suma.classList.remove('drgnij'); }, 180);
      poprzedniaSuma = s.razem;
    }

    pokazRoznice(s.razem);
    zapiszStan();
  }

  /* ---------------- porównanie z kwotą ---------------- */

  function pokazRoznice(razem) {
    if (!el.oczekiwana) return;
    var wpis = el.oczekiwana.value.trim();
    if (wpis === '') {
      el.roznica.textContent = 'Wpisz kwotę, aby zobaczyć różnicę.';
      el.roznica.removeAttribute('data-stan');
      return;
    }
    var cel = naGrosze(wpis);
    if (cel === null) {
      el.roznica.textContent = 'Nie rozumiem tej kwoty — wpisz np. 1500,00';
      el.roznica.removeAttribute('data-stan');
      return;
    }
    var r = razem - cel;
    if (r === 0) {
      el.roznica.textContent = 'Zgadza się co do grosza.';
      el.roznica.dataset.stan = 'zgoda';
    } else if (r > 0) {
      el.roznica.textContent = 'Nadwyżka: ' + kwota(r);
      el.roznica.dataset.stan = 'nadwyzka';
    } else {
      el.roznica.textContent = 'Niedobór: ' + kwota(-r);
      el.roznica.dataset.stan = 'niedobor';
    }
  }

  /* ---------------- zestawienie tekstowe ---------------- */

  function zestawienie() {
    var s = podsumuj();
    var teraz = new Date().toLocaleString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    var linie = ['Kalkulator gotówki — ' + teraz, ''];

    ['banknot', 'moneta'].forEach(function (typ) {
      var pozycje = NOMINALY.filter(function (n) { return n.typ === typ && (stan[n.gr] || 0) > 0; });
      if (!pozycje.length) return;
      linie.push(typ === 'banknot' ? 'BANKNOTY' : 'MONETY');
      pozycje.forEach(function (n) {
        var szt = stan[n.gr];
        linie.push('  ' + n.etykieta + ' ' + n.jednostka + ' × ' + szt + ' = ' + kwota(szt * n.gr));
      });
      linie.push('');
    });

    linie.push('W banknotach: ' + kwota(s.banknotyGr) + '  (' + s.banknotySzt + ' szt. · ' +
      udzial(s.banknotyGr, s.razem) + ')');
    linie.push('W monetach:   ' + kwota(s.monetyGr) + '  (' + s.monetySzt + ' szt. · ' +
      udzial(s.monetyGr, s.razem) + ')');
    linie.push('RAZEM:        ' + kwota(s.razem) + '  (' + (s.banknotySzt + s.monetySzt) + ' szt.)');

    if (el.oczekiwana && el.oczekiwana.value.trim() !== '') {
      var cel = naGrosze(el.oczekiwana.value);
      if (cel !== null) {
        var r = s.razem - cel;
        linie.push('Kwota oczekiwana: ' + kwota(cel));
        linie.push(r === 0 ? 'Zgadza się co do grosza.'
          : (r > 0 ? 'Nadwyżka: ' + kwota(r) : 'Niedobór: ' + kwota(-r)));
      }
    }

    return linie.join('\n');
  }

  function doSchowka(tekst) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(tekst);
    }
    return new Promise(function (spelnij, odrzuc) {
      var pomoc = document.createElement('textarea');
      pomoc.value = tekst;
      pomoc.setAttribute('readonly', '');
      pomoc.style.position = 'fixed';
      pomoc.style.opacity = '0';
      document.body.appendChild(pomoc);
      pomoc.select();
      try {
        document.execCommand('copy') ? spelnij() : odrzuc();
      } catch (e) {
        odrzuc(e);
      } finally {
        document.body.removeChild(pomoc);
      }
    });
  }

  /* ---------------- komunikat (toast) ---------------- */

  var licznikKomunikatu;

  function pokazKomunikat(tekst, akcja) {
    clearTimeout(licznikKomunikatu);
    el.komunikat.textContent = '';
    el.komunikat.appendChild(document.createTextNode(tekst));

    if (akcja) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = akcja.etykieta;
      btn.addEventListener('click', function () {
        akcja.wykonaj();
        schowajKomunikat();
      });
      el.komunikat.appendChild(btn);
    }

    el.komunikat.classList.add('widoczny');
    licznikKomunikatu = setTimeout(schowajKomunikat, akcja ? 8000 : 2600);
  }

  function schowajKomunikat() {
    clearTimeout(licznikKomunikatu);
    el.komunikat.classList.remove('widoczny');
  }

  /* ---------------- akcje ---------------- */

  function wyczysc() {
    var kopia = {};
    var cokolwiek = false;
    NOMINALY.forEach(function (n) {
      kopia[n.gr] = stan[n.gr] || 0;
      if (kopia[n.gr] > 0) cokolwiek = true;
    });

    if (!cokolwiek) {
      pokazKomunikat('Nie ma czego czyścić.');
      return;
    }

    wiersze.forEach(function (w) {
      stan[w.dane.gr] = 0;
      w.input.value = '';
    });
    przelicz();

    pokazKomunikat('Wyczyszczono.', {
      etykieta: 'Cofnij',
      wykonaj: function () {
        wiersze.forEach(function (w) {
          stan[w.dane.gr] = kopia[w.dane.gr];
          w.input.value = kopia[w.dane.gr] ? String(kopia[w.dane.gr]) : '';
        });
        przelicz();
      }
    });
  }

  function przelaczMotyw() {
    var nowy = document.documentElement.dataset.motyw === 'ciemny' ? 'jasny' : 'ciemny';
    document.documentElement.dataset.motyw = nowy;
    try { localStorage.setItem(KLUCZ_MOTYWU, nowy); } catch (e) {}
  }

  /* ---------------- start ---------------- */

  NOMINALY.forEach(function (n) {
    var lista = n.typ === 'banknot' ? el.listaBanknoty : el.listaMonety;
    lista.appendChild(zbudujWiersz(n));
  });

  el.btnKopiuj.addEventListener('click', function () {
    doSchowka(zestawienie())
      .then(function () { pokazKomunikat('Zestawienie skopiowane.'); })
      .catch(function () { pokazKomunikat('Nie udało się skopiować.'); });
  });

  el.btnWyczysc.addEventListener('click', wyczysc);
  el.btnDrukuj.addEventListener('click', function () { window.print(); });
  el.btnMotyw.addEventListener('click', przelaczMotyw);

  el.oczekiwana.addEventListener('input', function () { pokazRoznice(podsumuj().razem); });

  function ostempluj() {
    el.wydrukData.textContent = new Date().toLocaleString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
  window.addEventListener('beforeprint', ostempluj);
  ostempluj();

  przelicz();
})();
