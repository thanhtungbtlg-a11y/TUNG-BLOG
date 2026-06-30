<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import { supabaseConfigured, supabaseRest } from "../utils/supabase-rest";

type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export type CommentReactionCounts = {
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
const reactions: Array<{ id: ReactionId; label: string; emoji: string }> = [
	{ id: "like", label: "Thích", emoji: "👍" },
	{ id: "love", label: "Yêu thích", emoji: "❤️" },
	{ id: "haha", label: "Haha", emoji: "😂" },
	{ id: "wow", label: "Wow", emoji: "😮" },
	{ id: "sad", label: "Buồn", emoji: "😢" },
	{ id: "angry", label: "Phẫn nộ", emoji: "😡" },
];
const voterStorageKey = "blog-comment-reaction-voter";

let { commentId, initialCounts = {} } = $props<{
	commentId: string;
	initialCounts?: CommentReactionCounts;
}>();

let active = $state<ReactionId | "">("");
let counts = $state<Record<ReactionId, number>>(rowToCounts(initialCounts));
let pickerOpen = $state(false);
let saving = $state(false);
let error = $state("");
let voterId = "";

const reactionStorageKey = `comment-reaction:${commentId}`;

onMount(() => {
	voterId = getVoterId();
	const savedReaction = localStorage.getItem(reactionStorageKey);
	if (isReactionId(savedReaction)) active = savedReaction;
});

async function toggleReaction(id: ReactionId) {
	if (saving || !voterId) return;

	const previous = active;
	const next = previous === id ? "" : id;
	const previousCounts = { ...counts };
	active = next;
	counts = updateCounts(previousCounts, previous, next);
	pickerOpen = false;
	error = "";
	persistReaction(next);

	if (!supabaseConfigured) return;

	saving = true;
	try {
		const response = await supabaseRest<CommentReactionCounts>(
			"rpc/record_comment_reaction",
			{
				method: "POST",
				body: JSON.stringify({
					p_comment_id: commentId,
					p_voter_id: voterId,
					p_next_reaction: next,
				}),
			},
		);
		counts = rowToCounts(response);
	} catch {
		active = previous;
		counts = previousCounts;
		persistReaction(previous);
		error = "Chưa lưu được cảm xúc.";
	} finally {
		saving = false;
	}
}

function updateCounts(
	current: Record<ReactionId, number>,
	previous: ReactionId | "",
	next: ReactionId | "",
) {
	const updated = { ...current };
	if (previous) updated[previous] = Math.max(updated[previous] - 1, 0);
	if (next) updated[next] += 1;
	return updated;
}

function persistReaction(value: ReactionId | "") {
	if (value) localStorage.setItem(reactionStorageKey, value);
	else localStorage.removeItem(reactionStorageKey);
}

function getVoterId() {
	const saved = localStorage.getItem(voterStorageKey);
	if (saved && /^[0-9a-f-]{36}$/i.test(saved)) return saved;
	const id = crypto.randomUUID();
	localStorage.setItem(voterStorageKey, id);
	return id;
}

function rowToCounts(row: CommentReactionCounts) {
	return {
		like: row.like_count ?? 0,
		love: row.love_count ?? 0,
		haha: row.haha_count ?? 0,
		wow: row.wow_count ?? 0,
		sad: row.sad_count ?? 0,
		angry: row.angry_count ?? 0,
	};
}

function selectedEmoji() {
	return reactions.find((reaction) => reaction.id === active)?.emoji;
}

function togglePicker(event: MouseEvent) {
	const openedByKeyboard = event.detail === 0;
	const deviceCanHover = window.matchMedia("(hover: hover)").matches;
	if (deviceCanHover && !openedByKeyboard) return;
	pickerOpen = !pickerOpen;
}

function isReactionId(value: unknown): value is ReactionId {
	return reactionIds.includes(value as ReactionId);
}
</script>

<div class="comment-reactions" class:picker-open={pickerOpen}>
	<div class="reaction-summary" aria-label="Cảm xúc của bình luận">
		{#each reactions as reaction}
			{#if counts[reaction.id] > 0}
				<span title={`${reaction.label}: ${counts[reaction.id]}`}>
					<span aria-hidden="true">{reaction.emoji}</span>
					<strong>{counts[reaction.id]}</strong>
				</span>
			{/if}
		{/each}
	</div>

	<button
		class="reaction-trigger"
		class:active={Boolean(active)}
		type="button"
		aria-label="Thả cảm xúc"
		aria-expanded={pickerOpen}
		title="Thả cảm xúc"
		disabled={saving}
		onclick={togglePicker}
	>
		{#if selectedEmoji()}
			<span aria-hidden="true">{selectedEmoji()}</span>
		{:else}
			<Icon icon="material-symbols:add-reaction-outline-rounded" />
		{/if}
	</button>

	<div class="reaction-picker" aria-label="Chọn cảm xúc">
		{#each reactions as reaction}
			<button
				type="button"
				class:active={active === reaction.id}
				aria-label={reaction.label}
				aria-pressed={active === reaction.id}
				title={reaction.label}
				disabled={saving}
				onclick={() => toggleReaction(reaction.id)}
			>
				<span aria-hidden="true">{reaction.emoji}</span>
			</button>
		{/each}
	</div>

	{#if error}<span class="reaction-error" role="status">{error}</span>{/if}
</div>

<style>
	.comment-reactions {
		position: relative;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.35rem;
		min-height: 2rem;
		margin-top: 0.35rem;
	}

	.reaction-summary {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.reaction-summary > span {
		display: inline-flex;
		align-items: center;
		gap: 0.18rem;
		min-height: 1.65rem;
		padding: 0 0.38rem;
		border: 1px solid var(--card-border);
		border-radius: 999px;
		background: var(--btn-regular-bg);
		font-size: 0.84rem;
	}

	.reaction-summary strong {
		color: var(--meta-color);
		font-size: 0.7rem;
	}

	.reaction-trigger,
	.reaction-picker button {
		display: inline-grid;
		place-items: center;
		border: 1px solid var(--card-border);
		border-radius: 999px;
		background: var(--btn-regular-bg);
		color: var(--meta-color);
		cursor: pointer;
		transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
	}

	.reaction-trigger {
		width: 2rem;
		height: 2rem;
		padding: 0;
		font-size: 1rem;
	}

	.reaction-trigger:hover,
	.reaction-trigger:focus-visible,
	.reaction-trigger.active,
	.reaction-picker button:hover,
	.reaction-picker button:focus-visible,
	.reaction-picker button.active {
		border-color: color-mix(in oklch, var(--primary), transparent 55%);
		background: var(--btn-regular-bg-hover);
		transform: translateY(-1px) scale(1.04);
		outline: none;
	}

	.reaction-picker {
		position: absolute;
		left: 0;
		bottom: calc(100% + 0.35rem);
		z-index: 20;
		display: flex;
		gap: 0.18rem;
		padding: 0.3rem;
		border: 1px solid var(--card-border);
		border-radius: 999px;
		background: var(--float-panel-bg);
		box-shadow: var(--card-shadow-hover);
		opacity: 0;
		pointer-events: none;
		transform: translateY(0.35rem) scale(0.96);
		transition: opacity 160ms ease, transform 160ms ease;
	}

	/* Keep hover active while the pointer crosses the gap above the trigger. */
	.reaction-picker::after {
		position: absolute;
		right: 0;
		bottom: -0.55rem;
		left: 0;
		height: 0.55rem;
		content: "";
	}

	.comment-reactions:hover .reaction-picker,
	.comment-reactions.picker-open .reaction-picker {
		opacity: 1;
		pointer-events: auto;
		transform: translateY(0) scale(1);
	}

	.reaction-picker button {
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border-color: transparent;
		font-size: 1.28rem;
	}

	button:disabled {
		cursor: wait;
		opacity: 0.62;
	}

	.reaction-error {
		flex-basis: 100%;
		color: #d04444;
		font-size: 0.72rem;
	}

	@media (max-width: 420px) {
		.reaction-picker {
			left: -0.3rem;
		}

		.reaction-picker button {
			width: 2rem;
			height: 2rem;
			font-size: 1.12rem;
		}
	}
</style>
