import assert from "node:assert/strict";
import test from "node:test";
import { normalizeMarkdownPath } from "../src/lib/markdown-path.ts";

test("normalizes local Markdown paths", () => {
	assert.equal(normalizeMarkdownPath(undefined), "/");
	assert.equal(normalizeMarkdownPath("posts/hello"), "/posts/hello");
	assert.equal(normalizeMarkdownPath(["posts", "hello"]), "/posts/hello");
	assert.equal(
		normalizeMarkdownPath("/posts/hello?view=raw#top"),
		"/posts/hello",
	);
});

test("prevents absolute and protocol-relative URL escapes", () => {
	assert.equal(
		normalizeMarkdownPath("https://attacker.example/posts/hello"),
		"/posts/hello",
	);
	assert.equal(
		normalizeMarkdownPath("//attacker.example/posts/hello"),
		"/attacker.example/posts/hello",
	);
	assert.equal(
		normalizeMarkdownPath("\\\\attacker.example\\posts\\hello"),
		"/attacker.example/posts/hello",
	);
});

test("removes control characters from paths", () => {
	assert.equal(normalizeMarkdownPath("/posts/hel\nlo\u007f"), "/posts/hello");
});
