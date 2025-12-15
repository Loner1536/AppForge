// Packages
import Vide from "@rbxts/vide";

// Types
import type Types from "./types";
import type AppForge from ".";

// Hooks
import { px } from "./hooks/usePx";

// Debug
import Logger from "./debug/logger";

const logger = new Logger("AppRegistry");

export const AppRegistry = new Map<AppNames, Types.AppRegistry.Static>();

/**
 * Registers a Vide App with AppForge.
 *
 * This runs at definition time and validates static configuration.
 */
export function App<N extends AppNames>(props: Types.AppRegistry.Props<N>) {
	return function <T extends new (props: Types.Props.Main, name: AppNames) => Args>(
		constructor: T,
	) {
		if (AppRegistry.has(props.name)) {
			logger.log("ERROR", "Duplicate App name detected", {
				name: props.name,
			});

			error(
				`Duplicate registered App name "${props.name}". ` + `App names must be globally unique.`,
				2,
			);
		}

		if (!props.name) {
			logger.log("ERROR", "Attempted to register App without a name", props);
			error("App registration failed: missing app name", 2);
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

/**
 * Base class for all AppForge Apps.
 */
export abstract class Args {
	public readonly forge: AppForge;
	public readonly props: Types.Props.Class;
	public readonly name: AppNames;
	public readonly source: Vide.Source<boolean>;

	constructor(props: Types.Props.Main, name: AppNames) {
		const { forge } = props;

		this.forge = forge;
		this.name = name;

		this.props = {
			...props.props,
			px,
			forge,
		};

		const src = forge.getSource(name);
		if (!src) {
			logger.log("ERROR", "Missing visibility source for App", { name });
			error(`Failed to retrieve visibility source for app "${name}"`, 2);
		}

		this.source = src;
	}

	abstract render(): Vide.Node;
}
