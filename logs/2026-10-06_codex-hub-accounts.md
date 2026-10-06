# Data Center Hub accounts — 2026-10-06

- User authorized implementation of admin assignment of user groups/departments and positions, and upload to Git.
- Read project context, collaboration rules and FREE lock; acquired lock before edits.
- Reused COMIS users, department_id, position, role, session authentication, API authorization and optimistic revisions. No new credentials or real user assignments created.
- Added Hub account UI, admin create/edit users, temporary password workflow, shared defaults endpoint, and server static route for the existing form folder.
- Static/file Hub clearly identifies independent mode. Central account features require the existing server. Independent forms remain locally stored and are not converted into an authorization-enforced record system.
- Validation: 13 system tests passed; Edge browser test passed create/edit, password reset/change, shared settings, non-admin UI, mobile layout and file mode; no browser page errors. All writes used temporary test databases.
- GitHub Pages release snapshot is historical; this change updates the source Hub and server. Publishing a Node.js service is outside this Git upload.
- Lock released after completion. OneDrive synchronization status is not observable from these tools; Git verification is independent of OneDrive sync.
