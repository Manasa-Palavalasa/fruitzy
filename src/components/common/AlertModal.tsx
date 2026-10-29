import { AlertModalProps } from "@/types";
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export const AlertModal = ({ open, title = "Alert", message, onClose }: AlertModalProps) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>{message}</DialogContent>
    <DialogActions>
      <Button onClick={onClose} autoFocus>OK</Button>
    </DialogActions>
  </Dialog>
);
