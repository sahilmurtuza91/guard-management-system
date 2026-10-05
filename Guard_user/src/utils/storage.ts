import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
    TOKEN: 'user_auth_token',
    USER: 'user_auth_user',
}

export const storage = {
    async setToken(token: string) {
        await AsyncStorage.setItem(KEYS.TOKEN, token);
    },

    async getToken(): Promise<string | null> {
        return AsyncStorage.getItem(KEYS.TOKEN);
    },

    async setUser(user: unknown) {
        await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    },

    async getUser<T = any>(): Promise<T | null> {
        const raw = await AsyncStorage.getItem(KEYS.USER);
        return raw ? JSON.parse(raw) : null;
    },

    async clear() {
        await Promise.all([
            AsyncStorage.removeItem(KEYS.TOKEN),
            AsyncStorage.removeItem(KEYS.USER),
        ]);
    }
}