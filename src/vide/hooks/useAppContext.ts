// Components
import Contexts from "../context";

export default () => {
	const context = Contexts.App();

	if (!context) throw `Failed to retrieve App Props for Vide ${debug.traceback()}`;

	return context;
};
