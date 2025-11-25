// Services
import { Workspace } from "@rbxts/services";

// Packages
import { usePx } from "@rbxts/loners-pretty-react-hooks";
import React from "@rbxts/react";

// Types
import type Types from "./types";
import type AppForge from ".";
import ReactRoblox, { createRoot } from "@rbxts/react-roblox";

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

	public readonly props: AppProps & { px: ReturnType<typeof usePx> };
	public readonly bind: React.Binding<boolean>;
	public readonly name: AppNames[number];

	constructor(props: Types.MainProps) {
		const { target, forge, name } = props;

		if (!name) throw "App name is required in Args constructor";

		const px = usePx(target);

		this.forge = forge;

		this.props = { ...props, px };
		this.name = name;

		this.bind = forge.getBind(name);
	}

	abstract render(): JSX.Element;
}
