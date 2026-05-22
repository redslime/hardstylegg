import type MarkdownIt from 'markdown-it'

export function mdYoutubePlugin(md: MarkdownIt) {
    const YOUTUBE_REGEX = /@\[(youtube)\]\((.*?)\)/

    function extractVideoId(input: string) {
        const patterns = [
            /youtu\.be\/([^?&]+)/,
            /youtube\.com\/watch\?v=([^?&]+)/,
            /youtube\.com\/embed\/([^?&]+)/
        ]

        for (const pattern of patterns) {
            const match = input.match(pattern)

            if (match) {
                return match[1]!!
            }
        }

        return input
    }

    function youtubeEmbed(videoId: string) {
        const safeId = extractVideoId(videoId).replace(/[^a-zA-Z0-9_-]/g, '')
        console.log("safeId: ", safeId, " videoId: ", videoId, "")

        return `
      <div class="youtube-embed">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${safeId}"
          title="YouTube video"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
    `
    }

    md.inline.ruler.before(
        'emphasis',
        'youtube',
        (state, silent) => {
            const pos = state.pos
            const src = state.src.slice(pos)

            const match = src.match(YOUTUBE_REGEX)

            if (!match || match.index !== 0) {
                return false
            }

            if (!silent) {
                const token = state.push('html_inline', '', 0)
                token.content = youtubeEmbed(match[2]!!)
            }

            state.pos += match[0].length

            return true
        }
    )
}