import { HamburgerMenu } from "./hamburgerMenu";
import { MenuInput } from "./menuInput";
import { ElementConfig } from "./ElementConfig/elementConfig";
import { menuContainerId } from "@/constants/constants";

export const Menu = () => {
    return (
        <>
            <section
                id={menuContainerId}
                className="flex absolute top-0 left-0 gap-0.5 justify-center items-stretch py-1.5 px-1.5 m-1 bg-white rounded-br-lg border border-gray-300"
            >
                <HamburgerMenu />
                <MenuInput />
            </section>
            <ElementConfig />
        </>
    );
};
