import Phaser from "phaser";

type OfficeName =
    | "mainOffice"
    | "eastOffice"
    | "westOffice"
    | "northOffice1"
    | "northOffice2";

type OfficeZone = {
    name: OfficeName;
    rect: Phaser.Geom.Rectangle;
};

export class OfficeManager {
    private currentOffice: OfficeName | null = null;
    private lastRect: Phaser.Geom.Rectangle | null = null;
    static OFFICES: ReadonlyArray<OfficeZone> = [
        { name: "mainOffice",   rect: new Phaser.Geom.Rectangle(799.85, 608.02, 799.85, 512.02) },
        { name: "eastOffice",   rect: new Phaser.Geom.Rectangle(63.96, 351.94, 384.12, 768.09) },
        { name: "westOffice",   rect: new Phaser.Geom.Rectangle(1920.0, 608.25, 448.13, 544.0) },
        { name: "northOffice1", rect: new Phaser.Geom.Rectangle(927.85, 156.61, 512.09, 259.42) },
        { name: "northOffice2", rect: new Phaser.Geom.Rectangle(1471.97, 156.61, 512.09, 259.42) },
    ];

    public update(x: number, y: number): OfficeName | null {
        if (this.lastRect && Phaser.Geom.Rectangle.Contains(this.lastRect, x, y)) {
            return this.currentOffice;
        }
        for (const office of OfficeManager.OFFICES) {
            if (Phaser.Geom.Rectangle.Contains(office.rect, x, y)) {
                if (office.name !== this.currentOffice) {
                    this.currentOffice = office.name;
                    this.lastRect = office.rect;
                    return this.currentOffice;
                }
                return this.currentOffice;
            }
        }
        if (this.currentOffice !== null) {
            this.currentOffice = null;
            this.lastRect = null;
        }
        return null;
    }

    public static isInOffice(x: number, y: number): boolean {
        for (const office of OfficeManager.OFFICES) {
            if (Phaser.Geom.Rectangle.Contains(office.rect, x, y)) return true;
        }
        return false;
    }
}
