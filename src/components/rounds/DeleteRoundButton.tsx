'use client'

import { Button } from '@/components/ui/button'

export function DeleteRoundButton() {
  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
      onClick={(e) => {
        if (!confirm('Delete this round? This cannot be undone.')) e.preventDefault()
      }}
    >
      Delete
    </Button>
  )
}
