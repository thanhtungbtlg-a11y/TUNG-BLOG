import assert from "node:assert/strict";
import test from "node:test";
import {
	expirePortfolioAccessCookie,
	isPortfolioPath,
	PORTFOLIO_ACCESS_COOKIE,
	readCookie,
} from "../src/lib/portfolio-access.ts";

test("reads the protected portfolio cookie without leaking adjacent cookies", () => {
	assert.equal(
		readCookie(
			`theme=dark; ${PORTFOLIO_ACCESS_COOKIE}=signed-token; session=other`,
			PORTFOLIO_ACCESS_COOKIE,
		),
		"signed-token",
	);
	assert.equal(readCookie("theme=dark", PORTFOLIO_ACCESS_COOKIE), "");
	assert.equal(
		readCookie(`${PORTFOLIO_ACCESS_COOKIE}=%E0%A4%A`, PORTFOLIO_ACCESS_COOKIE),
		"",
	);
});

test("expires portfolio access after one protected navigation", () => {
	assert.equal(
		expirePortfolioAccessCookie(),
		`${PORTFOLIO_ACCESS_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
	);
});

test("matches only the protected portfolio route", () => {
	assert.equal(isPortfolioPath("/portfolio"), true);
	assert.equal(isPortfolioPath("/portfolio/"), true);
	assert.equal(isPortfolioPath("/portfolio/project"), true);
	assert.equal(isPortfolioPath("/portfolio-public"), false);
});
