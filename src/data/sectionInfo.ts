export interface SectionInfo {
    title: string;
    content: string;
}

export const sectionInfo: Record<string, SectionInfo> = {
    savedTimezones: {
        title: 'Saved Timezones',
        content:
            'Keep track of up to three important timezones—like your remote team, travel destinations, or family abroad. Just pick a city from the dropdown to add it to your saved list. You’ll instantly see the live local time for each one. Need a reset? You can remove individual timezones using the trash icon or clear all with the "Reset" button. These timezones are saved in your browser so they’re always ready when you come back.',
    },
    timezoneConverter: {
        title: 'Timezone Converter',
        content:
            'Quickly convert any date and time from one timezone to another. Just enter the date and time, pick a "From" timezone and a "To" timezone, and get the accurate result—DST (Daylight Saving Time) handled automatically. You can even swap the timezones with a click to reverse the conversion. It’s perfect for scheduling meetings across countries or checking what time it’ll be somewhere else.',
    },
    multipleTimezoneConverter: {
        title: 'Multiple Timezone Converter',
        content:
            'Convert a single date and time across up to ten timezones at once. Select your base timezone, pick multiple others to compare, and get all their local times in one place. This is super handy for global teams, international events, or simply syncing across time zones. You can copy all results in one click or reset to start over.',
    },
    multipleTimezoneRangeConverter: {
        title: 'Multiple Timezone Range Converter',
        content:
            'Plan a time range (like a meeting or event window) across multiple timezones. Set a start and end time, choose your base timezone, and add up to ten others to see how the full time range translates. It’s ideal for scheduling events that span time, like webinars or project sprints, and ensures everyone knows their local time slot. You can copy the results or clear everything with ease.',
    }
};