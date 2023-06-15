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
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    restrictToFirstScrollableAncestor,
    restrictToVerticalAxis,
    restrictToWindowEdges,
} from "@dnd-kit/modifiers";

import { circuitsAtom } from "@/state/appState";
import { useAtom } from "jotai";
import { CircuitsSortableItem } from "./circuitsListItem";

export const CircuitsList = () => {
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
            <div className="flex flex-col gap-2 justify-center items-center py-2.5 px-2">
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
