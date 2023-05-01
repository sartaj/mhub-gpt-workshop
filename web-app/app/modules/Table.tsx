import { useState } from "react";

interface Props {
  data: { [s: string]: any }[];
  itemsPerPage: number;
}

export const Table = ({ data, itemsPerPage }: Props) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const pageCount = Math.ceil(data.length / itemsPerPage);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = data.slice(startIndex, endIndex);

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className={`mx-auto overflow-x-auto max-w-3xl`}>
      <table className="table-auto bg-white border-collapse border-gray-300 text-sm text-gray-700 w-full">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <div className="flex items-center">
          <span className="mr-2">Page:</span>
          <select
            className="bg-white border border-gray-400 rounded py-1 px-3"
            value={currentPage}
            onChange={(event) => handlePageChange(Number(event.target.value))}
          >
            {pages.map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
          <span className="ml-2">of {pageCount}</span>
        </div>
      </div>
    </div>
  );
};
