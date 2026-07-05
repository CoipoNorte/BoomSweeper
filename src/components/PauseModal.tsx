export function PauseModal({ onResume, onRestart, onHome }: { onResume:()=>void; onRestart:()=>void; onHome:()=>void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'float-up .2s ease-out' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onResume} />
      <div className="relative w-full bg-[#111122] border border-white/[.08] rounded-2xl p-6 text-center" style={{ maxWidth: 340 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor" className="mx-auto mb-4 text-white/25">
          <rect x="12" y="8" width="8" height="32" rx="2"/>
          <rect x="28" y="8" width="8" height="32" rx="2"/>
        </svg>
        <h2 className="text-2xl font-black mb-1">Pausado</h2>
        <p className="text-[11px] text-white/20 mb-6">
          <kbd className="px-1.5 py-0.5 rounded bg-white/[.05] font-mono text-[10px] text-white/30">ESC</kbd> para continuar
        </p>
        <div className="space-y-2.5">
          <button onClick={onResume}  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 active:scale-[.97] transition-transform">▶ Continuar</button>
          <button onClick={onRestart} className="w-full py-3 rounded-xl bg-white/[.04] border border-white/[.06] text-sm font-semibold text-white/50 active:scale-[.97] transition-transform">🔄 Reiniciar</button>
          <button onClick={onHome}    className="w-full py-3 rounded-xl bg-white/[.04] border border-white/[.06] text-sm font-semibold text-white/50 active:scale-[.97] transition-transform">🏠 Menú</button>
        </div>
      </div>
    </div>
  )
}
