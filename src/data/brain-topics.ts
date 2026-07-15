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
			"Ghi chú về công trình xanh, hệ thống chứng nhận LEED và tư duy thiết kế bền vững.",
		icon: "material-symbols:energy-savings-leaf-outline-rounded",
		status: "live",
		href: "/brain/leed/",
		lastUpdated: brainVaultStatus.leed.lastSyncedAt,
	},
	{
		title: "Vault 02",
		description: "Không gian cho một chủ đề Obsidian mới.",
		icon: "material-symbols:folder-open-outline-rounded",
		status: "soon",
	},
	{
		title: "Vault 03",
		description: "Không gian cho một chủ đề Obsidian mới.",
		icon: "material-symbols:folder-open-outline-rounded",
		status: "soon",
	},
	{
		title: "Vault 04",
		description: "Không gian cho một chủ đề Obsidian mới.",
		icon: "material-symbols:folder-open-outline-rounded",
		status: "soon",
	},
] satisfies BrainTopic[];
