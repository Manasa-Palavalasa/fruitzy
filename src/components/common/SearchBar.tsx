import { Box, InputBase, Toolbar, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import { SearchBarProps } from '@/types';
import useStyles from './SearchBar.styles';
import React from 'react';

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  showButton = true,
}: SearchBarProps) {
  const classes = useStyles();
  const [internalValue, setInternalValue] = useState('');

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (val: string) => {
    if (onChange) {
      onChange(val);
    } else {
      setInternalValue(val);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value !== undefined ? value : internalValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ flexGrow: 1, width: '100%', mb: 2 }}>
      <Toolbar
        disableGutters
        sx={{ justifyContent: 'center', px: 2, flexWrap: 'wrap', gap: 1 }}
      >
        <Box sx={{ display: 'flex', width: '100%', maxWidth: 600 }}>
          <div className={classes.search}>
            <div className={classes.searchIconWrapper}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder={placeholder}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              value={value !== undefined ? value : internalValue}
              onChange={e => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>
          {showButton && (
            <Button
              variant="contained"
              sx={{ ml: 1, whiteSpace: 'nowrap' }}
              onClick={handleSearch}
            >
              Search
            </Button>
          )}
        </Box>
      </Toolbar>
    </Box>
  );
}
