import Phaser from "phaser";

export const phaserEvents = new Phaser.Events.EventEmitter();

export enum Event {
    INITIALIZE_PLAYER = "initialize-player",
    PLAYER_JOINED = "player-joined",
    PLAYER_LEFT = "player-left",
    PROXIMITY_ENTER = "proximity-enter",
    PROXIMITY_LEAVE = "proximity-leave",
}
