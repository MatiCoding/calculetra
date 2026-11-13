# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.6.0] - 2026-11-13

### Added
- Cifras: after you pick a number and an operator, every other number shows the result it would give. It turns orange when it is 10 or less away from the target, blue when it is the target, and says "no vale" when the operation is not allowed.
- Cifras: a "Cómo has llegado" box with a tree of your operations. Tap a result to undo that branch, and only that branch.
- Cifras: swap a starting number in the tree for a free one, by dragging it onto the tree or by tapping both. Every operation that depends on it is calculated again, and if any stops being valid a message explains why.
- Cifras: when you open the game from the home page, the orange shrinks onto the six tiles and their numbers appear.
- Letras: a "Pista" button puts a letter of the longest word in its place on the board. The position is the same for every player on the same day. You can use up to 3 hints; they cost 1, 2 and 3 points, and a message asks you to confirm each one. Your word has to use the hint letters, and "Quitar pistas" / "Ver pistas" lets you take them away to send a shorter word.
- Cifras: a "Pista" button does the next operation of one of the shortest solutions to the best possible number. You can use up to 3 hints; they cost 1, 2 and 3 points, and a message asks you to confirm each one. If your operations can no longer reach the best number, they are undone first. "Quitar pistas" / "Ver pistas" takes the hints off the board or puts them back without paying again.

### Changed
- Cifras has a new look, like the rest of the app: "Reto nº N · objetivo" above the target, bigger tiles and buttons, and a beige background. On wide screens the board is on the left and the tree on the right, so you do not have to scroll. The tree replaces the old list of steps.
- Letras has a new board: your word fills nine sunken slots, and each letter drops in as a blue tile. A counter under the board shows how many letters you have and the minimum of three. When you send, the tiles hop one by one: white with a blue border and a "+1" each if the word is valid, dark blue with a ring around the board if it uses all nine, and grey if it is not in the dictionary. After the hop, the keys go away and a card shows your points, a countdown to the next letters and a "Volver a jugar" button. Letras only uses blue, white and grey, and has the beige background and the font of the rest of the app.
- Letras: the day's letters appear spinning like slot-machine reels and stop one by one, from left to right. When you open the game from the home page, the blue shrinks onto the nine keys first. Nothing moves if your system asks for reduced motion.

## [0.5.1] - 2026-11-05

### Changed
- Account emails (confirm your account, reset your password and change your email) are now in Spanish, show the Calculetra name and come from calculetra.game@gmail.com, instead of Supabase's default emails in English.
- The contact email in the privacy policy is now calculetra.game@gmail.com.

## [0.5.0] - 2026-11-04

### Added
- A loading screen while your session is restored. When you reload a page that needs an account (like `/account`) or open the reset password link, you see bouncing Cifras tiles with "Cargando…" instead of a blank page. It only appears if loading takes longer than 300 ms, and the tiles stay still if your system asks for reduced motion.

### Changed
- A new account page. A profile card shows your email, how you log in (with its icon) and since when you are a member. The options are now tabs (Resumen, Contraseña, Correo and Eliminar cuenta) instead of three open forms, with the same look as the games. The selected tab is kept in the URL, and you can move between tabs with the arrow keys.

## [0.4.0] - 2026-10-30

### Added
- Letras: a new daily letters challenge at `/letras`. You get nine letters (three to five of them vowels), the same for everyone, and build the longest Spanish word you can. You only get one answer: one point per letter if the word is in the dictionary, 18 if it uses all nine, and 0 if it is not. You can click or type the letters, delete with Backspace and send with Enter.
- The Letras card on the home page now opens the game.

## [0.3.0] - 2026-10-29

### Added
- A home page with the games: Letras, Cifras and a "Más retos" card coming soon. On computers they are a carousel with arrows, dots and floating letter tiles behind; on phones they are a list that opens one game at a time.
- Each daily challenge shows its number ("Reto nº N").

### Changed
- The Cifras game now lives at `/cifras`, with a link back to the games.

## [0.2.1] - 2026-10-26

### Security
- Updated development dependencies (`undici`, `zod`) with security fixes. The published app was not affected.

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

[Unreleased]: https://github.com/MatiCoding/calculetra/compare/v0.5.0...HEAD
[0.5.1]: https://github.com/MatiCoding/calculetra/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/MatiCoding/calculetra/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/MatiCoding/calculetra/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/MatiCoding/calculetra/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/MatiCoding/calculetra/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/MatiCoding/calculetra/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/MatiCoding/calculetra/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/MatiCoding/calculetra/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/MatiCoding/calculetra/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/MatiCoding/calculetra/releases/tag/v0.1.0