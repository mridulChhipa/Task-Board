import { createContext, useEffect, useState } from 'react';
import styles from './PopupProvider.module.css';

interface Popup {
  senderName: string;
  message: string;
  error: boolean;
}

let popupFunction:
  | ((senderName: string, message: string, error: boolean) => void)
  | null = null;

export const PopupContext = createContext<
  ((senderName: string, message: string, error: boolean) => void) | null
>(null);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [popup, setPopup] = useState<Popup | null>(null);

  function showPopup(
    senderName: string,
    message: string,
    error: boolean = false,
  ) {
    const timeout = 3000;
    setPopup({ senderName, message, error });
    setTimeout(() => {
      setPopup(null);
    }, timeout);
  }

  useEffect(() => {
    registerPopupFunction(showPopup);
  }, []);

  return (
    <PopupContext.Provider value={showPopup}>
      {children}
      {popup && (
        <div className={popup.error ? styles.error : styles.popup}>
          <strong>{popup.senderName}</strong>: {popup.message}
        </div>
      )}
    </PopupContext.Provider>
  );
}

export function registerPopupFunction(fun: typeof popupFunction) {
  popupFunction = fun;
}

export function triggerPopup(
  senderName: string,
  message: string,
  error: boolean = false,
) {
  if (popupFunction) {
    popupFunction(senderName, message, error);
  }
}
