import { next } from "@vercel/functions";
import {
	expirePortfolioAccessCookie,
	PORTFOLIO_ACCESS_COOKIE,
	PORTFOLIO_ACCESS_MESSAGE,
	readCookie,
} from "./src/lib/portfolio-access.js";

export const config = {
	matcher: "/portfolio/:path*",
};

export default async function protectPortfolio(request: Request) {
	const accessSecret = process.env.PORTFOLIO_ACCESS_SECRET ?? "";
	const cookie = readCookie(
		request.headers.get("cookie") ?? "",
		PORTFOLIO_ACCESS_COOKIE,
	);
	if (
		accessSecret &&
		cookie &&
		(await tokensMatch(cookie, await createAccessToken(accessSecret)))
	) {
		return next({
			headers: {
				"Set-Cookie": expirePortfolioAccessCookie(),
				"Cache-Control": "private, no-store, max-age=0",
			},
		});
	}

	const requestUrl = new URL(request.url);
	const redirectUrl = new URL("/", request.url);
	redirectUrl.searchParams.set("portfolio", "locked");
	redirectUrl.searchParams.set(
		"next",
		`${requestUrl.pathname}${requestUrl.search}`,
	);
	return new Response(null, {
		status: 307,
		headers: {
			Location: redirectUrl.toString(),
			"Cache-Control": "no-store, max-age=0",
		},
	});
}

async function createAccessToken(secret: string) {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(PORTFOLIO_ACCESS_MESSAGE),
	);
	return toBase64Url(new Uint8Array(signature));
}

async function tokensMatch(left: string, right: string) {
	const encoder = new TextEncoder();
	const [leftHash, rightHash] = await Promise.all([
		crypto.subtle.digest("SHA-256", encoder.encode(left)),
		crypto.subtle.digest("SHA-256", encoder.encode(right)),
	]);
	const leftBytes = new Uint8Array(leftHash);
	const rightBytes = new Uint8Array(rightHash);
	let difference = leftBytes.length ^ rightBytes.length;
	for (let index = 0; index < leftBytes.length; index += 1) {
		difference |= leftBytes[index] ^ (rightBytes[index] ?? 0);
	}
	return difference === 0;
}

function toBase64Url(bytes: Uint8Array) {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary)
		.replaceAll("+", "-")
		.replaceAll("/", "_")
		.replace(/=+$/, "");
}
