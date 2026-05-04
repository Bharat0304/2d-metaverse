import Phaser from "phaser";
import Network from "./Network";
import { MyPlayer } from "./MyPlayer";
import { Player } from "./Player";
import { Event, phaserEvents } from "./EventBus";
import store from "../../store/store";
import { setPlayerInfo } from "../../store/features/player/playerSlice";

export class GameScene extends Phaser.Scene {
    private static EPSILON = 0.5;

    private mapLayer!: Phaser.Tilemaps.TilemapLayer;
    private secondLayer?: Phaser.Tilemaps.TilemapLayer;
    private thirdLayer?: Phaser.Tilemaps.TilemapLayer;
    private map!: Phaser.Tilemaps.Tilemap;
    private network!: Network;
    private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
    private myPlayer!: MyPlayer;
    private otherPlayers = new Map<string, Player>();

    constructor() {
        super({ key: "GameScene" });
    }

    private addGroupFromTiled(
        objectLayerName: string,
        key: string,
        tilesetName: string,
        collidable: boolean
    ) {
        const group = this.physics.add.staticGroup();
        const objectLayer = this.map.getObjectLayer(objectLayerName);
        if (!objectLayer) return;
        objectLayer.objects.forEach((object) => {
            const actualX = object.x! + object.width! * 0.5;
            const actualY = object.y! - object.height! * 0.5;
            const tileset = this.map.getTileset(tilesetName);
            if (!tileset) return;
            const item = group.get(
                actualX,
                actualY,
                key,
                object.gid! - tileset.firstgid
            );
            if (objectLayerName === "FlippedTrees") {
                item.setFlipY(true);
            }
        });
        if (this.myPlayer && collidable)
            this.physics.add.collider([this.myPlayer], group);
    }

    private loadObjectsFromTiled() {
        this.addGroupFromTiled("Modern_Office_Collide", "modern_office", "Modern_Office_Black_Shadow", true);
        this.addGroupFromTiled("Modern_Office_Objects", "modern_office", "Modern_Office_Black_Shadow", false);
        this.addGroupFromTiled("Carpets", "generic", "Generic", false);
        this.addGroupFromTiled("Generic_Collide", "generic", "Generic", true);
        this.addGroupFromTiled("Generic_Objects", "generic", "Generic", false);
        this.addGroupFromTiled("FlippedTrees", "generic", "Generic", false);
        this.addGroupFromTiled("Basement_Collide", "basement", "Basement", true);
        this.addGroupFromTiled("Basement_Objects", "basement", "Basement", false);
        this.addGroupFromTiled("Computers", "modern_office", "Modern_Office_Black_Shadow", false);
        this.addGroupFromTiled("Chairs", "chair", "chair", false);
        this.addGroupFromTiled("Whiteboard", "whiteboard", "whiteboard", true);
    }

    private handleInitializingPlayer(
        character: string,
        username: string,
        sessionId: string,
        x: number,
        y: number
    ) {
        store.dispatch(setPlayerInfo({ username, character, sessionId }));

        const isMicOn = store.getState().webcam.isMicOn;
        const isWebcamOn = store.getState().webcam.isWebcamOn;

        this.myPlayer = new MyPlayer(
            this, x, y, character, username, sessionId,
            isMicOn, isWebcamOn, this.network, this.cursorKeys
        );

        this.physics.add.collider(this.myPlayer, this.mapLayer);
        if (this.secondLayer) this.physics.add.collider(this.myPlayer, this.secondLayer);
        if (this.thirdLayer) this.physics.add.collider(this.myPlayer, this.thirdLayer);

        this.cameras.main.startFollow(this.myPlayer);
        this.cameras.main.zoom = 1.7;
        this.loadObjectsFromTiled();
        this.myPlayer.initializePeers();
    }

