// Services
import { RunService } from "@rbxts/services";

// Packages
import Vide from "@rbxts/vide";

// Types
import type Types from "./types";

// Components
import { AppRegistry, Args, App } from "./decorator";
import AppContainer from "./container";

// Classes
import RulesManager from "./rules";

export default class AppForge {
	public sources = new Map<AppNames[number], Vide.Source<boolean>>();
	public loaded = new Map<AppNames[number], Vide.Node>();

	private rulesManager = new RulesManager(this);

	public getSource(name: AppNames[number]) {
		if (!this.sources.has(name)) throw `App "${name}" has no source`;

		return this.sources.get(name)!;
	}

	public set(name: AppNames[number], value: Vide.Source<boolean> | boolean) {
		if (!this.rulesManager.applyRules(name, value)) return;

		if (typeIs(value, "function")) this.sources.set(name, value);
		else {
			const source = this.sources.get(name)!;
			if (!source) throw `App "${name}" has no source`;

			source(value);
		}
	}

	public open(name: AppNames[number]) {
		this.set(name, true);
	}

	public close(name: AppNames[number]) {
		this.set(name, false);
	}

	public toggle(name: AppNames[number]) {
		this.set(name, !this.getSource(name)());
	}

	public renderApp(props: Types.NameProps & Types.MainProps) {
		return <AppContainer {...props} />;
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

export { App, Args };
export { Render } from "./helpers";
export type { NameProps, MainProps, ClassProps } from "./types";
