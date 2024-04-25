// const enqueueSnackbar: EnqueueSnackbar
// <"info">(message: SnackbarMessage, options?: OptionsObject<"info"> | undefined) => SnackbarKey (+1 overload)

import { SnackbarMessage, OptionsObject, SnackbarKey, useSnackbar } from "notistack";

const SNACKBAR_OPTIONS_DEFAULT = {
    variant: "info",
    anchorOrigin: {
        vertical: "bottom",
        horizontal: "right",
    },
} as const;
type Variant = "info" | "default" | "error" | "success" | "warning"
type SnackbarEnqueuer = <T extends SnackbarKey>(message: SnackbarMessage, options?: OptionsObject<Variant> | undefined) => T;
export function info(queuer: SnackbarEnqueuer, message: SnackbarMessage) {
    return alert(queuer,message, "info");
}
export function error(queuer: SnackbarEnqueuer, message: SnackbarMessage) {
    return alert(queuer,message, "error");
}
export function success(queuer: SnackbarEnqueuer, message: SnackbarMessage) {
    return alert(queuer,message, "success");
}

function alert(queuer: SnackbarEnqueuer, message: SnackbarMessage, variant: Variant="default") {
    const opts = { ...SNACKBAR_OPTIONS_DEFAULT, variant };
    // const { enqueueSnackbar:queuer } = useSnackbar();
    return queuer(message, opts as OptionsObject<Variant>);
}

export default alert;
const popup = {
    info,
    error,
    success
}
export { popup };