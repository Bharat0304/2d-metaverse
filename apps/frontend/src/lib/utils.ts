import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const sanitizeUserIdForVideoCalling = (userId: string) => {
    return userId.replace(/[^0-9a-z]/gi, "X");
};

export const sanitizeUserIdForScreenSharing = (userId: string) => {
    return `ss-${userId ? userId.replace(/[^0-9a-z]/gi, "X") : "unknown"}-ss`;
};

export type officeNames =
    | "mainOffice"
    | "eastOffice"
    | "westOffice"
    | "northOffice1"
    | "northOffice2"
    | null;
