import { useEffect, useRef, useState } from "react";
import { PrimitiveAtom, useAtom, useSetAtom } from "jotai";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

import { selectedCircuitIdAtom } from "@/state/appState";
import { Circuit } from "@/types";

export const CircuitsSortableItem = ({
    circuitAtom,
}: {
    circuitAtom: PrimitiveAtom<Circuit>;
}) => {
    const [circuit, setCircuit] = useAtom(circuitAtom);
    const [selectedCircuitId, setSelectedCircuitId] = useAtom(
        selectedCircuitIdAtom
    );
    const {
        listeners,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: circuitAtom.toString() });

    const [editEnabled, setEditEnabled] = useState(false);

    const titleField = useRef<HTMLInputElement>(null);

    const handleSelect = () => setSelectedCircuitId(circuit.uid);

    useEffect(() => {
        if (editEnabled) {
            titleField.current?.focus();
        }
    }, [editEnabled]);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isSelected = selectedCircuitId === circuit.uid;

    return (
        <li
            key={"CIRCUIT_" + circuitAtom.toString()}
            className={clsx(
                "circuit-drag-item",
                "group px-1.5 py-1 flex gap-2 items-center rounded data-[dragging=true]:z-10 data-[dragging=true]:bg-white",

                "data-[dragging=true]:bg-gray-100",
                isDragging && "cursor-grabbing"
            )}
            ref={setNodeRef}
            style={style}
            data-dragging={isDragging ? "true" : "false"}
        >
            <button
                className={clsx(
                    "circuit-drag-handle",
                    "group/btn p-1 rounded focus:bg-gray-100 hover:bg-gray-100",
                    "cursor-grab",
                    "group-data-[dragging=true]:bg-gray-100 group-data-[dragging=true]:cursor-grabbing"
                )}
                ref={setActivatorNodeRef}
                {...listeners}
                title="Hold and drag"
                data-active={isSelected ? "true" : "false"}
            >
                <svg
                    className={clsx(
                        !isDragging && "handle",
                        !isDragging && "opacity-25 group-hover/btn:opacity-100"
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="none"
                >
                    <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M5.5 4.625a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Zm4 0a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25ZM10.625 7.5a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0ZM5.5 8.625a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Zm5.125 2.875a1.125 1.125 0 1 1-2.25 0 1.125 1.125 0 0 1 2.25 0ZM5.5 12.625a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
                        clipRule="evenodd"
                    />
                </svg>
                {!isDragging && (
                    <svg
                        className={clsx("eye")}
                        width="16"
                        height="16"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M7.5 9.125C8.39746 9.125 9.125 8.39746 9.125 7.5C9.125 6.60254 8.39746 5.875 7.5 5.875C6.60254 5.875 5.875 6.60254 5.875 7.5C5.875 8.39746 6.60254 9.125 7.5 9.125ZM7.5 10.125C8.94975 10.125 10.125 8.94975 10.125 7.5C10.125 6.05025 8.94975 4.875 7.5 4.875C6.05025 4.875 4.875 6.05025 4.875 7.5C4.875 8.94975 6.05025 10.125 7.5 10.125Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                )}
            </button>
            <span className="flex gap-2 grow">
                {editEnabled ? (
                    <>
                        <input
                            ref={titleField}
                            className={clsx(
                                `rounded px-2.5 py-1 truncate bg-inherit text-sm focus:bg-neutral-100`,
                                !isDragging && "hover:bg-neutral-100",
                                isDragging && "cursor-grabbing",
                                editEnabled && "bg-neutral-100"
                            )}
                            placeholder={"Circuit Name"}
                            value={circuit.title}
                            style={{ maxWidth: 150 }}
                            onChange={(e) => {
                                if (editEnabled) {
                                    const v = e.target.value;
                                    setCircuit((c) => ({
                                        ...c,
                                        title: v,
                                    }));
                                }
                            }}
                            aria-label={"Name of the circuit"}
                            title={circuit.title}
                            disabled={isDragging}
                            onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                    setEditEnabled(false);
                                }
                            }}
                        />
                        <button
                            className={clsx(
                                "p-1 rounded focus:bg-gray-100 group-hover:opacity-100",
                                "cursor-pointer group-data-[dragging=false]:hover:bg-gray-100 group-focus-within:opacity-100",
                                "group-data-[dragging=true]:cursor-grabbing"
                            )}
                            onClick={() => {
                                setEditEnabled(false);
                            }}
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className={clsx(
                                `text-start rounded px-2.5 py-1 truncate bg-inherit text-sm`
                            )}
                            onClick={() => {
                                handleSelect();
                                // setIsMenuOpen(false);
                            }}
                            style={{ width: 150 }}
                        >
                            {circuit.title}
                        </button>
                        <button
                            className={clsx(
                                "p-1 rounded focus:bg-gray-100 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                                "cursor-pointer group-data-[dragging=false]:hover:bg-gray-100",
                                "group-data-[dragging=true]:cursor-grabbing"
                            )}
                            onClick={() => {
                                setEditEnabled(true);
                            }}
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.491 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50905 13.0401 2.69697 12.9596L6.10847 11.4975C6.2254 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645ZM4.42166 9.28547L11.5 2.20711L12.7929 3.5L5.71455 10.5784L4.21924 11.2192L3.78081 10.7808L4.42166 9.28547Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </button>
                    </>
                )}
            </span>
        </li>
    );
};
