import { AddCircuit } from "./addCircuit";
import { CircuitsList } from "./circuitsList";

export const Circuits = () => {
    return (
        <div>
            <CircuitsList />
            <hr className="mt-1 mb-1" />
            <AddCircuit />
        </div>
    );
};
