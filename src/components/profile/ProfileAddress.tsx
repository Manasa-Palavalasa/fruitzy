import React from "react";
import {List,ListItem,ListItemText,ListItemSecondaryAction,IconButton,Typography,Divider} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { AddressProps } from "@/types";
import { Container } from "@mui/system";



function ProfileAddresses({ addresses, onDelete }:AddressProps) {
  return <Container >
    <List>
      {addresses.length === 0 ? (
        <ListItem>
          <ListItemText primary="No addresses found." />
        </ListItem>
      ) : (
        addresses.map((address, index) => (
          <React.Fragment key={address._id}>
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight={600}>
                    {address.label}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2">{address.address}</Typography>
                    <Typography variant="body2">
                      {address.city}, {address.state} - {address.pincode}, {address.country}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => onDelete(address._id)}
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < addresses.length - 1 && <Divider />}
          </React.Fragment>
        ))
      )}
    </List>
  </Container>
};

export default ProfileAddresses;
