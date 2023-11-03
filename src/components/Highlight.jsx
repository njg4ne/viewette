import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CloseIcon from "@mui/icons-material/Close";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import CommentIcon from "@mui/icons-material/Comment";

import { highlights, tags } from "../signals/Filesystems";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  // color: "black"
};

function TagModal({ tids }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [checked, setChecked] = React.useState([0]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  return (
    <>
      <Stack direction="row" justifyContent="center">
        <Button
          onClick={handleOpen}
          sx={{
            my: 1,
            bgcolor: "white",
            color: "black",
            "&:hover": {
              bgcolor: "grey.300",
            },
          }}
        >
          Edit Tags
        </Button>
        {/* <Button color="primary" variant="contained" > Text </Button> */}
      </Stack>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container maxWidth="xs" id="content">
          <Paper sx={{ minHeight: "100vh" }} elevation={3}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton
                onClick={handleClose}
                sx={{ my: 2, p: 0.5, borderRadius: 2 }}
              >
                <CloseIcon sx={{ color: "red", fontSize: 36 }} />
              </IconButton>
            </Box>
            <Typography variant="h4" sx={{ textAlign: "center", m: 1 }}>
              Edit Tags
            </Typography>
            {tids.map((tid, i) => (
              <Chip
                key={i}
                sx={{
                  mr: 0.35,
                  mt: 0.35,
                  bgcolor: "primary.dark",
                  color: "primary.contrastText",
                }}
                label={tags.value[tid]}
              />
            ))}
            <List
              sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
            >
              {tids.map((value) => {
                const labelId = `checkbox-list-label-${value}`;

                return (
                  <ListItem
                    key={value}
                    secondaryAction={
                      <IconButton edge="end" aria-label="comments">
                        <CommentIcon />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemButton
                      role={undefined}
                      onClick={handleToggle(value)}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={checked.indexOf(value) !== -1}
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ "aria-labelledby": labelId }}
                        />
                      </ListItemIcon>
                      <ListItemText id={labelId} primary={`Tag ID ${value}`} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Container>
      </Modal>
    </>
  );
}

const Highlight = ({ snippet, tids }) => {
  return (
    <Card sx={{ p: 1, bgcolor: "primary.main" }} component="details">
      <Box
        variant="p"
        component="summary"
        sx={{ color: "primary.contrastText" }}
        dangerouslySetInnerHTML={{ __html: snippet }}
      />
      <Stack
        direction="row"
        sx={{ bgcolor: "", flexWrap: "wrap", justifyContent: "center", py: 1 }}
      >
        {tids.map((tid, i) => (
          <Chip
            key={i}
            sx={{
              mr: 0.35,
              mt: 0.35,
              bgcolor: "primary.dark",
              color: "primary.contrastText",
            }}
            label={tags.value[tid]}
          />
        ))}
      </Stack>
      <TagModal tids={tids} />
    </Card>
  );
};

export default Highlight;

const ListedHighights = () => {
  return (
    <Stack spacing={2}>
      {highlights.value.map(({ id, snippet, tags: tids }, idx) => (
        <Highlight key={id} snippet={snippet} tids={tids} />
      ))}
    </Stack>
  );
};

export { ListedHighights };
