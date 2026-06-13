<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";

type ReactionId = "like" | "useful" | "inspiring";
type ReactionState = {
	active: ReactionId | "";
	counts: Record<ReactionId, number>;
};

const reactions: Array<{
	id: ReactionId;
	label: string;
	icon: string;
}> = [
	{
		id: "like",
		label: "Like",
		icon: "material-symbols:favorite-outline-rounded",
	},
	{
		id: "useful",
		label: "Useful",
		icon: "material-symbols:tips-and-updates-outline-rounded",
	},
	{
		id: "inspiring",
		label: "Inspiring",
		icon: "material-symbols:bolt-rounded",
	},
];

let { slug } = $props<{ slug: string }>();

let state = $state<ReactionState>({
	active: "",
	counts: {
		like: 0,
		useful: 0,
		inspiring: 0,
	},
});

const storageKey = `post-reactions:${slug}`;

onMount(() => {
	const saved = localStorage.getItem(storageKey);
	if (!saved) return;

	try {
		state = {
			...state,
			...JSON.parse(saved),
			counts: {
				...state.counts,
				...JSON.parse(saved).counts,
			},
		};
	} catch {}
});

function save() {
	localStorage.setItem(storageKey, JSON.stringify(state));
}

function toggleReaction(id: ReactionId) {
	const nextState = {
		active: state.active,
		counts: { ...state.counts },
	};

	if (nextState.active === id) {
		nextState.counts[id] = Math.max(nextState.counts[id] - 1, 0);
		nextState.active = "";
	} else {
		if (nextState.active) {
			nextState.counts[nextState.active] = Math.max(
				nextState.counts[nextState.active] - 1,
				0,
			);
		}
		nextState.counts[id] += 1;
		nextState.active = id;
	}

	state = nextState;
	save();
}
</script>

<div class="reaction-panel card-base onload-animation">
	<div class="reaction-copy">
		<div class="reaction-title">Phản ứng của bạn</div>
		<div class="reaction-subtitle">Lưu trên trình duyệt hiện tại</div>
	</div>
	<div class="reaction-actions">
		{#each reactions as reaction}
			<button
				data-reaction-button
				class:active={state.active === reaction.id}
				aria-pressed={state.active === reaction.id}
				onclick={() => toggleReaction(reaction.id)}
			>
				<Icon icon={reaction.icon} />
				<span>{reaction.label}</span>
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

	.reaction-subtitle {
		margin-top: 0.125rem;
		font-size: 0.82rem;
		color: rgb(0 0 0 / 0.45);
	}

	:global(.dark) .reaction-title {
		color: rgb(255 255 255 / 0.9);
	}

	:global(.dark) .reaction-subtitle {
		color: rgb(255 255 255 / 0.45);
	}

	.reaction-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.5rem;
		border: 1px solid var(--card-border);
		border-radius: 0.85rem;
		background: var(--btn-regular-bg);
		color: var(--btn-content);
		padding: 0 0.75rem;
		font: inherit;
		font-weight: 700;
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

	button:active {
		transform: scale(0.97);
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
			justify-content: stretch;
		}

		button {
			flex: 1 1 30%;
			justify-content: center;
		}
	}
</style>
