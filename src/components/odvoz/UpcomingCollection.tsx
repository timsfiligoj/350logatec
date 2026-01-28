"use client";

import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { sl } from "date-fns/locale";
import { CalendarClock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WasteTypeBadge, WasteTypeDot } from "./WasteTypeBadge";
import {
  getNextCollection,
  getUpcomingCollections,
  CollectionDay,
} from "@/lib/data/schedule-2026";

interface UpcomingCollectionProps {
  emOkolis: number;
  bioOkolis: number;
}

function formatDateSlovene(dateStr: string): string {
  const date = parseISO(dateStr);
  // Lowercase month and day names
  return format(date, "EEEE, d. MMMM", { locale: sl }).toLowerCase();
}

function getRelativeDay(dateStr: string): "today" | "tomorrow" | null {
  const date = parseISO(dateStr);
  if (isToday(date)) return "today";
  if (isTomorrow(date)) return "tomorrow";
  return null;
}

export function UpcomingCollection({
  emOkolis,
  bioOkolis,
}: UpcomingCollectionProps) {
  const nextCollection = getNextCollection(emOkolis, bioOkolis);
  const upcomingCollections = getUpcomingCollections(emOkolis, bioOkolis, 60);

  // Get next 5 collections after the first one
  const futureCollections = upcomingCollections.slice(1, 6);

  if (!nextCollection) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Ni najdenih odvozov za izbrani okoliš.</p>
        </CardContent>
      </Card>
    );
  }

  const relativeDay = getRelativeDay(nextCollection.date);

  return (
    <Card>
      <CardHeader className="pb-0 pt-4 px-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <CalendarClock className="h-3.5 w-3.5 text-primary" />
          </div>
          Naslednji odvoz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 px-4 pb-4 pt-2">
        {/* Main next collection */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {relativeDay && (
                <Badge
                  variant={relativeDay === "today" ? "destructive" : "default"}
                  className={`text-xs ${
                    relativeDay === "tomorrow"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : ""
                  }`}
                >
                  {relativeDay === "today" ? "DANES" : "JUTRI"}
                </Badge>
              )}
              <p className="text-base font-display font-semibold capitalize">
                {formatDateSlovene(nextCollection.date)}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {nextCollection.types.map((type) => (
                <WasteTypeBadge key={type} type={type} size="sm" />
              ))}
            </div>
          </div>
        </div>

        {/* Future collections */}
        {futureCollections.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Prihajajoči odvozi
            </p>
            <div className="divide-y divide-border/50">
              {futureCollections.map((collection, index) => (
                <CollectionRow
                  key={collection.date + index}
                  collection={collection}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CollectionRow({ collection }: { collection: CollectionDay }) {
  const date = parseISO(collection.date);
  const relativeDay = getRelativeDay(collection.date);

  // Get short day name in uppercase (e.g., PON, TOR, SRE)
  const dayName = format(date, "EEE", { locale: sl }).toUpperCase().replace(".", "");
  // Full date with month name in lowercase (e.g., "2. februar")
  const fullDate = format(date, "d. MMMM", { locale: sl }).toLowerCase();

  return (
    <div className="flex items-center justify-between py-2.5 first:pt-1 last:pb-0">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground w-8">
          {dayName}
        </span>
        <span className="text-sm font-medium">
          {fullDate}
        </span>
        {relativeDay && (
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${
              relativeDay === "today"
                ? "text-red-600 border-red-200 bg-red-50"
                : "text-orange-600 border-orange-200 bg-orange-50"
            }`}
          >
            {relativeDay === "today" ? "Danes" : "Jutri"}
          </Badge>
        )}
      </div>
      <div className="flex gap-1">
        {collection.types.map((type) => (
          <WasteTypeDot key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
