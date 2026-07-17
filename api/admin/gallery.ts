import {
	AdminRequestError,
	normaliseAdminError,
	requireAdminToken,
} from "../../src/lib/admin-auth.js";
import {
	commitRepositoryFiles,
	readRepositoryFile,
} from "../../src/lib/github-content.js";

type ApiRequest = {
	method?: string;
	headers: Record<string, string | string[] | undefined>;
	body?: unknown;
};

type ApiResponse = {
	status: (code: number) => ApiResponse;
	json: (data: unknown) => void;
};

type GalleryItem = {
	filename: string;
	thumbnail?: string;
	title: string;
	description: string;
	date: string;
	album: string;
	source?: string;
	width: number;
	height: number;
	order?: number;
};

const metadataPath = "src/data/gallery.json";
const statusPath = "src/data/gallery-status.json";
const galleryDirectory = "public/gallery";

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
) {
	try {
		const authorization = request.headers.authorization;
		await requireAdminToken(
			Array.isArray(authorization) ? authorization[0] : (authorization ?? ""),
		);

		if (request.method === "GET") {
			const items = await readGalleryItems();
			response.status(200).json({
				items: items.map(toClientItem),
				albums: [...new Set(items.map((item) => item.album))].sort((a, b) =>
					a.localeCompare(b, "vi"),
				),
			});
			return;
		}

		const body = parseBody(request.body);
		if (request.method === "POST") {
			response.status(201).json(await createGalleryItem(body));
			return;
		}
		if (request.method === "PATCH") {
			response.status(200).json(await updateGalleryItems(body));
			return;
		}
		if (request.method === "DELETE") {
			response.status(200).json(await deleteGalleryItem(body));
			return;
		}

		response.status(405).json({ error: "Method not allowed." });
	} catch (error) {
		const result = normaliseAdminError(error);
		response.status(result.status).json({ error: result.message });
	}
}

async function createGalleryItem(body: Record<string, unknown>) {
	const items = await readGalleryItems();
	const source = Buffer.from(String(body.contentBase64 ?? ""), "base64");
	if (source.length === 0 || source.length > 4_000_000) {
		throw new AdminRequestError(
			"The uploaded image is invalid or exceeds 4 MB after compression.",
		);
	}

	const date = cleanDate(body.date);
	const album = cleanText(body.album, 100) || "Selected photos";
	const title = cleanText(body.title, 140) || "Untitled moment";
	const originalName = cleanText(body.name, 140) || title;
	const baseName = uniqueBaseName(
		`${date}-${slugify(album)}-${slugify(originalName) || "photo"}`,
		items,
	);
	const filename = `photos/${baseName}.webp`;
	const thumbnail = `thumbs/${baseName}.webp`;
	const optimised = await optimiseGalleryImage(source);
	const item: GalleryItem = {
		filename,
		thumbnail,
		title,
		description: cleanText(body.description, 500),
		date,
		album,
		source: `admin/${originalName}`,
		width: optimised.width,
		height: optimised.height,
		order: cleanOrder(body.order, nextAlbumOrder(items, date, album)),
	};

	const nextItems = sortGalleryItems([...items, item]);
	await commitRepositoryFiles(
		[
			{
				path: `${galleryDirectory}/${filename}`,
				content: optimised.full,
			},
			{
				path: `${galleryDirectory}/${thumbnail}`,
				content: optimised.thumbnail,
			},
			{ path: metadataPath, content: encodeItems(nextItems) },
			{ path: statusPath, content: encodeGalleryStatus() },
		],
		`Add gallery photo: ${title}`,
	);

	return { item: toClientItem(item) };
}

async function updateGalleryItems(body: Record<string, unknown>) {
	const items = await readGalleryItems();
	const updates = Array.isArray(body.items)
		? body.items.filter(isRecord)
		: [body];
	if (updates.length === 0)
		throw new AdminRequestError("There are no photo changes to save.");

	const updatedItems: GalleryItem[] = [];
	for (const update of updates) {
		const filename = String(update.filename ?? "");
		const index = items.findIndex((item) => item.filename === filename);
		if (index < 0)
			throw new AdminRequestError(
				"The photo was not found in the gallery.",
				404,
			);

		const current = items[index];
		const updated: GalleryItem = {
			...current,
			title:
				"title" in update
					? cleanText(update.title, 140) || current.title
					: current.title,
			description:
				"description" in update
					? cleanText(update.description, 500)
					: current.description,
			date: "date" in update ? cleanDate(update.date) : current.date,
			album:
				"album" in update
					? cleanText(update.album, 100) || current.album
					: current.album,
			order:
				"order" in update
					? cleanOrder(update.order, current.order ?? 0)
					: current.order,
		};
		items[index] = updated;
		updatedItems.push(updated);
	}

	await commitRepositoryFiles(
		[
			{ path: metadataPath, content: encodeItems(sortGalleryItems(items)) },
			{ path: statusPath, content: encodeGalleryStatus() },
		],
		updates.length === 1
			? `Update gallery photo: ${updatedItems[0].title}`
			: `Reorder gallery album: ${updatedItems[0].album}`,
	);
	return updates.length === 1
		? { item: toClientItem(updatedItems[0]) }
		: { items: updatedItems.map(toClientItem) };
}

