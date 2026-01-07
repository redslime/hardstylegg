import {precacheAndRoute} from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST || []);

console.log('Service Worker loaded and active!');

function getMsUntilMidnightBerlin() {
    const now = new Date();
    const berlinNowStr = now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const berlinNow = new Date(berlinNowStr);
    const nextMidnightBerlin = new Date(berlinNow);

    nextMidnightBerlin.setHours(24, 0, 0, 0);
    return nextMidnightBerlin.getTime() - berlinNow.getTime();
}

function scheduleMidnightNotification() {
    const msUntilMidnight = getMsUntilMidnightBerlin();

    console.log(`Scheduling next notification in ${Math.floor(msUntilMidnight / 1000 / 60)} minutes (Berlin Midnight)`);

    setTimeout(() => {
        if (Notification.permission === 'granted') {
            self.registration.showNotification('hardstyle.gg', {
                body: 'The daily challenge has been reset! Play now.',
                icon: '/img/icon.png',
                tag: 'daily-reset',
                badge: '/img/icon.png'
            });
        }

        scheduleMidnightNotification();
    }, msUntilMidnight);
}

scheduleMidnightNotification();

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});