import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { nanoid } from "nanoid";
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

const CircuitsSortableItem = (props: { uid: string; value: string }) => {
    const {
        listeners,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.uid });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            key={"CIRCUIT_" + props.uid}
            className={clsx(
                "group px-1.5 py-1 flex items-center text-sm rounded data-[dragging=true]:z-10 data-[dragging=true]:bg-white data-[dragging=true]:shadow",
                isDragging && "cursor-grabbing"
            )}
            ref={setNodeRef}
            style={style}
            data-dragging={isDragging ? "true" : "false"}
        >
            <button
                className={clsx(
                    "p-1 rounded  hover:bg-gray-100",
                    "cursor-grab",
                    "group-data-[dragging=true]:bg-gray-100 group-data-[dragging=true]:cursor-grabbing"
                )}
                ref={setActivatorNodeRef}
                {...listeners}
            >
                <svg
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
            </button>
            <span onClick={(e) => e.stopPropagation()}>
                <CircuitTitleInput
                    value={props.value}
                    onChange={console.log}
                    isDragging={isDragging}
                />
            </span>
            <span
                className={clsx(
                    "flex-grow width-auto hover:cursor-grab",
                    "cursor-grab",
                    "group-data-[dragging=true]:cursor-grabbing"
                )}
                {...listeners}
            >
                &nbsp;
            </span>
        </li>
    );
};

export const CircuitMenu = () => {
    const [circuits, setCircuits] = useState([
        { value: "main", uid: nanoid() },
        { value: "ALU", uid: nanoid() },
        { value: "counter", uid: nanoid() },
        { value: nanoid(9), uid: nanoid() },
    ]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setCircuits((items) => {
                let oldIndex: number | undefined;
                let newIndex: number | undefined;
                circuits.forEach((circuit, index) => {
                    if (circuit.uid === active.id) {
                        oldIndex = index;
                    }
                    if (circuit.uid === over.id) {
                        newIndex = index;
                    }
                });

                if (oldIndex !== undefined && newIndex !== undefined) {
                    return arrayMove(items, oldIndex, newIndex);
                }
                return items;
            });
        }
    }

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
                    className="p-4 mt-1 bg-white rounded-md shadow-md min-w-[200px]"
                    sideOffset={5}
                >
                    <div className="flex flex-col">
                        <div className="px-2">
                            <h1 className="flex gap-3 items-center font-medium">
                                <span className="ml-0.5">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 512 512"
                                        width="1em"
                                        height="1em"
                                    >
                                        <path d="M480 192h-17.686C441.262 124.279 387.719 70.738 320 49.686V32c0-17.674-14.326-32-32-32h-64c-17.672 0-32 14.326-32 32v17.686C124.281 70.738 70.738 124.279 49.686 192H32c-17.674 0-32 14.328-32 32v64c0 17.674 14.326 32 32 32h17.686C70.738 387.721 124.281 441.262 192 462.314V480c0 17.674 14.328 32 32 32h64c17.674 0 32-14.326 32-32v-17.686C387.719 441.262 441.262 387.721 462.314 320H480c17.674 0 32-14.326 32-32v-64c0-17.672-14.326-32-32-32ZM240 48h32v32h-32V48ZM80 272H48v-32h32v32Zm192 192h-32v-32h32v32Zm139.475-144.914c-17.071 41.906-50.487 75.32-92.389 92.389C316.803 396.041 304.068 384 288 384h-64c-16.066 0-28.803 12.041-31.086 27.475-41.902-17.069-75.318-50.483-92.389-92.389C115.959 316.803 128 304.068 128 288v-64c0-16.066-12.041-28.803-27.475-31.086 17.071-41.908 50.487-75.32 92.389-92.389C195.197 115.959 207.934 128 224 128h64c16.068 0 28.803-12.041 31.086-27.475 41.902 17.069 75.318 50.481 92.389 92.389C396.041 195.197 384 207.934 384 224v64c0 16.068 12.041 28.803 27.475 31.086ZM464 272h-32v-32h32v32Z" />
                                    </svg>
                                </span>
                                <span>Circuits</span>
                            </h1>
                        </div>
                        <hr className="my-2" />
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
                                items={circuits.map((c) => c.uid)}
                                strategy={verticalListSortingStrategy}
                            >
                                <ul className="flex overflow-auto overflow-x-hidden flex-col max-h-48">
                                    {circuits.map((v) => (
                                        <CircuitsSortableItem
                                            key={v.uid}
                                            uid={v.uid}
                                            value={v.value}
                                        />
                                    ))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    </div>
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
