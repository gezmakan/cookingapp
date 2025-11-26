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
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information that you <strong>voluntarily provide</strong> when creating an account and using this application, including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Your email address (for account creation and authentication)</li>
              <li className="mb-2">Workout data you voluntarily enter into the application (exercises, sets, reps, weights, dates)</li>
              <li className="mb-2">Workout plans you create or modify</li>
            </ul>
            <p className="mb-4">
              All data is provided by you voluntarily through your use of the application.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
            <p className="mb-4">
              Your information is used <strong>solely</strong> for the following non-commercial purposes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">To provide and maintain your personal gym tracking service</li>
              <li className="mb-2">To authenticate your account and keep you logged in</li>
              <li className="mb-2">To enable you to access, view, and manage your workout data</li>
              <li className="mb-2">To allow account recovery through your email address</li>
            </ul>
            <p className="mb-4">
              <strong>We do NOT use your data for any commercial purposes.</strong> We do not sell, rent, or monetize your personal information or workout data in any way.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Data Storage</h2>
            <p className="mb-4">
              Your workout data is stored securely using Supabase, a third-party database service. We implement appropriate security measures to protect your personal information. Your data is associated with your account and only accessible to you when logged in.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Sharing and Commercial Use</h2>
            <p className="mb-4">
              <strong>We do not sell, trade, rent, or otherwise transfer your personal information or workout data to third parties for any commercial purpose.</strong> Your workout data is private to your account and is not shared with anyone.
            </p>
            <p className="mb-4">
              The only exception is our use of Supabase for secure data storage, which is necessary to provide the service. Supabase has its own privacy policy governing how they handle data.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Rights</h2>
            <p className="mb-4">
              You have the right to access, update, or delete your personal information at any time through your account settings.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Cookies</h2>
            <p className="mb-4">
              We use cookies for authentication purposes to keep you logged in to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
