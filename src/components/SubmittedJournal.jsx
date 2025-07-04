import React, { useContext, useEffect, useState } from 'react';
import { Table, Alert, Badge, Form, Row, Col, Button, Card, Modal } from 'react-bootstrap';
import { FaInfoCircle, FaEye, FaCheck, FaTimes, FaUserEdit, FaSearch, FaFilter, FaRedo, FaUserTie, FaClipboardCheck, FaUserCog } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { contextProviderDeclare } from '../store/ContextProvider';

const SubmittedJournal = ({ submittedJournal }) => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectAreaFilter, setSubjectAreaFilter] = useState('all');
  const [journalSectionFilter, setJournalSectionFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [selectedAreaEditor, setSelectedAreaEditor] = useState('');
  const { fetchSubmittedJournal, chiefEditor } = useContext(contextProviderDeclare);
  const navigate = useNavigate();
  const [showFinalRecommendationModal, setShowFinalRecommendationModal] = useState(false);
  const [finalRecommendationNotes, setFinalRecommendationNotes] = useState('');
  const [selectedJournalForFinal, setSelectedJournalForFinal] = useState(null);
  const [recommendations, setRecommendations] = useState({});

  // Fetch recommendations when component mounts or journals change
  useEffect(() => {
    if (submittedJournal && chiefEditor?.eic_id) {
      submittedJournal.forEach(journal => {
        fetchRecommendation(journal.id);
      });
    }
  }, [submittedJournal, chiefEditor?.eic_id]);

  // Function to fetch recommendation for a journal
  const fetchRecommendation = async (journalId) => {
    if (!chiefEditor?.eic_id) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/recommendations/${journalId}/${chiefEditor.eic_id}/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.status === 200) {
        const data = await response.json();
        setRecommendations(prev => ({
          ...prev,
          [journalId]: data
        }));
        return data;
      } else if (response.status === 404) {
        setRecommendations(prev => ({
          ...prev,
          [journalId]: null
        }));
        return null;
      }
    } catch (err) {
      console.error('Error fetching recommendation:', err);
      return null;
    }
  };

  // Format date to MM-DD format
  const formatDate = (dateString) => {
    if (!dateString) return '~';
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  // Status options including the new statuses
  const statusOptions = [
    'all', 
    'submitted', 
    'under_review', 
    'revisions_requested', 
    'accepted', 
    'rejected',
    'review_done',
    'assigned_to_area_editor',
    'assigned_to_associate_editor'
  ];

  // Extract unique values for filters
  const subjectAreas = [...new Set(submittedJournal?.map(journal => 
    journal.subject_area_name ? journal.subject_area_name : 'General'
  ))];
  const journalSections = [...new Set(submittedJournal?.map(journal => 
    journal.journal_section_name ? journal.journal_section_name : 'General'
  ))];

  // Sample area editors data - replace with your actual data
  const areaEditors = [
    { id: 1, name: 'Dr. Smith (Computer Science)' },
    { id: 2, name: 'Dr. Johnson (Mathematics)' },
    { id: 3, name: 'Dr. Williams (Physics)' },
  ];

  // Filter journals based on search and filters
  const filteredJournals = submittedJournal?.filter(journal => {
    const matchesSearch = 
      journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.author_name_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journal.id.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || journal.status === statusFilter;
    
    const matchesSubjectArea = 
      subjectAreaFilter === 'all' || 
      (journal.subject_area && journal.subject_area.toString() === subjectAreaFilter);
    
    const matchesJournalSection = 
      journalSectionFilter === 'all' || 
      (journal.journal_section && journal.journal_section.toString() === journalSectionFilter);
    
    return matchesSearch && matchesStatus && matchesSubjectArea && matchesJournalSection;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSubjectAreaFilter('all');
    setJournalSectionFilter('all');
  };

  // Count journals by status for summary cards
  const statusCounts = submittedJournal?.reduce((acc, journal) => {
    acc[journal.status] = (acc[journal.status] || 0) + 1;
    return acc;
  }, {});

  // Get status display text with new statuses
  const getStatusDisplay = (status) => {
    const statusMap = {
      submitted: 'Submitted',
      under_review: 'Under Review',
      revisions_requested: 'Revisions Requested',
      accepted: 'Accepted',
      rejected: 'Rejected',
      review_done: 'Review Done',
      assigned_to_area_editor: 'Assigned to Area Editor',
      assigned_to_associate_editor: 'Assigned to Associate Editor'
    };
    return statusMap[status] || status;
  };

  // Get status badge color with new statuses
  const getStatusBadge = (status) => {
    const badgeMap = {
      submitted: 'info',
      under_review: 'warning',
      revisions_requested: 'primary',
      accepted: 'success',
      rejected: 'danger',
      review_done: 'secondary',
      assigned_to_area_editor: 'dark',
      assigned_to_associate_editor: 'light text-dark'
    };
    return badgeMap[status] || 'secondary';
  };

  // Handle accept journal
  const handleAccept = async(journalId) => {
    navigate(`/recommendation/${journalId}`);
  };

  // Handle reject journal
  const handleReject = async(journalId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/mark-rejected/${journalId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      alert('Journal Rejected Successfully!');
      fetchSubmittedJournal();
    } catch (err) {
      console.error("Failed to reject journal:", err);
      alert('Failed to reject journal');
    } 
  };

  // Handle request revisions
  const handleRequestRevisions = async(journalId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/mark-revisions-required/${journalId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      alert('Revisions Requested Successfully!');
      fetchSubmittedJournal();
    } catch (err) {
      console.error("Failed to request revisions:", err);
      alert('Failed to request revisions');
    }
  };

  // Handle assign area editor
  const handleAssignAreaEditor = (journalId) => {
    navigate(`/assign-area-editor/${journalId}`);
  };

  // Handle view area editor recommendations
  const handleViewAreaEditorRecommendations = (journalId) => {
    navigate(`/area-editor-recommendations/${journalId}`);
  };

  // Handle chief editor recommendation
  const handleChiefEditorRecommendation = (journalId) => {
    navigate(`/recommendation/${journalId}`);
  };

  // Handle final recommendation
  const handleFinalRecommendation = async (journalId) => {
    if (!recommendations[journalId]) {
      const rec = await fetchRecommendation(journalId);
      if (!rec) {
        alert('Please create a recommendation first');
        return;
      }
    }

    if (recommendations[journalId]?.is_final_decision) {
      alert('This recommendation has already been finalized');
      return;
    }

    setSelectedJournalForFinal(journalId);
    setShowFinalRecommendationModal(true);
  };

  // Submit area editor assignment
  const submitAreaEditorAssignment = () => {
    if (selectedJournal && selectedAreaEditor) {
      console.log(`Assigning area editor ${selectedAreaEditor} to journal ${selectedJournal}`);
      setShowAssignModal(false);
      setSelectedAreaEditor('');
    }
  };

  const changeJournalStatus = async (journalId) => {
    try {
      const recommendationResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/recommendations/${journalId}/${chiefEditor.eic_id}/`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (recommendationResponse.ok) {
        const data = await recommendationResponse.json();
        
        let statusEndpoint = '';
        if (data.recommendation === 'accept') {
          statusEndpoint = 'mark-accepted';
        } else if (data.recommendation === 'reject') {
          statusEndpoint = 'mark-rejected';
        } else {
          statusEndpoint = 'mark-revisions-required';
        }

        const statusResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/${statusEndpoint}/${journalId}/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (statusResponse.ok) {
          const result = await statusResponse.json();
          console.log('Journal status updated:', result);
          return result;
        } else {
          throw new Error('Failed to update journal status');
        }
      } else {
        throw new Error('Failed to fetch recommendation');
      }
    } catch (err) {
      console.error('Error changing journal status', err);
      alert('Failed to change journal status');
      throw err;
    }
  };

  const submitFinalRecommendation = async () => {
    if (!finalRecommendationNotes.trim()) {
      alert('Please enter decision notes');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/recommendations/journal/${selectedJournalForFinal}/finalize/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            editor_in_chief_id: chiefEditor.eic_id,
            is_final_decision: true,
            decision_notes: finalRecommendationNotes
          })
        }
      );

      if (response.ok) {
        alert('Final recommendation submitted successfully!');
        setShowFinalRecommendationModal(false);
        setFinalRecommendationNotes('');
        fetchSubmittedJournal();
        fetchRecommendation(selectedJournalForFinal);
        await changeJournalStatus(selectedJournalForFinal);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit final recommendation');
      }
    } catch (err) {
      console.error('Error submitting final recommendation:', err);
      alert(err.message || 'Failed to submit final recommendation');
    }
  };

  return (
    <div className="container-fluid">
      {/* Assign Area Editor Modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Area Editor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="areaEditorSelect">
            <Form.Label>Select Area Editor</Form.Label>
            <Form.Select
              value={selectedAreaEditor}
              onChange={(e) => setSelectedAreaEditor(e.target.value)}
            >
              <option value="">Select an area editor</option>
              {areaEditors.map(editor => (
                <option key={editor.id} value={editor.id}>
                  {editor.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitAreaEditorAssignment}>
            Assign
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Final Recommendation Modal */}
      <Modal show={showFinalRecommendationModal} onHide={() => setShowFinalRecommendationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Final Recommendation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="finalRecommendationNotes">
            <Form.Label>Decision Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter your final decision notes..."
              value={finalRecommendationNotes}
              onChange={(e) => setFinalRecommendationNotes(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              Please provide detailed notes about your final decision.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFinalRecommendationModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitFinalRecommendation}>
            Submit Final Recommendation
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="row mb-3">
        <div className="col-md-12">
          <Alert variant="info">
            <FaInfoCircle /> Manage submitted journals. You can view details, accept/reject submissions, request revisions, and assign area editors.
          </Alert>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-3">
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Total Submissions</Card.Title>
              <Card.Text className="display-6">
                {submittedJournal?.length || 0}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Subject Areas</Card.Title>
              <Card.Text>
                {subjectAreas.slice(0, 3).join(', ')}
                {subjectAreas.length > 3 && ` +${subjectAreas.length - 3} more`}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Journal Sections</Card.Title>
              <Card.Text>
                {journalSections.slice(0, 3).join(', ')}
                {journalSections.length > 3 && ` +${journalSections.length - 3} more`}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </div>

      {/* Search and Filter Controls */}
      <div className="row mb-3">
        <div className="col-md-12">
          <Form>
            <Row className="align-items-end">
              <Col md={6}>
                <Form.Group controlId="searchTerm">
                  <Form.Label>Search</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Search by ID, title or author..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary">
                      <FaSearch />
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6} className="text-end">
                <Button 
                  variant="outline-primary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="me-2"
                >
                  <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </Col>
            </Row>

            {showFilters && (
              <Row className="mt-3">
                <Col md={4}>
                  <Form.Group controlId="statusFilter">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {statusOptions.map(option => (
                        <option key={option} value={option}>
                          {getStatusDisplay(option)}
                          {statusCounts && option !== 'all' ? ` (${statusCounts[option] || 0})` : ''}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="subjectAreaFilter">
                    <Form.Label>Subject Area</Form.Label>
                    <Form.Select
                      value={subjectAreaFilter}
                      onChange={(e) => setSubjectAreaFilter(e.target.value)}
                    >
                      <option value="all">All Subject Areas</option>
                      {subjectAreas.map(area => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="journalSectionFilter">
                    <Form.Label>Journal Section</Form.Label>
                    <Form.Select
                      value={journalSectionFilter}
                      onChange={(e) => setJournalSectionFilter(e.target.value)}
                    >
                      <option value="all">All Journal Sections</option>
                      {journalSections.map(section => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Form>
        </div>
      </div>

      {/* Journals Table */}
      <div className="row">
        <div className="col-md-12">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>MM-DD Submitted</th>
                <th>Section</th>
                <th>Authors</th>
                <th>Title</th>
                <th>Subject Area</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJournals && filteredJournals.length > 0 ? (
                filteredJournals.map((journal) => (
                  <tr key={journal.id}>
                    <td>{journal.id}</td>
                    <td>{formatDate(journal.submission_date)}</td>
                    <td>
                      <Badge bg="secondary" className="text-wrap">
                        {journal.journal_section_name || 'General'}
                      </Badge>
                    </td>
                    <td>{journal.author_name_text}</td>
                    <td>{journal.title}</td>
                    <td>
                      <Badge bg="info" className="text-wrap">
                        {journal.subject_area_name || 'General'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusBadge(journal.status)}>
                        {getStatusDisplay(journal.status)}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        <Link 
                          to={`/view-journal/${journal.id}`} 
                          className="btn btn-sm btn-primary"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                        
                        <Button
                          variant="info"
                          size="sm"
                          title="Assign Area Editor"
                          onClick={() => handleAssignAreaEditor(journal.id)}
                        >
                          <FaUserEdit />
                        </Button>

                        <Button
                          variant="warning"
                          size="sm"
                          title="View Area Editor Recommendations"
                          onClick={() => handleViewAreaEditorRecommendations(journal.id)}
                        >
                          <FaUserCog />
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          title={recommendations[journal.id]?.is_final_decision ? "Recommendation finalized" : "Chief Editor Recommendation"}
                          onClick={() => handleChiefEditorRecommendation(journal.id)}
                          disabled={recommendations[journal.id]?.is_final_decision}
                        >
                          <FaUserTie />
                          {recommendations[journal.id]?.is_final_decision && " (Finalized)"}
                        </Button>

                        {recommendations[journal.id] && !recommendations[journal.id]?.is_final_decision && (
                          <Button
                            variant="dark"
                            size="sm"
                            title="Final Recommendation"
                            onClick={() => handleFinalRecommendation(journal.id)}
                          >
                            <FaClipboardCheck />
                          </Button>
                        )}

                        {recommendations[journal.id]?.is_final_decision && (
                          <Button
                            variant="success"
                            size="sm"
                            title="Recommendation Finalized"
                            disabled
                          >
                            <FaClipboardCheck /> Finalized
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    {submittedJournal?.length === 0 
                      ? 'No journals have been submitted yet.' 
                      : 'No submissions match your search criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SubmittedJournal;