import { useState } from "react";
import type { ContributorProfile } from "../types";
import {
  addProfile,
  deleteProfile,
  getProfiles,
  getSelectedProfileId,
  setSelectedProfileId,
} from "../profiles";
import "./ContributorProfileManager.css";

interface Props {
  onSelect?: (profile: ContributorProfile | null) => void;
}

export function ContributorProfileManager({ onSelect }: Props) {
  const [profiles, setProfiles] = useState(getProfiles);
  const [selectedId, setSelectedId] = useState(getSelectedProfileId);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [email, setEmail] = useState("");

  const refresh = () => setProfiles(getProfiles());

  const handleAdd = () => {
    if (!name.trim()) return;
    const profile = addProfile(name.trim(), school.trim(), email.trim());
    setSelectedProfileId(profile.id);
    setSelectedId(profile.id);
    onSelect?.(profile);
    setName("");
    setSchool("");
    setEmail("");
    refresh();
  };

  const handleSelect = (profile: ContributorProfile) => {
    setSelectedProfileId(profile.id);
    setSelectedId(profile.id);
    onSelect?.(profile);
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    if (selectedId === id) {
      setSelectedId(null);
      onSelect?.(null);
    }
    refresh();
  };

  return (
    <div className="profile-manager">
      <h3>Dit bidragsnavn</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 1rem" }}>
        Opret et navn med skole og mail — det udfyldes automatisk på projekter og kommentarer.
      </p>
      <div className="profile-row">
        <div className="form-group">
          <label htmlFor="profile-name">Navn</label>
          <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="profile-school">Skole</label>
          <input id="profile-school" value={school} onChange={(e) => setSchool(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="profile-email">Mail</label>
          <input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleAdd}>
          Tilføj
        </button>
      </div>
      {profiles.length > 0 && (
        <div className="profile-list">
          {profiles.map((p) => (
            <div
              key={p.id}
              className={`profile-chip ${selectedId === p.id ? "selected" : ""}`}
            >
              <button type="button" onClick={() => handleSelect(p)}>
                {p.name} ({p.school || "ingen skole"})
              </button>
              <button type="button" aria-label={`Slet ${p.name}`} onClick={() => handleDelete(p.id)}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (profile: ContributorProfile | null) => void;
}) {
  const profiles = getProfiles();

  return (
    <div className="form-group">
      <label htmlFor="profile-select">Vælg bidragsnavn</label>
      <select
        id="profile-select"
        value={value}
        onChange={(e) => {
          const p = profiles.find((pr) => pr.id === e.target.value) ?? null;
          if (p) setSelectedProfileId(p.id);
          onChange(p);
        }}
      >
        <option value="">— Vælg —</option>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} — {p.school}
          </option>
        ))}
      </select>
    </div>
  );
}
