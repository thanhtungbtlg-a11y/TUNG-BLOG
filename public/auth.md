# auth.md

This personal blog does not offer public self-service OAuth registration.

## Agent audience

Agents may read public blog pages, fetch `/search-index.json`, request pages as Markdown with `Accept: text/markdown`, and submit anonymous comments through `/api/comments`.

## Public comment submission

Anonymous comments can be submitted with `POST /api/comments`. Comments are held for owner moderation before they appear publicly.

## Owner admin access

Admin APIs are for the site owner only. They require a bearer token provisioned outside the public site, plus repository permissions for the GitHub-backed admin dashboard.

## Contact

For access questions, email `thanhtungbtlg@gmail.com`.
