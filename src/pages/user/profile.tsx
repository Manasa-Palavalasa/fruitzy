import React, { useState } from "react";
import {Box,Typography,CircularProgress,Button,Dialog,DialogTitle,DialogContent,Avatar,Paper,IconButton,useMediaQuery,useTheme} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ProfileAddresses from "@/components/profile/ProfileAddress";
import AddressForm from "@/components/profile/AddressForm";
import { useProfile } from "@/hooks/useProfile.hooks";
import { useAuthGuard } from "@/hooks/useAuthGuard.hooks";

const  ProfilePage = () => {
  const [addOpen, setAddOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {profile,isLoading,isError,handleAddAddress,handleDeleteAddress} = useProfile();
  const { isAuthorized } = useAuthGuard({ roles: ["user","admin"] });

  if (!isAuthorized) return <div>Unauthorized</div>;

  if (isError)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <Typography>Error in Fetching Profile</Typography>
      </Box>
    );

  if (isLoading || !profile)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
            {profile.name[0]}
          </Avatar>
          <Box>
            <Typography variant="h5">{profile.name}</Typography>
            <Typography variant="body1" color="text.secondary">
              {profile.email}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              fontStyle="italic"
            >
              Role: {profile.role}
            </Typography>
          </Box>
        </Box>

        {!isMobile ? (
          <Box
            mb={2}
            mt={4}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Saved Addresses</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
            >
              Add Address
            </Button>
          </Box>
        ) : (
          <>
            <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
              <Typography variant="h6">Saved Addresses</Typography>
            </Box>
            <Box display="flex" justifyContent="center" mt={2} mb={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddOpen(true)}
                fullWidth
              >
                Add Address
              </Button>
            </Box>
          </>
        )}

        <ProfileAddresses
          addresses={profile.addresses}
          onDelete={handleDeleteAddress}
        />
      </Paper>

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <DialogTitle>Add Address</DialogTitle>
          <IconButton sx={{ mr: 2 }} onClick={() => setAddOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ProfilePage;
