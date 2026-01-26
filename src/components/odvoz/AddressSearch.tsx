"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Check, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchStreets, StreetSearchResult } from "@/lib/data/okolisi";

interface AddressSearchProps {
  onSelect: (result: StreetSearchResult) => void;
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StreetSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Iskanje ob spremembi query-ja
  useEffect(() => {
    if (query.length >= 2) {
      const searchResults = searchStreets(query, 5);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Zapri dropdown ob kliku izven
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: StreetSearchResult) => {
    setSelectedStreet(result.street);
    setQuery("");
    setIsOpen(false);
    setShowSuccess(true);
    onSelect(result);

    // Skrij uspešno sporočilo po 3 sekundah
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedStreet(null);
    }, 3000);
  };

  return (
    <div className="relative">
      {/* Input polje */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Vnesite svojo ulico"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="pl-10 pr-4"
        />
      </div>

      {/* Dropdown z rezultati */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {results.map((result, index) => (
            <button
              key={`${result.street}-${index}`}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {result.street}
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  Okoliš {result.okolisEM} ({result.okolisEMCode}) + {result.okolisBioCode}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Uspešno sporočilo */}
      {showSuccess && selectedStreet && (
        <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check className="h-3 w-3" />
          </div>
          <span>
            Okoliš nastavljen za <strong>{selectedStreet}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
