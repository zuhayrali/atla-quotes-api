import { Context } from "hono";

/**
 * Generates the image URL for a given character name.
 */
export const getCharacterImageUrl = (character: string, c: Context): string => {
    const safeCharacterName = character.replace(/\s+/g, '_').toLowerCase();
    const index = Math.floor(Math.random() * 2);
    return `${new URL(c.req.url).origin}/images/${character}/${character}_${index}.png`;
};
