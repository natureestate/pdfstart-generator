/**
 * Auth Context
 * Context สำหรับแชร์สถานะ Authentication ทั้งแอป
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from '../services/auth';

// Interface สำหรับ Auth Context
interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
}

// สร้าง Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props สำหรับ Provider
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Auth Provider Component
 * Wrap แอปด้วย component นี้เพื่อให้ทุก component เข้าถึง auth state ได้
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // ติดตามสถานะการ Login
        const unsubscribe = onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            setLoading(false);
            
            if (currentUser) {
                console.log('👤 ผู้ใช้ Login:', {
                    name: currentUser.displayName,
                    email: currentUser.email,
                    uid: currentUser.uid,
                });
            } else {
                console.log('👤 ไม่มีผู้ใช้ Login');
            }
        });

        // Cleanup subscription เมื่อ component unmount
        return () => unsubscribe();
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: user !== null,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom Hook สำหรับใช้ Auth Context
 * @returns AuthContextType
 * @throws Error ถ้าใช้นอก AuthProvider
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error('useAuth ต้องใช้ภายใน AuthProvider');
    }
    
    return context;
};
