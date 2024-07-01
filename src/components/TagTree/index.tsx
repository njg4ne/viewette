// import { DndContext } from "@dnd-kit/core";
import { LoadingProvider } from "../../contexts/LoadingContext";
import { SearchParamProvider } from "../../contexts/SearchParamContext";
import { TreeProvider } from "../../contexts/TagTreeContext";
import TagTree from "./TagTree";
import TagTree2 from "./TagTree2";

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

// export default TagTree2;
