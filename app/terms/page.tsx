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
            <p className="text-gray-600 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Yummii (“the App”), you agree to abide by these Terms of Service and any applicable laws. If you do not agree, please discontinue using the App.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Service Overview</h2>
            <p className="mb-4">
              Yummii helps you plan meals, store recipes, and organize weekly menus. We provide tools for personal use only; you remain responsible for your dietary decisions and outcomes.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Nutrition & Allergy Disclaimer</h2>
            <p className="mb-4">
              Yummii does not provide nutritional, medical, or allergen advice. Always verify ingredients and consult a qualified professional if you have dietary restrictions or health conditions.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Content Ownership</h2>
            <p className="mb-4">
              You own the recipes you add to Yummii. By uploading content, you grant us a limited license to display it within the App. You also affirm that you have rights to the content you upload.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Third-Party Links & Embeds</h2>
            <p className="mb-4">
              Yummii may include links to platforms like YouTube. We are not affiliated with nor responsible for third-party content or policies. Use external links at your own risk.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Account Responsibilities</h2>
            <p className="mb-4">
              Keep your Yummii account credentials secure. You are responsible for all activity under your account. Notify us immediately of unauthorized use.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Privacy</h2>
            <p className="mb-4">
              Your use of Yummii is subject to our Privacy Policy, which explains how we collect, use, and protect your information.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Acceptable Use</h2>
            <p className="mb-4">
              Do not use Yummii for unlawful purposes, spam, or offensive content. We may suspend accounts that violate these terms or harm other users.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Limitation of Liability</h2>
            <p className="mb-4">
              Yummii is provided “as is.” We are not liable for damages resulting from use of the App, including data loss or missed nutrition goals.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Termination</h2>
            <p className="mb-4">
              We may suspend or terminate access if you violate these terms or abuse the service. You may delete your account at any time.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">11. Changes to Terms</h2>
            <p className="mb-4">
              We may update these terms periodically. Continued use of Yummii after updates constitutes acceptance of the revised terms.
            </p>
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
