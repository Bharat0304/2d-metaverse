// Pixel-art avatar definitions — each is a unique character skin
export interface AvatarDef {
  id: string;
  name: string;
  colors: {
    hair: string;
    skin: string;
    shirt: string;
    pants: string;
    shoes: string;
    accent: string; // hat/accessory
  };
  accessory: "none" | "hat" | "crown" | "headband" | "cap" | "bow" | "glasses";
}

export const AVATARS: AvatarDef[] = [
  {
    id: "hero",
    name: "Hero",
    colors: { hair: "#4a2800", skin: "#c8906a", shirt: "#3060a0", pants: "#303850", shoes: "#201810", accent: "#9b5de5" },
    accessory: "none",
  },
  {
    id: "ranger",
    name: "Ranger",
    colors: { hair: "#8B4513", skin: "#d4a574", shirt: "#4a8a3c", pants: "#2a4a20", shoes: "#3a2010", accent: "#c8a040" },
    accessory: "hat",
  },
  {
    id: "mage",
    name: "Mage",
    colors: { hair: "#e0d0ff", skin: "#b8806a", shirt: "#7030a0", pants: "#4a1a70", shoes: "#2a0a40", accent: "#ffd166" },
    accessory: "crown",
  },
  {
    id: "warrior",
    name: "Warrior",
    colors: { hair: "#202020", skin: "#e0b890", shirt: "#c03030", pants: "#601010", shoes: "#301010", accent: "#d0d0d0" },
    accessory: "headband",
  },
  {
    id: "scout",
    name: "Scout",
    colors: { hair: "#f0c840", skin: "#f0c090", shirt: "#20a080", pants: "#104840", shoes: "#201810", accent: "#f04040" },
    accessory: "cap",
  },
  {
    id: "bard",
    name: "Bard",
    colors: { hair: "#e04080", skin: "#f0b888", shirt: "#e08020", pants: "#803010", shoes: "#401808", accent: "#f0e040" },
    accessory: "bow",
  },
  {
    id: "scholar",
    name: "Scholar",
    colors: { hair: "#303030", skin: "#c8a080", shirt: "#e0e0e0", pants: "#606060", shoes: "#303030", accent: "#4090f0" },
    accessory: "glasses",
  },
  {
    id: "ninja",
    name: "Ninja",
    colors: { hair: "#101010", skin: "#c8906a", shirt: "#202020", pants: "#101010", shoes: "#101010", accent: "#e04040" },
    accessory: "headband",
  },
];
