// Services
import { RunService } from "@rbxts/services";

// Packages
import Vide, { action, apply, create, effect, mount, source, untrack } from "@rbxts/vide";

// Classes
import Renders from "./classes/renders";

// Helpers
import { AppRegistry } from "./decorator";
import Types from "./types";

type Destructor = () => void;

type Loaded = { container: Vide.Node; render: Vide.Node; anchor?: Vide.Node };

export default class AppForge extends Renders {
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
		if (!app) throw `App "${name}" not registered`;

		if (this.sources.has(name)) return;

		this.sources.set(name, source(app.visible ?? false));
		return source;
	}
	public isLoaded(name: AppNames) {
		return this.loaded.has(name);
	}

	public bind(name: AppNames, value: Vide.Source<boolean>) {
		if (!RunService.IsRunning()) {
			this.sources.set(name, value);
			effect(() => {
				value();
				untrack(() => this.checkRules(name));
			});
		} else warn("forge.bind is used for studio when game isnt running");
	}
	public anchor(name: AppNames, anchorName: AppNames, props: Types.Props.Main) {
		if (name === anchorName) throw `Tried to anchor an App to itself`;

		const anchorApp = AppRegistry.get(anchorName);
		if (!anchorApp) throw `Failed to get class for ${anchorName} from AppRegistry for anchor`;

		const render = this.loaded.get(name)?.render;
		if (!render) throw `Failed to get ${name} from this.loaded for anchor to ${anchorName}`;

		const anchor = new anchorApp.constructor(props, anchorName).render();

		for (const children of (anchor as GuiObject).GetDescendants()) {
			children.Destroy();
		}

		apply(anchor as GuiObject)({
			Name: "Anchor",

			BackgroundTransparency: 1,

			[0]: render,
		});

		const prev = this.loaded.get(name);
		if (!prev) throw `Failed to retreive prev loaded data for ${name}`;

		apply(prev.container as GuiObject)({
			[0]: anchor,
		});

		this.loaded.set(name, { ...prev, anchor });
	}
	public index(name: AppNames, index: number) {
		const loaded = this.loaded.get(name);
		if (!loaded) throw `Failed to retreive loaded data for app: ${name}`;

		apply(loaded.container as GuiObject)({
			ZIndex: index,
		});
	}

	public getSource(name: AppNames) {
		if (!this.sources.has(name)) this.createSource(name);

		return this.sources.get(name)!;
	}

	public set(name: AppNames, value: boolean, rules: boolean = true) {
		let src = this.sources.get(name);

		if (!src) {
			this.createSource(name);
			src = this.sources.get(name)!;
		}

		if (src() === value) return;

		src(value);

		if (rules) this.checkRules(name);
	}
	public open(name: AppNames, rules: boolean = true) {
		this.set(name, true, rules);
	}
	public close(name: AppNames, rules: boolean = true) {
		this.set(name, false, rules);
	}
	public toggle(name: AppNames, rules: boolean = true) {
		this.set(name, !this.getSource(name)(), rules);
	}

	public story(props: Types.Props.Main) {
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
		this.innerMount?.();
	}
}
