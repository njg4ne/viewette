import RightArrowKeyIcon from "@mui/icons-material/Forward";
import { styled } from "@mui/system";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { ReactNode } from "preact/compat";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

export default function KeyboardKey({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const contrastColor = theme.palette.text.primary;

  return (
    <Paper
      variant="outlined"
      sx={{
        px: 0.5,
        alignSelf: "center",
        flexGrow: 0,
        border: `.1rem solid ${contrastColor}`,
        color: contrastColor,
        fontSize: "1.5rem",
      }}
      component={Stack}
    >
      {children}
    </Paper>
  );
}

const RightKey = () => (
  <KeyboardKey>
    <Stack direction="row" alignItems="center" flexWrap="nowrap">
      <Typography
        fontSize="1.25rem"
        // fontWeight="500"
        alignSelf="center"
        sx={{ mx: 0.15 }}
      >
        key:
      </Typography>
      <Box
        sx={{
          width: ".1rem",
          mx: 0.5,
          //   height: "1px",
          alignSelf: "stretch",
          bgcolor: "text.primary",
        }}
      />
      <RightArrowKeyIcon fontSize="inherit" />
    </Stack>
  </KeyboardKey>
);

const LeftKey = () => (
  <KeyboardKey>
    <RightArrowKeyIcon
      fontSize="inherit"
      sx={{ transform: "rotate(180deg)" }}
    />
  </KeyboardKey>
);

export { RightKey, LeftKey };
