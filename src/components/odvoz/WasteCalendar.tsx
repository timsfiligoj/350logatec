"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO,
  isToday,
} from "date-fns";
import { sl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WasteTypeBadge, WasteTypeDot, wasteTypeConfig } from "./WasteTypeBadge";
import type { WasteType } from "./WasteTypeBadge";
import { getCollectionDates, CollectionDay } from "@/lib/data/schedule-2026";

interface WasteCalendarProps {
  emOkolis: number;
  bioOkolis: number;
}

const WEEKDAYS = ["Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"];

export function WasteCalendar({ emOkolis, bioOkolis }: WasteCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // Start at January 2026
  const [selectedDay, setSelectedDay] = useState<CollectionDay | null>(null);

  // Get all collection dates for the year
  const allCollections = useMemo(() => {
    return getCollectionDates(emOkolis, bioOkolis);
  }, [emOkolis, bioOkolis]);

  // Create a map for quick lookup
  const collectionMap = useMemo(() => {
    const map = new Map<string, CollectionDay>();
    allCollections.forEach((c) => map.set(c.date, c));
    return map;
  }, [allCollections]);

  // Get days for the calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    // Don't go before January 2026
    if (prevMonth.getFullYear() >= 2026 ||
        (prevMonth.getFullYear() === 2025 && prevMonth.getMonth() === 11)) {
      setCurrentMonth(prevMonth);
    }
  };

  const goToNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    // Don't go after December 2026
    if (nextMonth.getFullYear() <= 2026) {
      setCurrentMonth(nextMonth);
    }
  };

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const collection = collectionMap.get(dateStr);
    if (collection) {
      setSelectedDay(selectedDay?.date === dateStr ? null : collection);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Koledar 2026</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-medium capitalize">
              {format(currentMonth, "LLLL yyyy", { locale: sl })}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const collection = collectionMap.get(dateStr);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDay?.date === dateStr;
            const isDayToday = isToday(day);

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(day)}
                disabled={!isCurrentMonth}
                className={cn(
                  "relative aspect-square p-1 rounded-lg transition-all text-sm",
                  "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
                  !isCurrentMonth && "text-muted-foreground/30 cursor-default hover:bg-transparent",
                  isSelected && "bg-primary/10 ring-2 ring-primary",
                  isDayToday && "font-bold"
                )}
              >
                <span
                  className={cn(
                    "block",
                    isDayToday &&
                      "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto"
                  )}
                >
                  {format(day, "d")}
                </span>

                {/* Waste type indicators */}
                {collection && isCurrentMonth && (
                  <div className="flex justify-center gap-0.5 mt-0.5">
                    {collection.types.map((type) => (
                      <span
                        key={type}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          wasteTypeConfig[type].dotColor
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day details */}
        {selectedDay && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium capitalize mb-2">
              {format(parseISO(selectedDay.date), "EEEE, d. MMMM yyyy", {
                locale: sl,
              })}
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDay.types.map((type) => (
                <WasteTypeBadge key={type} type={type} />
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Legenda
          </p>
          <div className="flex flex-wrap gap-3">
            {(["E", "M", "B"] as WasteType[]).map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <WasteTypeDot type={type} />
                <span className="text-xs text-muted-foreground">
                  {wasteTypeConfig[type].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
