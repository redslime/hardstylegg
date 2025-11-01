import {defineEventHandler, readBody} from "h3";
import type {TimetableContainer} from "~/types/gameModels";
import {validateTimetable} from "~/utils/gameValidators";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
    const {user} = await requireUserSession(event)
    const timetable = await readBody<TimetableContainer>(event)
    const errors: string[] = validateTimetable(timetable)

    if(errors.length > 0) {
        return [...errors]
    }

    if(!timetable.id) {
        // create new
        const fetched = await prisma.game_timetable.create({
            data: {
                created_by: timetable.created_by!,
                title: timetable.title,
                color_bg: timetable.color_bg.replace("#", ""),
                color_text: timetable.color_text.replace("#", ""),
                game_timetable_item: {
                    create: timetable.items.map(item => {
                        return {
                            name: item.name,
                            begin: item.begin,
                            end: item.end,
                            hidden: item.hidden
                        }
                    })
                }
            },
            include: { game_timetable_item: true }
        })

        const { game_timetable_item, color_bg, color_text, ...rest } = fetched
        return <TimetableContainer>{
            ...rest,
            color_bg: "#" + color_bg,
            color_text: "#" + color_text,
            items: game_timetable_item
        }
    } else {
        // update
        const fetched = await prisma.game_timetable.update({
            where: { id: timetable.id },
            data: {
                created_by: timetable.created_by!,
                title: timetable.title,
                color_bg: timetable.color_bg.replace("#", ""),
                color_text: timetable.color_text.replace("#", ""),
                game_timetable_item: {
                    deleteMany: {
                        id: { notIn: timetable.items.filter((i) => i.id).map((i) => i.id!) },
                    },
                    upsert: timetable.items.map((item) => ({
                        where: { id: item.id!! },
                        create: {
                            name: item.name,
                            begin: item.begin,
                            end: item.end,
                            hidden: item.hidden
                        },
                        update: {
                            name: item.name,
                            begin: item.begin,
                            end: item.end,
                            hidden: item.hidden
                        }
                    }))
                }
            },
            include: { game_timetable_item: true }
        })

        const { game_timetable_item, color_bg, color_text, ...rest } = fetched
        return <TimetableContainer>{
            ...rest,
            color_bg: "#" + color_bg,
            color_text: "#" + color_text,
            items: game_timetable_item
        }
    }
})