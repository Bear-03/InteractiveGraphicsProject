//import * as THREE from "three";
import { BooleanController, ColorController, GUI, NumberController } from "three/addons/libs/lil-gui.module.min.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

type OptionType = number | boolean;

type ControllerType<T extends OptionType> =
    T extends number ? NumberController<MenuOption<T>, "value"> | ColorController<MenuOption<T>, "value"> :
    T extends boolean ? BooleanController<MenuOption<T>, "value"> :
    never;

export type MenuOption<T extends OptionType> = {
    value: T,
    controller: ControllerType<T>,
};

export type MenuOptions = {
    ground: {
        color: MenuOption<number>,
        size: MenuOption<number>,
        margin: MenuOption<number>,
    },
    blades: {
        baseColor: MenuOption<number>,
        tipColor: MenuOption<number>,
        density: MenuOption<number>,
        width: MenuOption<number>,
        height: MenuOption<number>,
        minHeightMultiplier: MenuOption<number>,
        maxHeightMultiplier: MenuOption<number>,
    }
    debug: {
        showFps: MenuOption<boolean>,
    }
}

export class Gui {
    private stats: Stats = new Stats();
    private menu: GUI = new GUI();
    public options: MenuOptions = {
        ground: {
            color: { value: 0x5f5033, controller: null! },
            size: { value: 15, controller: null! },
            margin: { value: 0.2, controller: null! },
        },
        blades: {
            baseColor: { value: 0x3ca334, controller: null! },
            tipColor: { value: 0x83c71e, controller: null! },
            density: { value: 200, controller: null! },
            width: { value: 0.2, controller: null! },
            height: { value: 0.5, controller: null! },
            minHeightMultiplier: { value: -0.5, controller: null! },
            maxHeightMultiplier: { value: 0.5, controller: null! },
        },
        debug: {
            showFps: { value: true, controller: null! },
        }
    };

    constructor() {
        document.body.appendChild(this.stats.dom);

        const groundFolder = this.menu.addFolder("Ground");
        this.addColorOption(groundFolder, this.options.ground.color).name("Color");
        this.addOption(groundFolder, this.options.ground.size).name("Size");
        this.addOption(groundFolder, this.options.ground.margin).name("Margin");

        const bladeFolder = this.menu.addFolder("Grass blades");
        this.addColorOption(bladeFolder, this.options.blades.tipColor).name("Tip color");
        this.addColorOption(bladeFolder, this.options.blades.baseColor).name("Base color");
        this.addOption(bladeFolder, this.options.blades.width).name("Width");
        this.addOption(bladeFolder, this.options.blades.height).name("Height");
        this.addOption(bladeFolder, this.options.blades.density).name("Density (no. of blades per m^2)");
        this.addOption(bladeFolder, this.options.blades.minHeightMultiplier).name("Min height multiplier");
        this.addOption(bladeFolder, this.options.blades.maxHeightMultiplier).name("Max height multiplier");

        const debugFolder = this.menu.addFolder("Debug");
        this.addOption(debugFolder, this.options.debug.showFps).name("Show FPS").onChange((v) => {
            this.stats.dom.style.visibility = v ? "visible" : "hidden";
        });
    }

    // Type checking is a bit broken for lil-gui

    addColorOption(parent: GUI, option: MenuOption<number>): ColorController<MenuOption<number>, "value"> {
        option.controller = parent.addColor(option, "value")
        return option.controller;
    }

    addOption(parent: GUI, option: MenuOption<number>): NumberController<MenuOption<number>, "value">;
    addOption(parent: GUI, option: MenuOption<boolean>): BooleanController<MenuOption<boolean>, "value">;
    addOption(parent: GUI, option: any): any {
        const controller = parent.add(option, "value");
        option.controller = controller;
        return controller;
    }

    beforeUpdate() {
        this.stats.begin()
    }

    afterUpdate() {
        this.stats.end();
    }
}