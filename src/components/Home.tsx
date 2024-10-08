import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <Stack spacing={2}>
      <Typography variant="body1" sx={{}}>
        Upload a .sqlite3 database file exported from{" "}
        <Link to="https://www.taguette.org/">Taguette</Link> to view your data.
        A copy will be saved to your browser to view and edit.
      </Typography>
      {/* <Typography variant="body1" sx={{}}>
        Unsupported features include managing documents or projects, editing
        tags by path, merging tags, exporting data, or editing highlights.
        Please use <Link to="https://www.taguette.org/">Taguette</Link> for
        these features at this time.
      </Typography> */}
    </Stack>
  );
}