    private handlePlayerJoined(
        player: {
            anim: string;
            x: number;
            y: number;
            username: string;
            isMicOn: boolean;
            isWebcamOn: boolean;
            onChange: (cb: () => void) => void;
            isDisconnected: boolean;
        },
        sessionId: string
    ) {
        const character = player.anim.split("_")[0];

        const entity = new Player(
            this, player.x, player.y,
            character, player.username,
            player.isMicOn, player.isWebcamOn
        );

        entity.setDepth(100);
        this.otherPlayers.set(sessionId, entity);

        this.physics.add.collider(entity, this.mapLayer);
        if (this.secondLayer) this.physics.add.collider(entity, this.secondLayer);
        if (this.thirdLayer) this.physics.add.collider(entity, this.thirdLayer);

        player.onChange(() => {
            const proxy = (window as any).__otherPlayers?.get(sessionId);
            if (!proxy) return;
            entity.setData("serverX", proxy._serverX);
            entity.setData("serverY", proxy._serverY);
            entity.setData("anim", proxy._anim);
            entity.setData("isDisconnected", proxy.isDisconnected ?? false);
            entity.setData("isMicOn", proxy.isMicOn ?? false);
            entity.setData("isWebcamOn", proxy.isWebcamOn ?? false);
        });
    }

    private handlePlayerLeft(sessionId: string) {
        const player = this.otherPlayers.get(sessionId);
        if (player) {
            player.destroy();
            this.otherPlayers.delete(sessionId);
        }
        if (this.myPlayer) this.myPlayer.handlePlayerLeft(sessionId);
    }

    enableKeys() {
        this.input.keyboard!.enabled = true;
    }

    disableKeys() {
        this.input.keyboard!.enabled = false;
        this.input.keyboard!.disableGlobalCapture();
    }

    playerStoppedWebcam() {
        this.myPlayer?.playerStoppedWebcam();
    }

    playerStoppedScreenSharing() {
        this.myPlayer?.playerStoppedScreenSharing();
    }

    addNewOfficeChatMessage(message: string) {
        this.myPlayer?.addNewOfficeChatMessage(message);
    }

    addNewGlobalChatMessage(message: string) {
        this.network.addNewGlobalChatMessage(message);
    }

    updateMicStatus(on: boolean) {
        if (!this.myPlayer) return;
        this.myPlayer.setMicIcon(on);
        this.network.updatePlayer(this.myPlayer.x, this.myPlayer.y, this.myPlayer.getCurrentAnimationKey(), { isMicOn: on });
    }

    updateWebcamStatus(on: boolean) {
        if (!this.myPlayer) return;
        this.myPlayer.setWebcamIcon(on);
        this.network.updatePlayer(this.myPlayer.x, this.myPlayer.y, this.myPlayer.getCurrentAnimationKey(), { isWebcamOn: on });
    }

    updateDisconnectStatus(disconnected: boolean) {
        if (!this.myPlayer) return;
        this.myPlayer.updateDisconnectStatus(disconnected);
    }

    async startWebcam(shouldConnectToOtherPlayers = false) {
        this.myPlayer?.startWebcam(shouldConnectToOtherPlayers);
    }

    async startScreenSharing() {
        this.myPlayer?.startScreenSharing();
    }

    getAllParticipants() {
        const participants: { peerId: string; username: string }[] = [];
        this.otherPlayers.forEach((player, sessionId) => {
            participants.push({ peerId: sessionId, username: player.usernameText.text });
        });
        return participants;
    }

