// Types
import type { Args } from "./decorator";
import type AppForge from ".";

declare namespace Types {
	type AppRegistryProps = {
		name: AppNames[number];
		visible?: boolean;
		rules?: Rules.All;
	};

	type MainProps = (
		| { name?: AppNames[number]; names?: undefined }
		| { names?: AppNames[number][]; name?: undefined }
	) & {
		props: AppProps;
		forge: AppForge;
		target?: GuiObject | Camera;
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

export type MainProps = Types.MainProps;
export default Types;
