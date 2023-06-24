import { ElementConfig } from "@/types";

export function validator<T extends keyof ElementConfig>({
    name,
    label,
    minValue,
    maxValue,
    value,
}: {
    name: T;
    label: string;
    minValue?: number;
    maxValue?: number;
    value: any;
}): { hasError: boolean; errors?: string[] } {
    function checkNumber() {
        return isNaN(+value) ? [`${label} must be a number`] : [];
    }
    function checkRequired() {
        return value === undefined || value === null
            ? [`${label} is required`]
            : [];
    }
    function checkMin() {
        return !isNaN(+value) && minValue && +value < minValue
            ? [`${label} must be greater than ${minValue}`]
            : [];
    }
    function checkMax() {
        return !isNaN(+value) && maxValue && +value > maxValue
            ? [`${label} must be less than ${maxValue}`]
            : [];
    }

    switch (name) {
        case "inputsCount":
        case "dataBits":
        case "scale":
        case "selectBits": {
            const errors = [
                ...checkRequired(),
                ...checkNumber(),
                ...checkMin(),
                ...checkMax(),
            ];
            return { hasError: errors.length > 0, errors };
        }
        default:
            return { hasError: false };
    }
}
