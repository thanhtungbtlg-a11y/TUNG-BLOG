# auth.md

This personal blog does not offer public self-service OAuth registration.

## Agent audience

Agents may read public blog pages, fetch `/search-index.json`, request pages as Markdown with `Accept: text/markdown`, and submit anonymous comments through `/api/comments`.

## Public comment submission

Anonymous comments can be submitted with `POST /api/comments`. Comments are held for owner moderation before they appear publicly.

## Owner admin access

Admin APIs are for the site owner only. They require a bearer token provisioned outside the public site, plus repository permissions for the GitHub-backed admin dashboard.

## Agent registration

Public self-service registration is not available. Agents that need elevated owner-admin access must request manual provisioning by email.

```yaml
agent_auth:
  skill: "https://thanhtung0209.com/auth.md"
  register_uri: "mailto:thanhtungbtlg@gmail.com"
  identity_types_supported:
    - "verified_email"
  credential_types_supported:
    - "owner_provisioned_bearer_token"
  bearer_methods_supported:
    - "header"
  scopes_supported:
    - "comments:submit"
    - "admin:posts"
    - "admin:media"
```

Manual provisioning does not create public accounts automatically. Credentials can be revoked by the site owner at any time.

## Contact

For access questions, email `thanhtungbtlg@gmail.com`.
