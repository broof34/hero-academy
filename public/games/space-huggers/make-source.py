"""Build a reproducible GPL corresponding-source archive."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo

root = Path(__file__).resolve().parent
archive = root / "source.zip"
with ZipFile(archive, "w") as output:
    for path in sorted(root.rglob("*")):
        if path.is_file() and path != archive and "__pycache__" not in path.parts:
            entry = ZipInfo(path.relative_to(root).as_posix())
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            output.writestr(entry, path.read_bytes())
