<script lang="ts">
import Icon from "@iconify/svelte";
import { onDestroy, onMount, tick } from "svelte";

type Track = {
	id: number;
	title: string;
	artist: string;
	src: string;
	cover: string;
};

let audio: HTMLAudioElement;

let tracks: Track[] = [];
let currentIndex = 0;
let isPlaying = false;
let expanded = false;
let shuffle = false;
let repeat: "off" | "one" | "all" = "all";
let volume = 0.55;
let currentTime = 0;
let duration = 0;

const STORAGE_KEY = "music-player-pro";
const DEFAULT_COVER = "/favicon/favicon-dark-192.png";
const DEFAULT_VOLUME = 0.55;
const AUTOPLAY_START_VOLUME = 0.04;
const FADE_IN_MS = 2200;

let fadeFrame = 0;
let autoplayFallbackCleanup: (() => void) | null = null;

$: currentTrack = tracks[currentIndex];
$: progressPercent =
	duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
$: volumePercent = Math.round(volume * 100);

onMount(async () => {
	try {
		const res = await fetch("/music/manifest.json");
		tracks = await res.json();
	} catch (err) {
		console.error("Cannot load music manifest:", err);
		tracks = [];
	}

	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved) {
		try {
			const state = JSON.parse(saved);
			currentIndex = state.currentIndex ?? 0;
			volume = clampVolume(state.volume ?? DEFAULT_VOLUME);
			shuffle = state.shuffle ?? false;
			repeat = state.repeat ?? "all";
		} catch {}
	}

	if (currentIndex >= tracks.length) currentIndex = 0;
	await tick();

	if (audio) {
		audio.volume = volume;
	}

	void attemptAutoplay();
	setTimeout(() => {
		if (!isPlaying) queueAutoplayAfterInteraction();
	}, 700);
});

onDestroy(() => {
	clearAutoplayFallback();
	cancelVolumeFade();
});

function handleMiniKeydown(event: KeyboardEvent) {
	if (event.key === "Enter" || event.key === " ") {
		event.preventDefault();
		toggleExpanded();
	}
}

function saveState() {
	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify({
			currentIndex,
			volume,
			shuffle,
			repeat,
		}),
	);
}

async function play(fadeIn = false) {
	if (!audio || !currentTrack) return;

	try {
		if (fadeIn) {
			const targetVolume = clampVolume(volume || DEFAULT_VOLUME);
			cancelVolumeFade();
			audio.volume = Math.min(AUTOPLAY_START_VOLUME, targetVolume);
		}

		await audio.play();
		isPlaying = true;

		if (fadeIn) {
			fadeToVolume(clampVolume(volume || DEFAULT_VOLUME));
		}

		return true;
	} catch (err) {
		if (fadeIn) {
			audio.volume = clampVolume(volume || DEFAULT_VOLUME);
		}
		if (err instanceof DOMException && err.name === "NotAllowedError")
			return false;
		console.error("Play error:", err);
		return false;
	}
}

function pause() {
	if (!audio) return;
	cancelVolumeFade();
	audio.pause();
	isPlaying = false;
}

async function togglePlay() {
	clearAutoplayFallback();
	if (isPlaying) {
		pause();
	} else {
		await play();
	}
}

async function attemptAutoplay() {
	const didPlay = await play(true);
	if (!didPlay) {
		queueAutoplayAfterInteraction();
	}
}

function queueAutoplayAfterInteraction() {
	if (autoplayFallbackCleanup) return;

	let cleanup = () => {};
	const resume = (event: Event) => {
		if (
			event.target instanceof Element &&
			event.target.closest(".music-player")
		) {
			return;
		}

		cleanup();
		void play(true);
	};

	cleanup = () => {
		document.removeEventListener("pointerdown", resume, true);
		document.removeEventListener("click", resume, true);
		document.removeEventListener("touchstart", resume, true);
		document.removeEventListener("keydown", resume, true);
		autoplayFallbackCleanup = null;
	};

	autoplayFallbackCleanup = cleanup;
	document.addEventListener("pointerdown", resume, true);
	document.addEventListener("click", resume, true);
	document.addEventListener("touchstart", resume, true);
	document.addEventListener("keydown", resume, true);
}

