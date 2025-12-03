import { PrismaClient } from "@prisma/client";
import { getAchievementsByUserId } from "./src/modules/services/achievement.service";

const prisma = new PrismaClient();

async function test() {
    console.log("Testing Achievements API...");

    // Get a user ID (e.g., 1)
    const userId = 1;

    try {
        const achievements = await getAchievementsByUserId(userId);
        console.log("Achievements for user " + userId + ":", achievements);

        if (Array.isArray(achievements)) {
            console.log("✅ API Verification Passed: Returned an array.");
        } else {
            console.error("❌ API Verification Failed: Did not return an array.");
        }

    } catch (e) {
        console.error("❌ API Verification Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
