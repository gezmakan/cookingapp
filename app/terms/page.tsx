'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using this gym tracker application, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Health and Fitness Disclaimer</h2>
            <p className="mb-4">
              <strong>IMPORTANT:</strong> This application is designed to help you track your workouts and fitness progress. However, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">We are not liable for any injury, illness, or death that may result from your use of this application or participation in any exercise program.</li>
              <li className="mb-2">You should consult with a physician or healthcare professional before beginning any exercise program.</li>
              <li className="mb-2">You assume full responsibility for any risks, injuries, or damages, known or unknown, which you might incur as a result of participating in any fitness activities tracked through this application.</li>
              <li className="mb-2">Exercise involves inherent risks including, but not limited to, muscle strains, sprains, broken bones, heart attack, or stroke.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Third-Party Content Disclaimer</h2>
            <p className="mb-4">
              This application may contain links to third-party content, including but not limited to YouTube videos and other external resources. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">We are not affiliated with, endorsed by, or sponsored by YouTube or any content creators whose videos may be linked within this application.</li>
              <li className="mb-2">All linked third-party content is the property of their respective owners.</li>
              <li className="mb-2">We do not control, verify, or take responsibility for the accuracy, safety, or appropriateness of any third-party content.</li>
              <li className="mb-2">Your use of any third-party content is at your own risk and subject to the terms and conditions of those third parties.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Use License</h2>
            <p className="mb-4">
              Permission is granted to use this application for personal, non-commercial gym tracking purposes.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. User Account</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Privacy</h2>
            <p className="mb-4">
              Your use of the application is also governed by our Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Limitation of Liability</h2>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO PERSONAL INJURY, PROPERTY DAMAGE, LOST PROFITS, OR DATA LOSS ARISING FROM YOUR USE OF THIS APPLICATION.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify, defend, and hold harmless the application, its owners, operators, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the application or violation of these terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. "As Is" Provision</h2>
            <p className="mb-4">
              The application is provided "as is" without any warranties of any kind, either express or implied. We do not guarantee that the application will be error-free, uninterrupted, secure, or free from viruses or other harmful components.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the modified terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
