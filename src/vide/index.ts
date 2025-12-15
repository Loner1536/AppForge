// Services
import { RunService } from "@rbxts/services";

// Packages
import Vide, { apply, create, effect, mount, source, untrack } from "@rbxts/vide";

// Classes
import Renders from "./classes/renders";

// Helpers
import { AppRegistry } from "./decorator";
import Types from "./types";

// Debug
import { Logger, Debugger } from "./debug";

type Destructor = () => void;
type Loaded = { container: Vide.Node; render: Vide.Node; anchor?: Vide.Node };

export default class AppForge extends Renders {
	public readonly logger = new Logger("AppForge");
	public readonly debug = new Debugger((level, msg, data, trace) =>
		this.logger.log(level, msg, data, trace),
	);

	protected sources = new Map<AppNames, Vide.Source<boolean>>();
	protected loaded = new Map<AppNames, Loaded>();

	protected innerMount?: Destructor;
	protected __px = false;

	constructor() {
		super();
		AppRegistry.forEach((_, name) => this.createSource(name));
	}

	protected createSource(name: AppNames) {
		const app = AppRegistry.get(name);
		if (!app) {
			this.logger.log("ERROR", "App not registered while creating source", { name });
			return;
		}

		if (this.sources.has(name)) return;

		this.debug.logTag("state", name, "Creating visibility source", {
			default: app.visible ?? false,
		});

		this.sources.set(name, source(app.visible ?? false));
	}

	public getSource(name: AppNames) {
		if (!this.sources.has(name)) this.createSource(name);

		const src = this.sources.get(name);
		if (!src) {
			error(`AppForge invariant broken: missing visibility source for ${name}`, 2);
		}

		return src;
	}
	public isLoaded(name: AppNames) {
		return this.loaded.has(name);
	}

	public bind(name: AppNames, value: Vide.Source<boolean>) {
		if (!RunService.IsRunning()) {
			this.debug.logTag("state", name, "Binding external visibility source");

			this.sources.set(name, value);

			const log = () =>
				this.debug.logTag("state", name, "Visibility changed", {
					from: prev,
					to: value,
				});

			let count = 0;
			let prev: boolean;
			effect(() => {
				count++;
				prev = value();

				untrack(() => this.checkRules(name));

				if (Vide.strict && count === 2) {
					log();
					count = 0;
				} else if (!Vide.strict && count === 1) {
					log();
					count = 0;
				}
			});
		} else {
			this.logger.log("WARN", "forge.bind called while game is running", { name });
		}
	}
	public anchor(name: AppNames, anchorName: AppNames, props: Types.Props.Main) {
		if (name === anchorName) {
			this.logger.log("ERROR", "Attempted to anchor app to itself", { name });
			return;
		}

		const anchorApp = AppRegistry.get(anchorName);
		if (!anchorApp) {
			this.logger.log("ERROR", "Anchor parent not registered", {
				child: name,
				parent: anchorName,
			});
			return;
		}

		const render = this.loaded.get(name)?.render;
		if (!render) {
			this.debug.logTag("rules", name, "Anchor skipped (child not rendered yet)", {
				parent: anchorName,
			});
			return;
		}

		this.debug.logTag("rules", name, "Anchoring to parent", {
			parent: anchorName,
		});

		const anchor = new anchorApp.constructor(props, anchorName).render();

		for (const child of (anchor as GuiObject).GetDescendants()) {
			child.Destroy();
		}

		apply(anchor as GuiObject)({
			Name: "Anchor",
			BackgroundTransparency: 1,
			[0]: render,
		});

		const prev = this.loaded.get(name);
		if (!prev) {
			error(`AppForge invariant broken: missing loaded app for ${name}`, 2);
		}

		apply(prev.container as GuiObject)({
			[0]: anchor,
		});

		this.loaded.set(name, { ...prev, anchor });
	}
	public index(name: AppNames, index: number) {
		const loaded = this.loaded.get(name);
		if (!loaded) {
			this.logger.log("WARN", "ZIndex skipped (app not loaded)", { name, index });
			return;
		}

		this.debug.logTag("rules", name, "Applying ZIndex", { index });

		apply(loaded.container as GuiObject)({
			ZIndex: index,
		});
	}

	public set(name: AppNames, value: boolean, rules = true) {
		let src = this.sources.get(name);
		if (!src) {
			this.createSource(name);
			src = this.sources.get(name);
		}

		if (!src) {
			this.logger.log("ERROR", "Failed to set visibility (missing source)", { name });
			return;
		}

		const prev = src();
		if (prev === value) return;

		src(value);

		this.debug.logTag("state", name, "Visibility changed", {
			from: prev,
			to: value,
		});

		if (rules) this.checkRules(name);
	}

	public open(name: AppNames, rules = true) {
		this.set(name, true, rules);
	}
	public close(name: AppNames, rules = true) {
		this.set(name, false, rules);
	}
	public toggle(name: AppNames, rules = true) {
		this.set(name, !this.getSource(name)(), rules);
	}

	public story(props: Types.Props.Main) {
		this.debug.logTag("lifecycle", "story", "Creating story mount");

		const Container = create("Frame")({
			Name: "Story Container",
			BackgroundTransparency: 1,
			AnchorPoint: new Vector2(0.5, 0.5),
			Position: UDim2.fromScale(0.5, 0.5),
			Size: UDim2.fromScale(1, 1),
		});

		apply(Container as Instance)({
			[0]: this.renderMount(props),
		});

		return Container;
	}
	public mount(callback: () => Vide.Node, props: Types.Props.Main, target: Instance) {
		this.debug.logTag("lifecycle", "mount", "Mounting AppForge");

		const Container = callback();

		this.innerMount = mount(() => {
			apply(Container as Instance)({
				[0]: this.renderMount(props),
			});
			return Container;
		}, target);

		return this.innerMount;
	}
	public unMount() {
		this.debug.logTag("lifecycle", "unmount", "Unmounting AppForge");
		this.innerMount?.();
	}
}
