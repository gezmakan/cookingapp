'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Star, Plus, Trash2, Share2, Copy, Check } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import SharePlanModal from '@/components/SharePlanModal'

type MealPlan = {
  id: string
  name: string
  user_id: string
  created_at: string
  is_public: boolean
  share_token: string | null
}

type SharedPlan = {
  id: string
  plan_id: string
  permission: 'view' | 'edit'
  meal_plans: {
    id: string
    name: string
    user_id: string
  }
}

type UserPreferences = {
  default_plan_id: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [myPlans, setMyPlans] = useState<MealPlan[]>([])
  const [sharedPlans, setSharedPlans] = useState<SharedPlan[]>([])
  const [defaultPlanId, setDefaultPlanId] = useState<string | null>(null)
  const [newPlanName, setNewPlanName] = useState('')
  const [creating, setCreating] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string } | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/')
        return
      }
      setUser(user)

      // Load user's owned plans
      const { data: plans, error: plansError} = await supabase
        .from('meal_plans')
        .select('id, name, user_id, created_at, is_public, share_token')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      console.log('Plans query result:', { plans, plansError })

      if (!plansError && plans) {
        setMyPlans(plans)
      } else if (plansError) {
        console.error('Error loading plans:', plansError)
      }

      // Load user preferences
      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('default_plan_id')
        .eq('user_id', user.id)
        .single()

      if (!prefsError && prefs) {
        setDefaultPlanId(prefs.default_plan_id)
      }

      // Load plans shared with user
      try {
        const { data: shares, error: sharesError } = await supabase
          .from('plan_shares')
          .select('id, plan_id, permission')
          .eq('shared_with_email', user.email)

        console.log('Shares result:', { shares, sharesError })

        if (sharesError) {
          console.error('Error loading shares:', sharesError)
        } else if (shares && shares.length > 0) {
          // Fetch plan details separately
          const planIds = shares.map(s => s.plan_id)
          const { data: sharedPlanDetails, error: plansError } = await supabase
            .from('meal_plans')
            .select('id, name, user_id')
            .in('id', planIds)

          console.log('Shared plan details:', { sharedPlanDetails, plansError, planIds })

          if (!plansError && sharedPlanDetails) {
            // Combine shares with plan details
            const combined = shares.map(share => ({
              id: share.id,
              plan_id: share.plan_id,
              permission: share.permission,
              meal_plans: sharedPlanDetails.find(p => p.id === share.plan_id)!
            }))
            console.log('Combined shared plans:', combined)
            setSharedPlans(combined as SharedPlan[])
          }
        }
      } catch (shareErr) {
        console.error('Exception loading shared plans:', shareErr)
      }
    } catch (err) {
      console.error('Error loading user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const setAsDefault = async (planId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.id,
            default_plan_id: planId,
          },
          {
            onConflict: 'user_id'
          }
        )

      console.log('Set default plan result:', { error, planId, userId: user.id })

      if (error) {
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      setDefaultPlanId(planId)
    } catch (err) {
      console.error('Error setting default plan:', err)
      alert('Failed to set default plan')
    }
  }

  const createNewPlan = async () => {
    if (!user || !newPlanName.trim()) return
    if (myPlans.length >= 3) {
      alert('You can only create up to 3 meal plans')
      return
    }

    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          name: newPlanName.trim(),
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setMyPlans([...myPlans, data])
        setNewPlanName('')

        // If this is the first plan, set it as default
        if (myPlans.length === 0) {
          await setAsDefault(data.id)
        }
      }
    } catch (err) {
      console.error('Error creating plan:', err)
      alert('Failed to create plan')
    } finally {
      setCreating(false)
    }
  }

  const deletePlan = async (planId: string) => {
    if (!user) return
    if (myPlans.length <= 1) {
      alert('You must have at least one meal plan')
      return
    }

    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', planId)
        .eq('user_id', user.id)

      if (error) throw error

      const updatedPlans = myPlans.filter(p => p.id !== planId)
      setMyPlans(updatedPlans)

      // If deleted plan was default, set first remaining plan as default
      if (defaultPlanId === planId && updatedPlans.length > 0) {
        await setAsDefault(updatedPlans[0].id)
      }
    } catch (err) {
      console.error('Error deleting plan:', err)
      alert('Failed to delete plan')
    }
  }

  const togglePublic = async (plan: MealPlan) => {
    if (!user) return

    try {
      const newIsPublic = !plan.is_public
      let shareToken = plan.share_token

      // Generate share token if making public and no token exists
      if (newIsPublic && !shareToken) {
        // Generate a random 12-character token
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        shareToken = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
        console.log('Generated share token:', shareToken)
      }

      const { data: updateData, error } = await supabase
        .from('meal_plans')
        .update({
          is_public: newIsPublic,
          share_token: shareToken,
        })
        .eq('id', plan.id)
        .eq('user_id', user.id)
        .select()

      console.log('Update public status result:', { updateData, error, newIsPublic, shareToken })

      if (error) {
        console.error('Error updating plan:', error)
        throw error
      }

      // Update local state
      setMyPlans(myPlans.map(p =>
        p.id === plan.id
          ? { ...p, is_public: newIsPublic, share_token: shareToken }
          : p
      ))
    } catch (err) {
      console.error('Error toggling public:', err)
      alert('Failed to update plan visibility')
    }
  }

  const copyPublicLink = (token: string) => {
    const url = `${window.location.origin}/plan/share/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <h1 className="text-3xl font-bold mb-8 font-quicksand">Settings</h1>

        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* My Plans Section */}
        <Card>
          <CardHeader>
            <CardTitle>My Plans</CardTitle>
            <CardDescription>
              Create up to 3 meal plans. Set one as your default plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Plans */}
            <div className="space-y-3">
              {myPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.name}</span>
                      {defaultPlanId === plan.id && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPlan({ id: plan.id, name: plan.name })
                          setShareModalOpen(true)
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                      {defaultPlanId !== plan.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAsDefault(plan.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePlan(plan.id)}
                        disabled={myPlans.length <= 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Public Link Section */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={plan.is_public}
                        onCheckedChange={() => togglePublic(plan)}
                      />
                      <Label className="text-sm font-normal cursor-pointer" onClick={() => togglePublic(plan)}>
                        Public link
                      </Label>
                    </div>
                    {plan.is_public && plan.share_token && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPublicLink(plan.share_token!)}
                      >
                        {copiedToken === plan.share_token ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Link
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Create New Plan */}
            {myPlans.length < 3 && (
              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="New plan name..."
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') createNewPlan()
                    }}
                  />
                  <Button
                    onClick={createNewPlan}
                    disabled={creating || !newPlanName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Plan
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {myPlans.length} / 3 plans created
                </p>
              </div>
            )}

            {myPlans.length >= 3 && (
              <p className="text-sm text-gray-500 pt-4 border-t">
                You've reached the maximum of 3 plans. Delete a plan to create a new one.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Plans Shared With Me */}
        {sharedPlans.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Plans Shared With Me</CardTitle>
              <CardDescription>
                Meal plans that others have shared with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sharedPlans.map((share) => {
                if (!share.meal_plans) {
                  console.warn('Plan details missing for share:', share)
                  return null
                }
                return (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="font-medium">{share.meal_plans.name}</span>
                        <p className="text-xs text-gray-500">
                          {share.permission === 'edit' ? 'Can edit' : 'View only'}
                        </p>
                      </div>
                      {defaultPlanId === share.plan_id && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {defaultPlanId !== share.plan_id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAsDefault(share.plan_id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/plan?id=${share.plan_id}`)}
                      >
                        View Plan
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Share Plan Modal */}
        {selectedPlan && (
          <SharePlanModal
            isOpen={shareModalOpen}
            onClose={() => {
              setShareModalOpen(false)
              setSelectedPlan(null)
            }}
            planId={selectedPlan.id}
            planName={selectedPlan.name}
          />
        )}
      </div>
    </div>
  )
}
