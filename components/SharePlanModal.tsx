'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { createClient } from '@/lib/supabase/client'
import { X, Share2 } from 'lucide-react'

type PlanShare = {
  id: string
  shared_with_email: string
  permission: 'view' | 'edit'
  created_at: string
}

type SharePlanModalProps = {
  isOpen: boolean
  onClose: () => void
  planId: string
  planName: string
}

export default function SharePlanModal({ isOpen, onClose, planId, planName }: SharePlanModalProps) {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'edit'>('view')
  const [shares, setShares] = useState<PlanShare[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingShares, setLoadingShares] = useState(false)

  // Load existing shares when modal opens
  useEffect(() => {
    if (isOpen) {
      loadShares()
    }
  }, [isOpen])

  const loadShares = async () => {
    setLoadingShares(true)
    try {
      const { data, error } = await supabase
        .from('plan_shares')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setShares(data)
      }
    } catch (err) {
      console.error('Error loading shares:', err)
    } finally {
      setLoadingShares(false)
    }
  }

  const handleShare = async () => {
    if (!email.trim()) return

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('plan_shares')
        .insert({
          plan_id: planId,
          shared_with_email: email.trim().toLowerCase(),
          permission: permission,
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          alert('This plan is already shared with this email')
        } else {
          throw error
        }
        return
      }

      if (data) {
        setShares([data, ...shares])
        setEmail('')
        setPermission('view')
      }
    } catch (err) {
      console.error('Error sharing plan:', err)
      alert('Failed to share plan')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('plan_shares')
        .delete()
        .eq('id', shareId)

      if (error) throw error

      setShares(shares.filter(s => s.id !== shareId))
    } catch (err) {
      console.error('Error removing share:', err)
      alert('Failed to remove share')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{planName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Share Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleShare()
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Permission</Label>
              <RadioGroup
                value={permission}
                onValueChange={(value) => setPermission(value as 'view' | 'edit')}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view" id="view" />
                  <Label htmlFor="view" className="font-normal cursor-pointer">
                    View only - Can see the meal plan
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="edit" id="edit" />
                  <Label htmlFor="edit" className="font-normal cursor-pointer">
                    Can edit - Can modify the meal plan
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleShare}
              disabled={loading || !email.trim()}
              className="w-full"
            >
              {loading ? 'Sharing...' : 'Share Plan'}
            </Button>
          </div>

          {/* Existing Shares */}
          {loadingShares ? (
            <div className="text-center text-sm text-gray-500 py-4">
              Loading shares...
            </div>
          ) : shares.length > 0 ? (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Shared With</h4>
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{share.shared_with_email}</p>
                      <p className="text-xs text-gray-500">
                        {share.permission === 'edit' ? 'Can edit' : 'View only'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveShare(share.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-t pt-4 text-center text-sm text-gray-500">
              This plan hasn't been shared with anyone yet
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
