// Types
import type AppForge from "../..";

// Rules
import ExclusiveGroupRule from "./exclusiveGroup";
import ParentRule from "./parent";

export default class Rules {
	protected processing = new Set<AppNames>();

	protected applyRules(this: AppForge, name: AppNames) {
		if (this.processing.has(name)) return;
		this.processing.add(name);

		try {
			ParentRule(name, this);
			ExclusiveGroupRule(name, this);
		} finally {
			this.processing.delete(name);
		}
	}
}
