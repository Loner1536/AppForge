// Packages
import { usePx } from "@rbxts/loners-pretty-vide-utils";
import Vide, { source } from "@rbxts/vide";

// Types
import type Types from "./types";
import type AppForge from ".";

// Components
import { AppRegistry } from "./decorator";

let __px: boolean = false;

export function createSource(name: AppNames, forge: AppForge) {
	const app = AppRegistry.get(name);
	if (!app) throw `App "${name}" not registered`;

	if (forge.sources.has(name)) return;

	forge.sources.set(name, source(app.visible ?? false));
	return source;
}

export function Render(props: Types.NameProps & Types.MainProps): Vide.Node {
	const { config, name, names, forge } = props;

	AppRegistry.forEach((_, name) => createSource(name, forge));

	if (!__px) {
		usePx(config?.px.target, config?.px.resolution, config?.px.minScale);
		__px = true;
	} else warn("Rendering twice making a second px");

	if (name) {
		return forge.renderApp(props as never);
	} else if (names) {
		return forge.renderApps(props as never);
	}
	return forge.renderAll(props as never);
}
