// Services
import { Workspace } from "@rbxts/services";

// React
import { useEffect } from "@rbxts/react";

/** Default reference resolution for px calculations */
let BASE_RESOLUTION = new Vector2(1920, 1080);

/** Minimum allowed scale to prevent unreadable UI */
let MIN_SCALE = 0.5;

/**
 * Interpolates between width- and height-based scaling.
 * 0 = width-driven, 1 = height-driven
 */
const DOMINANT_AXIS = 0.5;

let TARGET: GuiObject | Camera | undefined = Workspace.CurrentCamera;
let SCALE = 1;

let GLOBAL_INITIALIZED = false;

/**
 * Assigns a call signature to an object.
 */
function callable<T extends Callback, U>(callback: T, object: U): T & U {
	return setmetatable(object as never, {
		__call: (_, ...args) => callback(...args),
	});
}

/**
 * Scaled pixel unit helper.
 */
export const px = callable((value: number) => math.round(value * SCALE), {
	scale: (value: number) => value * SCALE,
	even: (value: number) => math.round(value * SCALE * 0.5) * 2,
	floor: (value: number) => math.floor(value * SCALE),
	ceil: (value: number) => math.ceil(value * SCALE),
});

/**
 * Recalculates the current scale factor.
 */
function calculateScale() {
	const target = TARGET;
	if (!target) return;

	const size = target.IsA("Camera")
		? target.ViewportSize
		: target.IsA("GuiObject")
			? target.AbsoluteSize
			: undefined;

	if (!size) return;
	if (BASE_RESOLUTION.X <= 0 || BASE_RESOLUTION.Y <= 0) return;

	const width = math.log(size.X / BASE_RESOLUTION.X, 2);
	const height = math.log(size.Y / BASE_RESOLUTION.Y, 2);

	const centered = width + (height - width) * DOMINANT_AXIS;
	const scale = 2 ** centered;

	SCALE = math.max(scale, MIN_SCALE);
}

/**
 * Initializes global px scaling.
 *
 * Should be called exactly once at app mount.
 */
export function usePx(target?: GuiObject | Camera, baseResolution?: Vector2, minScale?: number) {
	useEffect(() => {
		if (GLOBAL_INITIALIZED) {
			warn("usePx() may only be called once globally");
			return;
		}
		GLOBAL_INITIALIZED = true;

		if (baseResolution) BASE_RESOLUTION = baseResolution;
		if (minScale !== undefined) MIN_SCALE = minScale;
		if (target) TARGET = target;

		const resolvedTarget = TARGET;
		if (!resolvedTarget) {
			warn("usePx(): no valid target to observe");
			return;
		}

		const signal = resolvedTarget.IsA("Camera")
			? resolvedTarget.GetPropertyChangedSignal("ViewportSize")
			: resolvedTarget.GetPropertyChangedSignal("AbsoluteSize");

		const connection = signal.Connect(calculateScale);
		calculateScale();

		return () => {
			connection.Disconnect();
		};
	}, []);
}
