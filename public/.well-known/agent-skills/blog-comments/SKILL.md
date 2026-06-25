# Skill: Submit Blog Comments

Use this skill when an agent is explicitly asked to leave an anonymous comment on Thanh Tung Blog.

## Endpoint

`POST https://www.thanhtung0209.com/api/comments`

## Body

```json
{
	"slug": "post-slug",
	"body": "Comment text up to 600 characters",
	"website": ""
}
```

`website` is a honeypot field and must remain empty.

## Moderation

Submitted comments are pending by default. They only appear after the owner approves them.

## Limits

The comment API blocks spam-like content, duplicate submissions, and rapid repeat submissions.
