import {
	AdminRequestError,
	normaliseAdminError,
	requireAdminToken,
} from "../../src/lib/admin-auth.js";
import {
	commitRepositoryFiles,
	readRepositoryFile,
	readRepositoryFileBase64,
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

type MediaItem = {
	id: string;
	name: string;
	webp: string;
	avif?: string;
	alt: string;
	width: number;
	height: number;
	size: number;
	createdAt: string;
	aliases?: string[];
};

const metadataPath = "src/data/media.json";
const mediaDirectory = "public/media";

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
			response.status(200).json({ items: await readMediaItems() });
			return;
		}

		const body = parseBody(request.body);
		if (request.method === "POST") {
			response.status(201).json(await createMedia(body));
			return;
		}
		if (request.method === "PATCH") {
			response.status(200).json(await updateMedia(body));
			return;
		}
		if (request.method === "DELETE") {
			response.status(200).json(await deleteMedia(body));
			return;
		}

		response.status(405).json({ error: "Phương thức không được hỗ trợ." });
	} catch (error) {
		const result = normaliseAdminError(error);
		response.status(result.status).json({ error: result.message });
	}
}

async function createMedia(body: Record<string, unknown>) {
	const items = await readMediaItems();
	const source = Buffer.from(String(body.contentBase64 ?? ""), "base64");
	if (source.length === 0 || source.length > 4_000_000) {
		throw new AdminRequestError(
			"Ảnh tải lên không hợp lệ hoặc vượt quá 4 MB sau khi nén.",
		);
	}

	const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const requestedName = safeName(String(body.name ?? "image")) || "image";
	const name = uniqueName(requestedName, items);
	const basePath = `${mediaDirectory}/${name}`;
	const { webp, avif, width, height } = await optimiseImage(source, body);
	const item: MediaItem = {
		id,
		name,
		webp: `/media/${name}.webp`,
		avif: avif ? `/media/${name}.avif` : undefined,
		alt: cleanAlt(body.alt),
		width,
		height,
		size: webp.length + (avif?.length ?? 0),
		createdAt: new Date().toISOString(),
		aliases: [],
	};

	await commitRepositoryFiles(
		[
			{ path: `${basePath}.webp`, content: webp },
			...(avif ? [{ path: `${basePath}.avif`, content: avif }] : []),
			{ path: metadataPath, content: encodeItems([item, ...items]) },
		],
		`Add media: ${name}`,
	);
	return { item };
}

async function updateMedia(body: Record<string, unknown>) {
	const items = await readMediaItems();
	const index = items.findIndex((item) => item.id === String(body.id ?? ""));
	if (index < 0)
		throw new AdminRequestError("Không tìm thấy ảnh trong thư viện.", 404);

	const current = items[index];
	const requestedName = safeName(String(body.name ?? current.name));
	if (!requestedName) throw new AdminRequestError("Tên ảnh không hợp lệ.");
	const name = uniqueName(requestedName, items, current.id);
	const updated: MediaItem = {
		...current,
		name,
		webp: `/media/${name}.webp`,
		avif: current.avif ? `/media/${name}.avif` : undefined,
		alt: cleanAlt(body.alt),
		aliases:
			name === current.name
				? (current.aliases ?? [])
				: [...new Set([...(current.aliases ?? []), current.name])],
	};
	items[index] = updated;

	const changes: Array<{ path: string; content?: Buffer }> = [
		{ path: metadataPath, content: encodeItems(items) },
	];
	if (name !== current.name) {
		const webp = await readRepositoryFileBase64(
			`${mediaDirectory}/${current.name}.webp`,
		);
		changes.push({
			path: `${mediaDirectory}/${name}.webp`,
			content: Buffer.from(webp.contentBase64, "base64"),
		});
		if (current.avif) {
			const avif = await readRepositoryFileBase64(
				`${mediaDirectory}/${current.name}.avif`,
			);
			changes.push({
				path: `${mediaDirectory}/${name}.avif`,
				content: Buffer.from(avif.contentBase64, "base64"),
			});
		}
	}

	await commitRepositoryFiles(changes, `Update media: ${current.name}`);
	return { item: updated };
}

async function deleteMedia(body: Record<string, unknown>) {
	const items = await readMediaItems();
	const item = items.find((entry) => entry.id === String(body.id ?? ""));
	if (!item)
		throw new AdminRequestError("Không tìm thấy ảnh trong thư viện.", 404);
	const names = [...new Set([item.name, ...(item.aliases ?? [])])];
	await commitRepositoryFiles(
		[
			...names.flatMap((name) => [
				{ path: `${mediaDirectory}/${name}.webp` },
				...(item.avif ? [{ path: `${mediaDirectory}/${name}.avif` }] : []),
			]),
			{
				path: metadataPath,
				content: encodeItems(items.filter((entry) => entry.id !== item.id)),
			},
		],
		`Delete media: ${item.name}`,
	);
	return { deleted: item.id };
}

async function readMediaItems(): Promise<MediaItem[]> {
	try {
		const file = await readRepositoryFile(metadataPath);
		return JSON.parse(file.content) as MediaItem[];
	} catch (error) {
		if (error instanceof SyntaxError)
			throw new AdminRequestError("Metadata ảnh không hợp lệ.", 500);
		if (error instanceof AdminRequestError && error.status === 404) return [];
		throw error;
	}
}

function encodeItems(items: MediaItem[]) {
	return Buffer.from(`${JSON.stringify(items, null, "\t")}\n`, "utf8");
}

function parseBody(value: unknown) {
	if (typeof value === "string")
		return JSON.parse(value) as Record<string, unknown>;
	return (value ?? {}) as Record<string, unknown>;
}

function safeName(value: string) {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/gi, "d")
		.toLowerCase()
		.replace(/\.[^.]+$/, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
}

function uniqueName(name: string, items: MediaItem[], currentId = "") {
	if (!items.some((item) => item.id !== currentId && item.name === name)) {
		return name;
	}
	return `${name}-${Date.now().toString(36)}`;
}

function cleanAlt(value: unknown) {
	return String(value ?? "")
		.trim()
		.slice(0, 240);
}

async function optimiseImage(source: Buffer, body: Record<string, unknown>) {
	const fallback = {
		webp: source,
		avif: undefined as Buffer | undefined,
		width: safeDimension(body.width),
		height: safeDimension(body.height),
	};

	try {
		const { default: sharp } = await import("sharp");
		const image = sharp(source, { failOn: "warning" }).rotate().resize({
			width: 1920,
			height: 1920,
			fit: "inside",
			withoutEnlargement: true,
		});
		const [webp, avif] = await Promise.all([
			image.clone().webp({ quality: 82, effort: 4 }).toBuffer(),
			image.clone().avif({ quality: 55, effort: 4 }).toBuffer(),
		]);
		const metadata = await sharp(webp).metadata();
		return {
			webp,
			avif,
			width: metadata.width ?? fallback.width,
			height: metadata.height ?? fallback.height,
		};
	} catch (error) {
		console.warn("AVIF optimisation unavailable; using WebP fallback", error);
		return fallback;
	}
}

function safeDimension(value: unknown) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(1, Math.round(number)) : 1;
}
