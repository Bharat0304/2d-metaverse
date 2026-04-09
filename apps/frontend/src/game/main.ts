import { GameScene } from "./scenes/GameScene";
import { Bootstrap } from "./scenes/Bootstrap";

// Only runs in browser
export function startGame(containerId: string, world: string = "default"): Phaser.Game {
    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: containerId,
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 0, x: 0 },
            },
        },
        pixelArt: true,
        scene: [Bootstrap, GameScene],
    };

    const game = new Phaser.Game(config);
    game.registry.set("world", world);
    (window as any).game = game;
    return game;
}
