// Packages
import Vide, { create } from "@rbxts/vide";

// Types
import type Types from "./types";

// Components
import { AppContainer } from "./container";
import { AppRegistry } from "./decorator";

// Classes
import RulesManager from "./rules";

// Helpers
import { createSource } from "./helpers";

export default class AppForge {
	public sources = new Map<AppNames, Vide.Source<boolean>>();
	public loaded = new Map<AppNames, Vide.Node>();

	private rulesManager = new RulesManager(this);

	public getSource(name: AppNames) {
		if (!this.sources.has(name)) createSource(name, this);

		return this.sources.get(name)!;
	}

	public set(name: AppNames, value: Vide.Source<boolean> | boolean) {
		this.rulesManager.applyRules(name);

		if (typeIs(value, "function")) this.sources.set(name, value);
		else {
			const source = this.sources.get(name)!;
			if (source() === value) return;

			if (!source) createSource(name, this);
			source(value);
		}
	}

	public open(name: AppNames) {
		this.set(name, true);
	}

	public close(name: AppNames) {
		this.set(name, false);
	}

	public toggle(name: AppNames) {
		this.set(name, !this.getSource(name)());
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
		const names = [] as AppNames[];
		AppRegistry.forEach((_, name) => {
			names.push(name);
		});
		return this.renderApps({ ...props, names });
	}
}
