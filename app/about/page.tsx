'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
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
          <h1 className="text-3xl font-bold mb-6">About</h1>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-3">About Yummii</h2>
            <p className="mb-4">
              Yummii is a straightforward meal planning app that helps you organize your weekly meals and generate shopping lists.
              The goal was to build something simple, practical, and effective for managing recipes and planning what to cook.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Creator</h2>
            <p className="mb-4">
              Created by <strong>Serdar Salim</strong>
            </p>
            <p className="mb-4">
              Website: <a href="https://serdarsalim.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">serdarsalim.com</a>
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Why I Built This</h2>
            <p className="mb-4">
              I needed a simple, no-frills way to plan meals for the week and keep track of recipes. Most meal planning apps were either too complicated or cluttered with features I didn't need. So I built Yummii to suit my needs - and I use it myself every week.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Features</h2>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Build your personal recipe library with ingredients and instructions</li>
              <li className="mb-2">Plan your meals for the week with a simple drag-and-drop interface</li>
              <li className="mb-2">Generate shopping lists automatically from your meal plan</li>
              <li className="mb-2">Check off ingredients as you shop, with persistent tracking</li>
              <li className="mb-2">Simple, clean interface focused on what matters</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">Contact</h2>
            <p className="mb-4">
              For questions, feedback, or issues, please visit{' '}
              <a href="https://serdarsalim.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">serdarsalim.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
