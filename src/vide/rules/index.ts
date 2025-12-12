// Packages
import Object from "@rbxts/object-utils";
import Vide from "@rbxts/vide";

// Components
import { AppRegistry } from "../decorator";

// Types
import type AppForge from "..";

// Rules
import ParentRule from "./parent";

export default class RulesManager {
	constructor(private forge: AppForge) {}

	public applyRules(name: AppNames) {
		const appData = AppRegistry.get(name);
		const rules = appData?.rules;

		if (!rules) return;

		if (rules.parent) ParentRule(name, this.forge);

		return;
	}
}
