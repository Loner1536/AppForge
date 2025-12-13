// Types
import type AppForge from "../..";

// Components
import { AppRegistry } from "../../decorator";

export default function ParentRule(entry: AppNames, forge: AppForge) {
	const entrySource = forge.getSource(entry)!();

	AppRegistry.forEach((app, name) => {
		const rules = app.rules;
		if (!rules || rules.parent !== entry) return;
		if (name === entry) return;

		const childSource = forge.getSource(name)!();
		if (!entrySource && childSource) forge.close(name, false);
	});
}
