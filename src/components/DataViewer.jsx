import * as React from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { filteredHighlights as highlights, tags } from "../signals";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton sx={{ color: "red" }} />
      {/* <GridToolbarDensitySelector />
      <GridToolbarExport /> */}
    </GridToolbarContainer>
  );
}

// todo add virtualization
const columns = [
  // { field: "id", headerName: "ID", width: 1 },
  {
    field: "snippet",
    headerName: "Highlight",
    flex: 1,
    sortable: false,
    filterable: true,
    // hideable: false,
    renderCell(params) {
      return (
        <Typography
          dangerouslySetInnerHTML={{ __html: params.value }}
        ></Typography>
      );
    },
  },
  {
    field: "tags",
    headerName: "Tags",
    flex: 1,
    filterable: false,
    // valueGetter: (params) => {
    //   return params.value?.map((tid) => tags.value[tid]);
    // },
    renderCell: (params) => {
      //getter should convert to array of strings
      return (
        <Stack
          direction="row"
          sx={{
            bgcolor: "",
            flexWrap: "wrap",
            // justifyContent: "center",
            py: 1,
          }}
        >
          {params.value?.map((tag, i) => (
            <Chip
              key={i}
              sx={{
                mr: 0.35,
                mt: 0.35,
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
              label={tag}
            />
          ))}
        </Stack>
      );
    },
  },
];

export default function DataViewer() {
  const navigate = useNavigate();
  const [searchParams, _] = useSearchParams();
  function onRowClick(params, e, d) {
    const hlId = params.row.id;
    const tags = searchParams.get("tags");
    const queryStr = tags ? `?tags=${tags}` : "";
    navigate(`/highlights/${hlId}${/*queryStr*/ ""}`);
  }

  return (
    // <Box sx={{ height: 400, width: "100%" }}>
    <DataGrid
      onRowClick={onRowClick}
      sx={{ width: "auto", minHeight: "5in" }}
      rows={highlights.value}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 7,
          },
        },
        // filterModel: {
        //   items: [
        //     { columnField: "tags", operator: "contains", value: "test" },
        //     // { columnField: "snippet", operator: "contains", value: "test" }
        //   ],
        // },
      }}
      pageSizeOptions={[10]}
      disableColumnFilter
      disableColumnSorting
      checkboxSelection
      // disableRowSelectionOnClick
      // disableColumnSelector
      getRowHeight={() => "auto"}
    // filterModel={{
    //   // items: [{ field: 'snippet', operator: 'contains', value: 'accel' }, { field: 'tags', operator: 'contains', value: 'accel' }],
    // }}
    // slots={{
    //   toolbar: GridToolbar
    // }}
    // slotProps={{
    //   toolbar: {
    //     showQuickFilter: true,
    //     sx: {
    //       pt: 2,
    //       pb: 1
    //     },

    //   },
    // }}
    />
    //{" "}
    // </Box>
  );
}
