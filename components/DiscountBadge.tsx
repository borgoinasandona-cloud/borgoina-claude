export function DiscountBadge({ remaining }: { remaining: number }) {
  return (
    <span className="flex flex-col items-center rounded-md bg-brick px-3 py-1.5 leading-none text-cream shadow-sm">
      <span className="text-2xl font-extrabold">{remaining}</span>
      <span className="font-mono mt-1 text-[0.6rem] font-semibold tracking-wide uppercase">token</span>
    </span>
  );
}
