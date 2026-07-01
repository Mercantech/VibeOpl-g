import { useEffect, useState, type FormEvent } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { getSelectedProfile, getSelectedProfileId } from "../profiles";
import type { Comment, ContributorProfile } from "../types";
import { ContributorProfileManager, ProfileSelect } from "./ContributorProfileManager";
import { UnlockModal } from "./UnlockModal";
import "./CommentSection.css";

interface Props {
  projectId: number;
}

export function CommentSection({ projectId }: Props) {
  const { authenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorSchool, setAuthorSchool] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [profileId, setProfileId] = useState(getSelectedProfileId() ?? "");
  const [error, setError] = useState("");
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = () => {
    api.listComments(projectId).then(setComments).catch(() => {});
  };

  useEffect(() => {
    loadComments();
    const profile = getSelectedProfile();
    if (profile) applyProfile(profile);
  }, [projectId]);

  const applyProfile = (profile: ContributorProfile | null) => {
    if (!profile) return;
    setAuthorName(profile.name);
    setAuthorSchool(profile.school);
    setAuthorEmail(profile.email);
    setProfileId(profile.id);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      setUnlockOpen(true);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.createComment(projectId, {
        author_name: authorName,
        author_school: authorSchool,
        author_email: authorEmail,
        body,
      });
      setBody("");
      loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke oprette kommentar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="comments">
      <h2>Kommentarer ({comments.length})</h2>

      <div className="comment-list">
        {comments.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>Ingen kommentarer endnu. Vær den første!</p>
        )}
        {comments.map((c) => (
          <article key={c.id} className="comment-item">
            <div className="comment-meta">
              <strong>{c.author_name}</strong>
              {c.author_school && ` · ${c.author_school}`}
              {" · "}
              {new Date(c.created_at).toLocaleString("da-DK")}
            </div>
            <p className="comment-body">{c.body}</p>
          </article>
        ))}
      </div>

      {authenticated ? (
        <div className="comment-form">
          <h3>Skriv en kommentar</h3>
          <ContributorProfileManager onSelect={applyProfile} />
          <form onSubmit={handleSubmit}>
            <ProfileSelect
              value={profileId}
              onChange={applyProfile}
            />
            <div className="form-group">
              <label htmlFor="comment-name">Navn</label>
              <input
                id="comment-name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="comment-school">Skole</label>
              <input
                id="comment-school"
                value={authorSchool}
                onChange={(e) => setAuthorSchool(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="comment-email">Mail</label>
              <input
                id="comment-email"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="comment-body">Kommentar</label>
              <textarea
                id="comment-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Sender..." : "Send kommentar"}
            </button>
          </form>
        </div>
      ) : (
        <div className="auth-prompt">
          <p>Lås op med kodeord for at skrive kommentarer.</p>
          <button type="button" className="btn btn-primary" onClick={() => setUnlockOpen(true)}>
            Lås op
          </button>
        </div>
      )}

      <UnlockModal open={unlockOpen} onClose={() => setUnlockOpen(false)} />
    </section>
  );
}
