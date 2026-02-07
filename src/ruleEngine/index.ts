// Types
import type AppForge from "../mount";
import type Types from "../types";

// Components
import { AppRegistry } from "../appRegistry";

// Rules
import ExclusiveGroupRule from "./exclusiveGroup";
import ParentRule from "./parent";

export default class Rules {
	protected processing = new Set<AppNames>();

	protected renderRules(this: AppForge, name: AppNames, props: Types.Props.Main) {
		const appClass = AppRegistry.get(name);
		if (!appClass) {
			error(`renderRules: App "${name}" not registered`, 2);
		}

		const rules = appClass.rules;
		if (!rules) return;

		// Parent Anchor
		if (rules.parent && !rules.detach) {
			this.debug.logTag("rules", name, "Applying parent anchor", {
				parent: rules.parent,
			});
			this.anchor(name, rules.parent, props);
		}

		// Index
		if (rules.zIndex !== undefined) {
			this.debug.logTag("rules", name, "Applying ZIndex", rules.zIndex);
			this.index(name, rules.zIndex);
		}
	}

	protected checkRules(this: AppForge, name: AppNames) {
		if (this.processing.has(name)) {
			this.debug.logTag("rules", name, "Skipped rule processing (cycle detected)");
			return;
		}

		this.processing.add(name);
		this.debug.logTag("rules", name, "Evaluating rules");

		try {
			ParentRule(name, this);
			ExclusiveGroupRule(name, this);
		} finally {
			this.processing.delete(name);
		}
	}
}
