import { Router, type Request, type Response } from "express";
import { prisma } from "@repo/db";
import { Client, GatewayIntentBits } from "discord.js";

export const discordRouter: Router = Router();

// Endpoint to get Discord Configuration (Guild ID, etc.)
discordRouter.get("/config", (req: Request, res: Response) => {
    return res.status(200).json({
        guildId: process.env.DISCORD_GUILD_ID,
        clientId: process.env.DISCORD_CLIENT_ID,
        redirectUri: process.env.DISCORD_REDIRECT_URI,
        widgetUrl: `https://discord.com/widget?id=${process.env.DISCORD_GUILD_ID}&theme=dark`
    });
});

// Endpoint to fetch Voice Channels
discordRouter.get("/channels", async (req: Request, res: Response) => {
    try {
        const botToken = process.env.DISCORD_BOT_TOKEN;
        const guildId = process.env.DISCORD_GUILD_ID;

        if (!botToken || !guildId || guildId === "your_server_id") {
            return res.status(400).json({ error: "Discord Bot Token or Guild ID not configured" });
        }

        const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
        await client.login(botToken);

        const guild = await client.guilds.fetch(guildId);
        const channels = await guild.channels.fetch();

        const voiceChannels = channels
            .filter((ch: any) => ch.type === 2) // Type 2 is Voice Channel
            .map((ch: any) => ({
                id: ch.id,
                name: ch.name,
                userCount: ch.members.size,
                inviteUrl: `https://discord.com/channels/${guildId}/${ch.id}`
            }));

        await client.destroy();

        return res.status(200).json({
            guildName: guild.name,
            channels: voiceChannels
        });
    } catch (error: any) {
        console.error("Discord API Error:", error);
        return res.status(500).json({ error: "Failed to fetch Discord data", details: error.message });
    }
});
