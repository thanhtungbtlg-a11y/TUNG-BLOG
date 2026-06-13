<script lang="ts">
import { onMount } from "svelte";

let progress = 0;
let visible = false;

function updateProgress() {
	const isPost = window.location.pathname.includes("/posts/");
	const target = document.getElementById("post-container");
	visible = isPost && !!target;

	if (!visible || !target) {
		progress = 0;
		return;
	}

	const rect = target.getBoundingClientRect();
	const start = window.scrollY + rect.top;
	const total = Math.max(target.scrollHeight - window.innerHeight * 0.72, 1);
	const current = window.scrollY - start;
	progress = Math.min(Math.max(current / total, 0), 1);
}

onMount(() => {
	updateProgress();

	const onPageView = () => requestAnimationFrame(updateProgress);

	window.addEventListener("scroll", updateProgress, { passive: true });
	window.addEventListener("resize", updateProgress);
	window.addEventListener("swup:page:view", onPageView);
	document.addEventListener("swup:content:replace", onPageView);

	return () => {
		window.removeEventListener("scroll", updateProgress);
		window.removeEventListener("resize", updateProgress);
		window.removeEventListener("swup:page:view", onPageView);
		document.removeEventListener("swup:content:replace", onPageView);
	};
});
</script>

<div class:visible class="reading-progress" data-reading-progress aria-hidden="true">
	<div style={`transform: scaleX(${progress})`}></div>
</div>

<style>
	.reading-progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10001;
		height: 3px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 180ms ease;
	}

	.reading-progress.visible {
		opacity: 1;
	}

	.reading-progress div {
		width: 100%;
		height: 100%;
		transform-origin: left center;
		background: linear-gradient(90deg, var(--primary), var(--music-accent));
		box-shadow: 0 0 18px color-mix(in oklch, var(--primary), transparent 48%);
		transition: transform 80ms linear;
	}
</style>
