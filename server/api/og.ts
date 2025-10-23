import satori from 'satori';
import {html} from 'satori-html';
import sharp from 'sharp';
import {getFriendlyName, getTypeIdsForDay} from "~/server/utils/schedule";
import {readFileSync} from "node:fs";
import {join} from "pathe";

const interRegular = readFileSync(join(process.cwd(), 'public', 'fonts', 'Regular.ttf'))
const interBold = readFileSync(join(process.cwd(), 'public', 'fonts', 'Bold.ttf'))

function hexToBits(hex: string, length: number): string {
    const bits = parseInt(hex, 16).toString(2).padStart(length, "0");
    return bits;
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const resultsQuery = query.r as string ?? "3";
    const parts = resultsQuery.split(';').map(p => p.trim())
    const dayId = parseInt(parts[0])
    const dayFriendly = getFriendlyName(dayId)
    const hexScore = parts[1]
    const types = await getTypeIdsForDay(dayId)
    const resultString = hexToBits(hexScore, types.length);

    // Parse results
    const results: (boolean | undefined)[] = [...resultString].map(c => c === '1' ? true : c === '0' ? false : undefined)

    // Fetch today's data
    const successes = Math.min(types.length, results.filter(r => r).length);

    // Create icon SVGs inline (simplified versions)
    const getIconSvg = (type: number, state: 'success' | 'error' | 'upcoming') => {
        // Map your game types to simple icons
        // You'll need to create simplified SVG versions of your icons
        const iconMap: Record<number, string> = {
            0: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17M2 12L12 17L22 12" />',
            1: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />',
            2: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />',
            3: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />',
            4: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />',
            5: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />',
            6: '<path stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />',
            7: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />',
            8: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />',
            9: '<path stroke="currentColor" fill="none" stroke-width="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />'
            // Add more icon mappings based on your game types
        };

        return iconMap[type] || iconMap[0];
    };

    // Generate icon elements
    const iconElements = types.map((type, index) => {
        const exists = results.length > index;
        const isSuccess = exists && results[index] === true;
        const isError = exists && results[index] === false;

        let bgColor = '#0F172A'; // base-100
        let textColor = '#3ABDF8';

        if (isSuccess) {
            bgColor = '#2ED4BF'; // success
            textColor = '#01100D';
        } else if (isError) {
            bgColor = '#FB7085'; // error
            textColor = '#150406';
        }

        return `
      <div style="display: flex; padding: 8px; border-radius: 6px; background-color: ${bgColor};">
        <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1" style="color: ${textColor}">
          ${getIconSvg(type, isSuccess ? 'success' : isError ? 'error' : 'upcoming')}
        </svg>
      </div>
    `;
    }).join('');

    // Create the HTML markup
    const markup = html(`
    <div style="display: flex; flex-direction: column; background-color: #0A1120; padding: 40px; width: 550px; height: 140px;">
      <div style="display: flex; flex-direction: column; gap: 24px; align-items: center; justify-content: center; height: 100%;">
        <div style="display: flex; width: 100%; justify-content: space-between; align-items: baseline;">
          <div style="font-size: 32px; font-weight: bold;  color: #ffffff;">
            hardstyle.gg
          </div> 
          <div style="font-size: 24px; color: #9ca3af;">
            ${dayFriendly}
          </div>
          <div style="font-size: 24px; color: #9ca3af;">
            ${successes}/${types.length}
          </div>
        </div>
        <div style="display: flex; justify-content: center; gap: 16px;">
          ${iconElements}
        </div>
      </div>
    </div>
  `);

    // Generate SVG with satori
    const svg = await satori(markup, {
        width: 550,
        height: 140,
        fonts: [
            {
                name: 'Inter',
                data: interRegular,
                weight: 400,
                style: 'normal',
            },
            {
                name: 'Inter',
                data: interBold,
                weight: 700,
                style: 'normal',
            }
        ],
    });

    // Convert to PNG (optional)
    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    // Return SVG or PNG
    event.node.res.setHeader('Content-Type', 'image/png');
    return png;
});