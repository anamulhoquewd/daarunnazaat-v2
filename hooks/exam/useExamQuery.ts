import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { IPagination } from "@/validations";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type ExamFilter = {
  academicYear: string;
  type: string;
  status: string;
  limit: string;
};

function useExamQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [pagination, setPaginationState] = useState<IPagination>(defaultPagination);
  const [filterWith, setFilterWith] = useState<ExamFilter>({
    academicYear: "",
    type: "",
    status: "",
    limit: "10",
  });

  const fetchExams = async (filters: ExamFilter, page: number) => {
    setIsLoading(true);
    try {
      const clean = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v && v !== "all"),
      );
      const res = await api.get(`/exams?${buildQuery({ ...clean, page })}`);
      setExams(res.data.data ?? []);
      setPaginationState(res.data.pagination);
    } catch (e) {
      handleAxiosError(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams(filterWith, 1);
  }, [filterWith]);

  const setPagination = (p: IPagination) => fetchExams(filterWith, p.page);
  const refetch = () => fetchExams(filterWith, pagination.page);

  const deleteExam = async (id: string) => {
    try {
      await api.delete(`/exams/${id}`);
      toast.success("Exam deleted successfully");
      refetch();
    } catch (e) {
      handleAxiosError(e);
    }
  };

  const publishResults = async (id: string) => {
    try {
      await api.post(`/exams/${id}/publish-results`);
      toast.success("Results published successfully");
      refetch();
    } catch (e) {
      handleAxiosError(e);
    }
  };

  return {
    exams,
    pagination,
    setPagination,
    isLoading,
    filterWith,
    setFilterWith,
    deleteExam,
    publishResults,
    refetch,
  };
}

export default useExamQuery;
