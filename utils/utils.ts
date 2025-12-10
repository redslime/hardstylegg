export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function copyToClipboard(text: string) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
    } else {
        // Fallback for older/mobile browsers
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.style.position = "fixed"  // Prevent scrolling to bottom on iOS
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()

        try {
            document.execCommand("copy")
        } finally {
            document.body.removeChild(textarea)
        }
    }
}

export function getToday(): Date {
    const today = new Date()
    today.setHours(0)
    today.setMinutes(0)
    today.setSeconds(0)
    today.setMilliseconds(0)
    return today
}

export function getSpotifyArtwork(id: string) {
    return `https://i.scdn.co/image/${id}`
}

export function getLocalArtwork(id: string) {
    return `/artwork/${id}.png`
}

export function shuffleArray<T>(arr: T[]): T[] {
    const n = arr.length
    if (n < 2) return arr.slice()

    const hasDistinct = (() => {
        for (let i = 1; i < n; i++) {
            if (arr[i] !== arr[0]) return true
        }
        return false
    })()

    const isSameOrder = (a: T[], b: T[]) => {
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false
        }
        return true
    }

    let out = arr.slice()
    const attempts = hasDistinct ? Math.min(10, n * 2) : 1

    for (let attempt = 0; attempt < attempts; attempt++) {
        // Fisher-Yates shuffle
        for (let i = n - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const tmp = out[i]
            out[i] = out[j]
            out[j] = tmp
        }
        if (!isSameOrder(out, arr)) return out
        // Reset and try again
        out = arr.slice()
    }

    // If we keep getting the same order, force a change by swapping two distinct elements
    if (hasDistinct) {
        let idxA = 0
        let idxB = -1
        for (let k = 1; k < n; k++) {
            if (arr[k] !== arr[idxA]) { idxB = k; break }
        }
        if (idxB !== -1) {
            out = arr.slice()
            const tmp = out[idxA]
            out[idxA] = out[idxB]
            out[idxB] = tmp
            if (!isSameOrder(out, arr)) return out
        }
    }

    // Fallback: return a shallow copy (no different order possible)
    return arr.slice()
}

export function containsSubstring(str: string, sub: string): number[] {
    // Returns [start, end] (inclusive) indices of the first occurrence of `sub` in `str`.
    // - Case-insensitive
    // - Returns [] if `sub` is empty or not found
    if (!sub) return []
    const hay = str.toLowerCase()
    const needle = sub.toLowerCase()
    const start = hay.indexOf(needle)
    if (start === -1) return []
    const end = start + needle.length - 1
    return [start, end]
}

export function bitsToHex(bits: string): { hex: string; length: number } {
    const padded = bits.padStart(Math.ceil(bits.length / 4) * 4, "0");
    const hex = parseInt(padded, 2).toString(16);
    return { hex, length: bits.length };
}

// see: https://stackoverflow.com/questions/28150967/typescript-cloning-object
export function deepCopy(obj: any): any {
    let copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        let i = 0;
        const len = obj.length;
        for (; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

export function deepCopyReactive(obj: any): any {
    return reactive(deepCopy(toRaw(obj)))
}

export function debug(...args: any[]) {
    if (import.meta.env.DEV) {
        console.log('[DEBUG]', ...args)
    }
}

export function getYearsUntilToday(start: number): number[] {
    const array: number[] = []
    const today = new Date().getFullYear()

    for(let i = start; i <= today; i++) {
        array.push(i)
    }

    array.sort((a, b) => b - a)
    return array
}

export function getYearsInbetween(start: number, end: number): number[] {
    const array: number[] = []

    for(let i = start; i <= end; i++) {
        array.push(i)
    }

    array.sort((a, b) => b - a)
    return array
}

export function capitalize(word: string): string {
    if (!word) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function shallowRecordEquals(a?: Record<string, string>, b?: Record<string, string>): boolean {
    if (a == null && b == null) return true;
    if (!a || !b) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every(k => a[k] === b[k]);
}