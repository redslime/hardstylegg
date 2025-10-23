import * as fs from "node:fs";

const fileName = '.data/sids.txt'

function writeSidToFile(sid: string) {
    fs.appendFile(fileName, sid + '\n', (err) => {})
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const sid = query.sid as string
    writeSidToFile(sid)
    return true
})