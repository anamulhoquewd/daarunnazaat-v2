import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string) => void;
}

export function SessionBottomFilter({ filters, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* SORT BY */}
      <div>
        <Select
          value={filters.sortBy as string}
          onValueChange={(v) => onChange("sortBy", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sessionName">Session Name</SelectItem>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="updatedAt">Updated Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* SORT TYPE */}
      <div>
        <Select
          value={filters.sortType as string}
          onValueChange={(v) => onChange("sortType", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sort type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PAGE LIMIT */}
      <div>
        <Select
          value={filters.limit as string}
          onValueChange={(v) => onChange("limit", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select page limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
