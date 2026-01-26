// Definicije okolišev za občino Logatec
// Vir: Komunalno podjetje Logatec d.o.o.

export interface Okolis {
  id: number;
  name: string;
  code: string;
  streets: string[];
  description?: string;
}

// E/M Okoliši (embalaža in mešani odpadki)
export const okolisiEM: Okolis[] = [
  {
    id: 1,
    name: "Okoliš 1",
    code: "E1 M1",
    streets: [
      "Cesta 5. maja",
      "Gozdna pot",
      "Jakovica",
      "Jačka 40a", "Jačka 40b", "Jačka 40c", "Jačka 42", "Jačka 44", "Jačka 81", "Jačka 83", "Jačka 85",
      "Laze",
      "Loka",
      "Mali most",
      "Martinj hrib",
      "Notranjska cesta", // od rondoja proti Lazam, razen 68, 68A, 70
      "Ograde",
      "Plesiše",
      "Pod bori",
      "Pod gozdom",
      "Poljska pot",
      "Pri lesniki",
      "Pri malem mostu",
      "Rožna ulica"
    ],
    description: "Od rondoja proti Lazam (razen Notranjska cesta 68, 68A in 70)"
  },
  {
    id: 2,
    name: "Okoliš 2",
    code: "E2 M2",
    streets: [
      "Blekova vas",
      "Dol",
      "Došce",
      "Hrib",
      "Pehačkova cesta",
      "Pod Grintovcem",
      "Sončna pot",
      "Tržaška cesta", // od križišča Tržaška - Blekova vas do avtobusne postaje Gorenji Logatec
      "Zelena pot"
    ],
    description: "Od križišča Tržaška cesta - Blekova vas do avtobusne postaje Gorenji Logatec"
  },
  {
    id: 3,
    name: "Okoliš 3",
    code: "E3 M3",
    streets: [
      "Gorenjska cesta",
      "Grajska pot",
      "Grčarevec",
      "Kalce",
      "Lipca",
      "Planjave",
      "Pokopališka pot",
      "Režiška cesta",
      "Strmica", // razen 21A
      "Tičnica",
      "Tržaška cesta", // od Kmetijske zadruge Gorenji Logatec do Kalc
      "Zadružna pot" // razen 1 in 2
    ],
    description: "Grčarevec, Kalce, okolica (razen Strmica 21A, Zadružna pot 1 in 2)"
  },
  {
    id: 4,
    name: "Okoliš 4",
    code: "E4 M4",
    streets: [
      "Jamnica",
      "Jačka", // do železniške postaje do križišča s priključkom na AC
      "Klanec",
      "Notranjska cesta 79",
      "Stara cesta",
      "Stara pot",
      "Stranska pot",
      "Tovarniška cesta",
      "Tržaška cesta 9", "Tržaška cesta 11",
      "Vrtnarska pot",
      "Zelenica"
    ],
    description: "Jačka (do železniške postaje), industrijska cona"
  },
  {
    id: 5,
    name: "Okoliš 5",
    code: "E5 M5",
    streets: [
      "Brod",
      "Cesta talcev",
      "Grič",
      "Gubčeva ulica",
      "Kidričeva ulica",
      "Kraigherjeva ulica",
      "Nazorjeva ulica",
      "Partizanska ulica",
      "Pavšičeva ulica",
      "Titova ulica",
      "Tomšičeva ulica",
      "Tržaška cesta", // od avtobusne postaje Dolenji Logatec do križišča Tržaška - Blekova vas
      "Ulica OF",
      "Vilharjeva ulica",
      "Šolska pot"
    ],
    description: "Center Dolenjega Logatca"
  },
  {
    id: 6,
    name: "Okoliš 6",
    code: "E6 M6",
    streets: [
      "Čevica",
      "Gregorčičeva ulica",
      "Krpanova ulica",
      "Levstikova ulica",
      "Naklo",
      "Notranjska cesta", // od rondoja proti centru
      "Nova vas",
      "Potoška cesta",
      "Poštni vrt",
      "Prešernova ulica",
      "Rovtarska cesta",
      "Tržaška cesta", // od križišča z Mercatorjem do avtobusne postaje Dolenji Logatec
      "Ulica Dolomitskega odreda",
      "Vodovodna cesta"
    ],
    description: "Center Logatca, Nova vas, Naklo"
  },
  {
    id: 7,
    name: "Okoliš 7",
    code: "E7 M7",
    streets: [
      "Hotedršica",
      "Novi Svet",
      "Ravnik pri Hotedršici",
      "Žibrše", // razen od 20 do 20F ter 20K in 27
      "Rovtarske Žibrše 39"
    ],
    description: "Hotedršica in okolica (razen Žibrše 20-20F, 20K, 27)"
  },
  {
    id: 8,
    name: "Okoliš 8",
    code: "E8 M8",
    streets: [
      "Hleviše", // razen 1, 2, 4, 5, 6, 7, 7A, 8, 8A in 20
      "Hlevni Vrh", // razen 2 in 3
      "Lavrovec", // razen 2, 5, 5D, 6 in 7
      "Rovtarske Žibrše 16", "Rovtarske Žibrše 16A", "Rovtarske Žibrše 16B",
      "Rovtarske Žibrše 17", "Rovtarske Žibrše 17A",
      "Rovte - Kurja vas",
      "Zajele",
      "Zavčan do Osoj",
      "Vrh Svetih Treh Kraljev"
    ],
    description: "Rovte - Kurja vas, Zajele, Hleviše (delno)"
  },
  {
    id: 9,
    name: "Okoliš 9",
    code: "E9 M9",
    streets: [
      "Hleviše 20",
      "Medvedje Brdo", // razen 29, 30, 48, 53, 56, 58, 59
      "Petkovec", // razen 22, 22A, 22B, 31, 32, 32A, 32B, 33, 34
      "Rovtarske Žibrše", // razen 16, 16A, 16B, 17, 17A
      "Rovte - Gabrovce",
      "Rovte - Gale",
      "Rovte - Lukančič",
      "Rovte - Celerije",
      "Rovte - Gradišče",
      "Zaplana - del"
    ],
    description: "Rovte - Gabrovce, Gale, Medvedje Brdo (delno), Zaplana"
  },
  {
    id: 10,
    name: "Okoliš 10",
    code: "E10 M10",
    streets: [
      "Blekova vas 26", "Blekova vas 28", "Blekova vas 28A", "Blekova vas 30", "Blekova vas 32",
      "Cankarjeva cesta 5", "Cankarjeva cesta 5a",
      "Gozdna pot 24", "Gozdna pot 24A", "Gozdna pot 26", "Gozdna pot 26A",
      "Gubčeva ulica 10", "Gubčeva ulica 14", "Gubčeva ulica 16", "Gubčeva ulica 18", "Gubčeva ulica 20",
      "Klanec 7", "Klanec 18", "Klanec 20",
      "Mandrge",
      "Notranjska cesta 68", "Notranjska cesta 68A", "Notranjska cesta 70",
      "Ograje",
      "Pavšičeva ulica 18A", "Pavšičeva ulica 18B", "Pavšičeva ulica 21", "Pavšičeva ulica 21A",
      "Pavšičeva ulica 23", "Pavšičeva ulica 23A", "Pavšičeva ulica 25", "Pavšičeva ulica 25A",
      "Pavšičeva ulica 27", "Pavšičeva ulica 27A", "Pavšičeva ulica 48", "Pavšičeva ulica 49", "Pavšičeva ulica 61",
      "Petkovec 14", "Petkovec 15", "Petkovec 39", "Petkovec 40", "Petkovec 41", "Petkovec 42",
      "Petkovec 52A", "Petkovec 53", "Petkovec 58", "Petkovec 63", "Petkovec 64",
      "Pod gozdom 6A",
      "Poljska pot 11", "Poljska pot 26",
      "Strmica 21A",
      "Tabor",
      "Vodovodna cesta 45",
      "Za železnico 3", "Za železnico 4", "Za železnico 14",
      "Zadružna pot 1", "Zadružna pot 2",
      "Žibrše 20", "Žibrše 20A", "Žibrše 20B", "Žibrše 20C", "Žibrše 20D", "Žibrše 20E", "Žibrše 20F", "Žibrše 20K", "Žibrše 27"
    ],
    description: "Specifični naslovi po Logatcu"
  },
  {
    id: 11,
    name: "Okoliš 11",
    code: "E11 M11",
    streets: [
      "Brod (bloki)",
      "Gorenjska cesta (bloki)",
      "Gubčeva ulica (bloki)",
      "IOC Zapolje I", "IOC Zapolje II", "IOC Zapolje III", "IOC Zapolje IV",
      "Jačka (bloki)",
      "Kalce (bloki)",
      "Notranjska cesta (bloki)",
      "Obrtna cona Logatec",
      "Obrtniška ulica",
      "Pavšičeva ulica (bloki)",
      "Prešernova ulica (bloki)",
      "Rovtarska cesta (bloki)",
      "Sončni log",
      "Tovarniška cesta (podjetja)",
      "Tržaška cesta (bloki)",
      "Za železnico (bloki)",
      "Šolska pot (bloki)",
      "Cankarjeva ulica (bloki)"
    ],
    description: "Večstanovanjske stavbe, bloki, ustanove in podjetja (tedenski odvoz)"
  },
  {
    id: 12,
    name: "Okoliš 12",
    code: "E12 M12",
    streets: [
      "Hleviše 1", "Hleviše 2", "Hleviše 4", "Hleviše 6", "Hleviše 7", "Hleviše 7A", "Hleviše 8", "Hleviše 8A",
      "Hlevni Vrh 2", "Hlevni Vrh 3",
      "Lavrovec 2", "Lavrovec 5", "Lavrovec 5D", "Lavrovec 6", "Lavrovec 7",
      "Medvedje Brdo 29", "Medvedje Brdo 30", "Medvedje Brdo 48", "Medvedje Brdo 53",
      "Medvedje Brdo 56", "Medvedje Brdo 58", "Medvedje Brdo 59",
      "Petkovec 22", "Petkovec 22A", "Petkovec 22B", "Petkovec 31", "Petkovec 32",
      "Petkovec 32A", "Petkovec 32B", "Petkovec 33", "Petkovec 34",
      "Praprotno Brdo",
      "Rovte 5", "Rovte 5A", "Rovte 6", "Rovte 7", "Rovte 8", "Rovte 8A",
      "Rovte 9", "Rovte 10", "Rovte 10A", "Rovte 10B", "Rovte 11", "Rovte 12", "Rovte 13",
      "Rovte 14A", "Rovte 14B", "Rovte 34A", "Rovte 35", "Rovte 36",
      "Rovte 114", "Rovte 115", "Rovte 116", "Rovte 116A", "Rovte 117", "Rovte 118", "Rovte 118A",
      "Rovte 126", "Rovte 134", "Rovte 135", "Rovte 140", "Rovte 142", "Rovte 144", "Rovte 145",
      "Rovte 146", "Rovte 151", "Rovte 153", "Rovte 154", "Rovte 155"
    ],
    description: "Hleviše, Lavrovec, Praprotno Brdo, Rovte (specifični naslovi)"
  }
];

