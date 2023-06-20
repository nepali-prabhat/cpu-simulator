import { HamburgerMenu } from "./hamburgerMenu";
import { MenuInput } from "./menuInput";

export const Menu = () => {
    return (
        <section className="flex absolute top-0 left-0 gap-0.5 justify-center items-stretch py-1.5 px-1.5 m-1 bg-white rounded-br-lg border border-gray-300">
            <HamburgerMenu />
            <MenuInput />
        </section>
    );
};
