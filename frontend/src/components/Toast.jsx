export default function Toast({ toast }) {
  if (!toast) return null;
  const color = toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600';
  return (
    <div role="status" aria-live="polite" className={`fixed bottom-5 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg print:hidden ${color}`}>
      {toast.message}
    </div>
  );
}
