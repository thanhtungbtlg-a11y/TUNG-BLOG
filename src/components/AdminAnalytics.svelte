<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import type { AnalyticsReport } from "../lib/analytics";

type Preset = "24h" | "7d" | "30d" | "90d" | "custom";
type AnalyticsResponse = {
	range: { from: string; to: string; path: string };
	report: AnalyticsReport;
	truncated: boolean;
};

let { accessToken }: { accessToken: string } = $props();
let preset = $state<Preset>("7d");
let selectedPath = $state("");
let customFrom = $state(toDateInput(new Date(Date.now() - 7 * 86_400_000)));
let customTo = $state(toDateInput(new Date()));
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
					"Chưa tải được dữ liệu thống kê.",
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
				: "Chưa tải được dữ liệu thống kê.";
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
			throw new Error("Khoảng ngày tùy chỉnh chưa hợp lệ.");
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
	return new Intl.NumberFormat("vi-VN").format(value);
}

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("vi-VN", {
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

function pageLabel(path: string, title: string) {
	return title ? `${title} · ${path}` : path;
}

function deviceLabel(value: string) {
	return (
		{
			desktop: "Máy tính",
			mobile: "Điện thoại",
			tablet: "Máy tính bảng",
			unknown: "Không rõ",
		}[value] ?? value
	);
}

function maxSeriesViews() {
	return Math.max(1, ...(data?.report.series.map((item) => item.views) ?? [1]));
}
</script>

<section class="analytics-dashboard" aria-labelledby="analytics-title">
	<header class="analytics-heading">
		<div>
			<h2 id="analytics-title">Thống kê lượt xem</h2>
			<p>Dữ liệu ẩn danh của blog và Second Brain, theo giờ Việt Nam.</p>
		</div>
		<button class="refresh-button" type="button" onclick={loadAnalytics} disabled={loading} title="Tải lại" aria-label="Tải lại thống kê">
			<Icon icon="material-symbols:refresh-rounded" />
		</button>
	</header>

	<form class="analytics-filters" onsubmit={(event) => { event.preventDefault(); void loadAnalytics(); }}>
		<label>
			<span>Thời gian</span>
			<select bind:value={preset}>
				<option value="24h">24 giờ qua</option>
				<option value="7d">7 ngày qua</option>
				<option value="30d">30 ngày qua</option>
				<option value="90d">90 ngày qua</option>
				<option value="custom">Tùy chọn</option>
			</select>
		</label>
		{#if preset === "custom"}
			<label><span>Từ ngày</span><input type="date" bind:value={customFrom} /></label>
			<label><span>Đến ngày</span><input type="date" bind:value={customTo} /></label>
		{/if}
		<label class="path-filter">
			<span>Trang được xem</span>
			<select bind:value={selectedPath}>
				<option value="">Tất cả trang</option>
				{#each knownPages as page}
					<option value={page.path}>{pageLabel(page.path, page.title)}</option>
				{/each}
			</select>
		</label>
		<button class="apply-button" type="submit" disabled={loading}>
			<Icon icon="material-symbols:filter-alt-outline-rounded" /> Áp dụng
		</button>
	</form>

	{#if error}
		<div class="analytics-message error" role="alert">{error}</div>
	{:else if loading && !data}
		<div class="analytics-message"><Icon icon="material-symbols:progress-activity" /> Đang tải thống kê...</div>
	{:else if data}
		<div class="metric-grid">
			<article><span>Lượt xem</span><strong>{formatNumber(data.report.totals.views)}</strong></article>
			<article><span>Người xem</span><strong>{formatNumber(data.report.totals.visitors)}</strong></article>
			<article><span>Phiên truy cập</span><strong>{formatNumber(data.report.totals.sessions)}</strong></article>
			<article><span>Trang đã xem</span><strong>{formatNumber(data.report.totals.pages)}</strong></article>
			<article><span>Tỷ lệ thoát</span><strong>{data.report.totals.bounceRate}%</strong></article>
		</div>

		<section class="analytics-panel chart-panel" aria-labelledby="views-chart-title">
			<div class="panel-heading">
				<h3 id="views-chart-title">Lượt xem theo thời gian</h3>
				{#if loading}<span>Đang cập nhật...</span>{/if}
			</div>
			{#if data.report.series.length}
				<div class="chart-scroll">
					<div class="bar-chart" style={`--chart-columns: ${data.report.series.length}`}>
						{#each data.report.series as point}
							<div class="bar-column" title={`${point.views} lượt xem · ${point.visitors} người xem`}>
								<span class="bar-value">{point.views}</span>
								<div class="bar-track"><span style={`height: ${(point.views / maxSeriesViews()) * 100}%`}></span></div>
								<small>{formatBucket(point.bucket)}</small>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<p class="empty-copy">Chưa có lượt xem trong khoảng thời gian này.</p>
			{/if}
		</section>

		<div class="analytics-columns">
			<section class="analytics-panel" aria-labelledby="popular-pages-title">
				<h3 id="popular-pages-title">Trang được xem</h3>
				<div class="table-scroll">
					<table>
						<thead><tr><th>Trang</th><th>Lượt xem</th><th>Người xem</th><th>Lần cuối</th></tr></thead>
						<tbody>
							{#each data.report.pages as page}
								<tr>
									<td><a href={page.path} target="_blank" rel="noopener">{page.title || page.path}</a><small>{page.path}</small></td>
									<td>{formatNumber(page.views)}</td>
									<td>{formatNumber(page.visitors)}</td>
									<td>{formatDateTime(page.lastViewedAt)}</td>
								</tr>
							{:else}
								<tr><td colspan="4">Chưa có dữ liệu.</td></tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>

			<section class="analytics-panel" aria-labelledby="devices-title">
				<h3 id="devices-title">Thiết bị và nguồn truy cập</h3>
				<div class="breakdown-list">
					{#each data.report.devices as item}
						<div><span>{deviceLabel(item.name)}</span><strong>{formatNumber(item.views)}</strong></div>
					{:else}<p>Chưa có dữ liệu thiết bị.</p>{/each}
				</div>
				<h4>Nguồn giới thiệu</h4>
				<div class="breakdown-list">
					{#each data.report.referrers as item}
						<div><span>{item.name}</span><strong>{formatNumber(item.views)}</strong></div>
					{:else}<p>Chủ yếu là truy cập trực tiếp.</p>{/each}
				</div>
			</section>
		</div>

		<section class="analytics-panel" aria-labelledby="view-history-title">
			<div class="panel-heading">
				<h3 id="view-history-title">Lịch sử lượt xem</h3>
				<span>Tối đa 250 lượt gần nhất trong bộ lọc</span>
			</div>
			<div class="table-scroll">
				<table>
					<thead><tr><th>Thời gian</th><th>Trang</th><th>Thiết bị</th><th>Nguồn</th></tr></thead>
					<tbody>
						{#each data.report.events as event}
							<tr>
								<td>{formatDateTime(event.viewedAt)}</td>
								<td><a href={event.path} target="_blank" rel="noopener">{event.title || event.path}</a><small>{event.path}</small></td>
								<td>{deviceLabel(event.device)}</td>
								<td>{event.referrer || "Trực tiếp"}</td>
							</tr>
						{:else}
							<tr><td colspan="4">Chưa có lượt xem.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		{#if data.truncated}
			<div class="analytics-message warning">Khoảng thời gian này có trên 20.000 lượt xem. Bảng đang hiển thị phần dữ liệu gần nhất.</div>
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
	h4,
	p {
		margin: 0;
	}

	h2 {
		font-size: 1.15rem;
	}

	h3 {
		font-size: 0.95rem;
	}

	h4 {
		margin-top: 1rem;
		font-size: 0.78rem;
	}

	.analytics-heading p,
	.panel-heading span,
	.empty-copy {
		margin-top: 0.2rem;
		color: var(--meta-color);
		font-size: 0.76rem;
	}

	.refresh-button {
		width: 2.5rem;
		padding: 0;
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

	.path-filter select {
		min-width: 0;
	}

	.apply-button {
		border-color: transparent;
		background: var(--primary);
		color: white;
	}

	.metric-grid {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
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

	.metric-grid span {
		color: var(--meta-color);
		font-size: 0.72rem;
	}

	.metric-grid strong {
		font-size: 1.45rem;
		line-height: 1;
	}

	.analytics-panel {
		min-width: 0;
		padding: 0.8rem;
	}

	.chart-scroll,
	.table-scroll {
		overflow: auto;
	}

	.bar-chart {
		display: grid;
		grid-template-columns: repeat(var(--chart-columns), minmax(2.25rem, 1fr));
		gap: 0.4rem;
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
		font-size: 0.64rem;
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
		min-height: 3px;
		border-radius: 4px 4px 1px 1px;
		background: var(--primary);
		transition: height 180ms ease;
	}

	.analytics-columns {
		display: grid;
		grid-template-columns: minmax(0, 1.65fr) minmax(15rem, 0.7fr);
		gap: 0.85rem;
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

	td:nth-child(2),
	td small {
		max-width: 22rem;
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

	.breakdown-list {
		display: grid;
		gap: 0.2rem;
		margin-top: 0.55rem;
	}

	.breakdown-list div {
		display: flex;
		justify-content: space-between;
		gap: 0.8rem;
		padding: 0.45rem 0;
		border-bottom: 1px solid var(--line-divider);
		font-size: 0.76rem;
	}

	.breakdown-list span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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

	@media (max-width: 900px) {
		.metric-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.analytics-columns {
			grid-template-columns: 1fr;
		}

		.analytics-filters,
		.analytics-filters:has(input[type="date"]) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.path-filter {
			grid-column: span 2;
		}
	}

	@media (max-width: 640px) {
		.analytics-heading {
			align-items: flex-start;
		}

		.metric-grid,
		.analytics-filters,
		.analytics-filters:has(input[type="date"]) {
			grid-template-columns: 1fr 1fr;
		}

		.metric-grid article:last-child,
		.path-filter,
		.apply-button {
			grid-column: span 2;
		}

		.analytics-panel {
			padding: 0.65rem;
		}
	}
</style>
