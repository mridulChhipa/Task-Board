import { createContext, useEffect, useState } from 'react';
import styles from './PopupProvider.module.css';

type Popup = {
    senderName: string;
    message: string;
}

let popupFunction: ((senderName: string, message: string) => void) | null = null;

export const PopupContext = createContext<
  ((senderName: string, message: string) => void) | null
>(null);

export function PopupProvider({ children }: { children: React.ReactNode }) {
    const [popup, setPopup] = useState<Popup | null>(null);

    useEffect(() => {
        registerPopupFunction(showPopup);
    }, []);

    function showPopup(senderName: string, message: string){
        const timeout = 3000;
        setPopup({senderName, message});
        setTimeout(() => {
            setPopup(null);
        }, timeout);
    }
    return (
      <PopupContext.Provider value={showPopup}>
        {children}
        {popup && (
            <div className={styles.popup}>
                <strong>{popup.senderName}</strong>: {popup.message}
            </div>
        )}
      </PopupContext.Provider>
    );
}

export function registerPopupFunction(fun: typeof popupFunction) {
  popupFunction = fun;
}

export function triggerPopup(senderName: string, message: string) {
  if (popupFunction) {
    popupFunction(senderName, message);
  }
}

