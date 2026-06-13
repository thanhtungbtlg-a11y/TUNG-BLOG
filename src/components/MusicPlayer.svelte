<script lang="ts">
import { onMount } from "svelte";

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
let volume = 0.8;
let currentTime = 0;
let duration = 0;

const STORAGE_KEY = "music-player-pro";

$: currentTrack = tracks[currentIndex];

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
			volume = state.volume ?? 0.8;
			expanded = state.expanded ?? false;
			shuffle = state.shuffle ?? false;
			repeat = state.repeat ?? "all";
		} catch {}
	}

	if (audio) {
		audio.volume = volume;
	}
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
			expanded,
			shuffle,
			repeat,
		}),
	);
}

async function play() {
	if (!audio || !currentTrack) return;

	try {
		await audio.play();
		isPlaying = true;
	} catch (err) {
		console.error("Play error:", err);
	}
}

function pause() {
	if (!audio) return;
	audio.pause();
	isPlaying = false;
}

async function togglePlay() {
	if (isPlaying) {
		pause();
	} else {
		await play();
	}
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
	volume = Number(input.value);
	if (audio) audio.volume = volume;
	saveState();
}

function toggleExpanded() {
	expanded = !expanded;
	saveState();
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

	<div class:expanded class="music-player">
		<div
	class="mini"
	role="button"
	tabindex="0"
	aria-label={expanded ? "Thu gọn trình phát nhạc" : "Mở rộng trình phát nhạc"}
	onclick={toggleExpanded}
	onkeydown={handleMiniKeydown}
>
			<img src={currentTrack.cover} alt={currentTrack.title} class="cover-mini" />

			<div class="mini-info">
				<div class="title">{currentTrack.title}</div>
				<div class="artist">{currentTrack.artist}</div>
			</div>

			<button class="icon-btn" onclick={(e) => { e.stopPropagation(); togglePlay(); }}>
				{#if isPlaying}⏸{:else}▶{/if}
			</button>
		</div>

		{#if expanded}
			<div class="panel">
				<img src={currentTrack.cover} alt={currentTrack.title} class="cover" />

				<div class="song-title">{currentTrack.title}</div>
				<div class="song-artist">{currentTrack.artist}</div>

				<div class="progress-row">
					<span>{formatTime(currentTime)}</span>
					<input
						type="range"
						min="0"
						max={duration || 0}
						value={currentTime}
						oninput={seek}
					/>
					<span>{formatTime(duration)}</span>
				</div>

				<div class="controls">
					<button class:active={shuffle} onclick={toggleShuffle}>🔀</button>
					<button onclick={prevTrack}>⏮</button>
					<button class="play-main" onclick={togglePlay}>
						{#if isPlaying}⏸{:else}▶{/if}
					</button>
					<button onclick={nextTrack}>⏭</button>
					<button class:active={repeat !== "off"} onclick={toggleRepeat}>
						{#if repeat === "one"}🔂{:else}🔁{/if}
					</button>
				</div>

				<div class="volume">
					<span>🔊</span>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						oninput={changeVolume}
					/>
				</div>

				<div class="playlist-title">Playlist ({tracks.length})</div>

				<div class="playlist">
					{#each tracks as track, index}
						<button
							class="track"
							class:active={index === currentIndex}
							onclick={() => changeTrack(index)}
						>
							<img src={track.cover} alt={track.title} />
							<div>
								<div class="track-title">{track.title}</div>
								<div class="track-artist">{track.artist}</div>
							</div>
							{#if index === currentIndex}
								<span class="playing">{isPlaying ? "♪" : "•"}</span>
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
		right: 20px;
		bottom: 20px;
		z-index: 9999;
		width: 320px;
		color: white;
		font-family: inherit;
	}

	.mini,
	.panel {
		background: rgba(20, 20, 20, 0.88);
		backdrop-filter: blur(18px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
	}

	.mini {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		border-radius: 18px;
		cursor: pointer;
	}

	.cover-mini {
		width: 44px;
		height: 44px;
		object-fit: cover;
		border-radius: 12px;
	}

	.mini-info {
		flex: 1;
		min-width: 0;
	}

	.title,
	.artist,
	.song-title,
	.song-artist,
	.track-title,
	.track-artist {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.title {
		font-size: 14px;
		font-weight: 700;
	}

	.artist {
		font-size: 12px;
		opacity: 0.65;
	}

	.icon-btn,
	.controls button {
		border: none;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		cursor: pointer;
	}

	.icon-btn {
		width: 38px;
		height: 38px;
	}

	.panel {
		margin-top: 10px;
		border-radius: 24px;
		padding: 18px;
	}

	.cover {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		border-radius: 20px;
		margin-bottom: 14px;
	}

	.song-title {
		font-size: 18px;
		font-weight: 800;
	}

	.song-artist {
		font-size: 13px;
		opacity: 0.65;
		margin-bottom: 14px;
	}

	.progress-row {
		display: grid;
		grid-template-columns: 38px 1fr 38px;
		align-items: center;
		gap: 8px;
		font-size: 11px;
		opacity: 0.85;
	}

	input[type="range"] {
		width: 100%;
		accent-color: #6aa8ff;
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 14px 0;
	}

	.controls button {
		width: 38px;
		height: 38px;
		font-size: 15px;
	}

	.controls .play-main {
		width: 48px;
		height: 48px;
		font-size: 18px;
		background: #6aa8ff;
		color: #06101f;
	}

	.controls .active {
		background: rgba(106, 168, 255, 0.35);
	}

	.volume {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 14px;
	}

	.playlist-title {
		font-size: 13px;
		font-weight: 700;
		margin-bottom: 8px;
		opacity: 0.9;
	}

	.playlist {
		max-height: 220px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding-right: 4px;
	}

	.track {
		display: grid;
		grid-template-columns: 42px 1fr 20px;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px;
		border: none;
		border-radius: 12px;
		background: transparent;
		color: white;
		text-align: left;
		cursor: pointer;
	}

	.track:hover,
	.track.active {
		background: rgba(255, 255, 255, 0.1);
	}

	.track img {
		width: 42px;
		height: 42px;
		border-radius: 10px;
		object-fit: cover;
	}

	.track-title {
		font-size: 13px;
		font-weight: 600;
	}

	.track-artist {
		font-size: 11px;
		opacity: 0.6;
	}

	.playing {
		color: #6aa8ff;
		font-weight: 700;
	}

	@media (max-width: 768px) {
		.music-player {
			right: 12px;
			left: 12px;
			bottom: 12px;
			width: auto;
		}

		.panel {
			max-height: 78vh;
			overflow-y: auto;
		}
	}
</style>