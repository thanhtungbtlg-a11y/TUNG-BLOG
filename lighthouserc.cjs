const baseUrl = "http://127.0.0.1:4326";

module.exports = {
	ci: {
		collect: {
			startServerCommand: "pnpm preview --host 127.0.0.1 --port 4326",
			startServerReadyPattern: "Local",
			url: [
				`${baseUrl}/`,
				`${baseUrl}/archive/`,
				`${baseUrl}/gallery/`,
				`${baseUrl}/about/`,
				`${baseUrl}/brain/`,
				`${baseUrl}/posts/6-thang-nhin-lai/`,
			],
			numberOfRuns: 1,
			settings: {
				chromeFlags: "--headless=new --no-sandbox",
			},
		},
		assert: {
			assertions: {
				"categories:performance": ["error", { minScore: 0.8 }],
				"categories:accessibility": ["error", { minScore: 0.95 }],
				"categories:best-practices": ["error", { minScore: 0.95 }],
				"categories:seo": ["error", { minScore: 0.95 }],
				"first-contentful-paint": ["error", { maxNumericValue: 4000 }],
				"largest-contentful-paint": ["error", { maxNumericValue: 4500 }],
				"total-blocking-time": ["error", { maxNumericValue: 500 }],
				"cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
			},
		},
		upload: {
			target: "filesystem",
			outputDir: "./.lighthouseci",
		},
	},
};
