// Types
import type AppForge from "../..";

// Components
import { AppRegistry } from "../../decorator";

export default function ExclusiveGroupRule(entry: AppNames, forge: AppForge) {
	const entryApp = AppRegistry.get(entry);
	if (!entryApp?.rules?.exclusiveGroup) return;

	const group = entryApp.rules.exclusiveGroup;
	const entrySource = forge.getSource(entry)!();

	if (!entrySource) return;

	AppRegistry.forEach((app, name) => {
		if (name === entry) return;
		if (app.rules?.exclusiveGroup !== group) return;

		if (forge.getSource(name)!()) {
			forge.close(name, false);
		}
	});
}