function clearAutoplayFallback() {
	autoplayFallbackCleanup?.();
}

async function changeTrack(index: number, autoPlay = true) {
	if (!tracks.length) return;

	currentIndex = (index + tracks.length) % tracks.length;
	currentTime = 0;
	saveState();

	setTimeout(async () => {
		if (audio) {
			audio.load();
			if (autoPlay) await play();
		}
	}, 0);
}

async function nextTrack() {
	if (!tracks.length) return;

	if (shuffle && tracks.length > 1) {
		let next = currentIndex;
		while (next === currentIndex) {
			next = Math.floor(Math.random() * tracks.length);
		}
		await changeTrack(next);
		return;
	}

	await changeTrack(currentIndex + 1);
}

async function prevTrack() {
	await changeTrack(currentIndex - 1);
}

async function onEnded() {
	if (repeat === "one") {
		audio.currentTime = 0;
		await play();
		return;
	}

	if (currentIndex < tracks.length - 1 || repeat === "all") {
		await nextTrack();
	} else {
		isPlaying = false;
	}
}

function onTimeUpdate() {
	if (!audio) return;
	currentTime = audio.currentTime;
	duration = audio.duration || 0;
}

function seek(event: Event) {
	const input = event.target as HTMLInputElement;
	const value = Number(input.value);
	if (!audio) return;
	audio.currentTime = value;
	currentTime = value;
}

function changeVolume(event: Event) {
	const input = event.target as HTMLInputElement;
	cancelVolumeFade();
	volume = clampVolume(Number(input.value));
	if (audio) audio.volume = volume;
	saveState();
}

function toggleExpanded() {
	expanded = !expanded;
}

function toggleShuffle() {
	shuffle = !shuffle;
	saveState();
}

function toggleRepeat() {
	if (repeat === "off") repeat = "all";
	else if (repeat === "all") repeat = "one";
	else repeat = "off";

	saveState();
}

function handlePlayClick(event: MouseEvent) {
	event.stopPropagation();
	void togglePlay();
}

function useFallbackCover(event: Event) {
	const img = event.currentTarget as HTMLImageElement;
	if (img.src.endsWith(DEFAULT_COVER)) return;
	img.src = DEFAULT_COVER;
}

function clampVolume(value: number) {
	return Math.min(
		Math.max(Number.isFinite(value) ? value : DEFAULT_VOLUME, 0),
		1,
	);
}

function cancelVolumeFade() {
	if (!fadeFrame) return;
	cancelAnimationFrame(fadeFrame);
	fadeFrame = 0;
}

function fadeToVolume(targetVolume: number) {
	if (!audio) return;

	cancelVolumeFade();

	const fromVolume = audio.volume;
	const startedAt = performance.now();

	const step = (time: number) => {
		if (!audio || !isPlaying) {
			fadeFrame = 0;
			return;
		}

		const progress = Math.min((time - startedAt) / FADE_IN_MS, 1);
		const eased = 1 - (1 - progress) ** 3;
		audio.volume = fromVolume + (targetVolume - fromVolume) * eased;

		if (progress < 1) {
			fadeFrame = requestAnimationFrame(step);
		} else {
			audio.volume = targetVolume;
			fadeFrame = 0;
		}
	};

	fadeFrame = requestAnimationFrame(step);
}

function formatTime(seconds: number) {
	if (!seconds || Number.isNaN(seconds)) return "0:00";

	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60)
		.toString()
		.padStart(2, "0");

	return `${m}:${s}`;
}
</script>

