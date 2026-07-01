import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import "./UnlockModal.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UnlockModal({ open, onClose, onSuccess }: Props) {
  const { unlock } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await unlock(password);
      setPassword("");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke logge ind");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="unlock-title">
        <h2 id="unlock-title">Lås op for redigering</h2>
        <p>Indtast kodeord for at oprette projekter, redigere og kommentere.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Kodeord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              autoComplete="current-password"
            />
            {error && <p className="error">{error}</p>}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuller
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Logger ind..." : "Lås op"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
