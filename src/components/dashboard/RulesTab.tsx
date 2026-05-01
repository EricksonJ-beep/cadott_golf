'use client'

import { useState } from 'react'

type Option = {
  label: string
  penalty: 'none' | 'stroke'
  text: string
}

type Section = {
  title: string
  intro?: string
  options: Option[]
  note?: string
}

const SECTIONS: Section[] = [
  {
    title: 'Red Stakes — Penalty Area',
    options: [
      { label: 'Option A', penalty: 'none',   text: 'Play the ball as it lies. You may ground your club as long as it does not improve conditions.' },
      { label: 'Option B', penalty: 'stroke',  text: 'Replay from the original shot location.' },
      { label: 'Option C', penalty: 'stroke',  text: 'Choose a spot as far back as desired on the line from the hole through the point the ball last crossed the edge of the penalty area. Drop within one (1) club length of that spot, no nearer to the hole.' },
      { label: 'Option D', penalty: 'stroke',  text: 'Drop within two (2) club lengths from the point where the ball entered the penalty area, no nearer to the hole.' },
    ],
  },
  {
    title: 'Yellow Stakes — Penalty Area',
    options: [
      { label: 'Option A', penalty: 'none',   text: 'Play the ball as it lies.' },
      { label: 'Option B', penalty: 'stroke',  text: 'Replay from the original shot location.' },
      { label: 'Option C', penalty: 'stroke',  text: 'Drop a ball as far back as desired on a line from the hole through the point the ball crossed the edge of the hazard.' },
    ],
  },
  {
    title: 'Unplayable Lie',
    intro: 'All options cost +1 stroke.',
    options: [
      { label: 'Option A', penalty: 'stroke',  text: 'Replay from the original shot location.' },
      { label: 'Option B', penalty: 'stroke',  text: 'Drop behind the point where the ball lies, keeping that point directly between the hole and the drop spot.' },
      { label: 'Option C', penalty: 'stroke',  text: 'Drop within two (2) club lengths of where the ball lies, no nearer to the hole.' },
    ],
  },
  {
    title: 'White Stakes — Out of Bounds',
    options: [
      { label: 'Option A', penalty: 'stroke',  text: 'Replay from the original shot location (stroke and distance).' },
    ],
    note: 'If you suspect your ball may be lost outside a hazard, announce your intention to play a provisional ball before searching. If the original ball is found in play, you must abandon the provisional and play the original.',
  },
  {
    title: 'Common Rules',
    options: [
      { label: 'Temporary Water',                penalty: 'none',   text: 'Water visible before or after taking a stance. Find the nearest point of relief and drop within 1 club length, no nearer to the hole.' },
      { label: 'Loose Impediments',              penalty: 'none',   text: 'Can be removed anywhere on the course, including bunkers and hazards, as long as the ball does not move.' },
      { label: 'Abnormal Ground Condition',      penalty: 'none',   text: 'Free relief (e.g., ground under repair). Drop within 1 club length of the nearest point of relief, no nearer to the hole.' },
      { label: 'Lost Ball',                      penalty: 'stroke',  text: 'Replay from the original shot location (stroke and distance).' },
    ],
  },
  {
    title: 'Obstructions',
    options: [
      { label: 'Option A', penalty: 'none',   text: 'Play the ball as it lies. You may ground your club as long as it does not improve conditions.' },
      { label: 'Option B', penalty: 'stroke',  text: 'Replay from the original shot location.' },
      { label: 'Option C', penalty: 'stroke',  text: 'Choose a spot as far back as desired on a line from the hole through where the ball last crossed the edge of the obstruction area. Drop within one (1) club length of that spot, no nearer to the hole.' },
    ],
    note: 'White stakes and fence posts defining out of bounds are NOT obstructions — no free relief is granted for them.',
  },
  {
    title: 'Rule 20.1c — Play Two Balls If Uncertain',
    intro: 'If uncertain which rule applies, a player may play two balls:',
    options: [
      { label: 'Step 1', penalty: 'none', text: 'Announce to your marker or fellow competitor your intent to use Rule 20.1c.' },
      { label: 'Step 2', penalty: 'none', text: 'Declare which ball you want to count if the rules permit.' },
      { label: 'Step 3', penalty: 'none', text: 'Complete the hole with both balls.' },
      { label: 'Step 4', penalty: 'none', text: 'Report the situation to the Committee before turning in your scorecard.' },
    ],
  },
]

function PenaltyBadge({ penalty }: { penalty: 'none' | 'stroke' }) {
  if (penalty === 'none') {
    return (
      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
        No Penalty
      </span>
    )
  }
  return (
    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
      +1 Stroke
    </span>
  )
}

function RuleSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 text-left"
      >
        <span className="font-semibold text-sm text-zinc-800">{section.title}</span>
        <span className="text-zinc-400 text-lg leading-none">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 py-3 space-y-3 bg-white">
          {section.intro && (
            <p className="text-xs text-zinc-500 italic">{section.intro}</p>
          )}

          {section.options.map((opt) => (
            <div key={opt.label} className="flex gap-2 items-start">
              <div className="flex flex-col items-start gap-1 shrink-0 min-w-[72px]">
                <span className="text-xs font-semibold text-zinc-600">{opt.label}</span>
                <PenaltyBadge penalty={opt.penalty} />
              </div>
              <p className="text-sm text-zinc-700 leading-snug">{opt.text}</p>
            </div>
          ))}

          {section.note && (
            <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <span className="font-semibold">Note: </span>{section.note}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RulesTab() {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-zinc-900">Rules Reference</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Tap a section to expand. Read-only reference — no scoring.</p>
      </div>

      {SECTIONS.map((section) => (
        <RuleSection key={section.title} section={section} />
      ))}
    </div>
  )
}
