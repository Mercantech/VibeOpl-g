import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api";
import { CommentSection } from "../components/CommentSection";
import { useAuth } from "../context/AuthContext";
import type { Project } from "../types";
import "./ProjectDetailPage.css";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authenticated } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .getProject(Number(id))
      .then(setProject)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!project || !confirm("Er du sikker på at du vil slette dette projekt?")) return;
    await api.deleteProject(project.id);
    navigate("/projekter");
  };

  if (loading) return <div className="container"><p>Indlæser...</p></div>;
  if (error || !project) return <div className="container"><p className="error">{error || "Ikke fundet"}</p></div>;

  const cover = mediaUrl(project.cover_image_path);

  return (
    <div className="container">
      <header className="detail-header">
        <h1>{project.title}</h1>
        <div className="detail-meta">
          Af {project.author_name}
          {project.author_school && ` · ${project.author_school}`}
          {project.author_email && ` · ${project.author_email}`}
        </div>
        <div className="detail-actions">
          <Link to={`/projekter/${project.id}/præsentation`} className="btn btn-primary">
            Start præsentation
          </Link>
          {authenticated && (
            <>
              <Link to={`/projekter/${project.id}/rediger`} className="btn btn-secondary">
                Rediger
              </Link>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Slet
              </button>
            </>
          )}
          <Link to="/projekter" className="btn btn-ghost">
            Tilbage
          </Link>
        </div>
      </header>

      {cover && <img src={cover} alt="" className="detail-cover" />}

      <section className="detail-section">
        <h2>Beskrivelse</h2>
        <p>{project.description}</p>
      </section>

      <section className="detail-section">
        <h2>Sådan bruges det</h2>
        <p>{project.usage_guide}</p>
      </section>

      {project.app_url && (
        <a href={project.app_url} target="_blank" rel="noopener noreferrer" className="app-link">
          Åbn færdig app →
        </a>
      )}

      {project.sections.length > 0 && (
        <section className="detail-section">
          <h2>Sektioner</h2>
          {project.sections.map((s) => (
            <div key={s.id} className="section-block">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              {mediaUrl(s.image_path) && (
                <img src={mediaUrl(s.image_path)!} alt="" style={{ marginTop: "1rem", borderRadius: 8 }} />
              )}
            </div>
          ))}
        </section>
      )}

      <CommentSection projectId={project.id} />
    </div>
  );
}
