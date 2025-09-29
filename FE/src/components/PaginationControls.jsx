import { Pagination, Select, MenuItem } from "@mui/material";

const pageNumbers = [5, 10, 15, 20];

const PaginationControls = ({
  page,
  count,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <div className="flex m-4 justify-between">
      <div className="ml-5 text-black">
        <span>Records per page : </span>
        <Select
          variant="standard"
          disableUnderline={true}
          className="m-2 text-center w-15"
          value={rowsPerPage}
          onChange={onRowsPerPageChange}
          autoWidth
        >
          {pageNumbers.map((num) => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </Select>
      </div>
      <Pagination
        showFirstButton
        showLastButton
        count={count}
        page={page}
        onChange={onPageChange}
        size="large"
        className="self-center"
      />
    </div>
  );
};

export default PaginationControls;
