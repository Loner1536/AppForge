// Packages
import Vide, { apply, create } from "@rbxts/vide";

// Types
import type Types from "./types";
import type AppForge from "./mount";

// Components
import { AppRegistry } from "./appRegistry";

// Hooks
import { usePx } from "./hooks/usePx";

// Classes
import Rules from "./ruleEngine";

export default class Renders extends Rules {
	protected anchored = new Map<AppNames, { id: AppNames; render: Vide.Node }>();

	constructor() {
		super();
	}

	/**
	 * Entry point for mounting renders.
	 * Decides render strategy based on props.
	 */
	protected renderMount(this: AppForge, props: Types.Props.Main) {
		const { config, render, forge } = props;

		if (!forge.__px) {
			forge.debug.logTag("px", "global", "Initializing px scaling", config?.px);
			usePx(config?.px.target, config?.px.resolution, config?.px.minScale);
			forge.__px = true;
		} else {
			forge.debug.logTag("px", "global", "Skipped duplicate px initialization");
		}

		if (render) {
			if (render.name && render.group) {
				forge.debug.logTag("render", "global", "Rendering group by name", render);
				return forge.renderGroupByName(props);
			}

			if (render.names && render.group) {
				forge.debug.logTag("render", "global", "Rendering group by names", render);
				return forge.renderGroupByNames(props);
			}

			if (render.name) {
				forge.debug.logTag("render", render.name, "Rendering single app");
				return forge.renderApp(props);
			}

			if (render.names) {
				forge.debug.logTag("render", "global", "Rendering multiple apps", render.names);
				return forge.renderApps(props);
			}

			if (render.group) {
				forge.debug.logTag("render", "global", "Rendering group", render.group);
				return forge.renderGroup(props);
			}
		}

		forge.debug.logTag("render", "global", "Rendering all apps");
		return this.renderAll(props);
	}

	private renderNames(
		props: Types.Props.Main,
		names: AppNames[],
		forge: AppForge,
		context: string,
		details?: unknown,
	) {
		if (!names) {
			forge.logger.log("WARN", `Renderer resolved 0 apps (${context})`, details ?? props.render);
			return;
		}

		return names.map((name) =>
			forge.renderApp({
				...props,
				render: { name },
			}),
		);
	}

	private collectByGroup(groups: AppGroups[], filter?: (name: AppNames) => boolean): AppNames[] {
		const result: AppNames[] = [];

		AppRegistry.forEach((app, name) => {
			const appGroup = app.renderGroup;
			if (!appGroup) return;
			if (!groups.includes(appGroup)) return;
			if (filter && !filter(name)) return;

			result.push(name);
		});

		return result;
	}
	private normalizeGroups(group: AppGroups | AppGroups[]): AppGroups[] {
		return typeIs(group, "table") ? [...group] : [group];
	}

	protected renderApp(this: AppForge, props: Types.Props.Main) {
		const name = props.render?.name;
		if (!name) error("renderApp requires an app name", 2);

		const appClass = AppRegistry.get(name);
		if (!appClass) error(`App "${name}" not registered`, 2);

		this.debug.time("render", name);

		if (!this.loaded.has(name)) {
			const render = new appClass.constructor(props, name).render();
			apply(render as Instance)({ Name: "Render" });

			const container = create("Frame")({
				Name: name,
				BackgroundTransparency: 1,
				AnchorPoint: new Vector2(0.5, 0.5),
				Position: UDim2.fromScale(0.5, 0.5),
				Size: UDim2.fromScale(1, 1),
				[0]: render,
			});

			this.loaded.set(name, { container, render });
		} else {
			this.debug.logTag("render", name, "Reusing existing render instance");
		}

		this.renderRules(name, props);

		this.debug.timeEnd("render", name);
		return this.loaded.get(name)!.container;
	}
	protected renderApps(this: AppForge, props: Types.Props.Main) {
		const names = props.render?.names;
		if (!names) error("renderApps requires app names", 2);

		return this.renderNames(props, names, this, "renderApps", names);
	}
	protected renderGroup(this: AppForge, props: Types.Props.Main) {
		const group = props.render?.group;
		if (!group) error("renderGroup requires a group", 2);

		const groups = this.normalizeGroups(group);
		return this.renderNames(props, this.collectByGroup(groups), this, "renderGroup", group);
	}
	protected renderGroupByName(this: AppForge, props: Types.Props.Main) {
		const { group, name } = props.render ?? {};
		if (!group || !name) error("Invalid renderGroupByName call", 2);

		const groups = this.normalizeGroups(group);
		return this.renderNames(
			props,
			this.collectByGroup(groups, (n) => n === name),
			this,
			"renderGroupByName",
			{ group, name },
		);
	}
	protected renderGroupByNames(this: AppForge, props: Types.Props.Main) {
		const { group, names } = props.render ?? {};
		if (!group || !names) error("Invalid renderGroupByNames call", 2);

		const groups = this.normalizeGroups(group);
		return this.renderNames(
			props,
			this.collectByGroup(groups, (n) => names.includes(n)),
			this,
			"renderGroupByNames",
			{ group, names },
		);
	}
	protected renderAll(this: AppForge, props: Types.Props.Main) {
		const names: AppNames[] = [];
		AppRegistry.forEach((_, name) => names.push(name));

		return this.renderNames(props, names, this, "renderAll");
	}
}
