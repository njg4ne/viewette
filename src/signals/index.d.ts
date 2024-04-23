import { Signal } from "@preact/signals";


export const tags: Signal<Record<string, string>>;
export const tagIncludeFilter: Signal<number[]>;
export const tagExcludeFilter: Signal<number[]>;
export const tagRequirementFilter: Signal<number[]>;
export const opfsDb: Signal<TaguetteDb>;