import re
import shutil
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "src"
src = root / "components"

moves = [
    ("AthletesPage.tsx", "app/athletes/components"),
    ("AthleteActivityView.tsx", "app/athletes/components"),
    ("AthleteResultsView.tsx", "app/athletes/components"),
    ("AthleteRecordsView.tsx", "app/athletes/components"),
    ("charts", "app/athletes/components/charts"),
    ("CalendarPage.tsx", "app/calendar/components"),
    ("CalendarViews.tsx", "app/calendar/components"),
    ("VenuesPage.tsx", "app/venues/components"),
    ("VenueMap.tsx", "app/venues/components"),
    ("ComparePage.tsx", "app/1v1s/components"),
    ("AthleteSearchPicker.tsx", "app/1v1s/components"),
    ("FilterPill.tsx", "app/components"),
]


def fix_imports(text: str) -> str:
    for mod in ("api", "context", "types", "utils", "hooks"):
        text = re.sub(rf"from '\.\./{mod}", rf"from '@/{mod}", text)
        text = re.sub(rf'from "\.\./{mod}', rf'from "@/{mod}', text)
        text = re.sub(rf"from '\.\./\.\./{mod}", rf"from '@/{mod}", text)
        text = re.sub(rf'from "\.\./\.\./{mod}', rf'from "@/{mod}', text)
    text = text.replace("from './FilterPill'", "from '@/app/components/FilterPill'")
    return text


for name, dest in moves:
    s = src / name
    d = root / dest
    d.mkdir(parents=True, exist_ok=True)
    if s.is_dir():
        if d.exists():
            shutil.rmtree(d)
        shutil.copytree(s, d)
        for f in d.rglob("*.ts*"):
            f.write_text(fix_imports(f.read_text(encoding="utf-8")), encoding="utf-8")
        shutil.rmtree(s)
    elif s.exists():
        content = fix_imports(s.read_text(encoding="utf-8"))
        (d / name).write_text(content, encoding="utf-8")
        s.unlink()

for leftover in [src / "charts", src]:
    if leftover.exists() and leftover.is_dir() and not any(leftover.iterdir()):
        leftover.rmdir()

print("migrated")
