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
import { useState } from "preact/compat";
import { TaguetteDb } from "../../db";
import { useSearchParams } from "react-router-dom";
import { useRef, useEffect } from "preact/compat";
// import { db } from "../../db/models/TaguetteDb";

export default function CreateTagForm() {
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKey = "newTag";
  const newTag = searchParams.get(searchKey) || "";

  // const { createTagFieldRef } = useTreeContext();
  const createTagFieldRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (createTagFieldRef.current) {
      setTimeout(() => {
        createTagFieldRef.current?.focus();
      }, 0);
    }
  }, [newTag]);

  // const onChangeInput = (e: Event) => {
  //   setCreateTagValue((e.target as HTMLInputElement).value);
  // };
  const onChangeInput = (e: InputEvent) => {
    const newValue = (e.target as HTMLInputElement).value.trimStart();
    setSearchParams(
      (sp: URLSearchParams) => {
        if (newValue === "") {
          sp.delete(searchKey);
        } else {
          sp.set(searchKey, newValue);
        }
        return sp;
      },
      { replace: true }
    );
  };
  const onReset = () => {
    setSearchParams(
      (sp: URLSearchParams) => {
        sp.delete(searchKey);
        return sp;
      },
      { replace: true }
    );
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
        onReset={onReset}
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
          // value={createTagValue}
          value={newTag}
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
