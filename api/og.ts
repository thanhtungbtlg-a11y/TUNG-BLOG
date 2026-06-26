import sharp from "sharp";

type ApiRequest = {
	method?: string;
	query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
	status: (code: number) => ApiResponse;
	setHeader: (name: string, value: string) => void;
	end: (data?: Buffer | string) => void;
	json?: (data: unknown) => void;
};

const width = 1200;
const height = 630;
const maxTitleLines = 4;

export default async function handler(
	request: ApiRequest,
	response: ApiResponse,
): Promise<void> {
	if (request.method && request.method !== "GET") {
		response.status(405).json?.({ error: "Method not allowed." });
		return;
	}

	const title = queryValue(request.query?.title) || "Nguyen Thanh Tung";
	const subtitle =
		queryValue(request.query?.subtitle) ||
		"Just a boy caught up in dreams and fantasies";
	const category = queryValue(request.query?.category) || "Thanh Tung Blog";
	const date = queryValue(request.query?.date);

	const png = await sharp(
		Buffer.from(renderSvg({ title, subtitle, category, date })),
	)
		.png()
		.toBuffer();

	response.setHeader("Content-Type", "image/png");
	response.setHeader(
		"Cache-Control",
		"public, max-age=0, s-maxage=31536000, stale-while-revalidate=604800",
	);
	response.end(png);
}

function renderSvg({
	title,
	subtitle,
	category,
	date,
}: {
	title: string;
	subtitle: string;
	category: string;
	date?: string;
}) {
	const titleLines = wrapText(title, 25, maxTitleLines);
	const subtitleLines = wrapText(subtitle, 48, 2);
	const titleFontSize =
		titleLines.length >= 4 ? 68 : titleLines.length >= 3 ? 76 : 88;
	const titleLineHeight = titleFontSize * 1.08;
	const titleY = 198;
	const subtitleY = titleY + titleLines.length * titleLineHeight + 38;
	const meta = [category, date].filter(Boolean).join(" / ");

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
	<rect width="${width}" height="${height}" fill="#061412"/>
	<path d="M0 0H1200V630H0V0Z" fill="url(#grid)"/>
	<circle cx="1010" cy="120" r="270" fill="#00D5C8" opacity="0.22"/>
	<circle cx="275" cy="650" r="340" fill="#FF7AC7" opacity="0.12"/>
	<rect x="54" y="52" width="1092" height="526" rx="42" fill="#0B1F1C" fill-opacity="0.76" stroke="#40E0D0" stroke-opacity="0.35" stroke-width="2"/>
	<text x="98" y="118" fill="#8FF7EF" font-family="Inter, Arial, DejaVu Sans, sans-serif" font-size="26" font-weight="800" letter-spacing="4">${escapeXml(meta.toUpperCase())}</text>
	${titleLines
		.map(
			(line, index) =>
				`<text x="96" y="${titleY + index * titleLineHeight}" fill="#F4FFFD" font-family="Inter, Arial, DejaVu Sans, sans-serif" font-size="${titleFontSize}" font-weight="900">${escapeXml(line)}</text>`,
		)
		.join("\n\t")}
	${subtitleLines
		.map(
			(line, index) =>
				`<text x="100" y="${subtitleY + index * 42}" fill="#C1D8D4" font-family="Inter, Arial, DejaVu Sans, sans-serif" font-size="30" font-weight="600">${escapeXml(line)}</text>`,
		)
		.join("\n\t")}
	<g transform="translate(96 500)">
		<rect width="272" height="62" rx="31" fill="#102D29" stroke="#40E0D0" stroke-opacity="0.35"/>
		<circle cx="36" cy="31" r="16" fill="#40E0D0"/>
		<text x="66" y="41" fill="#DDFCF8" font-family="Inter, Arial, DejaVu Sans, sans-serif" font-size="24" font-weight="850">thanhtung0209.com</text>
	</g>
	<defs>
		<pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
			<path d="M80 0H0V80" stroke="#74FFF2" stroke-opacity="0.08" stroke-width="1"/>
		</pattern>
	</defs>
</svg>`;
}

function wrapText(value: string, maxLength: number, maxLines: number) {
	const words = value.trim().split(/\s+/u).filter(Boolean);
	const lines: string[] = [];
	let current = "";

	for (const word of words) {
		const next = current ? `${current} ${word}` : word;
		if (next.length <= maxLength || !current) {
			current = next;
			continue;
		}
		lines.push(current);
		current = word;
		if (lines.length === maxLines) break;
	}
	if (current && lines.length < maxLines) lines.push(current);

	if (words.join(" ").length > lines.join(" ").length && lines.length > 0) {
		lines[lines.length - 1] =
			`${lines[lines.length - 1].replace(/\.+$/u, "")}...`;
	}

	return lines.length > 0 ? lines : ["Thanh Tung Blog"];
}

function queryValue(value: string | string[] | undefined) {
	return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function escapeXml(value: string) {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&apos;",
		};
		return entities[character];
	});
}
