import api from "@/axios/intercepter";
import { buildQuery, defaultPagination, handleAxiosError } from "@/lib/utils";
import { IPagination, IStudent } from "@/validations";
import { useEffect, useState } from "react";
import { useDebounce } from "../common/useDebounce";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface IFilter {
  dateRange: DateRange | undefined;
}

interface ISearch {
  global: string;
  classId: string;
  sessionId: string;
  guardianId: string;
}

function useStudentQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<IStudent[]>([]);
  const [pagination, setPagination] = useState<IPagination>(defaultPagination);
  const [search, setSearch] = useState<ISearch>({
    classId: "",
    sessionId: "",
    guardianId: "",
    global: "",
  });
  const [values, setValues] = useState<IStudent | null>(null);
  const [filterBy, setFilterBy] = useState<IFilter>({
    dateRange: undefined as DateRange | undefined,
  });

  // ✅ debounce only search
  const debouncedGlobalSearch = useDebounce(search.global, 700);
  const debouncedGuardianSearch = useDebounce(search.guardianId, 700);
  const debouncedClassSearch = useDebounce(search.classId, 700);
  const debouncedSessionSearch = useDebounce(search.sessionId, 700);

  const getStudents = async ({ search, filters, page }) => {
    setIsLoading(true);

    try {
      const query = buildQuery({
        page,
        search: search.global,
        classId: search.classId,
        sessionId: search.sessionId,
        guardianId: search.guardianId,
        fromDate: filters?.dateRange?.from
          ? format(filters.dateRange.from, "yyyy-MM-dd")
          : undefined,
        toDate: filters?.dateRange?.to
          ? format(filters.dateRange.to, "yyyy-MM-dd")
          : undefined,
      });

      const res = await api.get(`/students?${query}`);

      if (!res.data.success) {
        throw new Error(res.data.error.message);
      }

      setStudents(res.data.data || []);
      setPagination(res.data.pagination);
    } catch (err) {
      handleAxiosError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filterBy.dateRange?.from && filterBy.dateRange?.to) count++;
    if (debouncedClassSearch) count++;
    if (debouncedSessionSearch) count++;
    if (debouncedGlobalSearch) count++;
    if (debouncedGuardianSearch) count++;

    return count;
  };

  // 🔥 API call only when debounced search OR page/limit changes
  useEffect(() => {
    getStudents({
      search: {
        global: debouncedGlobalSearch,
        guardianId: debouncedGuardianSearch,
        sessionId: debouncedSessionSearch,
        classId: debouncedClassSearch,
      },
      filters: filterBy,
      page: pagination.page,
    });
  }, [
    debouncedGlobalSearch,
    debouncedClassSearch,
    debouncedSessionSearch,
    debouncedGuardianSearch,

    filterBy.dateRange,
  ]);

  const handleClearFilters = () => {
    setFilterBy({
      dateRange: { from: undefined, to: undefined },
    });
    setSearch({
      classId: "",
      sessionId: "",
      guardianId: "",
      global: "",
    });
  };

  return {
    students,
    isLoading,
    pagination,
    setPagination,
    refetch: getStudents,
    setValues,
    setSearch,
    search,
    filterBy,
    setFilterBy,
    activeFilterCount,
    handleClearFilters,
  };
}

export default useStudentQuery;
