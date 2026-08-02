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
	deliverables: string;
	skills: string[];
	image?: string;
	imageAlt?: string;
	imageWidth?: number;
	imageHeight?: number;
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
	kicker: "Engineering portfolio",
	headline:
		"Plumbing, fire protection, and process piping engineer with hands-on CAD and BIM automation experience.",
	summary:
		"I work across building services, industrial piping, and technical software workflows - from hydraulic calculations and coordinated MEP drawings to Plant 3D administration, 3D routing, and engineering documentation.",
	location: "Ho Chi Minh City, Vietnam",
	email:
		"https://mail.google.com/mail/?view=cm&fs=1&to=thanhtungbtlg@gmail.com",
	linkedin: "https://www.linkedin.com/in/tung0209/",
};

export const portfolioHighlights: PortfolioHighlight[] = [
	{ label: "Disciplines", value: "MEP & process piping" },
	{ label: "Experience", value: "2022 - Present" },
	{ label: "Core platforms", value: "Revit & Plant 3D" },
	{ label: "Availability", value: "Freelance & part-time" },
];

export const workExperience: WorkExperience[] = [
	{
		company: "Confidential Construction Company",
		role: "Plumbing & Firefighting Design Engineer | Piping Engineer",
		period: "Mar 2026 - Present",
		location: "Ho Chi Minh City, Vietnam",
		summary:
			"Building-services design focused on coordinated plumbing, drainage, and fire protection systems for construction delivery.",
		responsibilities: [
			"Design domestic water supply and drainage systems, including flow, pressure, pipe sizing, and booster-pump calculations.",
			"Prepare floor plans, riser diagrams, construction details, equipment schedules, and quantity take-offs.",
			"Design sprinkler, fire hose reel, hydrant, CO2, and FM200 systems with hydraulic calculations and pump selection.",
			"Prepare fire protection drawings, schematics, BOQs, cost estimates, and authority-submission documents.",
		],
		achievements: [
			"Coordinate architectural, structural, and MEP interfaces to identify and resolve design clashes.",
			"Support fire protection approval workflows in line with applicable Vietnamese regulations.",
		],
		tools: [
			"Revit",
			"Building Information Modeling",
			"Plumbing Design",
			"Firefighting Design",
			"Dialux",
		],
	},
	{
		company: "Confidential Company",
		role: "Piping Engineer - Freelancer",
		period: "Dec 2025 - Present",
		location: "France - Remote",
		summary:
			"Remote freelance support for piping design and model-development tasks in an international working context.",
		responsibilities: [
			"Develop and review 3D piping model content for assigned engineering scopes.",
			"Support point-cloud-informed modeling and coordination workflows.",
		],
		tools: ["AutoCAD Plant 3D", "Autodesk ReCap", "3D Modeling"],
	},
	{
		company: "Confidential Company",
		role: "Piping Engineer - Contract",
		period: "Jan 2026 - Mar 2026",
		location: "Ho Chi Minh City, Vietnam",
		summary:
			"Contract piping engineering assignment supporting the tank farm scope for Phu Quoc Airport.",
		responsibilities: [
			"Develop piping model content and coordinated layouts for the assigned tank farm scope.",
			"Prepare model-based engineering deliverables using AutoCAD Plant 3D.",
		],
		relatedProjects: ["Tank Farm - Phu Quoc Airport"],
		tools: ["AutoCAD Plant 3D", "Piping Design", "3D Modeling"],
	},
	{
		company: "Confidential Company (EPC)",
		role: "Piping Design Engineer",
		period: "Jun 2024 - Jan 2026",
		location: "Ho Chi Minh City, Vietnam",
		summary:
			"Piping design and model-development work across LNG, LPG, chemical, and refinery projects in an EPC environment.",
		responsibilities: [
			"Develop general arrangements, unit plot plans, pipe routing, underground piping, and 3D models.",
			"Prepare detailed isometric drawings for sphere tanks, pumps, pipe racks, and jetty areas for construction issue.",
			"Model and coordinate preliminary pipe-support locations against project support specifications.",
			"Create Plant 3D project databases from piping material specifications and support technical studies such as flare systems and API 521.",
		],
		relatedProjects: [
			"VD-199 - Thi Vai LNG Terminal Expansion",
			"VD-196 - Stavian VP Chlorine Plant",
			"VD-191 - Yen Hung LPG Terminal",
			"VF-007 - Haifa Oil Refinery",
		],
		tools: [
			"AutoCAD Plant 3D",
			"Piping Design",
			"GA Routing",
			"Isometric Drawings",
			"3D Modeling",
			"API 521",
		],
	},
	{
		company: "Sunwoo Global",
		role: "Piping Engineer | AutoCAD Plant 3D Administrator",
		period: "Jan 2024 - Jun 2024",
		location: "Ho Chi Minh City, Vietnam",
		summary:
			"Combined piping production work with Plant 3D administration, catalog customization, and workflow automation.",
		responsibilities: [
			"Create Python-based custom Plant 3D items and datasheets for valves, nozzles, cable trays, and pipe supports.",
			"Produce and coordinate orthographic and isometric drawings using Navisworks model data.",
			"Customize isometric output through IsoConfig.xml and maintain structural catalogs through SQL editing.",
			"Build equipment and structural models, pipe-support drawings, and reusable project libraries.",
		],
		achievements: [
			"Developed custom property workflows using C#, .NET, and the Navisworks API to query model data more efficiently.",
			"Supported electrical and instrumentation teams with Plant 3D and Navisworks technical issues.",
		],
		tools: [
			"AutoCAD Plant 3D",
			"Python",
			"C# / .NET",
			"Navisworks API",
			"Autodesk Advance Steel",
			"SQL",
		],
	},
	{
		company: "Tri Viet Technology",
		role: "Mechanical Engineer - Contract",
		period: "Aug 2023 - Nov 2023",
		location: "Ho Chi Minh City, Vietnam",
		summary:
			"Mechanical design and production support spanning sheet-metal planning, fabrication, and laser-cutting workflows.",
		responsibilities: [
			"Design patterned products and fixtures using AutoCAD and Autodesk Inventor.",
			"Program and operate laser-cutting equipment and support bending-machine workflows.",
			"Support production of Givi cargo products and folding vending carts.",
		],
		achievements: [
			"Reorganized the sheet-metal inventory workflow to reduce avoidable production time and material handling.",
		],
		tools: ["AutoCAD", "Autodesk Inventor", "Sheet Metal", "Laser Cutting"],
	},
	{
		company: "SATAMOLD",
		role: "Mechanical Engineer Intern",
		period: "Mar 2023 - Jul 2023",
		location: "Dong Nai, Vietnam",
		summary:
			"Practical internship covering mold design, 3D mechanical modeling, machining, and workshop operations.",
		responsibilities: [
			"Create detailed 3D models and support the mold-design process in SolidWorks.",
			"Operate and learn workshop processes including milling, drilling, grinding, lathe work, cutting, and polishing.",
			"Prepare machining programs with Mastercam X5 and set up parts on CNC equipment.",
		],
		tools: ["SolidWorks", "Mastercam X5", "CNC Machining", "Mold Design"],
	},
	{
		company: "Akselos",
		role: "CAD Engineer Intern",
		period: "Sep 2022 - Jan 2023",
		location: "District 2, Ho Chi Minh City",
		summary:
			"CAD and simulation-preparation internship involving geometry automation, detailed modeling, and mesh refinement.",
		responsibilities: [
			"Automate repetitive SpaceClaim geometry tasks with Python scripts.",
			"Create 3D models and 2D drawings and develop surface-modeling workflows in SpaceClaim.",
			"Generate and refine meshes for 3D models using Coreform Cubit.",
			"Support vessel, offshore truss, crane pedestal, shell-joint, and cargo-ship model preparation.",
		],
		relatedProjects: [
			"Scotford Model Construction",
			"Hokchi Shell Joint",
			"Bonga Crane Pedestals",
		],
		tools: ["SpaceClaim", "Python", "Coreform Cubit", "Meshing", "3D Modeling"],
	},
];

