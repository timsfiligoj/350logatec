'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

export function DeleteAccountDialog() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Prišlo je do napake')
        return
      }

      // Redirect to home page after successful deletion
      router.push('/')
      router.refresh()
    } catch {
      setError('Prišlo je do napake pri brisanju računa')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
          <Trash2 className="h-4 w-4 mr-2" />
          Izbriši račun
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Izbris računa
          </DialogTitle>
          <DialogDescription>
            Ali ste prepričani, da želite izbrisati svoj račun?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <p className="text-sm text-red-800 font-medium mb-2">
            To dejanje je trajno in ga ni mogoče razveljaviti.
          </p>
          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
            <li>Vaš račun bo trajno izbrisan</li>
            <li>Ne boste več prejemali obvestil o odvozih</li>
            <li>Če se želite vrniti, se boste morali znova registrirati</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              Prekliči
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Brisanje...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Izbriši račun
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
