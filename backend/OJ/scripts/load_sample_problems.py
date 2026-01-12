"""
Utility script to seed the three sample problems and copy their statements.

Usage:
    python manage.py shell < scripts/load_sample_problems.py
"""
from pathlib import Path
import shutil

from problems.models import Problem, Users

BASE = Path("sample_problems")
STATEMENTS_DIR = Path("problem_statements")
SAMPLES = [
    {"title": "two_sum", "difficulty": "Easy"},
    {"title": "longest_substring", "difficulty": "Medium"},
    {"title": "median_two_arrays", "difficulty": "Hard"},
]


def main():
    if not BASE.exists():
        raise SystemExit(f"Missing sample folder: {BASE}")

    STATEMENTS_DIR.mkdir(exist_ok=True)

    user = Users.objects.first()
    if user is None:
        user = Users.objects.create(
            name="System",
            email="system@example.com",
            pwd_hash="placeholder",
            is_admin=True,
        )

    problems = []
    for target_id, sample in enumerate(SAMPLES, start=1):
        problem, _created = Problem.objects.get_or_create(
            id=target_id,
            defaults={
                "title": sample["title"],
                "difficulty": sample["difficulty"],
                "created_by": user,
            },
        )
        if not _created:
            problem.title = sample["title"]
            problem.difficulty = sample["difficulty"]
            problem.created_by = user
            problem.save()

        source_file = BASE / f"{sample['title']}.txt"
        if not source_file.exists():
            raise SystemExit(f"Sample file missing: {source_file}")

        target_file = STATEMENTS_DIR / f"{problem.uuid}.txt"
        shutil.copyfile(source_file, target_file)
        problems.append(problem)

    print("Seeded problems:")
    for problem in problems:
        print(f"ID {problem.id} -> {problem.title} (uuid={problem.uuid})")


main()

