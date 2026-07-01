"""Seed example projects for VibeOpl-g."""

from app.database import SessionLocal
from app.models import Project, ProjectSection


def seed() -> None:
    db = SessionLocal()
    try:
        if db.query(Project).count() > 0:
            print("Database already has projects, skipping seed.")
            return

        projects = [
            Project(
                title="AI Chatbot til historieundervisning",
                description=(
                    "Eleverne bygger en simpel chatbot, der kan svare på spørgsmål om "
                    "en historisk periode. Projektet kombinerer programmering med kildekritik."
                ),
                usage_guide=(
                    "Start med at diskutere hvilke kilder chatbotten må bruge. "
                    "Lad eleverne vibe-code en grundlæggende chat-UI og test den med "
                    "spørgsmål fra undervisningen. Afslut med refleksion over bias i AI."
                ),
                app_url="https://example.com/historie-chatbot",
                author_name="Anna Jensen",
                author_school="Erhvervsakademi København",
                author_email="anna@example.dk",
                sections=[
                    ProjectSection(
                        title="Læringsmål",
                        body="Eleverne kan forklare sammenhængen mellem data, prompt og svar i en AI-chat.",
                        sort_order=0,
                    ),
                    ProjectSection(
                        title="Forløb",
                        body="2 lektioner: intro og opsætning dag 1, test og præsentation dag 2.",
                        sort_order=1,
                    ),
                    ProjectSection(
                        title="Teknisk niveau",
                        body="Begynder – HTML/CSS/JS eller Python med en simpel API.",
                        sort_order=2,
                    ),
                ],
            ),
            Project(
                title="Interaktivt klima-dashboard",
                description=(
                    "Et lille web-dashboard der visualiserer klimadata. "
                    "Perfekt til at øve datahåndtering og brugergrænseflade."
                ),
                usage_guide=(
                    "Brug offentlige datasæt (fx energiforbrug). Eleverne vibe-coder "
                    "grafer og filtre. Fokus på at fortælle en historie med data."
                ),
                app_url=None,
                author_name="Lars Møller",
                author_school="HTX Roskilde",
                author_email="lars@example.dk",
                sections=[
                    ProjectSection(
                        title="Materialer",
                        body="CSV med månedlige tal, projektskabelon, cheat sheet til chart-bibliotek.",
                        sort_order=0,
                    ),
                    ProjectSection(
                        title="Differentiering",
                        body="Niveau 1: ét diagram. Niveau 2: filtre. Niveau 3: sammenligning mellem år.",
                        sort_order=1,
                    ),
                ],
            ),
            Project(
                title="Escape room i Python",
                description=(
                    "Tekstbaseret escape room hvor eleverne løser opgaver med loops, "
                    "betingelser og funktioner."
                ),
                usage_guide=(
                    "Vis et færdigt eksempel først. Lad eleverne i par vibe-code "
                    "deres eget rum med 3–5 opgaver. Peer-test i klassen."
                ),
                app_url="https://example.com/python-escape",
                author_name="Sofie Nielsen",
                author_school="Gymnasium X",
                author_email="sofie@example.dk",
                sections=[
                    ProjectSection(
                        title="Kompetencer",
                        body="Variabler, if/else, while-loops og simple funktioner.",
                        sort_order=0,
                    ),
                    ProjectSection(
                        title="Tip",
                        body="Brug præsentationstilstand til at gennemgå løsninger live på tavlen.",
                        sort_order=1,
                    ),
                ],
            ),
        ]

        db.add_all(projects)
        db.commit()
        print(f"Seeded {len(projects)} projects.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
