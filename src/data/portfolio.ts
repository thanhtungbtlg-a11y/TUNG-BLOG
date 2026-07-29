export type PortfolioHighlight = {
	label: string;
	value: string;
};

export type WorkExperience = {
	company: string;
	role: string;
	period: string;
	location?: string;
	summary: string;
	responsibilities: string[];
	achievements?: string[];
	relatedProjects?: string[];
	tools?: string[];
};

export type PortfolioProject = {
	title: string;
	category: string;
	period: string;
	status: "Active" | "Completed" | "Archived";
	summary: string;
	role: string;
	process: string[];
	outcome: string;
	skills: string[];
	href?: string;
};

export type SkillGroup = {
	title: string;
	description: string;
	icon: string;
	items: string[];
};

export type Credential = {
	title: string;
	issuer: string;
	period: string;
	detail?: string;
	href?: string;
};

export const portfolioProfile = {
	name: "Nguyễn Thanh Tùng",
	kicker: "Professional portfolio",
	headline:
		"MEP engineering, sustainable buildings, and technical knowledge systems.",
	summary:
		"A structured record of my professional direction, work experience, technical capabilities, and selected projects.",
	email:
		"https://mail.google.com/mail/?view=cm&fs=1&to=thanhtungbtlg@gmail.com",
};

export const portfolioHighlights: PortfolioHighlight[] = [
	{ label: "Core focus", value: "MEP systems" },
	{ label: "Design approach", value: "Clear and coordinated" },
	{ label: "Current study", value: "LEED and green buildings" },
	{ label: "Knowledge practice", value: "Structured documentation" },
];

/*
 * Add one object per company. Keep confidential project names, drawings,
 * client data, contract values, and internal metrics out of this public file.
 */
export const workExperience: WorkExperience[] = [];

export const portfolioProjects: PortfolioProject[] = [
	{
		title: "LEED Second Brain",
		category: "Independent knowledge system",
		period: "Ongoing",
		status: "Active",
		summary:
			"A public, searchable knowledge base for LEED concepts, source notes, study paths, and sustainable-building research.",
		role: "Knowledge curation and project direction",
		process: [
			"Organize technical material into navigable concepts and topic maps.",
			"Maintain source traceability between references, notes, and study layers.",
			"Publish the vault as a responsive Quartz knowledge base.",
		],
		outcome:
			"A maintainable research system that turns a large Obsidian vault into an accessible web reference.",
		skills: ["LEED research", "Obsidian", "Quartz", "Technical documentation"],
		href: "/brain/leed/",
	},
];

export const skillGroups: SkillGroup[] = [
	{
		title: "Engineering focus",
		description:
			"Technical work centered on coordinated, readable building systems.",
		icon: "material-symbols:engineering-outline-rounded",
		items: ["MEP systems", "Engineering design", "Technical coordination"],
	},
	{
		title: "Sustainable design",
		description:
			"An expanding body of research around building performance and LEED.",
		icon: "material-symbols:energy-savings-leaf-outline-rounded",
		items: [
			"LEED research",
			"Green-building principles",
			"Performance-focused thinking",
		],
	},
	{
		title: "Documentation",
		description:
			"Turning technical material into structured, maintainable information.",
		icon: "material-symbols:description-outline-rounded",
		items: ["Technical writing", "Knowledge management", "Source traceability"],
	},
];

export const credentials: Credential[] = [];
