// Packages
import { useContext } from "@rbxts/react";

// Components
import Contexts from "../context";

export default () => {
	const context = useContext(Contexts.App);

	if (!context) throw `Failed to retrieve App Props for React ${debug.traceback()}`;

	return context;
};