export const portfolioProjects: PortfolioProject[] = [
	{
		title: "Building Services Design",
		category: "Plumbing & fire protection",
		period: "2026 - Ongoing",
		status: "Active",
		summary:
			"Coordinated design of domestic water, drainage, and fire protection systems for a confidential construction project.",
		role: "Plumbing and firefighting design engineer",
		process: [
			"Calculate water demand, pressure, pipe sizes, sprinkler density, and pump duties.",
			"Develop plans, risers, schematics, details, schedules, and quantity take-offs.",
			"Coordinate the design with architectural, structural, and adjacent MEP systems.",
		],
		deliverables:
			"Coordinated BIM models, construction drawings, BOQs, estimates, and fire-protection submission documentation.",
		skills: [
			"Revit",
			"BIM",
			"Hydraulic Calculations",
			"Plumbing",
			"Firefighting",
		],
		image: "/images/portfolio/building-services-model.webp",
		imageAlt:
			"Coordinated three-dimensional building services model with plumbing and fire protection pipework",
		imageWidth: 946,
		imageHeight: 823,
	},
	{
		title: "Phu Quoc Airport Tank Farm",
		category: "Piping contract",
		period: "Jan - Mar 2026",
		status: "Completed",
		summary:
			"Short-term piping engineering assignment supporting the tank-farm scope for Phu Quoc Airport.",
		role: "Piping engineer",
		process: [
			"Develop model-based piping layouts for the assigned tank-farm systems.",
			"Coordinate routed systems and prepare Plant 3D engineering output.",
		],
		deliverables:
			"A coordinated AutoCAD Plant 3D model for the contract scope.",
		skills: ["AutoCAD Plant 3D", "Tank Farm", "Piping Layout", "3D Modeling"],
		image: "/images/portfolio/tank-farm-jetty-plan.webp",
		imageAlt: "Top view of an industrial tank farm and connected piping model",
		imageWidth: 800,
		imageHeight: 406,
	},
	{
		title: "Thi Vai LNG Terminal Expansion",
		category: "LNG terminal - EPC",
		period: "2024 - 2026",
		status: "Completed",
		summary:
			"Interconnecting-area design support for an LNG terminal expansion, covering pipe rack, underground piping, and firefighting routing.",
		role: "Piping design engineer",
		process: [
			"Route interconnecting pipe systems through pipe-rack and underground corridors.",
			"Coordinate firefighting routing within the assigned model areas.",
			"Review the integrated model for constructible connections and clearances.",
		],
		deliverables:
			"Model-based piping and firefighting routing for the interconnecting project area.",
		skills: ["LNG", "Pipe Rack", "Underground Piping", "Firefighting Routing"],
		image: "/images/portfolio/interconnecting-pipe-rack.webp",
		imageAlt:
			"Three-dimensional model of interconnecting process piping and pipe-rack structures",
		imageWidth: 1623,
		imageHeight: 1057,
	},
	{
		title: "Stavian VP Chlorine Plant",
		category: "Chemical plant - EPC",
		period: "2024 - 2026",
		status: "Completed",
		summary:
			"Plant layout and tank-farm coordination for chlorine, hydrogen peroxide, acid, alkali, and associated storage systems.",
		role: "Piping design engineer",
		process: [
			"Create the Plant 3D project database and develop general and unit plot plans.",
			"Lay out storage warehouses and tank-farm areas for multiple chemical products.",
			"Develop GA piping routes and coordinated 3D model content.",
		],
		deliverables:
			"General and unit plot plans, storage layouts, GA routing, and coordinated 3D models.",
		skills: [
			"Chemical Plant",
			"Plot Plan",
			"Tank Farm",
			"GA Routing",
			"Plant 3D",
		],
		image: "/images/portfolio/industrial-plant-layout.webp",
		imageAlt: "Overall three-dimensional layout of an industrial process plant",
		imageWidth: 1546,
		imageHeight: 878,
	},
	{
		title: "Yen Hung LPG Terminal",
		category: "LPG terminal - EPC",
		period: "2024 - 2026",
		status: "Completed",
		summary:
			"General-arrangement and construction-detail support for an LPG terminal covering sphere tanks, pumps, pipe racks, and jetty systems.",
		role: "Piping design engineer",
		process: [
			"Support GA drawings for pipe-rack and jetty areas.",
			"Produce detailed isometric drawings for sphere tanks, pumps, and connected piping.",
			"Model pipe-support locations against the project piping-support specification.",
		],
		deliverables:
			"Construction-issue isometrics, coordinated models, and preliminary pipe-support layouts.",
		skills: ["LPG", "Isometric Drawings", "Jetty Piping", "Pipe Supports"],
		image: "/images/portfolio/lpg-terminal-coordination.webp",
		imageAlt:
			"Coordinated LPG terminal model showing storage tanks, process piping, and jetty connections",
		imageWidth: 1604,
		imageHeight: 868,
	},
	{
		title: "Haifa Oil Refinery",
		category: "Oil & gas plant",
		period: "2024 - 2026",
		status: "Completed",
		summary:
			"Jetty-area and pipe-rack design work for an oil refinery, including underground routing and flare-system study.",
		role: "Piping design engineer",
		process: [
			"Develop the jetty unit plot plan and GA routing for pipe-rack and marine areas.",
			"Route underground piping and create coordinated 3D model content.",
			"Study flare-system requirements, KOD equipment, and API 521 guidance.",
		],
		deliverables:
			"Plot plans, piping routes, model content, and a Plant 3D database derived from the piping material specification.",
		skills: ["Oil & Gas", "Jetty", "Underground Piping", "API 521", "Plant 3D"],
		image: "/images/portfolio/sphere-tank-piping.webp",
		imageAlt:
			"Industrial tank and process piping coordination model viewed in three dimensions",
		imageWidth: 1634,
		imageHeight: 1037,
	},
	{
		title: "Plant 3D Automation & Administration",
		category: "Engineering software",
		period: "Jan - Jun 2024",
		status: "Completed",
		summary:
			"A focused Plant 3D administration role combining custom catalog content, drawing configuration, and model-data automation.",
		role: "Plant 3D administrator and piping engineer",
		process: [
			"Script custom parametric items in Python and prepare reusable component datasheets.",
			"Configure orthographic and isometric output, structural catalogs, and project properties.",
			"Build C#/.NET tools against the Navisworks API for model-property workflows.",
		],
		deliverables:
			"Reusable catalogs, custom Plant 3D items, configured drawing output, and automation utilities for multidisciplinary model teams.",
		skills: ["Python", "C#", ".NET", "Plant 3D", "Navisworks API", "SQL"],
		image: "/images/portfolio/plant3d-python-automation.webp",
		imageAlt:
			"Python source code for a custom parametric AutoCAD Plant 3D item",
		imageWidth: 1638,
		imageHeight: 974,
	},
	{
		title: "Plant 3D Process Unit Modeling",
		category: "Plant 3D production",
		period: "Jan - Jun 2024",
		status: "Completed",
		summary:
			"Model-development and drawing-production support for a coordinated process-unit environment.",
		role: "Piping engineer and Plant 3D administrator",
		process: [
			"Build equipment, piping, structural, and support content in the coordinated project model.",
			"Review model interfaces in Navisworks and resolve drawing-production issues.",
			"Prepare reusable project content for orthographic and isometric deliverables.",
		],
		deliverables:
			"A coordinated process-unit model and configured content supporting repeatable drawing production.",
		skills: [
			"AutoCAD Plant 3D",
			"Navisworks",
			"3D Modeling",
			"Orthographic Drawings",
		],
		image: "/images/portfolio/plant3d-process-unit.webp",
		imageAlt:
			"AutoCAD Plant 3D process-unit model with equipment, piping, and structural content",
		imageWidth: 1920,
		imageHeight: 911,
	},
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
		deliverables:
			"A maintainable research system that turns a large Obsidian vault into an accessible web reference.",
		skills: ["LEED Research", "Obsidian", "Quartz", "Technical Documentation"],
		href: "/brain/leed/",
	},
];

