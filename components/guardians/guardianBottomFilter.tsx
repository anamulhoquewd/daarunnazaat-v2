import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  filters: Record<string, string | boolean | undefined>;
  onChange: (key: string, value: string | boolean) => void;
}

export function GuardianBottomFilter({ filters, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={(filters.sortWith as string) || "createdAt"}
        onValueChange={(v) => onChange("sortWith", v)}
      >
        <SelectTrigger className="h-8 text-xs w-36">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="guardianId">Guardian ID</SelectItem>
          <SelectItem value="fullName">Full Name</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="createdAt">Created Date</SelectItem>
          <SelectItem value="updatedAt">Updated Date</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={(filters.sortOrder as string) || "desc"}
        onValueChange={(v) => onChange("sortOrder", v)}
      >
        <SelectTrigger className="h-8 text-xs w-32">
          <SelectValue placeholder="Sort order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={(filters.limit as string) || "10"}
        onValueChange={(v) => onChange("limit", v)}
      >
        <SelectTrigger className="h-8 text-xs w-20">
          <SelectValue placeholder="Per page" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
