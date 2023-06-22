import { memo } from "react";
import { AddCircuit } from "./addCircuit";
import { CircuitsList } from "./circuitsList";

export const Circuits = memo(
    () => {
        return (
            <div>
                <CircuitsList />
                {/* <hr className="mt-1 mb-1" /> */}
                <AddCircuit />
            </div>
        );
    },
    () => {
        return true;
    }
);
Circuits.displayName = "Circuits";
