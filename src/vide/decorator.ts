// Packages
import { px as pxScale } from "@rbxts/loners-pretty-vide-utils";
import Vide from "@rbxts/vide";

// Types
import type Types from "./types";
import type AppForge from ".";

export const AppRegistry = new Map<string, Types.AppRegistry>();

export function App(props: Types.AppRegistryProps) {
	return function <T extends new (props: Types.MainProps) => Args>(constructor: T) {
		if (AppRegistry.has(props.name)) {
			error(`Duplicate registered App name "${props.name}"`);
		}

		AppRegistry.set(props.name, {
			constructor,
			visible: props.visible,
			rules: props.rules,
		});

		return constructor;
	};
}

export abstract class Args {
	public readonly forge: AppForge;

	public readonly props: Types.ClassProps;
	public readonly name: AppNames[number];

	public readonly source: Vide.Source<boolean>;

	constructor(props: Types.NameProps & Types.MainProps) {
		const { forge, name } = props;

		if (!name) throw "App name is required in Args constructor";

		const px = pxScale;

		this.forge = forge;

		this.props = { ...props.props, px, forge };
		this.name = name;

		this.source = forge.getSource(name)!;
	}

	abstract render(): Vide.Node;
}
