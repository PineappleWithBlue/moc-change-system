'use client';

// 向后兼容层：统一转发自 AuthContext
export { AuthProvider as RoleProvider, useAuth as useRole } from './AuthContext';
