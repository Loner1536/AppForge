// Services
import { RunService } from "@rbxts/services";

// Packages
import { usePx } from "@rbxts/loners-pretty-react-hooks";
import React from "@rbxts/react";

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

	public readonly bind: React.Binding<boolean>;
	public readonly state: Boolean;

	constructor(props: Types.NameProps & Types.MainProps) {
		const { target, forge, name } = props;

		if (!name) throw "App name is required in Args constructor";

		const bind = forge.getBind(name);
		if (!bind && RunService.IsRunning()) throw "FAILED TO GET BIND FOR APP!";

		const px = usePx(target);

		this.forge = forge;

		this.props = { ...props.props, px, forge };
		this.name = name;

		this.bind = bind!;
		this.state = this.bind ? this.bind.getValue() : undefined!;
	}

	abstract render(): React.ReactNode;
}
