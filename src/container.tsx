// Services
import { RunService, Workspace } from "@rbxts/services";

// Packages
import React, { cloneElement, useBinding } from "@rbxts/react";

// Types
import type Types from "./types";
import type AppForge from ".";

// Components
import { AppRegistry } from "./decorator";

function createBinding(name: AppNames[number], manager: AppForge) {
	const app = AppRegistry.get(name);
	if (!app) error(`App "${name}" not registered`);

	const binding = useBinding(app.visible ?? false);
	manager.binds.set(name, binding);
	return binding;
}
function createInstance(props: Types.NameProps & Types.MainProps) {
	const { name, forge } = props;

	if (!name) throw "App name is required to create instance";

	const appClass = AppRegistry.get(name);
	if (!appClass) error(`App "${name}" not registered`);

	if (!forge.loaded.has(name)) {
		const instance = new appClass.constructor(props);

		const Render = () => instance.render();

		forge.loaded.set(name, <Render key={"Main"} />);
	}
	return forge.loaded.get(name)!;
}

export function AppContainer(props: Types.NameProps & Types.MainProps) {
	const { name, forge } = props;

	if (!name) throw "App name is required in AppContainer";

	createBinding(name, forge);

	const element = createInstance(props);
	if (!element) error(`Failed to create instance for app "${name}"`);

	if (RunService.IsRunning()) {
		return (
			<screengui key={name} ZIndexBehavior="Sibling" ResetOnSpawn={false}>
				{element}
			</screengui>
		);
	} else {
		return (
			<frame key={name} BackgroundTransparency={1} Size={UDim2.fromScale(1, 1)}>
				{element}
			</frame>
		);
	}
}
