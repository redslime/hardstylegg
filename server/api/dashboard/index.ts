import type {DashboardData, DashboardGroup, DashboardItem, Editor, Schedule, ScheduleDay} from "~/types/models";
import type {User} from "#auth-utils";
import prisma from "~/lib/prisma";
import {getBaseDate, getDayIdToday, getFriendlyName, getTimeUntilMidnight} from "~/server/utils/schedule";
import {getGames} from "~/server/utils/game/serverGameRegistry";

function getStructure(user: User): DashboardGroup[] {
    const overviewItems: DashboardItem[] = []
    const adminItems: DashboardItem[] = []
    const gameItems: DashboardItem[] = []

    // overview items
    overviewItems.push({
        name: "Home",
        icon: "HomeIcon",
        url: "/admin"
    })

    overviewItems.push({
        name: "Content database",
        icon: "CircleStackIcon",
        url: "/admin/content",
        children: [
            {
                name: "Artists",
                icon: "CircleStackIcon",
                url: "/admin/content/artists",
            },
            {
                name: "Albums",
                icon: "CircleStackIcon",
                url: "/admin/content/albums",
            },
            {
                name: "Tracks",
                icon: "CircleStackIcon",
                url: "/admin/content/tracks",
            }
        ]
    })

    overviewItems.push({
        name: "Editors",
        icon: "UsersIcon",
        url: "/admin/editors"
    })

    // admin items
    adminItems.push({
        name: "Schedule",
        icon: "CalendarDaysIcon",
        url: "/admin/schedule"
    })

    // adminItems.push({
    //     name: "Import artist",
    //     icon: "CloudArrowDownIcon",
    //     url: "/admin/import/artist"
    // })
    //
    // adminItems.push({
    //     name: "Import track",
    //     icon: "CloudArrowDownIcon",
    //     url: "/admin/import/track"
    // })

    // game items
    getGames().forEach(game => {
        gameItems.push({
            name: game.getSpacedName(),
            icon: "gameDef:" + game.id, // little workaround
            url: `/admin/game/${game.getDashedName()}`
        })
    })

    const groups: DashboardGroup[] = [
        {
            name: "Overview",
            items: overviewItems
        },
        {
            name: "Games",
            items: gameItems
        }
    ]

    if(user.admin) {
        groups.splice(1, 0, {
            name: "Admin",
            items: adminItems
        })
    }

    return groups
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

async function getReports(): Promise<{ completed: boolean, successes: number }[]> {
    return await prisma.report.findMany({
        where: {
            dayId: getDayIdToday()
        },
        select: {
            completed: true,
            successes: true
        }
    })
}

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    const groups = getStructure(user)
    const editors = await getEditors()
    const schedule = await getSchedule()
    const reports = await getReports()

    return <DashboardData>{
        groups,
        editors,
        schedule,
        reports
    }
})