import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Box,
  Avatar,
  Stack,
  Paper,
  CircularProgress,
  Alert,
  Button
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CheckCircle,
  Star,
  Description,
  Gavel,
  Comment as CommentIcon,
  CalendarToday,
  Person,
  Error as ErrorIcon,
  AssignmentLate
} from "@mui/icons-material";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.1)"
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: "0.875rem",
  padding: theme.spacing(0.5, 1),
  borderRadius: "8px"
}));

const RatingChip = styled(Chip)(({ theme, rating }) => ({
  backgroundColor: 
    rating >= 4 ? theme.palette.success.dark :
    rating >= 2 ? theme.palette.warning.dark :
    theme.palette.error.dark,
  color: theme.palette.common.white,
  fontWeight: 700,
  borderRadius: "8px",
  padding: theme.spacing(0.5, 1)
}));

const SectionHeader = ({ icon, title }) => (
  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
    {icon}
    <Typography variant="h6" fontWeight={600}>
      {title}
    </Typography>
  </Stack>
);

const EmptyState = ({ onRetry }) => (
  <Paper elevation={0} sx={{
    p: 4,
    textAlign: 'center',
    borderRadius: 3,
    maxWidth: 500,
    mx: 'auto',
    mt: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2
  }}>
    <AssignmentLate color="disabled" sx={{ fontSize: 60 }} />
    <Typography variant="h5" color="textSecondary">
      No Recommendations Found
    </Typography>
    <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
      There are no recommendations available for this journal.
    </Typography>
    <Button 
      variant="outlined" 
      color="primary"
      onClick={onRetry}
      startIcon={<CheckCircle />}
    >
      Retry
    </Button>
  </Paper>
);

const AreaEditorRecommendation = () => {
  const { journalId } = useParams();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_DJANGO_URL}/area-editor/${journalId}/recommendations/`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      const data = await response.json();
      setRecommendation(data[0] || null); // Take first recommendation if array
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, [journalId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        icon={<ErrorIcon />} 
        sx={{ m: 3 }}
        action={
          <Button color="inherit" size="small" onClick={fetchRecommendation}>
            RETRY
          </Button>
        }
      >
        Error loading recommendation: {error}
      </Alert>
    );
  }

  if (!recommendation) {
    return <EmptyState onRetry={fetchRecommendation} />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Editorial Recommendations
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Journal: {recommendation.journal_title || "N/A"}
      </Typography>

      <StyledCard>
        <CardContent>
          {/* Header Section */}
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Avatar sx={{ 
              bgcolor: "primary.main", 
              width: 56, 
              height: 56,
              fontSize: "1.5rem"
            }}>
              {recommendation.area_editor_name?.charAt(0) || "A"}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {recommendation.area_editor_name || "Anonymous Editor"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Area Editor
              </Typography>
            </Box>
            <Box flexGrow={1} />
            <Stack direction="row" spacing={1} alignItems="center">
              <CalendarToday color="action" />
              <Typography variant="body2" color="text.secondary">
                {new Date(recommendation.submitted_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Stack>
          </Stack>

          {/* Recommendation Tags */}
          <Stack direction="row" spacing={2} mb={4} flexWrap="wrap" useFlexGap>
            <StatusChip
              icon={<CheckCircle fontSize="small" />}
              label={`Recommendation: ${recommendation.recommendation || "PENDING"}`}
              color={
                recommendation.recommendation?.toLowerCase() === 'accept' 
                  ? 'success' 
                  : recommendation.recommendation?.toLowerCase() === 'reject'
                    ? 'error'
                    : 'warning'
              }
              variant="outlined"
            />
            <RatingChip
              icon={<Star fontSize="small" />}
              label={`Rating: ${recommendation.overall_rating || "N/A"}/5`}
              rating={recommendation.overall_rating || 0}
            />
            <Chip 
              label="Peer Reviewed" 
              color="info" 
              size="small" 
              variant="outlined"
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Summary Section */}
          <Box mb={4}>
            <SectionHeader
              icon={<Description color="primary" />}
              title="Summary"
            />
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="body1" whiteSpace="pre-wrap">
                {recommendation.summary || "No summary provided"}
              </Typography>
            </Paper>
          </Box>

          {/* Justification Section */}
          <Box mb={4}>
            <SectionHeader 
              icon={<Gavel color="primary" />} 
              title="Justification" 
            />
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="body1" whiteSpace="pre-wrap">
                {recommendation.justification || "No justification provided"}
              </Typography>
            </Paper>
          </Box>

          {/* Public Comments */}
          {recommendation.public_comments_to_author && (
            <Box mb={2}>
              <SectionHeader
                icon={<CommentIcon color="primary" />}
                title="Public Comments to Author"
              />
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="body1" whiteSpace="pre-wrap">
                  {recommendation.public_comments_to_author}
                </Typography>
              </Paper>
            </Box>
          )}
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default AreaEditorRecommendation;