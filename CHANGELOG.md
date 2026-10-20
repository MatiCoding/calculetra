# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Security
- The site now sends a Content Security Policy and other security headers, so scripts from other sites cannot run on it.
- The saved session is checked with the server when the app opens, instead of being trusted as it is.
- Logging out ends the session on every device, and access tokens expire after 15 minutes.

## [0.1.2] - 2026-10-20

### Changed
- Production is now deployed when a release is published, not on every merge into `main`.

## [0.1.1] - 2026-10-19

### Added
- Documentation on how versions and releases work: ADR 0002 and the release steps in the contribution guide.

## [0.1.0] - 2026-10-19

First playable version.

### Added
- Daily Cifras challenge: the same 6 numbers and target for everyone, changing every day.
- Play Cifras by combining numbers with +, −, × and ÷, with undo, reset and a score based on how close you get to the target.
- Switch between Cifras and Letras (Letras is not playable yet).
- Sign up, log in and log out with email and password. You can play without an account.
- 404 page for unknown addresses.
- Documentation website with the game rules, the architecture and the technical decisions.

[Unreleased]: https://github.com/MatiCoding/calculetra/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/MatiCoding/calculetra/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MatiCoding/calculetra/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MatiCoding/calculetra/releases/tag/v0.1.0