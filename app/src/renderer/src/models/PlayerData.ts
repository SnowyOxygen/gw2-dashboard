export interface PlayerData{
    id: string;
    name: string;
    age: number;
    world: string;
    guilds: string[];
    guild_leader: string;
    created: Date;
    access: string[];
    commander: boolean;
    fractal_level: number;
    daily_ap: number;
    monthly_ap: number;
    wvw_rank: number;
}