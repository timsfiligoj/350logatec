"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Leaf, LogOut, Settings, Loader2, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/AuthProvider";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    router.push("/");
    router.refresh();
    setIsLoggingOut(false);
  };

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
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 relative z-50">
        <div className="flex h-16 items-center justify-between">
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
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Zapri meni" : "Odpri meni"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation - overlay */}
        {isOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 border-t py-4 bg-background shadow-lg">
            <div className="flex flex-col gap-2">
              {loading ? (
                <div className="px-2 py-1">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : user ? (
                <>
                  <Link
                    href="/odvoz"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary px-2 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Odvoz odpadkov
                  </Link>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-2 py-2 mb-2">
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
                    href="/nastavitve"
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary px-2 py-2 rounded-md hover:bg-muted"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Nastavitve
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 px-2 py-2 rounded-md hover:bg-red-50 transition-colors text-left"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Odjava
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/odvoz"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary px-2 py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Koledar odvoza
                  </Link>
                  <Button asChild className="mt-2 mx-2">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      Prijava
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

    </nav>
  );
}
