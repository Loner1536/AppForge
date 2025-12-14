// Types
import type Types from "../../types";
import type AppForge from "../..";

// Components
import { AppRegistry } from "../../decorator";

// Rules
import ExclusiveGroupRule from "./exclusiveGroup";
import ParentRule from "./parent";

export default class Rules {
	protected processing = new Set<AppNames>();

	protected renderRules(this: AppForge, name: AppNames, props: Types.Props.Main) {
		const appClass = AppRegistry.get(name);
		if (!appClass) throw `Failed to get class for app: ${name} for renderRules`;

		if (appClass.rules?.parent && !appClass.rules.detach)
			this.anchor(name, appClass.rules.parent, props);

		if (appClass.rules?.index) this.index(name, appClass.rules.index);
	}

	protected checkRules(this: AppForge, name: AppNames) {
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
