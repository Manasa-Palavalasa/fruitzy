import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Checkbox,
  FormGroup,
  FormControlLabel,
  IconButton
} from "@mui/material";



import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { FilterProps } from "@/types";
import { categories } from "../../../static/category";
import useStyles from "./Filter.styles";
export default function FilterModal({ initialCategories, onApply }: FilterProps) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [tempCategories, setTempCategories] = React.useState<string[]>(initialCategories);

  const handleOpen = () => {
    setTempCategories(initialCategories);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleCategoryChange = (category: string) => {
    setTempCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleApply = () => {
    onApply(tempCategories);
    handleClose();
  };

  return (
    <div>
      <Button startIcon={<FilterListIcon />} variant="contained" onClick={handleOpen}>
        Filter
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box className={classes.modalBox}>
          <Box className={classes.header}>
            <Typography variant="h6">Filter Products</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Select Category:
          </Typography>
          <FormGroup row>
            {categories.map((cat, idx) => (
              <FormControlLabel
                key={`${cat}-${idx}`}
                control={
                  <Checkbox
                    checked={tempCategories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                  />
                }
                label={cat}
              />
            ))}
          </FormGroup>

          <Box className={classes.actions}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" sx={{ ml: 2 }} onClick={handleApply}>
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
