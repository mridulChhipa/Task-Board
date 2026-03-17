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

export const IconSettings = ({ size = 13 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#475569"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

export const DummyAvatar = () => {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="50"
        cy="50"
        r="49"
        fill="#E5E7EB"
        stroke="#D1D5DB"
        strokeWidth="1"
      />
      <circle cx="50" cy="36" r="18" fill="white" />
      <path
        d="M14.5 81.5C18.5 70 32 60 50 60C68 60 81.5 70 85.5 81.5C77 91 64.5 97 50 97C35.5 97 23 91 14.5 81.5Z"
        fill="white"
      />
    </svg>
  );
};

export const IconCopy = ({ size = 13 }) => {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
