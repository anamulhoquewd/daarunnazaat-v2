"use client";

import api from "@/axios/intercepter";
import { handleAxiosError } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useGuardianStudents(guardianId: string | undefined) {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!guardianId) return;
    setIsLoading(true);
    api
      .get(`/students?guardianId=${guardianId}&limit=100`)
      .then((res) => setStudents(res.data.data ?? []))
      .catch(handleAxiosError)
      .finally(() => setIsLoading(false));
  }, [guardianId]);

  return { students, isLoading };
}

export function useStudentExamResults(studentId: string | undefined) {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setIsLoading(true);
    api
      .get(`/my-students/${studentId}/exam-results`)
      .then((res) => setResults(res.data.data ?? []))
      .catch(handleAxiosError)
      .finally(() => setIsLoading(false));
  }, [studentId]);

  return { results, isLoading };
}

export function useStudentExamFees(studentId: string | undefined) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setIsLoading(true);
    api
      .get(`/my-students/${studentId}/exam-fees`)
      .then((res) => setEnrollments(res.data.data ?? []))
      .catch(handleAxiosError)
      .finally(() => setIsLoading(false));
  }, [studentId]);

  return { enrollments, isLoading };
}
