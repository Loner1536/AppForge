// Services
import { RunService } from "@rbxts/services";

export type DebugTag = "render" | "rules" | "state" | "px" | "lifecycle";

type LogFn = (level: "DEBUG" | "PERF", message: string, data?: unknown, traceback?: string) => void;

export default class Debugger {
	private timers = new Map<string, number>();
	private enabled = new Set<DebugTag>();
	private allEnabled = false;

	constructor(private readonly log: LogFn) {}

	enable(tag: DebugTag) {
		this.enabled.add(tag);
	}

	disable(tag: DebugTag) {
		this.enabled.delete(tag);
	}

	enableAll() {
		this.allEnabled = true;
	}

	disableAll() {
		this.allEnabled = false;
		this.enabled.clear();
	}

	isEnabled(tag: DebugTag) {
		return this.allEnabled || this.enabled.has(tag);
	}

	logTag(tag: DebugTag, app: AppNames, message: string, data?: unknown) {
		if (!RunService.IsStudio()) return;
		if (!this.isEnabled(tag)) return;

		this.log("DEBUG", `[${tag}][${app}] ${message}`, data);
	}

	time(tag: DebugTag, app: AppNames) {
		if (!RunService.IsStudio()) return;
		if (!this.isEnabled(tag)) return;

		this.timers.set(`${tag}:${app}`, os.clock());
	}

	timeEnd(tag: DebugTag, app: AppNames) {
		if (!RunService.IsStudio()) return;
		if (!this.isEnabled(tag)) return;

		const key = `${tag}:${app}`;
		const start = this.timers.get(key);
		if (start === undefined) return;

		this.timers.delete(key);

		const elapsed = os.clock() - start;
		this.log("PERF", `[${tag}][${app}] ${string.format("%.3fms", elapsed * 1000)}`);
	}
}
