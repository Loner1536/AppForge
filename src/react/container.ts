// Services
import { RunService } from "@rbxts/services";

// Packages
import { useBinding, createElement } from "@rbxts/react";

// Types
import type Types from "./types";
import type AppForge from ".";

// Components
import { AppRegistry } from "./decorator";

function createInstance(props: Types.NameProps & Types.MainProps) {
	const { name, forge } = props;

	if (!name) throw "App name is required to create instance";

	const appClass = AppRegistry.get(name);
	if (!appClass) throw `App "${name}" not registered`;

	if (!forge.loaded.has(name)) {
		const instance = new appClass.constructor(props);

		const Render = () => instance.render();

		forge.loaded.set(name, createElement(Render, { key: "Main" }));
	}

	return forge.loaded.get(name)!;
}

export function AppContainer(props: Types.NameProps & Types.MainProps) {
	const { name } = props;

	if (!name) throw "App name is required in AppContainer";

	const element = createInstance(props);
	if (!element) error(`Failed to create instance for app "${name}"`);

	if (RunService.IsRunning()) {
		return createElement(
			"ScreenGui",
			{
				key: name,
				ZIndexBehavior: Enum.ZIndexBehavior.Sibling,
				ResetOnSpawn: false,
			},
			element,
		);
	} else {
		return createElement(
			"Frame",
			{
				key: name,
				BackgroundTransparency: 1,
				Size: UDim2.fromScale(1, 1),
			},
			element,
		);
	}
}
