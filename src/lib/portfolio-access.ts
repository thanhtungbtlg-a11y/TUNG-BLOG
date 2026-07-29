export const PORTFOLIO_ACCESS_COOKIE = "__Host-portfolio_access";
export const PORTFOLIO_ACCESS_MESSAGE = "portfolio-access-v1";

export function expirePortfolioAccessCookie() {
	return `${PORTFOLIO_ACCESS_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function readCookie(cookieHeader: string, name: string) {
	for (const part of cookieHeader.split(";")) {
		const separator = part.indexOf("=");
		if (separator < 0) continue;
		const key = part.slice(0, separator).trim();
		if (key !== name) continue;
		const value = part.slice(separator + 1).trim();
		try {
			return decodeURIComponent(value);
		} catch {
			return "";
		}
	}
	return "";
}

export function isPortfolioPath(value: string) {
	return value === "/portfolio" || value.startsWith("/portfolio/");
}
