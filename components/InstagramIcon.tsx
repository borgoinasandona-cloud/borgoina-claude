import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";

// Instagram è un logo di marca: esiste solo nel set "brands" di Font Awesome, non in regular.
export function InstagramIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faInstagram} className={`h-5 w-5 ${className ?? ""}`} aria-hidden="true" />;
}