// B Okoliši (biološki odpadki)
export const okolisiBio: Okolis[] = [
  {
    id: 1,
    name: "Okoliš B1",
    code: "B1",
    streets: [
      "Blekova vas", "Brod", "Cankarjeva cesta", "Cesta 5. maja", "Cesta talcev",
      "Čevica", "Dol", "Došce", "Gorenjska cesta", "Gozdna pot", "Grajska pot",
      "Grčarevec", "Gregorčičeva ulica", "Grič", "Gubčeva ulica", "Hrib",
      "IOC Zapolje", "Jačka", "Jamnica", "Kalce", "Kidričeva ulica", "Klanec",
      "Kraigherjeva ulica", "Krpanova ulica", "Laze", "Levstikova ulica", "Lipca",
      "Loka", "Mali most", "Mandrge", "Martinj hrib", "Naklo", "Nazorjeva ulica",
      "Notranjska cesta", "Nova vas", "Obrtna cona Logatec", "Obrtniška ulica",
      "Ograde", "Partizanska ulica", "Pavšičeva ulica", "Pehačkova cesta",
      "Planjave", "Plesiše", "Pod bori", "Pod gozdom", "Pod Grintovcem",
      "Poljska pot", "Pokopališka pot", "Potoška cesta", "Poštni vrt",
      "Prešernova ulica", "Pri lesniki", "Pri malem mostu", "Režiška cesta",
      "Rovtarska cesta", "Rožna ulica", "Sončna pot", "Sončni log", "Stara cesta",
      "Stara pot", "Stranska pot", "Strmica", "Šolska pot", "Tabor", "Tičnica",
      "Titova ulica", "Tomšičeva ulica", "Tovarniška cesta", "Tržaška cesta",
      "Ulica Dolomitskega odreda", "Ulica OF", "Vilharjeva ulica", "Vodovodna cesta",
      "Vrtnarska pot", "Zadružna pot", "Zaplana - del", "Zelena pot", "Zelenica"
    ],
    description: "Logatec (center in okolica) - vsak ponedeljek"
  },
  {
    id: 2,
    name: "Okoliš B2",
    code: "B2",
    streets: [
      "Hotedršica",
      "Novi Svet",
      "Ograje",
      "Petkovec",
      "Ravnik pri Hotedršici",
      "Rovte"
    ],
    description: "Hotedršica, Rovte, Petkovec - vsak torek"
  }
];

