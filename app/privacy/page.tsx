'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="bg-white rounded-lg border p-8">
          <h1 className="text-3xl font-bold mb-6">Yummii Privacy Policy</h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
            <p className="mb-4">
              When you use Yummii, we collect the information you choose to share:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Email address for account creation, login, and support.</li>
              <li className="mb-2">Recipes, meal plans, and preferences you enter or upload.</li>
              <li className="mb-2">Basic usage analytics to keep the app running smoothly (e.g., error logs).</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
            <p className="mb-4">We only use your data to operate Yummii:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Authenticate your account and keep you signed in.</li>
              <li className="mb-2">Sync recipes and plans across your devices.</li>
              <li className="mb-2">Improve app stability and fix bugs.</li>
            </ul>
            <p className="mb-4">
              We do not sell or rent your personal information or meal data.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Storage</h2>
            <p className="mb-4">
              Your data is securely stored with Supabase (PostgreSQL). Access is restricted to your account, and we implement standard encryption and access controls.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Third-Party Services</h2>
            <p className="mb-4">
              We rely on Supabase for database, authentication, and hosting. Their privacy policies apply to the infrastructure layer, but they do not use your data for their own purposes.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Choices & Rights</h2>
            <p className="mb-4">
              You can view, edit, or delete your recipes and meal plans inside Yummii. If you’d like your account deleted entirely, contact support or use the account deletion option (where available).
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Cookies & Sessions</h2>
            <p className="mb-4">
              Yummii uses cookies/session storage strictly to keep you logged in and to protect your account. We do not use tracking cookies or advertising pixels.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Updates</h2>
            <p className="mb-4">
              We may update this policy as Yummii evolves. We’ll update the “Last updated” date above—please review periodically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
