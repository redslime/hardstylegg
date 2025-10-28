import type {User} from "#auth-utils";

export function getAvatarUrl(user: User): string {
    return `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png?size=64`
}