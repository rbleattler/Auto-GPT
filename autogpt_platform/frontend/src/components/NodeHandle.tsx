import { BlockIOSubSchema } from "@/lib/autogpt-server-api/types";
import { cn } from "@/lib/utils";
import { beautifyString, getTypeBgColor, getTypeTextColor } from "@/lib/utils";
import { FC, memo, useCallback } from "react";
import { Handle, Position } from "@xyflow/react";
import SchemaTooltip from "./SchemaTooltip";

type HandleProps = {
  keyName: string;
  schema: BlockIOSubSchema;
  isConnected: boolean;
  isRequired?: boolean;
  side: "left" | "right";
  title?: string;
  className?: string;
};

// Move the constant out of the component to avoid re-creation on every render.
const TYPE_NAME: Record<string, string> = {
  string: "text",
  number: "number",
  integer: "integer",
  boolean: "true/false",
  object: "object",
  array: "list",
  null: "null",
};

// Extract and memoize the Dot component so that it doesn't re-render unnecessarily.
const Dot: FC<{ isConnected: boolean; type?: string }> = memo(
  ({ isConnected, type }) => {
    const color = isConnected
      ? getTypeBgColor(type || "any")
      : "border-gray-300 dark:border-gray-600";
    return (
      <div
        className={`${color} m-1 h-4 w-4 rounded-full border-2 bg-white transition-colors duration-100 group-hover:bg-gray-300 dark:bg-slate-800 dark:group-hover:bg-gray-700`}
      />
    );
  },
);
Dot.displayName = "Dot";

const NodeHandle: FC<HandleProps> = ({
  keyName,
  schema,
  isConnected,
  isRequired,
  side,
  title,
  className,
}) => {
  const typeClass = `text-sm ${getTypeTextColor(schema.type || "any")} ${
    side === "left" ? "text-left" : "text-right"
  }`;

  const label = (
    <div className="flex flex-grow flex-row">
      <span
        className={cn(
          "text-m green flex items-end pr-2 text-gray-900 dark:text-gray-100",
          className,
        )}
      >
        {title || schema.title || beautifyString(keyName.toLowerCase())}
        {isRequired ? "*" : ""}
      </span>
      <span className={`${typeClass} flex items-end`}>
        ({TYPE_NAME[schema.type as keyof typeof TYPE_NAME] || "any"})
      </span>
    </div>
  );

  // Use a native HTML onContextMenu handler instead of wrapping a large node with a Radix ContextMenu trigger.
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      // Optionally, you can trigger a custom, lightweight context menu here.
    },
    [],
  );

  if (side === "left") {
    return (
      <div
        key={keyName}
        className="handle-container"
        onContextMenu={handleContextMenu}
      >
        <Handle
          type="target"
          data-testid={`input-handle-${keyName}`}
          position={Position.Left}
          id={keyName}
          className="group -ml-[38px]"
        >
          <div className="pointer-events-none flex items-center">
            <Dot isConnected={isConnected} type={schema.type} />
            {label}
          </div>
        </Handle>
        <SchemaTooltip description={schema.description} />
      </div>
    );
  } else {
    return (
      <div
        key={keyName}
        className="handle-container justify-end"
        onContextMenu={handleContextMenu}
      >
        <Handle
          type="source"
          data-testid={`output-handle-${keyName}`}
          position={Position.Right}
          id={keyName}
          className="group -mr-[38px]"
        >
          <div className="pointer-events-none flex items-center">
            {label}
            <Dot isConnected={isConnected} type={schema.type} />
          </div>
        </Handle>
      </div>
    );
  }
};

export default memo(NodeHandle);
