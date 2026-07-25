# Phase 4: Free Distribution and Customer Library

## Goal

Allow visitors to download free games safely and signed-in customers to keep a
personal game library.

## Download experience

- Clearly label every first-release game as free.
- Show the available platforms, current version, file size, system
  requirements, and release notes before download.
- Serve desktop builds through the approved CDN delivery mechanism.
- Redirect users to the Apple App Store, Google Play, or another external store
  when that platform controls distribution.
- Track aggregate download counts without collecting unnecessary personal data.
- Provide unavailable, superseded, and withdrawn release states.

## Customer library

- Allow signed-in customers to add or remove free games from their library.
- List saved games and their supported releases.
- Show platform, version, release notes, file size, and system requirements.
- Record signed-in download history for convenience and support.
- Provide external App Store and Google Play links where direct downloads do
  not apply.

## Release security

- Keep upload and publication access private even if released files are
  publicly downloadable.
- Publish checksums for downloadable builds.
- Scan uploaded artifacts for malware.
- Restrict release creation and publication to authorized admins.
- Audit release and publication changes.
- Define bandwidth limits and abuse alerts.

## Exit criteria

- Only published releases can be downloaded.
- Withdrawn or replaced releases cannot be reached through stale application
  links.
- Download links cannot be used to access unpublished files.
- Saving the same game repeatedly does not create duplicate library entries.
- Direct downloads and external-store redirects work in staging.
