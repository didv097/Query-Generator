import React from 'react'
import {
  Grid,
  Button,
  Typography
} from '@material-ui/core';

export default function NotFoundPage() {
  return (
    <Grid
      container
      direction="row"
      justify="space-between"
      alignItems="flex-start"
      style={{backgroundColor: "#003466", height: "150px"}}
    >
      <Grid item>
        <Grid
          container
          direction="column"
          justify="space-between"
          alignItems="flex-start"
          style={{height: "150px"}}
        >
          <Grid item>
            <Typography variant="h1" style={{color:"#3399FE"}}>Page not found</Typography>
          </Grid>
          <Grid item>
            <Button href="/">
              <Typography variant="body1" style={{color:"#3399FE"}}>Home</Typography>
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Button>
          <Typography variant="body2" style={{color:"#3399FE"}}>Logout</Typography>
        </Button>
      </Grid>
    </Grid>
  )
}
