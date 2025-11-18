import satori from 'satori';
import {html} from 'satori-html';
import sharp from 'sharp';
import {getFriendlyName, getIdsForDay, getTypeIdsForDay} from "~/server/utils/schedule";
import {readFileSync} from "node:fs";
import {join} from "pathe";
import type {EventHandlerRequest, H3Event} from "h3";
import prisma from "~/lib/prisma";
import {findGameById} from "~/server/utils/game/serverGameRegistry";

const interRegular = readFileSync(join(process.cwd(), '.output', 'public', 'fonts', 'Regular.ttf'))
const interBold = readFileSync(join(process.cwd(), '.output', 'public', 'fonts', 'Bold.ttf'))

function hexToBits(hex: string, length: number): string {
    return parseInt(hex, 16).toString(2).padStart(length, "0");
}

async function buildSvg(markup: any, event: H3Event<EventHandlerRequest>) {
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
}

async function replyLegacyString(resultsQuery: string, event: H3Event<EventHandlerRequest>) {
    const parts = resultsQuery.split(';').map(p => p.trim())
    const dayId = parseInt(parts[0] ?? "1")
    const dayFriendly = getFriendlyName(dayId)
    const hexScore = parts[1] ?? "0"
    const types = await getTypeIdsForDay(dayId)
    const resultString = hexToBits(hexScore, types.length);

    // Parse results
    const results: (boolean | undefined)[] = [...resultString].map(c => c === '1' ? true : c === '0' ? false : undefined)

    // Fetch today's data
    const successes = Math.min(types.length, results.filter(r => r).length);

    // Generate icon elements
    const iconElements = types.map((type, index) => {
        const gameDef = findGameById(type)!!
        const iconSvg = gameDef.getPreviewIcon()
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
          ${iconSvg}
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

    return buildSvg(markup, event)
}

async function replyCode(code: string, event: H3Event<EventHandlerRequest>) {
    // find all report rows with code=code and all report_item with parent_code=code
    const report = await prisma.report.findUnique({
        where: {
            code: code
        },
        include: {
            report_item: true
        }
    })

    if(report) {
        const ids = await getIdsForDay(report.dayId)
        const dayFriendly = getFriendlyName(report.dayId)

        // Generate icon elements
        const iconElements = await Promise.all(ids.typeIds.map(async (typeId, index): Promise<string> => {
            const gameId = ids.gameIds[index]
            const gameDef = findGameById(typeId)!!
            const iconSvg = gameDef.getPreviewIcon()
            const reportItem = report.report_item.find(ri => ri.typeId === typeId && ri.gameId === gameId)
            const isSuccess = reportItem && reportItem.success === true;
            const isError = reportItem && reportItem.success === false;
            const details = reportItem ? await gameDef.getPreviewDetails(reportItem) : '';

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
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start">
      <div style="display: flex; padding: 8px; border-radius: 6px; background-color: ${bgColor};">
        <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1" style="color: ${textColor}">
          ${iconSvg}
        </svg>
      </div>
      <p style="color: darkgray; margin-top: 0; padding: 0; font-size: 13px;">${details}</p>    
    </div>
    `;
        }))

        const iconString = iconElements.join('')

        // Create the HTML markup
        const markup = html(`
            <div style="display: flex; flex-direction: column; background-color: #0A1120; padding: 40px; width: 550px; height: 160px;">
              <div style="display: flex; flex-direction: column; gap: 24px; align-items: center; justify-content: center; height: 100%;">
                <div style="display: flex; width: 100%; justify-content: space-between; align-items: baseline;">
                  <div style="font-size: 32px; font-weight: bold;  color: #ffffff;">
                    hardstyle.gg
                  </div> 
                  <div style="font-size: 24px; color: #9ca3af;">
                    ${dayFriendly}
                  </div>
                  <div style="font-size: 24px; color: #9ca3af;">
                    ${report.successes}/${ids.typeIds.length}
                  </div>
                </div>
                <div style="display: flex; justify-content: center; gap: 16px;">
                  ${iconString}
                </div>
              </div>
            </div>
          `);

       return buildSvg(markup, event)
    }

    return {}
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if(query.c) {
        return await replyCode(query.c as string, event);
    } else if(query.r) {
        return await replyLegacyString(query.r as string, event);
    } else {
        return createError({
            statusCode: 400,
            statusMessage: "Missing query parameters"
        })
    }
});