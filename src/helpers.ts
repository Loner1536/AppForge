// Types
import Types from "./types";

export function Render(props: Types.NameProps & Types.MainProps) {
    const names = props.names;
    const name = props.name;

    const forge = props.forge;

    if (name) {
        return forge.renderApp(props);
    } else if (names) {
        return forge.renderApps(props);
    }
    return forge.renderAll(props);
}
