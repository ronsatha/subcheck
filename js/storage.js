// storage.js - LocalStorage utilities for SubCheck

const Storage = {
    KEY: 'subcheck_subscriptions',

    save(subscriptions) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(subscriptions));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    },

    load() {
        try {
            const data = localStorage.getItem(this.KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
            return [];
        }
    },

    clear() {
        localStorage.removeItem(this.KEY);
    }
};
