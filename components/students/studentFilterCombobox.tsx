"use client";

import api from "@/axios/intercepter";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

type StudentItem = {
  _id: string;
  studentId: string;
};

interface Props {
  value?: string; // studentId
  onChange: (key: "studentId", value: string) => void;
}

export function SttudentFilterCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔄 search change হলে reset
  useEffect(() => {
    setStudents([]);
    setPage(1);
    setNextPage(null);
  }, [search]);

  // 🔥 fetch function (infinite)
  const fetchStudents = async () => {
    if (loading) return;
    if (page !== 1 && nextPage === null) return;

    setLoading(true);

    const res = await api.get(`/students?search=${search}&page=${page}`);
    if (!res.data.success) {
      throw new Error(res.data.error.message);
    }

    setStudents(res.data.data);
    setNextPage(res.data.pagination?.nextPage);
    setPage(res.data.pagination?.nextPage ?? page);

    setLoading(false);
  };

  // initial + search trigger
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line hooks/exhaustive-deps
  }, [search]);

  const selectedStudent: StudentItem | undefined = students.find(
    (c) => c._id === value,
  );

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Student</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {selectedStudent?.studentId || "Select class..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <p className="text-xs text-muted-foreground ml-2.5">
          {selectedStudent?._id}
        </p>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Search class..."
              value={search}
              onValueChange={setSearch}
            />

            <CommandList
              className="max-h-[220px] overflow-y-auto"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                  fetchStudents(); // 🔥 next page
                }
              }}
            >
              <CommandEmpty>
                {loading ? "Loading..." : "No Student found"}
              </CommandEmpty>
              <CommandGroup>
                {students.map((item) => (
                  <CommandItem
                    key={item._id}
                    value={item.studentId}
                    onSelect={() => {
                      onChange("studentId", item._id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item._id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {item.studentId}
                  </CommandItem>
                ))}
              </CommandGroup>

              {loading && (
                <div className="p-2 text-xs text-center text-muted-foreground">
                  Loading more...
                </div>
              )}

              {nextPage === null && students.length > 0 && (
                <div className="p-2 text-xs text-center text-muted-foreground">
                  No more students
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
