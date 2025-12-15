// Types
import type AppForge from "../..";

// Components
import { AppRegistry } from "../../decorator";

export default function ExclusiveGroupRule(entry: AppNames, forge: AppForge) {
	const entryApp = AppRegistry.get(entry);
	const group = entryApp?.rules?.exclusiveGroup;
	if (!group) return;

	const entryVisible = forge.getSource(entry)!();
	if (!entryVisible) return;

	forge.debug.logTag("rules", entry, "Exclusive group activated", group);

	AppRegistry.forEach((app, name) => {
		if (name === entry) return;
		if (app.rules?.exclusiveGroup !== group) return;

		const visible = forge.getSource(name)!();
		if (!visible) return;

		forge.debug.logTag("rules", entry, "Closing app due to exclusive group", {
			closed: name,
			group,
		});

		forge.close(name, false);
	});
}
