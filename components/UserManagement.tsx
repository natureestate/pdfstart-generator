/**
 * User Management Component
 * Component สำหรับ Admin จัดการสมาชิกในองค์กร
 */

import React, { useState, useEffect } from 'react';
import { CompanyMember, UserRole, Invitation } from '../types';
import {
    getCompanyMembers,
    addCompanyMember,
    updateMemberRole,
    removeMember,
    checkIsAdmin,
    updateMemberCount,
} from '../services/companyMembers';
import {
    getCompanyInvitations,
    cancelInvitation,
    resendInvitation,
    checkExpiredInvitations,
} from '../services/invitations';
import { useAuth } from '../contexts/AuthContext';
import InviteMemberModal from './InviteMemberModal';

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
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');

    /**
     * โหลดรายการสมาชิกและคำเชิญ
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

            // ดึงรายการคำเชิญ (เฉพาะ Admin)
            if (user) {
                const adminStatus = await checkIsAdmin(companyId, user.uid);
                if (adminStatus) {
                    // ตรวจสอบคำเชิญที่หมดอายุก่อน
                    await checkExpiredInvitations(companyId);
                    
                    const invitationsList = await getCompanyInvitations(companyId);
                    setInvitations(invitationsList);
                }
            }
        } catch (err: any) {
            console.error('❌ โหลดข้อมูลล้มเหลว:', err);
            setError(err.message || 'ไม่สามารถโหลดรายการได้');
        } finally {
            setLoading(false);
        }
    };

    /**
     * ยกเลิกคำเชิญ
     */
    const handleCancelInvitation = async (invitationId: string, email: string) => {
        if (!confirm(`ต้องการยกเลิกคำเชิญสำหรับ ${email} หรือไม่?`)) {
            return;
        }

        try {
            await cancelInvitation(invitationId);
            await loadMembers();
            alert('✅ ยกเลิกคำเชิญสำเร็จ');
        } catch (err: any) {
            console.error('❌ ยกเลิกคำเชิญล้มเหลว:', err);
            alert(err.message || 'ไม่สามารถยกเลิกคำเชิญได้');
        }
    };

    /**
     * ส่งคำเชิญใหม่
     */
    const handleResendInvitation = async (invitationId: string, email: string) => {
        if (!confirm(`ต้องการส่งคำเชิญใหม่ให้ ${email} หรือไม่?`)) {
            return;
        }

        try {
            await resendInvitation(invitationId);
            await loadMembers();
            alert('✅ ส่งคำเชิญใหม่สำเร็จ');
        } catch (err: any) {
            console.error('❌ ส่งคำเชิญใหม่ล้มเหลว:', err);
            alert(err.message || 'ไม่สามารถส่งคำเชิญใหม่ได้');
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

            {/* ปุ่มเชิญสมาชิกใหม่ (เฉพาะ Admin) */}
            {isAdmin && (
                <div className="invite-button-section">
                    <button onClick={() => setShowInviteModal(true)} className="btn-invite">
                        📨 เชิญสมาชิกใหม่
                    </button>
                </div>
            )}

            {/* Tabs */}
            {isAdmin && (
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                        onClick={() => setActiveTab('members')}
                    >
                        👥 สมาชิก ({members.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('invitations')}
                    >
                        📨 คำเชิญ ({invitations.filter(i => i.status === 'pending').length})
                    </button>
                </div>
            )}

            {/* รายการสมาชิก */}
            {activeTab === 'members' && (
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
            )}

            {/* รายการคำเชิญ (เฉพาะ Admin) */}
            {activeTab === 'invitations' && isAdmin && (
                <div className="invitations-list-section">
                    <h3>รายการคำเชิญ ({invitations.length} คำเชิญ)</h3>
                    
                    {invitations.length === 0 ? (
                        <div className="no-invitations">ยังไม่มีคำเชิญ</div>
                    ) : (
                        <div className="invitations-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>อีเมล</th>
                                        <th>บทบาท</th>
                                        <th>สถานะ</th>
                                        <th>เชิญโดย</th>
                                        <th>วันที่สร้าง</th>
                                        <th>หมดอายุ</th>
                                        <th>จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitations.map((invitation) => (
                                        <tr key={invitation.id}>
                                            <td>{invitation.email}</td>
                                            <td>
                                                <span className={`role-badge ${invitation.role}`}>
                                                    {invitation.role === 'admin' ? '👑 Admin' : '👤 Member'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge invitation-${invitation.status}`}>
                                                    {invitation.status === 'pending' ? '⏳ รอการยอมรับ' :
                                                     invitation.status === 'accepted' ? '✅ ยอมรับแล้ว' :
                                                     invitation.status === 'rejected' ? '❌ ปฏิเสธ' :
                                                     '⏰ หมดอายุ'}
                                                </span>
                                            </td>
                                            <td>
                                                {invitation.invitedByName || '-'}
                                            </td>
                                            <td>
                                                {invitation.createdAt
                                                    ? invitation.createdAt.toLocaleDateString('th-TH')
                                                    : '-'}
                                            </td>
                                            <td>
                                                {invitation.expiresAt
                                                    ? invitation.expiresAt.toLocaleDateString('th-TH')
                                                    : '-'}
                                            </td>
                                            <td className="actions-cell">
                                                {invitation.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleResendInvitation(invitation.id!, invitation.email)}
                                                            className="btn-small btn-secondary"
                                                            title="ส่งใหม่"
                                                        >
                                                            🔄
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelInvitation(invitation.id!, invitation.email)}
                                                            className="btn-small btn-danger"
                                                            title="ยกเลิก"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal เชิญสมาชิก */}
            {showInviteModal && (
                <InviteMemberModal
                    companyId={companyId}
                    companyName={companyName}
                    onClose={() => setShowInviteModal(false)}
                    onSuccess={loadMembers}
                />
            )}

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

                .invite-button-section {
                    margin-bottom: 20px;
                }

                .btn-invite {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    transition: all 0.3s;
                }

                .btn-invite:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #e0e0e0;
                }

                .tab {
                    background: none;
                    border: none;
                    padding: 12px 24px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                    color: #666;
                    border-bottom: 3px solid transparent;
                    transition: all 0.3s;
                }

                .tab:hover {
                    color: #2196F3;
                }

                .tab.active {
                    color: #2196F3;
                    border-bottom-color: #2196F3;
                }

                .members-list-section,
                .invitations-list-section {
                    margin-top: 20px;
                }

                .members-list-section h3,
                .invitations-list-section h3 {
                    margin-bottom: 15px;
                    color: #333;
                }

                .no-members,
                .no-invitations {
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

                .status-badge.invitation-pending {
                    background: #fff3e0;
                    color: #f57c00;
                }

                .status-badge.invitation-accepted {
                    background: #e8f5e9;
                    color: #2e7d32;
                }

                .status-badge.invitation-rejected {
                    background: #ffebee;
                    color: #c62828;
                }

                .status-badge.invitation-expired {
                    background: #f5f5f5;
                    color: #666;
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
                    .tabs {
                        overflow-x: auto;
                    }

                    .tab {
                        white-space: nowrap;
                        font-size: 14px;
                        padding: 10px 16px;
                    }

                    .members-table,
                    .invitations-table {
                        font-size: 12px;
                    }

                    .members-table th,
                    .members-table td,
                    .invitations-table th,
                    .invitations-table td {
                        padding: 8px;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserManagement;

