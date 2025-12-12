// Types
import type AppForge from "..";

// Components
import { AppRegistry } from "../decorator";

export default function ParentRule(entry: AppNames, forge: AppForge) {
	const children = [] as AppNames[];

	AppRegistry.forEach((app, name) => {
		const rules = app.rules;
		if (!rules) return;

		if (rules.parent && rules.parent === entry) {
			children.push(name);
		}
	});

	children.forEach((name) => forge.close(name));
}
