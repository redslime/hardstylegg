import {GameState} from "~/types/models";

export function getStrokeColor(state: GameState | undefined): string {
    switch (state) {
        case GameState.UPCOMING:
            return "var(--color-primary)"
        case GameState.PLAYING:
            return "var(--color-primary-content)"
        case GameState.SUCCEEDED:
            return "var(--color-success-content)"
        case GameState.FAILED:
            return "var(--color-error-content)"
    }

    return "var(--color-primary)"
}