import { useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CircuitTitleInput } from "./titleInput";

// React sortable
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    restrictToFirstScrollableAncestor,
    restrictToVerticalAxis,
    restrictToWindowEdges,
} from "@dnd-kit/modifiers";

import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import {
    addNewCircuitAtom,
    circuitsAtom,
    newCircuitTitleAtom,
    removeCircuitAtom,
    selectedCircuitIdAtom,
} from "@/state/appState";
import { PrimitiveAtom, useAtom, useSetAtom } from "jotai";
import { Circuit } from "@/types";
import { nanoid } from "nanoid";

const GuardedButton: React.FC<{
    className: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    duration?: number;
    guardClasses?: string;
    title?: string;
}> = ({ className, onClick, duration = 2000, guardClasses, ...props }) => {
    const [showingConfirmation, setShowingConfirmation] = useState(false);

    useEffect(() => {
        let id: any;
        if (showingConfirmation) {
            id = setTimeout(() => {
                setShowingConfirmation(false);
            }, duration);
        }
        return () => {
            id && clearTimeout(id);
        };
    }, [duration, showingConfirmation]);

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        if (showingConfirmation) {
            onClick(e);
        } else {
            setShowingConfirmation(true);
        }
    };
    return (
        <>
            <button
                className={clsx(
                    className,
                    showingConfirmation ? guardClasses : ""
                )}
                onClick={handleClick}
                {...props}
            >
                {showingConfirmation ? (
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                ) : (
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                )}
            </button>
        </>
    );
};

const CircuitsSortableItem = ({
    circuitAtom,
}: {
    circuitAtom: PrimitiveAtom<Circuit>;
}) => {
    const [circuit, setCircuit] = useAtom(circuitAtom);
    const [selectedCircuitId, setSelectedCircuitId] = useAtom(
        selectedCircuitIdAtom
    );
    const removeCircuit = useSetAtom(removeCircuitAtom);
    const {
        listeners,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: circuitAtom.toString() });

    const handleRemove = () => removeCircuit(circuit.uid);
    const handleSelect = () => setSelectedCircuitId(circuit.uid);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isSelected = selectedCircuitId === circuit.uid;
    const isTouched = false;

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
                    className={clsx(!isDragging && "handle")}
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
                    <>
                        <svg
                            className={clsx("eye")}
                            width="16"
                            height="16"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {isTouched ? (
                                <path
                                    d="M9.875 7.5C9.875 8.81168 8.81168 9.875 7.5 9.875C6.18832 9.875 5.125 8.81168 5.125 7.5C5.125 6.18832 6.18832 5.125 7.5 5.125C8.81168 5.125 9.875 6.18832 9.875 7.5Z"
                                    fill="currentColor"
                                ></path>
                            ) : (
                                <path
                                    d="M7.5 9.125C8.39746 9.125 9.125 8.39746 9.125 7.5C9.125 6.60254 8.39746 5.875 7.5 5.875C6.60254 5.875 5.875 6.60254 5.875 7.5C5.875 8.39746 6.60254 9.125 7.5 9.125ZM7.5 10.125C8.94975 10.125 10.125 8.94975 10.125 7.5C10.125 6.05025 8.94975 4.875 7.5 4.875C6.05025 4.875 4.875 6.05025 4.875 7.5C4.875 8.94975 6.05025 10.125 7.5 10.125Z"
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                ></path>
                            )}
                        </svg>
                    </>
                )}
            </button>
            <span className="grow">
                <CircuitTitleInput
                    value={circuit.title}
                    onChange={(v) => {
                        setCircuit((c) => ({
                            ...c,
                            title: v,
                        }));
                    }}
                    placeholder={"Circuit Name"}
                    isDragging={isDragging}
                    disableAutoResize={true}
                />
            </span>
            <GuardedButton
                className={clsx(
                    "p-1 rounded",
                    "opacity-0 group-hover:opacity-100 focus:opacity-100",
                    "cursor-pointer group-data-[dragging=false]:hover:bg-red-100",
                    "group-data-[dragging=true]:cursor-grabbing"
                )}
                guardClasses={clsx("bg-red-100")}
                onClick={handleRemove}
                aria-label="Delete circuit"
                title="Delete circuit"
            />
            <Popover.Close
                className={clsx(
                    "p-1 rounded focus:bg-gray-100 ",
                    "group/btn cursor-pointer group-data-[dragging=false]:hover:bg-gray-100",
                    "group-data-[dragging=true]:cursor-grabbing"
                )}
                onClick={() => {
                    handleSelect();
                }}
                title="Go to circuit"
                aria-label="Select circuit"
            >
                <svg
                    className={clsx(
                        "transition duration-200 ease-in-out",
                        "group-hover/btn:translate-x-[1px] group-focus/btn:translate-x-[1px] "
                    )}
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z"
                        fill="currentColor"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                    ></path>
                </svg>
            </Popover.Close>
        </li>
    );
};

