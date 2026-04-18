// Avatar definitions mapping to Phaser character keys
export interface AvatarDef {
  id: "nancy" | "ash" | "lucy" | "adam";
  name: string;
  colors: {
    hair: string;
    skin: string;
    shirt: string;
    pants: string;
    shoes: string;
    accent: string;
  };
  accessory: "none" | "hat" | "crown" | "headband" | "cap" | "bow" | "glasses";
}

export const AVATARS: AvatarDef[] = [
  {
    id: "nancy",
    name: "Nancy",
    colors: { hair: "#4a2800", skin: "#e0b890", shirt: "#e04080", pants: "#303850", shoes: "#201810", accent: "#9b5de5" },
    accessory: "bow",
  },
  {
    id: "ash",
    name: "Ash",
    colors: { hair: "#202020", skin: "#c8906a", shirt: "#3060a0", pants: "#303850", shoes: "#101010", accent: "#f04040" },
    accessory: "cap",
  },
  {
    id: "lucy",
    name: "Lucy",
    colors: { hair: "#f0c840", skin: "#f0c090", shirt: "#20a080", pants: "#104840", shoes: "#201810", accent: "#ffd166" },
    accessory: "headband",
  },
  {
    id: "adam",
    name: "Adam",
    colors: { hair: "#303030", skin: "#d4a574", shirt: "#e08020", pants: "#601010", shoes: "#302010", accent: "#4090f0" },
    accessory: "hat",
  },
];