// Funkcija za iskanje okoliša po naslovu
export function findOkolisEM(address: string): Okolis | null {
  const normalizedAddress = address.toLowerCase().trim();
  
  // Najprej preveri specifične naslove (okoliš 10 in 12)
  for (const okolis of [okolisiEM[9], okolisiEM[11]]) { // okoliš 10 in 12
    for (const street of okolis.streets) {
      if (normalizedAddress.includes(street.toLowerCase())) {
        return okolis;
      }
    }
  }
  
  // Nato preveri ostale okoliše
  for (const okolis of okolisiEM) {
    if (okolis.id === 10 || okolis.id === 12) continue; // že preverjeno
    
    for (const street of okolis.streets) {
      const streetLower = street.toLowerCase();
      // Preveri ali se naslov ujema z ulico
      if (normalizedAddress.includes(streetLower) || streetLower.includes(normalizedAddress.split(' ')[0])) {
        return okolis;
      }
    }
  }
  
  return null;
}

export function findOkolisBio(address: string): Okolis | null {
  const normalizedAddress = address.toLowerCase().trim();
  
  // Najprej preveri B2 (manjši, bolj specifičen)
  for (const street of okolisiBio[1].streets) {
    if (normalizedAddress.includes(street.toLowerCase())) {
      return okolisiBio[1];
    }
  }
  
  // Če ni v B2, je verjetno v B1
  for (const street of okolisiBio[0].streets) {
    if (normalizedAddress.includes(street.toLowerCase())) {
      return okolisiBio[0];
    }
  }
  
  return null;
}

