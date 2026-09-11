export function DiscountBadge({ remaining }: { remaining: number }) {
  return (
    <span className="flex h-[65px] w-[65px] flex-col items-center justify-center rounded-full border-2 border-cream bg-brick leading-none text-cream shadow-sm">
      <span className="text-2xl font-extrabold">{remaining}</span>
      <span className="font-mono text-[0.6rem] font-semibold tracking-wide uppercase">token</span>
    </span>
  );
}
