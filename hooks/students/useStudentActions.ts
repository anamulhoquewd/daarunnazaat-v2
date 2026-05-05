import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import {
  Branch,
  Gender,
  IClass,
  IGuardian,
  IPagination,
  IStudent,
  IUpdateStudent,
} from "@/validations";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "../common/useDebounce";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface StudentProfile extends IStudent {
  class?: IClass;
  guardian?: IGuardian;
}

interface IFilter {
  dateRange: DateRange | undefined;
  gender: "all" | Gender;
  branch: "all" | Branch;
  residential: "all" | boolean;
  sortOrder?: "asc" | "desc";
  sortWith?: "createdAt" | "updatedAt" | "fullName" | "studentId" | "admissionDate";
  limit?: string;
}

interface ISearch {
  global: string;
  classId: string;
  sessionId: string;
  guardianId: string;
}

// ─── List hook ────────────────────────────────────────────────────────────────

function useStudentQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [students, setStudents] = useState<IStudent[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);

  const [search, setSearch] = useState<ISearch>({
    global: "",
    classId: "",
    sessionId: "",
    guardianId: "",
  });

  const [filterWith, setfilterWith] = useState<IFilter>({
    dateRange: { from: undefined, to: undefined },
    residential: "all",
    branch: "all",
    gender: "all",
    sortWith: "createdAt",
    sortOrder: "desc",
    limit: "10",
  });

  const debouncedGlobal    = useDebounce(search.global, 700);
  const debouncedClassId   = useDebounce(search.classId, 700);
  const debouncedSessionId = useDebounce(search.sessionId, 700);
  const debouncedGuardianId = useDebounce(search.guardianId, 700);

  // ── Core fetch ──────────────────────────────────────────────────────────────

  const buildListQuery = (page: number) =>
    buildQuery({
      page,
      search: debouncedGlobal,
      classId: debouncedClassId,
      sessionId: debouncedSessionId,
      guardianId: debouncedGuardianId,
      fromDate: filterWith.dateRange?.from
        ? format(filterWith.dateRange.from, "yyyy-MM-dd")
        : undefined,
      toDate: filterWith.dateRange?.to
        ? format(filterWith.dateRange.to, "yyyy-MM-dd")
        : undefined,
      isResidential: filterWith.residential === "all" ? undefined : filterWith.residential,
      branch:        filterWith.branch      === "all" ? undefined : filterWith.branch,
      gender:        filterWith.gender      === "all" ? undefined : filterWith.gender,
      sortWith:   filterWith.sortWith,
      sortOrder: filterWith.sortOrder,
      limit:    filterWith.limit,
    });

  const fetchStudents = async (page = pagination.page) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/students?${buildListQuery(page)}`);
      if (res.data.error) throw new Error(res.data.error.message);
      setStudents(res.data.data ?? []);
      setPagination(res.data.pagination);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Status mutations (activate / block / soft-delete / restore) ─────────────

  const mutateStatus = async (
    studentId: string,
    endpoint: string,
    successMsg: string,
    errorMsg: string,
  ) => {
    setIsLoading(true);
    try {
      const res = await api.patch(`/students/${studentId}/${endpoint}`);
      if (!res.data.success) throw new Error(res.data.error?.message ?? errorMsg);
      toast.success(res.data.success?.message ?? successMsg);
      await fetchStudents();
    } catch (err) {
      toast.error(errorMsg);
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeUser   = (id: string) => mutateStatus(id, "activate",   "Activated",   "Failed to activate");
  const deactiveUser = (id: string) => mutateStatus(id, "deactivate", "Deactivated", "Failed to deactivate");
  const blockUser    = (id: string) => mutateStatus(id, "block",      "Blocked",     "Failed to block");
  const unblockUser  = (id: string) => mutateStatus(id, "unblock",    "Unblocked",   "Failed to unblock");
  const deleteUser   = (id: string) => mutateStatus(id, "delete",     "Soft-deleted","Failed to delete");
  const restoreUser  = (id: string) => mutateStatus(id, "restore",    "Restored",    "Failed to restore");

  // ── Permanent delete ────────────────────────────────────────────────────────

  const handleDelete = async (studentId: string) => {
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/students/${studentId}/permanently`);
      if (!res.data.success) throw new Error(res.data.error?.message ?? "Delete failed");
      toast.success("Student permanently deleted");
      await fetchStudents();
    } catch (err) {
      toast.error("Failed to permanently delete student");
      handleAxiosError(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Exports ─────────────────────────────────────────────────────────────────

  const buildExportQuery = () =>
    buildQuery({
      search: debouncedGlobal,
      classId: debouncedClassId,
      sessionId: debouncedSessionId,
      guardianId: debouncedGuardianId,
      fromDate: filterWith.dateRange?.from ?? undefined,
      toDate:   filterWith.dateRange?.to   ?? undefined,
      isResidential: filterWith.residential === "all" ? undefined : filterWith.residential,
      branch:        filterWith.branch      === "all" ? undefined : filterWith.branch,
      gender:        filterWith.gender      === "all" ? undefined : filterWith.gender,
      sortWith:   filterWith.sortWith,
      sortOrder: filterWith.sortOrder,
    });

  const handleExportAsPDF = async () => {
    setIsLoading(true);
    try {
      const res = await api.post(`/exports/students/pdf?${buildExportQuery()}`, null, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `students_${format(new Date(), "dd_MMM_yyyy_hh:mm_a")}.pdf`,
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAsSheet = async () => {
    setIsLoading(true);
    try {
      await api.post(`/exports/students/sheet?${buildExportQuery()}`, null);
      toast.success("Sheet exported");
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Filter helpers ──────────────────────────────────────────────────────────

  const activeFilterCount = () => {
    let n = 0;
    if (filterWith.dateRange?.from && filterWith.dateRange?.to) n++;
    if (filterWith.branch      !== "all") n++;
    if (filterWith.residential !== "all") n++;
    if (filterWith.gender      !== "all") n++;
    if (debouncedClassId.trim())     n++;
    if (debouncedSessionId.trim())   n++;
    if (debouncedGlobal.trim())      n++;
    if (debouncedGuardianId.trim())  n++;
    return n;
  };

  const handleClearFilters = () => {
    setfilterWith({
      dateRange: { from: undefined, to: undefined },
      residential: "all",
      gender: "all",
      branch: "all",
      sortWith: "createdAt",
      sortOrder: "desc",
      limit: "10",
    });
    setSearch({ global: "", classId: "", sessionId: "", guardianId: "" });
  };

  const updateFilter = (key: string, value: string) => {
    if (key === "classId" || key === "guardianId") {
      setSearch((prev) => ({ ...prev, [key]: value }));
      return;
    }
    if (key === "residential") {
      setfilterWith((prev) => ({
        ...prev,
        residential: value === "all" ? "all" : value === "true",
      }));
      setPagination((prev) => ({ ...prev, page: 1 }));
      return;
    }
    setfilterWith((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const combinedFilters = useMemo<Record<string, string | boolean | undefined>>(
    () => {
      const { dateRange, ...rest } = filterWith;
      return { ...rest, classId: search.classId, guardianId: search.guardianId };
    },
    [filterWith, search.classId, search.guardianId],
  );

  // ── Effect ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStudents(pagination.page);
  }, [
    debouncedGlobal,
    debouncedClassId,
    debouncedSessionId,
    debouncedGuardianId,
    filterWith,
    pagination.page,
  ]);

  return {
    students,
    isLoading,
    deleteLoading,
    pagination,
    setPagination,
    search,
    setSearch,
    filterWith,
    setfilterWith,
    combinedFilters,
    activeFilterCount,
    handleClearFilters,
    updateFilter,
    handleExportAsPDF,
    handleExportAsSheet,
    handleDelete,
    activeUser,
    deactiveUser,
    blockUser,
    unblockUser,
    deleteUser,
    restoreUser,
  };
}

// ─── Detail hook ──────────────────────────────────────────────────────────────

export const useStudentActions = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState({
    fetch: false,
    update: false,
    action: false,
  });

  const getStudentById = async (studentId: string) => {
    setLoading((p) => ({ ...p, fetch: true }));
    try {
      const res = await api.get(`/students/${studentId}`);
      if (!res.data) throw new Error("Failed to fetch student");
      setStudent(res.data);
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setLoading((p) => ({ ...p, fetch: false }));
    }
  };

  const handleUpdate = async (data: IUpdateStudent) => {
    if (!id) return;
    setLoading((p) => ({ ...p, update: true }));
    try {
      const res = await api.patch(`/students/${id}`, data);
      if (!res.data) throw new Error("Update failed");
      setStudent(res.data);
      toast.success("Updated successfully");
    } catch (e) {
      toast.error("Update failed");
      if (id) await getStudentById(id);
    } finally {
      setLoading((p) => ({ ...p, update: false }));
    }
  };

  const mutateStatus = async (
    endpoint: string,
    successMsg: string,
    errorMsg: string,
  ) => {
    if (!id) return;
    setLoading((p) => ({ ...p, action: true }));
    try {
      const res = await api.patch(`/students/${id}/${endpoint}`);
      if (!res.data.success)
        throw new Error(res.data.error?.message ?? errorMsg);
      toast.success(res.data.success?.message ?? successMsg);
      await getStudentById(id);
    } catch (e) {
      toast.error(errorMsg);
      handleAxiosError(e);
    } finally {
      setLoading((p) => ({ ...p, action: false }));
    }
  };

  const permanentDeleteStudent = async () => {
    if (!id) return;
    setLoading((p) => ({ ...p, action: true }));
    try {
      const res = await api.delete(`/students/${id}/permanently`);
      if (!res.data.success)
        throw new Error(res.data.error?.message ?? "Delete failed");
      toast.success("Student permanently deleted");
      router.push("/dashboard/students");
    } catch (e) {
      toast.error("Failed to permanently delete student");
      handleAxiosError(e);
    } finally {
      setLoading((p) => ({ ...p, action: false }));
    }
  };

  const activateStudent = () =>
    mutateStatus("activate", "Student activated", "Failed to activate");
  const deactivateStudent = () =>
    mutateStatus("deactivate", "Student deactivated", "Failed to deactivate");
  const blockStudent = () =>
    mutateStatus("block", "Student blocked", "Failed to block");
  const unblockStudent = () =>
    mutateStatus("unblock", "Student unblocked", "Failed to unblock");
  const softDeleteStudent = () =>
    mutateStatus("delete", "Student soft-deleted", "Failed to delete");
  const restoreStudent = () =>
    mutateStatus("restore", "Student restored", "Failed to restore");

  useEffect(() => {
    if (id) getStudentById(id);
  }, [id]);

  return {
    student,
    loading,
    handleUpdate,
    getStudentById,
    activateStudent,
    deactivateStudent,
    blockStudent,
    unblockStudent,
    softDeleteStudent,
    restoreStudent,
    permanentDeleteStudent,
  };
};

export default useStudentQuery;
