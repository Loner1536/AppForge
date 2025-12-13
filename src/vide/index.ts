// Services
import { RunService } from "@rbxts/services";

// Packages
import Vide, { apply, create, effect, mount, source, untrack } from "@rbxts/vide";
import { usePx } from "@rbxts/loners-pretty-vide-utils";

// Classes
import Renders from "./classes/renders";

// Helpers
import { AppRegistry } from "./decorator";
import Types from "./types";

type Destructor = () => void;

export default class AppForge extends Renders {
	protected sources = new Map<AppNames, Vide.Source<boolean>>();
	protected loaded = new Map<AppNames, Vide.Node>();

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
				untrack(() => this.applyRules(name));
			});
		} else warn("forge.bind is used for studio when game isnt running");
	}

	public getSource(name: AppNames) {
		if (!this.sources.has(name)) this.createSource(name);

		return this.sources.get(name)!;
	}

	public set(name: AppNames, value: boolean, rules: boolean = true) {
		if (rules) this.applyRules(name);

		let src = this.sources.get(name);

		if (!src) {
			this.createSource(name);
			src = this.sources.get(name)!;
		}

		if (src() === value) return;

		src(value);
	}
	public open(name: AppNames, rules: boolean = true) {
		this.set(name, true, rules);
	}
	public close(name: AppNames, rules: boolean = true) {
		this.set(name, false, rules);
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
		apply(Container as Instance)({
			[0]: this.renderMount(props),
		});

		this.innerMount = mount(() => Container, target);

		return this.innerMount;
	}
	public unMount() {
		this.innerMount?.();
	}

	public toggle(name: AppNames, rules: boolean = true) {
		this.set(name, !this.getSource(name)(), rules);
	}
}