// Vrne vse ulice za autocomplete
export function getAllStreets(): string[] {
  const streets = new Set<string>();

  okolisiEM.forEach(o => o.streets.forEach(s => streets.add(s)));
  okolisiBio.forEach(o => o.streets.forEach(s => streets.add(s)));

  return Array.from(streets).sort();
}

export interface StreetSearchResult {
  street: string;
  okolisEM: number;
  okolisBio: number;
  okolisEMCode: string;
  okolisBioCode: string;
}

// Funkcija za iskanje ulic po query stringu
export function searchStreets(query: string, maxResults: number = 5): StreetSearchResult[] {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const results: StreetSearchResult[] = [];
  const seen = new Set<string>();

  // Išči po vseh E/M okoliših
  for (const okolis of okolisiEM) {
    for (const street of okolis.streets) {
      const streetLower = street.toLowerCase();

      // Preveri če se query ujema z ulico
      if (streetLower.includes(normalizedQuery) || normalizedQuery.includes(streetLower.split(' ')[0])) {
        // Ustvari unikaten ključ za ulico
        const streetKey = street.toLowerCase();
        if (seen.has(streetKey)) continue;
        seen.add(streetKey);

        // Najdi pripadajoči Bio okoliš
        let bioOkolisId = 1; // default B1

        // Posebna logika za B2 (Hotedršica, Rovte, Petkovec)
        const b2Keywords = ['hotedršica', 'novi svet', 'ograje', 'petkovec', 'ravnik pri hotedršici', 'rovte'];
        if (b2Keywords.some(kw => streetLower.includes(kw))) {
          bioOkolisId = 2;
        }

        results.push({
          street,
          okolisEM: okolis.id,
          okolisBio: bioOkolisId,
          okolisEMCode: okolis.code,
          okolisBioCode: `B${bioOkolisId}`,
        });

        if (results.length >= maxResults) return results;
      }
    }
  }

  return results;
}

// Waste type info
export const wasteTypes = {
  E: {
    name: "Embalaža",
    fullName: "Plastična in kovinska embalaža",
    color: "#22c55e", // green-500
    bgColor: "#dcfce7", // green-100
    icon: "♻️"
  },
  M: {
    name: "Mešani",
    fullName: "Mešani komunalni odpadki",
    color: "#3b82f6", // blue-500
    bgColor: "#dbeafe", // blue-100
    icon: "🗑️"
  },
  B: {
    name: "Bio",
    fullName: "Biološko razgradljivi odpadki",
    color: "#84cc16", // lime-500
    bgColor: "#ecfccb", // lime-100
    icon: "🌿"
  }
} as const;
