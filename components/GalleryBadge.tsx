import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-regular-svg-icons";

export function GalleryBadge() {
  return (
    <span className="font-mono inline-flex items-center gap-1.5 rounded-sm bg-ink/70 px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-cream uppercase backdrop-blur-sm">
      <FontAwesomeIcon icon={faImage} className="!h-3 !w-3" aria-hidden="true" />
      Galleria
    </span>
  );
}
