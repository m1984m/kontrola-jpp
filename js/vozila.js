// 103 vozil (vir: Seznam_vozil.xlsx, 2026-04-13)
const VOZILA = [
  {
    "reg": "MB 09 VHE",
    "znamka": "IVECO",
    "tip": "FeniksBUS",
    "sedezi": 26,
    "stojisca": 9,
    "kapaciteta": 35
  },
  {
    "reg": "MB 26 SZL",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 28,
    "stojisca": 51,
    "kapaciteta": 79
  },
  {
    "reg": "MB 27 SZL",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 28,
    "stojisca": 51,
    "kapaciteta": 79
  },
  {
    "reg": "MB 45-VHE",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 30,
    "stojisca": 45,
    "kapaciteta": 75
  },
  {
    "reg": "MB 47-PVJ",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 30,
    "stojisca": 48,
    "kapaciteta": 78
  },
  {
    "reg": "MB 49-PVJ",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 30,
    "stojisca": 48,
    "kapaciteta": 78
  },
  {
    "reg": "MB 53 SEC",
    "znamka": "Mercedes",
    "tip": "Sprinter",
    "sedezi": 22,
    "stojisca": 0,
    "kapaciteta": 22
  },
  {
    "reg": "MB 54 SEC",
    "znamka": "Mercedes",
    "tip": "Sprinter",
    "sedezi": 22,
    "stojisca": 0,
    "kapaciteta": 22
  },
  {
    "reg": "MB 67 RRI",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 28,
    "stojisca": 51,
    "kapaciteta": 79
  },
  {
    "reg": "MB 68 RRI",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 28,
    "stojisca": 51,
    "kapaciteta": 79
  },
  {
    "reg": "MB 71 SEC",
    "znamka": "Mercedes",
    "tip": "EQV",
    "sedezi": 8,
    "stojisca": 0,
    "kapaciteta": 8
  },
  {
    "reg": "MB 72 SEC",
    "znamka": "Mercedes",
    "tip": "EQV",
    "sedezi": 8,
    "stojisca": 0,
    "kapaciteta": 8
  },
  {
    "reg": "MB 73 SEC",
    "znamka": "Mercedes",
    "tip": "EQV",
    "sedezi": 8,
    "stojisca": 0,
    "kapaciteta": 8
  },
  {
    "reg": "MB 91 PFG",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 28,
    "stojisca": 51,
    "kapaciteta": 79
  },
  {
    "reg": "MB 92 PFG",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 28,
    "stojisca": 51,
    "kapaciteta": 79
  },
  {
    "reg": "MB 93 PFG",
    "znamka": "IVECO",
    "tip": "STREETWAY",
    "sedezi": 28,
    "stojisca": 51,
    "kapaciteta": 79
  },
  {
    "reg": "MB 94 REN",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "sedezi": 17,
    "stojisca": 0,
    "kapaciteta": 17
  },
  {
    "reg": "MB 98 JLD",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 87 ME",
    "sedezi": 20,
    "stojisca": 14,
    "kapaciteta": 34
  },
  {
    "reg": "MB BF 034",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "sedezi": 30,
    "stojisca": 42,
    "kapaciteta": 72
  },
  {
    "reg": "MB DM 375",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "sedezi": 9,
    "stojisca": 0,
    "kapaciteta": 9
  },
  {
    "reg": "MB EE 160",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LE",
    "sedezi": 41,
    "stojisca": 54,
    "kapaciteta": 95
  },
  {
    "reg": "MB EE 161",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LE",
    "sedezi": 41,
    "stojisca": 54,
    "kapaciteta": 95
  },
  {
    "reg": "MB EE 162",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LE",
    "sedezi": 41,
    "stojisca": 54,
    "kapaciteta": 95
  },
  {
    "reg": "MB EE 163",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LE",
    "sedezi": 41,
    "stojisca": 54,
    "kapaciteta": 95
  },
  {
    "reg": "MB EP 144",
    "znamka": "HEULIEZ",
    "tip": "GX 137",
    "sedezi": 16,
    "stojisca": 50,
    "kapaciteta": 66
  },
  {
    "reg": "MB ES 295",
    "znamka": "SCANIA",
    "tip": "TOURING HD",
    "sedezi": 49,
    "stojisca": 0,
    "kapaciteta": 49
  },
  {
    "reg": "MB FF 763",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "sedezi": 23,
    "stojisca": 57,
    "kapaciteta": 80
  },
  {
    "reg": "MB FF 764",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "sedezi": 23,
    "stojisca": 57,
    "kapaciteta": 80
  },
  {
    "reg": "MB FF 765",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "sedezi": 23,
    "stojisca": 57,
    "kapaciteta": 80
  },
  {
    "reg": "MB FF 766",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "sedezi": 23,
    "stojisca": 57,
    "kapaciteta": 80
  },
  {
    "reg": "MB FF 767",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "sedezi": 23,
    "stojisca": 57,
    "kapaciteta": 80
  },
  {
    "reg": "MB FT 041",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "sedezi": 17,
    "stojisca": 0,
    "kapaciteta": 17
  },
  {
    "reg": "MB FT 042",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "sedezi": 17,
    "stojisca": 0,
    "kapaciteta": 17
  },
  {
    "reg": "MB GI 69",
    "znamka": "Eagle",
    "tip": "neznano",
    "sedezi": 4,
    "stojisca": 0,
    "kapaciteta": 4
  },
  {
    "reg": "MB JF 308",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 85 L",
    "sedezi": 28,
    "stojisca": 5,
    "kapaciteta": 33
  },
  {
    "reg": "MB JF 324",
    "znamka": "SCANIA",
    "tip": "TOURING HD",
    "sedezi": 49,
    "stojisca": 0,
    "kapaciteta": 49
  },
  {
    "reg": "MB JF 325",
    "znamka": "SCANIA",
    "tip": "TOURING HD",
    "sedezi": 49,
    "stojisca": 0,
    "kapaciteta": 49
  },
  {
    "reg": "MB JN 711",
    "znamka": "IVECO",
    "tip": "Feniks",
    "sedezi": 22,
    "stojisca": 16,
    "kapaciteta": 38
  },
  {
    "reg": "MB JN 712",
    "znamka": "IVECO",
    "tip": "Feniks",
    "sedezi": 22,
    "stojisca": 16,
    "kapaciteta": 38
  },
  {
    "reg": "MB JN 713",
    "znamka": "IVECO",
    "tip": "CROSSWAY",
    "sedezi": 30,
    "stojisca": 53,
    "kapaciteta": 83
  },
  {
    "reg": "MB JN 714",
    "znamka": "IVECO",
    "tip": "CROSSWAY",
    "sedezi": 30,
    "stojisca": 53,
    "kapaciteta": 83
  },
  {
    "reg": "MB JN 715",
    "znamka": "IVECO",
    "tip": "CROSSWAY",
    "sedezi": 30,
    "stojisca": 53,
    "kapaciteta": 83
  },
  {
    "reg": "MB JN 716",
    "znamka": "IVECO",
    "tip": "CROSSWAY",
    "sedezi": 30,
    "stojisca": 53,
    "kapaciteta": 83
  },
  {
    "reg": "MB JN 972",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 85 L",
    "sedezi": 28,
    "stojisca": 5,
    "kapaciteta": 33
  },
  {
    "reg": "MB JN 973",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 85 L",
    "sedezi": 28,
    "stojisca": 5,
    "kapaciteta": 33
  },
  {
    "reg": "MB KL 493",
    "znamka": "Mercedes",
    "tip": "CONECTO",
    "sedezi": 30,
    "stojisca": 68,
    "kapaciteta": 98
  },
  {
    "reg": "MB KL 494",
    "znamka": "Mercedes",
    "tip": "CONECTO",
    "sedezi": 30,
    "stojisca": 68,
    "kapaciteta": 98
  },
  {
    "reg": "MB KL 496",
    "znamka": "Mercedes",
    "tip": "CONECTO",
    "sedezi": 30,
    "stojisca": 68,
    "kapaciteta": 98
  },
  {
    "reg": "MB KL 497",
    "znamka": "Mercedes",
    "tip": "CONECTO",
    "sedezi": 30,
    "stojisca": 68,
    "kapaciteta": 98
  },
  {
    "reg": "MB LF 054",
    "znamka": "SCANIA",
    "tip": "CN 280",
    "sedezi": 37,
    "stojisca": 59,
    "kapaciteta": 96
  },
  {
    "reg": "MB LK 454",
    "znamka": "SCANIA",
    "tip": "CN 280",
    "sedezi": 31,
    "stojisca": 72,
    "kapaciteta": 103
  },
  {
    "reg": "MB M 01",
    "znamka": "Esagono",
    "tip": "Grifo",
    "sedezi": 6,
    "stojisca": 0,
    "kapaciteta": 6
  },
  {
    "reg": "MB M 02",
    "znamka": "Esagono",
    "tip": "Grifo",
    "sedezi": 6,
    "stojisca": 0,
    "kapaciteta": 6
  },
  {
    "reg": "MB M 03",
    "znamka": "Esagono",
    "tip": "Grifo",
    "sedezi": 6,
    "stojisca": 0,
    "kapaciteta": 6
  },
  {
    "reg": "MB M 05",
    "znamka": "Esagono",
    "tip": "Grifo",
    "sedezi": 6,
    "stojisca": 0,
    "kapaciteta": 6
  },
  {
    "reg": "MB M 06",
    "znamka": "Esagono",
    "tip": "Grifo",
    "sedezi": 6,
    "stojisca": 0,
    "kapaciteta": 6
  },
  {
    "reg": "MB M 09",
    "znamka": "Esagono",
    "tip": "Grifo",
    "sedezi": 6,
    "stojisca": 0,
    "kapaciteta": 6
  },
  {
    "reg": "MB PD 266",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "sedezi": 25,
    "stojisca": 56,
    "kapaciteta": 81
  },
  {
    "reg": "MB PD 267",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "sedezi": 25,
    "stojisca": 56,
    "kapaciteta": 81
  },
  {
    "reg": "MB PD 268",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "sedezi": 25,
    "stojisca": 56,
    "kapaciteta": 81
  },
  {
    "reg": "MB PD 269",
    "znamka": "SCANIA",
    "tip": "CITYWIDE LF",
    "sedezi": 25,
    "stojisca": 56,
    "kapaciteta": 81
  },
  {
    "reg": "MB PPROM 19",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "sedezi": 32,
    "stojisca": 50,
    "kapaciteta": 82
  },
  {
    "reg": "MB PPROM 20",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "sedezi": 32,
    "stojisca": 50,
    "kapaciteta": 82
  },
  {
    "reg": "MB PPROM 21",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "sedezi": 32,
    "stojisca": 50,
    "kapaciteta": 82
  },
  {
    "reg": "MB PPROM 22",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "sedezi": 32,
    "stojisca": 50,
    "kapaciteta": 82
  },
  {
    "reg": "MB PPROM 23",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "sedezi": 32,
    "stojisca": 50,
    "kapaciteta": 82
  },
  {
    "reg": "MB PPROM 24",
    "znamka": "IVECO",
    "tip": "URBANWAY",
    "sedezi": 32,
    "stojisca": 50,
    "kapaciteta": 82
  },
  {
    "reg": "MB PPROM 27",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "sedezi": 33,
    "stojisca": 58,
    "kapaciteta": 91
  },
  {
    "reg": "MB PPROM 28",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "sedezi": 33,
    "stojisca": 58,
    "kapaciteta": 91
  },
  {
    "reg": "MB PR0M 30",
    "znamka": "MAN",
    "tip": "A20 B14",
    "sedezi": 44,
    "stojisca": 40,
    "kapaciteta": 84
  },
  {
    "reg": "MB PR0M29",
    "znamka": "IVECO",
    "tip": "FeniksBUS FBI 87 ME",
    "sedezi": 23,
    "stojisca": 14,
    "kapaciteta": 37
  },
  {
    "reg": "MB PR0M36",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "sedezi": 17,
    "stojisca": 49,
    "kapaciteta": 66
  },
  {
    "reg": "MB PR0M37",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "sedezi": 17,
    "stojisca": 49,
    "kapaciteta": 66
  },
  {
    "reg": "MB PR0M38",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "sedezi": 17,
    "stojisca": 47,
    "kapaciteta": 64
  },
  {
    "reg": "MB PR0M39",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "sedezi": 17,
    "stojisca": 47,
    "kapaciteta": 64
  },
  {
    "reg": "MB PR0M40",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "sedezi": 17,
    "stojisca": 47,
    "kapaciteta": 64
  },
  {
    "reg": "MB PR0M41",
    "znamka": "IVECO",
    "tip": "E-WAY",
    "sedezi": 17,
    "stojisca": 47,
    "kapaciteta": 64
  },
  {
    "reg": "MB PR0M42",
    "znamka": "Mercedes",
    "tip": "CITARO",
    "sedezi": 32,
    "stojisca": 68,
    "kapaciteta": 100
  },
  {
    "reg": "MB PR0M43",
    "znamka": "Mercedes",
    "tip": "CITARO",
    "sedezi": 28,
    "stojisca": 74,
    "kapaciteta": 102
  },
  {
    "reg": "MB PR0M44",
    "znamka": "Mercedes",
    "tip": "CITARO",
    "sedezi": 32,
    "stojisca": 68,
    "kapaciteta": 100
  },
  {
    "reg": "MB PROM 01",
    "znamka": "ISUZU",
    "tip": "CITY",
    "sedezi": 26,
    "stojisca": 51,
    "kapaciteta": 77
  },
  {
    "reg": "MB PROM 02",
    "znamka": "ISUZU",
    "tip": "CITY",
    "sedezi": 26,
    "stojisca": 51,
    "kapaciteta": 77
  },
  {
    "reg": "MB PROM 03",
    "znamka": "ISUZU",
    "tip": "CITY",
    "sedezi": 26,
    "stojisca": 51,
    "kapaciteta": 77
  },
  {
    "reg": "MB PROM 04",
    "znamka": "ISUZU",
    "tip": "CITY",
    "sedezi": 26,
    "stojisca": 51,
    "kapaciteta": 77
  },
  {
    "reg": "MB PROM 05",
    "znamka": "ISUZU",
    "tip": "CITY",
    "sedezi": 26,
    "stojisca": 51,
    "kapaciteta": 77
  },
  {
    "reg": "MB PROM 10",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "sedezi": 31,
    "stojisca": 72,
    "kapaciteta": 103
  },
  {
    "reg": "MB PROM 11",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "sedezi": 31,
    "stojisca": 72,
    "kapaciteta": 103
  },
  {
    "reg": "MB PROM 12",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "sedezi": 31,
    "stojisca": 72,
    "kapaciteta": 103
  },
  {
    "reg": "MB PROM 13",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "sedezi": 31,
    "stojisca": 72,
    "kapaciteta": 103
  },
  {
    "reg": "MB PROM 14",
    "znamka": "IVECO",
    "tip": "CROSSWAY LE",
    "sedezi": 31,
    "stojisca": 72,
    "kapaciteta": 103
  },
  {
    "reg": "MB PROM 15",
    "znamka": "MAN",
    "tip": "Lions CITY A\"&",
    "sedezi": 44,
    "stojisca": 84,
    "kapaciteta": 128
  },
  {
    "reg": "MB PROM 17",
    "znamka": "Mercedes",
    "tip": "CITARO O530",
    "sedezi": 26,
    "stojisca": 65,
    "kapaciteta": 91
  },
  {
    "reg": "MB PROM 18",
    "znamka": "Mercedes",
    "tip": "CITARO O531",
    "sedezi": 35,
    "stojisca": 51,
    "kapaciteta": 86
  },
  {
    "reg": "MB PROM32",
    "znamka": "IVECO",
    "tip": "GXELE",
    "sedezi": 34,
    "stojisca": 58,
    "kapaciteta": 92
  },
  {
    "reg": "MB PROM33",
    "znamka": "IVECO",
    "tip": "GXELE",
    "sedezi": 34,
    "stojisca": 58,
    "kapaciteta": 92
  },
  {
    "reg": "MB PROM34",
    "znamka": "Mercedes",
    "tip": "345L457",
    "sedezi": 63,
    "stojisca": 20,
    "kapaciteta": 83
  },
  {
    "reg": "MB PROM35",
    "znamka": "IRISBUS",
    "tip": "SER150",
    "sedezi": 60,
    "stojisca": 0,
    "kapaciteta": 60
  },
  {
    "reg": "MB TU 840",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "sedezi": 9,
    "stojisca": 0,
    "kapaciteta": 9
  },
  {
    "reg": "MB TU 841",
    "znamka": "Renault",
    "tip": "MASTER 2.3.DCI",
    "sedezi": 9,
    "stojisca": 0,
    "kapaciteta": 9
  },
  {
    "reg": "MB UI 439",
    "znamka": "IVECO",
    "tip": "FeniksBUS F083M385",
    "sedezi": 22,
    "stojisca": 13,
    "kapaciteta": 35
  },
  {
    "reg": "MB VLAKEC",
    "znamka": "Esagono",
    "tip": "E",
    "sedezi": 50,
    "stojisca": 0,
    "kapaciteta": 50
  },
  {
    "reg": "MB ZE 020",
    "znamka": "Kutsenitc",
    "tip": "CITY VI",
    "sedezi": 23,
    "stojisca": 3,
    "kapaciteta": 26
  },
  {
    "reg": "MB ZE 641",
    "znamka": "IVECO",
    "tip": "Feniks",
    "sedezi": 29,
    "stojisca": 4,
    "kapaciteta": 33
  }
];
