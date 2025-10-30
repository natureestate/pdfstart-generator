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
        console.log('🔄 [CompanyContext] เริ่มโหลดบริษัท, User:', user?.email);
        
        if (!user) {
            console.log('⚠️ [CompanyContext] ไม่มี User, ล้างข้อมูล');
            setCurrentCompany(null);
            setCompanies([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('⏳ [CompanyContext] กำลังโหลด...');
            
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
            console.log('📋 [CompanyContext] ดึงบริษัทได้:', companiesList.length, 'องค์กร', companiesList);
            setCompanies(companiesList);

            // ตั้งค่าบริษัทแรกเป็น current (ถ้ามีและยังไม่มี current)
            if (companiesList.length > 0) {
                // ถ้ามี currentCompany แล้ว ตรวจสอบว่ายังอยู่ใน list หรือไม่
                const stillExists = currentCompany && companiesList.find(c => c.id === currentCompany.id);
                
                if (!currentCompany || !stillExists) {
                    setCurrentCompany(companiesList[0]);
                    console.log('✅ [CompanyContext] เลือกบริษัทแรก:', companiesList[0].name);
                } else {
                    console.log('ℹ️ [CompanyContext] ใช้บริษัทเดิม:', currentCompany.name);
                }
            } else {
                console.log('⚠️ [CompanyContext] ไม่มีบริษัทเลย');
                setCurrentCompany(null);
            }
        } catch (error) {
            console.error('❌ [CompanyContext] โหลดบริษัทล้มเหลว:', error);
            setCompanies([]);
            setCurrentCompany(null);
        } finally {
            setLoading(false);
            console.log('✅ [CompanyContext] โหลดเสร็จสิ้น');
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
