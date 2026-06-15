/* Create a new post folder with frontmatter and an index.md file. */

import fs from "node:fs";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

const POSTS_DIR = path.join("src", "content", "posts");
const args = process.argv.slice(2);
const interactive = Boolean(input.isTTY && output.isTTY);
const rl = interactive ? readline.createInterface({ input, output }) : null;

function getDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

function getFlag(name) {
	const exactIndex = args.indexOf(`--${name}`);
	if (exactIndex !== -1) return args[exactIndex + 1] ?? "";

	const prefix = `--${name}=`;
	const value = args.find((arg) => arg.startsWith(prefix));
	return value ? value.slice(prefix.length) : "";
}

function getTitleArg() {
	return args
		.filter((arg) => !arg.startsWith("--"))
		.join(" ")
		.trim();
}

async function ask(label, defaultValue = "") {
	if (!interactive || !rl) return defaultValue;

	const suffix = defaultValue ? ` (${defaultValue})` : "";
	const answer = await rl.question(`${label}${suffix}: `);
	return answer.trim() || defaultValue;
}

async function askBoolean(label, defaultValue = false) {
	const answer = (await ask(label, defaultValue ? "y" : "n")).toLowerCase();
	return ["y", "yes", "true", "1", "co", "có"].includes(answer);
}

function slugify(value) {
	return value
		.trim()
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function parseTags(value) {
	return value
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean);
}

function yamlString(value) {
	return JSON.stringify(value ?? "");
}

function yamlArray(values) {
	return `[${values.map((value) => yamlString(value)).join(", ")}]`;
}

try {
	const title = await ask("Tiêu đề", getFlag("title") || getTitleArg());
	if (!title) {
		console.error("Error: Tiêu đề không được để trống.");
		process.exit(1);
	}

	const slug = slugify(
		await ask("Slug thư mục", getFlag("slug") || slugify(title)),
	);
	if (!slug) {
		console.error("Error: Slug không hợp lệ.");
		process.exit(1);
	}

	const published = await ask(
		"Ngày đăng YYYY-MM-DD",
		getFlag("date") || getDate(),
	);
	const description = await ask("Mô tả ngắn", getFlag("description"));
	const category = await ask("Danh mục", getFlag("category"));
	const tags = parseTags(
		await ask("Tags, cách nhau bằng dấu phẩy", getFlag("tags")),
	);
	const image = await ask("Ảnh bìa, để trống nếu chưa có", getFlag("image"));
	const pinned = await askBoolean(
		"Ghim bài? y/n",
		getFlag("pinned") === "true",
	);
	const pinOrder = pinned
		? Number(await ask("Thứ tự ghim", getFlag("pinOrder") || "0"))
		: 0;
	const latest = await askBoolean(
		"Đánh dấu mới nhất? y/n",
		getFlag("latest") === "true",
	);
	const latestOrder = latest
		? Number(await ask("Thứ tự mới nhất", getFlag("latestOrder") || "0"))
		: 0;
	const draft = await askBoolean("Lưu nháp? y/n", getFlag("draft") === "true");

	const targetDir = path.join(POSTS_DIR, slug);
	const targetFile = path.join(targetDir, "index.md");

	if (fs.existsSync(targetFile)) {
		console.error(`Error: File ${targetFile} already exists.`);
		process.exit(1);
	}

	fs.mkdirSync(targetDir, { recursive: true });

	const content = `---
title: ${yamlString(title)}
published: ${published}
description: ${yamlString(description)}
image: ${yamlString(image)}
tags: ${yamlArray(tags)}
category: ${yamlString(category)}
pinned: ${pinned}
pinOrder: ${Number.isFinite(pinOrder) ? pinOrder : 0}
latest: ${latest}
latestOrder: ${Number.isFinite(latestOrder) ? latestOrder : 0}
draft: ${draft}
lang: ""
---

<!--
Ghi chú nhanh:
- image ở frontmatter là ảnh bìa, luôn hiện ở đầu bài.
- Ảnh trong nội dung thì đặt đúng dòng cần hiện bằng cú pháp:
  ![](./ten-anh.jpg)
-->

Viết nội dung ở đây.
`;

	fs.writeFileSync(targetFile, content, "utf8");
	console.log(`Post created: ${targetFile}`);
} finally {
	rl?.close();
}
