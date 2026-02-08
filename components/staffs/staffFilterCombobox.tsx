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

type StaffItem = {
  _id: string;
  staffId: string;
  user: { _id: string };
};

interface Props {
  value?: string; // collectedBy
  onChange: (key: "collectedBy", value: string) => void;
}

export function StaffFilterCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [staffs, setStaffs] = useState<StaffItem[]>([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔄 search change হলে reset
  useEffect(() => {
    setStaffs([]);
    setPage(1);
    setNextPage(null);
  }, [search]);

  // 🔥 fetch function (infinite)
  const fetchStaffs = async () => {
    if (loading) return;
    if (page !== 1 && nextPage === null) return;

    setLoading(true);

    const res = await api.get(`/staffs?search=${search}&page=${page}`);
    if (!res.data.success) {
      throw new Error(res.data.error.message);
    }

    setStaffs(res.data.data);
    setNextPage(res.data.pagination?.nextPage);
    setPage(res.data.pagination?.nextPage ?? page);

    setLoading(false);
  };

  // initial + search trigger
  useEffect(() => {
    fetchStaffs();
    // eslint-disable-next-line hooks/exhaustive-deps
  }, [search]);

  const selectedStaff: StaffItem | undefined = staffs.find(
    (c) => c.user._id === value,
  );

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        Collected By (Staff ID)
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {selectedStaff?.staffId || "Select class..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <p className="text-xs text-muted-foreground ml-2.5">
          {selectedStaff?.user?._id}
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
                  fetchStaffs(); // 🔥 next page
                }
              }}
            >
              <CommandEmpty>
                {loading ? "Loading..." : "No staff found"}
              </CommandEmpty>
              <CommandGroup>
                {staffs.map((item) => (
                  <CommandItem
                    key={item._id}
                    value={item.staffId}
                    onSelect={() => {
                      onChange("collectedBy", item.user._id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.user._id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {item.staffId}
                  </CommandItem>
                ))}
              </CommandGroup>

              {loading && (
                <div className="p-2 text-xs text-center text-muted-foreground">
                  Loading more...
                </div>
              )}

              {nextPage === null && staffs.length > 0 && (
                <div className="p-2 text-xs text-center text-muted-foreground">
                  No more staffs
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