async function deleteGalleryItem(body: Record<string, unknown>) {
	const items = await readGalleryItems();
	const filename = String(body.filename ?? "");
	const item = items.find((entry) => entry.filename === filename);
	if (!item)
		throw new AdminRequestError("The photo was not found in the gallery.", 404);

	const files = new Set(
		[item.filename, item.thumbnail].filter((value): value is string =>
			Boolean(value),
		),
	);
	await commitRepositoryFiles(
		[
			...[...files].map((pathname) => ({
				path: `${galleryDirectory}/${pathname}`,
			})),
			{
				path: metadataPath,
				content: encodeItems(
					items.filter((entry) => entry.filename !== item.filename),
				),
			},
			{ path: statusPath, content: encodeGalleryStatus() },
		],
		`Delete gallery photo: ${item.title}`,
	);
	return { deleted: item.filename };
}

async function readGalleryItems(): Promise<GalleryItem[]> {
	try {
		const file = await readRepositoryFile(metadataPath);
		const items = JSON.parse(file.content) as GalleryItem[];
		return sortGalleryItems(normaliseMissingOrders(items));
	} catch (error) {
		if (error instanceof SyntaxError)
			throw new AdminRequestError("The gallery metadata is invalid.", 500);
		if (error instanceof AdminRequestError && error.status === 404) return [];
		throw error;
	}
}

function toClientItem(item: GalleryItem) {
	return {
		...item,
		order: item.order ?? 0,
		src: `/gallery/${encodePublicPath(item.filename)}`,
		thumbnailSrc: `/gallery/${encodePublicPath(item.thumbnail || item.filename)}`,
	};
}

function sortGalleryItems(items: GalleryItem[]) {
	return [...items].sort(
		(a, b) =>
			b.date.localeCompare(a.date) ||
			a.album.localeCompare(b.album, "vi") ||
			(a.order ?? 0) - (b.order ?? 0) ||
			b.filename.localeCompare(a.filename, "vi"),
	);
}

function normaliseMissingOrders(items: GalleryItem[]) {
	const counters = new Map<string, number>();
	for (const item of items) {
		if (!Number.isFinite(item.order)) continue;
		const key = `${item.date}|${item.album}`;
		counters.set(key, Math.max(counters.get(key) ?? 0, item.order ?? 0));
	}
	return [...items]
		.sort(
			(a, b) =>
				b.date.localeCompare(a.date) ||
				a.album.localeCompare(b.album, "vi") ||
				b.filename.localeCompare(a.filename, "vi"),
		)
		.map((item) => {
			const key = `${item.date}|${item.album}`;
			if (Number.isFinite(item.order)) return item;
			const nextOrder = (counters.get(key) ?? 0) + 1;
			counters.set(key, nextOrder);
			return {
				...item,
				order: nextOrder,
			};
		});
}

function nextAlbumOrder(items: GalleryItem[], date: string, album: string) {
	return (
		Math.max(
			0,
			...items
				.filter((item) => item.date === date && item.album === album)
				.map((item) => item.order ?? 0),
		) + 1
	);
}

function uniqueBaseName(value: string, items: GalleryItem[]) {
	let candidate = value || "photo";
	let suffix = 1;
	const names = new Set(items.map((item) => item.filename));
	while (names.has(`photos/${candidate}.webp`)) {
		suffix += 1;
		candidate = `${value}-${suffix}`;
	}
	return candidate;
}

async function optimiseGalleryImage(source: Buffer) {
	try {
		const { default: sharp } = await import("sharp");
		const image = sharp(source, { failOn: "warning" }).rotate();
		const full = await image
			.clone()
			.resize({
				width: 1800,
				height: 1800,
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({ quality: 80, effort: 4, smartSubsample: true })
			.toBuffer();
		const thumbnail = await image
			.clone()
			.resize({
				width: 720,
				height: 720,
				fit: "inside",
				withoutEnlargement: true,
			})
			.webp({ quality: 72, effort: 4, smartSubsample: true })
			.toBuffer();
		const metadata = await sharp(full).metadata();
		return {
			full,
			thumbnail,
			width: metadata.width ?? 1,
			height: metadata.height ?? 1,
		};
	} catch (error) {
		console.error("Gallery image optimisation failed", error);
		throw new AdminRequestError(
			"The uploaded image could not be optimized.",
			500,
		);
	}
}

function encodeItems(items: GalleryItem[]) {
	return Buffer.from(`${JSON.stringify(items, null, "\t")}\n`, "utf8");
}

function encodeGalleryStatus() {
	return Buffer.from(
		`${JSON.stringify({ lastUpdatedAt: new Date().toISOString() }, null, "\t")}\n`,
		"utf8",
	);
}

function parseBody(value: unknown) {
	if (typeof value === "string")
		return JSON.parse(value) as Record<string, unknown>;
	return (value ?? {}) as Record<string, unknown>;
}

function cleanDate(value: unknown) {
	const date = String(value ?? "").trim();
	const parsed = new Date(`${date}T00:00:00.000Z`);
	if (
		!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
		Number.isNaN(parsed.getTime()) ||
		parsed.toISOString().slice(0, 10) !== date
	) {
		throw new AdminRequestError(
			"The capture date must use the YYYY-MM-DD format.",
		);
	}
	return date;
}

function cleanText(value: unknown, maxLength: number) {
	return String(value ?? "")
		.trim()
		.slice(0, maxLength);
}

function cleanOrder(value: unknown, fallback: number) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}

function slugify(value: string) {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/gi, "d")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
}

function encodePublicPath(value: string) {
	return value.split("/").map(encodeURIComponent).join("/");
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
