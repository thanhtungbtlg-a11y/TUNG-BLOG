import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const brainDir = join(repoRoot, "brain");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const serve = process.argv.includes("--serve");

function run(command, args, shell = false) {
	const result = spawnSync(command, args, {
		cwd: brainDir,
		shell,
		stdio: "inherit",
	});
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(join(brainDir, "node_modules"))) {
	run(npmCommand, ["ci", "--no-audit", "--no-fund"], process.platform === "win32");
}

// Quartz v5 keeps visual features in pinned plugins. A fresh Vercel build
// restores them from brain/quartz.lock.json before generating the Brain site.
if (!existsSync(join(brainDir, ".quartz", "plugins"))) {
	run(process.execPath, ["quartz/bootstrap-cli.mjs", "plugin", "install"]);
}

const quartzArgs = [
	"quartz/bootstrap-cli.mjs",
	"build",
	"--output",
	serve ? "public" : "../dist/brain",
];

if (serve) quartzArgs.push("--serve", "--baseDir", "brain");
run(process.execPath, quartzArgs);
