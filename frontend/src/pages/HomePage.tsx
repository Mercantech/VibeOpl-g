import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import "./HomePage.css";

export function HomePage() {
  const [discordUrl, setDiscordUrl] = useState("#");

  useEffect(() => {
    api.getConfig().then((c) => setDiscordUrl(c.discord_url)).catch(() => {});
  }, []);

  return (
    <div className="container">
      <section className="hero">
        <h1>
          Inspiration til <span>vibe-codede</span> undervisningsprojekter
        </h1>
        <p>
          Del og udforsk idéer til programmeringsundervisning. Brug platformen til dialog,
          inspiration og præsentation af projekter sammen med andre undervisere.
        </p>
        <div className="hero-actions">
          <Link to="/projekter" className="btn btn-primary">
            Se alle projekter
          </Link>
          <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            Join Discord
          </a>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Projektoversigt</h3>
          <p>Billeder, beskrivelser og vejledning til hvordan projekterne bruges i undervisningen.</p>
        </div>
        <div className="feature">
          <h3>Præsentationstilstand</h3>
          <p>Skift mellem forside, indholdsfortegnelse og sektioner — perfekt til tavle og projektor.</p>
        </div>
        <div className="feature">
          <h3>Dialog</h3>
          <p>Kommenter på projekter og del erfaringer med kolleger inden for programmering.</p>
        </div>
      </section>

      <section className="discord-banner">
        <h2>Snak med os på Discord</h2>
        <p>Del idéer, spørg om hjælp og hold kontakten med andre undervisere.</p>
        <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          Åbn Discord
        </a>
      </section>
    </div>
  );
}
