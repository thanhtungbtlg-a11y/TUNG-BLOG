import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(repoRoot, "brain", "content");
const defaultVault = "C:\\Users\\NITRO 5\\Downloads\\LEED_Obsidian_Vault";
const vaultDir = resolve(
	process.argv[2] || process.env.OBSIDIAN_VAULT_PATH || defaultVault,
);
const ignoredDirectories = new Set([
	".obsidian",
	".smart-env",
	".trash",
	"private",
	"templates",
]);
const ignoredExtensions = new Set([".base"]);

function isInside(parent, child) {
	const rel = relative(parent, child);
	return rel && !rel.startsWith(`..${sep}`) && rel !== "..";
}

if (!isInside(repoRoot, contentDir)) {
	throw new Error("Refusing to replace content outside the repository");
}

async function shouldCopy(source) {
	const rel = relative(vaultDir, source);
	const parts = rel.split(sep);
	if (parts.some((part) => ignoredDirectories.has(part))) return false;
	if (parts.some((part) => part.startsWith(".") && part !== ".")) return false;
	return !ignoredExtensions.has(extname(source).toLowerCase());
}

async function countMarkdown(directory) {
	let count = 0;
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) count += await countMarkdown(path);
		else if (entry.isFile() && extname(entry.name).toLowerCase() === ".md")
			count += 1;
	}
	return count;
}

await readdir(vaultDir);
await rm(contentDir, { recursive: true, force: true });
await mkdir(contentDir, { recursive: true });
await cp(vaultDir, contentDir, { recursive: true, filter: shouldCopy });

const noteCount = await countMarkdown(contentDir);
const index = `---
title: Thanh Tùng's Second Brain
description: Khu vườn ghi chú Obsidian về LEED, công trình xanh và tư duy bền vững.
---

# Thanh Tùng's Second Brain

Chào mừng bạn đến với khu vườn ghi chú công khai của Nguyễn Thanh Tùng. Nội dung ở đây được viết và liên kết trong Obsidian, sau đó xuất bản bằng Quartz.

## Bắt đầu khám phá

- [[🏠 LEED Core Concepts - INDEX|Mở bản đồ kiến thức LEED]]
- Dùng ô **Tìm kiếm** để tìm trong toàn bộ ghi chú.
- Mở **Graph View** để xem các ý tưởng liên kết với nhau như thế nào.

> Second Brain hiện có ${noteCount} ghi chú được đồng bộ từ vault công khai.

[Quay về blog](https://www.thanhtung0209.com/)
`;

await writeFile(join(contentDir, "index.md"), index, "utf8");

// Ensure the generated landing page can be read before reporting success.
await readFile(join(contentDir, "index.md"), "utf8");
console.log(`Synced ${noteCount} Obsidian notes to brain/content.`);
