// import { DndContext } from "@dnd-kit/core";
import { LoadingProvider } from "../../contexts/LoadingContext";
import { SearchParamProvider } from "../../contexts/SearchParamContext";
import { TreeProvider } from "../../contexts/TagTreeContext";
import TagTree from "./TagTree";

export default function TagTreeWithContext() {
  return (
    // <LoadingProvider>
    <SearchParamProvider keys={["tagLike", "newTag"]}>
      <TreeProvider>
        
          <TagTree />
      </TreeProvider>
    </SearchParamProvider>
    // </LoadingProvider>
  );
}
