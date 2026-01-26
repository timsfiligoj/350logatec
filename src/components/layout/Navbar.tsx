"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Leaf, Settings, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/AuthProvider";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    setIsOpen(false);
    router.push("/");
    router.refresh();
    setIsLoggingOut(false);
  };

  const closeMenu = () => setIsOpen(false);

  // Pridobi ime iz Google metadata ali uporabi email
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <nav className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">350logatec</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-4">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : user ? (
            <>
              <Link
                href="/odvoz"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Odvoz odpadkov
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 hover:bg-muted transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {initials}
                    </div>
                    <span className="text-sm font-medium">{displayName}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{displayName}</p>
                    {user.email && displayName !== user.email && (
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/nastavitve" className="cursor-pointer">
                      <Settings className="h-4 w-4" />
                      Nastavitve
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Odjava
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Prijava
              </Link>
              <Button asChild>
                <Link href="/odvoz">Koledar odvoza</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Zapri meni" : "Odpri meni"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Menu Panel - Slide in from right */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">350logatec</span>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Zapri meni"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Links */}
        <div className="flex flex-col p-4 space-y-1">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{displayName}</p>
                  {user.email && displayName !== user.email && (
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </div>

              <Link
                href="/odvoz"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary font-medium transition-colors"
              >
                Koledar odvoza
              </Link>
              <Link
                href="/nastavitve"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary font-medium transition-colors flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Nastavitve
              </Link>

              <div className="pt-4 mt-4 border-t">
                <button
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center gap-2"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Odjava
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/odvoz"
                onClick={closeMenu}
                className="px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-primary font-medium transition-colors"
              >
                Koledar odvoza
              </Link>

              <div className="pt-4 mt-4 border-t">
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="block w-full px-4 py-3 rounded-lg bg-primary text-white text-center font-medium hover:bg-primary/90 transition-colors"
                >
                  Prijava
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
