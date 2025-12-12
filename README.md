# AppForge — Vide/React App & Window Manager for roblox-ts

AppForge is a UI/app orchestration system for Vide/React in Roblox, enabling:

✔ Rule-based interactions
✔ Priority & layering
✔ App registration
✔ state control

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
 type GroupNames = "Main" | "Popups"
 type AppNames = "SideButtons" | "Inventory"
 type AppProps = {
  player: Player;
 }
 export {};
}
```

---

# 🚀 Initializing AppForge -- VIDE

```ts
import { Workspace, Players } from "@rbxts/services"

import { RenderVide, CreateVideForge } from "@rbxts/app-forge";
import { Players, Workspace } from "@rbxts/services";
import Vide from "@rbxts/vide";

const forge = new CreateVideForge();
const target = Players.LocalPlayer.WaitForChild("PlayerGui")

const props = {
 player: Players.LocalPlayer!,
} as const satisfies AppProps;

mount(() => {
 return (
  <screengui Name={"App"} ZIndexBehavior="Sibling" ResetOnSpawn={false}>
   <RenderVide {...{ props, forge }} />
  </screengui>
 );
}, target);
```

> `RenderVide` will contruct all decorated apps and dependencies for that decorated app.

---

# 🚀 Initializing AppForge -- VIDE

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

> `RenderReact` will contruct all decorated apps and dependencies for that decorated app.

---

# 🧱 Creating an App -- Vide

```ts
import { VideApp, VideArgs } from "@rbxts/app-forge";
import Vide from "@rbxts/vide";

@VideApp({
 name: "SideButtons",
 visible: true,
})
export default class SideButtons extends VideArgs {
 public render() {
  return <frame Size={UDim2.fromScale(1, 1)}></frame>;
 }
}
```

---

# 🧱 Creating an App -- React

```ts
import { ReactApp, ReactArgs } from "@rbxts/app-forge";
import React from "@rbxts/react";

@ReactApp({
 name: "SideButtons",
 visible: true,
})
export default class SideButtons extends ReactArgs {
 public render() {
  return <frame Size={UDim2.fromScale(1, 1)}></frame>;
 }
}
```

---

# 📦 Props & `VideArgs` Features

Inside a decorated App:

```ts
this.forge   // AppForge instance
this.name    // App Name
this.props   // AppProps
this.source    // Vide Source
```

Example:

```ts
const { px, forge } = this.props;
const scale2px = px.map((s) => s * 2);
```

---

# 📦 Props & `ReactArgs` Features

Inside a decorated App: -- Vide

```ts
this.forge   // AppForge instance
this.name    // App Name
this.props   // AppProps
this.bind    // React useBinding()
this.state   // React useState()
```

Example:

```ts
const { px, forge } = this.props;
const scale2px = px.map((s) => s * 2);
```

---

# 🕹 App Manager API -- Vide

```ts
forge.toggle("Inventory");
forge.bind("Shop", Vide.source(false));
const bind = forge.getSource("Inventory");
```

---

# 🕹 App Manager API -- React

```ts
forge.toggle("Inventory");
forge.set("Shop", true);
forge.set("HUD", false);
const bind = forge.getBind("Pause");
const bind = forge.getSource("Inventory");
```

---

# 📐 Using `getSource()` inside Vide

```tsx
return (
 <frame Visible={forge.getSource("Inventory")}>
  Items…
 </frame>
);
```

# 📐 Using `getBind()` inside Vide

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

| Rule      | Effect                                        |
| --------- | --------------------------------------------- |
| parent          | if parent is closed so is this app      |
| layer           | (Reserved – future rendering priority)  |
| exclusiveGroups | (Reserved – future rendering priority)  |

---

## `parent`

```ts
@App({ name: "ItemInfo", rules: { parent: "Inventory" } })
```

ItemInfo can only be true if Inventory's source/state is true.

---

# 🧠 Using AppForge from Flamework

```ts
import { RenderVide, CreateReactForge } from "@rbxts/app-forge";

@Controller()
export default class AppController implements OnInit {
 onInit() {
  const props = this.createProps(player);
  const forge = new CreateReactForge();
  const root = createRoot(new Instance("Folder"));

  root.render(
   createPortal(
    <screengui ResetOnSpawn={false}>
     <RenderVide {...{ props, forge, root, target: props.target }} />
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

or:

```tsx
<Render {...{ props, forge, target }} /> // Renders All
```

---

# 🛠 Future Roadmap

* [ ] UI layering & depth priority

---

# ❤️ Contributing

PRs and suggestions welcome!

---

# 📄 License

MIT
