'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { okolisiEM, okolisiBio, StreetSearchResult } from '@/lib/data/okolisi'
import { Settings, MapPin, Bell, Loader2, Check, User, AlertTriangle } from 'lucide-react'
import { OkolisiDialog } from '@/components/odvoz/OkolisiDialog'
import { AddressSearch } from '@/components/odvoz/AddressSearch'
import { DeleteAccountDialog } from '@/components/settings/DeleteAccountDialog'
import { PushNotificationToggle } from '@/components/pwa/PushNotificationToggle'

interface UserSettings {
  em_okolis: number | null
  bio_okolis: number | null
  email_notifications: boolean
}

export default function NastavitvePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [settings, setSettings] = useState<UserSettings>({
    em_okolis: null,
    bio_okolis: null,
    email_notifications: false, // Privzeto izklopljeno
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect če ni prijavljen
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/prijava?redirectTo=/nastavitve')
    }
  }, [authLoading, user, router])

  // Naloži nastavitve in ime
  useEffect(() => {
    async function loadSettings() {
      if (!user) return

      // Naloži ime iz user metadata
      const name = user.user_metadata?.full_name || user.user_metadata?.name || ''
      setFullName(name)

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = no rows returned
          console.error('Error loading settings:', error)
          return
        }

        if (data) {
          setSettings({
            em_okolis: data.em_okolis,
            bio_okolis: data.bio_okolis,
            email_notifications: data.email_notifications ?? false,
          })
        }
      } catch (err) {
        console.error('Error loading settings:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadSettings()
    }
  }, [user, supabase])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      // Shrani ime v user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (updateError) {
        console.error('Error updating user:', updateError)
        setError('Napaka pri shranjevanju imena. Poskusite znova.')
        return
      }

      // Shrani nastavitve
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email: user.email,  // Store email for analytics
          em_okolis: settings.em_okolis,
          bio_okolis: settings.bio_okolis,
          email_notifications: settings.email_notifications,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Error saving settings:', error)
        setError('Napaka pri shranjevanju nastavitev. Poskusite znova.')
        return
      }

      // Shrani tudi v localStorage za uporabo na /odvoz strani
      localStorage.setItem('emOkolis', settings.em_okolis?.toString() || '')
      localStorage.setItem('bioOkolis', settings.bio_okolis?.toString() || '')

      // Sproži custom event za sinhronizacijo z drugimi komponentami
      window.dispatchEvent(new Event('local-storage-change'))

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Napaka pri shranjevanju nastavitev. Poskusite znova.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-[600px] mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Nastavitve</h1>
              <p className="text-muted-foreground">
                Prilagodite aplikacijo vašim potrebam
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profil Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profil
                </CardTitle>
                <CardDescription>
                  Vaši osebni podatki
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ime in priimek</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Janez Novak"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email ni mogoče spremeniti
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Okoliš Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Okoliš
                  </CardTitle>
                  <OkolisiDialog />
                </div>
                <CardDescription>
                  Izberite vaš okoliš za prikaz pravilnih datumov odvoza
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Iskanje po naslovu */}
                <div className="space-y-2">
                  <Label>Poiščite po naslovu</Label>
                  <AddressSearch
                    onSelect={(result: StreetSearchResult) => {
                      setSettings((s) => ({
                        ...s,
                        em_okolis: result.okolisEM,
                        bio_okolis: result.okolisBio,
                      }))
                    }}
                  />
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
                  <Label htmlFor="em-okolis">
                    Embalaža in mešani odpadki (E/M)
                  </Label>
                  <Select
                    value={settings.em_okolis?.toString() || ''}
                    onValueChange={(value) =>
                      setSettings((s) => ({
                        ...s,
                        em_okolis: value ? parseInt(value) : null,
                      }))
                    }
                  >
                    <SelectTrigger id="em-okolis">
                      <SelectValue placeholder="Izberite E/M okoliš (1-12)" />
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
                  <Label htmlFor="bio-okolis">Biološki odpadki (Bio)</Label>
                  <Select
                    value={settings.bio_okolis?.toString() || ''}
                    onValueChange={(value) =>
                      setSettings((s) => ({
                        ...s,
                        bio_okolis: value ? parseInt(value) : null,
                      }))
                    }
                  >
                    <SelectTrigger id="bio-okolis">
                      <SelectValue placeholder="Izberite Bio okoliš (1-2)" />
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

            {/* Obvestila Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Obvestila
                </CardTitle>
                <CardDescription>
                  Prejemajte opomnike o prihajajočih odvozih
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email obvestila</Label>
                    <p className="text-sm text-muted-foreground">
                      Prejemajte obvestila o odvozih na vaš email
                    </p>
                  </div>
                  <button
                    id="email-notifications"
                    role="switch"
                    aria-checked={settings.email_notifications}
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        email_notifications: !s.email_notifications,
                      }))
                    }
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${settings.email_notifications ? 'bg-primary' : 'bg-gray-300'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                        ${settings.email_notifications ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Push obvestila */}
                <div className="border-t border-gray-100 pt-4">
                  <PushNotificationToggle />
                </div>
              </CardContent>
            </Card>

            {/* Error message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Save Button */}
            <Card>
              <CardFooter className="pt-6">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Shranjevanje...
                    </>
                  ) : saved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Shranjeno!
                    </>
                  ) : (
                    'Shrani nastavitve'
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Nevarno območje */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Nevarno območje
                </CardTitle>
                <CardDescription>
                  Trajne akcije, ki jih ni mogoče razveljaviti
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Izbriši račun</p>
                    <p className="text-sm text-muted-foreground">
                      Trajno izbrišite svoj račun in vse podatke
                    </p>
                  </div>
                  <DeleteAccountDialog />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
