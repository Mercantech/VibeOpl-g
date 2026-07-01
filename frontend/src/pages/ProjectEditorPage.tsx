import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api";
import { ContributorProfileManager, ProfileSelect } from "../components/ContributorProfileManager";
import { useAuth } from "../context/AuthContext";
import { getSelectedProfile, getSelectedProfileId } from "../profiles";
import type { ContributorProfile, ProjectFormData, ProjectSection } from "../types";
import { useUnlockGate } from "../components/UnlockButton";
import "./ProjectEditorPage.css";

const emptySection = (): ProjectSection => ({
  title: "",
  body: "",
  image_path: null,
  sort_order: 0,
});

export function ProjectEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { authenticated, loading: authLoading } = useAuth();
  const { openUnlock, UnlockGate } = useUnlockGate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [usageGuide, setUsageGuide] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [authorSchool, setAuthorSchool] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [profileId, setProfileId] = useState(getSelectedProfileId() ?? "");
  const [sections, setSections] = useState<ProjectSection[]>([emptySection()]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!authLoading && !authenticated) openUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authenticated]);

  useEffect(() => {
    const profile = getSelectedProfile();
    if (profile) applyProfile(profile);
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    api
      .getProject(Number(id))
      .then((p) => {
        setTitle(p.title);
        setDescription(p.description);
        setUsageGuide(p.usage_guide);
        setAppUrl(p.app_url ?? "");
        setCoverPath(p.cover_image_path);
        setAuthorName(p.author_name);
        setAuthorSchool(p.author_school);
        setAuthorEmail(p.author_email);
        setSections(p.sections.length ? p.sections : [emptySection()]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const applyProfile = (profile: ContributorProfile | null) => {
    if (!profile) return;
    setAuthorName(profile.name);
    setAuthorSchool(profile.school);
    setAuthorEmail(profile.email);
    setProfileId(profile.id);
  };

  const handleUpload = async (file: File, onPath: (path: string) => void) => {
    try {
      const { path } = await api.uploadImage(file);
      onPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fejlede");
    }
  };

  const updateSection = (index: number, patch: Partial<ProjectSection>) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= sections.length) return;
    setSections((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy.map((s, i) => ({ ...s, sort_order: i }));
    });
  };

  const removeSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const addSection = () => {
    setSections((prev) => [...prev, { ...emptySection(), sort_order: prev.length }]);
  };

  const buildData = (): ProjectFormData => ({
    title,
    description,
    usage_guide: usageGuide,
    app_url: appUrl || null,
    cover_image_path: coverPath,
    author_name: authorName,
    author_school: authorSchool,
    author_email: authorEmail,
    sections: sections
      .filter((s) => s.title.trim())
      .map((s, i) => ({ ...s, sort_order: i })),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      openUnlock();
      return;
    }
    setError("");
    setSaving(true);
    try {
      const data = buildData();
      if (isEdit && id) {
        await api.updateProject(Number(id), data);
        navigate(`/projekter/${id}`);
      } else {
        const created = await api.createProject(data);
        navigate(`/projekter/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke gemme");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="container"><p>Indlæser...</p></div>;
  }

  if (!authenticated) {
    return (
      <div className="container">
        <p>Du skal låse op med kodeord for at redigere projekter.</p>
        <UnlockGate />
      </div>
    );
  }

  return (
    <div className="container editor-page">
      <h1>{isEdit ? "Rediger projekt" : "Nyt projekt"}</h1>

      <ContributorProfileManager onSelect={applyProfile} />

      <form onSubmit={handleSubmit}>
        <ProfileSelect value={profileId} onChange={applyProfile} />

        <div className="form-group">
          <label htmlFor="title">Titel</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Beskrivelse</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="usage">Sådan bruges det</label>
          <textarea id="usage" value={usageGuide} onChange={(e) => setUsageGuide(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="app-url">Link til færdig app (valgfrit)</label>
          <input id="app-url" type="url" value={appUrl} onChange={(e) => setAppUrl(e.target.value)} placeholder="https://" />
        </div>

        <div className="form-group">
          <label>Cover-billede</label>
          <div className="upload-row">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f, setCoverPath);
              }}
            />
            {coverPath && <span className="badge">{coverPath}</span>}
          </div>
          {mediaUrl(coverPath) && <img src={mediaUrl(coverPath)!} alt="" className="image-preview" />}
        </div>

        <div className="form-group">
          <label htmlFor="author-name">Forfatter</label>
          <input id="author-name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="author-school">Skole</label>
          <input id="author-school" value={authorSchool} onChange={(e) => setAuthorSchool(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="author-email">Mail</label>
          <input id="author-email" type="email" value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} />
        </div>

        <h2 style={{ marginTop: "2rem" }}>Sektioner til præsentation</h2>
        {sections.map((section, index) => (
          <div key={index} className="section-editor">
            <div className="section-editor-header">
              <h4>Sektion {index + 1}</h4>
              <div className="section-actions">
                <button type="button" className="btn btn-ghost" onClick={() => moveSection(index, -1)} disabled={index === 0}>
                  ↑
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1}>
                  ↓
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => removeSection(index)}>
                  Fjern
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Titel</label>
              <input
                value={section.title}
                onChange={(e) => updateSection(index, { title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Indhold</label>
              <textarea
                value={section.body}
                onChange={(e) => updateSection(index, { body: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Billede (valgfrit)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f, (path) => updateSection(index, { image_path: path }));
                }}
              />
              {mediaUrl(section.image_path) && (
                <img src={mediaUrl(section.image_path)!} alt="" className="image-preview" />
              )}
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" onClick={addSection}>
          + Tilføj sektion
        </button>

        {error && <p className="error">{error}</p>}

        <div className="editor-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Gemmer..." : "Gem projekt"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Annuller
          </button>
        </div>
      </form>

      <UnlockGate />
    </div>
  );
}
