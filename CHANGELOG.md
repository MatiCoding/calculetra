# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-10-26

### Added
- An account page, opened from your email in the header. Changing your password, changing your email and deleting your account will live there.
- Password reset: "¿Has olvidado tu contraseña?" in the login form sends an email with a link to choose a new password.
- Change password from the account page. You have to type your current password, and Supabase checks it.
- Change email from the account page. The email only changes after you open the confirmation links sent to your current and your new email.
- Delete your account from the account page. You have to type your email to confirm, and then you are logged out and taken to the home page, where a dialog tells you the account was deleted.
- Log in and sign up with Google or GitHub. Logging in with a provider using an email that already has an account logs into that same account.
- On the account page, players who only log in with Google or GitHub see a note instead of the change password and change email forms.
- A privacy policy page at `/privacy`, linked from the footer: what data Calculetra keeps, who processes it and how to delete it.

### Changed
- Log in and sign up are now one designed page: two stacked cards that shuffle when you switch, with ENTRA / ÚNETE letter tiles, a show/hide password button and Google and GitHub buttons.

## [0.1.3] - 2026-10-21

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

[Unreleased]: https://github.com/MatiCoding/calculetra/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/MatiCoding/calculetra/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/MatiCoding/calculetra/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/MatiCoding/calculetra/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MatiCoding/calculetra/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MatiCoding/calculetra/releases/tag/v0.1.0