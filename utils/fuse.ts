import Fuse from "fuse.js";

export function highlight(text: string, matches: readonly Fuse.FuseResultMatch[] = []): string {
    if (!matches || matches.length === 0) return text

    const indices = matches
        .flatMap(m => m.indices)
        .sort((a, b) => a[0] - b[0])

    const merged: [number, number][] = []
    for (const [start, end] of indices) {
        if (!merged.length || start > merged[merged.length - 1]!![1] + 1) {
            merged.push([start, end])
        } else {
            merged[merged.length - 1]!![1] = Math.max(merged[merged.length - 1]!![1], end)
        }
    }

    let result = ''
    let lastIndex = 0

    for (const [start, end] of merged) {
        result += text.slice(lastIndex, start)
        result += `<span class=""><b>${text.slice(start, end + 1)}</b></span>`
        lastIndex = end + 1
    }

    result += text.slice(lastIndex)

    return result
}

export function highlightExact(text: string, region: number[] = []): string {
    if (!region || region.length < 2) return text

    let start = region[0]!!
    let end = region[1]!!
    if (start > end) [start, end] = [end, start]

    start = Math.max(0, Math.min(start, text.length))
    end = Math.max(0, Math.min(end, text.length - 1))

    if (start > end) return text

    const before = text.slice(0, start)
    const middle = text.slice(start, end + 1)
    const after = text.slice(end + 1)

    return `${before}<span class=""><b>${middle}</b></span>${after}`
}

export function highlightKeywords(text: string, query: string): string {
    const keywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((keyword) => keyword.length > 2)

    let highlighted = text

    for (const keyword of keywords) {
        const regex = new RegExp(`(${keyword})`, "gi")
        highlighted = highlighted.replace(regex, "<b>$1</b>")
    }

    return highlighted
}