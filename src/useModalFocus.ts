import { cancelSpeech } from "./speech";
import { useEffect, type RefObject } from "react";

/** Keep the live dialog/opener: React clears refs before passive cleanup. */
export function useModalFocus(ref: RefObject<HTMLDialogElement | null>) {
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    cancelSpeech();
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (opener instanceof HTMLElement && opener.isConnected)
        opener.focus({ preventScroll: true });
    };
  }, [ref]);
}
