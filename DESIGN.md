# Kontrola JPP — Design System

Dva vizualna moda, oba izpeljana iz OCPS MOM branding (ocps.maribor.si).

## Tipografija

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

--font-heading: 'DM Serif Display', serif;
--font-body: 'DM Sans', system-ui, -apple-system, sans-serif;
--font-mono: 'DM Sans', monospace;  /* za ure, številke */
```

| Element | Font | Weight | Size (mobile) | Size (desktop) |
|---------|------|--------|---------------|----------------|
| H1 | DM Serif Display | 700 | 28px | 40px |
| H2 | DM Serif Display | 700 | 22px | 30px |
| H3 | DM Sans | 700 | 18px | 22px |
| Body | DM Sans | 400 | 16px | 16px |
| Small | DM Sans | 400 | 13px | 14px |
| Timer/ura | DM Sans | 700 | 48px | 48px |
| Stevilke (potniki) | DM Sans | 700 | 32px | 32px |

---

## Modo 1: Field App (Dark)

Kontrolor na avtobusu — ena roka, tresenje, spremenljiva svetloba.

### Barve

```css
:root[data-mode="field"] {
  /* Osnova */
  --bg:            #1a1a2e;    /* globoki indigo-črna */
  --bg-surface:    #222240;    /* kartica / panel */
  --bg-elevated:   #2a2a4a;    /* dvignjen element (active stop) */
  --bg-input:      #16162b;    /* input polja */

  /* Tekst */
  --text:          #f3ede6;    /* OCPS bež kot tekst na temnem */
  --text-muted:    #8a8a9e;    /* sekundarno */
  --text-dim:      #5a5a6e;    /* tercialno */

  /* Akcent — OCPS rdeča */
  --primary:       #d6304a;    /* CTA gumbi, aktivni elementi */
  --primary-glow:  rgba(214, 48, 74, 0.25);  /* glow efekt */

  /* Status barve */
  --on-time:       #3a8c5c;    /* OCPS zelena — točno */
  --on-time-bg:    rgba(58, 140, 92, 0.15);
  --slight-delay:  #e8734a;    /* OCPS oranžna — zamuda <3 min */
  --slight-delay-bg: rgba(232, 115, 74, 0.15);
  --big-delay:     #d6304a;    /* OCPS rdeča — zamuda >3 min */
  --big-delay-bg:  rgba(214, 48, 74, 0.15);
  --early:         #3a6b8c;    /* OCPS modra — prezgodaj */
  --early-bg:      rgba(58, 107, 140, 0.15);

  /* Utility */
  --border:        rgba(255, 255, 255, 0.08);
  --shadow:        0 4px 24px rgba(0, 0, 0, 0.4);
  --radius-sm:     8px;
  --radius:        14px;
  --radius-lg:     20px;
  --radius-full:   999px;
}
```

### Touch Targets

```css
/* Minimalna velikost tapkljivih elementov na terenu */
--touch-min:     56px;     /* absolutni minimum */
--touch-target:  72px;     /* priporočeno za avtobus (tresenje) */
--touch-large:   88px;     /* PRISPEL gumb, +/- potniki */
```

### Komponente — Field

**Progress Bar (postaje)**
```
┌──────────────────────────────────────────────┐
│ ●───●───●───◉═══○───○───○───○               │
│ 1   2   3   4   5   6   7   8               │
│              ▲ trenutna postaja               │
└──────────────────────────────────────────────┘
- Obiskane: ● polna pika (--text)
- Trenutna: ◉ velik krog z glow (--primary + --primary-glow)
- Prihajajoče: ○ prazen krog (--text-dim)
- Linija: ═ med obisaknimi je svetla, --- prihajajoče temna
```

**Postaja kartica (live mode)**
```
┌──────────────────────────────────────────────┐
│  ┌──────────────────────────────────────┐    │
│  │ 4 / 11                    ⏱ +1 min  │    │
│  │ Europark - Titov most               │    │
│  │                                      │    │
│  │ Načrt: 10:07     Dejansko: 10:08    │    │
│  │                                      │    │
│  │  ┌───────────────────────────────┐   │    │
│  │  │       [ PRISPEL ▶ ]          │   │    │
│  │  └───────────────────────────────┘   │    │
│  │                                      │    │
│  │ Sedeči    Stoječi     Vstopili      │    │
│  │ [- 17 +]  [- 1 +]    [- 3 +]       │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │        [ NAPREJ ▶▶ ]                │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘

- Zamuda badge: zaokrožen pill z barvno ozadjem
  - "točno" ali "<1 min": --on-time-bg + --on-time tekst
  - "+1–3 min": --slight-delay-bg + --slight-delay tekst
  - ">3 min": --big-delay-bg + --big-delay tekst
  - prezgodaj: --early-bg + --early tekst
- [PRISPEL] gumb: --primary bg, bel tekst, 88px visok, radius-full
- [+/-] gumbi: --bg-elevated bg, 72px x 72px, radius-full
- Številka med +/-: --font-body 32px bold
```

**Checklist kartica (1.3 — kakovost)**
```
┌──────────────────────────────────────────────┐
│  6 / 14                                      │
│  ─────────────────────── progress bar        │
│                                              │
│  1.6 Zvočen signal za sledečo postajo        │
│                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │DOBRO │ │ZADOV.│ │NEZAD.│ │SLABO │       │
│  │  😊  │ │  🙂  │ │  😐  │ │  😞  │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│                                              │
│            ┌──────┐                          │
│            │ N/A  │                          │
│            └──────┘                          │
│                                              │
│  Opombe: [________________]                  │
│                                              │
│  [ ◀ NAZAJ ]           [ NAPREJ ▶ ]         │
└──────────────────────────────────────────────┘

- Ocene: toggle gumbi, 72px visoki
  - Neizbran: --bg-surface, --text-muted obroba
  - Izbran DOBRO: --on-time-bg, --on-time obroba + tekst
  - Izbran ZADOV: --slight-delay-bg (blago)
  - Izbran NEZAD: --slight-delay-bg + --slight-delay obroba
  - Izbran SLABO: --big-delay-bg, --big-delay obroba
  - N/A: --text-dim bg
```

**Da/Delno/Ne ocena (1.4–1.6)**
```
┌───────────────────────────────┐
│  Prijaznost                   │
│                               │
│  ┌────┐  ┌──────┐  ┌────┐   │
│  │ DA │  │DELNO │  │ NE │   │
│  │ 2  │  │  1   │  │ 0  │   │
│  └────┘  └──────┘  └────┘   │
│                               │
│  Opombe: [________________]   │
└───────────────────────────────┘

- Isti toggle pattern kot zgoraj
- DA: --on-time, DELNO: --slight-delay, NE: --big-delay
```

---

## Modo 2: Dashboard (Light)

Analiza podatkov na desktopju — direktno OCPS paleta.

### Barve

```css
:root[data-mode="dashboard"] {
  /* Osnova — direktno iz OCPS */
  --bg:            #f3ede6;    /* topla bež */
  --bg-light:      #faf7f3;    /* svetlejša bež */
  --bg-card:       #ffffff;    /* kartice */
  --bg-nav:        rgba(243, 237, 230, 0.92);  /* sticky nav */

  /* Tekst */
  --text:          #1a1a1a;
  --text-light:    #5a5a5a;
  --text-muted:    #8a8a8a;

  /* Akcent */
  --primary:       #d6304a;    /* OCPS rdeča */
  --primary-light: #f9e8eb;

  /* Status (enako kot field) */
  --on-time:       #3a8c5c;
  --on-time-light: #e8f5ee;
  --warning:       #e8734a;
  --warning-light: #fef0eb;
  --danger:        #d6304a;
  --danger-light:  #f9e8eb;
  --info:          #3a6b8c;
  --info-light:    #e8f0f5;

  /* Stebri OCPS (za kategorizacijo) */
  --steber-cpn:    #3a6b8c;    /* Načrtovanje — modra */
  --steber-hoja:   #3a8c5c;    /* Hoja — zelena */
  --steber-kolo:   #e8734a;    /* Kolesarjenje — oranžna */
  --steber-jpp:    #d6304a;    /* JPP — rdeča (poudarek!) */
  --steber-mp:     #8a8a8a;    /* Motorni promet — siva */

  /* Utility */
  --border:        #e0d8cf;
  --shadow:        0 2px 16px rgba(0, 0, 0, 0.06);
  --shadow-hover:  0 4px 24px rgba(0, 0, 0, 0.10);
  --radius-sm:     8px;
  --radius:        14px;
  --radius-lg:     20px;
}
```

### Komponente — Dashboard

**KPI kartica**
```
┌─────────────────────────┐
│  Povpr. zamuda           │  ← --text-light, DM Sans 13px
│  +1.8 min               │  ← --warning, DM Sans 32px bold
│  ▲ 0.3 od prejšnjega    │  ← trend indikator
│  tedna                   │
└─────────────────────────┘
- bg: --bg-card
- border-radius: --radius
- shadow: --shadow
- hover: --shadow-hover + translateY(-2px)
- 4 kartice v vrsti: zamuda, zasedenost, kakovost, ocena voznika
```

**Graf barve (Chart.js / Plotly)**
```
Zamude po linijah:    #d6304a (bar), #f9e8eb (ozadje)
Zasedenost:           #3a6b8c (line), #e8f0f5 (fill)
Kakovost radar:       #3a8c5c (line), rgba(58,140,92,0.1) (fill)
Vozniki trend:        #e8734a (line)
Multi-linija graf:    uporabi steber barve (cpn, hoja, kolo, jpp, mp)
```

**Filtrirljiva tabela**
```
┌─────────────────────────────────────────────────────┐
│ Kontrole                                [🔍 Išči]   │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │
│ │Vse │ │ G1 │ │ G2 │ │ P7 │  ...  filter pills    │
│ └────┘ └────┘ └────┘ └────┘                        │
│─────────────────────────────────────────────────────│
│ Datum  │ Linija │ Kontrolor │ Zamuda │ Kakovost    │
│ 9.4.   │ G1     │ J. Novak  │ +1.8   │ 3.4/4      │
│ 9.4.   │ G3     │ M. Horvat │ -0.5   │ 3.8/4      │
│ ...                                                 │
└─────────────────────────────────────────────────────┘
- Filter pills: aktivni = --primary bg + bel tekst
  neaktivni = --bg-light bg + --text-light tekst
