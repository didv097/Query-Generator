import React from 'react'
import {Button, Box} from '@material-ui/core';

export default function NotFoundPage() {
  return (
    <Box m={2}>
      <h1>404 Page not found</h1>
      <Button href="/" variant="outlined">
        <i className="material-icons">home</i>
        Go to home
      </Button>
    </Box>
  )
}
