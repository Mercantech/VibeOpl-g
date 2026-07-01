import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, mediaUrl } from "../api";
import type { Project } from "../types";
import "./PresentationMode.css";

type Slide =
  | { type: "cover" }
  | { type: "toc" }
  | { type: "description" }
  | { type: "usage" }
  | { type: "section"; index: number };

export function PresentationMode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .getProject(Number(id))
      .then(setProject)
      .finally(() => setLoading(false));
  }, [id]);

  const slides: Slide[] = useMemo(() => {
    if (!project) return [];
    const list: Slide[] = [{ type: "cover" }, { type: "toc" }];
    if (project.description) list.push({ type: "description" });
    if (project.usage_guide) list.push({ type: "usage" });
    project.sections.forEach((_, i) => list.push({ type: "section", index: i }));
    return list;
  }, [project]);

  const goNext = useCallback(() => {
    setSlideIndex((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setSlideIndex((i) => Math.max(i - 1, 0));
  }, []);

  const exit = useCallback(() => {
    navigate(`/projekter/${id}`);
  }, [navigate, id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        exit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, exit]);

  if (loading || !project) {
    return (
      <div className="presentation">
        <div className="presentation-slide">Indlæser...</div>
      </div>
    );
  }

  const slide = slides[slideIndex];
  const cover = mediaUrl(project.cover_image_path);

  return (
    <div className="presentation" role="region" aria-label="Præsentationstilstand">
      <button type="button" className="btn btn-ghost presentation-close" onClick={exit}>
        Luk (Esc)
      </button>

      <div className="presentation-slide">
        {slide.type === "cover" && (
          <div className="presentation-slide cover">
            {cover && <img src={cover} alt="" />}
            <h1>{project.title}</h1>
            <p className="author">
              {project.author_name}
              {project.author_school && ` · ${project.author_school}`}
            </p>
          </div>
        )}

        {slide.type === "toc" && (
          <div className="presentation-slide toc">
            <h2>Indholdsfortegnelse</h2>
            <ol>
              {project.description && <li>Beskrivelse</li>}
              {project.usage_guide && <li>Sådan bruges det</li>}
              {project.sections.map((s) => (
                <li key={s.id ?? s.title}>{s.title}</li>
              ))}
            </ol>
          </div>
        )}

        {slide.type === "description" && (
          <div className="presentation-slide section">
            <h2>Beskrivelse</h2>
            <p>{project.description}</p>
          </div>
        )}

        {slide.type === "usage" && (
          <div className="presentation-slide section">
            <h2>Sådan bruges det</h2>
            <p>{project.usage_guide}</p>
          </div>
        )}

        {slide.type === "section" && project.sections[slide.index] && (
          <div className="presentation-slide section">
            <h2>{project.sections[slide.index].title}</h2>
            <p>{project.sections[slide.index].body}</p>
            {mediaUrl(project.sections[slide.index].image_path) && (
              <img src={mediaUrl(project.sections[slide.index].image_path)!} alt="" />
            )}
          </div>
        )}
      </div>

      <p className="presentation-hint">← → piletaster · Mellemrum næste · Esc luk</p>

      <div className="presentation-controls">
        <button type="button" className="btn btn-secondary" onClick={goPrev} disabled={slideIndex === 0}>
          Forrige
        </button>
        <span className="presentation-progress">
          {slideIndex + 1} / {slides.length}
        </span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={slideIndex === slides.length - 1 ? exit : goNext}
        >
          {slideIndex === slides.length - 1 ? "Afslut" : "Næste"}
        </button>
      </div>
    </div>
  );
}
