export const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 disabled:opacity-60';

export function Button({ variant = 'primary', loading, children, className = '', ...p }) {
  const v = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  }[variant];
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 ${v} ${className}`}
    >
      {loading && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}

export const Card = ({ title, children, className = '' }) => (
  <section className={`rounded-xl border border-slate-200 bg-white p-5 print:hidden ${className}`}>
    {title && <h2 className="mb-3 text-base font-semibold">{title}</h2>}
    {children}
  </section>
);

export const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
