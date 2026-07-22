import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(repoRoot, "brain", "content");
const vaultStatusFile = join(
	repoRoot,
	"src",
	"data",
	"brain-vault-status.json",
);
const defaultVault =
	"C:\\Users\\NITRO 5\\Downloads\\LEED_Obsidian_Vault_Complete_EN";
const vaultDir = resolve(
	process.argv[2] || process.env.OBSIDIAN_VAULT_PATH || defaultVault,
);
const ignoredDirectories = new Set([
	".obsidian",
	".smart-env",
	".trash",
	"98 - codex reports",
	"_metadata",
	"docs",
	"private",
	"templates",
	"tools",
]);
const ignoredFiles = new Set(["agents.md"]);
const ignoredExtensions = new Set([".base"]);
const publicCanvasDirectory = "public-canvas";

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
	if (parts.some((part) => ignoredDirectories.has(part.toLowerCase())))
		return false;
	if (parts.some((part) => part.startsWith(".") && part !== ".")) return false;
	if (parts.length === 1 && ignoredFiles.has(parts[0].toLowerCase()))
		return false;
	if (parts.some((part) => /(?:^| - )templates?$/i.test(part))) return false;
	const extension = extname(source).toLowerCase();
	if (ignoredExtensions.has(extension)) return false;
	if (extension === ".canvas") {
		return parts.some((part) => part.toLowerCase() === publicCanvasDirectory);
	}
	return true;
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

async function markMarkdownForPublishing(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			await markMarkdownForPublishing(path);
			continue;
		}
		if (!entry.isFile() || extname(entry.name).toLowerCase() !== ".md") {
			continue;
		}

		const content = await readFile(path, "utf8");
		let nextContent = content.replace(/[ \t]+$/gm, "");
		const openingLineEnd = nextContent.indexOf("\n") + 1;
		const hasFrontmatter =
			openingLineEnd > 0 &&
			nextContent.slice(0, openingLineEnd).trim() === "---";
		if (!hasFrontmatter) {
			nextContent = `---\npublish: true\n---\n\n${nextContent}`;
		} else {
			const frontmatterEnd = nextContent.indexOf("\n---", openingLineEnd);
			const frontmatter =
				frontmatterEnd === -1
					? nextContent.slice(openingLineEnd)
					: nextContent.slice(openingLineEnd, frontmatterEnd);
			if (!/^publish\s*:/m.test(frontmatter)) {
				nextContent = `${nextContent.slice(0, openingLineEnd)}publish: true\n${nextContent.slice(openingLineEnd)}`;
			}
		}

		if (nextContent !== content) {
			await writeFile(path, nextContent, "utf8");
		}
	}
}

async function readVaultStatus() {
	try {
		return JSON.parse(await readFile(vaultStatusFile, "utf8"));
	} catch (error) {
		if (error?.code === "ENOENT") return {};
		throw error;
	}
}

await readdir(vaultDir);
await rm(contentDir, { recursive: true, force: true });
await mkdir(contentDir, { recursive: true });
await cp(vaultDir, contentDir, { recursive: true, filter: shouldCopy });

const tableOfContentsPath = join(contentDir, "00_Index.md");
try {
	const tableOfContents = await readFile(tableOfContentsPath, "utf8");
	const repairedTableOfContents = tableOfContents.replace(
		"[[LEED Core Concepts - All Pages|Read all pages continuously]]",
		"[[pages/Page 001|Start reading from page 1]]",
	);
	if (repairedTableOfContents !== tableOfContents) {
		await writeFile(tableOfContentsPath, repairedTableOfContents, "utf8");
	}
} catch (error) {
	if (error?.code !== "ENOENT") throw error;
}

const readmePath = join(contentDir, "README.md");
try {
	const readme = await readFile(readmePath, "utf8");
	const repairedReadme = readme
		.replace(
			/- `LEED Core Concepts - All Pages\.md`: continuous reading note using Obsidian embeds\.\r?\n/,
			"- `pages/Page 001.md` through `Page 106.md`: sequential reading notes with Obsidian embeds.\n",
		)
		.replace(
			/- `_metadata\/page_manifest\.csv`: mapping of pages to generated files\.\r?\n/,
			"",
		);
	if (repairedReadme !== readme) {
		await writeFile(readmePath, repairedReadme, "utf8");
	}
} catch (error) {
	if (error?.code !== "ENOENT") throw error;
}

await markMarkdownForPublishing(contentDir);

const noteCount = await countMarkdown(contentDir);
const index = `---
title: LEED · Second Brain
description: A public Obsidian knowledge vault about LEED, green buildings, and sustainable design.
publish: true
---

# LEED Knowledge Vault

Welcome to Nguyễn Thanh Tùng's public knowledge vault. These notes are written and connected in Obsidian, then published with Quartz.

## Start exploring

- [[100 - Source/Pages/Page 001|Start reading the published LEED source notes]]
- Use **Search** to find anything across the vault.
- Open **Graph View** to explore how ideas connect.

> This LEED vault currently contains ${noteCount} synced notes. Only notes explicitly marked for publication in Obsidian are visible here.

[View other vaults](https://www.thanhtung0209.com/brain/) · [Return to the main site](https://www.thanhtung0209.com/)
`;

await writeFile(join(contentDir, "index.md"), index, "utf8");

// Ensure the generated landing page can be read before reporting success.
await readFile(join(contentDir, "index.md"), "utf8");
const vaultStatus = await readVaultStatus();
vaultStatus.leed = {
	lastSyncedAt: new Date().toISOString(),
	noteCount,
};
await writeFile(
	vaultStatusFile,
	`${JSON.stringify(vaultStatus, null, "\t")}\n`,
	"utf8",
);
console.log(`Synced ${noteCount} Obsidian notes to brain/content.`);
