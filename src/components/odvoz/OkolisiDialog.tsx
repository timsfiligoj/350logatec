"use client";

import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Exact data from PDF koledar2026.pdf
const okolisiEM = [
  {
    id: 1,
    name: "Okoliš 1",
    code: "E1 M1",
    streets:
      "Cesta 5. maja, Gozdna pot, Jakovica, Jačka (40a, 40b, 40c, 42, 44, 81, 83 in 85), Laze, Loka, Mali most, Martinj hrib, Notranjska cesta (od rondoja proti Lazam, razen Notranjska cesta 68, 68A in 70), Ograde, Plesiše, Pod bori, Pod gozdom, Poljska pot, Pri lesniki, Pri malem mostu in Rožna ulica",
  },
  {
    id: 2,
    name: "Okoliš 2",
    code: "E2 M2",
    streets:
      "Blekova vas, Dol, Došce, Hrib, Pehačkova cesta, Pod Grintovcem, Sončna pot, Tržaška cesta (od križišča Tržaška cesta - Blekova vas do avtobusne postaje Gorenji Logatec), Zelena pot",
  },
  {
    id: 3,
    name: "Okoliš 3",
    code: "E3 M3",
    streets:
      "Gorenjska cesta, Grajska pot, Grčarevec, Kalce, Lipca, Planjave, Pokopališka pot, Režiška cesta, Strmica (razen 21A), Tičnica, Tržaška cesta (od Kmetijske zadruge Gorenji Logatec do Kalc), Zadružna pot (razen 1 in 2)",
  },
  {
    id: 4,
    name: "Okoliš 4",
    code: "E4 M4",
    streets:
      "Jamnica, Jačka (do železniške postaje do križišča s priključkom na AC), Klanec, Notranjska cesta 79, Stara cesta, Stara pot, Stranska pot, Tovarniška cesta, Tržaška cesta 9 in 11, Vrtnarska pot in Zelenica",
  },
  {
    id: 5,
    name: "Okoliš 5",
    code: "E5 M5",
    streets:
      "Brod, Cesta talcev, Grič, Gubčeva ulica, Kidričeva ulica, Kraigherjeva ulica, Nazorjeva ulica, Partizanska ulica, Pavšičeva ulica, Titova ulica, Tomšičeva ulica, Tržaška cesta (od avtobusne postaje Dolenji Logatec do križišča Tržaška cesta - Blekova vas), Ulica OF, Vilharjeva ulica, Šolska pot",
  },
  {
    id: 6,
    name: "Okoliš 6",
    code: "E6 M6",
    streets:
      "Čevica, Gregorčičeva ulica, Krpanova ulica, Levstikova ulica, Naklo, Notranjska cesta (od rondoja proti centru), Nova vas, Potoška cesta, Poštni vrt, Prešernova ulica, Rovtarska cesta, Tržaška cesta (od križišča z Mercatorjem do avtobusne postaje Dolenji Logatec), Ulica Dolomitskega odreda in Vodovodna cesta",
  },
  {
    id: 7,
    name: "Okoliš 7",
    code: "E7 M7",
    streets:
      "Hotedršica, Novi Svet, Ravnik pri Hotedršici, Žibrše (razen od 20 do 20F ter 20K in 27) ter Rovtarske Žibrše 39",
  },
  {
    id: 8,
    name: "Okoliš 8",
    code: "E8 M8",
    streets:
      "Hleviše (razen 1, 2, 4, 5, 6, 7, 7A, 8, 8A in 20), Hlevni Vrh (razen 2 in 3), Lavrovec (razen 2, 5, 5D, 6 in 7), Rovtarske Žibrše 16, 16A, 16B, 17 in 17A, Rovte - Kurja vas, Zajele ter Zavčan do Osoj (razen 5, 5A, 6, 7, 8, 8A, 9, 10, 10A, 10B, 11, 12, 13, 14A, 14B, 34A, 35, 36, 114, 115, 116, 116A, 117, 118, 118A, 126, 134, 135, 140, 142, 144, 145, 146, 151, 153, 154 in 155), Vrh Svetih Treh Kraljev",
  },
  {
    id: 9,
    name: "Okoliš 9",
    code: "E9 M9",
    streets:
      "Hleviše 20, Medvedje Brdo (razen 29, 30, 48, 53, 56, 58 in 59), Petkovec (razen 22, 22A, 22B, 31, 32, 32A, 32B, 33 in 34), Rovtarske Žibrše (razen 16, 16A, 16B, 17 in 17A), Rovte - Gabrovce, Gale, Lukančič, Celerije in Gradišče (razen 5, 5A, 6, 7, 8, 8A, 9, 10, 10A, 10B, 11, 12, 13, 14A, 14B, 34A, 35, 36, 114, 115, 116, 116A, 117, 118, 118A, 126, 134, 135, 140, 142, 144, 145, 146, 151, 153, 154 in 155), Zaplana - del",
  },
  {
    id: 10,
    name: "Okoliš 10",
    code: "E10 M10",
    streets:
      "Blekova vas 26, 28, 28A, 30 in 32, Cankarjeva cesta 5 in 5a, Gozdna pot 24, 24A, 26 in 26A, Gubčeva ulica 10, 14, 16, 18 in 20, Klanec 7, 18 in 20, Mandrge, Notranjska cesta 68, 68A in 70, Ograje, Pavšičeva ulica 18A, 18B, 21, 21A, 23, 23A, 25, 25A, 27, 27A, 48, 49 in 61, Petkovec 14, 15, 39, 40, 41, 42, 52A, 53, 58, 63 in 64, Pod gozdom 6A, Poljska pot 11 in 26, Strmica 21A, Tabor, Vodovodna cesta 45, Za železnico 3, 4 in 14, Zadružna pot 1 in 2 ter Žibrše od 20 do 20F ter 20K in 27",
  },
  {
    id: 11,
    name: "Okoliš 11",
    code: "E11 M11",
    streets:
      "Večstanovanjske stavbe, bloki, ustanove in podjetja, s katerimi imamo sklenjeno pogodbo o tedenskemu odvozu odpadkov na sledečih ulicah: Brod, Gorenjska cesta, Gubčeva ulica, IOC Zapolje I, II, III in IV, Jačka, Kalce, Notranjska cesta, Obrtna cona Logatec, Obrtniška ulica, Pavšičeva ulica, Prešernova ulica, Rovtarska cesta, Sončni log, Tovarniška cesta, Tržaška cesta, Za železnico, Šolska pot ter Cankarjeva ulica. V okolišu 11 na isti dan zbiramo mešane komunalne odpadke ter plastično in kovinsko embalažo.",
  },
  {
    id: 12,
    name: "Okoliš 12",
    code: "E12 M12",
    streets:
      "Hleviše 1, 2, 4, 6, 7, 7A, 8 in 8A, Hlevni Vrh 2 in 3, Lavrovec 2, 5, 5D, 6 in 7, Medvedje Brdo 29, 30, 48, 53, 56, 58 in 59, Petkovec 22, 22A, 22B, 31, 32, 32A, 32B, 33 in 34, Praprotno Brdo, Rovte 5, 5A, 6, 7, 8, 8A, 9, 10, 10A, 10B, 11, 12, 13, 14A, 14B, 34A, 35, 36, 114, 115, 116, 116A, 117, 118, 118A, 126, 134, 135, 140, 142, 144, 145, 146, 151, 153, 154 in 155",
  },
];

