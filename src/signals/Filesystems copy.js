import { signal, effect, computed } from "@preact/signals-react";
import { getHighlights } from "../utils/sql.js";

export const fsAccessRoot = signal(null);
export const databases = signal([]);
export const highlights = signal([]);
export const tags = signal({});

export const tagIncludeFilter = signal([]);
export const tagExcludeFilter = signal([]);
export const tagRequirementFilter = signal([]);


function getSubTags(tids) {
  function getOneTagSubtags(tid) {
    const tag = tags.value[tid];
    const tagEntries = Object.entries(tags.value);
    return tagEntries.filter(([_, subTagStr]) => {
      return subTagStr.startsWith(tag);
    }).map(([subTid, _]) => Number(subTid));
  }
  return tids.map(getOneTagSubtags);
}

export const filteredHighlights = computed(() => {
  const keepByInclude = (hl) => {
    let { tags: hlTags } = hl;
    hlTags = hlTags || [];
    if (tagIncludeFilter.value.length === 0) return true;
    return getSubTags(tagIncludeFilter.value).flat().some((tag) => hlTags.includes(tag));
  };
  const keepByExclude = (hl) => {
    let { tags: hlTags } = hl;
    hlTags = hlTags || [];
    if (tagExcludeFilter.value.length === 0) return true;
    return !getSubTags(tagExcludeFilter.value).flat().some((tag) => hlTags.includes(tag));
  };
  const keepByRequirement = (hl) => {
    let { tags: hlTags } = hl;
    hlTags = hlTags || [];
    if (tagRequirementFilter.value.length === 0) return true;
    return getSubTags(tagRequirementFilter.value).every((subTagSet) => subTagSet.some((subTag) => hlTags.includes(subTag)));
  }
  const keep = (hl) => keepByRequirement(hl) && keepByInclude(hl) && keepByExclude(hl);
  return highlights.value.filter(keep);
}
);
// make an effect to log filtered highlights
// effect(() => {
//   console.log("Filtered highlights", filteredHighlights.value);
// });
// effect(() => {
//   console.log("ForceInclude", tagIncludeFilter.value);
// });

// get a computed db that is just the first one in the list
export const dbHandle = computed(() => {
  const dbs = databases.value;
  if (dbs.length > 0) return dbs[0];
  return null;
});

effect(() => {
  changeDbs();
});
effect(() => {
  // console.log("Getting highlights");
  getHighlights(0, 7);
});

// effect(() => {
//     //log databases
//     console.log(databases.value);
// });

async function changeDbs() {
  if (!(fsAccessRoot.value instanceof FileSystemDirectoryHandle)) {
    databases.value = [];
    return;
  }
  const dbs = [];
  const ext = ".sqlite3";
  for await (const fileHandle of fsAccessRoot.value.values()) {
    if (fileHandle.kind === "file" && fileHandle.name.endsWith(ext)) {
      dbs.push(fileHandle);
    }
  }
  databases.value = dbs;
}
