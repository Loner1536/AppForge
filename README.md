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
* **Built-in debug logger & performance tracing**
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
* owns the **debugger & logger** instance

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

---

### Opening & Closing Apps

```ts
forge.open("Inventory");
forge.close("Inventory");
forge.toggle("Inventory");
```

---

## 🧱 Defining an App

```ts
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

## 🐞 Debugging & Logging

AppForge includes a **built-in debugger** designed for Studio-only diagnostics.

### Debug Tags

Debug output is grouped by **typed tags**:

```ts
type DebugTag =
 | "render"
 | "rules"
 | "state"
 | "px"
 | "lifecycle";
```

Each subsystem logs under its respective tag.

---

### Enabling Debug Tags

```ts
forge.debug.enable("render");
forge.debug.enable("rules");
```

Enable everything at once:

```ts
forge.debug.enableAll();
```

Disable:

```ts
forge.debug.disable("render");
```

Debug logging only runs in **Roblox Studio**.

---

### Performance Tracing

Certain systems emit **timing logs** when enabled:

```ts
forge.debug.enable("render");
```

Output example:

```
[PERF][render][Inventory] 1.243ms
```

---

### Static Registration Logs

App registration (decorators) run **before a Forge exists**.

These use an internal **static logger** and will still emit warnings and errors during Studio load (e.g. duplicate app names).

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
 ├─ Debugger / Logger
 └─ Vide Mount
```

---

## ⚠️ Notes

* Apps are **singletons per Forge**
* Rendering twice will warn if px is re‑initialized
* Rules are enforced **reactively**
* Debug logging is **Studio-only**
* This package is currently **alpha** — APIs may change

---

## 🛣 Roadmap

* [ ] Transition animations API
* [ ] Async app loading
* [ ] Better dev warnings
* [ ] Debug inspector

---

## ⚛️ React Support (Planned)

AppForge is designed as a **renderer-agnostic App Manager**.

Currently:

* ✅ **Vide renderer** is production-ready
* 🚧 **React renderer** exists but is **very early / experimental**

Vide is the recommended and supported path today.

---

## 📜 License

MIT
