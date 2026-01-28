"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { okolisiEM, okolisiBio, StreetSearchResult } from "@/lib/data/okolisi";
import { OkolisiDialog } from "./OkolisiDialog";
import { AddressSearch } from "./AddressSearch";

interface OkolisSelectorProps {
  emOkolis: number | null;
  bioOkolis: number | null;
  onEmOkolisChange: (value: number | null) => void;
  onBioOkolisChange: (value: number | null) => void;
}

export function OkolisSelector({
  emOkolis,
  bioOkolis,
  onEmOkolisChange,
  onBioOkolisChange,
}: OkolisSelectorProps) {
  const handleAddressSelect = (result: StreetSearchResult) => {
    onEmOkolisChange(result.okolisEM);
    onBioOkolisChange(result.okolisBio);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            Izberite svoj okoliš
          </CardTitle>
          <OkolisiDialog />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Iskanje po naslovu */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Poiščite po naslovu
          </Label>
          <AddressSearch onSelect={handleAddressSelect} />
        </div>

        {/* Ločilnik */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-muted-foreground">
              ali izberite ročno
            </span>
          </div>
        </div>

        {/* E/M Okoliš */}
        <div className="space-y-2">
          <Label htmlFor="em-okolis" className="text-sm font-medium">
            Embalaža in mešani odpadki
          </Label>
          <Select
            value={emOkolis?.toString() || ""}
            onValueChange={(value) =>
              onEmOkolisChange(value ? parseInt(value) : null)
            }
          >
            <SelectTrigger id="em-okolis" className="w-full" aria-label="Izbira okoliša za embalažo in mešane odpadke">
              <SelectValue placeholder="Izberite E/M okoliš" />
            </SelectTrigger>
            <SelectContent>
              {okolisiEM.map((okolis) => (
                <SelectItem key={okolis.id} value={okolis.id.toString()}>
                  {okolis.name} ({okolis.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bio Okoliš */}
        <div className="space-y-2">
          <Label htmlFor="bio-okolis" className="text-sm font-medium">
            Biološki odpadki
          </Label>
          <Select
            value={bioOkolis?.toString() || ""}
            onValueChange={(value) =>
              onBioOkolisChange(value ? parseInt(value) : null)
            }
          >
            <SelectTrigger id="bio-okolis" className="w-full" aria-label="Izbira okoliša za biološke odpadke">
              <SelectValue placeholder="Izberite Bio okoliš" />
            </SelectTrigger>
            <SelectContent>
              {okolisiBio.map((okolis) => (
                <SelectItem key={okolis.id} value={okolis.id.toString()}>
                  {okolis.name} ({okolis.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
