import brainVaultStatus from "./brain-vault-status.json";

export type BrainTopic = {
	title: string;
	description: string;
	icon: string;
	status: "live" | "soon";
	href?: string;
	lastUpdated?: string;
};

export const brainTopics = [
	{
		title: "LEED",
		description:
			"Notes on green buildings, LEED certification systems, and sustainable design thinking.",
		icon: "material-symbols:energy-savings-leaf-outline-rounded",
		status: "live",
		href: "/brain/leed/",
		lastUpdated: brainVaultStatus.leed.lastSyncedAt,
	},
	{
		title: "Vault 02",
		description: "Space reserved for a future Obsidian topic.",
		icon: "material-symbols:folder-open-outline-rounded",
		status: "soon",
	},
	{
		title: "Vault 03",
		description: "Space reserved for a future Obsidian topic.",
		icon: "material-symbols:folder-open-outline-rounded",
		status: "soon",
	},
	{
		title: "Vault 04",
		description: "Space reserved for a future Obsidian topic.",
		icon: "material-symbols:folder-open-outline-rounded",
		status: "soon",
	},
] satisfies BrainTopic[];
