export const usePwaInstall = () => {
    const installEvent = useState<any | null>('pwa-install-event', () => null);
    const canInstall = computed(() => !!installEvent.value);

    const initInstallListener = () => {
        if(import.meta.server || !('window' in globalThis)) return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            installEvent.value = e;
        });
    };

    const promptInstall = async () => {
        if (!installEvent.value) return;
        
        installEvent.value.prompt();
        const { outcome } = await installEvent.value.userChoice;
        
        if (outcome === 'accepted') {
            installEvent.value = null;
        }
    };

    return {
        canInstall,
        promptInstall,
        initInstallListener
    };
};
