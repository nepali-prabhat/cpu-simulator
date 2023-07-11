import { Wire } from "@/types";
import { atomWithStorage } from "jotai/utils";

export const wiresAtom = atomWithStorage<{ [key: Wire["uid"]]: Wire }>(
    "wires",
    {}
);

