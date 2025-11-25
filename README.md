# AppForge — React App & Window Manager for roblox-ts

AppForge is a UI/app orchestration system for React in Roblox, enabling:

✔ App registration
✔ Visibility & state control
✔ App grouping
✔ Exclusive UI modes
✔ Rule-based interactions
✔ Priority & layering
✔ React-friendly state bindings & animations

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
 type AppProps = {
  player: Player;
 }
 export {};
}
```

> App names are now autodetected via decorators — no need to define `AppNames` globally.

---

# 🚀 Initializing AppForge

```ts
import { Workspace } from "@rbxts/services"

import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players, Workspace } from "@rbxts/services";
import AppForge, { Render } from "@rbxts/app-forge";
import React from "@rbxts/react";

const forge = new AppForge();
const root = createRoot(new Instance("Folder"));

const target = Workspace.CurrentCamera!

const props = {
 player: Players.LocalPlayer!,
} as const satisfies AppProps;

root.render(
 createPortal(
  <screengui ResetOnSpawn={false} ZIndexBehavior="Sibling">
   <Render {...{ props, forge, root, target }} />
  </screengui>,
  Players.LocalPlayer!.WaitForChild("PlayerGui")!,
 ),
);
```

> `Render` will control all decorated apps.

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
 public render() {
  return <frame Size={UDim2.fromScale(1, 1)}>Side Buttons UI</frame>;
 }
}
```

---

# 📦 Props & `Args` Features

Inside a decorated App:

```ts
this.Forge   // AppForge instance
this.name    // App Name
this.props   // AppProps
this.bind    // visible state bind
```

Example:

```ts
const { px } = this.props;
const scale2px = px.map((s) => s * 2);
```

---

# 🕹 App Manager API

```ts
forge.toggle("Inventory");
forge.set("Shop", true);
forge.set("HUD", false);
const shown = forge.getState("Pause");
const bind = forge.getBind("Inventory");
```

---

# 📐 Using `getBind()` inside React

```tsx
return (
 <frame Visible={forge.getBind("Inventory")}>
  Items…
 </frame>
);
```

---

# ⌨️ Hotkey Toggle Example

```ts
UserInputService.InputBegan.Connect((input) => {
 if (input.KeyCode === Enum.KeyCode.I)
  forge.toggle("Inventory");
});
```

---

# ⚖️ APP RULES SYSTEM

Rules control app visibility behavior.

| Rule      | Effect                                  |
| --------- | --------------------------------------- |
| blockedBy | Prevents opening if another is open     |
| blocks    | Closes another app when opened          |
| exclusive | Closes ALL other apps except same group |
| groups    | Non-conflicting coexistence grouping    |
| Core      | Always allowed — never auto-closed      |
| layer     | (Reserved – future rendering priority)  |

---

## `groups`

```ts
@App({ name: "HUD", rules: { groups: "HUD" } })
@App({ name: "Crosshair", rules: { groups: "HUD" } })
```

Both may open at the same time.

---

## `Core`

```ts
@App({ name: "FPSCounter", rules: { groups: "Core" } })
```

Never closed by rules.

---

# 🧪 Modern App Example (from your snippet)

```ts
@App({ name: "TestApp", visible: true, rules: { groups: "Core" } })
export default class TestApp extends Args {
 public render() {
  const { px } = this.props;

  return (
   <frame AnchorPoint={new Vector2(0.5, 1)}>
    UI Stuff…
   </frame>
  );
 }
}
```

---

# 🧠 Using AppForge from Flamework

```ts
import AppForge, { Render } from "@rbxts/app-forge";

@Controller()
export default class AppController implements OnInit {
 onInit() {
  const props = this.createProps(player);
  const forge = new AppForge();
  const root = createRoot(new Instance("Folder"));

  root.render(
   createPortal(
    <screengui ResetOnSpawn={false}>
     <Render {...{ props, forge, root, target: props.target }} />
    </screengui>,
    player.WaitForChild("PlayerGui"),
   ),
  );
 }
}
```

---

# 🧠 Using with Storybook/Setup

You can manually choose which apps render:

```tsx
<Render {...{ props, forge, target, name: "TestApp" }} />
```

or:

```tsx
<Render {...{ props, forge, target, names: ["HUD", "Shop"] }} />
```

---

# ❗ Best Practices

✔ Use `groups` for compatible UIs
✔ Use `blockedBy` to avoid interruptions
✔ Use `blocks` for mutual exclusion
✔ Use `exclusive` for fullscreen control
✔ Use `"Core"` for never-hidden persistent UI
✔ Avoid manually instantiating apps

---

# 🛠 Future Roadmap

* [ ] UI layering & depth priority

---

# ❤️ Contributing

PRs and suggestions welcome!

---

# 📄 License

MIT
