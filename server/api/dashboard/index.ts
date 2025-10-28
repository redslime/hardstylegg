import type {DashboardGroup} from "~/types/models";
import type {User} from "#auth-utils";

let structure: DashboardGroup[] | null = null

function getStructure(user: User): DashboardGroup[] {
    if(structure === null) {
        const overviewItems = []

        overviewItems.push({
            name: "Home",
            icon: "HomeIcon",
            url: "/admin"
        })
        overviewItems.push({
            name: "Schedule",
            icon: "CalendarDaysIcon",
            url: "/admin/schedule"
        })
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

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event)
    return getStructure(user)
})