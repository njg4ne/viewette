import { LoadingProvider } from "./contexts/Loading";
import { TreeProvider } from "./contexts/Tree";
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