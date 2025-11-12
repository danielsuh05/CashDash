const now = new Date()
export const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
export const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();