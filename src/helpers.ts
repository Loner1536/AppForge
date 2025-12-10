// Packages
import { usePx } from "@rbxts/loners-pretty-vide-utils";

// Types
import Types from "./types";

let __px: boolean = false;

export function Render(props: Types.NameProps & Types.MainProps) {
	const { config, name, names, forge } = props;

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
