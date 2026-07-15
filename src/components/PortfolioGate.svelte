<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount, tick } from "svelte";

let open = $state(false);
let password = $state("");
let showPassword = $state(false);
let loading = $state(false);
let error = $state("");
let pendingHref = $state("/portfolio/");
let passwordInput: HTMLInputElement;

onMount(() => {
	const handleClick = (event: MouseEvent) => {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}
		const target = event.target;
		if (!(target instanceof Element)) return;
		const anchor = target.closest<HTMLAnchorElement>("a[href]");
		if (
			!anchor ||
			anchor.target === "_blank" ||
			anchor.hasAttribute("download")
		) {
			return;
		}
		const destination = new URL(anchor.href, window.location.href);
		if (
			destination.origin !== window.location.origin ||
			!isPortfolioPath(destination.pathname)
		) {
			return;
		}
		event.preventDefault();
		void requestAccess(destination.href);
	};

	const handleRequest = (event: Event) => {
		const href =
			event instanceof CustomEvent && typeof event.detail?.href === "string"
				? event.detail.href
				: "/portfolio/";
		void requestAccess(href);
	};

	document.addEventListener("click", handleClick, { capture: true });
	window.addEventListener("portfolio:request", handleRequest);

	const params = new URLSearchParams(window.location.search);
	if (params.get("portfolio") === "locked") {
		const nextPath = params.get("next") ?? "/portfolio/";
		openDialog(nextPath);
		params.delete("portfolio");
		params.delete("next");
		const query = params.toString();
		window.history.replaceState(
			window.history.state,
			"",
			`${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
		);
	}

	return () => {
		document.removeEventListener("click", handleClick, { capture: true });
		window.removeEventListener("portfolio:request", handleRequest);
		document.documentElement.classList.remove("portfolio-dialog-open");
	};
});

async function requestAccess(href: string) {
	pendingHref = safeDestination(href);
	if (sessionStorage.getItem("portfolio-unlocked") === "1") {
		window.location.assign(pendingHref);
		return;
	}
	try {
		const response = await fetch("/api/portfolio/access", {
			headers: { Accept: "application/json" },
			cache: "no-store",
		});
		const result = await response.json().catch(() => ({}));
		if (response.ok && result.unlocked === true) {
			sessionStorage.setItem("portfolio-unlocked", "1");
			window.location.assign(pendingHref);
			return;
		}
	} catch {
		// The dialog handles unavailable API errors after submission.
	}
	openDialog(pendingHref);
}

function openDialog(href: string) {
	pendingHref = safeDestination(href);
	password = "";
	error = "";
	showPassword = false;
	open = true;
	document.documentElement.classList.add("portfolio-dialog-open");
	void tick().then(() => passwordInput?.focus());
}

function closeDialog() {
	if (loading) return;
	open = false;
	password = "";
	error = "";
	document.documentElement.classList.remove("portfolio-dialog-open");
}

async function submitPassword() {
	if (!password || loading) return;
	loading = true;
	error = "";
	try {
		const response = await fetch("/api/portfolio/access", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({ password }),
		});
		const result = await response.json().catch(() => ({}));
		if (!response.ok || result.unlocked !== true) {
			throw new Error(result.error || "Chưa thể mở hồ sơ.");
		}
		sessionStorage.setItem("portfolio-unlocked", "1");
		window.location.assign(pendingHref);
	} catch (cause) {
		error = cause instanceof Error ? cause.message : "Chưa thể mở hồ sơ.";
		password = "";
		await tick();
		passwordInput?.focus();
	} finally {
		loading = false;
	}
}

function handleWindowKeydown(event: KeyboardEvent) {
	if (event.key === "Escape" && open) closeDialog();
}

function safeDestination(value: string) {
	try {
		const url = new URL(value, window.location.origin);
		return url.origin === window.location.origin &&
			isPortfolioPath(url.pathname)
			? `${url.pathname}${url.search}${url.hash}`
			: "/portfolio/";
	} catch {
		return "/portfolio/";
	}
}

function isPortfolioPath(pathname: string) {
	return pathname === "/portfolio" || pathname.startsWith("/portfolio/");
}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open}
	<div class="portfolio-dialog-layer">
		<button
			class="portfolio-dialog-backdrop"
			type="button"
			aria-label="Đóng"
			onclick={closeDialog}
		></button>
		<section
			class="portfolio-dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby="portfolio-dialog-title"
			aria-describedby="portfolio-dialog-description"
		>
			<header>
				<span class="lock-icon"><Icon icon="material-symbols:lock-outline-rounded" /></span>
				<div>
					<h2 id="portfolio-dialog-title">Hồ sơ được bảo vệ</h2>
					<p id="portfolio-dialog-description">Nhập mật khẩu để tiếp tục.</p>
				</div>
				<button class="close-button" type="button" onclick={closeDialog} aria-label="Đóng" title="Đóng">
					<Icon icon="material-symbols:close-rounded" />
				</button>
			</header>

			<form onsubmit={(event) => { event.preventDefault(); void submitPassword(); }}>
				<label for="portfolio-password">Mật khẩu</label>
				<div class="password-control">
					<input
						bind:this={passwordInput}
						bind:value={password}
						id="portfolio-password"
						type={showPassword ? "text" : "password"}
						autocomplete="current-password"
						maxlength="128"
						disabled={loading}
					/>
					<button
						type="button"
						onclick={() => { showPassword = !showPassword; }}
						aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
						title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
					>
						<Icon icon={showPassword ? "material-symbols:visibility-off-outline-rounded" : "material-symbols:visibility-outline-rounded"} />
					</button>
				</div>
				{#if error}<p class="error-message" role="alert">{error}</p>{/if}
				<button class="unlock-button" type="submit" disabled={!password || loading}>
					<Icon icon={loading ? "material-symbols:progress-activity" : "material-symbols:lock-open-outline-rounded"} />
					{loading ? "Đang kiểm tra..." : "Mở hồ sơ"}
				</button>
			</form>
		</section>
	</div>
{/if}

<style>
	:global(html.portfolio-dialog-open) {
		overflow: hidden;
	}

	.portfolio-dialog-layer {
		position: fixed;
		inset: 0;
		z-index: 10000;
		display: grid;
		place-items: center;
		padding: 1rem;
	}

	.portfolio-dialog-backdrop {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
		border-radius: 0;
		background: rgb(2 10 10 / 0.7);
		backdrop-filter: blur(8px);
	}

	.portfolio-dialog {
		position: relative;
		width: min(100%, 27rem);
		border: 1px solid var(--card-border);
		border-radius: 8px;
		background: var(--card-bg);
		box-shadow: 0 24px 70px rgb(0 0 0 / 0.35);
		animation: dialog-in 180ms ease-out;
	}

	.portfolio-dialog header {
		display: grid;
		grid-template-columns: 2.5rem minmax(0, 1fr) 2.25rem;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border-bottom: 1px solid var(--line-divider);
	}

	.lock-icon {
		display: grid;
		width: 2.5rem;
		height: 2.5rem;
		place-items: center;
		border-radius: 7px;
		background: var(--btn-regular-bg);
		color: var(--primary);
		font-size: 1.3rem;
	}

	.portfolio-dialog h2,
	.portfolio-dialog p {
		margin: 0;
	}

	.portfolio-dialog h2 {
		font-size: 1rem;
	}

	.portfolio-dialog header p {
		margin-top: 0.15rem;
		color: var(--meta-color);
		font-size: 0.78rem;
	}

	.close-button {
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
	}

	.portfolio-dialog form {
		display: grid;
		gap: 0.65rem;
		padding: 1rem;
	}

	.portfolio-dialog label {
		font-size: 0.78rem;
		font-weight: 750;
	}

	.password-control {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 2.5rem;
		border: 1px solid var(--card-border);
		border-radius: 6px;
		background: var(--btn-regular-bg);
	}

	.password-control:focus-within {
		border-color: var(--primary);
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary), transparent 82%);
	}

	.password-control input {
		min-width: 0;
		border: 0;
		background: transparent;
	}

	.password-control input:focus {
		outline: 0;
	}

	.password-control button {
		width: 2.5rem;
		padding: 0;
		border: 0;
		background: transparent;
	}

	.error-message {
		color: #dc2626;
		font-size: 0.76rem;
	}

	.unlock-button {
		justify-self: end;
		border-color: transparent;
		background: var(--primary);
		color: white;
	}

	@keyframes dialog-in {
		from {
			opacity: 0;
			transform: translateY(0.5rem) scale(0.98);
		}
	}

	@media (max-width: 480px) {
		.portfolio-dialog-layer {
			align-items: end;
			padding: 0.75rem;
		}

		.portfolio-dialog {
			width: 100%;
		}

		.unlock-button {
			width: 100%;
		}
	}
</style>