- Tabela: --bg-card bg, --border obroba
- Sortirljivi stolpci: klik za ASC/DESC
```

**Zamude na karti**
```
- Mapbox/MapLibre ozadje
- Postaje kot krogi z barvo glede na povp. zamudo:
  - Zelena (--on-time): <1 min
  - Oranžna (--warning): 1-3 min
  - Rdeča (--danger): >3 min
- Velikost kroga = povp. št. potnikov
```

---

## Layout

### Field App (mobile-first, max 480px)
```
- Single column
- Sticky header: linija + smer + postaja progress
- Swipe navigacija med postajami (touch gesture)
- Bottom action bar: fiksni gumb PRISPEL / NAPREJ
- No scroll za glavno akcijo — vse na enem zaslonu
- Safe area padding za notch / home indicator
```

### Dashboard (responsive, 768px+)
```
- Sidebar: navigacija (Pregled, Kontrole, Linije, Vozniki)
- Main: KPI kartice (grid 2x2 ali 4x1)
- Pod KPI: dva grafa v vrsti (flex wrap)
- Spodaj: filtrirljiva tabela (full width)
- Breakpoints: 768px (tablet), 1024px (desktop), 1440px (wide)
```

---

## Animacije

```css
/* Prehodi */
--transition-fast:   150ms ease-out;
--transition:        250ms ease-out;
--transition-slow:   400ms ease-out;

/* Field specifično */
.stop-enter      { animation: slideInRight 300ms ease-out; }
.stop-exit       { animation: slideOutLeft 200ms ease-in; }
.delay-badge     { animation: pulseGlow 2s infinite; }  /* za velike zamude */
.arrived-confirm { animation: scaleConfirm 300ms ease-out; }  /* ob tapku PRISPEL */

/* Dashboard specifično */
.card-hover      { transition: transform var(--transition), box-shadow var(--transition); }
.card-hover:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
.number-change   { animation: countUp 600ms ease-out; }
```

---

## Ikone

Lucide Icons (lucide.dev) — lahke, konsistentne, MIT licenca.

| Kontekst | Ikona |
|----------|-------|
| Postaja | `map-pin` |
| Ura/čas | `clock` |
| Potniki (sedeči) | `armchair` |
| Potniki (stoječi) | `person-standing` |
| Vstopili | `user-plus` |
| Zamuda | `timer` |
| Točno | `check-circle` |
| Linija/bus | `bus` |
| Smer | `arrow-right` |
| Checklist | `clipboard-check` |
| Voznik | `user` |
| Vozilo | `truck` |  
| Dashboard | `bar-chart-3` |
| Nastavitve | `settings` |