const okolisiBio = [
  {
    id: 1,
    name: "Okoliš B1",
    code: "B1",
    streets:
      "Blekova vas, Brod, Cankarjeva cesta, Cesta 5. maja, Cesta talcev, Čevica, Dol, Došce, Gorenjska cesta, Gozdna pot, Grajska pot, Grčarevec, Gregorčičeva ulica, Grič, Gubčeva ulica, Hrib, IOC Zapolje, Jačka, Jamnica, Kalce, Kidričeva ulica, Klanec, Kraigherjeva ulica, Krpanova ulica, Laze, Levstikova ulica, Lipca, Loka, Mali most, Mandrge, Martinj hrib, Naklo, Nazorjeva ulica, Notranjska cesta, Nova vas, Obrtna cona Logatec, Obrtniška ulica, Ograde, Partizanska ulica, Pavšičeva ulica, Pehačkova cesta, Planjave, Plesiše, Pod bori, Pod gozdom, Pod Grintovcem, Poljska pot, Pokopališka pot, Potoška cesta, Poštni vrt, Prešernova ulica, Pri lesniki, Pri malem mostu, Režiška cesta, Rovtarska cesta, Rožna ulica, Sončna pot, Sončni log, Stara cesta, Stara pot, Stranska pot, Strmica, Šolska pot, Tabor, Tičnica, Titova ulica, Tomšičeva ulica, Tovarniška cesta, Tržaška cesta, Ulica Dolomitskega odreda, Ulica OF, Vilharjeva ulica, Vodovodna cesta, Vrtnarska pot, Zadružna pot, Zaplana - del, Zelena pot, Zelenica",
  },
  {
    id: 2,
    name: "Okoliš B2",
    code: "B2",
    streets:
      "Hotedršica, Novi Svet, Ograje, Petkovec, Ravnik pri Hotedršici in Rovte",
  },
];

export function OkolisiDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
          <HelpCircle className="h-4 w-4" />
          <span>Okoliši</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] !flex !flex-col overflow-hidden p-0 w-[calc(100%-3rem)] sm:w-full rounded-xl">
        <DialogHeader className="flex-shrink-0 border-b p-6 pb-4">
          <DialogTitle className="text-xl font-display">
            Seznam okolišev
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 p-6 pt-4">
          {/* E/M Okoliši */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Embalaža in mešani odpadki
            </h3>
            <div className="space-y-4">
              {okolisiEM.map((okolis) => (
                <div
                  key={okolis.id}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-baseline gap-3 mb-2">
                    <h4 className="font-semibold">{okolis.name}</h4>
                    <span className="text-sm font-medium text-blue-600">
                      {okolis.code}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {okolis.streets}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bio Okoliši */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Biološki odpadki
            </h3>
            <div className="space-y-4">
              {okolisiBio.map((okolis) => (
                <div
                  key={okolis.id}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-baseline gap-3 mb-2">
                    <h4 className="font-semibold">{okolis.name}</h4>
                    <span className="text-sm font-medium text-green-600">
                      {okolis.code}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {okolis.streets}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