export const skillGroups: SkillGroup[] = [
	{
		title: "Building services",
		description:
			"Design and coordination of water, drainage, and fire protection systems.",
		icon: "material-symbols:water-drop-outline-rounded",
		items: [
			"Plumbing design",
			"Firefighting design",
			"Hydraulic calculations",
			"Revit and BIM coordination",
			"BOQ and cost estimates",
		],
	},
	{
		title: "Process piping",
		description:
			"Industrial piping work across LNG, LPG, chemical, refinery, and tank-farm facilities.",
		icon: "material-symbols:flowsheet-outline-rounded",
		items: [
			"AutoCAD Plant 3D",
			"GA and piping routing",
			"Isometric drawings",
			"Pipe-support coordination",
			"Plot plans and model databases",
		],
	},
	{
		title: "CAD & automation",
		description:
			"Software administration and automation for repeatable engineering workflows.",
		icon: "material-symbols:code-blocks-outline-rounded",
		items: [
			"Python",
			"C# and .NET",
			"Navisworks API",
			"SQL catalog editing",
			"Plant 3D configuration",
		],
	},
	{
		title: "Mechanical engineering",
		description:
			"Foundational experience in product design, manufacturing, molds, and simulation preparation.",
		icon: "material-symbols:precision-manufacturing-outline-rounded",
		items: [
			"SolidWorks and Inventor",
			"SpaceClaim",
			"Coreform Cubit meshing",
			"Sheet metal and laser cutting",
			"CNC and workshop processes",
		],
	},
	{
		title: "Standards & documentation",
		description:
			"Engineering documentation grounded in project specifications and applicable standards.",
		icon: "material-symbols:description-outline-rounded",
		items: [
			"NFPA 13",
			"Vietnamese fire regulations",
			"ASME piping references",
			"API 521",
			"Technical documentation",
		],
	},
	{
		title: "Languages & development",
		description:
			"Working-language capability alongside continuing professional study.",
		icon: "material-symbols:translate-rounded",
		items: [
			"Vietnamese - Native",
			"English - Limited working proficiency",
			"Japanese - Elementary, studying toward N4",
			"LEED and green-building study",
		],
	},
];

export const credentials: Credential[] = [
	{
		title: "Mechanical Engineering",
		issuer: "Ho Chi Minh City University of Technology",
		period: "2019 - 2023",
		detail: "Bachelor-level engineering education",
	},
];
