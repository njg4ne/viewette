import { LoadingProvider } from "./contexts/LoadingContext";
import { TreeProvider } from "./contexts/TagTreeContext";
import TagTree from "./TagTree";

export default function TagTreeWithContext() {
  return (
    <LoadingProvider>
      <TreeProvider>
        <TagTree />
      </TreeProvider>
    </LoadingProvider>
  );
}
