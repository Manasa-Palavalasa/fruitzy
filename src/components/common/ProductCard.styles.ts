import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material/styles";

const useProductCardStyles = makeStyles((theme: Theme) => ({
  card: {
    width: 320,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    textDecoration: "none",
    color: "inherit",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-6px) scale(1.001)",
      boxShadow: theme.shadows[6],
    },
  },
  link: {
    textDecoration: "none",
    color: "inherit",
  },
  categoryStack: {
    marginTop: theme.spacing(1),
    flexWrap: "wrap",
  },
  price: {
    marginTop: theme.spacing(1),
  },
}));

export default useProductCardStyles;
