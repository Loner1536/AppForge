// Types
import type AppForge from "../mount";

// Components
import { AppRegistry } from "../appRegistry";

export default function ParentRule(entry: AppNames, forge: AppForge) {
	const entryVisible = forge.getSource(entry)!();

	AppRegistry.forEach((app, name) => {
		const rules = app.rules;
		if (!rules || rules.parent !== entry) return;
		if (name === entry) return;

		const childVisible = forge.getSource(name)!();
		if (entryVisible || !childVisible) return;

		forge.debug.logTag("rules", entry, "Closing child app (parent closed)", {
			parent: entry,
			child: name,
		});

		forge.close(name, false);
	});
}
