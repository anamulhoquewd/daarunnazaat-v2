import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";
import { IPagination } from "@/interfaces";

function Paginations({
  pagination,
  setPagination,
}: {
  pagination: IPagination;
  setPagination: Dispatch<SetStateAction<IPagination>>;
}) {
  return (
    <div className="flex items-center justify-center sm:justify-end space-x-2.5 py-4">
      <Button
        variant={"outline"}
        className="cursor-pointer text-xs sm:text-sm"
        size="sm"
        onClick={() =>
          setPagination((prev) => ({
            ...prev,
            page: prev.prevPage !== null ? prev.prevPage : prev.page,
          }))
        }
        disabled={pagination.prevPage === null}
      >
        Previous
      </Button>

      <Badge variant="outline" className="py-2 px-2">
        Page {pagination.page} of {pagination.totalPages}
      </Badge>

      <Button
        onClick={() =>
          setPagination((prev) => ({
            ...prev,
            page: prev.nextPage !== null ? prev.nextPage : prev.page,
          }))
        }
        disabled={pagination.nextPage === null}
        variant={"outline"}
        className="cursor-pointer text-xs sm:text-sm"
        size="sm"
      >
        Next
      </Button>
    </div>
  );
}

export default Paginations;
