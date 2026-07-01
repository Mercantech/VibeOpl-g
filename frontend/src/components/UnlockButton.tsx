import { useState } from "react";
import { UnlockModal } from "./UnlockModal";

export function UnlockButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        Lås op
      </button>
      <UnlockModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function useUnlockGate() {
  const [open, setOpen] = useState(false);
  return {
    openUnlock: () => setOpen(true),
    UnlockGate: ({ onSuccess }: { onSuccess?: () => void }) => (
      <UnlockModal open={open} onClose={() => setOpen(false)} onSuccess={onSuccess} />
    ),
  };
}
