# Skill: Search Thanh Tung Blog

Use this skill to discover posts, tags, and categories on Thanh Tung Blog.

## Data source

Fetch `https://www.thanhtung0209.com/search-index.json`.

The response contains:

- `posts`: title, description, URL, tags, category, published date, and searchable plain text content.
- `tags`: tag names and counts.
- `categories`: category names, counts, and URLs.

## Suggested flow

1. Normalize the user query to lowercase.
2. Search `title`, `description`, `tags`, `category`, and `content`.
3. Prefer exact title and tag matches, then content matches.
4. Open the returned `url` for the selected post.
