// Packages
import { createContext } from "@rbxts/react";

// Types
import type Types from "./types";

const Contexts = {
	App: createContext<Types.ClassProps | undefined>(undefined),
} as const;

export default Contexts;
