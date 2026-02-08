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

type GuardianItem = {
  _id: string;
  user: { email: string; phone: string };
};

interface Props {
  value?: string; // guardianId
  onChange: (key: "guardianId", value: string) => void;
}

export function GuardianFilterCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [guardians, setGuardians] = useState<GuardianItem[]>([]);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔄 search change হলে reset
  useEffect(() => {
    setGuardians([]);
    setPage(1);
    setNextPage(null);
  }, [search]);

  // 🔥 fetch function (infinite)
  const fetchGuardians = async () => {
    if (loading) return;
    if (page !== 1 && nextPage === null) return;

    setLoading(true);

    const res = await api.get(`/guardians?search=${search}&page=${page}`);
    if (!res.data.success) {
      throw new Error(res.data.error.message);
    }

    setGuardians(res.data.data);
    setNextPage(res.data.pagination?.nextPage);
    setPage(res.data.pagination?.nextPage ?? page);

    setLoading(false);
  };

  // initial + search trigger
  useEffect(() => {
    fetchGuardians();
    // eslint-disable-next-line hooks/exhaustive-deps
  }, [search]);

  const selectedGuardian: GuardianItem | undefined = guardians.find(
    (c) => c._id === value,
  );

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Guardians</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {selectedGuardian?.user?.email || "Select class..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <p className="text-xs text-muted-foreground ml-2.5">
          {selectedGuardian?._id}
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
                  fetchGuardians(); // 🔥 next page
                }
              }}
            >
              <CommandEmpty>
                {loading ? "Loading..." : "No guardian found"}
              </CommandEmpty>
              <CommandGroup>
                {guardians.map((item) => (
                  <CommandItem
                    key={item._id}
                    value={item.user?.email}
                    onSelect={() => {
                      onChange("guardianId", item._id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item._id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {item.user?.email}
                  </CommandItem>
                ))}
              </CommandGroup>

              {loading && (
                <div className="p-2 text-xs text-center text-muted-foreground">
                  Loading more...
                </div>
              )}

              {nextPage === null && guardians.length > 0 && (
                <div className="p-2 text-xs text-center text-muted-foreground">
                  No more guardians
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
