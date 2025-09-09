import type { UserData } from '../types';

const USERS_KEY = 'notesynth_users';
const DATA_KEY_PREFIX = 'notesynth_data_';
const CURRENT_USER_KEY = 'notesynth_current_user';

// --- User Authentication ---

// Note: This is a simulation using localStorage and is NOT secure for production.
// Passwords are stored in plain text.

const getUsers = (): Record<string, string> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
};

export const registerUser = (email: string, password: string): boolean => {
    const users = getUsers();
    if (users[email]) {
        return false; // User already exists
    }
    users[email] = password; // In a real app, hash the password!
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
};

export const loginUser = (email: string, password: string): boolean => {
    const users = getUsers();
    return users[email] === password;
};

// --- User Session ---

export const getCurrentUser = (): string | null => {
    return localStorage.getItem(CURRENT_USER_KEY);
};

export const setCurrentUser = (email: string): void => {
    localStorage.setItem(CURRENT_USER_KEY, email);
};

export const clearCurrentUser = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

// --- User Data Persistence ---

const getInitialUserData = (): UserData => ({
    sources: [],
    chatHistory: [],
    noteboardItems: [],
    suggestedVisualizations: [],
});

export const loadUserData = (email: string): UserData => {
    try {
        const data = localStorage.getItem(`${DATA_KEY_PREFIX}${email}`);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error("Failed to load or parse user data:", error);
    }
    return getInitialUserData();
};

export const saveUserData = (email: string, data: UserData): void => {
    try {
        localStorage.setItem(`${DATA_KEY_PREFIX}${email}`, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save user data:", error);
    }
};