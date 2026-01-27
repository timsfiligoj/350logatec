'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
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
import { Loader2, Check, User, MapPin, Leaf, Bell } from 'lucide-react'
import { AddressSearch } from '@/components/odvoz/AddressSearch'

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [emOkolis, setEmOkolis] = useState<number | null>(null)
  const [bioOkolis, setBioOkolis] = useState<number | null>(null)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/prijava')
    }
  }, [authLoading, user, router])

  // Check if user already has settings (already onboarded)
  useEffect(() => {
    async function checkExistingSettings() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('em_okolis, bio_okolis')
          .eq('user_id', user.id)
          .single()

        if (!error && data && data.em_okolis !== null) {
          // User already has settings, redirect to /odvoz
          router.push('/odvoz')
          return
        }

        // Load name from user metadata
        const name = user.user_metadata?.full_name || user.user_metadata?.name || ''
        setFullName(name)
      } catch (err) {
        console.error('Error checking settings:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      checkExistingSettings()
    }
  }, [user, supabase, router])

  const handleAddressSelect = (result: StreetSearchResult) => {
    setEmOkolis(result.okolisEM)
    setBioOkolis(result.okolisBio)
  }

  const handleSave = async () => {
    if (!user) return

    // Validation
    if (!fullName.trim()) {
      setError('Prosimo, vnesite vaše ime')
      return
    }

    if (emOkolis === null) {
      setError('Prosimo, izberite vaš okoliš')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Save name to user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (updateError) {
        console.error('Error updating user:', updateError)
        setError('Napaka pri shranjevanju. Poskusite znova.')
        return
      }

      // Save settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email: user.email,  // Store email for analytics
          em_okolis: emOkolis,
          bio_okolis: bioOkolis || 1, // Default to B1 if not set
          email_notifications: emailNotifications,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (settingsError) {
        console.error('Error saving settings:', settingsError)
        setError('Napaka pri shranjevanju nastavitev. Poskusite znova.')
        return
      }

      // Save to localStorage for /odvoz page
      localStorage.setItem('emOkolis', emOkolis.toString())
      localStorage.setItem('bioOkolis', (bioOkolis || 1).toString())

      // Trigger sync event
      window.dispatchEvent(new Event('local-storage-change'))

      // Redirect to /odvoz
      router.push('/odvoz')
    } catch (err) {
      console.error('Error saving:', err)
      setError('Napaka pri shranjevanju. Poskusite znova.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-[500px] shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Dobrodošli v 350logatec!
          </CardTitle>
          <CardDescription className="text-base">
            Nastavite vaš profil za prilagojen prikaz odvozov odpadkov
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Ime */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Ime in priimek
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Janez Novak"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Okoliš */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Vaš okoliš
            </Label>

            {/* Address search */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Poiščite po vaši ulici za avtomatsko nastavitev okoliša
              </p>
              <AddressSearch onSelect={handleAddressSelect} />
            </div>

            {/* Divider */}
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

            {/* Manual selection */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="em-okolis" className="text-sm">
                  Embalaža / Mešani (E/M)
                </Label>
                <Select
                  value={emOkolis?.toString() || ''}
                  onValueChange={(value) => setEmOkolis(value ? parseInt(value) : null)}
                  disabled={saving}
                >
                  <SelectTrigger id="em-okolis">
                    <SelectValue placeholder="Izberite okoliš" />
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

              <div className="space-y-2">
                <Label htmlFor="bio-okolis" className="text-sm">
                  Biološki (Bio)
                </Label>
                <Select
                  value={bioOkolis?.toString() || ''}
                  onValueChange={(value) => setBioOkolis(value ? parseInt(value) : null)}
                  disabled={saving}
                >
                  <SelectTrigger id="bio-okolis">
                    <SelectValue placeholder="Izberite okoliš" />
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
            </div>

            {/* Selected okoliš indicator */}
            {emOkolis !== null && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                <Check className="h-4 w-4" />
                <span>
                  Izbran okoliš: <strong>E{emOkolis} M{emOkolis}</strong>
                  {bioOkolis && <> + <strong>B{bioOkolis}</strong></>}
                </span>
              </div>
            )}
          </div>

          {/* Obvestila */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Obvestila
            </Label>
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Email obvestila</p>
                <p className="text-xs text-muted-foreground">
                  Prejemajte opomnike o odvozih na vaš email
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailNotifications}
                onClick={() => setEmailNotifications(!emailNotifications)}
                disabled={saving}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${emailNotifications ? 'bg-primary' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                    ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            onClick={handleSave}
            disabled={saving || !fullName.trim() || emOkolis === null}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            size="lg"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Shranjevanje...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Shrani in nadaljuj
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
