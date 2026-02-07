// debug/logger.ts
import { RunService } from "@rbxts/services";

export default class Logger {
	constructor(private readonly scope: string) {}

	log(
		level: "DEBUG" | "PERF" | "INFO" | "WARN" | "ERROR",
		message: string,
		data?: unknown,
		traceback?: string,
	) {
		if (!RunService.IsStudio()) return;

		const prefix = `[${this.scope}][${level}]`;

		if (data !== undefined) {
			print(prefix, message, data);
		} else {
			print(prefix, message);
		}

		if (traceback) {
			print(traceback);
		}
	}
}
