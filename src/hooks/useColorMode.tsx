import { useState, useEffect } from "preact/hooks";

export const useColorMode = () => {
    const [mode, setMode] = useState(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );
    useEffect(() => {
        switch (mode) {
            case 'dark':
                setVar('--bg-color', '#222');
                setVar('--text-color', '#fff');
                break;
            case 'light':
                setVar('--bg-color', '#fff');
                setVar('--text-color', '#000');
                break;
            default:
                break;
        }
    }, [mode]);

    const handleColorChange = (e: MediaQueryListEvent) => {
        setMode(e.matches ? 'dark' : 'light');
    };
    function setVar(key: string, value: string) {
        document.documentElement.style.setProperty(key, value);
    }

    const toggleMode = (e: Event) => {
        setMode(mode === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
        matchMedia.addEventListener('change', handleColorChange);

        return () => matchMedia.removeEventListener('change', handleColorChange);
    }, []);

    return [mode, toggleMode] as const;
};
