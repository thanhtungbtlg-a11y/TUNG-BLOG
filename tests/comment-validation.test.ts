import assert from "node:assert/strict";
import test from "node:test";
import {
	getClientIp,
	hasControlCharacters,
	hasMatchingCommentContent,
	isUuid,
	isValidEmail,
	looksLikeCommentSpam,
	normaliseCommentAuthor,
	normaliseCommentContent,
	parseCommentBody,
} from "../src/lib/comment-validation.ts";

test("normalizes optional comment author names", () => {
	assert.equal(
		normaliseCommentAuthor("  Nguyễn   Thanh Tùng  "),
		"Nguyễn Thanh Tùng",
	);
	assert.equal(normaliseCommentAuthor(undefined), "");
	assert.equal(hasControlCharacters("Nguyễn Thanh Tùng"), false);
	assert.equal(hasControlCharacters("Thanh\nTùng"), true);
});

test("normalizes comment content for duplicate detection", () => {
	assert.equal(
		normaliseCommentContent("  Em Tùng lớn rồi :D  "),
		normaliseCommentContent("em tùng lớn rồi :D"),
	);
	assert.notEqual(
		normaliseCommentContent("Bình luận thứ nhất"),
		normaliseCommentContent("Bình luận thứ hai"),
	);
	assert.equal(
		hasMatchingCommentContent(
			[{ body: " Em Tùng lớn rồi :D " }],
			"em tùng lớn rồi :D",
		),
		true,
	);
	assert.equal(
		hasMatchingCommentContent(
			[{ body: "Bình luận đã bị xoá" }],
			"Bình luận mới",
		),
		false,
	);
});

test("validates UUID and optional notification email", () => {
	assert.equal(isUuid("fdda765f-fc57-5604-a269-52a7df8164ec"), true);
	assert.equal(isUuid("not-a-comment-id"), false);
	assert.equal(isValidEmail("reader@example.com"), true);
	assert.equal(isValidEmail("reader@example"), false);
});

test("detects link floods and repeated-character spam", () => {
	assert.equal(looksLikeCommentSpam("Một bình luận bình thường."), false);
	assert.equal(
		looksLikeCommentSpam("https://a.test https://b.test https://c.test"),
		true,
	);
	assert.equal(looksLikeCommentSpam("aaaaaaaaaaaaaaa"), true);
});

test("uses the first forwarded IP and falls back safely", () => {
	assert.equal(
		getClientIp({ "x-forwarded-for": "203.0.113.4, 10.0.0.1" }),
		"203.0.113.4",
	);
	assert.equal(getClientIp({ "x-real-ip": ["203.0.113.9"] }), "203.0.113.9");
	assert.equal(getClientIp({}), "unknown");
});

test("parses object and JSON request bodies", () => {
	assert.deepEqual(parseCommentBody('{"slug":"hello"}'), { slug: "hello" });
	assert.deepEqual(parseCommentBody({ slug: "hello" }), { slug: "hello" });
	assert.deepEqual(parseCommentBody(["hello"]), {});
	assert.deepEqual(parseCommentBody(null), {});
});