    async create(data: { network: Network }) {
        if (data.network) {
            this.network = data.network;
            // Expose network to window for useWebRTC hook
            if (typeof window !== "undefined") {
                (window as any).gameNetwork = data.network;
            }
        } else {
            throw new Error("network instance missing");
        }

        const world = this.registry.get("world") || "default";
        console.log("Loading world:", world);

        if (world === "village") {
            this.cameras.main.setBackgroundColor("#e9f5db");
            this.map = this.make.tilemap({ key: "village_map" });
            console.log("Village map layers:", this.map.layers.map(l => l.name));
            const villageTileset = this.map.addTilesetImage("MY_TILESET", "village_tiles");
            console.log("Village tileset added:", !!villageTileset);
            const groundLayer = this.map.createLayer("Tile Layer 1", [villageTileset!])!;
            if (groundLayer) {
                console.log("Village ground layer created");
                groundLayer.setCollisionByProperty({ collides: true });
                groundLayer.setDepth(0);
                this.mapLayer = groundLayer;
            } else {
                console.error("Failed to create village ground layer");
            }
        } else {
            this.map = this.make.tilemap({ key: "map" });

            console.log("Available map layers:", this.map.layers.map((l) => l.name));

            const floorAndGroundTileset = this.map.addTilesetImage("FloorAndGround", "ground_tiles");
            const basementTileset       = this.map.addTilesetImage("Basement", "basement");
            const genericTileset        = this.map.addTilesetImage("Generic", "generic");
            const modernOfficeTileset   = this.map.addTilesetImage("Modern_Office_Black_Shadow", "modern_office");
            const chairTileset          = this.map.addTilesetImage("chair", "chair");
            const whiteboardTileset     = this.map.addTilesetImage("whiteboard", "whiteboard");

            const tilesets = [
                floorAndGroundTileset,
                basementTileset,
                genericTileset,
                modernOfficeTileset,
                chairTileset,
                whiteboardTileset,
            ].filter(Boolean) as Phaser.Tilemaps.Tileset[];

            const groundLayer = this.map.createLayer("Ground", tilesets)!;
            groundLayer.setCollisionByProperty({ collides: true });

            try {
                const secondLayer = this.map.createLayer("Second_layer", tilesets)!;
                const thirdLayer  = this.map.createLayer("third_layer", tilesets)!;

                secondLayer.setCollisionByProperty({ collides: true });
                thirdLayer.setCollisionByProperty({ collides: true });
                secondLayer.setCollisionByExclusion([-1]);
                thirdLayer.setCollisionByExclusion([-1]);

                this.secondLayer = secondLayer;
                this.thirdLayer  = thirdLayer;

                groundLayer.setDepth(0);
                secondLayer.setDepth(1);
                thirdLayer.setDepth(2);
            } catch (e) {
                console.warn("Could not load extra layers:", e);
            }

            this.mapLayer = groundLayer;
        }

        this.cursorKeys = this.input.keyboard!.createCursorKeys();

        phaserEvents.on(Event.INITIALIZE_PLAYER, this.handleInitializingPlayer, this);
        phaserEvents.on(Event.PLAYER_JOINED, this.handlePlayerJoined, this);
        phaserEvents.on(Event.PLAYER_LEFT, this.handlePlayerLeft, this);

        this.network.handleServerMessages();
    }

    update(time: number) {
        if (!this.network || !this.myPlayer) return;

        this.myPlayer.update();

        this.otherPlayers.forEach((player, sessionId) => {
            if (player.data) {
                const { serverX, serverY, isDisconnected, isMicOn, isWebcamOn, anim } = player.data.values;

                const dx = Math.abs(player.x - serverX);
                const dy = Math.abs(player.y - serverY);

                if (dx > GameScene.EPSILON || dy > GameScene.EPSILON) {
                    player.x = Phaser.Math.Linear(player.x, serverX, 0.2);
                    player.y = Phaser.Math.Linear(player.y, serverY, 0.2);
                    if (anim) player.playAnimation(anim);
                }

                const { isDisconnected: wasDisconnected, isMicOn: wasMicOn, isWebcamOn: wasWebcamOn } =
                    player.getCurrentStatus();

                if (isDisconnected !== wasDisconnected || isMicOn !== wasMicOn || isWebcamOn !== wasWebcamOn) {
                    if (isDisconnected) { player.setDisconnectIcon(true); return; }
                    if (wasDisconnected && !isDisconnected) { player.setDisconnectIcon(false); return; }
                    player.setMicIcon(isMicOn);
                    player.setWebcamIcon(isWebcamOn);
                }
            }

            this.myPlayer.handleProximityChat(time, sessionId, player);
        });
    }
}
