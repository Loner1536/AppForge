// Types
import type { Args } from "./decorator";
import type AppForge from ".";

declare namespace Types {
	type AppRegistryProps = {
		name: AppNames[number];
		visible?: boolean;
		rules?: Rules.All;
	};

	type NameProps =
		| { name?: AppNames[number]; names?: undefined }
		| { names?: AppNames[number][]; name?: undefined };

	type MainProps = {
		props: AppProps;
		forge: AppForge;
		config?: {
			px: {
				target?: GuiObject | Camera;
				resolution?: Vector2;
				minScale?: number;
			};
		};
	};

	type ClassProps = AppProps & {
		forge: AppForge;
		px: typeof import("@rbxts/loners-pretty-vide-utils").px;
	};

	type AppRegistry = {
		constructor: new (props: MainProps) => Args;
		visible?: boolean;
		rules?: Rules.All;
	};

	namespace Rules {
		type Groups = AppGroups[number] | "Core" | "Core"[] | AppGroups[number][];
		type BlockedBy = AppNames[number] | AppNames[number][];
		type Blocks = AppNames[number] | AppNames[number][];
		type Exclusive = boolean;
		type Layer = number;

		type All = {
			blockedBy?: BlockedBy;
			exclusive?: Exclusive;
			groups?: Groups;
			blocks?: Blocks;
			layer?: Layer;
		};
	}
}

export type NameProps = Types.NameProps;
export type MainProps = Types.MainProps;
export type ClassProps = Types.ClassProps;

export default Types;
