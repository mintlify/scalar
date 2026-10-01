# Release

## Publishing new versions on npm

Every merge to `main` runs the [Release workflow](.github/workflows/release.yml), mirroring how `mintlify/mint` publishes its packages:

1. Install, build `packages/*`, and run the `@mintlify/openapi-parser` tests.
2. `lerna version patch` bumps every public package that changed since its last release tag, commits the bump as `bump packages`, and tags each package (`@mintlify/openapi-parser@x.y.z`).
3. The bump commit and tags are pushed to `main`.
4. `lerna publish from-package` publishes any version that is not on npm yet, using npm trusted publishing (GitHub OIDC). No npm token is stored in the repository.

Published packages:

- `@mintlify/openapi-parser`
- `@mintlify/openapi-types`

`@mintlify/build-tooling` is private and never published. Changes that only touch Markdown files, tests, or test fixtures do not trigger a version bump.

Releases are always patch bumps. For a minor or major release, set `version` in the package's `package.json` in your PR; the release workflow patch-bumps on top of it (for example `0.1.0` is published as `0.1.1`).

## Setup

- Each published package needs a trusted publisher on npmjs.com: repository `mintlify/scalar`, workflow `release.yml`.
- `PUSH_TOKEN` (optional): a token allowed to push to `main` if branch protection blocks the default `GITHUB_TOKEN`.
- `SLACK_BOT_USER_OAUTH_ACCESS_TOKEN` (optional): enables failure notifications.
