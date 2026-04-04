export type FoundationIconName =
  | "characters"
  | "compose"
  | "drafts"
  | "export"
  | "outline"
  | "research"
  | "scenes"
  | "settings";

type FoundationIconProps = {
  name: FoundationIconName;
};

export function FoundationIcon({ name }: FoundationIconProps) {
  switch (name) {
    case "characters":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M4.5 18.5C5.3 15.9 7.2 14.5 10 14.5C12.8 14.5 14.7 15.9 15.5 18.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M18 9.5L20.5 12L18 14.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "compose":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 16.5V20H7.5L18.3 9.2L14.8 5.7L4 16.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M13.8 6.7L17.3 10.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "drafts":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6.5 7H14.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6.5 12H14.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6.5 17H12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M15 16L17.7 18.7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M13.7 19L14.3 16.9L17.6 13.6C17.95 13.25 18.5 13.25 18.85 13.6C19.2 13.95 19.2 14.5 18.85 14.85L15.55 18.15L13.7 19Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "export":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4.5V14.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M8.5 8L12 4.5L15.5 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 13.5V18.5H18.5V13.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "outline":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="6.5" cy="7" r="1.2" fill="currentColor" />
          <circle cx="6.5" cy="12" r="1.2" fill="currentColor" />
          <circle cx="6.5" cy="17" r="1.2" fill="currentColor" />
          <path
            d="M10 7H18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M10 12H18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M10 17H18"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "research":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 5.5H15.5C17.4 5.5 18.5 6.6 18.5 8.5V18.5L15.5 16.6L12 18.5L8.5 16.6L5.5 18.5V8.5C5.5 6.6 6.6 5.5 8.5 5.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 9.5H15.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M8.5 12.5H13.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "scenes":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="4.5"
            y="5.5"
            width="15"
            height="10"
            rx="1.8"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M8 5.5V15.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M16.5 8.5V12.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M7.5 18.5H16.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.75L13.17 5.52C13.65 5.63 14.11 5.82 14.52 6.08L16.58 5.48L18.52 7.42L17.92 9.48C18.18 9.89 18.37 10.35 18.48 10.83L20.25 12L18.48 13.17C18.37 13.65 18.18 14.11 17.92 14.52L18.52 16.58L16.58 18.52L14.52 17.92C14.11 18.18 13.65 18.37 13.17 18.48L12 20.25L10.83 18.48C10.35 18.37 9.89 18.18 9.48 17.92L7.42 18.52L5.48 16.58L6.08 14.52C5.82 14.11 5.63 13.65 5.52 13.17L3.75 12L5.52 10.83C5.63 10.35 5.82 9.89 6.08 9.48L5.48 7.42L7.42 5.48L9.48 6.08C9.89 5.82 10.35 5.63 10.83 5.52L12 3.75Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3.1"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
  }
}
