import "@rbxts/vide";

// Services
import { RunService } from "@rbxts/services";

// Packages
import { create, source } from "@rbxts/vide";

// Types
import type Types from "./types";
import type AppForge from ".";

// Components
import { AppRegistry } from "./decorator";

// Utility
import { Render } from "./helpers";

function createSource(name: AppNames[number], manager: AppForge) {
	const app = AppRegistry.get(name);
	if (!app) throw `App "${name}" not registered`;

	const appSource = source(app.visible ?? false);
	manager.sources.set(name, appSource);
	return source;
}
function createInstance(props: Types.NameProps & Types.MainProps) {
	const { name, forge } = props;

	if (!name) throw "App name is required to create instance";

	const appClass = AppRegistry.get(name);
	if (!appClass) throw `App "${name}" not registered`;

	if (!forge.loaded.has(name)) {
		const instance = new appClass.constructor(props);

		forge.loaded.set(name, instance.render());
	}

	return forge.loaded.get(name)!;
}

export default function AppContainer(props: Types.NameProps & Types.MainProps) {
	const { name, forge } = props;

	if (!name) throw "App name is required in AppContainer";

	createSource(name, forge);

	const element: Vide.Node = createInstance(props);
	if (!element) error(`Failed to create instance for app "${name}"`);

	if (RunService.IsRunning()) {
		return;
		// return (
		// 	<screengui key={name} ZIndexBehavior="Sibling" ResetOnSpawn={false}>
		// 		{element}
		// 	</screengui>
		// );
	} else {
		// return (
		// 	<frame key={name} BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
		// 		{element}
		// 	</frame>
		// );
	}
}
