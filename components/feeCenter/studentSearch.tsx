"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IStudentPopulated } from "@/validations/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Loader2, Search, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const searchSchema = z.object({
  searchQuery: z.string().min(1, "Please enter a search term"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface FeeStudentSearchProps {
  students: IStudentPopulated[];
  loading: boolean;
  onSearch: (value: string) => void;
  onSelect: (student: IStudentPopulated) => void;
  selectedStudent: IStudentPopulated | null;
}

export function FeeStudentSearch({
  students,
  selectedStudent,
  loading,
  onSearch,
  onSelect,
}: FeeStudentSearchProps) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchQuery: "",
    },
  });

  // When a student is selected, clear the search input
  useEffect(() => {
    if (selectedStudent) {
      form.reset({ searchQuery: "" });
    }
  }, [selectedStudent, form]);

  const onSubmit = (values: SearchFormValues) => {
    if (values.searchQuery.trim()) {
      onSearch(values.searchQuery);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Student</CardTitle>
        <CardDescription>
          Search by student name, ID, phone, or email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <FormField
              control={form.control}
              name="searchQuery"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="sr-only">Search student</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter student name, ID, phone, or email..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a search term to find students.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading || !form.watch("searchQuery").trim()}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </Form>

        {/* Selected Student Info */}
        {selectedStudent && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </p>
              <p className="text-sm text-green-700">
                ID: {selectedStudent.studentId}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {form.formState.errors?.searchQuery && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {form.formState.errors.searchQuery?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {students.length > 0 && !selectedStudent && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Found {students.length} student(s):
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student.studentId}
                  onClick={() => onSelect(student)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {student.firstName} {student?.lastName}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-1">
                        <p>ID: {student.studentId}</p>
                        <p>Phone: {student.user?.phone}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Email: {student.user?.email}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          !form.formState.errors?.searchQuery &&
          students.length === 0 &&
          !selectedStudent && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No students found. Try a different search term.
              </AlertDescription>
            </Alert>
          )}
      </CardContent>
    </Card>
  );
}
