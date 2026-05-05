import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function useExamDetail(id: string) {
  const [exam, setExam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [feesSummary, setFeesSummary] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const fetchExam = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/exams/${id}`);
      setExam(res.data.data);
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollments = async (classId?: string, feeStatus?: string) => {
    setEnrollmentsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (classId) params.append("classId", classId);
      if (feeStatus) params.append("feeStatus", feeStatus);
      const res = await api.get(`/exams/${id}/enrollments?${params}`);
      setEnrollments(res.data.data ?? []);
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const fetchFeesSummary = async () => {
    try {
      const res = await api.get(`/exams/${id}/fees-summary`);
      setFeesSummary(res.data.data);
    } catch (e) {
      handleAxiosError(e);
    }
  };

  const fetchResults = async (classId?: string) => {
    setResultsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (classId) params.append("classId", classId);
      const res = await api.get(`/exams/${id}/results?${params}`);
      setResults(res.data.data ?? []);
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setResultsLoading(false);
    }
  };

  const enrollClass = async (classId: string) => {
    try {
      await api.post(`/exams/${id}/enroll-class/${classId}`);
      toast.success("Class enrolled successfully");
      fetchEnrollments();
    } catch (e) {
      handleAxiosError(e);
    }
  };

  const publishResults = async () => {
    try {
      await api.post(`/exams/${id}/publish-results`);
      toast.success("Results published successfully");
      fetchExam();
    } catch (e) {
      handleAxiosError(e);
    }
  };

  const recalculatePositions = async (classId?: string) => {
    try {
      const params = classId ? `?classId=${classId}` : "";
      await api.post(`/exams/${id}/recalculate-positions${params}`);
      toast.success("Positions recalculated");
      fetchResults(selectedClassId || undefined);
    } catch (e) {
      handleAxiosError(e);
    }
  };

  useEffect(() => {
    if (id) fetchExam();
  }, [id]);

  return {
    exam,
    isLoading,
    enrollments,
    enrollmentsLoading,
    feesSummary,
    results,
    resultsLoading,
    selectedClassId,
    setSelectedClassId,
    fetchEnrollments,
    fetchFeesSummary,
    fetchResults,
    enrollClass,
    publishResults,
    recalculatePositions,
    refetch: fetchExam,
  };
}

export default useExamDetail;
