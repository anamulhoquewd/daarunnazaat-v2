import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IPagination } from "@/validations";
import { Dispatch, SetStateAction } from "react";

function Paginations({
  pagination,
  setPagination,
}: {
  pagination: IPagination;
  setPagination: Dispatch<SetStateAction<IPagination>>;
}) {
  console.log(pagination);
  return (
    <div>
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
