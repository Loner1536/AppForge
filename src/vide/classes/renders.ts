// Packages
import Vide, { apply, create } from "@rbxts/vide";

// Types
import type Types from "../types";
import type AppForge from "..";

// Components
import { AppRegistry } from "../decorator";

// Hooks
import { usePx } from "../hooks/usePx";

// Classes
import Rules from "./rules";

export default class Renders extends Rules {
	protected anchored = new Map<AppNames, { id: AppNames; render: Vide.Node }>();

	constructor() {
		super();
	}

	protected renderMount(this: AppForge, props: Types.Props.Main) {
		const { config, render, forge } = props;

		if (!forge.__px) {
			usePx(config?.px.target, config?.px.resolution, config?.px.minScale);
			forge.__px = true;
		} else warn("Rendering twice making a second px");

		if (render) {
			if (render.name && render.group) {
				return forge.renderGroupByName(props);
			} else if (render.names && render.group) {
				return forge.renderGroupByNames(props);
			} else if (render?.name) {
				return forge.renderApp(props);
			} else if (render.names) {
				return forge.renderApps(props);
			} else if (render.group) {
				return forge.renderGroup(props);
			}
		}
		return this.renderAll(props);
	}

	private renderNames(props: Types.Props.Main, names: AppNames[], forge: AppForge) {
		if (names.size() === 0) {
			throw "No app names provided to renderApps";
		}

		return names.map((name) =>
			forge.renderApp({
				...props,
				render: { name },
			}),
		);
	}
	private collectByGroup(groups: GroupNames[], filter?: (name: AppNames) => boolean): AppNames[] {
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
	private normalizeGroups(group: GroupNames | GroupNames[]): GroupNames[] {
		return typeIs(group, "table") ? [...group] : [group];
	}

	protected renderApp(this: AppForge, props: Types.Props.Main) {
		const { forge, render } = props;

		const name = render?.name;
		if (!name) throw "App name is required to create instance";

		const appClass = AppRegistry.get(name);
		if (!appClass) throw `App "${name}" not registered`;

		if (!forge.loaded.has(name)) {
			const render = new appClass.constructor(props, name).render();

			apply(render as Instance)({
				Name: "Render",
			});

			const container = create("Frame")({
				Name: name,

				BackgroundTransparency: 1,

				AnchorPoint: new Vector2(0.5, 0.5),
				Position: UDim2.fromScale(0.5, 0.5),
				Size: UDim2.fromScale(1, 1),

				[0]: render,
			});

			forge.loaded.set(name, { container, render });
		}

		const element = forge.loaded.get(name);
		if (!element) error(`Failed to create instance for app "${name}"`);

		this.renderRules(name, props);

		return element.container;
	}
	protected renderApps(this: AppForge, props: Types.Props.Main) {
		const names = props.render?.names;
		if (!names) throw "No app names provided";

		return this.renderNames(props, names, this);
	}
	protected renderGroup(this: AppForge, props: Types.Props.Main) {
		const group = props.render?.group;
		if (!group) throw "No group provided";

		const groups = this.normalizeGroups(group);
		return this.renderNames(props, this.collectByGroup(groups), this);
	}
	protected renderGroupByName(this: AppForge, props: Types.Props.Main) {
		const { group, name } = props.render ?? {};
		if (!group || !name) throw "Invalid renderGroupByName";

		const groups = this.normalizeGroups(group);
		return this.renderNames(
			props,
			this.collectByGroup(groups, (n) => n === name),
			this,
		);
	}
	protected renderGroupByNames(this: AppForge, props: Types.Props.Main) {
		const { group, names } = props.render ?? {};
		if (!group || !names) throw "Invalid renderGroupByNames";

		const groups = this.normalizeGroups(group);
		return this.renderNames(
			props,
			this.collectByGroup(groups, (n) => names.includes(n)),
			this,
		);
	}
	protected renderAll(this: AppForge, props: Types.Props.Main) {
		const names: AppNames[] = [];
		AppRegistry.forEach((_, name) => names.push(name));

		return this.renderNames(props, names, this);
	}
}
