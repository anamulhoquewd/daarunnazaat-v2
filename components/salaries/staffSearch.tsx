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
import { SfattWithUser } from "@/hooks/salaries/useSalaryCenter";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Loader2, Search, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const searchSchema = z.object({
  searchQuery: z.string().min(1, "Please enter a search term"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface StaffSearchToPaySalaryProps {
  staffs: SfattWithUser[];
  loading: boolean;
  onSearch: (value: string) => void;
  onSelect: (staff: SfattWithUser) => void;
  selectedStaff: SfattWithUser | null;
}

export function StaffSearchToSalary({
  staffs,
  selectedStaff,
  loading,
  onSearch,
  onSelect,
}: StaffSearchToPaySalaryProps) {
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchQuery: "",
    },
  });

  // When a staff is selected, clear the search input
  useEffect(() => {
    if (selectedStaff) {
      form.reset({ searchQuery: "" });
    }
  }, [selectedStaff, form]);

  const onSubmit = (values: SearchFormValues) => {
    if (values.searchQuery.trim()) {
      onSearch(values.searchQuery);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Staff</CardTitle>
        <CardDescription>
          Search by staff name, ID, phone, or email
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
                  <FormLabel className="sr-only">Search staff</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter staff name, ID, phone, or email..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a search term to find staffs.
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

        {/* Selected staff Info */}
        {selectedStaff && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-900">
                {selectedStaff.fullName}
              </p>
              <p className="text-sm text-green-700">
                ID: {selectedStaff.staffId}
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
        {staffs.length > 0 && !selectedStaff && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Found {staffs.length} staff(s):
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {staffs.map((staff) => (
                <button
                  key={staff.staffId}
                  onClick={() => onSelect(staff)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{staff.fullName}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-1">
                        <p>ID: {staff.staffId}</p>
                        <p>
                          Phone: {staff?.user?.phone || staff?.whatsApp || "N/A"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Email: {staff?.user?.email || "N/A"}
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
          staffs.length === 0 &&
          !selectedStaff && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No staffs found. Try a different search term.
              </AlertDescription>
            </Alert>
          )}
      </CardContent>
    </Card>
  );
}
