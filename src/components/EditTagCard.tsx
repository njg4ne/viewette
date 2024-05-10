import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useLoadingContext } from "../contexts/LoadingContext";
import { useSnackbar } from "notistack";
import { useState, useEffect } from "preact/compat";

export function EditTagCard({ tag }: { tag: Taguette.Tag }) {
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    // if (loading || !signalReady(opfsDb)) return;
    // const dbv: TaguetteDb = opfsDb.value;
    await db.update.tag({ ...tag, description: form.description });
  };
  const onReset = (e?: Event) => {
    e?.preventDefault();
    setForm({ description: tag.description });
  };
  const [form, setForm] = useState({ description: "" });

  useEffect(() => {
    onReset();
  }, [tag]);
  const saveDisabled =
    loading ||
    form.description === tag.description ||
    form.description.trim().length === 0;
  const resetDisabled = loading || form.description === tag.description;
  return (
    <Card component="form" {...{ onSubmit }} value={tag} onReset={onReset}>
      <CardContent>
        <Typography color="text.secondary">Tag Path</Typography>
        <Typography fontSize={"1.5rem"}>{tag.path}</Typography>

        {/* <Typography color="text.secondary" gutterBottom>
              Description
            </Typography> */}
        <Typography color="text.secondary">Description</Typography>
        <TextField
          multiline
          id="description-editor"
          // label="Edit Description"
          variant="standard"
          onChange={(e: Event) => {
            setForm({ description: (e.target as HTMLInputElement).value });
          }}
          value={form.description}
          fullWidth
          inputProps={{ "aria-label": "edit tag description" }}
          sx={
            {
              // wordWrap: "break-word", whiteSpace: "normal",
            }
          }
          name="description"
        />
      </CardContent>
      <Stack
        component={CardActions}
        direction="row"
        // justifyContent="space-around"
        sx={{
          marginBottom: 1,
          marginLeft: 1,
        }}
        spacing={1}
      >
        <Button type="submit" disabled={saveDisabled} variant="outlined">
          Save
        </Button>
        <Button type="reset" disabled={resetDisabled} variant="outlined">
          Reset
        </Button>
      </Stack>
    </Card>
  );
}
