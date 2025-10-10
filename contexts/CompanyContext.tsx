/**
 * Company Context
 * Context สำหรับจัดการบริษัทที่เลือกและข้อมูลบริษัททั้งหมด
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company } from '../types';
import { getUserCompanies } from '../services/companies';
import { useAuth } from './AuthContext';
import { checkNeedMigration, migrateOldCompanies } from '../services/migration';

interface CompanyContextType {
    // บริษัทที่เลือกปัจจุบัน
    currentCompany: Company | null;
    
    // รายการบริษัททั้งหมด
    companies: Company[];
    
    // กำลังโหลดข้อมูล
    loading: boolean;
    
    // เลือกบริษัท
    selectCompany: (company: Company) => void;
    
    // รีเฟรชรายการบริษัท
    refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
    children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    /**
     * โหลดรายการบริษัททั้งหมด
     */
    const loadCompanies = async () => {
        if (!user) {
            setCurrentCompany(null);
            setCompanies([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            
            // ตรวจสอบว่าต้อง Migrate หรือไม่
            const needMigration = await checkNeedMigration();
            if (needMigration) {
                console.log('🔄 พบองค์กรเก่าที่ต้อง Migrate...');
                try {
                    await migrateOldCompanies();
                    console.log('✅ Migration สำเร็จ');
                } catch (error) {
                    console.error('❌ Migration ล้มเหลว:', error);
                }
            }
            
            // ดึงรายการบริษัททั้งหมด
            const companiesList = await getUserCompanies();
            setCompanies(companiesList);

            // ตั้งค่าบริษัทแรกเป็น current (ถ้ามี)
            if (companiesList.length > 0 && !currentCompany) {
                setCurrentCompany(companiesList[0]);
                console.log('✅ เลือกบริษัทแรก:', companiesList[0].name);
            }
        } catch (error) {
            console.error('❌ โหลดบริษัทล้มเหลว:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * โหลดบริษัทเมื่อ user เปลี่ยน
     */
    useEffect(() => {
        loadCompanies();
    }, [user]);

    /**
     * เลือกบริษัท
     */
    const selectCompany = (company: Company) => {
        setCurrentCompany(company);
        console.log('📌 เลือกบริษัท:', company.name);
    };

    /**
     * รีเฟรชรายการบริษัท
     */
    const refreshCompanies = async () => {
        await loadCompanies();
    };

    const value: CompanyContextType = {
        currentCompany,
        companies,
        loading,
        selectCompany,
        refreshCompanies,
    };

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
};

/**
 * Hook สำหรับใช้ CompanyContext
 */
export const useCompany = (): CompanyContextType => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};
