import { useState } from "preact/compat";

export default function useHover() {
  const [hovering, setHovering] = useState<boolean>(false);
  const onHoverProps = {
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
  };
  return [hovering, onHoverProps] as const;
}
