import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";

export function DiscountBadge({ remaining }: { remaining: number }) {
  return (
    <span className="font-mono inline-flex items-center gap-1.5 rounded-sm bg-brick px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-cream uppercase shadow-sm">
      <FontAwesomeIcon icon={faTag} className="!h-3 !w-3" aria-hidden="true" />
      {remaining} token
    </span>
  );
}
