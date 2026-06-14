<script lang="ts">
import { createClient } from "@supabase/supabase-js";
import { onMount } from "svelte";

type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";
type ReactionState = {
	active: ReactionId | "";
	counts: Record<ReactionId, number>;
};

type ReactionCountsRow = {
	like_count?: number;
	love_count?: number;
	haha_count?: number;
	wow_count?: number;
	sad_count?: number;
	angry_count?: number;
};

const reactionIds: ReactionId[] = [
	"like",
	"love",
	"haha",
	"wow",
	"sad",
	"angry",
];
const reactions: Array<{
	id: ReactionId;
	label: string;
	emoji: string;
}> = [
	{
		id: "like",
		label: "Like",
		emoji: "👍",
	},
	{
		id: "love",
		label: "Tym",
		emoji: "❤️",
	},
	{
		id: "haha",
		label: "Haha",
		emoji: "😂",
	},
	{
		id: "wow",
		label: "Woa",
		emoji: "😮",
	},
	{
		id: "sad",
		label: "Buồn",
		emoji: "😢",
	},
	{
		id: "angry",
		label: "Phẫn nộ",
		emoji: "😡",
	},
];

let { slug } = $props<{ slug: string }>();

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env.PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
	env.PUBLIC_SUPABASE_ANON_KEY ??
	env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
	env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
	env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase =
	supabaseUrl && supabaseAnonKey
		? createClient(supabaseUrl, supabaseAnonKey)
		: null;

let state = $state<ReactionState>({
	active: "",
	counts: createEmptyCounts(),
});
let saving = $state(false);
let error = $state("");

const storageKey = `post-reactions:${slug}`;

onMount(() => {
	const saved = localStorage.getItem(storageKey);
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			if (isReactionId(parsed?.active) || parsed?.active === "") {
				state.active = parsed.active;
			}

			if (!supabase && parsed?.counts) {
				state.counts = {
					...state.counts,
					...pickValidCounts(parsed.counts),
				};
			}
		} catch {}
	}

	if (supabase) void loadReactionCounts();
});

function save() {
	localStorage.setItem(
		storageKey,
		JSON.stringify({
			active: state.active,
			counts: supabase ? undefined : state.counts,
		}),
	);
}

async function loadReactionCounts() {
	if (!supabase) return;

	const { data, error: loadError } = await supabase
		.from("post_reaction_counts")
		.select(
			"like_count, love_count, haha_count, wow_count, sad_count, angry_count",
		)
		.eq("slug", slug)
		.maybeSingle();

	if (loadError) {
		error = "Chưa tải được cảm xúc.";
		return;
	}

	if (data) state.counts = rowToCounts(data);
}

async function toggleReaction(id: ReactionId) {
	if (saving) return;

	const previous = state.active;
	const next = previous === id ? "" : id;
	const nextState = getNextState(previous, next, id);
	const previousState = state;

	state = nextState;
	save();
	error = "";

	if (!supabase) return;

	saving = true;
	const { data, error: saveError } = await supabase.rpc(
		"record_post_reaction",
		{
			p_slug: slug,
			p_previous_reaction: previous,
			p_next_reaction: next,
		},
	);
	saving = false;

	if (saveError) {
		state = previousState;
		save();
		error = "Chưa lưu được cảm xúc. Bạn chạy lại SQL Supabase chưa?";
		return;
	}

	if (data) state.counts = rowToCounts(data);
}

function getNextState(
	previous: ReactionId | "",
	next: ReactionId | "",
	id: ReactionId,
) {
	const nextState = {
		active: next,
		counts: { ...state.counts },
	};

	if (previous === id) {
		nextState.counts[id] = Math.max(nextState.counts[id] - 1, 0);
		return nextState;
	}

	if (previous) {
		nextState.counts[previous] = Math.max(nextState.counts[previous] - 1, 0);
	}

	nextState.counts[id] += 1;
	return nextState;
}

function rowToCounts(row: ReactionCountsRow) {
	return {
		like: row.like_count ?? 0,
		love: row.love_count ?? 0,
		haha: row.haha_count ?? 0,
		wow: row.wow_count ?? 0,
		sad: row.sad_count ?? 0,
		angry: row.angry_count ?? 0,
	};
}

function pickValidCounts(value: unknown) {
	const counts = createEmptyCounts();
	if (!value || typeof value !== "object") return counts;

	for (const id of reactionIds) {
		const count = (value as Partial<Record<ReactionId, unknown>>)[id];
		if (typeof count === "number" && Number.isFinite(count)) {
			counts[id] = Math.max(Math.floor(count), 0);
		}
	}

	return counts;
}

function createEmptyCounts(): Record<ReactionId, number> {
	return {
		like: 0,
		love: 0,
		haha: 0,
		wow: 0,
		sad: 0,
		angry: 0,
	};
}

function isReactionId(value: unknown): value is ReactionId {
	return reactionIds.includes(value as ReactionId);
}
</script>

<div class="reaction-panel card-base onload-animation">
	<div class="reaction-copy">
		<div class="reaction-title">Phản ứng của bạn</div>
		{#if error}
			<div class="reaction-error" role="alert">{error}</div>
		{/if}
	</div>
	<div class="reaction-actions">
		{#each reactions as reaction}
			<button
				data-reaction-button
				class:active={state.active === reaction.id}
				aria-label={reaction.label}
				aria-pressed={state.active === reaction.id}
				disabled={saving}
				title={reaction.label}
				onclick={() => toggleReaction(reaction.id)}
			>
				<span class="reaction-emoji" aria-hidden="true">{reaction.emoji}</span>
				<strong>{state.counts[reaction.id]}</strong>
			</button>
		{/each}
	</div>
</div>

<style>
	.reaction-panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.reaction-title {
		font-weight: 800;
		color: rgb(0 0 0 / 0.84);
	}

	.reaction-error {
		margin-top: 0.25rem;
		color: #d04444;
		font-size: 0.78rem;
		font-weight: 700;
	}

	:global(.dark) .reaction-title {
		color: rgb(255 255 255 / 0.9);
	}

	.reaction-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		justify-content: flex-end;
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: 0.38rem;
		min-height: 2.5rem;
		border: 1px solid var(--card-border);
		border-radius: 999px;
		background: var(--btn-regular-bg);
		color: var(--btn-content);
		padding: 0 0.5rem 0 0.42rem;
		font: inherit;
		font-weight: 750;
		cursor: pointer;
		transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
	}

	button:hover,
	button:focus-visible,
	button.active {
		border-color: color-mix(in oklch, var(--primary), transparent 58%);
		background: var(--btn-regular-bg-hover);
		transform: translateY(-1px);
		outline: none;
	}

	button.active .reaction-emoji {
		transform: scale(1.15);
	}

	button:disabled {
		cursor: wait;
		opacity: 0.72;
	}

	button:active {
		transform: scale(0.97);
	}

	.reaction-emoji {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.55rem;
		height: 1.55rem;
		font-size: 1.18rem;
		line-height: 1;
		transition: transform 160ms ease;
	}

	button strong {
		min-width: 1.35rem;
		height: 1.35rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: var(--card-bg);
		font-size: 0.75rem;
	}

	@media (max-width: 768px) {
		.reaction-panel {
			grid-template-columns: 1fr;
		}

		.reaction-actions {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		button {
			justify-content: center;
			min-width: 0;
		}
	}

	@media (max-width: 420px) {
		.reaction-actions {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
