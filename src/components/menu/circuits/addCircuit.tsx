import { nanoid } from "nanoid";
import { useRef } from "react";

import { addNewCircuitAtom, newCircuitTitleAtom } from "@/state/appState";
import { useAtom, useSetAtom } from "jotai";
import { twMerge } from "tailwind-merge";
import { flushSync } from "react-dom";
import { circuitsMenuListId, getCircuitsElementId } from "@/constants";

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
            setNewCircuitTitle("");
            flushSync(() => {
                addCircuit({ uid, title: newCircuitTitle });
            });
            const parentElement = document.getElementById(circuitsMenuListId);
            if (
                parentElement &&
                parentElement.scrollHeight > parentElement.clientHeight
            ) {
                const childElementId = getCircuitsElementId(uid);
                const childElement = document.getElementById(childElementId);
                childElement?.scrollIntoView();
            }
        }
    };

    return (
        <>
            <li
                className={twMerge(
                    "px-1.5 py-1 flex gap-2 items-center rounded group"
                )}
            >
                <button
                    onClick={handleAdd}
                    className={twMerge(
                        "p-2 font-semibold rounded",
                        "hover:bg-gray-100 focus:bg-gray-100"
                    )}
                    title="Add circuit"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        width="1em"
                        height="1em"
                    >
                        <path d="M432 256c0 13.25-10.75 24-24 24H248v160c0 13.25-10.75 24-24 24s-24-10.75-24-24V280H40c-13.25 0-24-10.75-24-24s10.75-24 24-24h160V72c0-13.25 10.75-24 24-24s24 10.75 24 24v160h160c13.25 0 24 10.75 24 24Z" />
                    </svg>
                </button>
                <input
                    ref={newCircuitTitleRef}
                    className={twMerge(
                        `grow rounded px-2.5 py-1 truncate bg-inherit hover:bg-gray-100 focus:bg-gray-100`
                    )}
                    placeholder={"Circuit name"}
                    value={newCircuitTitle}
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
                    className={twMerge(
                        "p-2 rounded",
                        "opacity-0",
                        "focus:bg-gray-100 group-focus-within:opacity-100 hover:bg-gray-100 ",
                        newCircuitTitle && "group-hover:opacity-100 "
                    )}
                    onClick={handleAdd}
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
            </li>
        </>
    );
};
