import Phaser from "phaser";
import { setRoomJoined } from "../../store/features/room/roomSlice";
import store from "../../store/store";
import Network from "./Network";
import { Event, phaserEvents } from "./EventBus";

export class Bootstrap extends Phaser.Scene {
    network!: Network;

    constructor() {
        super("bootstrap");
    }

    preload() {
        this.load.atlas("nancy", "assets/characters/nancy/nancy.png", "assets/characters/nancy/nancy_atlas.json");
        this.load.animation("nancy_anim", "assets/characters/nancy/nancy_anim.json");
        this.load.atlas("ash", "assets/characters/ash/ash.png", "assets/characters/ash/ash_atlas.json");
        this.load.animation("ash_anim", "assets/characters/ash/ash_anim.json");
        this.load.atlas("lucy", "assets/characters/lucy/lucy.png", "assets/characters/lucy/lucy_atlas.json");
        this.load.animation("lucy_anim", "assets/characters/lucy/lucy_anim.json");
        this.load.atlas("adam", "assets/characters/adam/adam.png", "assets/characters/adam/adam_atlas.json");
        this.load.animation("adam_anim", "assets/characters/adam/adam_anim.json");

        this.load.tilemapTiledJSON("map", "/assets/map/map.json");
        this.load.tilemapTiledJSON("village_map", "/assets/village/village.json");
        
        this.load.on('loaderror', (fileObj: any) => {
            console.error('Phaser failed to load asset:', fileObj.key, 'from', fileObj.url);
        });

        this.load.on('complete', () => {
            console.log('Phaser preloading complete');
        });

        this.load.spritesheet("chair", "assets/items/chair.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("generic", "assets/tileset/Generic.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("basement", "assets/tileset/Basement.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("modern_office", "assets/tileset/Modern_Office_Black_Shadow.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("whiteboard", "assets/items/whiteboard.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("computer", "assets/items/computer.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("vendingmachine", "assets/items/vendingmachine.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("classroom_library", "assets/tileset/Classroom_and_library.png", { frameWidth: 32, frameHeight: 32 });
        this.load.image("ground_tiles", "assets/map/FloorAndGround.png");
        this.load.image("village_tiles", "assets/village/Serene_Village_32x32.png");
        
        // Load extra village assets requested by user
        this.load.image("village_houses", "assets/village/Houses_TILESET_B-C-D-E.png");
        this.load.image("village_outside", "assets/village/Outside_Stuff_TILESET_B-C-D-E.png");
        this.load.image("village_terrains", "assets/village/Terrains_TILESET_B-C-D-E.png");
        
        this.load.spritesheet("village_campfire", "assets/village/campfire_32x32.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("village_water", "assets/village/water_waves_32x32.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet("village_door", "assets/village/door_32x32.png", { frameWidth: 32, frameHeight: 48 });


        this.load.svg("mic-on", "assets/items/mic-on.svg");
        this.load.svg("mic-off", "assets/items/mic-off.svg");
        this.load.svg("camera-on", "assets/items/camera-on.svg");
        this.load.svg("camera-off", "assets/items/camera-off.svg");
        this.load.svg("phone-off", "assets/items/phone-off.svg");
    }

    init() {
        this.network = new Network();
    }

    create() {
        // Wait for UI to trigger launchGame
    }

    launchGame() {
        this.scene.launch("GameScene", { network: this.network });
        store.dispatch(setRoomJoined(true));
    }
}
