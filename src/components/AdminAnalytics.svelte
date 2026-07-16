<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import type { AnalyticsReport, AnalyticsTotals } from "../lib/analytics";

type Preset = "24h" | "7d" | "30d" | "90d" | "custom";
type ChartMetric = "views" | "visitors";
type PageSort = "views" | "visitors" | "recent";
type AnalyticsResponse = {
	range: { from: string; to: string; path: string };
	report: AnalyticsReport;
	comparison: {
		range: { from: string; to: string };
		totals: AnalyticsTotals;
	};
	truncated: boolean;
};

let { accessToken }: { accessToken: string } = $props();
let preset = $state<Preset>("7d");
let selectedPath = $state("");
let customFrom = $state(toDateInput(new Date(Date.now() - 7 * 86_400_000)));
let customTo = $state(toDateInput(new Date()));
let chartMetric = $state<ChartMetric>("views");
let pageQuery = $state("");
let pageSort = $state<PageSort>("views");
let eventQuery = $state("");
let eventDevice = $state("");
let loading = $state(false);
let error = $state("");
let data = $state<AnalyticsResponse | null>(null);
let knownPages = $state<Array<{ path: string; title: string }>>([]);

onMount(() => {
	void loadAnalytics();
});

async function loadAnalytics() {
	if (!accessToken) return;
	loading = true;
	error = "";
	try {
		const { from, to } = getRange();
		const params = new URLSearchParams({
			from: from.toISOString(),
			to: to.toISOString(),
		});
		if (selectedPath) params.set("path", selectedPath);
		const response = await fetch(`/api/admin/analytics?${params}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		const text = await response.text();
		let result: AnalyticsResponse | { error?: string } = {};
		try {
			result = text ? JSON.parse(text) : {};
		} catch {
			result = {};
		}
		if (!response.ok || !("report" in result)) {
			throw new Error(
				("error" in result && result.error) ||
					"Analytics data could not be loaded.",
			);
		}
		data = result;
		const merged = new Map(knownPages.map((page) => [page.path, page]));
		for (const page of result.report.pages) {
			merged.set(page.path, { path: page.path, title: page.title });
		}
		knownPages = [...merged.values()].sort((left, right) =>
			left.path.localeCompare(right.path),
		);
	} catch (cause) {
		error =
			cause instanceof Error
				? cause.message
				: "Analytics data could not be loaded.";
	} finally {
		loading = false;
	}
}

function getRange() {
	const to = new Date();
	if (preset === "custom") {
		const customStart = new Date(`${customFrom}T00:00:00`);
		const customEnd = new Date(`${customTo}T23:59:59.999`);
		if (
			Number.isNaN(customStart.getTime()) ||
			Number.isNaN(customEnd.getTime()) ||
			customStart >= customEnd
		) {
			throw new Error("The custom date range is invalid.");
		}
		return { from: customStart, to: customEnd };
	}
	const duration = {
		"24h": 86_400_000,
		"7d": 7 * 86_400_000,
		"30d": 30 * 86_400_000,
		"90d": 90 * 86_400_000,
	}[preset];
	return { from: new Date(to.getTime() - duration), to };
}

function toDateInput(date: Date) {
	const offset = date.getTimezoneOffset() * 60_000;
	return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function formatNumber(value: number) {
	return new Intl.NumberFormat("en-GB").format(value);
}

function formatDecimal(value: number) {
	return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(
		value,
	);
}

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "short",
		timeStyle: "medium",
		timeZone: "Asia/Ho_Chi_Minh",
	}).format(new Date(value));
}

function formatBucket(value: string) {
	const [date, time] = value.split("T");
	const [year, month, day] = date.split("-");
	return time ? `${day}/${month} ${time}` : `${day}/${month}/${year.slice(2)}`;
}

function formatComparisonRange() {
	if (!data) return "";
	const formatter = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "short",
		timeZone: "Asia/Ho_Chi_Minh",
	});
	return `${formatter.format(new Date(data.comparison.range.from))} – ${formatter.format(new Date(data.comparison.range.to))}`;
}

function pageLabel(path: string, title: string) {
	return title ? `${title} · ${path}` : path;
}

function deviceLabel(value: string) {
	return (
		{
			desktop: "Desktop",
			mobile: "Mobile",
			tablet: "Tablet",
			unknown: "Unknown",
		}[value] ?? value
	);
}

function sourceLabel(value: string) {
	return value === "direct" ? "Direct" : value;
}

function metricCards() {
	if (!data) return [];
	const current = data.report.totals;
	const previous = data.comparison.totals;
	return [
		{ label: "Views", value: current.views, previous: previous.views },
		{
			label: "Visitors",
			value: current.visitors,
			previous: previous.visitors,
		},
		{
			label: "Sessions",
			value: current.sessions,
			previous: previous.sessions,
		},
		{ label: "Pages viewed", value: current.pages, previous: previous.pages },
		{
			label: "Views / session",
			value: current.viewsPerSession,
			previous: previous.viewsPerSession,
			decimal: true,
		},
		{
			label: "Bounce rate",
			value: current.bounceRate,
			previous: previous.bounceRate,
			suffix: "%",
			inverse: true,
		},
	];
}

function trend(current: number, previous: number, inverse = false) {
	if (current === previous) return { label: "No change", tone: "neutral" };
	if (previous === 0) return { label: "New", tone: "neutral" };
	const change = Math.round(((current - previous) / previous) * 100);
	const rising = change > 0;
	const good = inverse ? !rising : rising;
	return {
		label: `${rising ? "↑" : "↓"} ${Math.abs(change)}%`,
		tone: good ? "positive" : "negative",
	};
}

function chartValue(point: AnalyticsReport["series"][number]) {
	return point[chartMetric];
}

function maxSeriesValue() {
	return Math.max(1, ...(data?.report.series.map(chartValue) ?? [1]));
}

function filteredPages() {
	if (!data) return [];
	const query = pageQuery.trim().toLocaleLowerCase("vi");
	return data.report.pages
		.filter(
			(page) =>
				!query ||
				page.title.toLocaleLowerCase("vi").includes(query) ||
				page.path.toLocaleLowerCase("vi").includes(query),
		)
		.sort((left, right) => {
			if (pageSort === "visitors") return right.visitors - left.visitors;
			if (pageSort === "recent") {
				return right.lastViewedAt.localeCompare(left.lastViewedAt);
			}
			return right.views - left.views;
		})
		.slice(0, 100);
}

function filteredEvents() {
	if (!data) return [];
	const query = eventQuery.trim().toLocaleLowerCase("vi");
	return data.report.events.filter(
		(event) =>
			(!eventDevice || event.device === eventDevice) &&
			(!query ||
				event.title.toLocaleLowerCase("vi").includes(query) ||
				event.path.toLocaleLowerCase("vi").includes(query) ||
				event.referrer.toLocaleLowerCase("vi").includes(query)),
	);
}

function sharePercent(views: number) {
	const total = data?.report.totals.views ?? 0;
	return total ? Math.round((views / total) * 100) : 0;
}

function exportEvents() {
	const rows = filteredEvents();
	const csvRows = [
		["Time", "Title", "Path", "Device", "Source"],
		...rows.map((event) => [
			formatDateTime(event.viewedAt),
			event.title,
			event.path,
			deviceLabel(event.device),
			sourceLabel(event.referrer || "direct"),
		]),
	];
	const csv = csvRows.map((row) => row.map(escapeCsv).join(",")).join("\n");
	const url = URL.createObjectURL(
		new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
	);
	const link = document.createElement("a");
	link.href = url;
	link.download = `thong-ke-${toDateInput(new Date())}.csv`;
	document.body.append(link);
	link.click();
	link.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function escapeCsv(value: string) {
	return `"${value.replaceAll('"', '""')}"`;
}
</script>

<section class="analytics-dashboard" aria-labelledby="analytics-title">
	<header class="analytics-heading">
		<div>
			<h2 id="analytics-title">View analytics</h2>
			<p>Anonymous data in Vietnam time. No IP addresses or identifying information are stored.</p>
		</div>
		<button class="icon-button" type="button" onclick={loadAnalytics} disabled={loading} title="Refresh" aria-label="Refresh analytics">
			<Icon
				icon="material-symbols:refresh-rounded"
				class={loading ? "spin" : undefined}
			/>
		</button>
	</header>

	<form class="analytics-filters" onsubmit={(event) => { event.preventDefault(); void loadAnalytics(); }}>
		<label>
			<span>Time range</span>
			<select bind:value={preset}>
				<option value="24h">Last 24 hours</option>
				<option value="7d">Last 7 days</option>
				<option value="30d">Last 30 days</option>
				<option value="90d">Last 90 days</option>
				<option value="custom">Custom</option>
			</select>
		</label>
		{#if preset === "custom"}
			<label><span>From</span><input type="date" bind:value={customFrom} /></label>
			<label><span>To</span><input type="date" bind:value={customTo} /></label>
		{/if}
		<label class="path-filter">
			<span>Page viewed</span>
			<select bind:value={selectedPath}>
				<option value="">All pages</option>
				{#each knownPages as page}
					<option value={page.path}>{pageLabel(page.path, page.title)}</option>
				{/each}
			</select>
		</label>
		<button class="apply-button" type="submit" disabled={loading}>
			<Icon icon="material-symbols:filter-alt-outline-rounded" /> Apply
		</button>
	</form>

	{#if error}
		<div class="analytics-message error" role="alert">{error}</div>
	{:else if loading && !data}
		<div class="analytics-message"><Icon icon="material-symbols:progress-activity" /> Loading analytics...</div>
	{:else if data}
		<div class="comparison-note">
			<Icon icon="material-symbols:compare-arrows-rounded" />
			Compared with the previous period: {formatComparisonRange()}
		</div>

		<div class="metric-grid">
			{#each metricCards() as metric}
				{@const metricTrend = trend(metric.value, metric.previous, metric.inverse)}
				<article>
					<span>{metric.label}</span>
					<strong>{metric.decimal ? formatDecimal(metric.value) : formatNumber(metric.value)}{metric.suffix ?? ""}</strong>
					<small class={metricTrend.tone}>{metricTrend.label} <span>vs previous period</span></small>
				</article>
			{/each}
		</div>

		<section class="analytics-panel chart-panel" aria-labelledby="views-chart-title">
			<div class="panel-heading">
				<div>
					<h3 id="views-chart-title">Trend over time</h3>
					<span>Intervals with no views are still shown.</span>
				</div>
				<div class="segmented-control" aria-label="Chart metric">
					<button type="button" class:active={chartMetric === "views"} onclick={() => { chartMetric = "views"; }}>Views</button>
					<button type="button" class:active={chartMetric === "visitors"} onclick={() => { chartMetric = "visitors"; }}>Visitors</button>
				</div>
			</div>
			{#if data.report.totals.views > 0}
				<div class="chart-scroll">
					<div class="bar-chart" style={`--chart-columns: ${data.report.series.length}`}>
						{#each data.report.series as point}
							<div class="bar-column" title={`${point.views} views · ${point.visitors} visitors`}>
								<span class="bar-value">{chartValue(point)}</span>
								<div class="bar-track"><span style={`height: ${(chartValue(point) / maxSeriesValue()) * 100}%`}></span></div>
								<small>{formatBucket(point.bucket)}</small>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<p class="empty-copy">No views in this period.</p>
			{/if}
		</section>

		<section class="analytics-panel" aria-labelledby="popular-pages-title">
			<div class="panel-heading table-heading">
				<div>
					<h3 id="popular-pages-title">Pages viewed</h3>
					<span>Up to 100 results for the current filters.</span>
				</div>
				<div class="table-tools">
					<label class="search-control">
						<Icon icon="material-symbols:search-rounded" />
						<input aria-label="Search pages" placeholder="Search title or path" bind:value={pageQuery} />
					</label>
					<select aria-label="Sort pages" bind:value={pageSort}>
						<option value="views">Most views</option>
						<option value="visitors">Most visitors</option>
						<option value="recent">Recently viewed</option>
					</select>
				</div>
			</div>
			<div class="table-scroll">
				<table>
					<thead><tr><th>Page</th><th>Views</th><th>Visitors</th><th>Share</th><th>Last viewed</th></tr></thead>
					<tbody>
						{#each filteredPages() as page}
							<tr>
								<td><a href={page.path} target="_blank" rel="noopener">{page.title || page.path}</a><small>{page.path}</small></td>
								<td>{formatNumber(page.views)}</td>
								<td>{formatNumber(page.visitors)}</td>
								<td><span class="share-value">{sharePercent(page.views)}%</span><span class="share-track"><span style={`width: ${sharePercent(page.views)}%`}></span></span></td>
								<td>{formatDateTime(page.lastViewedAt)}</td>
							</tr>
						{:else}
							<tr><td colspan="5">No matching pages found.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<div class="breakdown-grid">
			<section class="analytics-panel" aria-labelledby="sections-title">
				<h3 id="sections-title">Content type</h3>
				<div class="breakdown-list">
					{#each data.report.sections as item}
						<div class="breakdown-item">
							<p><span>{item.name}</span><strong>{formatNumber(item.views)} <small>{sharePercent(item.views)}%</small></strong></p>
							<span class="breakdown-track"><span style={`width: ${sharePercent(item.views)}%`}></span></span>
						</div>
					{:else}<p class="empty-copy">No content data yet.</p>{/each}
				</div>
			</section>

			<section class="analytics-panel" aria-labelledby="devices-title">
				<h3 id="devices-title">Devices</h3>
				<div class="breakdown-list">
					{#each data.report.devices as item}
						<div class="breakdown-item">
							<p><span>{deviceLabel(item.name)}</span><strong>{formatNumber(item.views)} <small>{sharePercent(item.views)}%</small></strong></p>
							<span class="breakdown-track"><span style={`width: ${sharePercent(item.views)}%`}></span></span>
						</div>
					{:else}<p class="empty-copy">No device data yet.</p>{/each}
				</div>
			</section>

			<section class="analytics-panel" aria-labelledby="referrers-title">
				<h3 id="referrers-title">Traffic sources</h3>
				<div class="breakdown-list">
					{#each data.report.referrers as item}
						<div class="breakdown-item">
							<p><span title={sourceLabel(item.name)}>{sourceLabel(item.name)}</span><strong>{formatNumber(item.views)} <small>{sharePercent(item.views)}%</small></strong></p>
							<span class="breakdown-track"><span style={`width: ${sharePercent(item.views)}%`}></span></span>
						</div>
					{:else}<p class="empty-copy">No traffic-source data yet.</p>{/each}
				</div>
			</section>
		</div>

		<section class="analytics-panel" aria-labelledby="view-history-title">
			<div class="panel-heading table-heading">
				<div>
					<h3 id="view-history-title">View history</h3>
					<span>{filteredEvents().length} / {data.report.events.length} recent views in this filter.</span>
				</div>
				<div class="table-tools">
					<label class="search-control">
						<Icon icon="material-symbols:search-rounded" />
						<input aria-label="Search history" placeholder="Search page or source" bind:value={eventQuery} />
					</label>
					<select aria-label="Filter by device" bind:value={eventDevice}>
						<option value="">All devices</option>
						<option value="desktop">Desktop</option>
						<option value="mobile">Mobile</option>
						<option value="tablet">Tablet</option>
						<option value="unknown">Unknown</option>
					</select>
					<button class="export-button" type="button" onclick={exportEvents} disabled={!filteredEvents().length} title="Export CSV">
						<Icon icon="material-symbols:download-rounded" /> CSV
					</button>
				</div>
			</div>
			<div class="table-scroll history-table">
				<table>
					<thead><tr><th>Time</th><th>Page</th><th>Device</th><th>Source</th></tr></thead>
					<tbody>
						{#each filteredEvents() as event}
							<tr>
								<td>{formatDateTime(event.viewedAt)}</td>
								<td><a href={event.path} target="_blank" rel="noopener">{event.title || event.path}</a><small>{event.path}</small></td>
								<td>{deviceLabel(event.device)}</td>
								<td>{sourceLabel(event.referrer || "direct")}</td>
							</tr>
						{:else}
							<tr><td colspan="4">No matching views found.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		{#if data.truncated}
			<div class="analytics-message warning">This period contains more than 20,000 views. The report uses the most recent available data.</div>
		{/if}
	{/if}
</section>

<style>
	.analytics-dashboard {
		display: grid;
		gap: 0.85rem;
		padding-top: 0.85rem;
		border-top: 1px solid var(--line-divider);
	}

	.analytics-heading,
	.panel-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	h2,
	h3,
	p {
		margin: 0;
	}

	h2 {
		font-size: 1.15rem;
	}

	h3 {
		font-size: 0.95rem;
	}

	.analytics-heading p,
	.panel-heading span,
	.empty-copy {
		margin-top: 0.2rem;
		color: var(--meta-color);
		font-size: 0.76rem;
	}

	.icon-button {
		width: 2.5rem;
		padding: 0;
	}

	.spin {
		animation: spin 700ms linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.analytics-filters {
		display: grid;
		grid-template-columns: minmax(9rem, 0.7fr) minmax(14rem, 1.3fr) auto;
		align-items: end;
		gap: 0.6rem;
		padding: 0.75rem;
		border: 1px solid var(--card-border);
		border-radius: 7px;
		background: color-mix(in oklch, var(--card-bg), transparent 10%);
	}

	.analytics-filters:has(input[type="date"]) {
		grid-template-columns: repeat(3, minmax(9rem, 0.7fr)) minmax(14rem, 1.3fr) auto;
	}

	.analytics-filters label {
		display: grid;
		gap: 0.3rem;
		min-width: 0;
	}

	.analytics-filters label > span {
		color: var(--meta-color);
		font-size: 0.72rem;
		font-weight: 750;
	}

	.apply-button {
		border-color: transparent;
		background: var(--primary);
		color: white;
	}

	.comparison-note {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--meta-color);
		font-size: 0.72rem;
	}

	.metric-grid {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 0.65rem;
	}

	.metric-grid article,
	.analytics-panel {
		border: 1px solid var(--card-border);
		border-radius: 7px;
		background: color-mix(in oklch, var(--card-bg), transparent 7%);
	}

	.metric-grid article {
		display: grid;
		gap: 0.35rem;
		padding: 0.8rem;
	}

	.metric-grid > article > span {
		color: var(--meta-color);
		font-size: 0.72rem;
	}

	.metric-grid strong {
		font-size: 1.4rem;
		line-height: 1;
	}

	.metric-grid small {
		font-size: 0.64rem;
		font-weight: 750;
	}

	.metric-grid small span {
		color: var(--meta-color);
		font-weight: 500;
	}

	.positive { color: #16a34a; }
	.negative { color: #dc2626; }
	.neutral { color: var(--meta-color); }

	.analytics-panel {
		min-width: 0;
		padding: 0.8rem;
	}

	.segmented-control {
		display: inline-flex;
		padding: 0.18rem;
		border: 1px solid var(--card-border);
		border-radius: 6px;
		background: var(--btn-regular-bg);
	}

	.segmented-control button {
		min-height: 2rem;
		padding: 0.35rem 0.65rem;
		border: 0;
		background: transparent;
		font-size: 0.7rem;
	}

	.segmented-control button.active {
		background: var(--primary);
		color: white;
	}

	.chart-scroll,
	.table-scroll {
		overflow: auto;
	}

	.bar-chart {
		display: grid;
		grid-template-columns: repeat(var(--chart-columns), minmax(2.25rem, 1fr));
		gap: 0.35rem;
		min-width: max(100%, calc(var(--chart-columns) * 2.65rem));
		height: 15rem;
		padding-top: 1rem;
	}

	.bar-column {
		display: grid;
		grid-template-rows: 1rem minmax(0, 1fr) 1.3rem;
		gap: 0.25rem;
		min-width: 0;
		text-align: center;
	}

	.bar-value,
	.bar-column small {
		color: var(--meta-color);
		font-size: 0.62rem;
	}

	.bar-track {
		position: relative;
		border-bottom: 1px solid var(--line-divider);
		background: repeating-linear-gradient(to top, transparent 0 24%, color-mix(in oklch, var(--line-divider), transparent 35%) 25%);
	}

	.bar-track span {
		position: absolute;
		right: 15%;
		bottom: 0;
		left: 15%;
		min-height: 2px;
		border-radius: 4px 4px 1px 1px;
		background: var(--primary);
		transition: height 180ms ease;
	}

	.table-heading {
		align-items: flex-end;
	}

	.table-tools {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.search-control {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 13rem;
		padding: 0 0.55rem;
		border: 1px solid var(--card-border);
		border-radius: 5px;
		background: var(--btn-regular-bg);
	}

	.search-control input {
		min-width: 0;
		border: 0;
		background: transparent;
	}

	.search-control input:focus {
		outline: 0;
	}

	.export-button {
		white-space: nowrap;
	}

	table {
		width: 100%;
		margin-top: 0.55rem;
		border-collapse: collapse;
		font-size: 0.75rem;
	}

	th,
	td {
		padding: 0.55rem 0.5rem;
		border-bottom: 1px solid var(--line-divider);
		text-align: left;
		vertical-align: top;
		white-space: nowrap;
	}

	th {
		color: var(--meta-color);
		font-size: 0.68rem;
	}

	td:first-child,
	td small {
		max-width: 24rem;
	}

	td small {
		display: block;
		overflow: hidden;
		margin-top: 0.15rem;
		color: var(--meta-color);
		text-overflow: ellipsis;
	}

	td a {
		color: var(--content-color);
		font-weight: 700;
	}

	.share-value {
		display: inline-block;
		min-width: 2.2rem;
	}

	.share-track,
	.breakdown-track {
		display: block;
		overflow: hidden;
		height: 0.25rem;
		border-radius: 99px;
		background: var(--btn-regular-bg);
	}

	.share-track {
		width: 4rem;
		margin-top: 0.25rem;
	}

	.share-track span,
	.breakdown-track span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--primary);
	}

	.breakdown-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.85rem;
	}

	.breakdown-list {
		display: grid;
		gap: 0.65rem;
		margin-top: 0.75rem;
	}

	.breakdown-item p {
		display: flex;
		justify-content: space-between;
		gap: 0.8rem;
		margin-bottom: 0.3rem;
		font-size: 0.74rem;
	}

	.breakdown-item p > span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.breakdown-item strong small {
		color: var(--meta-color);
		font-weight: 500;
	}

	.history-table {
		max-height: 32rem;
	}

	.history-table thead {
		position: sticky;
		top: 0;
		z-index: 1;
		background: var(--card-bg);
	}

	.analytics-message {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: 6rem;
		padding: 0.75rem;
		border-radius: 7px;
		background: var(--btn-regular-bg);
		color: var(--meta-color);
	}

	.analytics-message.error {
		min-height: auto;
		background: rgb(220 38 38 / 0.1);
		color: #dc2626;
	}

	.analytics-message.warning {
		min-height: auto;
		background: rgb(217 119 6 / 0.1);
		color: #b45309;
	}

	@media (max-width: 1050px) {
		.metric-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.breakdown-grid {
			grid-template-columns: 1fr 1fr;
		}

		.breakdown-grid > :last-child {
			grid-column: span 2;
		}

		.table-heading {
			align-items: flex-start;
			flex-direction: column;
		}
	}

	@media (max-width: 900px) {
		.analytics-filters,
		.analytics-filters:has(input[type="date"]) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.path-filter {
			grid-column: span 2;
		}
	}

	@media (max-width: 640px) {
		.analytics-heading,
		.panel-heading {
			align-items: flex-start;
		}

		.metric-grid,
		.analytics-filters,
		.analytics-filters:has(input[type="date"]),
		.breakdown-grid {
			grid-template-columns: 1fr 1fr;
		}

		.path-filter,
		.apply-button,
		.breakdown-grid > :last-child {
			grid-column: span 2;
		}

		.metric-grid article {
			padding: 0.7rem;
		}

		.metric-grid strong {
			font-size: 1.2rem;
		}

		.analytics-panel {
			padding: 0.65rem;
		}

		.panel-heading {
			flex-direction: column;
		}

		.segmented-control,
		.table-tools,
		.search-control {
			width: 100%;
		}

		.table-tools {
			align-items: stretch;
			flex-direction: column;
		}

		.segmented-control button {
			flex: 1;
		}
	}
</style>
