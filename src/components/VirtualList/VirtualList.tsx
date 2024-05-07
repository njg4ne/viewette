import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import { Virtuoso } from "react-virtuoso";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
} from "preact/hooks";

import { useVirtualizer } from "@tanstack/react-virtual";

export default TanStackInfiniteVirtual;

export function TanStackInfiniteVirtual<T extends JSX.Element>({
  // children,
  totalCount,
  itemContent,
}: {
  // children: T[];
  totalCount: number;
  itemContent: (index: number) => T;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const GAP = 6;
  // const rows = children;
  const virtualizer = useVirtualizer({
    count: totalCount,
    estimateSize: () => 25,
    getScrollElement: () => parentRef.current,
    overscan: 5,

    measureElement: (element) => element.getBoundingClientRect().height + GAP,
  });
  // virtualizer.scrollToIndex(index);
  return (
    <AutoSizer>
      {({ height: asH, width: asW }) => (
        <div
          ref={parentRef}
          style={{
            // maxHeight: "100%"
            height: asH,
            width: asW,
            overflow: "auto", // Make it scroll!
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
            className="App"
          >
            {virtualizer.getVirtualItems().map((virtualRow, i) => {
              return (
                <div style={{}}>
                  <div
                    data-index={virtualRow.index}
                    key={virtualRow.index}
                    style={{
                      position: "absolute", // 🔑
                      transform: `translateY(${virtualRow.start}px)`, // 🔑
                      width: `calc(100% - ${GAP * 2}px)`, // 🔑
                      margin: `0 ${GAP}px`, // 🔑
                      // borderRadius: ".5rem",
                      // padding: "1rem",
                      // background: "rgba(255, 255, 255, 0.15)",
                    }}
                    ref={(node) => virtualizer.measureElement(node)}
                  >
                    {itemContent(virtualRow.index)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AutoSizer>
  );
}

export function VirtuosoSimpleLimitedVirtual<T extends JSX.Element>({
  children,
}: {
  children: T[];
}) {
  function RenderItem(index: number) {
    return children[index];
    // const height = (i: number) => `${i % 2 === 0 ? 10 : 15}rem`;
    // const content = `Item ${index + 1}`;
    // const sx = {
    //   minHeight: height(index),
    //   p: 1,
    //   px: 4,
    //   bgcolor: "aqua",
    //   borderRadius: ".5rem",
    //   padding: "1rem",
    //   margin: "1rem",
    //   background: "rgba(255, 255, 255, 0.15)",
    // };
    // return <Box sx={{ ...sx }}>{content}</Box>;
  }
  return <Virtuoso totalCount={children.length} itemContent={RenderItem} />;
}
