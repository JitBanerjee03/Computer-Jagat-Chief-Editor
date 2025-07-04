import React from 'react'
import { Container, Typography, Box } from '@mui/material'

const About = () => {
    return (
        <Container sx={{ mt: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    About the Journal Management System
                </Typography>
                <Typography variant="body1" paragraph>
                    Welcome to the Editor-in-Chief Portal of our Journal Management System. This platform provides you with comprehensive tools 
                    to oversee the journal's editorial process, maintain academic standards, and ensure efficient manuscript handling.
                </Typography>
                <Typography variant="body1" paragraph>
                    As Editor-in-Chief, you have full visibility and control over the publication workflow. The system is designed to support your 
                    leadership in maintaining the journal's quality, reputation, and timely publication schedule.
                </Typography>
                <Typography variant="body1" paragraph>
                    Key responsibilities and features available to you:
                </Typography>
                <ul>
                    <li>Oversee the entire editorial process from submission to final decision</li>
                    <li>Assign manuscripts to appropriate Associate Editors</li>
                    <li>Monitor review progress and editorial decisions</li>
                    <li>Handle appeals and special cases</li>
                    <li>Manage the editorial board and reviewer pool</li>
                    <li>Access advanced analytics on submission trends and review timelines</li>
                    <li>Configure journal policies and submission guidelines</li>
                    <li>Communicate with authors, reviewers, and editorial board members</li>
                    <li>Make final acceptance decisions on manuscripts</li>
                    <li>Schedule accepted papers for publication</li>
                </ul>
                <Typography variant="body1" paragraph>
                    The system provides you with:
                </Typography>
                <ul>
                    <li>Dashboard with key metrics and pending actions</li>
                    <li>Comprehensive manuscript tracking system</li>
                    <li>Automated reminders and notifications</li>
                    <li>Conflict of interest management tools</li>
                    <li>Decision history and audit trails</li>
                    <li>Custom reporting capabilities</li>
                </ul>
                <Typography variant="body1" paragraph>
                    As Editor-in-Chief, you play a pivotal role in maintaining the journal's academic standards and reputation. 
                    This system is designed to support your leadership by providing transparency, efficiency tools, and data-driven insights 
                    to help you make informed editorial decisions.
                </Typography>
                <Typography variant="body1" paragraph>
                    We are committed to providing you with professional tools that reduce administrative burden while maintaining rigorous 
                    peer-review standards and efficient publication workflows.
                </Typography>
            </Box>
        </Container>
    )
}

export default About