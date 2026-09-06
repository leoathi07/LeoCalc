/* =========================================================
   LEOCALC BACKEND
   NO LOGIN / NO REGISTER
   Local persistent data manager
   ========================================================= */

"use strict";

const LeoCalcBackend = (() => {

    /* =====================================================
       STORAGE KEYS
       ===================================================== */

    const KEYS = {
        HISTORY: "leocalc_history",
        FAVORITES: "leocalc_favorites",
        NOTES: "leocalc_notes",
        SETTINGS: "leocalc_settings",
        STATS: "leocalc_stats"
    };


    /* =====================================================
       SAFE JSON HELPERS
       ===================================================== */

    function read(key, fallback) {
        try {
            const value = localStorage.getItem(key);

            if (value === null) {
                return fallback;
            }

            return JSON.parse(value);

        } catch (error) {
            console.error("LeoCalc storage read error:", error);
            return fallback;
        }
    }


    function write(key, value) {
        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {
            console.error("LeoCalc storage write error:", error);
            return false;
        }
    }


    function remove(key) {
        try {
            localStorage.removeItem(key);
            return true;

        } catch (error) {
            console.error("LeoCalc storage remove error:", error);
            return false;
        }
    }


    /* =====================================================
       UNIQUE ID
       ===================================================== */

    function createId(prefix = "item") {

        return (
            prefix +
            "_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );
    }


    /* =====================================================
       CALCULATION HISTORY
       ===================================================== */

    function getHistory() {

        const history = read(
            KEYS.HISTORY,
            []
        );

        return Array.isArray(history)
            ? history
            : [];
    }


    function addHistory(data) {

        const history = getHistory();

        const item = {
            id: createId("calc"),

            expression:
                data.expression || "",

            result:
                data.result ?? "",

            category:
                data.category || "Calculator",

            timestamp:
                Date.now(),

            date:
                new Date().toISOString()
        };

        history.unshift(item);

        /*
         * Keep latest 500 calculations
         */
        const limitedHistory =
            history.slice(0, 500);

        write(
            KEYS.HISTORY,
            limitedHistory
        );

        updateStats("calculation");

        return item;
    }


    function deleteHistory(id) {

        const history = getHistory();

        const updated =
            history.filter(item =>
                item.id !== id
            );

        write(
            KEYS.HISTORY,
            updated
        );

        return true;
    }


    function clearHistory() {

        write(
            KEYS.HISTORY,
            []
        );

        return true;
    }


    function getHistoryByCategory(category) {

        return getHistory().filter(item =>
            item.category === category
        );
    }


    /* =====================================================
       FAVORITES
       ===================================================== */

    function getFavorites() {

        const favorites =
            read(
                KEYS.FAVORITES,
                []
            );

        return Array.isArray(favorites)
            ? favorites
            : [];
    }


    function addFavorite(data) {

        const favorites =
            getFavorites();

        /*
         * Prevent duplicate favorites
         */
        const alreadyExists =
            favorites.some(item =>
                item.expression ===
                data.expression &&
                String(item.result) ===
                String(data.result)
            );

        if (alreadyExists) {
            return false;
        }

        const item = {

            id: createId("fav"),

            expression:
                data.expression || "",

            result:
                data.result ?? "",

            category:
                data.category || "Calculator",

            timestamp:
                Date.now()
        };

        favorites.unshift(item);

        write(
            KEYS.FAVORITES,
            favorites
        );

        return item;
    }


    function removeFavorite(id) {

        const favorites =
            getFavorites();

        const updated =
            favorites.filter(item =>
                item.id !== id
            );

        write(
            KEYS.FAVORITES,
            updated
        );

        return true;
    }


    function isFavorite(expression, result) {

        return getFavorites().some(item =>
            item.expression === expression &&
            String(item.result) ===
            String(result)
        );
    }


    function clearFavorites() {

        write(
            KEYS.FAVORITES,
            []
        );

        return true;
    }


    /* =====================================================
       NOTES
       ===================================================== */

    function getNotes() {

        const notes =
            read(
                KEYS.NOTES,
                []
            );

        return Array.isArray(notes)
            ? notes
            : [];
    }


    function addNote(title, content) {

        const notes =
            getNotes();

        const note = {

            id: createId("note"),

            title:
                title || "Untitled Note",

            content:
                content || "",

            createdAt:
                Date.now(),

            updatedAt:
                Date.now(),

            favorite:
                false,

            pinned:
                false
        };

        notes.unshift(note);

        write(
            KEYS.NOTES,
            notes
        );

        return note;
    }


    function updateNote(id, data) {

        const notes =
            getNotes();

        const index =
            notes.findIndex(
                note => note.id === id
            );

        if (index === -1) {
            return null;
        }

        notes[index] = {

            ...notes[index],

            ...data,

            updatedAt:
                Date.now()
        };

        write(
            KEYS.NOTES,
            notes
        );

        return notes[index];
    }


    function deleteNote(id) {

        const notes =
            getNotes();

        const updated =
            notes.filter(note =>
                note.id !== id
            );

        write(
            KEYS.NOTES,
            updated
        );

        return true;
    }


    function toggleNoteFavorite(id) {

        const notes =
            getNotes();

        const note =
            notes.find(
                item => item.id === id
            );

        if (!note) {
            return false;
        }

        note.favorite =
            !note.favorite;

        note.updatedAt =
            Date.now();

        write(
            KEYS.NOTES,
            notes
        );

        return note;
    }


    function toggleNotePinned(id) {

        const notes =
            getNotes();

        const note =
            notes.find(
                item => item.id === id
            );

        if (!note) {
            return false;
        }

        note.pinned =
            !note.pinned;

        note.updatedAt =
            Date.now();

        write(
            KEYS.NOTES,
            notes
        );

        return note;
    }


    /* =====================================================
       SETTINGS
       ===================================================== */

    const DEFAULT_SETTINGS = {

        darkMode: true,

        haptic: true,

        notifications: true,

        angleMode: "DEG",

        decimalPlaces: 6,

        sound: true
    };


    function getSettings() {

        return {
            ...DEFAULT_SETTINGS,
            ...read(
                KEYS.SETTINGS,
                {}
            )
        };
    }


    function updateSettings(data) {

        const settings = {

            ...getSettings(),

            ...data
        };

        write(
            KEYS.SETTINGS,
            settings
        );

        return settings;
    }


    function resetSettings() {

        write(
            KEYS.SETTINGS,
            DEFAULT_SETTINGS
        );

        return DEFAULT_SETTINGS;
    }


    /* =====================================================
       STATISTICS
       ===================================================== */

    function getStats() {

        return {

            ...{
                calculations: 0,

                scientific: 0,

                engineering: 0,

                utilities: 0,

                notes: 0,

                favorites: 0
            },

            ...read(
                KEYS.STATS,
                {}
            )
        };
    }


    function updateStats(type) {

        const stats =
            getStats();

        if (
            Object.prototype.hasOwnProperty
                .call(stats, type + "s")
        ) {

            stats[type + "s"]++;

        } else if (
            type === "calculation"
        ) {

            stats.calculations++;

        }

        stats.lastActivity =
            Date.now();

        write(
            KEYS.STATS,
            stats
        );
    }


    /* =====================================================
       DASHBOARD DATA
       ===================================================== */

    function getDashboardData() {

        const history =
            getHistory();

        const favorites =
            getFavorites();

        const notes =
            getNotes();

        return {

            totalCalculations:
                history.length,

            favorites:
                favorites.length,

            notes:
                notes.length,

            recentCalculations:
                history.slice(0, 5),

            recentNotes:
                notes.slice(0, 5),

            stats:
                getStats()
        };
    }


    /* =====================================================
       EXPORT DATA
       ===================================================== */

    function exportData() {

        const data = {

            app:
                "LeoCalc",

            version:
                "1.0",

            exportedAt:
                new Date().toISOString(),

            history:
                getHistory(),

            favorites:
                getFavorites(),

            notes:
                getNotes(),

            settings:
                getSettings(),

            stats:
                getStats()
        };

        const json =
            JSON.stringify(
                data,
                null,
                2
            );

        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "LeoCalc-Backup.json";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        return true;
    }


    /* =====================================================
       IMPORT DATA
       ===================================================== */

    function importData(jsonData) {

        try {

            const data =
                typeof jsonData === "string"
                    ? JSON.parse(jsonData)
                    : jsonData;

            if (!data || typeof data !== "object") {
                throw new Error(
                    "Invalid backup file"
                );
            }

            if (Array.isArray(data.history)) {

                write(
                    KEYS.HISTORY,
                    data.history
                );
            }

            if (Array.isArray(data.favorites)) {

                write(
                    KEYS.FAVORITES,
                    data.favorites
                );
            }

            if (Array.isArray(data.notes)) {

                write(
                    KEYS.NOTES,
                    data.notes
                );
            }

            if (data.settings) {

                write(
                    KEYS.SETTINGS,
                    {
                        ...DEFAULT_SETTINGS,
                        ...data.settings
                    }
                );
            }

            if (data.stats) {

                write(
                    KEYS.STATS,
                    data.stats
                );
            }

            return true;

        } catch (error) {

            console.error(
                "Import failed:",
                error
            );

            return false;
        }
    }


    /* =====================================================
       CLEAR EVERYTHING
       ===================================================== */

    function clearAllData() {

        remove(KEYS.HISTORY);

        remove(KEYS.FAVORITES);

        remove(KEYS.NOTES);

        remove(KEYS.SETTINGS);

        remove(KEYS.STATS);

        return true;
    }


    /* =====================================================
       STORAGE INFO
       ===================================================== */

    function getStorageInfo() {

        const history =
            getHistory();

        const favorites =
            getFavorites();

        const notes =
            getNotes();

        return {

            history:
                history.length,

            favorites:
                favorites.length,

            notes:
                notes.length,

            totalItems:
                history.length +
                favorites.length +
                notes.length
        };
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    return {

        // History
        getHistory,
        addHistory,
        deleteHistory,
        clearHistory,
        getHistoryByCategory,

        // Favorites
        getFavorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearFavorites,

        // Notes
        getNotes,
        addNote,
        updateNote,
        deleteNote,
        toggleNoteFavorite,
        toggleNotePinned,

        // Settings
        getSettings,
        updateSettings,
        resetSettings,

        // Statistics
        getStats,
        getDashboardData,

        // Backup
        exportData,
        importData,

        // Storage
        getStorageInfo,
        clearAllData
    };

})();


/* =========================================================
   BACKEND READY
   ========================================================= */

console.log(
    "%cLeoCalc Backend Ready",
    "font-size:16px;font-weight:bold;"
);

console.log(
    "History:",
    LeoCalcBackend.getHistory().length
);

console.log(
    "Favorites:",
    LeoCalcBackend.getFavorites().length
);

console.log(
    "Notes:",
    LeoCalcBackend.getNotes().length
);
