import { signal, effect, computed } from "@preact/signals";
import OpfsDb, { TaguetteDb } from "../db";

export const opfsDb = signal(null);
export const signalReady = (s) => s.value !== null && s.value !== undefined;
// export const signalReady = (signal) => sdb && sdb.value !== null;
export const db = () => opfsDb.value;
export async function updateTagsForHighlight(highlight_id, toRemove, toAdd) {
  const db = opfsDb.value;
  if (opfsDb.value !== null) {
    await opfsDb.value.updateTagsForHighlight(
      highlight_id,
      [...toRemove],
      [...toAdd]
    );
  }
  await invalidateRam();
}
export async function updateTagPaths(updateEntries) {
  const db = opfsDb.value;
  if (opfsDb.value !== null) {
    await opfsDb.value.updateTagPaths(updateEntries);
  }
  await invalidateRam();
}
// export async function getHighlight(id) {
//   const db = opfsDb.value;
//   if (db === null) return null;
//   return db.getHighlight(id);
// }

async function opfs() {
  const name = "database.sqlite3";
  async function files() {
    const files = [];
    const opfsRoot = await navigator.storage.getDirectory();
    for await (const entry of opfsRoot.values()) {
      files.push(entry.name);
    }
    return files;
  }
  const filesList = await files();
  if (!filesList.includes(name)) {
    return null;
  }
  const db = new TaguetteDb(name);
  try {
    await db.open("database");
  } catch (e) {
    console.error(e);
    return null;
  }
  return db;
}
// opfs().then((db) => {
//   opfsDb.value = db;
// });
export async function loadOpfsDb() {
  const db = await opfs();
  opfsDb.value = db;
}
loadOpfsDb();
export async function clearOpfsDb() {
  const db = opfsDb.value;
  if (db === null) return;
  await db.close();
  opfsDb.value = null;
  await invalidateRam();
}

// effect(() => {
//   console.log("opfsDbReady", opfsDb.value !== null);
// });

// import { getHighlights } from "../utils/sql.js";

export const fsAccessRoot = signal(null);
export const databases = signal([]);
export const highlights = signal([]);
export async function reloadHighlights() {
  const db = opfsDb.value;
  if (db === null) {
    highlights.value = [];
    return;
  }
  highlights.value = await db.getHighlights();
  // await db.collection("tags");
}
effect(reloadHighlights); // do this when db changes

export const tags = signal({});
export async function reloadTags() {
  const db = opfsDb.value;
  if (db === null) {
    tags.value = {};
    return;
  }
  tags.value = await db.getTags();
}
effect(reloadTags); // do this when db changes
export async function invalidateRam() {
  await Promise.all([reloadTags(), reloadHighlights()]);
}

export const tagIncludeFilter = signal([]);
export const tagExcludeFilter = signal([]);
export const tagRequirementFilter = signal([]);

function getSubTags(tids) {
  function getOneTagSubtags(tid) {
    const tag = tags.value[tid];
    const tagEntries = Object.entries(tags.value);
    return tagEntries
      .filter(([_, subTagStr]) => {
        return subTagStr.startsWith(tag);
      })
      .map(([subTid, _]) => Number(subTid));
  }
  return tids.map(getOneTagSubtags);
}

export const filteredHighlights = computed(() => {
  const keepByInclude = (hl) => {
    let { tagIds: hlTags } = hl;
    hlTags = hlTags || [];
    if (tagIncludeFilter.value.length === 0) return true;
    return getSubTags(tagIncludeFilter.value)
      .flat()
      .some((tag) => hlTags.includes(tag));
  };
  const keepByExclude = (hl) => {
    let { tagIds: hlTags } = hl;
    hlTags = hlTags || [];
    if (tagExcludeFilter.value.length === 0) return true;
    return !getSubTags(tagExcludeFilter.value)
      .flat()
      .some((tag) => hlTags.includes(tag));
  };
  const keepByRequirement = (hl) => {
    let { tagIds: hlTags } = hl;
    hlTags = hlTags || [];
    if (tagRequirementFilter.value.length === 0) return true;
    return getSubTags(tagRequirementFilter.value).every((subTagSet) =>
      subTagSet.some((subTag) => hlTags.includes(subTag))
    );
  };
  const keep = (hl) =>
    keepByRequirement(hl) && keepByInclude(hl) && keepByExclude(hl);
  return highlights.value.filter(keep);
});
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
  // getHighlights(0, 7);
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
