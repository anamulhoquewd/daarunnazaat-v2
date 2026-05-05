import { IPagination } from "@/validations";

// Interface of props
interface PaginationProps {
  page: number;
  limit: number;
  total: number;
}

// Pagination
const pagination = ({ page, limit, total }: PaginationProps): IPagination => {
  const totalPages = Math.ceil(total / limit);

  // Always include nextPage and prevPage; use null when not applicable
  const pagination: IPagination = {
    page,
    limit,
    total,
    totalPages,
    nextPage: null,
    prevPage: null,
  };

  if (page < totalPages) {
    pagination.nextPage = page + 1;
  }
  if (page > 1) {
    pagination.prevPage = page - 1;
  }

  return pagination;
};

export default pagination;
