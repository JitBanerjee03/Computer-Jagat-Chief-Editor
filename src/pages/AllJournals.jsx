import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Chip,
  Typography,
  Container,
  Grid,
  Paper,
  Box,
  Divider,
  Button,
  Avatar,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import {
  Article as ArticleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  CheckCircle as AcceptedIcon,
  HourglassEmpty as SubmittedIcon,
  Science as ScienceIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon
} from "@mui/icons-material";

const AllJournals = () => {
  const [journals, setJournals] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    author: "",
    subjectArea: "",
    journalSection: "",
    status: "",
    dateRange: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/get-all/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch journals');
        }
        const data = await response.json();
        setJournals(data);
        setFilteredJournals(data);
      } catch (error) {
        console.error('Error fetching journals:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      const filtered = journals.filter(journal => {
        // Search term matches
        const matchesSearch = searchTerm === "" || 
          journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          journal.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
          journal.author_name_text.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter matches
        const matchesAuthor = filters.author === "" || 
          journal.author_name_text.toLowerCase().includes(filters.author.toLowerCase());
        
        const matchesSubjectArea = filters.subjectArea === "" || 
          journal.subject_area_name === filters.subjectArea;
        
        const matchesJournalSection = filters.journalSection === "" || 
          journal.journal_section_name === filters.journalSection;
        
        const matchesStatus = filters.status === "" || 
          journal.status === filters.status;
        
        const matchesDateRange = filters.dateRange === "" || 
          checkDateRange(journal.submission_date, filters.dateRange);
        
        return matchesSearch && matchesAuthor && matchesSubjectArea && 
               matchesJournalSection && matchesStatus && matchesDateRange;
      });
      
      setFilteredJournals(filtered);
    };

    applyFilters();
  }, [searchTerm, filters, journals]);

  const checkDateRange = (dateString, range) => {
    if (!dateString || !range) return true;
    
    const submissionDate = new Date(dateString);
    const currentDate = new Date();
    
    // Create date-only objects (ignore time portion)
    const subDate = new Date(
      submissionDate.getFullYear(),
      submissionDate.getMonth(),
      submissionDate.getDate()
    );
    const today = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    
    // Calculate difference in full days
    const timeDiff = today - subDate;
    const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    switch(range) {
      case "7-days": 
        return dayDiff <= 7;
      case "14-days": 
        return dayDiff <= 14;
      case "1-month": 
        return dayDiff <= 30;
      case "6-months": 
        return dayDiff <= 182;
      case "1-year": 
        return dayDiff <= 365;
      default: 
        return true;
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  const handleDateRangeChange = (range) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      dateRange: range
    }));
  };

  const getStatusChip = (status) => {
    return (
      <Chip
        label={status}
        size="small"
        icon={status === 'accepted' ? <AcceptedIcon /> : <SubmittedIcon />}
        color={status === 'accepted' ? 'success' : 'info'}
        variant="outlined"
        sx={{ 
          textTransform: 'capitalize',
          fontWeight: 'bold',
          borderRadius: '4px'
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get unique values for filters
  const uniqueSubjectAreas = [...new Set(journals.map(j => j.subject_area_name))];
  const uniqueJournalSections = [...new Set(journals.map(j => j.journal_section_name))];
  const uniqueStatuses = [...new Set(journals.map(j => j.status))];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        p: 3,
        borderRadius: 2,
        boxShadow: 3
      }}>
        <ScienceIcon sx={{ fontSize: 40, mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            All Journal Archive
          </Typography>
          <Typography variant="subtitle1">
            Browse and filter through all submitted journals
          </Typography>
        </Box>
      </Box>

      {/* Search and Filter Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by title, abstract or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} alignItems="center">
              <FilterIcon color="action" />
              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Author</InputLabel>
                <Select
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  label="Author"
                >
                  <MenuItem value="">All Authors</MenuItem>
                  {[...new Set(journals.map(j => j.author_name_text))].map(author => (
                    <MenuItem key={author} value={author}>{author}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Subject Area</InputLabel>
                <Select
                  value={filters.subjectArea}
                  onChange={(e) => handleFilterChange('subjectArea', e.target.value)}
                  label="Subject Area"
                >
                  <MenuItem value="">All Areas</MenuItem>
                  {uniqueSubjectAreas.map(area => (
                    <MenuItem key={area} value={area}>{area}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {uniqueStatuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                Submitted Within:
              </Typography>
              <Button 
                variant={filters.dateRange === "" ? "contained" : "outlined"}
                onClick={() => handleDateRangeChange("")}
                size="small"
                color="primary"
              >
                All Time
              </Button>
              <Button 
                variant={filters.dateRange === "7-days" ? "contained" : "outlined"}
                onClick={() => handleDateRangeChange("7-days")}
                size="small"
                color="primary"
              >
                Last 7 Days
              </Button>
              <Button 
                variant={filters.dateRange === "14-days" ? "contained" : "outlined"}
                onClick={() => handleDateRangeChange("14-days")}
                size="small"
                color="primary"
              >
                Last 14 Days
              </Button>
              <Button 
                variant={filters.dateRange === "1-month" ? "contained" : "outlined"}
                onClick={() => handleDateRangeChange("1-month")}
                size="small"
                color="primary"
              >
                Last 1 Month
              </Button>
              <Button 
                variant={filters.dateRange === "6-months" ? "contained" : "outlined"}
                onClick={() => handleDateRangeChange("6-months")}
                size="small"
                color="primary"
              >
                Last 6 Months
              </Button>
              <Button 
                variant={filters.dateRange === "1-year" ? "contained" : "outlined"}
                onClick={() => handleDateRangeChange("1-year")}
                size="small"
                color="primary"
              >
                Last 1 Year
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Count */}
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Showing {filteredJournals.length} of {journals.length} publications
      </Typography>

      {/* Journals List */}
      {filteredJournals.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="textSecondary">
            No matching journals found. Try adjusting your search or filters.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredJournals.map((journal) => (
            <Grid item xs={12} key={journal.id}>
              <Card elevation={2} sx={{ 
                borderRadius: 3,
                borderLeft: '4px solid',
                borderLeftColor: journal.status === 'accepted' ? 'success.main' : 'info.main',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h5" component="h2" sx={{ 
                        fontWeight: 'bold',
                        mb: 2,
                        color: 'primary.dark'
                      }}>
                        {journal.title}
                      </Typography>
                      
                      <Paper elevation={0} sx={{ 
                        p: 2, 
                        mb: 2,
                        backgroundColor: 'background.paper',
                        borderLeft: '3px solid',
                        borderLeftColor: 'primary.light'
                      }}>
                        <Typography variant="body1" color="text.secondary">
                          {journal.abstract}
                        </Typography>
                      </Paper>
                      
                      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        {journal.keywords.split(',').map((keyword, index) => (
                          <Chip 
                            key={index} 
                            label={keyword.trim()} 
                            size="small"
                            sx={{ 
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText'
                            }}
                          />
                        ))}
                      </Stack>
                      
                      <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            mr: 1,
                            bgcolor: 'secondary.main'
                          }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="subtitle2">
                            {journal.author_name_text}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon color="action" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" color="text.secondary">
                            Submitted: {formatDate(journal.submission_date)}
                          </Typography>
                        </Box>
                        
                        {getStatusChip(journal.status)}
                      </Stack>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 'bold',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <CategoryIcon color="primary" sx={{ mr: 1 }} />
                            Subject Area
                          </Typography>
                          <Typography variant="body2">
                            {journal.subject_area_name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 'bold',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            <SchoolIcon color="primary" sx={{ mr: 1 }} />
                            Journal Section
                          </Typography>
                          <Typography variant="body2">
                            {journal.journal_section_name}
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Button
                          variant="contained"
                          fullWidth
                          component="a"
                          href={`${import.meta.env.VITE_BACKEND_DJANGO_URL}${journal.manuscript_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<ArticleIcon />}
                          sx={{ 
                            mt: 'auto',
                            py: 1.5,
                            fontWeight: 'bold'
                          }}
                        >
                          View Manuscript
                        </Button>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AllJournals;