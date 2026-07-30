import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

// "bars"/"xmark" non esistono nello stile regular di Font Awesome (solo solid) — unica
// eccezione alla famiglia regular usata nel resto del sito (vedi CLAUDE.md).
export function HamburgerIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faBars} className={className} aria-hidden="true" />;
}

export function CloseIcon({ className }: { className?: string }) {
  return <FontAwesomeIcon icon={faXmark} className={className} aria-hidden="true" />;
}
