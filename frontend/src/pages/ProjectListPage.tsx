import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, mediaUrl } from "../api";
import type { ProjectListItem } from "../types";
import "./ProjectListPage.css";

export function ProjectListPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listProjects()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author_name.toLowerCase().includes(q) ||
        p.author_school.toLowerCase().includes(q)
    );
  }, [projects, search]);

  return (
    <div className="container">
      <header className="page-header">
        <h1>Alle projekter</h1>
        <p>Udforsk vibe-codede idéer fra undervisere inden for programmering.</p>
      </header>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Søg på titel, beskrivelse eller forfatter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Søg projekter"
        />
      </div>

      {loading && <p>Indlæser projekter...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p style={{ color: "var(--text-muted)" }}>Ingen projekter fundet.</p>
      )}

      <div className="project-grid">
        {filtered.map((p) => (
          <Link key={p.id} to={`/projekter/${p.id}`} className="card project-card">
            <div className="project-card-image">
              {mediaUrl(p.cover_image_path) ? (
                <img src={mediaUrl(p.cover_image_path)!} alt="" />
              ) : (
                <span>Intet coverbillede</span>
              )}
            </div>
            <div className="project-card-body">
              <h2>{p.title}</h2>
              <p>{p.description.slice(0, 120)}{p.description.length > 120 ? "…" : ""}</p>
              <div className="project-card-meta">
                {p.author_name}
                {p.author_school && ` · ${p.author_school}`}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
