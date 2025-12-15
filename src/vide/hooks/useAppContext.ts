// Components
import Contexts from "../context";

// Debug
import Logger from "../debug/logger";

const logger = new Logger("useAppContext");

export default () => {
	const context = Contexts.App();

	if (!context) {
		logger.log("ERROR", "Failed to retrieve App context");
		error(`Failed to retrieve App Props for Vide\n${debug.traceback()}`, 2);
	}

	return context;
};
