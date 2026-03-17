import satori from 'satori';
import {html} from 'satori-html';
import sharp from 'sharp';
import {getDayData, getFriendlyName} from "~/server/utils/schedule";
import {readFileSync} from "node:fs";
import {join} from "pathe";
import type {EventHandlerRequest, H3Event} from "h3";
import prisma from "~/lib/prisma";
import {findGameById} from "~/server/utils/game/serverGameRegistry";
import {decodeSelection} from "#shared/games";
import {distinct} from "~/utils/utils";
import type {QueryObject} from "ufo";

const config = useRuntimeConfig()
const interRegular = readFileSync(config.public.isDev ? join(process.cwd(), 'public', 'fonts', 'Regular.ttf') : join(process.cwd(), '.output', 'public', 'fonts', 'Regular.ttf'))
const interBold = readFileSync(config.public.isDev ? join(process.cwd(), 'public', 'fonts', 'Bold.ttf') : join(process.cwd(), '.output', 'public', 'fonts', 'Bold.ttf'))

function hexToBits(hex: string, length: number): string {
    return parseInt(hex, 16).toString(2).padStart(length, "0");
}

function buildPlainIconRow(typeIds: number[]): string {
    return typeIds.map(id => {
        const gameDef = findGameById(id)!!
        const iconSvg = gameDef.getPreviewIcon()

        let bgColor = '#0F172A'; // base-100
        let textColor = '#3ABDF8';

        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start">
              <div style="display: flex; padding: 8px; border-radius: 6px; background-color: ${bgColor};">
                <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1" style="color: ${textColor}">
                  ${iconSvg}
                </svg>
              </div>
            </div>
            `;
    }).join("")
}

async function buildSvg(markup: any, event: H3Event<EventHandlerRequest>, width: number = 550) {
    // Generate SVG with satori
    const svg = await satori(markup, {
        width,
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

function buildWordleIcon(boardString: string): string {
    const rows = boardString.split(',')
    const lastRow = rows.length - 1;

    let html = `<div style="width:40px;height:40px;display:flex;flex-direction:column;">`;

    rows.forEach((row, rowIndex) => {
        const cols = [...row];
        const lastCol = cols.length - 1;

        html += `<div style="display:flex;flex-direction:row;flex:1;">`;

        cols.forEach((col, colIndex) => {
            let style = "display:flex;flex:1;";

            // colors
            if (col === "-") style += "background:#1E293B;";
            if (col === "o") style += "background:#F4BF51;";
            if (col === "x") style += "background:#2ED4BF;";

            // corners
            if (rowIndex === 0 && colIndex === 0) style += "border-top-left-radius:6px;";
            if (rowIndex === 0 && colIndex === lastCol) style += "border-top-right-radius:6px;";
            if (rowIndex === lastRow && colIndex === 0) style += "border-bottom-left-radius:6px;";
            if (rowIndex === lastRow && colIndex === lastCol) style += "border-bottom-right-radius:6px;";

            html += `<div style="${style}"></div>`;
        });

        html += `</div>`;
    });

    html += `</div>`;
    return html;
}

async function replyLegacyString(resultsQuery: string, event: H3Event<EventHandlerRequest>) {
    const parts = resultsQuery.split(';').map(p => p.trim())
    const dayId = parseInt(parts[0] ?? "1")
    const ids = await getDayData(dayId)
    const theme = ids.theme
    const dayFriendly = getFriendlyName(dayId)
    const hexScore = parts[1] ?? "0"
    const resultString = hexToBits(hexScore, ids.typeIds.length);

    // Parse results
    const results: (boolean | undefined)[] = [...resultString].map(c => c === '1' ? true : c === '0' ? false : undefined)

    // Fetch today's data
    const successes = Math.min(ids.typeIds.length, results.filter(r => r).length);

    // Generate icon elements
    const iconElements = ids.typeIds.map((type, index) => {
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
          ` +
            (theme !== undefined ?
                `<div style="display: flex; justify-content: center;">
                  <div style="font-size: 24px; color: #7975ef;">
                    ${theme}
                  </div>
                </div>` :
                `<div style="font-size: 24px; color: #9ca3af;">
                    ${dayFriendly}
                  </div>
                  <div style="font-size: 24px; color: #9ca3af;">
                    ${successes}/${ids.typeIds.length}
                  </div>`)
            + `
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
        const ids = await getDayData(report.dayId)
        const dayFriendly = getFriendlyName(report.dayId)
        const theme = ids.theme

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

            if(gameDef.id === 13 && reportItem && reportItem.custom && reportItem.custom.split(",").length > 1) {
                return buildWordleIcon(reportItem.custom)
            } else {
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
            }
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
                ` +
                (theme !== undefined ?
                `<div style="display: flex; justify-content: center;">
                  <div style="font-size: 24px; color: #7975ef;">
                    ${theme}
                  </div>
                </div>` :
                `<div style="font-size: 24px; color: #9ca3af;">
                    ${dayFriendly}
                  </div>
                  <div style="font-size: 24px; color: #9ca3af;">
                    ${report.successes}/${ids.typeIds.length}
                  </div>`)
                + `
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

function replyInfinityCode(typeEncoding: string, score: string, years: string | undefined, event: H3Event<EventHandlerRequest>) {
    const types = decodeSelection(typeEncoding)
    let total = 0
    let successful = 0
    let percentage = ""

    if(score.includes("/")) {
        const parts = score.split("/")
        successful = Number(parts[0])
        total = Number(parts[1])
        percentage = Math.round(successful / total * 100) + "%"
    }

    // Generate icon elements
    const iconElements = buildPlainIconRow(types.map(t => t.id))

    // Create the HTML markup
    const markup = html(`
        <div style="display: flex; flex-direction: column; background-color: #0A1120; padding: 40px; width: 650px; height: 160px;">
          <div style="display: flex; flex-direction: column; gap: 24px; align-items: center; justify-content: flex-end; height: 100%;">
            <div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: baseline; gap: 5px; font-size: 32px; font-weight: bold;  color: #ffffff;">
                hardstyle.gg
              <svg width="32" height="32" viewBox="0 0 24 24" stroke-width="1" style="color: #3ABDF8">
                 <path fill="currentColor" stroke-width="1.5" d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z"/>
              </svg>
                Infinity
              </div>
              <div style="font-size: 24px; color: #9ca3af;">
                ${percentage}
              </div>
              <div style="font-size: 24px; color: #9ca3af;">
                ${successful}/${total}
              </div>
            </div>
            
            <div style="display: flex; justify-content: center; align-items: center; gap: 16px;">
              ${iconElements}
            </div>
            
            ` + (years ? `<div style="font-size: 13px; color: #9ca3af; margin-top: -20px;">(${years})</div>` : ``) + `
          </div>
        </div>
      `);

    return buildSvg(markup, event, 650)
}

async function replyInfinityCustomCode(shareCode: string, score: string, years: string | undefined, event: H3Event<EventHandlerRequest>) {
    const rec = await prisma.infinity.findUnique({
        select: {
            type_ids: true
        },
        where: {
            code: shareCode
        }
    })

    if(rec) {
        const typeIds = distinct(JSON.parse(rec.type_ids) as number[]).map(Number)
        let total = 0
        let successful = 0

        if(score.includes("/")) {
            const parts = score.split("/")
            successful = Number(parts[0])
            total = Number(parts[1])
        }

        // Generate icon elements
        const iconElements = buildPlainIconRow(typeIds)

        // Create the HTML markup
        const markup = html(`
        <div style="display: flex; flex-direction: column; background-color: #0A1120; padding: 40px; width: 650px; height: 160px;">
          <div style="display: flex; flex-direction: column; gap: 24px; align-items: center; justify-content: flex-end; height: 100%;">
            <div style="display: flex; width: 100%; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: baseline; gap: 5px; font-size: 32px; font-weight: bold;  color: #ffffff;">
                hardstyle.gg
              <svg width="32" height="32" viewBox="0 0 24 24" stroke-width="1" style="color: #3ABDF8">
                 <path fill="currentColor" stroke-width="1.5" d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z"/>
              </svg>
                Infinity
              </div>
              <div style="font-size: 24px; color: #7975ef;">
                ${shareCode}
              </div>
              <div style="font-size: 24px; color: #9ca3af;">
                ${successful}/${total}
              </div>
            </div>
            
            <div style="display: flex; justify-content: center; gap: 16px;">
              ${iconElements}
            </div>
            
            ` + (years ? `<div style="font-size: 13px; color: #9ca3af; margin-top: -20px;">(${years})</div>` : ``) + `
          </div>
        </div>
      `);

        return buildSvg(markup, event, 650)
    }

    return {}
}

function getPrettyYears(query: QueryObject): string | undefined {
    if(query.y) {
        try {
            const parts = (query.y as string).split(":")
            const start = Number(parts[0]!!)
            const end = Number(parts[1]!!)

            if(start >= 2000 && end <= 2026 && start <= end) {
                if(start === end) {
                    return `${start}`
                } else {
                    return `${start} - ${end}`
                }
            }
        } catch(e: any) {
            return undefined
        }
    }
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    if(query.c) {
        return await replyCode(query.c as string, event);
    } else if(query.r) {
        return await replyLegacyString(query.r as string, event);
    } else if(query.ic && query.s) {
        return replyInfinityCode(query.ic as string, query.s as string, getPrettyYears(query), event);
    } else if(query.icc && query.s) {
        return replyInfinityCustomCode(query.icc as string, query.s as string, getPrettyYears(query), event);
    } else {
        return createError({
            statusCode: 400,
            statusMessage: "Missing query parameters"
        })
    }
});