// Packages
import React, { useBinding, useState } from "@rbxts/react";

// Types
import type Types from "./types";
import type AppForge from ".";

// Components
import { AppRegistry } from "./decorator";

export function createBinding(name: AppNames[number], forge: AppForge) {
	const app = AppRegistry.get(name);
	if (!app) throw `App "${name}" not registered`;

	if (forge.binds.has(name)) return;

	const binding = useBinding(app.visible ?? false);
	forge.binds.set(name, binding);
}
export function createState(name: AppNames[number], forge: AppForge) {
	const app = AppRegistry.get(name);
	if (!app) throw `App "${name}" not registered`;

	if (forge.states.has(name)) return;

	const state = useState(app.visible ?? false);
	forge.states.set(name, state);
}

export function Render(props: Types.NameProps & Types.MainProps): React.ReactNode {
	const names = props.names;
	const name = props.name;

	const forge = props.forge;

	AppRegistry.forEach((_, name) => {
		createBinding(name, forge);
		createState(name, forge);
	});

	if (name) {
		return forge.renderApp(props);
	} else if (names) {
		return forge.renderApps(props);
	}
	return forge.renderAll(props);
}
