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
        transparentProportion: MenuOption<number>,
        shineColor: MenuOption<number>,
        shineIntensity: MenuOption<number>,
        density: MenuOption<number>,
        width: MenuOption<number>,
        height: MenuOption<number>,
        minHeightMultiplier: MenuOption<number>,
        maxHeightMultiplier: MenuOption<number>,
    },
    wind: {
        strength: MenuOption<number>,
        speed: MenuOption<number>,
        density: MenuOption<number>,
        directionAngle: MenuOption<number>,
    },
    spatial: {
        strength: MenuOption<number>,
        maxDistance: MenuOption<number>,
    },
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
            transparentProportion: { value: 0.2, controller: null! },
            shineColor: { value: 0xffffff, controller: null! },
            shineIntensity: { value: 0.2, controller: null! },
            density: { value: 200, controller: null! },
            width: { value: 0.2, controller: null! },
            height: { value: 0.5, controller: null! },
            minHeightMultiplier: { value: -0.5, controller: null! },
            maxHeightMultiplier: { value: 0.5, controller: null! },
        },
        wind: {
            strength: { value: 1, controller: null! },
            speed: { value: 0.6, controller: null! },
            density: { value: 0.15, controller: null! },
            directionAngle: { value: 45, controller: null! },
        },
        spatial: {
            strength: { value: 0.7, controller: null! },
            maxDistance: { value: 0.7, controller: null! },
        },
        debug: {
            showFps: { value: true, controller: null! },
        }
    };

    constructor() {
        document.body.appendChild(this.stats.dom);

        const groundFolder = this.menu.addFolder("Ground");
        this.addColorOption(groundFolder, this.options.ground.color).name("Color");
        this.addOption(groundFolder, this.options.ground.size).name("Size").min(0).max(30);
        this.addOption(groundFolder, this.options.ground.margin).name("Margin").min(0).max(1);

        const bladeFolder = this.menu.addFolder("Grass blades");
        this.addColorOption(bladeFolder, this.options.blades.tipColor).name("Tip color");
        this.addColorOption(bladeFolder, this.options.blades.baseColor).name("Base color");
        this.addColorOption(bladeFolder, this.options.blades.shineColor).name("Shine color");
        this.addOption(bladeFolder, this.options.blades.shineIntensity).name("Shine intensity").min(0).max(5);
        this.addOption(bladeFolder, this.options.blades.transparentProportion).name("Transparent proportion").min(0).max(1);
        this.addOption(bladeFolder, this.options.blades.width).name("Width").min(0).max(1);
        this.addOption(bladeFolder, this.options.blades.height).name("Height").min(0).max(1.5);
        this.addOption(bladeFolder, this.options.blades.density).name("Density (no. of blades per m^2)").min(0).max(1000);
        this.addOption(bladeFolder, this.options.blades.minHeightMultiplier).name("Min height multiplier").min(-2).max(2);
        this.addOption(bladeFolder, this.options.blades.maxHeightMultiplier).name("Max height multiplier").min(-2).max(2);

        const windFolder = this.menu.addFolder("Wind");
        this.addOption(windFolder, this.options.wind.strength).name("Strength").min(0).max(3);
        this.addOption(windFolder, this.options.wind.speed).name("Speed").min(0).max(3);
        this.addOption(windFolder, this.options.wind.density).name("Density").min(0).max(3);
        this.addOption(windFolder, this.options.wind.directionAngle).name("Direction angle").min(0).max(360);

        const spatialFolder = this.menu.addFolder("Spatial");
        this.addOption(spatialFolder, this.options.spatial.strength).name("Strength").min(0).max(10);
        this.addOption(spatialFolder, this.options.spatial.maxDistance).name("Max influence distance").min(0).max(5);

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