const CircuitsList = () => {
    const [circuits, setCircuits] = useAtom(circuitsAtom);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (overId && activeId !== overId) {
            setCircuits((prevCircuits) => {
                let oldIndex: number | undefined;
                let newIndex: number | undefined;
                prevCircuits.forEach((circuit, index) => {
                    if (circuit.toString() === activeId) {
                        oldIndex = index;
                    }
                    if (circuit.toString() === overId) {
                        newIndex = index;
                    }
                });

                if (oldIndex !== undefined && newIndex !== undefined) {
                    return arrayMove(prevCircuits, oldIndex, newIndex);
                }
                return prevCircuits;
            });
        }
    }

    if (circuits.length === 0) {
        return (
            <div className="flex flex-col gap-2 justify-center items-center py-2 px-2">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                    width="1em"
                    height="1em"
                >
                    <path
                        d="M32 224c-17.672 0-32 14.312-32 32s14.328 32 32 32h131.225c-2.1-10.344-3.225-21.039-3.225-32s1.125-21.656 3.225-32H32Zm576 0H476.775c2.1 10.344 3.225 21.039 3.225 32s-1.125 21.656-3.225 32H608c17.672 0 32-14.312 32-32s-14.328-32-32-32Z"
                        style={{
                            opacity: 0.4,
                        }}
                    />
                    <path
                        d="M320 96c-88.365 0-160 71.633-160 160s71.635 160 160 160 160-71.633 160-160S408.365 96 320 96Zm0 240c-44.111 0-80-35.887-80-80s35.889-80 80-80 80 35.887 80 80-35.889 80-80 80Z"
                        className="fa-primary"
                    />
                </svg>
            </div>
        );
    }

    return (
        <ul className="flex overflow-auto overflow-x-hidden flex-col max-h-48">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[
                    restrictToVerticalAxis,
                    restrictToWindowEdges,
                    restrictToFirstScrollableAncestor,
                ]}
            >
                <SortableContext
                    items={circuits.map((c) => c.toString())}
                    strategy={verticalListSortingStrategy}
                >
                    {circuits.map((v) => (
                        <CircuitsSortableItem
                            key={`CIRCUIT_LIST_${v}`}
                            circuitAtom={v}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </ul>
    );
};

const AddCircuit = () => {
    const [newCircuitTitle, setNewCircuitTitle] = useAtom(newCircuitTitleAtom);
    const newCircuitTitleRef = useRef<HTMLInputElement>(null);
    const addCircuit = useSetAtom(addNewCircuitAtom);

    const focusTitleInput = () => {
        if (newCircuitTitleRef.current) {
            newCircuitTitleRef.current.focus();
        }
    };

    useEffect(() => {
        focusTitleInput();
    }, []);

    const handleAdd = () => {
        if (!newCircuitTitle.trim()) {
            focusTitleInput();
        } else {
            const uid = nanoid();
            addCircuit({ uid, title: newCircuitTitle });
            setNewCircuitTitle("");
        }
    };
    return (
        <>
            <li className={clsx("px-1.5 py-1 flex gap-2 items-center rounded")}>
                <button
                    onClick={focusTitleInput}
                    className="p-1 font-semibold rounded hover:bg-gray-100 focus:bg-gray-100"
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
                            fill="currentColor"
                        ></path>
                    </svg>
                </button>
                <span className="grow">
                    <CircuitTitleInput
                        value={newCircuitTitle}
                        onChange={setNewCircuitTitle}
                        placeholder={"circuit name"}
                        onSubmit={handleAdd}
                        ref={newCircuitTitleRef}
                        disableAutoResize={true}
                    />
                </span>
                <button
                    className={clsx("p-1 rounded hover:bg-green-100")}
                    onClick={handleAdd}
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
            </li>
        </>
    );
};

const MenuHeader = () => {
    return (
        <div className="px-2">
            <h1 className="flex gap-5 items-center font-medium">
                <div className="ml-0.5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                        width="1em"
                        height="1em"
                    >
                        <path d="M368 320h-96c-26.51 0-48 21.49-48 48v96c0 26.51 21.49 48 48 48h96c26.51 0 48-21.49 48-48v-96c0-26.51-21.49-48-48-48Zm0 144h-96v-96h96v96ZM591.832 0h-96c-26.51 0-48 21.49-48 48v96c0 26.51 21.49 48 48 48h96c26.51 0 48-21.49 48-48V48c0-26.51-21.49-48-48-48Zm0 144h-96V48h96v96ZM392 72H192V48c0-26.51-21.49-48-48-48H48C21.49 0 0 21.49 0 48v96c0 26.51 21.49 48 48 48h90.066l57.09 99.906c4.438 7.75 12.532 12.094 20.875 12.094 4.032 0 8.125-1.031 11.875-3.156 11.5-6.594 15.5-21.25 8.938-32.75l-54.537-95.442C188.314 164.637 192 154.787 192 144v-24h200c13.25 0 24-10.75 24-24s-10.75-24-24-24Zm-248 72H48V48h96v96Z" />
                    </svg>
                </div>
                <div>Logics</div>
            </h1>
        </div>
    );
};

const CircuitMenuPopup = () => {
    return (
        <div className="flex flex-col">
            <MenuHeader />
            <hr className="mt-2" />
            <CircuitsList />
            <hr className="mb-1" />
            <AddCircuit />
        </div>
    );
};

export const CircuitMenu = () => {
    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    aria-label="Open circuits list"
                    className="group p-2.5 ml-0.5 rounded-lg hover:bg-gray-100 focus:bg-gray-100 data-[state=open]:bg-gray-100 circuits-menu-trigger outline-2"
                >
                    <svg
                        className="group-hover:translate-y-0.5 group-data-[state=open]:translate-y-0.5 transition duration-200 ease-in-out"
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={clsx(
                        "px-4 py-6 ml-2 mt-1.5 bg-white rounded-lg shadow-md border border-gray-300",
                        // "ring ring-purple-300"
                        // "min-w-[200px]"
                    )}
                    sideOffset={5}
                >
                    <CircuitMenuPopup />
                    <Popover.Close
                        aria-label="Close circuits list"
                        hidden={true}
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                            ></path>
                        </svg>
                    </Popover.Close>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
