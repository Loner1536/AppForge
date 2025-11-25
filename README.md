# AppForge — React App & Window Manager for roblox-ts

AppForge is a UI/app orchestration system for React in Roblox, enabling:

✔ App registration
✔ Visibility & state control
✔ App grouping
✔ Exclusive UI modes
✔ Rule-based interactions
✔ Priority & layering
✔ React-friendly state bindings

---

# 📦 Installation

```bash
npm i @rbxts/app-forge
# or
bun i @rbxts/app-forge
```

---

# 🧩 Setup — REQUIRED

### Create `global.d.ts`

```ts
declare global {
 // All registered Apps by name
 type AppNames = readonly ["HUD", "Inventory", "Shop", "SideButtons", "Pause"];

 // Logical groupings of apps
 type AppGroups = readonly ["HUD", "Panel", "Overlay"];

 // Props that are injected into each App
 interface AppProps {
  player: Player;
  target: GuiObject | Camera;
  playerData: any;
  events: any;
  appManager: import("@rbxts/app-forge").default;
 }

 export {};
}
```

> AppForge will now use your AppNames & AppProps as typed globals.

---

# 🚀 Initializing AppForge

```ts
import AppManager, { Render } from "@rbxts/app-forge";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import React from "@rbxts/react";

const manager = new AppManager();
const root = createRoot(new Instance("Folder"));

const props: AppProps = {
 player: Players.LocalPlayer!,
 target: new Instance("Folder"),
 playerData: {},
 events: {},
 appManager: manager,
};

root.render(
 createPortal(
  <screengui ResetOnSpawn={false} ZIndexBehavior="Sibling">
   <Render props={props} manager={manager} />
  </screengui>,
  Players.LocalPlayer!.WaitForChild("PlayerGui"),
 ),
);
```

> `Render` will automatically render ALL registered apps.

---

# 🧱 Creating an App

```ts
import { App, Args } from "@rbxts/app-forge";
import React from "@rbxts/react";

@App({
 name: "SideButtons",
 visible: true,
})
export default class SideButtons extends Args {
 render() {
  return (
   <frame Size={UDim2.fromScale(1, 1)}>Side Buttons UI</frame>
  );
 }
}
```

### ❗ Note

`Args` automatically injects AppProps into `this`, such as:

```ts
this.props
```

You never manually `new` apps — AppForge constructs them automatically.

---

# 🕹 App Manager API

```ts
appManager.toggle("Inventory");
appManager.set("Shop", true);
appManager.set("HUD", false);
const isShown = appManager.getState("Pause");
const bind = appManager.getBind("Inventory");
```

---

# 📐 Using `getBind()` in React

```tsx
return (
 <frame Visible={props.appManager.getBind("Inventory")}>
  Items…
 </frame>
);
```

Binds re-render automatically on visibility change.

---

# ⌨️ Hotkey Toggle Example

```ts
UserInputService.InputBegan.Connect((input) => {
 if (input.KeyCode === Enum.KeyCode.I)
  appManager.toggle("Inventory");
});
```

---

# ⚖️ APP RULES SYSTEM

Rules control UI interaction & visibility behavior.

| Rule | Effect |
|---|---|
| blockedBy | Prevents opening if another app is active |
| blocks | Auto-closes another app when opened |
| exclusive | Closes ALL other apps except same group |
| groups | Logical grouping categories |
| layer | (Coming soon — currently not functional) |

---

## `blockedBy`

App cannot open if the listed apps are open.

```ts
@App({ name: "Inventory", rules: { blockedBy: "Shop" } })
```

Multiple:

```ts
@App({ name: "Inventory", rules: { blockedBy: ["Shop", "Trade"] } })
```

---

## `blocks`

Opening the app will hide other apps.

```ts
@App({ name: "Shop", rules: { blocks: "Inventory" } })
```

Multiple:

```ts
@App({ name: "Shop", rules: { blocks: ["Inventory", "TeamUI"] } })
```

---

## `exclusive`

For fullscreen apps:

```ts
@App({ name: "Pause", rules: { exclusive: true } })
```

When Pause opens:

✔ Inventory closes
✔ HUD closes
✔ SideButtons closes
✔ Everything except Core

---

## `groups`

Apps inside the same group DO NOT block each other.

```ts
@App({ name: "HUD", rules: { groups: ["HUD"] } })
@App({ name: "Crosshair", rules: { groups: ["HUD"] } })
```

These can both be open at the same time.

---

## `Core` Group

Core apps are ALWAYS allowed and never auto-hidden.

```ts
@App({ name: "FPSCounter", rules: { groups: "Core" } })
```

This app will NEVER be closed by rules.

---

## `layer` *(not implemented yet)*

> The `layer` property is part of the upcoming UI priority system.
> Setting it currently does not affect rendering order.

Example (for future readiness):

```ts
@App({ name: "DebugUI", rules: { layer: 999 } })
```

---

# 🧪 Full Rules Example

```ts
@App({ name: "HUD", rules: { groups: ["HUD"] } })
@App({ name: "Inventory", rules: { blockedBy: "Shop", groups: ["Panel"] } })
@App({ name: "Shop", rules: { blocks: "Inventory", groups: ["Panel"] } })
@App({ name: "Pause", rules: { exclusive: true } })
@App({ name: "FPSCounter", rules: { groups: "Core" } })
```

Behavior:

| Action         | Result                           |
| -------------- | -------------------------------- |
| Open Inventory | HUD + FPS stay                   |
| Open Shop      | Inventory closes                 |
| Open Pause     | ALL apps close except Core       |
| Open HUD       | Never conflicts with SideButtons |
| FPSCounter     | Always visible                   |

---

# 🧠 Using AppForge in UI Components

```tsx
function MenuUI(props: AppProps) {
 return (
  <frame Visible={props.appManager.getBind("Shop")}>
   Shop UI…
  </frame>
 );
}
```

---

# ❗ Best Practices

✔ Use `groups` for UI coexistence
✔ Use `exclusive` for fullscreen menus
✔ Use `blockedBy` for preventing conflicts
✔ Use `blocks` for auto-closing logic
✔ Use `Core` for never-closed apps
✔ Use `layer` for future-proofing (not active yet)

---

# 🛠 Future Roadmap

- [ ] layer / priority rendering

---

# ❤️ Contributing

Feel free to submit PRs, suggestions, or feature requests.

---

# 📄 License

MIT
