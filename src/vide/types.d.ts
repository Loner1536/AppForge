// Types
import type { Args } from "./decorator";
import type AppForge from ".";

declare namespace Types {
	namespace Props {
		type Render =
			| { name?: AppNames; names?: never; group?: never }
			| { names?: AppNames[]; name?: never; group?: never }
			| { group?: GroupNames[] | GroupNames; names?: AppNames[]; name?: never }
			| { group?: GroupNames[] | GroupNames; name?: AppNames; names?: never }
			| { group?: GroupNames[] | GroupNames; names?: never; name?: never };

		type Main = {
			props: AppProps;
			forge: AppForge;
			config?: {
				px: {
					target?: GuiObject | Camera;
					resolution?: Vector2;
					minScale?: number;
				};
			};
			render?: Render;
		};

		type Class = AppProps & {
			forge: AppForge;
			px: typeof import("@rbxts/loners-pretty-vide-utils").px;
		};
	}

	namespace AppRegistry {
		type Props<N extends AppNames> = {
			name: N;
			visible?: boolean;
			renderGroup?: GroupNames;
			rules?: Rules.Generic<N>;
		};

		type Static = {
			constructor: new (props: Types.Props.Main, name: AppNames) => Args;

			visible?: boolean;
			renderGroup?: GroupNames;
			rules?: Rules.Static;
		};

		type Generic<N extends AppNames = AppNames> = {
			constructor: new (props: Types.Props.Main, name: AppNames) => Args;

			visible?: boolean;
			renderGroup?: GroupNames;
			rules?: Rules.Generic<N>;
		};
	}

	namespace Rules {
		type WithParent<P> = {
			parent: P;
			detach?: boolean;
		};

		type WithoutParent = {
			parent?: never;
			detach?: never;
		};

		export type Static = {
			exclusiveGroup?: string;
			index?: number;
		} & (WithParent<string> | WithoutParent);

		export type Generic<N extends AppNames = AppNames> = {
			exclusiveGroup?: GroupNames;
			index?: number;
		} & (WithParent<Exclude<AppNames, N>> | WithoutParent);
	}
}

export type MainProps = Types.Props.Main;
export type ClassProps = Types.Props.Class;
export type RenderProps = Types.Props.Render;

export default Types;
