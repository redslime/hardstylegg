import type {DashboardData, DashboardGroup, Editor, Schedule, ScheduleDay} from "~/types/models";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import {getBaseDate, getDayIdToday, getFriendlyName, getTimeUntilMidnight} from "~/server/utils/schedule";

let structure: DashboardGroup[] | null = null

function getStructure(user: User): DashboardGroup[] {
    if(structure === null) {
        const overviewItems = []

        overviewItems.push({
            name: "Home",
            icon: "HomeIcon",
            url: "/admin"
        })

        if(user.admin) {
            overviewItems.push({
                name: "Schedule",
                icon: "CalendarDaysIcon",
                url: "/admin/schedule"
            })
        }

        overviewItems.push({
            name: "Track database",
            icon: "CircleStackIcon",
            url: "/admin/tracks"
        })

        if(user.admin) {
            overviewItems.push({
                name: "Editors",
                icon: "UsersIcon",
                url: "/admin/editors"
            })
        }
        
        const gameItems = []

        gameItems.push({
            name: "Artwork",
            icon: "Pencil",
            url: "/admin/game/artwork"
        })
        gameItems.push({
            name: "Complete Album",
            icon: "PencilSquare",
            url: "/admin/game/complete-album"
        })
        gameItems.push({
            name: "Complete Lyrics",
            icon: "ChatBubble",
            url: "/admin/game/complete-lyrics"
        })
        gameItems.push({
            name: "Heardle",
            icon: "SpeakerWave",
            url: "/admin/game/heardle"
        })
        gameItems.push({
            name: "Name X",
            icon: "ListBullet",
            url: "/admin/game/name-x"
        })
        gameItems.push({
            name: "Order",
            icon: "ArrowsRightLeft",
            url: "/admin/game/order"
        })
        gameItems.push({
            name: "Quiz",
            icon: "CheckCircle",
            url: "/admin/game/quiz"
        })
        gameItems.push({
            name: "Timeline",
            icon: "Calendar",
            url: "/admin/game/timeline"
        })
        gameItems.push({
            name: "Timetable",
            icon: "PencilSquare",
            url: "/admin/game/timetable"
        })

        structure = [
            {
                name: "Overview",
                items: overviewItems
            },
            {
                name: "Games",
                items: gameItems
            }
        ]
    }

    return structure
}

async function getEditors(): Promise<Editor[]> {
    return await prisma.user.findMany()
}

async function getSchedule(): Promise<Schedule> {
    const todayId = getDayIdToday()
    const schedule = await prisma.day_schedule.findMany()
    const mapped: ScheduleDay[] = schedule.map(item => {
        const {type_ids, game_ids, ...rest} = item
        const typeIds = JSON.parse(type_ids) as number[]
        const gameIds = JSON.parse(game_ids) as number[]
        return {
            dayFriendly: getFriendlyName(item.day),
            typeIds,
            gameIds,
            ...rest
        }
    })

    return <Schedule>{
        baseDate: getBaseDate(),
        todayId,
        todayFriendly: getFriendlyName(todayId),
        midnightTimer: getTimeUntilMidnight(),
        days: mapped
    }
}

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const groups = getStructure(user)
    const editors = await getEditors()
    const schedule = await getSchedule()

    return <DashboardData>{
        groups,
        editors,
        schedule,
    }
})