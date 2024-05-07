import TextField from "@mui/material/TextField";
import { useSnackbar } from "notistack";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import ClearIcon from "@mui/icons-material/Clear";
import { useLoadingContext } from "../../contexts/LoadingContext";
import { dbs, signalReady } from "../../signals";
import { useTreeContext } from "../../contexts/TagTreeContext";
import { useState } from "react";
import { TaguetteDb } from "../../db";
// import { db } from "../../db/models/TaguetteDb";

export default function CreateTagForm() {
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { createTagValue, setCreateTagValue, createTagFieldRef } =
    useTreeContext();

  const onChangeInput = (e: Event) => {
    setCreateTagValue((e.target as HTMLInputElement).value);
  };
  return (
    <>
      {/* <InputLabel htmlFor="newTag">Create Tag</InputLabel> */}
      <Paper
        component="form"
        elevation={0}
        sx={{
          p: ".5rem",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
        onSubmit={async (e: Event) => {
          e.preventDefault();
          if (loading || !signalReady(dbs)) return;
          setLoading(true);

          const formData = new FormData(e.target as HTMLFormElement);
          const newTag = formData.get("newTag") as string;
          if (!newTag) {
            setLoading(false);
            return;
          }
          const db: TaguetteDb = dbs.value;
          db.createTag(newTag)
            .then(
              (newTag: string) => (
                enqueueSnackbar(`Created tag: '${newTag}'`, {
                  variant: "success",
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "right",
                  },
                }),
                setLoading(false)
              )
            )
            .catch((e: Error) => {
              enqueueSnackbar(e, {
                variant: "error",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "right",
                },
              });
              setLoading(false);
            });
        }}
      >
        <TextField
          id="standard-basic"
          label="Create Tag"
          variant="standard"
          fullWidth
          inputRef={createTagFieldRef}
          value={createTagValue}
          onChange={onChangeInput}
          placeholder="tag.subtag.subsubtag"
          inputProps={{ "aria-label": "create a new tag" }}
          sx={
            {
              // wordWrap: "break-word", whiteSpace: "normal",
            }
          }
          name="newTag"
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton sx={{ p: "10px" }} aria-label="menu" type="reset">
          <ClearIcon />
        </IconButton>

        <IconButton sx={{ p: "10px" }} aria-label="menu" type="submit">
          <AddIcon />
        </IconButton>
      </Paper>
    </>
  );
}
