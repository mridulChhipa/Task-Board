export const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M6 1.5V10.5M1.5 6H10.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
export const IconWarning = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path
      d="M5.5 1L10 9.5H1L5.5 1Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M5.5 4.5V6.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <circle cx="5.5" cy="7.8" r="0.55" fill="currentColor" />
  </svg>
);
export const IconCalendar = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <rect
      x="1"
      y="2"
      width="9"
      height="8"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M3.5 1V3M7.5 1V3M1 5H10"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);
export const IconUser = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
    <path
      d="M1.5 12C1.5 9.51 3.76 7.5 6.5 7.5C9.24 7.5 11.5 9.51 11.5 12"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

export const IconDelete = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
    <path
      d="M5 3.5V2H8V3.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 3.5H11"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      d="M3.5 3.5V10.5C3.5 11.33 4.17 12 5 12H8C8.83 12 9.5 11.33 9.5 10.5V3.5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
