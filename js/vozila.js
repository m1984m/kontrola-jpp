// 100 vozil
const VOZILA = [
  {
    "reg": "MB LK 454",
    "znamka": "SCANIA",
    "tip": "CN 280",
    "kapaciteta": 50
  },
  {
    "reg": "MB LF 054",
    "znamka": "SCANIA",
    "tip": "CN 280",
    "kapaciteta": 50
  },
  {
    "reg": "MB EE 160",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LE",
    "kapaciteta": 50
  },
  {
    "reg": "MB EE 161",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LE",
    "kapaciteta": 50
  },
  {
    "reg": "MB EE 162",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LE",
    "kapaciteta": 50
  },
  {
    "reg": "MB EE 163",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LE",
    "kapaciteta": 50
  },
  {
    "reg": "MB FF 763",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "kapaciteta": 50
  },
  {
    "reg": "MB FF 764",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "kapaciteta": 50
  },
  {
    "reg": "MB FF 765",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "kapaciteta": 50
  },
  {
    "reg": "MB FF 766",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "kapaciteta": 50
  },
  {
    "reg": "MB FF 767",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "kapaciteta": 50
  },
  {
    "reg": "MB JN 711",
    "znamka": "IVECO",
    "tip": "Feniks",
    "kapaciteta": 50
  },
  {
    "reg": "MB JN 712",
    "znamka": "IVECO",
    "tip": "Feniks",
    "kapaciteta": 50
  },
  {
    "reg": "MB JN 713",
    "znamka": "IVECO",
    "tip": "CROSSWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB JN 714",
    "znamka": "IVECO",
    "tip": "CROSSWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB JN 715",
    "znamka": "IVECO",
    "tip": "CROSSWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB JN 716",
    "znamka": "IVECO",
    "tip": "CROSSWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 01",
    "znamka": "ISUZU",
    "tip": "CITY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 02",
    "znamka": "ISUZU",
    "tip": "CITY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 03",
    "znamka": "ISUZU",
    "tip": "CITY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 04",
    "znamka": "ISUZU",
    "tip": "CITY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 05",
    "znamka": "ISUZU",
    "tip": "CITY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 10",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 11",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 12",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 13",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 14",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "kapaciteta": 50
  },
  {
    "reg": "MB EP 144",
    "znamka": "HEULIEZ",
    "tip": "GX 137",
    "kapaciteta": 50
  },
  {
    "reg": "MB PD 266",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "kapaciteta": 50
  },
  {
    "reg": "MB PD 267",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "kapaciteta": 50
  },
  {
    "reg": "MB PD 268",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "kapaciteta": 50
  },
  {
    "reg": "MB PD 269",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 15",
    "znamka": "MAN",
    "tip": "Lions CITY A\"&",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 16",
    "znamka": "Mercedes",
    "tip": "CITARO O530",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 17",
    "znamka": "Mercedes",
    "tip": "CITARO O530",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 18",
    "znamka": "Mercedes",
    "tip": "CITARO O531",
    "kapaciteta": 50
  },
  {
    "reg": "MB BF 034",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PPROM 19",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PPROM 20",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PPROM 21",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PPROM 22",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PPROM 23",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PPROM 24",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PPROM 27",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PPROM 28",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB92 PFG",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB91 PFG",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB27 SZL",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB26 SZL",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB67 RRI",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB68 RRI",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB93 PFG",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM32",
    "znamka": "IVECO",
    "tip": "GXELE",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM33",
    "znamka": "IVECO",
    "tip": "GXELE",
    "kapaciteta": 50
  },
  {
    "reg": "MB PR0M36",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PR0M37",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB 45-VHE",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB 47-PVJ",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB 49-PVJ",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB 38-LVR",
    "znamka": "Mercedes",
    "tip": "CITARO",
    "kapaciteta": 50
  },
  {
    "reg": "MB 37-LVR",
    "znamka": "Mercedes",
    "tip": "CITARO",
    "kapaciteta": 50
  },
  {
    "reg": "MB 39-LVR",
    "znamka": "Mercedes",
    "tip": "CITARO",
    "kapaciteta": 50
  },
  {
    "reg": "MB PR0M38",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PR0M39",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PR0M40",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB PR0M41",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "kapaciteta": 50
  },
  {
    "reg": "MB ZE 020",
    "znamka": "Kutsenitc",
    "tip": "CITY VI",
    "kapaciteta": 50
  },
  {
    "reg": "MB AP 310",
    "znamka": "TEMSA",
    "tip": "Safari 12",
    "kapaciteta": 50
  },
  {
    "reg": "MB ZE 641",
    "znamka": "IVECO",
    "tip": "Feniks",
    "kapaciteta": 50
  },
  {
    "reg": "MB JF 308",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 85 L",
    "kapaciteta": 50
  },
  {
    "reg": "MB JN 972",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 85 L",
    "kapaciteta": 50
  },
  {
    "reg": "MB JN 973",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 85 L",
    "kapaciteta": 50
  },
  {
    "reg": "MB JF 324",
    "znamka": "SCANIA",
    "tip": "TOURING HD",
    "kapaciteta": 50
  },
  {
    "reg": "MB JF 325",
    "znamka": "SCANIA",
    "tip": "TOURING HD",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM 08",
    "znamka": "ISUZU",
    "tip": "TURKUOISE",
    "kapaciteta": 50
  },
  {
    "reg": "MB ES 295",
    "znamka": "SCANIA",
    "tip": "TOURING HD",
    "kapaciteta": 50
  },
  {
    "reg": "MB UI 439",
    "znamka": "IVECO",
    "tip": "FeniksBUS F083M385",
    "kapaciteta": 50
  },
  {
    "reg": "MB98 JLD",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 87 ME",
    "kapaciteta": 50
  },
  {
    "reg": "MB PR0M29",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 87 ME",
    "kapaciteta": 50
  },
  {
    "reg": "MB 09 VHE",
    "znamka": "IVECO",
    "tip": "FeniksBUS",
    "kapaciteta": 50
  },
  {
    "reg": "MB M 01",
    "znamka": "Esagono",
    "tip": "Grifo",
    "kapaciteta": 50
  },
  {
    "reg": "MB GI 69",
    "znamka": "Eagle",
    "tip": "NaN",
    "kapaciteta": 50
  },
  {
    "reg": "MB M 02",
    "znamka": "Esagono",
    "tip": "Grifo",
    "kapaciteta": 50
  },
  {
    "reg": "MB M 03",
    "znamka": "Esagono",
    "tip": "Grifo",
    "kapaciteta": 50
  },
  {
    "reg": "MB VLAKEC",
    "znamka": "Esagono",
    "tip": "E",
    "kapaciteta": 50
  },
  {
    "reg": "MB PR0M 30",
    "znamka": "MAN",
    "tip": "A20 B14",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM34",
    "znamka": "Mercedes",
    "tip": "345L457",
    "kapaciteta": 50
  },
  {
    "reg": "MB PROM35",
    "znamka": "IRISBUS",
    "tip": "SER150",
    "kapaciteta": 50
  },
  {
    "reg": "MB KL 493",
    "znamka": "Mercedes",
    "tip": "CONECTO",
    "kapaciteta": 50
  },
  {
    "reg": "MB KL 494",
    "znamka": "Mercedes",
    "tip": "CONECTO",
    "kapaciteta": 50
  },
  {
    "reg": "MB KL 496",
    "znamka": "Mercedes",
    "tip": "CONECTO",
    "kapaciteta": 50
  },
  {
    "reg": "MB KL 497",
    "znamka": "Mercedes",
    "tip": "CONECTO",
    "kapaciteta": 50
  },
  {
    "reg": "MB DM 375",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "kapaciteta": 50
  },
  {
    "reg": "MB FT 041",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "kapaciteta": 50
  },
  {
    "reg": "MB FT 042",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "kapaciteta": 50
  },
  {
    "reg": "MB TU 840",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "kapaciteta": 50
  },
  {
    "reg": "MB TU 841",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "kapaciteta": 50
  },
  {
    "reg": "MB 71 SEC",
    "znamka": "Mercedes",
    "tip": "EQV",
    "kapaciteta": 50
  },
  {
    "reg": "MB 72 SEC",
    "znamka": "Mercedes",
    "tip": "EQV",
    "kapaciteta": 50
  },
  {
    "reg": "MB 73 SEC",
    "znamka": "Mercedes",
    "tip": "EQV",
    "kapaciteta": 50
  }
];
