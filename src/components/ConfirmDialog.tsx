'use client'

import { useEffect, useCallback } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'default'
}

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel, variant = 'default',
}: ConfirmDialogProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onCancel()
    if (e.key === 'Enter') onConfirm()
  }, [onConfirm, onCancel])

  useEffect(() => {
    if (!open) return
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, handleKey])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="glass rounded-xl w-full max-w-sm m-4 p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-[#f1f5f9] mb-2">{title}</h3>
        <p className="text-xs text-[#94a3b8] mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold text-[#94a3b8] hover:text-[#f1f5f9] rounded-lg glass-hover transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              variant === 'danger'
                ? 'bg-[#f43f5e]/20 text-[#f43f5e] hover:bg-[#f43f5e]/30'
                : 'glass text-[#f1f5f9] hover:bg-white/10'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
