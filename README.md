# Kalkulator gotówki (PLN)

Prosta, jednostronicowa strona do szybkiego liczenia gotówki w złotówkach.
Wpisujesz liczbę sztuk przy nominale — suma liczy się od razu.

**Демо-описание (RU):** сайт для быстрого пересчёта наличных в польских злотых —
вводишь количество купюр и монет каждого номинала, сумма считается мгновенно.

## Co potrafi

- **Wszystkie nominały PLN** — banknoty 500, 200, 100, 50, 20, 10 zł
  oraz monety 5, 2, 1 zł i 50, 20, 10, 5, 2, 1 gr.
- **Liczy w locie** — wartość każdego wiersza oraz rozbicie kwoty: ile złotych leży
  w banknotach, ile w monetach i ile razem, z liczbą sztuk, udziałem procentowym
  i paskiem proporcji.
- **Szybkie wpisywanie** — przyciski `−` / `+` oraz skróty klawiszowe:
  `Enter` (następne pole), `Shift`+`Enter` (poprzednie), `↑` / `↓` (dodaj lub odejmij sztukę),
  `Esc` (wyczyść pole).
- **Porównanie z kwotą** — pokazuje nadwyżkę albo niedobór względem kwoty oczekiwanej.
- **Kopiowanie zestawienia** do schowka i **wydruk** przygotowany pod kartkę A4.
- **Zapis w przeglądarce** — odświeżenie strony nie kasuje wpisanych sztuk.
- **Wyczyść z możliwością cofnięcia**, motyw jasny i ciemny.
- **Na telefonie** pasek sumy jest zwinięty do jednej linii (suma, pasek proporcji
  i rozbicie na banknoty/monety), a szczegóły i przyciski rozwija się jednym dotknięciem.

## Dokładność

Wszystkie obliczenia idą na liczbach całkowitych w groszach, więc żaden grosz
nie ginie na zaokrągleniach zmiennoprzecinkowych. Kwoty formatuje `Intl.NumberFormat`
w ustawieniach `pl-PL`.

## Uruchomienie

Strona jest statyczna — nie wymaga budowania ani zależności.

```bash
# dowolny serwer statyczny, np.:
npx http-server . -p 8080
# albo po prostu otwórz index.html w przeglądarce
```

## Aktualizacja wdrożonej strony

Pliki nie mają skrótów w nazwach, dlatego `netlify.toml` i `_headers` każą przeglądarce
sprawdzać CSS i JS przy każdym wejściu (`max-age=0, must-revalidate`), a `index.html`
odwołuje się do nich z parametrem `?v=`. Przy kolejnej zmianie `assets/` podnieś ten
numer w `index.html` — inaczej telefon może połączyć nowy HTML ze starymi plikami
z pamięci podręcznej i układ się rozjedzie.

## Wdrożenie (Netlify)

Publikowany katalog to katalog główny repozytorium (`publish = "."` w `netlify.toml`),
bez polecenia budowania. Wystarczy podpiąć repozytorium lub przeciągnąć folder
do Netlify Drop.

## Struktura

```
index.html          — struktura strony (treść po polsku)
assets/styles.css   — motyw jasny/ciemny, układ, wydruk
assets/app.js       — nominały, liczenie w groszach, skróty, zapis stanu
netlify.toml        — konfiguracja wdrożenia
```
