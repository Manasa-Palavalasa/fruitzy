import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  actions: {
    textAlign: "right",
    marginTop: "auto",
    paddingTop: 24,
  },
  modalBox: {
    position: "absolute",
    backgroundColor: "#fff",
    boxShadow: theme.shadows[24],
    padding: theme.spacing(4),
    borderRadius: 16,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",

    
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 420,
    height: "auto",

    // Mobile styles
    [theme.breakpoints.down("sm")]: {
      top: 0,
      left: 0,
      transform: "none",
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
      padding: theme.spacing(2),
    },
  },
}));

export default useStyles;
