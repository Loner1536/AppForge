// Packages
import Vide from "@rbxts/vide";

// Types
import type Types from "./types";
import type AppForge from ".";

// Hooks
import { px } from "./hooks/usePx";

export const AppRegistry = new Map<AppNames, Types.AppRegistry.Static>();

export function App<N extends AppNames>(props: Types.AppRegistry.Props<N>) {
	return function <T extends new (props: Types.Props.Main, name: AppNames) => Args>(
		constructor: T,
	) {
		if (AppRegistry.has(props.name)) {
			error(`Duplicate registered App name "${props.name}"`);
		}

		AppRegistry.set(props.name, {
			constructor,
			renderGroup: props.renderGroup,
			visible: props.visible,
			rules: props.rules,
		} as Types.AppRegistry.Generic<N>);

		return constructor;
	};
}

export abstract class Args {
	public readonly forge: AppForge;

	public readonly props: Types.Props.Class;
	public readonly name: AppNames;

	public readonly source: Vide.Source<boolean>;

	constructor(props: Types.Props.Main, name: AppNames) {
		const { forge } = props;

		this.forge = forge;

		this.props = { ...props.props, px, forge };
		this.name = name;

		this.source = forge.getSource(name)!;
	}

	abstract render(): Vide.Node;
}
