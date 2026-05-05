import api from "@/axios/intercepter";
import { useAuthStore } from "@/stores/useAuthStore";
import { BloodGroup, Gender, UserRole } from "@/validations";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface StaffProfile {
  _id: string;
  staffId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  nid?: string;
  avatar?: string;
  designation?: string;
  department?: string;
  joinDate?: string;
  baseSalary?: number;
  branch?: string[];
  alternativePhone?: string;
  whatsApp?: string;
  address?: {
    village: string;
    postOffice: string;
    upazila: string;
    district: string;
    division?: string;
  };
  permanentAddress?: {
    village?: string;
    postOffice?: string;
    upazila?: string;
    district?: string;
    division?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
    address: string;
  };
}

export interface GuardianProfile {
  _id: string;
  guardianId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  nid?: string;
  avatar?: string;
  occupation?: string;
  monthlyIncome?: number;
  whatsApp?: string;
  address?: {
    village: string;
    postOffice: string;
    upazila: string;
    district: string;
    division?: string;
  };
  permanentAddress?: {
    village?: string;
    postOffice?: string;
    upazila?: string;
    district?: string;
    division?: string;
  };
}

export type ProfileUpdatePayload = Partial<StaffProfile & GuardianProfile>;

export function useProfile() {
  const { me } = useAuthStore();
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [guardianProfile, setGuardianProfile] = useState<GuardianProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const isStaff = me?.user.roles.includes(UserRole.STAFF) ?? false;
  const isGuardian = me?.user.roles.includes(UserRole.GUARDIAN) ?? false;
  const isAdmin =
    (me?.user.roles.includes(UserRole.ADMIN) || me?.user.roles.includes(UserRole.SUPER_ADMIN)) ?? false;

  const fetchStaffProfile = async (userId: string) => {
    try {
      const res = await api.get(`/staffs/by?userId=${userId}`);
      if (res.data?.success) setStaffProfile(res.data.data);
    } catch {
      // 403 for non-admin staff — silently ignore, user can still update
    }
  };

  const fetchGuardianProfile = async (userId: string) => {
    try {
      const res = await api.get(`/guardians/by?userId=${userId}`);
      if (res.data?.success) setGuardianProfile(res.data.data);
    } catch {
      // 403 for non-admin guardian — silently ignore
    }
  };

  useEffect(() => {
    if (!me?.user._id) return;
    const userId = me.user._id;

    if (isStaff || isAdmin) {
      setLoadingProfile(true);
      fetchStaffProfile(userId).finally(() => {
        if (!isGuardian) setLoadingProfile(false);
      });
    }

    if (isGuardian || isAdmin) {
      setLoadingProfile(true);
      fetchGuardianProfile(userId).finally(() => setLoadingProfile(false));
    }
  }, [me?.user._id]);

  const updateStaffProfile = async (data: ProfileUpdatePayload) => {
    setSavingProfile(true);
    try {
      const res = await api.patch("/staffs/me", data);
      if (!res.data.success) throw new Error(res.data.error?.message ?? "Update failed");
      setStaffProfile(res.data.data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Failed to update profile");
      handleAxiosError(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const updateGuardianProfile = async (data: ProfileUpdatePayload) => {
    setSavingProfile(true);
    try {
      const res = await api.patch("/guardians/me", data);
      if (!res.data.success) throw new Error(res.data.error?.message ?? "Update failed");
      setGuardianProfile(res.data.data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error("Failed to update profile");
      handleAxiosError(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const updateProfile = isGuardian ? updateGuardianProfile : updateStaffProfile;

  const profile = (isGuardian ? guardianProfile : staffProfile) as any;

  return {
    me,
    profile,
    staffProfile,
    guardianProfile,
    isStaff,
    isGuardian,
    isAdmin,
    loadingProfile,
    savingProfile,
    updateProfile,
    updateStaffProfile,
    updateGuardianProfile,
  };
}
