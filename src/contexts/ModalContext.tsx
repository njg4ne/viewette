import { useState, useContext, useEffect, useRef } from "preact/hooks";
import type { StateUpdater, Dispatch } from "preact/hooks";
import { ChangeEvent, ReactNode, createContext } from "preact/compat";
type ModalActions = Record<string, [ReactNode, () => void]>;
export const ModalContext = createContext({
  setModalActions: (() => {}) as Dispatch<StateUpdater<ModalActions>>,
});
import * as popups from "../popups";
import { useSnackbar } from "notistack";
import { useId } from "preact/compat";

export function ModalProvider({ children }: { children: ReactNode }) {
  //
  const [actions, setActions] = useState<ModalActions>({
    // test: () => console.log("test"),
  });
  const clearActions = () => setActions({});
  function act(action?: string) {
    setActions((prev) => {
      if (action) {
        const [, fn] = prev[action];
        if (fn) {
          fn();
        }
      }
      return {};
    });
  }

  return (
    <ModalContext.Provider value={{ setModalActions: setActions }}>
      <>
        {children}
        <ConfirmationDialog actions={actions} act={act} />
      </>
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

// import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";

// const options = ["Merge to", "Nest under"];

export interface ConfirmationDialogRawProps {
  id: string;
  keepMounted: boolean;
  value: string;
  open: boolean;
  onClose: (value?: string) => void;
  options: [string, ReactNode][];
}

function ConfirmationDialogRaw(props: ConfirmationDialogRawProps) {
  const { onClose, value: valueProp, open, options, ...other } = props;
  const [value, setValue] = useState(valueProp);
  const radioGroupRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) {
      setValue(valueProp);
    }
  }, [valueProp, open]);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(value);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      TransitionProps={{ onEntering: handleEntering }}
      open={open}
      {...other}
    >
      <DialogTitle>Choose Action</DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          ref={radioGroupRef}
          aria-label="actions"
          name="actions"
          value={value}
          onChange={handleChange}
        >
          {options.map(([key, node]) => (
            <FormControlLabel
              value={key}
              key={key}
              control={<Radio />}
              label={node}
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ConfirmationDialog({
  actions,
  act,
}: {
  actions: ModalActions;
  act: (action?: string) => void;
}) {
  const open = Object.keys(actions).length > 0;
  // const options = Object.keys(actions);
  const options: [string, ReactNode][] = Object.entries(actions).map(
    ([key, [node]]) => [key, node]
  );

  const [value, setValue] = useState("Merge to");

  const handleClickListItem = () => {
    // setOpen(true);
  };

  const handleClose = (newValue?: string) => {
    // setOpen(false);
    act(newValue);

    // if (newValue) {
    //   setValue(newValue);
    // }
  };

  return (
    // <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
    <ConfirmationDialogRaw
      options={options}
      id="actions-menu"
      keepMounted
      open={open}
      onClose={handleClose}
      value={value}
    />
    // </Box>
  );
}
