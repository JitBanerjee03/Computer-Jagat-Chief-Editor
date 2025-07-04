import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Badge, Button, Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import { 
  FaEnvelope, 
  FaPhone, 
  FaUniversity, 
  FaUserTie, 
  FaBook, 
  FaFilePdf,
  FaGlobe,
  FaGraduationCap,
  FaLanguage,
  FaOrcid,
  FaGoogle,
  FaLinkedin,
  FaCalendarAlt
} from "react-icons/fa";

const AreaEditorProfile = () => {
    const { areaEditorId } = useParams();
    const [areaEditor, setAreaEditor] = useState(null);
    const [subjectAreas, setSubjectAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch area editor details
                const editorResponse = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/area-editor/get-details/${areaEditorId}/`);
                if (!editorResponse.ok) throw new Error('Failed to fetch area editor profile');
                const editorData = await editorResponse.json();
                setAreaEditor(editorData);

                // Fetch subject areas
                const areasResponse = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/subject-areas/`);
                if (!areasResponse.ok) throw new Error('Failed to fetch subject areas');
                const areasData = await areasResponse.json();
                setSubjectAreas(areasData);
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [areaEditorId]);

    // Function to get subject area name by ID
    const getSubjectAreaName = (id) => {
        const area = subjectAreas.find(area => area.id === id);
        return area ? area.name : `Area ${id}`;
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    Error loading area editor profile: {error}
                </Alert>
            </Container>
        );
    }

    if (!areaEditor) {
        return (
            <Container className="mt-5">
                <Alert variant="warning">
                    Area editor not found
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Body className="text-center">
                            {areaEditor.profile_picture ? (
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_DJANGO_URL}/${areaEditor.profile_picture}`}
                                    alt={areaEditor.full_name}
                                    className="rounded-circle mb-3"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div className="rounded-circle bg-secondary mb-3 mx-auto d-flex align-items-center justify-content-center"
                                    style={{ width: '150px', height: '150px' }}>
                                    <span className="text-white display-4">
                                        {areaEditor.full_name?.charAt(0).toUpperCase() || 'A'}
                                    </span>
                                </div>
                            )}
                            <h3>{areaEditor.full_name}</h3>
                            <p className="text-muted">{areaEditor.position_title || 'Area Editor'}</p>
                            
                            <div className="d-flex justify-content-center gap-2 mb-3">
                                {areaEditor.cv && (
                                    <Button 
                                        variant="outline-primary" 
                                        href={`${import.meta.env.VITE_BACKEND_DJANGO_URL}/${areaEditor.cv}/`}
                                        target="_blank"
                                    >
                                        <FaFilePdf className="me-1" /> View CV
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="mb-3">
                        <Card.Body>
                            <h5 className="mb-3">Editor Statistics</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Assignments Handled:</span>
                                <Badge bg="info">{areaEditor.number_of_assignments_handled}</Badge>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Status:</span>
                                <Badge bg={areaEditor.is_approved ? "success" : "warning"}>
                                    {areaEditor.is_approved ? "Approved" : "Pending Approval"}
                                </Badge>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Member Since:</span>
                                <span>{new Date(areaEditor.date_joined).toLocaleDateString()}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={8}>
                    <Card className="mb-3">
                        <Card.Body>
                            <h4 className="mb-4">Contact Information</h4>
                            
                            <Row>
                                <Col md={6} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaEnvelope className="me-2 text-primary" />
                                        <div>
                                            <strong>Email</strong>
                                            <div>
                                                <a href={`mailto:${areaEditor.email}`}>{areaEditor.email}</a>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col md={6} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaPhone className="me-2 text-success" />
                                        <div>
                                            <strong>Phone</strong>
                                            <div>{areaEditor.phone_number || 'Not provided'}</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            
                            <Row>
                                <Col md={6} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaUniversity className="me-2 text-info" />
                                        <div>
                                            <strong>Institution</strong>
                                            <div>
                                                {areaEditor.institution || 'Not provided'}
                                                {areaEditor.department && (
                                                    <div className="text-muted">{areaEditor.department}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col md={6} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaUserTie className="me-2 text-warning" />
                                        <div>
                                            <strong>Position</strong>
                                            <div>{areaEditor.position_title || 'Not provided'}</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6} className="mb-3">
                                    <div className="d-flex align-items-center">
                                        <FaGlobe className="me-2 text-primary" />
                                        <div>
                                            <strong>Country</strong>
                                            <div>{areaEditor.country || 'Not provided'}</div>
                                        </div>
                                    </div>
                                </Col>
                                
                                {areaEditor.language_proficiency && (
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaLanguage className="me-2 text-info" />
                                            <div>
                                                <strong>Languages</strong>
                                                <div>{areaEditor.language_proficiency}</div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>
                    
                    <Card className="mb-3">
                        <Card.Body>
                            <h4 className="mb-4">Editor Information</h4>
                            
                            <div className="mb-3">
                                <h5>Subject Areas</h5>
                                <div className="d-flex flex-wrap gap-1">
                                    {areaEditor.subject_areas.map((areaId) => (
                                        <Badge key={areaId} bg="primary" className="text-wrap">
                                            <FaBook className="me-1" />
                                            {getSubjectAreaName(areaId)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            
                            {areaEditor.research_interests && (
                                <div className="mb-3">
                                    <h5>Research Interests</h5>
                                    <p>{areaEditor.research_interests}</p>
                                </div>
                            )}
                            
                            {areaEditor.editor_bio && (
                                <div className="mb-3">
                                    <h5>Bio</h5>
                                    <p>{areaEditor.editor_bio}</p>
                                </div>
                            )}
                            
                            <Row>
                                {areaEditor.linkedin_profile && (
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaLinkedin className="me-2 text-info" />
                                            <div>
                                                <strong>LinkedIn</strong>
                                                <div>
                                                    <a 
                                                        href={areaEditor.linkedin_profile} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        View Profile
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                
                                {areaEditor.google_scholar_profile && (
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaGoogle className="me-2 text-danger" />
                                            <div>
                                                <strong>Google Scholar</strong>
                                                <div>
                                                    <a 
                                                        href={areaEditor.google_scholar_profile} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        View Profile
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                
                                {areaEditor.orcid_id && (
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaOrcid className="me-2 text-success" />
                                            <div>
                                                <strong>ORCID</strong>
                                                <div>
                                                    <a 
                                                        href={`https://orcid.org/${areaEditor.orcid_id}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        {areaEditor.orcid_id}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                                
                                {areaEditor.scopus_id && (
                                    <Col md={6} className="mb-3">
                                        <div className="d-flex align-items-center">
                                            <FaGraduationCap className="me-2 text-primary" />
                                            <div>
                                                <strong>Scopus ID</strong>
                                                <div>{areaEditor.scopus_id}</div>
                                            </div>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AreaEditorProfile;