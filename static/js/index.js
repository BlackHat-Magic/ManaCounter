(function () {
    try {
        var ls = window.localStorage;
        var savedMode = ls.getItem("theme.mode"); // "light" | "dark" or null
        var pref = null;
        try {
            pref = JSON.parse(ls.getItem("theme.pref") || "null");
        } catch (_) {}
        var lightKey = (pref && pref.lightKey) || "catppuccin-latte";
        var darkKey = (pref && pref.darkKey) || "catppuccin-mocha";

        var mode =
            savedMode ||
            (window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light");
        var themeKey = mode === "light" ? lightKey : darkKey;

        var html = document.documentElement;
        html.setAttribute("data-mode", mode);
        html.setAttribute("data-theme", themeKey);
        html.style.colorScheme = mode;

        var bg = {
            "catppuccin-latte": "#eff1f5",
            "catppuccin-mocha": "#1e1e2e",
            "nord-light": "#eceff4",
            "nord-dark": "#2e3440",
            "gruvbox-light": "#fbf1c7",
            "gruvbox-dark": "#282828",
            "rose-pine-dawn": "#faf4ed",
            "rose-pine": "#191724",
            "strawberry-light": "#fff1f2",
            "strawberry-dark": "#100b1f"
        };
        var bgColor =
            bg[themeKey] || (mode === "dark" ? "#111827" : "#ffffff");
        html.style.backgroundColor = bgColor;
    } catch (e) {}
})();

document.addEventListener("alpine:init", () => {
    // Theme store with selector support (from your master.js)
    const prefersDark = () =>
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    Alpine.store("theme", {
        mode: "light",
        lightKey: "catppuccin-latte",
        darkKey: "catppuccin-mocha",

        lightThemes: [
            { key: "catppuccin-latte", name: "Catppuccin Latte" },
            { key: "nord-light", name: "Nord Light" },
            { key: "strawberry-light", name: "Strawberry Light" },
            { key: "gruvbox-light", name: "Gruvbox Light" }
        ],
        darkThemes: [
            { key: "catppuccin-mocha", name: "Catppuccin Mocha" },
            { key: "nord-dark", name: "Nord Dark" },
            { key: "strawberry-dark", name: "Strawberry Dark" },
            { key: "gruvbox-dark", name: "Gruvbox Dark" }
        ],

        init() {
            try {
                const savedPref = JSON.parse(
                    localStorage.getItem("theme.pref") || "null"
                );
                const savedMode = localStorage.getItem("theme.mode");

                if (savedPref?.lightKey) this.lightKey = savedPref.lightKey;
                if (savedPref?.darkKey) this.darkKey = savedPref.darkKey;

                this.mode = savedMode || (prefersDark() ? "dark" : "light");
            } catch (_) {
                this.mode = prefersDark() ? "dark" : "light";
            }
            this.apply(true);
        },

        apply(animate = false) {
            const html = document.documentElement;
            html.setAttribute("data-mode", this.mode);
            const themeKey = this.mode === "light" ? this.lightKey : this.darkKey;
            html.setAttribute("data-theme", themeKey);
            html.style.colorScheme = this.mode;

            if (animate) {
                html.classList.add("theme-anim");
                const dur =
                    getComputedStyle(html)
                        .getPropertyValue("--theme-anim-duration")
                        .trim() || "320ms";
                const ms = dur.endsWith("ms")
                    ? parseFloat(dur)
                    : dur.endsWith("s")
                    ? parseFloat(dur) * 1000
                    : 320;
                clearTimeout(this._animT);
                this._animT = setTimeout(
                    () => html.classList.remove("theme-anim"),
                    ms + 50
                );
            }

            localStorage.setItem(
                "theme.pref",
                JSON.stringify({ lightKey: this.lightKey, darkKey: this.darkKey })
            );
            localStorage.setItem("theme.mode", this.mode);
        },

        toggleMode() {
            this.mode = this.mode === "light" ? "dark" : "light";
            this.apply(true);
        },

        setLight(key) {
            this.lightKey = key;
            if (this.mode === "light") this.apply(true);
            else
                localStorage.setItem(
                    "theme.pref",
                    JSON.stringify({ lightKey: this.lightKey, darkKey: this.darkKey })
                );
        },

        setDark(key) {
            this.darkKey = key;
            if (this.mode === "dark") this.apply(true);
            else
                localStorage.setItem(
                    "theme.pref",
                    JSON.stringify({ lightKey: this.lightKey, darkKey: this.darkKey })
                );
        }
    });

    Alpine.data("ThemeUI", () => ({
        menuOpen: false,
        activeTab: "light",
        open() {
            this.menuOpen = true;
        },
        close() {
            this.menuOpen = false;
        },
        toggle() {
            Alpine.store("theme").toggleMode();
        },
        setTab(tab) {
            if (tab !== "light" && tab !== "dark") return;
            this.activeTab = tab;
            const theme = Alpine.store("theme");
            if (theme.mode !== tab) {
                theme.mode = tab;
                theme.apply(true);
            }
        },
        init() {
            this.activeTab = Alpine.store("theme").mode;
            this.$watch("$store.theme.mode", (v) => {
                this.activeTab = v;
            });
        }
    }));

    // Mana Counter (bigger buttons/icons)
    Alpine.data("ManaCounter", () => ({
        colors: [
            { key: "W", name: "White", fill: "#f8fafc", text: "#111827", ring: "#e5e7eb" },
            { key: "U", name: "Blue", fill: "#1e66f5", text: "#e5edff", ring: "#93c5fd" },
            { key: "B", name: "Black", fill: "#0b0b0c", text: "#f3f4f6", ring: "#4b5563" },
            { key: "R", name: "Red", fill: "#ef4444", text: "#fff5f5", ring: "#fca5a5" },
            { key: "G", name: "Green", fill: "#22c55e", text: "#062b14", ring: "#86efac" },
            { key: "C", name: "Colorless", fill: "#9ca3af", text: "#111827", ring: "#d1d5db" }
        ],
        counts: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },

        init() {
            try {
                const saved = JSON.parse(localStorage.getItem("mana.counts") || "null");
                if (saved && typeof saved === "object") {
                    this.counts = { ...this.counts, ...saved };
                }
            } catch (_) {}
        },

        inc(k) {
            this.counts[k]++;
            this.save();
        },
        dec(k) {
            if (this.counts[k] > 0) {
                this.counts[k]--;
                this.save();
            }
        },
        total() {
            return Object.values(this.counts).reduce((a, b) => a + b, 0);
        },
        reset() {
            this.counts = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
            this.save();
        },
        save() {
            localStorage.setItem("mana.counts", JSON.stringify(this.counts));
        }
    }));
});