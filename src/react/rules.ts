// Packages
import Object from "@rbxts/object-utils";

// Components
import { AppRegistry } from "./decorator";
import AppManager from ".";

// Types
import type Types from "./types";

function asTable<T>(value: T | T[]): T[] {
	if (typeIs(value, "table")) {
		return value;
	} else {
		const t = {} as T[];
		t[1] = value;
		return t;
	}
}

export default class RulesManager {
	constructor(private appManager: AppManager) {}

	public applyRules(name: AppNames, value: boolean) {
		const appData = AppRegistry.get(name);
		const rules = appData?.rules;

		if (rules?.groups === "Core") return true;

		if (value) {
			const allNames = Object.keys(AppRegistry) as AppNames[];

			allNames.forEach((n) => {
				if (!n || n === name) return;

				const otherApp = AppRegistry.get(n);
				const groups = otherApp?.rules?.groups ? asTable(otherApp.rules.groups) : [];

				if (groups.find((g) => g === "Core")) return;
				if (this.appManager.getState(n)) this.appManager.set(n, false);
			});
		}

		if (!rules) return true;

		if (value && rules.blockedBy && !this.blockedBy(name, rules.blockedBy)) return false;

		if (value && rules.blocks) this.blocks(name, rules.blocks);

		if (value && rules.layer !== undefined) this.layer(name, rules.layer);

		if (value && rules.exclusive) this.exclusive(name);

		return true;
	}

	private inSameGroup(a: AppNames, b: AppNames): boolean {
		const appA = AppRegistry.get(a);
		const appB = AppRegistry.get(b);
		if (!appA || !appB) return false;

		const groupsA = asTable(appA.rules?.groups ?? []);
		const groupsB = asTable(appB.rules?.groups ?? []);

		for (let i = 1; i <= groupsA.size(); i++) {
			for (let j = 1; j <= groupsB.size(); j++) {
				if (groupsA[i] === groupsB[j]) return true;
			}
		}
		return false;
	}

	private blockedBy(name: AppNames, rule: Types.Rules.BlockedBy): boolean {
		const blockers = asTable(rule);
		for (let i = 1; i <= blockers.size(); i++) {
			const blocker = blockers[i];
			if (this.inSameGroup(name, blocker) || !blocker) continue;
			if (this.appManager.getState(blocker)) return false;
		}
		return true;
	}

	private blocks(name: AppNames, rule: Types.Rules.Blocks) {
		const blocked = asTable(rule);
		for (let i = 1; i <= blocked.size(); i++) {
			const b = blocked[i];
			if (this.inSameGroup(name, b) || !b) continue;
			if (this.appManager.getState(b)) this.appManager.set(b, false);
		}
	}

	private exclusive(name: AppNames) {
		const names = Object.keys(AppRegistry) as AppNames[];
		for (let i = 1; i <= names.size(); i++) {
			const other = names[i];
			if (other === name || !other) continue;
			if (this.inSameGroup(name, other)) continue;
			if (this.appManager.getState(other)) this.appManager.set(other, false);
		}
	}

	private layer(_name: AppNames, _layer: Types.Rules.Layer) {
		// TODO: implement priority / layering
	}
}
