const STORAGE_KEY = "vibeoplg_profiles";
const SELECTED_KEY = "vibeoplg_selected_profile";

import type { ContributorProfile } from "./types";

function load(): ContributorProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(profiles: ContributorProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function getProfiles(): ContributorProfile[] {
  return load();
}

export function addProfile(name: string, school: string, email: string): ContributorProfile {
  const profiles = load();
  const profile: ContributorProfile = {
    id: crypto.randomUUID(),
    name,
    school,
    email,
  };
  profiles.push(profile);
  save(profiles);
  return profile;
}

export function deleteProfile(id: string) {
  const profiles = load().filter((p) => p.id !== id);
  save(profiles);
  const selected = getSelectedProfileId();
  if (selected === id) {
    localStorage.removeItem(SELECTED_KEY);
  }
}

export function getSelectedProfileId(): string | null {
  return localStorage.getItem(SELECTED_KEY);
}

export function setSelectedProfileId(id: string | null) {
  if (id) localStorage.setItem(SELECTED_KEY, id);
  else localStorage.removeItem(SELECTED_KEY);
}

export function getSelectedProfile(): ContributorProfile | null {
  const id = getSelectedProfileId();
  if (!id) return null;
  return load().find((p) => p.id === id) ?? null;
}
