export interface QuizContainer {
    id?: number
    created_by?: number
    title: string
    items: QuizAnswer[]
}

export interface QuizAnswer {
    id?: number
    parent_id?: number
    text: string
    correct: boolean
}

export function validateQuiz(quiz: QuizContainer): string[] {
    const errors: string[] = []

    if(quiz.title.trim().length === 0) {
        errors.push("Title is required")
    }
    if(quiz.title.length > 128) {
        errors.push("Title is too long")
    }
    if(quiz.items.length < 2) {
        errors.push("At least 2 answer options are required")
    }
    for(const item of quiz.items) {
        if(item.text.length > 64) {
            errors.push("Answer option is too long")
        }
    }
    for(const item of quiz.items) {
        if(item.text.trim().length === 0) {
            errors.push("Answer can't be empty")
        }
    }
    if(quiz.items.filter(i => !i.correct).length === 0) {
        errors.push("At least one answer option must be false")
    }
    if(quiz.items.filter(i => i.correct).length < 1) {
        errors.push("At least one answer option must be correct")
    }

    return errors
}