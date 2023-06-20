import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

import { selectedCircuitIdAtom } from "@/state/appState";
import { Circuit } from "@/types";
import { twMerge } from "tailwind-merge";
import { getCircuitsElementId } from "@/constants";
import { activePaletteTabAtom } from "@/state/ui";

export const CircuitsSortableItem = ({
    circuitAtom,
}: {
    circuitAtom: PrimitiveAtom<Circuit>;
}) => {
    const activeTab = useAtomValue(activePaletteTabAtom);
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
    const listRef = useRef<HTMLElement | null>(null);

    const handleSelect = () => setSelectedCircuitId(circuit.uid);

    useEffect(() => {
        if (editEnabled) {
            titleField.current?.focus();
        }
    }, [editEnabled]);

    const isSelected = selectedCircuitId === circuit.uid;

    useLayoutEffect(() => {
        if (isSelected && activeTab === "circuit") {
            listRef.current?.scrollIntoView({
                behavior: "instant",
                block:"center",
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            key={"CIRCUIT_" + circuit.uid}
            id={getCircuitsElementId(circuit.uid)}
            className={twMerge(
                "circuit-drag-item",
                "group px-1.5 py-1 flex gap-2 items-center rounded data-[dragging=true]:z-10",

                "data-[dragging=true]:bg-gray-100",
                isDragging && "cursor-grabbing"
            )}
            ref={(r) => {
                setNodeRef(r);
                listRef.current = r;
            }}
            style={style}
            data-dragging={isDragging ? "true" : "false"}
        >
            <button
                className={clsx(
                    "circuit-drag-handle",
                    "group/btn p-2 rounded focus:bg-gray-100 hover:bg-gray-100",
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
                    viewBox="0 0 15 15"
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
                        width="1em"
                        height="1em"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle
                            cx={7.5}
                            cy={7.5}
                            r={3}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.25}
                        />
                    </svg>
                )}
            </button>
            {editEnabled ? (
                <>
                    <input
                        ref={titleField}
                        className={clsx(
                            `grow rounded px-2.5 py-1 truncate bg-inherit text-md focus:bg-neutral-100`,
                            !isDragging && "hover:bg-neutral-100",
                            isDragging && "cursor-grabbing",
                            editEnabled && "bg-neutral-100"
                        )}
                        placeholder={"Circuit Name"}
                        value={circuit.title}
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
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                setEditEnabled(false);
                                e.stopPropagation();
                            }
                        }}
                        onKeyUp={(e) => {
                            if (e.key === "Enter") {
                                setEditEnabled(false);
                            }
                        }}
                    />
                    <button
                        className={clsx(
                            "p-2 rounded focus:bg-gray-100 group-hover:opacity-100",
                            "cursor-pointer group-data-[dragging=false]:hover:bg-gray-100 group-focus-within:opacity-100",
                            "group-data-[dragging=true]:cursor-grabbing"
                        )}
                        onClick={() => {
                            setEditEnabled(false);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="1em"
                            height="1em"
                        >
                            <path d="m480.969 128.969-272 272A23.9 23.9 0 0 1 192 408a23.9 23.9 0 0 1-16.969-7.031l-144-144c-9.375-9.375-9.375-24.563 0-33.938s24.563-9.375 33.938 0L192 350.062 447.031 95.031c9.375-9.375 24.563-9.375 33.938 0s9.375 24.563 0 33.938Z" />
                        </svg>
                    </button>
                </>
            ) : (
                <>
                    <button
                        className={clsx(
                            `grow text-start rounded px-2.5 py-1 truncate bg-inherit text-md`
                        )}
                        onClick={() => {
                            handleSelect();
                        }}
                        onDoubleClick={() => {
                            setEditEnabled(true);
                        }}
                        style={{ width: 150 }}
                        title={circuit.title}
                    >
                        {circuit.title}
                    </button>
                    <button
                        className={clsx(
                            "p-2 rounded focus:bg-gray-100 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                            "cursor-pointer group-data-[dragging=false]:hover:bg-gray-100",
                            "group-data-[dragging=true]:cursor-grabbing"
                        )}
                        onClick={() => {
                            setEditEnabled(true);
                        }}
                    >
                        <svg
                            width="1em"
                            height="1em"
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
        </li>
    );
};
