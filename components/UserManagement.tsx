/**
 * User Management Component
 * Component สำหรับ Admin จัดการสมาชิกในองค์กร
 */

import React, { useState, useEffect } from 'react';
import { CompanyMember, UserRole } from '../types';
import {
    getCompanyMembers,
    addCompanyMember,
    updateMemberRole,
    removeMember,
    checkIsAdmin,
    updateMemberCount,
} from '../services/companyMembers';
import { useAuth } from '../contexts/AuthContext';

interface UserManagementProps {
    companyId: string;
    companyName: string;
    onClose?: () => void;
}

/**
 * Component สำหรับจัดการสมาชิกในองค์กร
 */
const UserManagement: React.FC<UserManagementProps> = ({ companyId, companyName, onClose }) => {
    const { user } = useAuth();
    const [members, setMembers] = useState<CompanyMember[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Form state สำหรับเพิ่มสมาชิกใหม่
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<UserRole>('member');
    const [adding, setAdding] = useState(false);

    /**
     * โหลดรายการสมาชิก
     */
    const loadMembers = async () => {
        try {
            setLoading(true);
            setError(null);

            // ตรวจสอบว่าเป็น Admin หรือไม่
            if (user) {
                const adminStatus = await checkIsAdmin(companyId, user.uid);
                setIsAdmin(adminStatus);
            }

            // ดึงรายการสมาชิก
            const membersList = await getCompanyMembers(companyId);
            setMembers(membersList);
        } catch (err: any) {
            console.error('❌ โหลดสมาชิกล้มเหลว:', err);
            setError(err.message || 'ไม่สามารถโหลดรายการสมาชิกได้');
        } finally {
            setLoading(false);
        }
    };

    /**
     * เพิ่มสมาชิกใหม่
     */
    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMemberEmail.trim()) {
            alert('กรุณากรอกอีเมล');
            return;
        }

        try {
            setAdding(true);
            setError(null);

            // เพิ่มสมาชิก
            await addCompanyMember(companyId, newMemberEmail.trim(), newMemberRole);

            // อัปเดตจำนวนสมาชิก
            await updateMemberCount(companyId);

            // รีเฟรชรายการ
            await loadMembers();

            // เคลียร์ฟอร์ม
            setNewMemberEmail('');
            setNewMemberRole('member');

            alert(`✅ เชิญ ${newMemberEmail} เข้าองค์กรสำเร็จ`);
        } catch (err: any) {
            console.error('❌ เพิ่มสมาชิกล้มเหลว:', err);
            setError(err.message || 'ไม่สามารถเพิ่มสมาชิกได้');
        } finally {
            setAdding(false);
        }
    };

    /**
     * เปลี่ยนบทบาทของสมาชิก
     */
    const handleChangeRole = async (memberId: string, currentRole: UserRole) => {
        const newRole: UserRole = currentRole === 'admin' ? 'member' : 'admin';
        
        if (!confirm(`ต้องการเปลี่ยนบทบาทเป็น ${newRole === 'admin' ? 'Admin' : 'Member'} หรือไม่?`)) {
            return;
        }

        try {
            await updateMemberRole(memberId, newRole);
            await loadMembers();
            alert('✅ เปลี่ยนบทบาทสำเร็จ');
        } catch (err: any) {
            console.error('❌ เปลี่ยนบทบาทล้มเหลว:', err);
            alert(err.message || 'ไม่สามารถเปลี่ยนบทบาทได้');
        }
    };

    /**
     * ลบสมาชิก
     */
    const handleRemoveMember = async (memberId: string, memberEmail: string) => {
        if (!confirm(`ต้องการลบ ${memberEmail} ออกจากองค์กรหรือไม่?`)) {
            return;
        }

        try {
            await removeMember(memberId);
            await updateMemberCount(companyId);
            await loadMembers();
            alert('✅ ลบสมาชิกสำเร็จ');
        } catch (err: any) {
            console.error('❌ ลบสมาชิกล้มเหลว:', err);
            alert(err.message || 'ไม่สามารถลบสมาชิกได้');
        }
    };

    /**
     * โหลดข้อมูลเมื่อ component mount
     */
    useEffect(() => {
        loadMembers();
    }, [companyId]);

    /**
     * แสดงสถานะการโหลด
     */
    if (loading) {
        return (
            <div className="user-management-container">
                <div className="loading">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

    return (
        <div className="user-management-container">
            <div className="user-management-header">
                <h2>จัดการสมาชิก: {companyName}</h2>
                {onClose && (
                    <button onClick={onClose} className="close-button">
                        ✕
                    </button>
                )}
            </div>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {/* ฟอร์มเพิ่มสมาชิก (เฉพาะ Admin) */}
            {isAdmin && (
                <div className="add-member-section">
                    <h3>เชิญสมาชิกใหม่</h3>
                    <form onSubmit={handleAddMember} className="add-member-form">
                        <div className="form-group">
                            <label htmlFor="email">อีเมล:</label>
                            <input
                                type="email"
                                id="email"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                placeholder="example@email.com"
                                required
                                disabled={adding}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">บทบาท:</label>
                            <select
                                id="role"
                                value={newMemberRole}
                                onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                                disabled={adding}
                            >
                                <option value="member">Member (สมาชิกทั่วไป)</option>
                                <option value="admin">Admin (ผู้จัดการ)</option>
                            </select>
                        </div>

                        <button type="submit" disabled={adding} className="btn-primary">
                            {adding ? 'กำลังเพิ่ม...' : '+ เชิญสมาชิก'}
                        </button>
                    </form>
                </div>
            )}

            {/* รายการสมาชิก */}
            <div className="members-list-section">
                <h3>รายการสมาชิก ({members.length} คน)</h3>
                
                {members.length === 0 ? (
                    <div className="no-members">ยังไม่มีสมาชิกในองค์กร</div>
                ) : (
                    <div className="members-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>อีเมล</th>
                                    <th>ชื่อ</th>
                                    <th>เบอร์โทร</th>
                                    <th>บทบาท</th>
                                    <th>สถานะ</th>
                                    <th>วันที่เข้าร่วม</th>
                                    {isAdmin && <th>จัดการ</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td>{member.email}</td>
                                        <td>{member.displayName || '-'}</td>
                                        <td>{member.phoneNumber || '-'}</td>
                                        <td>
                                            <span className={`role-badge ${member.role}`}>
                                                {member.role === 'admin' ? '👑 Admin' : '👤 Member'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${member.status}`}>
                                                {member.status === 'active' ? '✅ Active' : 
                                                 member.status === 'pending' ? '⏳ Pending' : 
                                                 '❌ Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            {member.joinedAt 
                                                ? member.joinedAt.toLocaleDateString('th-TH')
                                                : '-'}
                                        </td>
                                        {isAdmin && (
                                            <td className="actions-cell">
                                                {member.userId !== user?.uid && (
                                                    <>
                                                        <button
                                                            onClick={() => handleChangeRole(member.id!, member.role)}
                                                            className="btn-small btn-secondary"
                                                            title="เปลี่ยนบทบาท"
                                                        >
                                                            🔄
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveMember(member.id!, member.email)}
                                                            className="btn-small btn-danger"
                                                            title="ลบสมาชิก"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                )}
                                                {member.userId === user?.uid && (
                                                    <span className="self-indicator">(คุณ)</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .user-management-container {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .user-management-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e0e0e0;
                }

                .user-management-header h2 {
                    margin: 0;
                    color: #333;
                }

                .close-button {
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .close-button:hover {
                    background: #d32f2f;
                }

                .loading {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }

                .error-message {
                    background: #ffebee;
                    color: #c62828;
                    padding: 12px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                }

                .add-member-section {
                    background: #f5f5f5;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }

                .add-member-section h3 {
                    margin-top: 0;
                    color: #333;
                }

                .add-member-form {
                    display: flex;
                    gap: 15px;
                    align-items: flex-end;
                    flex-wrap: wrap;
                }

                .form-group {
                    flex: 1;
                    min-width: 200px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: #555;
                }

                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }

                .form-group input:focus,
                .form-group select:focus {
                    outline: none;
                    border-color: #2196F3;
                }

                .btn-primary {
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: background 0.3s;
                }

                .btn-primary:hover:not(:disabled) {
                    background: #1976D2;
                }

                .btn-primary:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }

                .members-list-section {
                    margin-top: 30px;
                }

                .members-list-section h3 {
                    margin-bottom: 15px;
                    color: #333;
                }

                .no-members {
                    text-align: center;
                    padding: 40px;
                    color: #999;
                    background: #f9f9f9;
                    border-radius: 4px;
                }

                .members-table {
                    overflow-x: auto;
                }

                .members-table table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .members-table th,
                .members-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }

                .members-table th {
                    background: #f5f5f5;
                    font-weight: 600;
                    color: #555;
                }

                .members-table tr:hover {
                    background: #f9f9f9;
                }

                .role-badge,
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .role-badge.admin {
                    background: #fff3e0;
                    color: #e65100;
                }

                .role-badge.member {
                    background: #e3f2fd;
                    color: #1565c0;
                }

                .status-badge.active {
                    background: #e8f5e9;
                    color: #2e7d32;
                }

                .status-badge.pending {
                    background: #fff3e0;
                    color: #f57c00;
                }

                .status-badge.inactive {
                    background: #ffebee;
                    color: #c62828;
                }

                .actions-cell {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                .btn-small {
                    border: none;
                    padding: 6px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: opacity 0.3s;
                }

                .btn-small:hover {
                    opacity: 0.8;
                }

                .btn-secondary {
                    background: #2196F3;
                    color: white;
                }

                .btn-danger {
                    background: #f44336;
                    color: white;
                }

                .self-indicator {
                    color: #666;
                    font-size: 12px;
                    font-style: italic;
                }

                @media (max-width: 768px) {
                    .add-member-form {
                        flex-direction: column;
                    }

                    .form-group {
                        width: 100%;
                    }

                    .members-table {
                        font-size: 12px;
                    }

                    .members-table th,
                    .members-table td {
                        padding: 8px;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserManagement;

