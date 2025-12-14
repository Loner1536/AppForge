# AppForge

> ⚠️ **Documentation Notice**
>
> This README was written with the assistance of **AI tooling**.
> I do not currently have the time to write a fully hand-crafted documentation site, so there may be typos, rough wording, or missing explanations.
>
> If you find an issue, inconsistency, or bug in the docs or API, please **@ me on Discord** in the **roblox-ts Discord**: `@loner71x`.
>
> Thank you for your patience ❤️

> **An App Manager for Vide**

AppForge is a **declarative UI application manager** built on top of [Vide](https://github.com/centau/vide) for **roblox-ts**. It provides a structured way to register, mount, show/hide, group, and coordinate UI "apps" using rules instead of ad‑hoc state wiring.

If you’ve ever ended up with tangled UI state, duplicated visibility logic, or brittle parent/child UI dependencies — AppForge is meant to solve that without forcing you into complex patterns.

---

## ✨ Features

* **App-based UI architecture**
* **Centralized visibility state** per app
* **Rule system** (parent/child, exclusive groups, z-index)
* **Render groups** for selective mounting
* **px scaling** built-in via `loners-pretty-vide-utils`
* **Vide context integration**
* **Story / sandbox rendering**
* Fully typed with **roblox-ts**

---

## 📦 Installation

### Using **bun**

```bash
bun add @rbxts/app-forge
```

Peer dependencies (choose one renderer):

```bash
bun add @rbxts/vide
# or
bun add @rbxts/react
```

---

### Using **npm**

```bash
npm install @rbxts/app-forge
```

Peer dependencies (choose one renderer):

```bash
npm install @rbxts/vide
# or
npm install @rbxts/react
```

---

## 🧠 Core Concepts

### App

An **App** is a self-contained UI unit:

* owns its own visibility source
* renders a Vide tree
* can depend on other apps via rules

Apps are registered using a decorator and rendered through `AppForge`.

---

### Forge

`AppForge` is the runtime manager. It:

* owns all app visibility sources
* mounts and unmounts UI
* enforces rules
* exposes imperative helpers (`open`, `close`, `toggle`)

You usually create **one Forge per UI root**.

---

### Rules

Rules define **relationships between apps**, not layout.

Currently supported:

| Rule             | Description                            |
| ---------------- | -------------------------------------- |
| `parent`         | Child app closes when parent closes    |
| `detach`         | Prevents automatic anchoring to parent |
| `exclusiveGroup` | Only one app in the group may be open  |
| `index`          | Sets ZIndex of the app container       |

Rules are enforced automatically whenever visibility changes.

---

### Render Groups

Render groups let you **selectively mount apps**.

Example use cases:

* Lobby UI vs In‑Game UI
* HUD vs Menus
* Feature‑flagged UI

---

## 🧩 Basic Usage

### Creating a Forge

```ts
const forge = new CreateVideForge();
```

> `CreateVideForge` owns its internal state. You **do not pass the forge into itself** — it is only provided to Apps at render-time.

---

### Mounting (Game Runtime)

AppForge is mounted once from application bootstrap code (commonly a Flamework controller).

```ts
const forge = new CreateVideForge();

forge.mount(
 () => (
  <screengui
   Name="App"
   ZIndexBehavior="Sibling"
   ResetOnSpawn={false}
  />
 ),
 props,
 Players.LocalPlayer.WaitForChild("PlayerGui"),
);
```

Notes:

* `forge` is **implicitly available** to Apps
* `props` are user-defined and become `this.props` inside Apps
* visibility & rules are controlled entirely by the Forge

---

### Mounting (Game Runtime)

AppForge is typically mounted from a **controller** (e.g. Flamework) and targets `PlayerGui`.

```ts
const forge = new CreateVideForge();

forge.mount(
 () => (
  <screengui
   Name="App"
   ZIndexBehavior="Sibling"
   ResetOnSpawn={false}
  />
 ),
 props,
 Players.LocalPlayer.WaitForChild("PlayerGui"),
);
```

This:

* creates a single root `ScreenGui`
* mounts all rendered apps under it
* keeps AppForge in control of visibility & rules

---

### Mounting

```ts
forge.mount(
 () => <screengui ResetOnSpawn={false} />,
 props,
 playerGui,
);
```

---

### Opening & Closing Apps

```ts
forge.open("Inventory");
forge.close("Inventory");
forge.toggle("Inventory");
```

You can also access the reactive source directly:

```ts
const visible = forge.getSource("Inventory");
```

---

## 🧱 Defining an App

```ts
import { VideApp, VideArgs } from "@rbxts/app-forge";
import Vide from "@rbxts/vide";

@VideApp({
 name: "Inventory",
 renderGroup: "Lobby",
 visible: false,
 rules: {
  index: 2,
 },
})
export class Inventory extends VideArgs {
 render() {
  const { px } = this.props;

  return (
   <frame
    BackgroundColor3={Color3.fromRGB(100, 100, 100)}
    Size={() => UDim2.fromOffset(px(500), px(500))}
   />
  );
 }
}
```

---

## 🔗 Parent / Child Apps

```ts
@VideApp({
 name: "InventoryInfo",
 renderGroup: "Lobby",
 rules: {
  parent: "Inventory",
 },
})
export class InventoryInfo extends VideArgs {
 render() {
  return <frame />;
 }
}
```

Behavior:

* When `Inventory` closes → `InventoryInfo` closes
* Child is **anchored** to parent unless `detach: true`

```ts
rules: {
 parent: "Inventory",
 detach: true,
}
```

---

## 🚦 Exclusive Groups

```ts
@VideApp({
 name: "Settings",
 rules: {
  exclusiveGroup: "Menus",
 },
})
```

Only one app in the same `exclusiveGroup` may be open at a time.

---

## 🎭 Render Control

AppForge supports **multiple render selection modes**. You can render by:

* a single app name
* multiple app names
* one or more render groups
* combinations of `group + name(s)`

All render options are passed via `VideRenderProps`.

---

### Render a single app

```ts
render: { name: "Inventory" }
```

---

### Render multiple apps

```ts
render: { names: ["Inventory", "InventoryInfo"] }
```

---

### Render by group

```ts
render: { group: "Lobby" }
```

---

### Render by group + name

```ts
render: {
 group: "Lobby",
 name: "Inventory",
}
```

Only renders `Inventory` **if** it belongs to the `Lobby` group.

---

### Render by group + names

```ts
render: {
 group: "Lobby",
 names: ["Inventory", "Settings"],
}
```

Only renders apps that:

* are in the specified group(s)
* and whose names match the provided list

---

## 🧪 Story / Sandbox Rendering

AppForge provides `forge.story` for **isolated rendering**, commonly used with **UI Labs**.

```ts
const forge = new CreateVideForge();

return forge.story({
 props,
 config: {
  px: {
   target: storyProps.target,
  },
 },
 render: { group: "Lobby" },
});
```

This is ideal for:

* component stories
* previews
* controlled visibility via bindings

---

## 🧠 Context Access Inside Apps

App props are provided via Vide context.

```ts
import { Provider } from "@rbxts/vide";
import { VideContexts } from "@rbxts/app-forge";

<Provider context={VideContexts.App} value={this.props}>
 {() => <Child />}
</Provider>
```

Or via hook:

````ts
```ts
import { useVideAppContext } from "@rbxts/app-forge";

const app = useVideAppContext();
````

---

## 🧱 Architecture Overview

```
AppForge
 ├─ AppRegistry (static)
 ├─ Visibility Sources
 ├─ Render Manager
 ├─ Rule Engine
 │   ├─ Parent Rule
 │   └─ Exclusive Group Rule
 └─ Vide Mount
```

---

## ⚠️ Notes

* Apps are **singletons per Forge**
* Rendering twice will warn if px is re‑initialized
* Rules are enforced **reactively**
* This package is currently **alpha** — APIs may change

---

## 🛣 Roadmap

* [ ] Transition animations API
* [ ] Async app loading
* [ ] Better dev warnings
* [ ] Debug inspector

---

## ⚛️ React Support (Planned)

AppForge is designed as a **renderer-agnostic App Manager**.b

Currently:

* ✅ **Vide renderer** is production-ready
* 🚧 **React renderer** exists but is **very early / experimental**

React support is intentionally paused while the Vide API stabilizes. The author is still learning React, and decided to refocus on Vide first. React will be revisited once the core architecture is fully locked in.

Public surface (subject to change):

```ts
import { ReactApp, ReactArgs, CreateReactForge } from "@rbxts/app-forge";
```

**Vide is the recommended and supported path today.**

---

## 📜 License

MIT

---
