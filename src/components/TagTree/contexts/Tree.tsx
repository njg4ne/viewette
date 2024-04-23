import { StateUpdater } from "preact/hooks";
import { useState, createContext, useContext, useRef } from "react";

const defaults = {
    expandedItems: [] as string[],
    setExpandedItems: {} as StateUpdater<string[]>,
    selectedItems: [] as string[],
    setSelectedItems: {} as StateUpdater<string[]>,
    createTagValue: "" as string,
    setCreateTagValue: {} as StateUpdater<string>,
    createTagFieldRef: {} as React.RefObject<HTMLElement>,

}
export const TreeContext = createContext(defaults);

export function TreeProvider({ children }: { children: React.ReactNode }) {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [createTagValue, setCreateTagValue] = useState<string>("");
    const createTagFieldRef = useRef<HTMLElement>(null);
    return (
        <TreeContext.Provider value={{ expandedItems, setExpandedItems, selectedItems, setSelectedItems, createTagValue, setCreateTagValue, createTagFieldRef }}>
            {children}
        </TreeContext.Provider>
    );
}

export function useTreeContext() {
    const context = useContext(TreeContext);
    if (context === undefined) {
        throw new Error('useTree must be used within a TreeProvider');
    }
    return context;
}