{#if currentTrack}
	<audio
		bind:this={audio}
		src={currentTrack.src}
		onplay={() => (isPlaying = true)}
		onpause={() => (isPlaying = false)}
		ontimeupdate={onTimeUpdate}
		onloadedmetadata={onTimeUpdate}
		onended={onEnded}
	></audio>

	<div class:expanded class:is-playing={isPlaying} class="music-player">
		<div
			class="mini"
			role="button"
			tabindex="0"
			aria-label={expanded ? "Collapse music player" : "Expand music player"}
			onclick={toggleExpanded}
			onkeydown={handleMiniKeydown}
		>
			<div class="cover-shell">
				<img src={currentTrack.cover} alt={currentTrack.title} class="cover-mini" onerror={useFallbackCover} />
				<div class="pulse"></div>
			</div>

			<div class="mini-info">
				<div class="eyebrow">Now playing</div>
				<div class="title" title={currentTrack.title}>{currentTrack.title}</div>
				<div class="artist">{currentTrack.artist}</div>
			</div>

			<div class="mini-visualizer" aria-hidden="true">
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</div>

			<button class="icon-btn" aria-label={isPlaying ? "Pause music" : "Play music"} onclick={handlePlayClick}>
				{#if isPlaying}
					<Icon icon="material-symbols:pause-rounded" />
				{:else}
					<Icon icon="material-symbols:play-arrow-rounded" />
				{/if}
			</button>
		</div>

		{#if expanded}
			<div class="panel">
				<div class="hero">
					<img src={currentTrack.cover} alt={currentTrack.title} class="cover" onerror={useFallbackCover} />
					<div class="hero-shade"></div>
				</div>

				<div class="song-title" title={currentTrack.title}>{currentTrack.title}</div>
				<div class="song-artist">{currentTrack.artist}</div>

				<div class="progress-row">
					<span>{formatTime(currentTime)}</span>
					<input
						type="range"
						aria-label="Seek track"
						min="0"
						max={duration || 0}
						value={currentTime}
						style={`--value: ${progressPercent}%`}
						oninput={seek}
					/>
					<span>{formatTime(duration)}</span>
				</div>

				<div class="controls">
					<button class:active={shuffle} aria-label="Toggle shuffle" onclick={toggleShuffle}>
						<Icon icon="material-symbols:shuffle-rounded" />
					</button>
					<button aria-label="Previous track" onclick={prevTrack}>
						<Icon icon="material-symbols:skip-previous-rounded" />
					</button>
					<button class="play-main" aria-label={isPlaying ? "Pause music" : "Play music"} onclick={togglePlay}>
						{#if isPlaying}
							<Icon icon="material-symbols:pause-rounded" />
						{:else}
							<Icon icon="material-symbols:play-arrow-rounded" />
						{/if}
					</button>
					<button aria-label="Next track" onclick={nextTrack}>
						<Icon icon="material-symbols:skip-next-rounded" />
					</button>
					<button class:active={repeat !== "off"} aria-label="Toggle repeat" onclick={toggleRepeat}>
						{#if repeat === "one"}
							<Icon icon="material-symbols:repeat-one-rounded" />
						{:else}
							<Icon icon="material-symbols:repeat-rounded" />
						{/if}
					</button>
				</div>

				<div class="volume">
					<Icon icon="material-symbols:volume-up-rounded" />
					<input
						type="range"
						aria-label="Volume"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						style={`--value: ${volumePercent}%`}
						oninput={changeVolume}
					/>
				</div>

				<div class="playlist-title">Playlist ({tracks.length})</div>

				<div class="playlist">
					{#each tracks as track, index}
						<button
							class="track"
							class:active={index === currentIndex}
							aria-label={`Play ${track.title}`}
							title={`${track.title} - ${track.artist}`}
							onclick={() => changeTrack(index)}
						>
							<img src={track.cover} alt={track.title} onerror={useFallbackCover} />
							<div>
								<div class="track-title" title={track.title}>{track.title}</div>
								<div class="track-artist">{track.artist}</div>
							</div>
							{#if index === currentIndex}
								<span class="playing" aria-hidden="true">
									{#if isPlaying}
										<span class="track-visualizer">
											<span></span>
											<span></span>
											<span></span>
										</span>
									{:else}
										<Icon icon="material-symbols:radio-button-unchecked" />
									{/if}
								</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.music-player {
		position: fixed;
		right: 14px;
		bottom: 14px;
		z-index: 9999;
		width: min(286px, calc(100vw - 24px));
		color: white;
		font-family: inherit;
	}

	.music-player.expanded {
		width: min(312px, calc(100vw - 24px));
	}

	.mini,
	.panel {
		background: var(--music-player-bg);
		backdrop-filter: blur(22px) saturate(1.18);
		-webkit-backdrop-filter: blur(22px) saturate(1.18);
		border: 1px solid var(--music-player-border);
		box-shadow: var(--music-shadow);
	}

	.mini {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 54px;
		padding: 7px 8px;
		border-radius: 16px;
		cursor: pointer;
		outline: none;
		transition: transform 220ms ease, border-color 220ms ease, background 220ms ease;
	}

	.mini:hover,
	.mini:focus-visible {
		transform: translateY(-2px);
		border-color: color-mix(in oklch, var(--music-accent), white 20%);
	}

	.cover-shell {
		position: relative;
		flex: 0 0 auto;
	}

	.cover-mini {
		position: relative;
		z-index: 2;
		width: 38px;
		height: 38px;
		object-fit: cover;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.08);
	}

	.pulse {
		position: absolute;
		inset: 4px;
		border-radius: 18px;
		background: var(--music-accent);
		filter: blur(18px);
		opacity: 0;
		transition: opacity 240ms ease;
	}

	.is-playing .pulse {
		opacity: 0.35;
	}

	.mini-info {
		flex: 1;
		min-width: 0;
	}

	.mini-visualizer,
	.track-visualizer {
		display: inline-flex;
		align-items: flex-end;
		justify-content: center;
		gap: 3px;
		color: var(--music-accent);
	}

	.mini-visualizer {
		width: 20px;
		height: 18px;
		opacity: 0.45;
	}

	.mini-visualizer span,
	.track-visualizer span {
		display: block;
		width: 3px;
		min-height: 4px;
		border-radius: 999px;
		background: currentColor;
		animation: equalizer 900ms ease-in-out infinite;
		animation-play-state: paused;
	}

	.track-visualizer {
		width: 22px;
		height: 18px;
	}

	.is-playing .mini-visualizer {
		opacity: 1;
	}

	.is-playing .mini-visualizer span,
	.is-playing .track-visualizer span {
		animation-play-state: running;
	}

	.mini-visualizer span:nth-child(2),
	.track-visualizer span:nth-child(2) {
		animation-delay: 120ms;
	}

	.mini-visualizer span:nth-child(3),
	.track-visualizer span:nth-child(3) {
		animation-delay: 240ms;
	}

	.mini-visualizer span:nth-child(4) {
		animation-delay: 360ms;
	}

	.eyebrow {
		color: var(--music-accent);
		font-size: 9px;
		font-weight: 700;
		line-height: 1.1;
		text-transform: uppercase;
		letter-spacing: 0;
	}

	.title,
	.artist,
	.song-artist,
	.track-artist {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.title {
		font-size: 12.5px;
		font-weight: 800;
		line-height: 1.25;
	}

	.artist {
		font-size: 10.5px;
		opacity: 0.65;
		line-height: 1.25;
	}

	button {
		font: inherit;
	}

	.icon-btn,
	.controls button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		cursor: pointer;
		transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
	}

	.icon-btn:hover,
	.controls button:hover,
	.icon-btn:focus-visible,
	.controls button:focus-visible {
		background: rgba(255, 255, 255, 0.18);
		border-color: rgba(255, 255, 255, 0.2);
		transform: translateY(-1px);
		outline: none;
	}

	.icon-btn:active,
	.controls button:active {
		transform: scale(0.94);
	}

	.icon-btn {
		width: 34px;
		height: 34px;
		font-size: 21px;
	}

	.panel {
		margin-top: 8px;
		border-radius: 20px;
		padding: 12px;
		max-height: min(62vh, 380px);
		overflow-y: auto;
		animation: panel-in 180ms ease-out;
	}

	.hero {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 1;
		overflow: hidden;
		border-radius: 16px;
		margin-bottom: 10px;
		background: rgba(255, 255, 255, 0.08);
	}

	.cover {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.01);
	}

	.hero-shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent 55%);
	}

	.song-title {
		font-size: 16px;
		font-weight: 850;
		line-height: 1.3;
		overflow-wrap: anywhere;
	}

	.song-artist {
		font-size: 12px;
		opacity: 0.66;
		margin-bottom: 10px;
	}

	.progress-row {
		display: grid;
		grid-template-columns: 40px 1fr 40px;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		opacity: 0.88;
	}

	input[type="range"] {
		--value: 0%;
		width: 100%;
		height: 6px;
		border-radius: 999px;
		background: linear-gradient(to right, var(--music-accent) 0%, var(--music-accent) var(--value), rgba(255, 255, 255, 0.16) var(--value), rgba(255, 255, 255, 0.16) 100%);
		outline: none;
		appearance: none;
	}

	input[type="range"]::-webkit-slider-thumb {
		width: 16px;
		height: 16px;
		border: 2px solid white;
		border-radius: 999px;
		background: var(--music-accent);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
		appearance: none;
	}

	input[type="range"]::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border: 2px solid white;
		border-radius: 999px;
		background: var(--music-accent);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 10px 0;
	}

	.controls button {
		width: 34px;
		height: 34px;
		font-size: 20px;
	}

	.controls .play-main {
		width: 44px;
		height: 44px;
		font-size: 26px;
		background: var(--music-accent);
		color: #06101f;
		border-color: transparent;
		box-shadow: 0 12px 28px color-mix(in oklch, var(--music-accent), transparent 55%);
	}

	.controls .active {
		background: color-mix(in oklch, var(--music-accent), transparent 68%);
		color: white;
	}

	.volume {
		display: grid;
		grid-template-columns: 24px 1fr;
		align-items: center;
		gap: 8px;
		margin-bottom: 10px;
		color: rgba(255, 255, 255, 0.72);
		font-size: 18px;
	}

	.playlist-title {
		font-size: 13px;
		font-weight: 800;
		margin-bottom: 8px;
		opacity: 0.92;
	}

	.playlist {
		max-height: 96px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding-right: 4px;
	}

	.track {
		display: grid;
		grid-template-columns: 34px 1fr 20px;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 6px;
		border: 1px solid transparent;
		border-radius: 14px;
		background: transparent;
		color: white;
		text-align: left;
		cursor: pointer;
		transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
	}

	.track:hover,
	.track:focus-visible,
	.track.active {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.09);
		outline: none;
	}

	.track:active {
		transform: scale(0.98);
	}

	.track img {
		width: 34px;
		height: 34px;
		border-radius: 10px;
		object-fit: cover;
		background: rgba(255, 255, 255, 0.08);
	}

	.track-title {
		font-size: 12px;
		font-weight: 700;
		line-height: 1.25;
		overflow-wrap: anywhere;
	}

	.track-artist {
		font-size: 10px;
		opacity: 0.6;
	}

	.playing {
		display: flex;
		color: var(--music-accent);
		font-size: 20px;
	}

	@keyframes panel-in {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes equalizer {
		0%,
		100% {
			height: 26%;
		}
		35% {
			height: 92%;
		}
		65% {
			height: 44%;
		}
	}

	@media (max-width: 768px) {
		.music-player {
			right: 10px;
			left: auto;
			bottom: 10px;
			width: min(286px, calc(100vw - 20px));
		}

		.music-player.expanded {
			right: 10px;
			left: 10px;
			width: auto;
		}

		.panel {
			max-height: 58vh;
			overflow-y: auto;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}

		.mini:hover,
		.mini:focus-visible,
		.icon-btn:hover,
		.controls button:hover,
		.track:active {
			transform: none;
		}

		.mini-visualizer span,
		.track-visualizer span {
			animation: none;
		}
	}
</style>
