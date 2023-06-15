import { nanoid } from "nanoid";
import { useRef } from "react";

import clsx from "clsx";
import { addNewCircuitAtom, newCircuitTitleAtom } from "@/state/appState";
import { useAtom, useSetAtom } from "jotai";

export const AddCircuit = () => {
    const [newCircuitTitle, setNewCircuitTitle] = useAtom(newCircuitTitleAtom);
    const newCircuitTitleRef = useRef<HTMLInputElement>(null);
    const addCircuit = useSetAtom(addNewCircuitAtom);

    const focusTitleInput = () => {
        if (newCircuitTitleRef.current) {
            newCircuitTitleRef.current.focus();
        }
    };

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
            <li
                className={clsx(
                    "px-1.5 py-1 flex gap-2 items-center rounded group"
                )}
            >
                <button
                    onClick={handleAdd}
                    className="p-1 font-semibold rounded hover:bg-gray-100 focus:bg-gray-100"
                    title="Add circuit"
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
                            fillRule="evenodd"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </button>
                <input
                    ref={newCircuitTitleRef}
                    className={clsx(
                        `grow rounded px-2.5 py-1 truncate bg-inherit text-sm focus:bg-neutral-100`
                    )}
                    placeholder={"Circuit Name"}
                    value={newCircuitTitle}
                    style={{ maxWidth: 150 }}
                    onChange={(e) => setNewCircuitTitle(e.target.value)}
                    aria-label={"Name of the circuit"}
                    title={newCircuitTitle}
                    onKeyUp={(e) => {
                        if (e.key === "Enter") {
                            handleAdd();
                        }
                    }}
                />
                <button
                    className={clsx(
                        "p-1 rounded",
                        "opacity-0 group-focus-within:opacity-100"
                    )}
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
