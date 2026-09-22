class NotificationService {
    async notifyVolunteer(volunteerId, taskDetails) {
        // In a real app, this would send an SMS, Email, or Push Notification
        console.log(`[Notification] SENT TO VOLUNTEER (${volunteerId}):`);
        console.log(`Task: ${taskDetails.description}`);
        console.log(`Location: ${taskDetails.location.address}`);
        console.log(`Deadline: ${taskDetails.deadline}`);
        return true;
    }

    async notifyGarbageUnit(taskDetails) {
        console.log(`[Notification] SENT TO GARBAGE UNIT:`);
        console.log(`Cleanup Completed at: ${taskDetails.location.address}`);
        console.log(`Waste Type: ${taskDetails.wasteType}`);
        console.log(`Ready for collection.`);
        return true;
    }
}

module.exports = new NotificationService();
