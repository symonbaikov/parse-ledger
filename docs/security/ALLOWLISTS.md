# Security allowlists

These allowlists document temporary exceptions used by CI gates. Review them regularly and remove once upstream fixes are available.

## Dependency vulnerabilities

Configured in `backend/audit-ci.json` and used by `dependency-scan` job:

- `GHSA-cf4h-3jhx-xvhq` (underscore via pdf2json) — no upstream fix available.
- `GHSA-h6q6-9hqw-rwfv`, `GHSA-crh6-fp67-6883`, `GHSA-5fg8-2547-mr8q` (xmldom via pdf2json) — no upstream fix available.
- `GHSA-4r6h-8v6p-xvw6`, `GHSA-5pgg-2g8v-p4x9` (xlsx) — no upstream fix available.

## License exceptions

`dependency-scan` runs license checks with a permissive allowlist that currently permits LGPL artifacts required by the build:

- `pdf2json` (LGPL) transitively pulled by `pdf2table` in the backend.
- `@img/sharp-libvips-*` (LGPL) required by Next.js image pipeline.

If licensing requirements change, adjust the `ALLOWED_LICENSES` string in `.github/workflows/ci.yml` and tighten/removing these exceptions.
