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
            <h2 className="text-xl font-semibold mt-6 mb-3">About This App</h2>
            <p className="mb-4">
              This is a straightforward workout builder and tracker that I created to track my own workout sessions.
              The goal was to build something simple, practical, and effective for managing workout plans and logging progress.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Creator</h2>
            <p className="mb-4">
              Created by <strong>Serdar Salim</strong>
            </p>
            <p className="mb-4">
              Website: <a href="https://serdarsalim.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">serdarsalim.com</a>
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Why I Built This</h2>
            <p className="mb-4">
              I needed a simple, no-frills way to build workout plans and track my sessions. Most fitness apps were either too complicated or lacked the specific features I wanted. So I built this app to suit my needs - and I use it myself for every workout.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">Features</h2>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Create custom workout plans with exercises from our library</li>
              <li className="mb-2">Track your workout sessions with sets, reps, and weights</li>
              <li className="mb-2">Monitor your progress over time</li>
              <li className="mb-2">Simple, clean interface focused on what matters</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">Contact</h2>
            <p className="mb-4">
              For questions, feedback, or issues, please visit{' '}
              <a href="https://serdarsalim.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">serdarsalim.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
