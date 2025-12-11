// Packages
import React from "@rbxts/react";

// Types
import type Types from "./types";

// Components
import { AppContainer } from "./container";
import { AppRegistry } from "./decorator";

// Classes
import RulesManager from "./rules";

// Helpers
import { createBinding, createState } from "./helpers";

type Binding = [React.Binding<boolean>, (T: boolean) => void];
type State = [boolean, React.Dispatch<React.SetStateAction<boolean>>];

export default class AppForge {
	public loaded = new Map<AppNames[number], React.Element>();
	public binds = new Map<AppNames[number], Binding>();
	public states = new Map<AppNames[number], State>();

	private rulesManager = new RulesManager(this);

	public getBind(name: AppNames[number]) {
		if (!this.binds.has(name)) createBinding(name, this);
		return this.binds.get(name)![0];
	}

	public getState(name: AppNames[number]) {
		if (!this.states.has(name)) createState(name, this);
		return this.states.get(name)![0];
	}

	public set(name: AppNames[number], value: boolean) {
		if (!this.rulesManager.applyRules(name, value)) return;
		const [_b, setBinding] = this.binds.get(name)!;
		const [_s, setState] = this.states.get(name)!;

		if (!setBinding) createBinding(name, this);

		setBinding(value);
		setState(value);
	}

	public open(name: AppNames[number]) {
		this.set(name, true);
	}

	public close(name: AppNames[number]) {
		this.set(name, false);
	}

	public toggle(name: AppNames[number]) {
		this.set(name, !this.getState(name));
	}

	public renderApp(props: Types.NameProps & Types.MainProps) {
		return AppContainer(props);
	}

	public renderApps(props: Types.NameProps & Types.MainProps) {
		const names = props.names;
		if (names) {
			return names.map((name) => this.renderApp({ ...props, name, names: undefined }));
		}

		throw "No app names provided to renderApps";
	}

	public renderAll(props: Types.MainProps) {
		const names = [] as AppNames[number][];
		AppRegistry.forEach((_, name) => {
			names.push(name);
		});
		return this.renderApps({ ...props, names });
	}
}
