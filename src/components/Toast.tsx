import { useApp } from '../state/AppState'

export function Toast() {
  const { toast } = useApp()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 md:bottom-8" role="status" aria-live="polite">
      {toast && (
        <p key={toast} className="sticker pop-in bg-mustard px-5 py-3 text-center font-display text-sm font-bold">
          {toast}
        </p>
      )}
    </div>
  )
}
